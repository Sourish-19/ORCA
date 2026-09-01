"""
ORCA Master Multi-Agent Orchestrator
Coordinates parallel execution of Intent, Geo-Data, Hazard, Context, Reasoning, Safety, and Synthesis agents.
Records step-by-step agent execution traces.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import List

from app.models.request import UserQueryRequest, ORCAResponse
from app.models.trace import AgentStepTrace, EvidenceRecord
from app.agents.intent_agent import run_intent_agent
from app.agents.context_agent import run_context_agent
from app.agents.geodata_agent import run_geodata_agent
from app.agents.hazard_agent import run_hazard_agent
from app.agents.reasoning_agent import run_reasoning_agent
from app.agents.safety_agent import run_safety_agent
from app.agents.synthesis_agent import run_synthesis_agent


async def run_orca_pipeline(request: UserQueryRequest) -> ORCAResponse:
    """
    Execute end-to-end ORCA multi-agent pipeline.
    """
    req_id = f"req_{uuid.uuid4().hex[:8]}"
    start_time = time.time()
    traces: List[AgentStepTrace] = []
    all_evidence: List[EvidenceRecord] = []
    step_counter = 1

    # Step 1: Language + Intent Agent
    t0 = time.time()
    intent = run_intent_agent(request.query, request.language)
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Language + Intent Agent",
        action="Detect language & extract entities",
        status="SUCCESS",
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary=f"Query parsed: intent={intent.primary_intent}, location={intent.location_name}, target_date={intent.target_date_str}, language={intent.detected_language}"
    ))
    step_counter += 1

    # Step 2: Context Agent
    t0 = time.time()
    location, landing_centre = run_context_agent(intent)
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Context / Memory Agent",
        action="Geocode location & bind landing harbour",
        status="SUCCESS",
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary=f"Resolved coordinates ({location.latitude}, {location.longitude}). Landing harbour: {landing_centre.name}"
    ))
    step_counter += 1

    # Step 3: Geo-Data Specialist Agent (Parallel retrieval in real production, async here)
    t0 = time.time()
    pfz_zones, sst, chl, geo_evidence = run_geodata_agent(location)
    all_evidence.extend(geo_evidence)
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Geo-Data Specialist Agent",
        action="Retrieve INCOIS PFZ, MOSDAC SST & Chlorophyll",
        status="SUCCESS",
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary=f"Retrieved {len(pfz_zones)} PFZ candidates. SST={sst.sst_celsius}°C, Chlorophyll={chl.concentration_mg_m3} mg/m³"
    ))
    step_counter += 1

    # Step 4: Hazard Specialist Agent
    t0 = time.time()
    weather, active_warnings, hazard_evidence = run_hazard_agent(location)
    all_evidence.extend(hazard_evidence)
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Hazard Specialist Agent",
        action="Retrieve IMD Marine weather & active hazard warnings",
        status="SUCCESS",
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary=f"Weather retrieved: wind={weather.wind_speed_knots} kts, wave={weather.wave_height_m}m. Found {len(active_warnings)} active warnings."
    ))
    step_counter += 1

    # Step 5: Reasoning Specialist Agent
    t0 = time.time()
    top_zone, suitability_breakdown, all_candidate_zones = run_reasoning_agent(pfz_zones, sst, chl, weather)
    score_str = f"{suitability_breakdown.total_score}%" if suitability_breakdown else "N/A"
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Reasoning Agent",
        action="Perform spatial join & 6-factor suitability calculation",
        status="SUCCESS",
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary=f"Top candidate: {top_zone.sector_name if top_zone else 'None'}. Suitability score: {score_str}"
    ))
    step_counter += 1

    # Step 6: Safety Agent (Deterministic Veto Engine)
    t0 = time.time()
    safety_eval = run_safety_agent(top_zone or pfz_zones[0], weather, active_warnings) if (top_zone or pfz_zones) else run_safety_agent(
        # fallback dummy zone if no PFZ
        type('DummyZone', (), {'center_lat': location.latitude, 'center_lon': location.longitude, 'valid_until': datetime.now(timezone.utc)})(),
        weather, active_warnings
    )
    
    status_flag = "VETO" if safety_eval.veto_triggered else "SUCCESS"
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Safety Agent (Deterministic Veto)",
        action="Evaluate official warnings, cyclone tracks & weather thresholds",
        status=status_flag,
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary=f"Safety Check Passed={safety_eval.is_safe}, Risk={safety_eval.risk_level}, Veto Triggered={safety_eval.veto_triggered}"
    ))
    step_counter += 1

    # Step 7: Synthesis Agent
    t0 = time.time()
    full_answer, audio_narrative = run_synthesis_agent(
        intent, safety_eval, top_zone, suitability_breakdown, landing_centre, weather, all_evidence
    )
    traces.append(AgentStepTrace(
        step_id=step_counter,
        agent_name="Synthesis Agent",
        action="Generate grounded response & voice narrative text",
        status="SUCCESS",
        duration_ms=round((time.time() - t0) * 1000, 2),
        timestamp=datetime.now(timezone.utc),
        summary="Grounded user-facing explanation synthesized with complete evidence links."
    ))

    # Calculate overall confidence
    confidence = 0.88 if not safety_eval.veto_triggered else 0.95  # Safety veto gives high confidence in safety refusal

    return ORCAResponse(
        request_id=req_id,
        timestamp=datetime.now(timezone.utc),
        query=request.query,
        intent=intent,
        data_mode="LIVE" if all_evidence else "DEMO",
        overall_confidence=confidence,
        safety=safety_eval,
        top_recommendation=top_zone if not safety_eval.veto_triggered else None,
        suitability_breakdown=suitability_breakdown if not safety_eval.veto_triggered else None,
        candidate_zones=all_candidate_zones if not safety_eval.veto_triggered else [],
        nearest_landing_centre=landing_centre,
        weather_summary=weather,
        synthesized_answer=full_answer,
        audio_narrative_text=audio_narrative,
        evidence_trail=all_evidence,
        agent_traces=traces
    )
