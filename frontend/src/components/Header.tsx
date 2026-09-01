import React from 'react';
import {
  Compass,
  Folder,
  HelpCircle,
  Bell,
  User,
  Home,
  Map as MapIcon,
  Sliders,
  PlayCircle,
  Settings,
  LogOut,
  Mic,
  Volume2
} from 'lucide-react';
import { DemoScenario } from '../types';

interface HeaderProps {
  mode: 'fisherman' | 'analyst';
  setMode: (mode: 'fisherman' | 'analyst') => void;
  scenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  scenarios,
  onSelectScenario,
  onQuerySubmit,
  isLoading
}) => {
  return (
    <>
      {/* Top Bar matching visual reference image */}
      <header className="bg-[#070e1c] border-b border-[#1b2b45] px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-50">
        
        {/* Brand Title & Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-600/30 text-white">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">ORCA</h1>
            <p className="text-[10px] text-slate-400 font-medium">Ocean Resource Analysis</p>
          </div>
        </div>

        {/* Live Search & Preset Demo Query Selector Bar */}
        <div className="flex-1 max-w-xl flex items-center gap-2">
          <select
            onChange={(e) => {
              const sc = scenarios.find((s) => s.id === e.target.value);
              if (sc) onSelectScenario(sc);
            }}
            defaultValue=""
            disabled={isLoading}
            className="w-full bg-[#0b172a] border border-[#1b2b45] text-xs text-cyan-300 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-cyan-500 hover:bg-[#102038] transition cursor-pointer"
          >
            <option value="" disabled>
              ⚡ Select Live Demo Query Scenario...
            </option>
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>

          {/* Voice Fisherman Toggle Button */}
          <button
            onClick={() => setMode(mode === 'fisherman' ? 'analyst' : 'fisherman')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition ${
              mode === 'fisherman'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                : 'bg-[#0b172a] text-slate-300 border-[#1b2b45] hover:border-cyan-500'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{mode === 'fisherman' ? 'Fisherman Mode' : 'Fisherman View'}</span>
          </button>
        </div>

        {/* Top Right Action Icons */}
        <div className="flex items-center gap-3 text-slate-400">
          <button className="p-1.5 hover:text-slate-200 transition">
            <Folder className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-slate-200 transition">
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="relative">
            <button className="p-1.5 hover:text-slate-200 transition">
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              5
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#1b2b45] border border-cyan-500/50 flex items-center justify-center text-slate-200">
            <User className="w-4 h-4" />
          </div>
        </div>

      </header>

      {/* Left Navigation Vertical Sidebar matching visual image */}
      <aside className="fixed left-0 top-[53px] bottom-0 w-12 bg-[#070e1c] border-r border-[#1b2b45] flex flex-col items-center justify-between py-4 z-40">
        
        {/* Main Navigation Icons */}
        <div className="flex flex-col items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-[#102038] rounded-lg transition">
            <Home className="w-4 h-4" />
          </button>
          <button className="p-2 text-cyan-400 bg-[#102038] border border-cyan-500/30 rounded-lg shadow-sm">
            <MapIcon className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-[#102038] rounded-lg transition">
            <Sliders className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-[#102038] rounded-lg transition">
            <PlayCircle className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-[#102038] rounded-lg transition">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Logout Icon */}
        <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition">
          <LogOut className="w-4 h-4" />
        </button>
      </aside>
    </>
  );
};
