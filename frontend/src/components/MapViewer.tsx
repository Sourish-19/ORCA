import React, { useState } from 'react';
import {
  Layers,
  Maximize2,
  Settings,
  Grid,
  PenTool,
  Crosshair,
  Map as MapIcon,
  Navigation,
  AlertTriangle,
  Wind,
  Waves,
  Thermometer,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { ORCAResponse } from '../types';
import { EvidencePanel } from './EvidencePanel';

interface MapViewerProps {
  response: ORCAResponse | null;
}

export const MapViewer: React.FC<MapViewerProps> = ({ response }) => {
  const [showPFZ, setShowPFZ] = useState(true);
  const [showSST, setShowSST] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showHazards, setShowHazards] = useState(true);

  const safety = response?.safety;
  const isVeto = safety?.veto_triggered;
  const rec = response?.top_recommendation;

  return (
    <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      
      {/* Top Map Toolbar matching visual design */}
      <div className="bg-[#070f1e] px-3 py-2 border-b border-[#1b2b45] flex items-center justify-between gap-2">
        
        {/* Left Toolbar Icons */}
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-2.5 py-1 bg-[#13233c] text-slate-200 border border-[#203759] rounded-md text-xs font-semibold hover:bg-[#1c3254] transition">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>
          <div className="h-4 w-px bg-[#1b2b45] mx-1"></div>
          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#13233c] rounded transition">
            <PenTool className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#13233c] rounded transition">
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#13233c] rounded transition">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#13233c] rounded transition">
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Toolbar Icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPFZ(!showPFZ)}
            className={`px-2 py-1 text-[11px] font-semibold rounded transition ${
              showPFZ ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🎯 PFZ
          </button>
          <button
            onClick={() => setShowSST(!showSST)}
            className={`px-2 py-1 text-[11px] font-semibold rounded transition ${
              showSST ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🌡️ SST
          </button>
          <button
            onClick={() => setShowWind(!showWind)}
            className={`px-2 py-1 text-[11px] font-semibold rounded transition ${
              showWind ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            💨 Wind
          </button>
          <div className="h-4 w-px bg-[#1b2b45] mx-1"></div>
          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#13233c] rounded transition">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Ocean Map Canvas Container */}
      <div className="relative flex-1 min-h-[380px] bg-[#030914] overflow-hidden flex flex-col justify-between p-4">
        
        {/* Synthetic Thermal SST & Sector Polygon Canvas Representation */}
        <div className="absolute inset-0 opacity-85">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
            <defs>
              {/* Thermal Current Gradient */}
              <linearGradient id="sstHeat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Ocean Heatmap Background */}
            {showSST && (
              <rect x="0" y="0" width="800" height="450" fill="url(#sstHeat)" />
            )}

            {/* Indian Coastline & Sector Polygons */}
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

            {/* PFZ Sector Boundary Zones */}
            {showPFZ && (
              <>
                {/* East Coast Zones */}
                <path d="M 500,280 L 580,260 L 590,310 L 510,320 Z" fill="#10b981" fillOpacity="0.3" stroke="#34d399" strokeWidth="2" />
                <path d="M 510,320 L 590,310 L 610,360 L 520,370 Z" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 560,180 L 650,150 L 670,210 L 580,230 Z" fill="#fb923c" fillOpacity="0.35" stroke="#fb923c" strokeWidth="2" />

                {/* West Coast Zones */}
                <path d="M 340,280 L 260,260 L 250,320 L 330,330 Z" fill="#34d399" fillOpacity="0.3" stroke="#34d399" strokeWidth="2" />
                <path d="M 320,180 L 230,160 L 220,220 L 310,230 Z" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
              </>
            )}

            {/* Wind Vector Arrows Overlay */}
            {showWind && (
              <g stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" fill="none">
                <path d="M 100,100 L 120,110 M 120,110 L 112,105 M 120,110 L 115,114" />
                <path d="M 180,140 L 200,150 M 200,150 L 192,145 M 200,150 L 195,154" />
                <path d="M 600,100 L 620,110 M 620,110 L 612,105 M 620,110 L 615,114" />
                <path d="M 680,180 L 700,190 M 700,190 L 692,185 M 700,190 L 695,194" />
                <path d="M 450,220 L 470,230 M 470,230 L 462,225 M 470,230 L 465,234" />
                <path d="M 520,150 L 540,160 M 540,160 L 532,155 M 540,160 L 535,164" />
              </g>
            )}

            {/* Harbour Pin Markers */}
            <circle cx="510" cy="320" r="6" fill="#38bdf8" stroke="#070f1e" strokeWidth="2" />
            <circle cx="580" cy="230" r="6" fill="#38bdf8" stroke="#070f1e" strokeWidth="2" />
            <circle cx="330" cy="330" r="6" fill="#38bdf8" stroke="#070f1e" strokeWidth="2" />
            <circle cx="310" cy="230" r="6" fill="#38bdf8" stroke="#070f1e" strokeWidth="2" />
          </svg>
        </div>

        {/* Hazard Alert Bounding Box Overlay */}
        {isVeto && (
          <div className="relative z-10 self-center my-auto bg-red-950/80 border-2 border-red-500/80 p-4 rounded-xl max-w-md text-center shadow-2xl backdrop-blur-md">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" />
            <h4 className="font-bold text-sm text-red-300">SAFETY VETO ACTIVE IN THIS SECTOR</h4>
            <p className="text-xs text-red-200 mt-1">{safety?.safety_summary}</p>
          </div>
        )}

        {/* Recommended Candidate Overlay Card */}
        {rec && !isVeto && (
          <div className="relative z-10 self-start bg-[#070f1e]/90 border border-cyan-500/50 p-3 rounded-xl max-w-xs shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                RECOMMENDED PFZ
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {response.suitability_breakdown?.total_score}%
              </span>
            </div>
            <h4 className="font-bold text-slate-100 text-xs">{rec.sector_name}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {rec.distance_km} km at bearing {rec.bearing_deg}° from {rec.nearest_landing_centre}
            </p>
          </div>
        )}

        {/* Bottom Evidence Provenance Component embedded inside Map section */}
        <div className="relative z-10 mt-auto pt-4">
          <EvidencePanel evidenceTrail={response?.evidence_trail || []} />
        </div>

      </div>
    </div>
  );
};
