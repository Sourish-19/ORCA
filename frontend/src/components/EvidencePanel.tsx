import React from 'react';
import { Radio, Satellite, Wind, Waves, Thermometer, MoreVertical } from 'lucide-react';
import { EvidenceRecord } from '../types';

interface EvidencePanelProps {
  evidenceTrail: EvidenceRecord[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidenceTrail }) => {
  const getIcon = (type: string) => {
    const lowered = type.toLowerCase();
    if (lowered.includes('chlorophyll') || lowered.includes('pfz')) return <Satellite className="w-5 h-5 text-cyan-400" />;
    if (lowered.includes('sst') || lowered.includes('temp')) return <Thermometer className="w-5 h-5 text-amber-400" />;
    if (lowered.includes('wind')) return <Wind className="w-5 h-5 text-blue-400" />;
    return <Waves className="w-5 h-5 text-teal-400" />;
  };

  return (
    <div className="bg-[#0b172a]/90 border border-[#1b2b45] rounded-xl p-3.5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-200">
          Why this answer? <span className="text-slate-400 font-normal">Evidence provenance</span>
        </h4>
        <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {evidenceTrail.length > 0 ? (
          evidenceTrail.map((item) => (
            <div
              key={item.id}
              className="bg-[#070f1e] border border-[#1b2b45] hover:border-cyan-500/50 p-2.5 rounded-lg flex flex-col justify-between space-y-2 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    item.data_mode === 'LIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  ● {item.freshness_hours <= 1.0 ? 'LIVE' : `${item.freshness_hours.toFixed(0)}hr ago`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#0e1c33] border border-[#1e3254]">
                  {getIcon(item.record_type)}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-200 truncate">{item.source_name}</p>
                  <p className="text-[9px] text-slate-400 truncate">{item.record_type}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Default Fallback Cards matching visual mockup */
          <>
            <div className="bg-[#070f1e] border border-[#1b2b45] p-2.5 rounded-lg">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                ● LIVE
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Satellite className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-200">Sentinel-3 Chl-a</span>
              </div>
            </div>
            <div className="bg-[#070f1e] border border-[#1b2b45] p-2.5 rounded-lg">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                2hr ago
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Satellite className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-200">INCOIS PFZ</span>
              </div>
            </div>
            <div className="bg-[#070f1e] border border-[#1b2b45] p-2.5 rounded-lg">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                3min ago
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Thermometer className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold text-slate-200">HYCOM SST</span>
              </div>
            </div>
            <div className="bg-[#070f1e] border border-[#1b2b45] p-2.5 rounded-lg">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                5min ago
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Wind className="w-5 h-5 text-blue-400" />
                <span className="text-[11px] font-bold text-slate-200">GFS Wind</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
