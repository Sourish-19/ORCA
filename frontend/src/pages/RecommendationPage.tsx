import React from 'react';
import { SuitabilityDonut } from '../components/SuitabilityDonut';
import { EvidencePanel } from '../components/EvidencePanel';
import { Award, Compass, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { ORCAResponse } from '../types';

interface RecommendationPageProps {
  response: ORCAResponse | null;
}

export const RecommendationPage: React.FC<RecommendationPageProps> = ({ response }) => {
  const rec = response?.top_recommendation;
  const isVeto = response?.safety?.veto_triggered;

  return (
    <div className="space-y-4">
      
      {/* Top Recommendation Summary Banner */}
      <div className="bg-[#0b172a] border border-[#1b2b45] p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                RECOMMENDED FISHING ZONE
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {response?.suitability_breakdown?.total_score || 88}% Suitability Score
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              {rec?.sector_name || 'Chennai Offshore East (18-22 NM)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Distance: <strong className="text-slate-200">{rec?.distance_km || 38} km</strong> • Bearing: <strong className="text-slate-200">{rec?.bearing_deg || 107}° SE</strong> • Depth: <strong className="text-slate-200">{rec?.depth_m || 215} m</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Suitability Factors + Evidence Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SuitabilityDonut
          breakdown={response?.suitability_breakdown || {
            zone_id: 'pfz_01',
            total_score: 88,
            pfz_contribution: 29.75,
            chlorophyll_contribution: 23.75,
            sst_contribution: 14.25,
            wind_contribution: 9.5,
            wave_contribution: 9.5,
            accessibility_contribution: 4.25,
            formula_explanation: 'Suitability = 0.35·PFZ + 0.25·CHL + 0.15·SST + 0.10·Wind + 0.10·Wave + 0.05·Access'
          }}
          isVeto={isVeto}
        />

        <EvidencePanel evidenceTrail={response?.evidence_trail || []} />
      </div>

    </div>
  );
};
