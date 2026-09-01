import React from 'react';
import { Activity, Database, CheckCircle2, AlertCircle, ArrowRight, Server, RefreshCw, Cpu } from 'lucide-react';
import sourcesData from '../data/mock/sources.json';

export const DataHealthPage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
          DATA SOURCE HEALTH
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          SYSTEM-WIDE DATA INGESTION AND CONNECTOR STATUS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left 8-Cols: Ingestion Architecture & Source Cards */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Data Pipeline Architecture Box */}
          <div className="bg-[#0b1420] border border-[#1c2838] p-4 rounded-xl space-y-3">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
              Data Pipeline Architecture
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono py-2">
              <div className="bg-[#050c18] border border-[#1c2838] p-3 rounded-lg text-center flex-1 min-w-[100px]">
                <Database className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="font-bold text-slate-200 text-[10px] uppercase block">SOURCE</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

              <div className="bg-[#050c18] border border-cyan-500/50 p-3 rounded-lg text-center flex-1 min-w-[100px]">
                <Server className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="font-bold text-cyan-300 text-[10px] uppercase block">CONNECTOR</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

              <div className="bg-[#050c18] border border-[#1c2838] p-3 rounded-lg text-center flex-1 min-w-[100px]">
                <RefreshCw className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="font-bold text-slate-200 text-[10px] uppercase block">NORMALIZE</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

              <div className="bg-[#050c18] border border-emerald-800 p-3 rounded-lg text-center flex-1 min-w-[100px] bg-emerald-950/20">
                <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="font-bold text-emerald-400 text-[10px] uppercase block">POSTGIS/REDIS</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

              <div className="bg-[#050c18] border border-cyan-500 p-3 rounded-lg text-center flex-1 min-w-[100px]">
                <Cpu className="w-5 h-5 text-cyan-300 mx-auto mb-1" />
                <span className="font-bold text-cyan-300 text-[10px] uppercase block">ORCA AGENTS</span>
              </div>
            </div>
          </div>

          {/* 6 Source Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: INCOIS */}
            <div className="bg-[#0b1420] border border-[#1c2838] p-3.5 rounded-xl space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">INCOIS</h4>
                  <p className="text-[9px] text-slate-400">PFZ Advisory</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  ● LIVE
                </span>
              </div>

              <div className="text-[10px] space-y-1 text-slate-400 pt-2 border-t border-[#1c2838]">
                <div className="flex justify-between"><span>Updated:</span><span className="text-slate-200">14 min ago</span></div>
                <div className="flex justify-between"><span>Records:</span><span className="text-slate-200">19 zones</span></div>
                <div className="flex justify-between"><span>Connector:</span><span className="text-emerald-400 font-bold">Healthy (99.9%)</span></div>
              </div>
            </div>

            {/* Card 2: MOSDAC */}
            <div className="bg-[#0b1420] border border-[#1c2838] p-3.5 rounded-xl space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">MOSDAC</h4>
                  <p className="text-[9px] text-slate-400">SST / Ocean Colour</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  ● LIVE
                </span>
              </div>

              <div className="text-[10px] space-y-1 text-slate-400 pt-2 border-t border-[#1c2838]">
                <div className="flex justify-between"><span>Updated:</span><span className="text-slate-200">21 min ago</span></div>
                <div className="flex justify-between"><span>Connector:</span><span className="text-emerald-400 font-bold">Healthy (99.8%)</span></div>
              </div>
            </div>

            {/* Card 3: IMD */}
            <div className="bg-[#0b1420] border border-[#1c2838] p-3.5 rounded-xl space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">IMD</h4>
                  <p className="text-[9px] text-slate-400">Marine Weather</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  ● LIVE
                </span>
              </div>

              <div className="text-[10px] space-y-1 text-slate-400 pt-2 border-t border-[#1c2838]">
                <div className="flex justify-between"><span>Updated:</span><span className="text-slate-200">14 min ago</span></div>
                <div className="flex justify-between"><span>Connector:</span><span className="text-emerald-400 font-bold">Healthy (100%)</span></div>
              </div>
            </div>

            {/* Card 4: Bhuvan */}
            <div className="bg-[#0b1420] border border-[#1c2838] p-3.5 rounded-xl space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Bhuvan</h4>
                  <p className="text-[9px] text-slate-400">GIS Layers</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  CACHED
                </span>
              </div>

              <div className="text-[10px] space-y-1 text-slate-400 pt-2 border-t border-[#1c2838]">
                <div className="flex justify-between"><span>Updated:</span><span className="text-slate-200">Yesterday</span></div>
                <div className="flex justify-between"><span>Connector:</span><span className="text-emerald-400 font-bold">Healthy (98.5%)</span></div>
              </div>
            </div>

            {/* Card 5: NOAA */}
            <div className="bg-[#0b1420] border border-[#1c2838] p-3.5 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">NOAA</h4>
                  <p className="text-[9px] text-slate-400">Secondary Ocean Data</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#050c18] text-slate-400 border border-[#1c2838] font-bold">
                  AVAILABLE
                </span>
              </div>

              <button className="w-full py-1 bg-[#050c18] hover:bg-[#122438] text-slate-300 border border-[#1c2838] text-[10px] font-bold uppercase rounded transition">
                ACTIVATE
              </button>
            </div>

            {/* Card 6: COPERNICUS */}
            <div className="bg-[#0b1420] border border-[#1c2838] p-3.5 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">COPERNICUS</h4>
                  <p className="text-[9px] text-slate-400">Ocean Forecast</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#050c18] text-slate-400 border border-[#1c2838] font-bold">
                  AVAILABLE
                </span>
              </div>

              <button className="w-full py-1 bg-[#050c18] hover:bg-[#122438] text-slate-300 border border-[#1c2838] text-[10px] font-bold uppercase rounded transition">
                ACTIVATE
              </button>
            </div>
          </div>

        </div>

        {/* Right 4-Cols: Failover Box & Global Metrics Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Live Failover Box matching image 3 */}
          <div className="bg-[#0b1420] border border-[#1c2838] p-4 rounded-xl space-y-3 font-mono">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              LIVE FAILURE → LAST-KNOWN CACHED STATE
            </span>

            <div className="bg-[#180a0a] border border-red-900 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-red-200">MOSDAC LIVE</h5>
                <p className="text-[10px] text-red-400">Connection Timeout</p>
              </div>
            </div>

            <div className="w-px h-3 bg-slate-700 mx-auto"></div>

            <div className="bg-[#061424] border border-cyan-800 p-3 rounded-lg flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-cyan-200">REDIS CACHE</h5>
                <p className="text-[10px] text-cyan-400">Active Fallback</p>
              </div>
            </div>

            <div className="bg-[#050c18] border border-[#1c2838] p-2.5 rounded-lg text-[10px]">
              <span className="text-slate-400 block font-sans font-semibold">Using last valid SST</span>
              <span className="text-slate-200 font-bold">Updated 42 minutes ago</span>
            </div>
          </div>

          {/* Global Metrics Box matching image 3 */}
          <div className="bg-[#0b1420] border border-[#1c2838] p-4 rounded-xl space-y-3">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
              Global Metrics
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1c2838]">
                <span className="text-slate-400">Total Ingestion Rate</span>
                <span className="text-slate-100 font-bold">4.2 GB/hr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1c2838]">
                <span className="text-slate-400">Active Connectors</span>
                <span className="text-cyan-400 font-bold">4 / 6</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">System Uptime</span>
                <span className="text-emerald-400 font-bold">99.99%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
