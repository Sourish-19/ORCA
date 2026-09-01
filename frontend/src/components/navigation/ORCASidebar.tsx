import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Cpu,
  Map as MapIcon,
  Award,
  FileSearch,
  ShieldAlert,
  Bell,
  Activity,
  Anchor,
  PlaySquare,
  Volume2,
  PhoneCall
} from 'lucide-react';

export const ORCASidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Analyst Dashboard', icon: Home },
    { to: '/agent-execution', label: 'Agent Execution Trace', icon: Cpu },
    { to: '/marine-map', label: 'Marine GIS Map', icon: MapIcon },
    { to: '/recommendation', label: 'Recommendation & Evidence', icon: Award },
    { to: '/evidence-inspector', label: 'Evidence Inspector', icon: FileSearch },
    { to: '/safety-veto', label: 'Safety Veto Active', icon: ShieldAlert },
    { to: '/alerts', label: 'Marine Hazard Alerts', icon: Bell },
    { to: '/data-health', label: 'Data Source Health', icon: Activity },
    { to: '/fleet-overview', label: 'Fleet Overview', icon: Anchor },
    { to: '/demo-scenarios', label: 'Demo Scenario Center', icon: PlaySquare },
    { to: '/fisherman', label: 'Fisherman Mode', icon: Volume2 },
    { to: '/tamil-voice', label: 'Tamil Voice Query', icon: PhoneCall },
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-14 bg-[#070e1c] border-r border-[#1b2b45] flex flex-col items-center justify-between py-3 z-40">
      <div className="flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `p-2.5 rounded-xl transition flex items-center justify-center relative group ${
                  isActive
                    ? 'bg-[#102038] text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0d1728]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {/* Tooltip on hover */}
              <span className="absolute left-16 bg-[#070f1e] text-slate-200 border border-[#1b2b45] text-xs px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-50">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
