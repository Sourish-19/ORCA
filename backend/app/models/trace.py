"""
Canonical Data Model - Evidence & Agent Execution Trace
Traceability, Provenance, Explainability records.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EvidenceRecord(BaseModel):
    id: str
    agent_name: str
    source_name: str  # e.g., INCOIS, MOSDAC, IMD
    record_type: str  # e.g., PFZ, SST, WEATHER, WARNING
    claim: str
    timestamp: datetime
    freshness_hours: float
    data_mode: str = "LIVE"  # "LIVE", "FAILOVER", "CACHED", "DEMO"
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    raw_payload: Optional[Dict[str, Any]] = None


class AgentStepTrace(BaseModel):
    step_id: int
    agent_name: str
    action: str
    status: str = "SUCCESS"  # "SUCCESS", "WARN", "VETO", "ERROR"
    duration_ms: float
    timestamp: datetime
    summary: str
    output_preview: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
