import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Cpu,
  Plus,
  Zap,
  Anchor,
  Activity,
  Map as MapIcon,
  Clock,
  HelpCircle,
  FileText,
  ShieldAlert,
  PlaySquare,
  Volume2
} from 'lucide-react';

export const ORCASidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-[#09101b] border-r border-[#1c2838] flex flex-col justify-between p-3 z-40">
      
      <div className="space-y-4">
        {/* Top Header Box matching image 1 */}
        <div className="bg-[#050c18] border border-[#1c2838] p-2.5 rounded-lg flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-md">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wide">ORCA Core</h3>
            <p className="text-[9px] text-slate-400 font-mono font-semibold">MULTI-AGENT REASONING</p>
          </div>
        </div>

        {/* Bright Cyan Action Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition shadow-md shadow-cyan-400/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NEW MISSION</span>
        </button>

        {/* Main Nav Items List */}
        <nav className="space-y-1 text-xs">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1b2b]'
              }`
            }
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>INTELLIGENCE</span>
          </NavLink>

          <NavLink
            to="/fleet-overview"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1b2b]'
              }`
            }
          >
            <Anchor className="w-4 h-4 text-cyan-400" />
            <span>VESSELS</span>
          </NavLink>

          <NavLink
            to="/agent-execution"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1b2b]'
              }`
            }
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AGENT TRACE</span>
          </NavLink>

          <NavLink
            to="/marine-map"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1b2b]'
              }`
            }
          >
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <span>MAP CONTROLS</span>
          </NavLink>

          <NavLink
            to="/data-health"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1b2b]'
              }`
            }
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM HEALTH</span>
          </NavLink>

          <NavLink
            to="/safety-veto"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1b2b]'
              }`
            }
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>SAFETY VETO</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom Nav Links */}
      <div className="space-y-1 text-xs border-t border-[#1c2838] pt-3">
        <NavLink
          to="/demo-scenarios"
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-cyan-400 font-bold transition"
        >
          <PlaySquare className="w-4 h-4" />
          <span>DEMO SCENARIOS</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-cyan-400 font-bold transition"
        >
          <HelpCircle className="w-4 h-4" />
          <span>SUPPORT</span>
        </NavLink>

        <NavLink
          to="/evidence-inspector"
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-cyan-400 font-bold transition"
        >
          <FileText className="w-4 h-4" />
          <span>LOGS</span>
        </NavLink>
      </div>

    </aside>
  );
};
