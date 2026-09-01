import React from 'react';
import { MarineMap } from '../components/map/MarineMap';
import { SuitabilityDonut } from '../components/SuitabilityDonut';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { EvidencePanel } from '../components/EvidencePanel';
import { SafetyHUD } from '../components/safety/SafetyHUD';
import { Compass, Award, Navigation } from 'lucide-react';
import { ORCAResponse } from '../types';

interface DashboardProps {
  response: ORCAResponse | null;
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ response, onQuerySubmit, isLoading }) => {
  const isVeto = response?.safety?.veto_triggered;
  const rec = response?.top_recommendation;

  return (
    <div className="space-y-3">
      {/* Safety Status Banner HUD */}
      <SafetyHUD
        safetyStatus={isVeto ? 'VETO' : 'SAFE'}
        summary={response?.safety?.safety_summary}
        reasons={response?.safety?.veto_reasons}
        riskLevel={response?.safety?.risk_level}
      />

      {/* Main 3-Column Cockpit Layout matching Stitch Main Analyst Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Left 2-Columns: GIS Map & Evidence Provenance */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <MarineMap
            selectedZone={rec ? {
              id: rec.zone_id,
              source: 'INCOIS',
              sectorName: rec.sector_name,
              centerLat: rec.center_lat,
              centerLon: rec.center_lon,
              depthM: rec.depth_m,
              bearingDeg: rec.bearing_deg,
              distanceKm: rec.distance_km,
              nearestHarbour: rec.nearest_landing_centre,
              validFrom: new Date().toISOString(),
              validUntil: new Date().toISOString(),
              strengthScore: response?.suitability_breakdown?.total_score || 88,
              fetchedAt: new Date().toISOString()
            } : null}
            isVeto={isVeto}
          />
          <EvidencePanel evidenceTrail={response?.evidence_trail || []} />
        </div>

        {/* Right 1-Column: 6-Factor Suitability Doughnut & Agent Trace */}
        <div className="flex flex-col space-y-3">
          <SuitabilityDonut
            breakdown={response?.suitability_breakdown}
            isVeto={isVeto}
          />
          <AgentTracePanel
            agentTraces={response?.agent_traces || []}
          />
        </div>

      </div>
    </div>
  );
};
