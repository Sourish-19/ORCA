import React from 'react';
import { Compass, Folder, HelpCircle, Bell, User, MapPin, Layers, Radio, Shield, Volume2 } from 'lucide-react';
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
  dataMode = 'DEMO',
  location = 'Chennai • Bay of Bengal',
  selectedScenarioTitle,
  onOpenScenarios
}) => {
  return (
    <header className="bg-[#070e1c] border-b border-[#1b2b45] px-4 py-2 flex items-center justify-between gap-4 sticky top-0 z-50 h-14">
      
      {/* LEFT: Logo & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-600/30 text-white flex items-center justify-center">
          <Compass className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">ORCA</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0e1c33] text-cyan-400 border border-[#1e3458] font-mono font-bold">
              SIH26176
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Marine EcOsystem Reasoning with Collaborative Agents
          </p>
        </div>
      </div>

      {/* CENTER: Location Indicator & Demo Mode Badge */}
      <div className="hidden md:flex items-center gap-3 bg-[#0d1728] border border-[#1b2b45] px-3 py-1 rounded-lg">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{location}</span>
        </div>

        <div className="h-3 w-px bg-[#1b2b45]"></div>

        {/* Demo Mode Badge */}
        <button
          onClick={onOpenScenarios}
          className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono font-bold hover:bg-amber-900 transition"
        >
          <Radio className="w-3 h-3 animate-ping text-amber-400" />
          <span>{selectedScenarioTitle || 'DEMO MODE • CHENNAI'}</span>
        </button>
      </div>

      {/* RIGHT: Persona Switcher, Notifications, Settings */}
      <div className="flex items-center gap-3">
        
        {/* Persona Switcher (Segmented Control) */}
        <div className="bg-[#0b172a] border border-[#1b2b45] p-1 rounded-lg flex items-center gap-1">
          <button
            onClick={() => onPersonaChange('analyst')}
            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              persona === 'analyst'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Analyst
          </button>
          <button
            onClick={() => onPersonaChange('fisherman')}
            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              persona === 'fisherman'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Fisherman
          </button>
        </div>

        {/* Notifications & User Avatar */}
        <div className="flex items-center gap-2 text-slate-400">
          <div className="relative">
            <button className="p-1.5 hover:text-slate-200 hover:bg-[#102038] rounded-md transition">
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </div>

          <div className="w-7 h-7 rounded-full bg-[#1b2b45] border border-cyan-500/50 flex items-center justify-center text-slate-200">
            <User className="w-4 h-4" />
          </div>
        </div>

      </div>

    </header>
  );
};
