import React from 'react';
import { PlaySquare, CheckCircle2, AlertTriangle, Volume2, ArrowRight } from 'lucide-react';
import scenariosData from '../data/mock/scenarios.json';
import { DemoScenario } from '../types';

interface DemoScenariosPageProps {
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoScenariosPage: React.FC<DemoScenariosPageProps> = ({ onSelectScenario }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <PlaySquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">SIH Demonstration Scenario Center</h2>
            <p className="text-xs text-slate-400">One-click evaluation scenarios for Smart India Hackathon judging panel</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenariosData.map((sc) => (
          <div
            key={sc.id}
            className="bg-[#0b172a] border border-[#1b2b45] hover:border-cyan-500/50 p-5 rounded-xl flex flex-col justify-between space-y-4 transition shadow-xl group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase ${
                    sc.presetSafety === 'VETO'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {sc.presetSafety === 'VETO' ? '🚨 SAFETY VETO' : '✓ CLEAR WEATHER'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{sc.location}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
                {sc.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-[#070f1e] p-2.5 rounded border border-[#1b2b45] text-xs font-mono">
                <span className="text-slate-500 text-[10px] block mb-0.5">SIMULATED QUERY</span>
                <span className="text-cyan-300">"{sc.query}"</span>
              </div>

              <button
                onClick={() => onSelectScenario(sc as DemoScenario)}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-md shadow-cyan-600/20"
              >
                <span>Launch Demo Scenario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
