import React, { useState, useEffect, useRef } from 'react';
import { Layers, Maximize2, Settings, Crosshair, Navigation, AlertTriangle } from 'lucide-react';
import { PFZZone, Hazard, MarineWeather } from '../../types';

interface MarineMapProps {
  pfzZones?: PFZZone[];
  activeHazard?: Hazard | null;
  selectedZone?: PFZZone | null;
  isVeto?: boolean;
}

export const MarineMap: React.FC<MarineMapProps> = ({
  pfzZones = [],
  activeHazard,
  selectedZone,
  isVeto = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState({
    baseMap: true,
    pfz: true,
    sst: true,
    chl: true,
    waves: true,
    wind: true,
    hazards: true,
    ports: true,
    route: true,
    depth: false,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[420px]">
      
      {/* Top Map Layer Control Bar */}
      <div className="bg-[#070f1e] px-3 py-2 border-b border-[#1b2b45] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            Marine GIS Vector Map — Bay of Bengal Sector
          </span>
        </div>

        {/* Independently Toggleable Layer Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <button
            onClick={() => toggleLayer('pfz')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.pfz ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            PFZ
          </button>
          <button
            onClick={() => toggleLayer('sst')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.sst ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            SST
          </button>
          <button
            onClick={() => toggleLayer('chl')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.chl ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            CHL
          </button>
          <button
            onClick={() => toggleLayer('wind')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.wind ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            WIND
          </button>
          <button
            onClick={() => toggleLayer('hazards')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.hazards ? 'bg-red-950 text-red-300 border-red-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            HAZARDS
          </button>
          <button
            onClick={() => toggleLayer('route')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.route ? 'bg-teal-950 text-teal-300 border-teal-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            ROUTE
          </button>
        </div>
      </div>

      {/* Main Map Visualization Canvas */}
      <div ref={mapContainerRef} className="relative flex-1 bg-[#040a16] overflow-hidden p-4 flex flex-col justify-between">
        
        {/* SVG Thermal SST Heatmap & Coastline Representation */}
        <div className="absolute inset-0 opacity-80 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
            <defs>
              <linearGradient id="mapHeat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
                <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {layers.sst && <rect x="0" y="0" width="800" height="450" fill="url(#mapHeat)" />}

            {/* Coastline */}
            <path
              d="M 280,50 Q 320,180 340,280 Q 360,350 420,400 Q 480,350 500,280 Q 560,180 620,80"
              fill="none"
              stroke="#0b172a"
              strokeWidth="24"
            />
            <path
              d="M 280,50 Q 320,180 340,280 Q 360,350 420,400 Q 480,350 500,280 Q 560,180 620,80"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />

            {/* PFZ Sector Polygons */}
            {layers.pfz && (
              <>
                <path d="M 500,280 L 580,260 L 590,310 L 510,320 Z" fill="#10b981" fillOpacity="0.35" stroke="#34d399" strokeWidth="2" />
                <path d="M 510,320 L 590,310 L 610,360 L 520,370 Z" fill="#38bdf8" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="2" />
              </>
            )}

            {/* Route Navigation Line */}
            {layers.route && (
              <path d="M 500,280 L 580,260" stroke="#4cd7f6" strokeWidth="2.5" strokeDasharray="6,4" />
            )}

            {/* Wind Vector Arrows */}
            {layers.wind && (
              <g stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5">
                <path d="M 120,110 L 140,120 M 140,120 L 132,115" />
                <path d="M 600,100 L 620,110 M 620,110 L 612,105" />
                <path d="M 450,220 L 470,230 M 470,230 L 462,225" />
              </g>
            )}

            {/* Ports / Harbour Markers */}
            {layers.ports && (
              <>
                <circle cx="500" cy="280" r="7" fill="#38bdf8" stroke="#040a16" strokeWidth="2" />
                <text x="440" y="275" fill="#dce3f0" fontSize="10" fontWeight="bold">Kasimedu Harbour</text>
              </>
            )}
          </svg>
        </div>

        {/* Hazard Warning Overlay */}
        {isVeto && layers.hazards && (
          <div className="relative z-10 my-auto self-center bg-red-950/90 border-2 border-red-500 p-4 rounded-xl max-w-sm text-center backdrop-blur-md shadow-2xl">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-1 animate-bounce" />
            <h4 className="font-bold text-xs text-red-300 uppercase tracking-wider">CYCLONE HAZARD ZONE ACTIVE</h4>
            <p className="text-[11px] text-red-200 mt-1">Severe Cyclonic Storm Warning • Gale winds 45-55 kts</p>
          </div>
        )}

        {/* Selected PFZ Information Popup */}
        {selectedZone && !isVeto && (
          <div className="relative z-10 bg-[#070f1e]/90 border border-cyan-500/50 p-3 rounded-lg max-w-xs shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                RECOMMENDED ZONE
              </span>
              <span className="font-bold text-emerald-400 text-xs">{selectedZone.strengthScore}%</span>
            </div>
            <h4 className="font-bold text-slate-100 text-xs">{selectedZone.sectorName}</h4>
            <p className="text-[10px] text-slate-400 mt-1">
              {selectedZone.distanceKm} km at bearing {selectedZone.bearingDeg}° from {selectedZone.nearestHarbour}
            </p>
          </div>
        )}

        {/* Map Legend */}
        <div className="relative z-10 self-end bg-[#070f1e]/90 border border-[#1b2b45] px-3 py-1.5 rounded-md text-[10px] text-slate-300 flex items-center gap-3 backdrop-blur-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span>PFZ Zone</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span>SST Warm</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
            <span>Kasimedu Port</span>
          </div>
        </div>

      </div>
    </div>
  );
};
