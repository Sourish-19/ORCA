import React from 'react';
import { ORCAResponse } from '../types';
import { MapViewer } from './MapViewer';
import { SuitabilityDonut } from './SuitabilityDonut';
import { AgentTracePanel } from './AgentTracePanel';

interface AnalystViewProps {
  response: ORCAResponse | null;
}

export const AnalystView: React.FC<AnalystViewProps> = ({ response }) => {
  const isVeto = response?.safety?.veto_triggered;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
      
      {/* Main Center Panel (Spans 2 Columns) - GIS Canvas & Evidence Provenance */}
      <div className="lg:col-span-2 flex flex-col space-y-3">
        <MapViewer response={response} />
      </div>

      {/* Right Sidebar Panel (Spans 1 Column) - Suitability Doughnut & Agent Trace */}
      <div className="flex flex-col space-y-3">
        {/* Top Doughnut Chart Card */}
        <SuitabilityDonut
          breakdown={response?.suitability_breakdown}
          isVeto={isVeto}
        />

        {/* Bottom Multi-Agent Execution Trace Card */}
        <AgentTracePanel
          agentTraces={response?.agent_traces || []}
        />
      </div>

    </div>
  );
};
