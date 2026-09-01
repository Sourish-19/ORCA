import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FishermanView } from './components/FishermanView';
import { AnalystView } from './components/AnalystView';
import { ORCAResponse, DemoScenario } from './types';
import { AlertTriangle, Compass, Send } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<'fisherman' | 'analyst'>('analyst');
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [currentResponse, setCurrentResponse] = useState<ORCAResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');

  // Fetch pre-configured demo scenarios on launch
  useEffect(() => {
    fetch('/api/demo-scenarios')
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data);
        // Automatically load first scenario on launch for instant rendering
        if (data && data.length > 0) {
          handleRunQuery(data[0].query);
        }
      })
      .catch(() => {
        const defaults = [
          {
            id: 'scenario_01',
            title: 'Chennai Fishing Recommendation (Clear Weather)',
            query: 'Where should I fish tomorrow near Chennai?',
            location: 'Chennai',
            expected_outcome: 'Safe recommendation at Chennai Offshore East'
          },
          {
            id: 'scenario_02',
            title: 'Vizag Severe Cyclone Warning (Safety Veto Triggered)',
            query: 'Can I take my boat out tomorrow near Vizag?',
            location: 'Visakhapatnam',
            expected_outcome: 'SAFETY VETO ACTIVE'
          }
        ];
        setScenarios(defaults);
        handleRunQuery(defaults[0].query);
      });
  }, []);

  const handleRunQuery = async (queryText: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data: ORCAResponse = await res.json();
      setCurrentResponse(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = (scenario: DemoScenario) => {
    handleRunQuery(scenario.query);
  };

  const handleCustomQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      handleRunQuery(customQuery.trim());
    }
  };

  const isVeto = currentResponse?.safety?.veto_triggered;

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 font-sans flex flex-col">
      {/* Top Bar & Left Sidebar Navigation */}
      <Header
        mode={mode}
        setMode={setMode}
        scenarios={scenarios}
        onSelectScenario={handleSelectScenario}
        onQuerySubmit={handleRunQuery}
        isLoading={isLoading}
      />

      {/* Main Canvas Area Offset for Left Sidebar (pl-12) */}
      <main className="pl-12 pt-2 p-3 flex-1 flex flex-col space-y-2 max-w-[1600px] w-full mx-auto">
        
        {/* Natural Language Query Bar */}
        <div className="bg-[#0b172a] border border-[#1b2b45] p-2 rounded-xl flex items-center justify-between gap-3 shadow-lg">
          <form onSubmit={handleCustomQuerySubmit} className="flex items-center gap-2 flex-1">
            <Compass className="w-4 h-4 text-cyan-400 ml-2" />
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Type natural language marine query e.g. 'Where should I fish tomorrow near Chennai?'..."
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !customQuery.trim()}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-md flex items-center gap-1 transition"
            >
              <Send className="w-3 h-3" />
              Query
            </button>
          </form>

          {/* Quick Status Indicator */}
          {currentResponse && (
            <div className="flex items-center gap-2 pr-2">
              <span className="text-[10px] font-mono text-slate-400">
                Data Mode: <strong className="text-cyan-300">{currentResponse.data_mode}</strong>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isVeto ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {isVeto ? 'SAFETY VETO' : 'SAFE'}
              </span>
            </div>
          )}
        </div>

        {/* Loading Spinner Bar */}
        {isLoading && (
          <div className="bg-[#0b172a] border border-cyan-500/50 p-2.5 rounded-xl flex items-center justify-center gap-2 text-cyan-400 text-xs font-semibold shadow-lg animate-pulse">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Executing Multi-Agent Orchestrator (Intent → GeoData → Hazard → Reasoning → Safety → Synthesis)...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950 border border-red-800 p-2.5 rounded-xl text-red-200 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Main Active View */}
        {mode === 'analyst' ? (
          <AnalystView response={currentResponse} />
        ) : (
          <FishermanView
            response={currentResponse}
            onQuerySubmit={handleRunQuery}
            isLoading={isLoading}
          />
        )}

      </main>

      <footer className="pl-12 bg-[#030811] border-t border-[#1b2b45] py-2 px-4 text-center text-[10px] text-slate-500">
        ORCA (Marine EcOsystem Reasoning with Collaborative Agents) • SIH26176 Prototype
      </footer>
    </div>
  );
}

export default App;
