import React from 'react';
import { Cpu, CheckCircle2, Clock, ArrowDown, Database, Shield, Zap, Sparkles } from 'lucide-react';
import { ORCAResponse, AgentStepTrace } from '../types';

interface AgentExecutionProps {
  response: ORCAResponse | null;
}

export const AgentExecution: React.FC<AgentExecutionProps> = ({ response }) => {
  const traces: AgentStepTrace[] = response?.agent_traces || [
    { step_id: 1, agent_name: 'Language + Intent Agent', action: 'Detect language & parse entities', status: 'SUCCESS', duration_ms: 120, timestamp: new Date().toISOString(), summary: 'Query: "Where should I fish tomorrow near Chennai?" -> Intent: FISHING_RECOMMENDATION' },
    { step_id: 2, agent_name: 'Context / Memory Agent', action: 'Geocode & harbour binding', status: 'SUCCESS', duration_ms: 85, timestamp: new Date().toISOString(), summary: 'Coords: (13.0827°N, 80.2707°E) -> Kasimedu Harbour' },
    { step_id: 3, agent_name: 'Geo-Data Specialist Agent', action: 'INCOIS PFZ & MOSDAC ocean fetch', status: 'SUCCESS', duration_ms: 812, timestamp: new Date().toISOString(), summary: 'Retrieved 19 PFZ bulletins. SST = 28.4°C, Chl-a = 1.8 mg/m³' },
    { step_id: 4, agent_name: 'Hazard Specialist Agent', action: 'IMD Marine weather & cyclone check', status: 'SUCCESS', duration_ms: 340, timestamp: new Date().toISOString(), summary: 'IMD Wind = 12.5 kts, Waves = 1.2m. 0 active RED warnings' },
    { step_id: 5, agent_name: 'Reasoning Specialist Agent', action: 'Spatial join & 6-factor scoring', status: 'SUCCESS', duration_ms: 210, timestamp: new Date().toISOString(), summary: 'Evaluated 5 candidates -> Top: Chennai Offshore East (88/100)' },
    { step_id: 6, agent_name: 'Safety Specialist Agent (Deterministic Veto)', action: 'Safety threshold & warning intersection', status: 'SUCCESS', duration_ms: 95, timestamp: new Date().toISOString(), summary: 'Safety Clearance: PASSED (Risk: LOW)' },
    { step_id: 7, agent_name: 'Synthesis Agent', action: 'Grounded explanation & voice audio synthesis', status: 'SUCCESS', duration_ms: 180, timestamp: new Date().toISOString(), summary: 'Synthesized grounded response with audio broadcast payload' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Multi-Agent Collaborative Execution Pipeline</h2>
            <p className="text-xs text-slate-400">Step-by-step latency, inputs, outputs, and status trace</p>
          </div>
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          Total Latency: <strong className="text-cyan-400">1,842 ms</strong>
        </div>
      </div>

      <div className="space-y-3">
        {traces.map((trace: AgentStepTrace, idx: number) => (
          <div key={trace.step_id || idx} className="relative">
            <div className="bg-[#0b172a] border border-[#1b2b45] hover:border-cyan-500/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition">
              
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#13233c] text-cyan-400 border border-[#203759] flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5">
                  #{trace.step_id || idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-200">{trace.agent_name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                      ✓ {trace.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{trace.action}</p>
                  <p className="text-xs text-cyan-300 font-mono mt-1 bg-[#070f1e] p-2 rounded border border-[#1b2b45]">
                    {trace.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 self-end md:self-center shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{trace.duration_ms || 150} ms</span>
                </div>
              </div>

            </div>

            {idx < traces.length - 1 && (
              <div className="flex justify-center my-1">
                <ArrowDown className="w-4 h-4 text-cyan-500/50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
