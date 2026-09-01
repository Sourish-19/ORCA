import React from 'react';
import { PlaySquare, CheckCircle2, AlertTriangle, Volume2, ArrowRight, Play, Database, HardDrive, Radio } from 'lucide-react';
import scenariosData from '../data/mock/scenarios.json';
import { DemoScenario } from '../types';

interface DemoScenariosPageProps {
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoScenariosPage: React.FC<DemoScenariosPageProps> = ({ onSelectScenario }) => {
  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
          ORCA DEMO SCENARIOS
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Run a complete multi-agent marine intelligence scenario
        </p>
      </div>

      {/* Banner */}
      <div className="bg-[#0b1420] border border-cyan-500/50 p-3 rounded-xl flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>DEMO MODE ACTIVE - SIMULATED DATA ENVIRONMENT</span>
      </div>

      {/* 3 Primary Scenario Cards Grid matching image 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Safe Scenario */}
        <div className="bg-[#0b1420] border border-[#1c2838] hover:border-cyan-500/50 p-5 rounded-xl flex flex-col justify-between space-y-4 transition">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              SAFE
            </span>

            <h3 className="text-base font-bold text-slate-100">
              "Where should I fish tomorrow near Chennai?"
            </h3>

            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">INCOIS</span>
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">MOSDAC</span>
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">IMD</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#1c2838]">
            <div className="text-[10px] font-mono">
              <span className="text-slate-500 block">Expected Outcome:</span>
              <strong className="text-emerald-400 font-bold">88% SUITABILITY | NO VETO</strong>
            </div>

            <button
              onClick={() => onSelectScenario(scenariosData[0] as DemoScenario)}
              className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>RUN SCENARIO</span>
            </button>
          </div>
        </div>

        {/* Card 2: Cyclone Veto Scenario */}
        <div className="bg-[#0b1420] border border-[#1c2838] hover:border-red-500/50 p-5 rounded-xl flex flex-col justify-between space-y-4 transition">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              ⚠ SAFETY CRITICAL
            </span>

            <h3 className="text-base font-bold text-slate-100">
              "Can I fish tomorrow near Chennai?"
            </h3>

            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">IMD Warning</span>
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">Wave Data</span>
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">Wind</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#1c2838]">
            <div className="text-[10px] font-mono">
              <span className="text-slate-500 block">Expected Outcome:</span>
              <strong className="text-red-400 font-bold">SAFETY VETO TRIGGERED</strong>
            </div>

            <button
              onClick={() => onSelectScenario(scenariosData[1] as DemoScenario)}
              className="w-full py-2.5 bg-[#182638] hover:bg-[#20344c] text-slate-300 border border-[#20344c] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-slate-300" />
              <span>RUN SCENARIO</span>
            </button>
          </div>
        </div>

        {/* Card 3: Tamil Voice Scenario */}
        <div className="bg-[#0b1420] border border-[#1c2838] hover:border-teal-500/50 p-5 rounded-xl flex flex-col justify-between space-y-4 transition">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              文A MULTILINGUAL
            </span>

            <h3 className="text-base font-bold text-slate-100">
              "நாளைக்கு எங்கு மீன் பிடிக்கலாம்?"
            </h3>
            <p className="text-[10px] text-slate-400 font-mono italic">"Where can I fish tomorrow?"</p>

            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">Tamil (Voice)</span>
              <span className="px-2 py-0.5 bg-[#050c18] border border-[#1c2838] rounded text-slate-400">Audio Processing</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#1c2838]">
            <div className="text-[10px] font-mono">
              <span className="text-slate-500 block">Expected Outcome:</span>
              <strong className="text-teal-300 font-bold">VOICE RESPONSE TAMIL ADVISORY</strong>
            </div>

            <button
              onClick={() => onSelectScenario(scenariosData[2] as DemoScenario)}
              className="w-full py-2.5 bg-[#182638] hover:bg-[#20344c] text-slate-300 border border-[#20344c] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-slate-300" />
              <span>RUN SCENARIO</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Demo Data Status Grid matching image 4 */}
      <div className="bg-[#0b1420] border border-[#1c2838] p-4 rounded-xl space-y-3">
        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
          DEMO DATA STATUS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#050c18] border border-[#1c2838] p-3 rounded-lg flex items-center justify-between font-mono text-xs">
            <div>
              <h4 className="font-bold text-slate-200">INCOIS</h4>
              <span className="text-[10px] text-slate-500 block">Timestamp: 14:00 IST</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
              CACHED
            </span>
          </div>

          <div className="bg-[#050c18] border border-[#1c2838] p-3 rounded-lg flex items-center justify-between font-mono text-xs">
            <div>
              <h4 className="font-bold text-slate-200">IMD</h4>
              <span className="text-[10px] text-slate-500 block">Timestamp: 14:00 IST</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
              CACHED
            </span>
          </div>

          <div className="bg-[#050c18] border border-[#1c2838] p-3 rounded-lg flex items-center justify-between font-mono text-xs">
            <div>
              <h4 className="font-bold text-slate-200">MOSDAC</h4>
              <span className="text-[10px] text-slate-500 block">Timestamp: 14:00 IST</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
              CACHED
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
