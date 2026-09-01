import React from 'react';
import { Outlet } from 'react-router-dom';
import { ORCAHeader } from '../navigation/ORCAHeader';
import { ORCASidebar } from '../navigation/ORCASidebar';
import { PersonaMode, DataMode, DemoScenario, ORCAResponse } from '../../types';

interface AppShellProps {
  persona: PersonaMode;
  onPersonaChange: (persona: PersonaMode) => void;
  dataMode?: DataMode;
  location?: string;
  selectedScenarioTitle?: string;
  onOpenScenarios?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  persona,
  onPersonaChange,
  dataMode = 'DEMO',
  location = 'Chennai • Bay of Bengal',
  selectedScenarioTitle,
  onOpenScenarios
}) => {
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Shared Global Top Header */}
      <ORCAHeader
        persona={persona}
        onPersonaChange={onPersonaChange}
        dataMode={dataMode}
        location={location}
        selectedScenarioTitle={selectedScenarioTitle}
        onOpenScenarios={onOpenScenarios}
      />

      {/* Shared Global Left Navigation Sidebar */}
      <ORCASidebar />

      {/* Main Page Container Offset for Left Sidebar (pl-14) */}
      <main className="pl-14 p-3 flex-1 flex flex-col max-w-[1600px] w-full mx-auto">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="pl-14 bg-[#030811] border-t border-[#1b2b45] py-2 px-4 text-center text-[10px] text-slate-500 font-mono">
        ORCA (Marine EcOsystem Reasoning with Collaborative Agents) • SIH26176 Prototype System
      </footer>
    </div>
  );
};
