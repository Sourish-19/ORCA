export interface PFZCandidateZone {
  zone_id: string;
  sector_name: string;
  center_lat: number;
  center_lon: number;
  depth_m: number;
  bearing_deg: number;
  distance_km: number;
  nearest_landing_centre: string;
  valid_from: string;
  valid_until: string;
  strength_score: number;
  source: string;
  fetched_at: string;
}

export interface LandingCentre {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  max_boat_capacity?: number;
}

export interface MarineWeather {
  timestamp: string;
  location_name: string;
  latitude: number;
  longitude: number;
  wind_speed_knots: number;
  wind_direction_deg: number;
  wave_height_m: number;
  wave_period_sec: number;
  visibility_km: number;
  sea_surface_pressure_hpa: number;
  valid_until: string;
  source: string;
}

export interface HazardWarning {
  warning_id: string;
  warning_type: string;
  severity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  title: string;
  description: string;
  affected_sector: string;
  bounding_box: number[];
  valid_from: string;
  valid_until: string;
  source: string;
  issued_at: string;
}

export interface SafetyEvaluation {
  is_safe: boolean;
  veto_triggered: boolean;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  veto_reasons: string[];
  warnings_found: HazardWarning[];
  freshness_acceptable: boolean;
  safety_summary: string;
}

export interface SuitabilityBreakdown {
  zone_id: string;
  total_score: number;
  pfz_contribution: number;
  chlorophyll_contribution: number;
  sst_contribution: number;
  wind_contribution: number;
  wave_contribution: number;
  accessibility_contribution: number;
  formula_explanation: string;
}

export interface EvidenceRecord {
  id: string;
  agent_name: string;
  source_name: string;
  record_type: string;
  claim: string;
  timestamp: string;
  freshness_hours: number;
  data_mode: string;
  confidence_score: number;
}

export interface AgentStepTrace {
  step_id: number;
  agent_name: string;
  action: string;
  status: 'SUCCESS' | 'WARN' | 'VETO' | 'ERROR';
  duration_ms: number;
  timestamp: string;
  summary: string;
}

export interface StructuredIntent {
  raw_query: string;
  detected_language: string;
  primary_intent: string;
  location_name: string;
  target_date_str: string;
  target_datetime: string;
  activity: string;
  radius_km: number;
}

export interface ORCAResponse {
  request_id: string;
  timestamp: string;
  query: string;
  intent: StructuredIntent;
  data_mode: string;
  overall_confidence: number;
  safety: SafetyEvaluation;
  top_recommendation?: PFZCandidateZone;
  suitability_breakdown?: SuitabilityBreakdown;
  candidate_zones: PFZCandidateZone[];
  nearest_landing_centre?: LandingCentre;
  weather_summary?: MarineWeather;
  synthesized_answer: string;
  audio_narrative_text: string;
  evidence_trail: EvidenceRecord[];
  agent_traces: AgentStepTrace[];
}

export interface DemoScenario {
  id: string;
  title: string;
  query: string;
  location: string;
  expected_outcome: string;
}
