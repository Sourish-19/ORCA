import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

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
      <div className="bg-error-container/90 border-2 border-error rounded-xl p-4 shadow-2xl text-on-error-container space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-error/40">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-error shrink-0" />
            <h2 className="text-sm sm:text-base font-black tracking-wider text-error uppercase font-sans">
              🚨 SAFETY VETO ACTIVE — DO NOT VENTURE TO SEA
            </h2>
          </div>
          <span className="text-xs font-mono font-extrabold px-3 py-1 rounded bg-error text-on-error border border-error">
            RISK: {riskLevel}
          </span>
        </div>

        <p className="text-xs font-medium leading-relaxed">
          {summary || 'IMD Cyclone Warning & Gale Wind threshold exceeded. Operational fishing refusal in effect.'}
        </p>

        {reasons.length > 0 && (
          <div className="bg-surface-container-lowest/60 p-3 rounded-lg border border-error/30 text-xs space-y-1.5 font-mono">
            <p className="font-bold text-error uppercase tracking-wider text-[11px]">Hard Safety Veto Triggers:</p>
            {reasons.map((reason, idx) => (
              <p key={idx} className="text-on-surface text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                <span>{reason}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-tertiary-container/20 border border-tertiary/60 rounded-xl p-3.5 flex items-center justify-between gap-4 text-tertiary">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-tertiary-container text-on-tertiary-container border border-tertiary">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary border border-tertiary/40">
              OPERATIONAL SAFETY CLEARANCE
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">Risk: LOW</span>
          </div>
          <h3 className="text-sm font-bold text-tertiary mt-0.5">
            ✓ SAFE TO PROCEED — Clear Marine Weather
          </h3>
        </div>
      </div>

      <div className="text-right hidden sm:block font-mono">
        <span className="text-xs text-tertiary font-bold">Wind: 12.5 kts</span>
        <p className="text-[10px] text-on-surface-variant">Waves: 1.2m</p>
      </div>
    </div>
  );
};
