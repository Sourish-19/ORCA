import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ORCAHeader } from '../navigation/ORCAHeader';
import { ORCASidebar } from '../navigation/ORCASidebar';
import { PersonaMode, DataMode } from '../../types';

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
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Synchronize persona mode based on current URL path
  useEffect(() => {
    const path = routerLocation.pathname;
    if (path.includes('fisherman') || path.includes('tamil-voice')) {
      if (persona !== 'fisherman') {
        onPersonaChange('fisherman');
      }
    } else {
      if (persona !== 'analyst') {
        onPersonaChange('analyst');
      }
    }
  }, [routerLocation.pathname]);

  const handlePersonaSelect = (newPersona: PersonaMode) => {
    onPersonaChange(newPersona);
    if (newPersona === 'fisherman') {
      navigate('/fisherman');
    } else {
      navigate('/dashboard');
    }
  };

  const isFishermanMode = persona === 'fisherman';

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col selection:bg-primary selection:text-on-primary">
      {/* Shared Global Top Header */}
      <ORCAHeader
        persona={persona}
        onPersonaChange={handlePersonaSelect}
        dataMode={dataMode}
        location={location}
        selectedScenarioTitle={selectedScenarioTitle}
        onOpenScenarios={onOpenScenarios}
      />

      {/* Shared Global Left Navigation Sidebar (Only rendered in Analyst mode) */}
      {!isFishermanMode && <ORCASidebar />}

      {/* Main Page Container with exact 256px (pl-64) offset in Analyst mode */}
      <main
        className={`flex-1 flex flex-col w-full transition-all duration-200 ${
          isFishermanMode
            ? 'pl-4 pr-4 py-4 max-w-4xl mx-auto'
            : 'pl-64 pr-6 py-4 max-w-[1800px]'
        }`}
      >
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer
        className={`bg-surface-container-lowest border-t border-outline-variant py-2.5 px-6 text-center text-[11px] text-on-surface-variant font-mono transition-all duration-200 ${
          isFishermanMode ? 'pl-4' : 'pl-64'
        }`}
      >
        ORCA (Marine EcOsystem Reasoning with Collaborative Agents) • SIH26176 Prototype System
      </footer>
    </div>
  );
};
