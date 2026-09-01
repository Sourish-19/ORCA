import React from 'react';
import { Activity, Database, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Server } from 'lucide-react';
import sourcesData from '../data/mock/sources.json';

export const DataHealthPage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Data Source Health & Pipeline Monitor</h2>
            <p className="text-xs text-slate-400">Status, connector latency, schema validation, and cache synchronization</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>ALL 6 DATA CONNECTORS OPERATIONAL</span>
        </div>
      </div>

      {/* Visual Ingestion Pipeline Diagram matching Stitch Data Health design */}
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          ORCA Data Ingestion Pipeline Architecture
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono py-3">
          <div className="bg-[#070f1e] border border-[#1b2b45] p-3 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="text-slate-400 block text-[10px]">STAGE 1</span>
            <span className="font-bold text-cyan-300">RAW SOURCES</span>
            <span className="text-[10px] text-slate-500 block mt-1">INCOIS • MOSDAC • IMD</span>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

          <div className="bg-[#070f1e] border border-[#1b2b45] p-3 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="text-slate-400 block text-[10px]">STAGE 2</span>
            <span className="font-bold text-cyan-300">CONNECTORS</span>
            <span className="text-[10px] text-slate-500 block mt-1">Async REST & FTP</span>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

          <div className="bg-[#070f1e] border border-[#1b2b45] p-3 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="text-slate-400 block text-[10px]">STAGE 3</span>
            <span className="font-bold text-cyan-300">NORMALIZATION</span>
            <span className="text-[10px] text-slate-500 block mt-1">Canonical Schema</span>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

          <div className="bg-[#070f1e] border border-[#1b2b45] p-3 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="text-slate-400 block text-[10px]">STAGE 4</span>
            <span className="font-bold text-cyan-300">QUALITY CHECK</span>
            <span className="text-[10px] text-slate-500 block mt-1">Freshness & Sanity</span>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0" />

          <div className="bg-[#070f1e] border border-emerald-800 p-3 rounded-lg text-center flex-1 min-w-[120px] bg-emerald-950/30">
            <span className="text-slate-400 block text-[10px]">STAGE 5</span>
            <span className="font-bold text-emerald-400">POSTGIS + REDIS</span>
            <span className="text-[10px] text-slate-500 block mt-1">ORCA Agents Ready</span>
          </div>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sourcesData.map((src) => (
          <div key={src.id} className="bg-[#0b172a] border border-[#1b2b45] hover:border-cyan-500/40 p-4 rounded-xl space-y-3 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">{src.name}</h3>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  src.status === 'LIVE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                ● {src.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium">{src.role}</p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#070f1e] p-2.5 rounded border border-[#1b2b45]">
              <div>
                <span className="text-slate-500 text-[10px] block">LAST UPDATED</span>
                <span className="text-slate-200">{src.lastUpdated}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">LATENCY</span>
                <span className="text-cyan-400">{src.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">RECORDS</span>
                <span className="text-slate-200">{src.recordCount}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DATA AGE</span>
                <span className="text-slate-200">{src.dataAgeMinutes} mins</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-400 font-mono font-bold">
              ✓ {src.connectorStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
