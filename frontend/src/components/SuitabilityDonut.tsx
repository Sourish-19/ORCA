import React from 'react';
import { SuitabilityBreakdown } from '../types';

interface SuitabilityDonutProps {
  breakdown: SuitabilityBreakdown | null | undefined;
  isVeto?: boolean;
}

export const SuitabilityDonut: React.FC<SuitabilityDonutProps> = ({ breakdown, isVeto }) => {
  if (isVeto || !breakdown) {
    return (
      <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl p-4 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <span className="text-red-400 font-bold text-xs uppercase tracking-wider mb-1">Safety Veto Active</span>
        <p className="text-[11px] text-slate-400">Suitability scoring suppressed due to official weather / hazard advisory.</p>
      </div>
    );
  }

  const factors = [
    { label: 'PFZ', weight: '35%', val: breakdown.pfz_contribution, color: '#38bdf8' },
    { label: 'Chlorophyll', weight: '25%', val: breakdown.chlorophyll_contribution, color: '#34d399' },
    { label: 'SST', weight: '15%', val: breakdown.sst_contribution, color: '#fb923c' },
    { label: 'Wind', weight: '10%', val: breakdown.wind_contribution, color: '#818cf8' },
    { label: 'Wave', weight: '10%', val: breakdown.wave_contribution, color: '#a78bfa' },
    { label: 'Access', weight: '5%', val: breakdown.accessibility_contribution, color: '#64748b' }
  ];

  // Calculate SVG stroke DashOffset for Donut chart
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const total = breakdown.total_score;

  return (
    <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-200 tracking-wide">6-Factor Suitability Score</h3>
        <span className="text-sm font-extrabold text-cyan-400 font-mono">{total.toFixed(0)}%</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Doughnut Chart SVG */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#1e293b"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Main Total Score Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#donutGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (total / 100) * circumference}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold text-slate-100 font-mono">{total.toFixed(0)}%</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Score</span>
          </div>
        </div>

        {/* Legend & Percentages List */}
        <div className="flex-1 space-y-1.5 text-xs">
          {factors.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }}></span>
                <span className="text-slate-300 font-medium text-[11px]">{f.label}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{f.weight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
