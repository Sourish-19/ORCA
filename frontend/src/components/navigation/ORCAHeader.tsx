import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Settings, User, MapPin } from 'lucide-react';
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
  location = 'Chennai • Bay of Bengal'
}) => {
  return (
    <header className="bg-[#070e1a] border-b border-[#1c2838] px-4 py-2 flex items-center justify-between gap-4 sticky top-0 z-50 h-14">
      
      {/* LEFT: ORCA Logo + Subtitle / Location Underline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white font-sans">ORCA</span>
        </div>

        {/* Location Underline Badge */}
        <div className="border-b-2 border-cyan-400 pb-0.5">
          <span className="text-xs font-extrabold text-cyan-400 tracking-wider font-mono uppercase">
            {location}
          </span>
        </div>
      </div>

      {/* RIGHT: Persona Switcher, Demo Badge, Bell, Gear, Profile Avatar */}
      <div className="flex items-center gap-3">
        
        {/* Demo Mode Badge */}
        <NavLink
          to="/demo-scenarios"
          className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900 transition"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>DEMO MODE • CHENNAI</span>
        </NavLink>

        {/* Persona Switcher (Segmented Control) */}
        <div className="bg-[#050c18] border border-[#1c2838] p-1 rounded-md flex items-center gap-1">
          <button
            onClick={() => onPersonaChange('analyst')}
            className={`px-3 py-1 rounded text-xs font-extrabold uppercase transition ${
              persona === 'analyst'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analyst
          </button>
          <button
            onClick={() => onPersonaChange('fisherman')}
            className={`px-3 py-1 rounded text-xs font-extrabold uppercase transition ${
              persona === 'fisherman'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fisherman
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2 text-slate-300">
          <button className="p-1.5 hover:text-cyan-400 hover:bg-[#152233] rounded-md transition">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-cyan-400 hover:bg-[#152233] rounded-md transition">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#1c2838] border border-cyan-500/50 flex items-center justify-center text-slate-200 overflow-hidden">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

      </div>

    </header>
  );
};
