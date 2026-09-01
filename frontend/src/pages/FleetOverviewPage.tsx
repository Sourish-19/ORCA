import React from 'react';
import { Anchor, Navigation, ShieldCheck, AlertCircle, Radio } from 'lucide-react';
import { MarineMap } from '../components/map/MarineMap';

export const FleetOverviewPage: React.FC = () => {
  const vessels = [
    { id: 'v_01', name: 'MFV Sea Queen (Kasimedu Base)', type: 'Mechanized Trawler', lat: 13.18, lon: 80.62, status: 'IN_ZONE', distanceKm: 35.2, safety: 'CLEAR' },
    { id: 'v_02', name: 'MFV Blue Marlin (Kasimedu Base)', type: 'Gillnetter', lat: 12.61, lon: 80.45, status: 'TRANSIT', distanceKm: 28.5, safety: 'CLEAR' },
    { id: 'v_03', name: 'MFV Ocean Pearl (Munambam Base)', type: 'Deep Sea Trawler', lat: 10.21, lon: 75.85, status: 'IN_ZONE', distanceKm: 34.0, safety: 'CLEAR' },
    { id: 'v_04', name: 'MFV Vizag Star (Vizag Base)', type: 'Trawler', lat: 17.52, lon: 83.58, status: 'DOCKED', distanceKm: 0.0, safety: 'VETO_DOCKED' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Vessel Tracking & Fleet Overview</h2>
            <p className="text-xs text-slate-400">Live AIS positions, harbour binding, and safety zone clearance</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-3 py-1.5 rounded-lg">
          4 REGISTERED VESSELS TRACKED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Vessel List */}
        <div className="space-y-3">
          {vessels.map((v) => (
            <div key={v.id} className="bg-[#0b172a] border border-[#1b2b45] hover:border-cyan-500/40 p-4 rounded-xl space-y-2 transition">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-100">{v.name}</h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    v.safety === 'CLEAR'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {v.safety}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{v.type}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#1b2b45]">
                <span>Status: <strong className="text-cyan-300">{v.status}</strong></span>
                <span>Distance: <strong className="text-slate-200">{v.distanceKm} km</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Right 2 Columns: Marine Map */}
        <div className="lg:col-span-2">
          <MarineMap />
        </div>
      </div>
    </div>
  );
};
