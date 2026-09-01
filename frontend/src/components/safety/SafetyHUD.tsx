import React from 'react';
import { ShieldCheck, AlertTriangle, Radio } from 'lucide-react';

interface SafetyHUDProps {
  safetyStatus: 'SAFE' | 'WARNING' | 'VETO';
  summary?: string;
  reasons?: string[];
  riskLevel?: string;
}

export const SafetyHUD: React.FC<SafetyHUDProps> = ({
  safetyStatus,
  summary,
  reasons = [],
  riskLevel = 'LOW'
}) => {
  const isVeto = safetyStatus === 'VETO';

  if (isVeto) {
    return (
      <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-4 shadow-2xl shadow-red-950/50 text-red-100 animate-pulse">
        <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
            <h2 className="text-base font-extrabold tracking-wider text-red-200 uppercase">
              🚨 SAFETY VETO ACTIVE — DO NOT VENTURE TO SEA
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-red-900 text-white border border-red-700">
            RISK: {riskLevel}
          </span>
        </div>

        <p className="text-xs font-semibold text-red-200 mb-2">
          {summary || 'IMD Cyclone Warning & Gale Wind threshold exceeded. Operational fishing refusal in effect.'}
        </p>

        {reasons.length > 0 && (
          <div className="bg-red-900/40 p-2.5 rounded-lg border border-red-800 text-xs space-y-1">
            <p className="font-bold text-red-300">Hard Safety Veto Triggers:</p>
            {reasons.map((reason, idx) => (
              <p key={idx} className="text-red-200 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                {reason}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-xl p-3.5 flex items-center justify-between gap-4 text-emerald-200">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-900/80 border border-emerald-600 text-emerald-300">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              OPERATIONAL SAFETY CLEARANCE
            </span>
            <span className="text-[10px] text-slate-400">Risk: LOW</span>
          </div>
          <h3 className="text-sm font-bold text-emerald-300 mt-0.5">
            ✓ SAFE TO PROCEED — Clear Marine Weather
          </h3>
        </div>
      </div>

      <div className="text-right hidden sm:block">
        <span className="text-xs font-mono text-emerald-400 font-bold">Wind: 12.5 kts</span>
        <p className="text-[10px] text-slate-400">Waves: 1.2m</p>
      </div>
    </div>
  );
};
