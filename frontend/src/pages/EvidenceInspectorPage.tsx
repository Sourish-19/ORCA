import React from 'react';
import { FileSearch, Clock, Database, CheckCircle2, Shield } from 'lucide-react';
import { ORCAResponse, EvidenceRecord } from '../types';

interface EvidenceInspectorPageProps {
  response: ORCAResponse | null;
}

export const EvidenceInspectorPage: React.FC<EvidenceInspectorPageProps> = ({ response }) => {
  const evidenceList: EvidenceRecord[] = response?.evidence_trail || [
    { id: 'ev_01', agent_name: 'Geo-Data Specialist Agent', source_name: 'INCOIS Hyderabad', record_type: 'PFZ Bulletin #3821', claim: 'High biological concentration identified at 13.185°N, 80.621°E.', timestamp: '2026-09-01T06:00:00Z', freshness_hours: 2.5, data_mode: 'LIVE', confidence_score: 0.92 },
    { id: 'ev_02', agent_name: 'Geo-Data Specialist Agent', source_name: 'MOSDAC / ISRO Oceansat-3', record_type: 'Sea Surface Temp Grid', claim: 'SST measured at 28.4°C (optimal thermal gradient).', timestamp: '2026-09-01T06:00:00Z', freshness_hours: 3.0, data_mode: 'LIVE', confidence_score: 0.89 },
    { id: 'ev_03', agent_name: 'Hazard Specialist Agent', source_name: 'IMD Marine Weather', record_type: 'Surface Wind Observation', claim: 'Wind speed 12.5 knots from SE. Sea state MODERATE.', timestamp: '2026-09-01T09:00:00Z', freshness_hours: 1.0, data_mode: 'LIVE', confidence_score: 0.95 },
    { id: 'ev_04', agent_name: 'Hazard Specialist Agent', source_name: 'IMD Cyclone Warning Centre', record_type: 'Cyclone Track Scan', claim: '0 active cyclone warning geometry intersections in sector.', timestamp: '2026-09-01T09:00:00Z', freshness_hours: 0.5, data_mode: 'LIVE', confidence_score: 0.98 },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Evidence Provenance Inspector</h2>
            <p className="text-xs text-slate-400">Deep inspection of source records, claims, freshness, and agent confidence</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidenceList.map((ev: EvidenceRecord) => (
          <div key={ev.id} className="bg-[#0b172a] border border-[#1b2b45] hover:border-cyan-500/40 p-4 rounded-xl space-y-3 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#070f1e] text-cyan-400 border border-[#1b2b45]">
                {ev.source_name || ev.sourceName}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Freshness: {ev.freshness_hours || ev.freshnessHours} hrs ago
              </span>
            </div>

            <h3 className="text-xs font-bold text-slate-200">{ev.record_type || ev.recordType}</h3>
            <p className="text-xs text-slate-300 bg-[#070f1e] p-2.5 rounded border border-[#1b2b45] font-mono">
              "{ev.claim}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Agent: {ev.agent_name || ev.agentName}</span>
              <span className="text-emerald-400 font-semibold font-mono">
                Confidence: {((ev.confidence_score || ev.confidenceScore || 0.9) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
