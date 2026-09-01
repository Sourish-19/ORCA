import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, ShieldAlert, Filter } from 'lucide-react';
import alertsData from '../data/mock/alerts.json';

export const AlertsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'MODERATE' | 'INFO'>('ALL');

  const filteredAlerts = alertsData.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  return (
    <div className="space-y-4">
      <div className="bg-[#0b172a] border border-[#1b2b45] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950 text-red-400 border border-red-800">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Marine Hazard Alerts Feed</h2>
            <p className="text-xs text-slate-400">Real-time official warnings from IMD, INCOIS, and Joint Coastal Advisories</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#070f1e] p-1 rounded-lg border border-[#1b2b45] text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              filter === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Alerts ({alertsData.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              filter === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('MODERATE')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              filter === 'MODERATE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Moderate
          </button>
          <button
            onClick={() => setFilter('INFO')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              filter === 'INFO' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isMod = alert.severity === 'MODERATE';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition space-y-2 ${
                isCritical
                  ? 'bg-red-950/40 border-red-700 text-red-100'
                  : isMod
                  ? 'bg-amber-950/30 border-amber-800 text-amber-100'
                  : 'bg-[#0b172a] border-[#1b2b45] text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isCritical
                        ? 'bg-red-900 text-white border border-red-600'
                        : isMod
                        ? 'bg-amber-900 text-amber-200 border border-amber-700'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{alert.source}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{new Date(alert.issuedAt).toLocaleTimeString()}</span>
              </div>

              <h3 className="text-sm font-bold">{alert.title}</h3>
              <p className="text-xs opacity-90 leading-relaxed">{alert.description}</p>

              <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-slate-800 opacity-80">
                <span>Sector: <strong>{alert.affectedArea}</strong></span>
                <span className="font-bold">Required Action: {alert.actionRequired}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
