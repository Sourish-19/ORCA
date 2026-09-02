import React, { useState } from 'react';
import { Mic, Volume2, ShieldCheck, AlertTriangle, MapPin, Compass, Navigation, Send, Languages, Anchor, Clock, Play, Home, Activity } from 'lucide-react';
import Dock from '../components/ui/dock';
import { ORCAResponse } from '../types';

interface FishermanPageProps {
  response: ORCAResponse | null;
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export const FishermanPage: React.FC<FishermanPageProps> = ({ response, onQuerySubmit, isLoading }) => {
  const [lang, setLang] = useState<'ta' | 'en'>('ta');
  const [dayToggle, setDayToggle] = useState<'today' | 'tomorrow'>('tomorrow');
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isVeto = response?.safety?.veto_triggered;
  const rec = response?.top_recommendation;

  const handleVoiceQuery = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onQuerySubmit('Where should I fish tomorrow near Chennai?');
    }, 1500);
  };

  const handlePlayAudio = () => {
    if (!response?.audio_narrative_text) return;
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(response.audio_narrative_text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  const fishermanDockItems = [
    {
      icon: Home,
      label: "Advisory Home",
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    {
      icon: Mic,
      label: "Tamil Voice Query",
      onClick: handleVoiceQuery
    },
    {
      icon: Compass,
      label: "Interactive GIS Map",
      onClick: () => window.location.href = '/marine-map'
    },
    {
      icon: AlertTriangle,
      label: "Safety Veto Alerts",
      onClick: () => window.location.href = '/safety-veto'
    },
    {
      icon: Activity,
      label: "Analyst Cockpit",
      onClick: () => window.location.href = '/dashboard'
    }
  ];

  return (
    <div className="max-w-md mx-auto space-y-4 py-2 pb-24 selection:bg-cyan-500 font-sans relative">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Anchor className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-black text-cyan-400 tracking-tight">ORCA</h1>
        </div>

        <div className="bg-[#050c18] border border-[#1c2838] p-1 rounded-lg flex items-center gap-1 text-xs">
          <button
            onClick={() => setLang('ta')}
            className={`px-3 py-1 rounded font-bold transition ${
              lang === 'ta' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded font-bold transition ${
              lang === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Voice Query Card */}
      <div className="bg-[#0b1420] border border-[#1c2838] p-6 rounded-2xl text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100">
          {lang === 'ta' ? 'எங்கு மீன் பிடிக்கலாம்?' : 'Where should I fish?'}
        </h2>

        <button
          onClick={handleVoiceQuery}
          disabled={isLoading || isListening}
          className={`w-24 h-24 rounded-full mx-auto flex flex-col items-center justify-center transition shadow-2xl ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/30'
          }`}
        >
          <Mic className="w-9 h-9" />
        </button>

        <p className="text-xs font-mono font-bold text-slate-400 tracking-wider">
          {isListening ? 'LISTENING...' : 'TAP TO SPEAK'}
        </p>

        <button
          onClick={() => onQuerySubmit('Where should I fish tomorrow near Chennai?')}
          className="px-4 py-1.5 rounded-full bg-[#050c18] text-cyan-300 border border-[#1c2838] text-xs font-bold transition inline-flex items-center gap-1.5"
        >
          <span>⌨ Type instead</span>
        </button>
      </div>

      {/* Advisory Section Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              CHENNAI COAST
            </span>
            <h3 className="text-lg font-bold text-slate-100">Advisory</h3>
          </div>

          <div className="bg-[#050c18] border border-[#1c2838] p-1 rounded-full flex items-center text-xs font-bold font-mono">
            <button
              onClick={() => setDayToggle('today')}
              className={`px-3 py-1 rounded-full transition ${
                dayToggle === 'today' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDayToggle('tomorrow')}
              className={`px-3 py-1 rounded-full transition ${
                dayToggle === 'tomorrow' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Main Advisory Recommendation Card */}
        <div
          className={`p-4 rounded-2xl border-2 space-y-4 shadow-2xl transition ${
            isVeto
              ? 'bg-red-950/80 border-red-500 text-red-100'
              : 'bg-[#091522] border-emerald-500/80 text-slate-100'
          }`}
        >
          {/* Header Banner */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            {isVeto ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h4 className="text-base font-extrabold uppercase tracking-wide">
              {isVeto
                ? lang === 'ta' ? '🚨 கடலுக்கு செல்ல வேண்டாம்' : '🚨 DO NOT VENTURE TO SEA'
                : lang === 'ta' ? '✓ மீன்பிடிக்க பாதுகாப்பானது (SAFE TO FISH)' : '✓ SAFE TO FISH'}
            </h4>
          </div>

          {/* Location Name */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              RECOMMENDED LOCATION
            </span>
            <h3 className="text-xl font-black text-slate-100 mt-0.5">
              {rec?.sector_name || 'Chennai Offshore East'}
            </h3>
          </div>

          {/* 3 Metric Boxes */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#050c18] border border-[#1c2838] p-2.5 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase">SUITABILITY</span>
              <strong className="text-cyan-300 text-base font-mono">88%</strong>
            </div>

            <div className="bg-[#050c18] border border-[#1c2838] p-2.5 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase">DISTANCE</span>
              <strong className="text-cyan-300 text-base font-mono">38km</strong>
            </div>

            <div className="bg-[#050c18] border border-[#1c2838] p-2.5 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase">HEADING</span>
              <strong className="text-cyan-300 text-base font-mono">107°</strong>
            </div>
          </div>

          {/* Map Preview Canvas */}
          <div className="h-32 bg-[#040a14] rounded-xl overflow-hidden border border-[#1c2838] relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]"></div>
            <div className="relative z-10 w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center animate-ping">
              <MapPin className="w-5 h-5 text-cyan-300" />
            </div>
          </div>

          {/* Listen to Advisory Audio Player Button */}
          <button
            onClick={handlePlayAudio}
            disabled={isPlayingAudio}
            className="w-full py-3 rounded-xl bg-[#050c18] hover:bg-[#0c1828] border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center justify-between px-4 transition"
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Listen to advisory</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Tamil • 1:42</span>
          </button>

          {/* VIEW ROUTE Button */}
          <button
            onClick={() => window.location.href = '/marine-map'}
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-400/20"
          >
            <Navigation className="w-4 h-4 stroke-[3]" />
            <span>VIEW ROUTE</span>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Animated Dock Navigation Bar for Fisherman Mode */}
      <div className="fixed bottom-2 left-0 right-0 z-50 px-4 max-w-md mx-auto pointer-events-auto">
        <Dock items={fishermanDockItems} />
      </div>

    </div>
  );
};
