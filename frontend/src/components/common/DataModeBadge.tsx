import React from 'react';
import { DataMode } from '../../types';

interface DataModeBadgeProps {
  mode: DataMode;
  lastUpdated?: string;
}

export const DataModeBadge: React.FC<DataModeBadgeProps> = ({ mode, lastUpdated }) => {
  if (mode === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        ● LIVE API
      </span>
    );
  }

  if (mode === 'CACHED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
        ● CACHED {lastUpdated ? `(${lastUpdated})` : ''}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
      ● DEMO MODE
    </span>
  );
};
