import React from 'react';
import { MoreVertical } from 'lucide-react';
import { AgentStepTrace } from '../types';

interface AgentTracePanelProps {
  agentTraces: AgentStepTrace[];
}

export const AgentTracePanel: React.FC<AgentTracePanelProps> = ({ agentTraces }) => {
  const defaultAgentSteps = [
    { name: 'Intent', color: '#38bdf8', desc: 'Intent parsed: Location Chennai, Target Date Tomorrow', status: 'SUCCESS' },
    { name: 'GeoData', color: '#34d399', desc: 'Retrieved INCOIS PFZ (88.5%) & MOSDAC SST (28.4°C)', status: 'SUCCESS' },
    { name: 'Hazard', color: '#f87171', desc: 'IMD Weather: Wind 12.5 kts, Wave 1.2m. 0 Red Warnings', status: 'SUCCESS' },
    { name: 'Reasoning', color: '#fbbf24', desc: 'Evaluated 5 candidates. Top score: 86.97% Suitability', status: 'SUCCESS' },
    { name: 'Safety', color: '#34d399', desc: 'Deterministic Safety Check PASSED (Risk: LOW)', status: 'SUCCESS' },
    { name: 'Synthesis', color: '#38bdf8', desc: 'Synthesized grounded response with audio broadcast text', status: 'SUCCESS' }
  ];

  return (
    <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1b2b45]">
        <h3 className="text-xs font-bold text-slate-200">Multi-agent execution trace</h3>
        <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
      </div>

      <div className="relative space-y-4 pl-3">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[17px] top-2 bottom-4 w-0.5 bg-[#1b2b45]"></div>

        {agentTraces.length > 0
          ? agentTraces.map((trace) => {
              const nodeColor =
                trace.status === 'VETO'
                  ? '#ef4444'
                  : trace.agent_name.includes('Intent')
                  ? '#38bdf8'
                  : trace.agent_name.includes('Geo')
                  ? '#34d399'
                  : trace.agent_name.includes('Hazard')
                  ? '#f87171'
                  : trace.agent_name.includes('Reason')
                  ? '#fbbf24'
                  : trace.agent_name.includes('Safety')
                  ? '#34d399'
                  : '#38bdf8';

              return (
                <div key={trace.step_id} className="relative flex items-start gap-3 text-xs">
                  {/* Timeline Dot */}
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-[#0b172a] shrink-0 mt-0.5 z-10"
                    style={{ backgroundColor: nodeColor }}
                  ></div>

                  <div className="flex-1 bg-[#070f1e] border border-[#1b2b45] p-2.5 rounded-lg space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-[11px]">{trace.agent_name}</span>
                      <span className="text-[9px] font-mono text-slate-500">{trace.duration_ms}ms</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{trace.summary}</p>
                  </div>
                </div>
              );
            })
          : defaultAgentSteps.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-3 text-xs">
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-[#0b172a] shrink-0 mt-0.5 z-10"
                  style={{ backgroundColor: step.color }}
                ></div>

                <div className="flex-1 bg-[#070f1e] border border-[#1b2b45] p-2 rounded-lg space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{step.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">Timestamp ago</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};
