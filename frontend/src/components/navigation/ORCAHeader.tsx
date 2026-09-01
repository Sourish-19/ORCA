import React from 'react';
import { Compass, Bell, Settings, User } from 'lucide-react';
import { PersonaMode, DataMode } from '../../types';

interface ORCAHeaderProps {
  persona: PersonaMode;
  onPersonaChange: (persona: PersonaMode) => void;
  dataMode?: DataMode;
  location?: string;
  selectedScenarioTitle?: string;
  onOpenScenarios?: () => void;
}

export const ORCAHeader: React.FC<ORCAHeaderProps> = ({
  persona,
  onPersonaChange,
  location = 'CHENNAI • BAY OF BENGAL'
}) => {
  return (
    <header className="bg-[#09101b] border-b border-[#1c2838] px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-50 h-14">
      
      {/* LEFT: ORCA Logo + Underline Location Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tight text-white font-sans">ORCA</h1>
        </div>

        {/* Location Underline Badge */}
        <div className="border-b-2 border-cyan-400 pb-0.5">
          <span className="text-xs font-extrabold text-cyan-400 tracking-wider font-mono uppercase">
            {location}
          </span>
        </div>
      </div>

      {/* RIGHT: Persona Switcher, Bell, Gear, Profile Avatar */}
      <div className="flex items-center gap-4">
        
        {/* Persona Switcher (Segmented Control matching reference screenshots) */}
        <div className="bg-[#060c16] border border-[#1c2838] p-1 rounded-md flex items-center gap-1">
          <button
            onClick={() => onPersonaChange('analyst')}
            className={`px-4 py-1 rounded text-xs font-extrabold uppercase tracking-wider transition ${
              persona === 'analyst'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ANALYST
          </button>
          <button
            onClick={() => onPersonaChange('fisherman')}
            className={`px-4 py-1 rounded text-xs font-extrabold uppercase tracking-wider transition ${
              persona === 'fisherman'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FISHERMAN
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3 text-slate-300">
          <button className="p-1.5 hover:text-cyan-400 hover:bg-[#152233] rounded-md transition">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-cyan-400 hover:bg-[#152233] rounded-md transition">
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#1c2838] border border-cyan-500/50 flex items-center justify-center text-slate-200 overflow-hidden">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

      </div>

    </header>
  );
};
