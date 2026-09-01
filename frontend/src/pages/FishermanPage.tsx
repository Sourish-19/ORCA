import React, { useState } from 'react';
import { Mic, Volume2, ShieldCheck, AlertTriangle, MapPin, Compass, Navigation, Send, Languages } from 'lucide-react';
import { ORCAResponse } from '../types';

interface FishermanPageProps {
  response: ORCAResponse | null;
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export const FishermanPage: React.FC<FishermanPageProps> = ({ response, onQuerySubmit, isLoading }) => {
  const [lang, setLang] = useState<'ta' | 'en'>('ta');
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

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-2">
      
      {/* Top Language & Quick Controls */}
      <div className="bg-[#0b172a] border border-[#1b2b45] p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Language / மொழி:</span>
        </div>
        <div className="bg-[#070f1e] p-1 rounded-lg border border-[#1b2b45] flex items-center gap-1 text-xs">
          <button
            onClick={() => setLang('ta')}
            className={`px-3 py-1 rounded font-bold transition ${
              lang === 'ta' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            தமிழ் (Tamil)
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded font-bold transition ${
              lang === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Large Voice Query Button for Outdoor / Sea Operations */}
      <div className="bg-[#0b172a] border border-cyan-500/40 p-6 rounded-2xl text-center space-y-3 shadow-2xl">
        <h2 className="text-base font-extrabold text-slate-100">
          {lang === 'ta' ? 'கேளுங்கள் ORCA (குரல் பதிவு)' : 'Ask ORCA (Voice Assistant)'}
        </h2>

        <button
          onClick={handleVoiceQuery}
          disabled={isLoading || isListening}
          className={`w-full py-5 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 transition shadow-xl ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-cyan-600/30'
          }`}
        >
          <Mic className="w-7 h-7 animate-bounce" />
          <span>{isListening ? 'கேட்கிறது... (Listening)' : lang === 'ta' ? 'பேச தட்டவும் (Tap to Speak)' : 'Tap to Speak'}</span>
        </button>
      </div>

      {/* Primary Safety Clearance Banner */}
      <div
        className={`p-5 rounded-2xl border-2 shadow-2xl transition ${
          isVeto
            ? 'bg-red-950/70 border-red-500 text-red-100'
            : 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {isVeto ? <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" /> : <ShieldCheck className="w-8 h-8 text-emerald-400" />}
          <div>
            <h3 className="text-lg font-extrabold">
              {isVeto
                ? lang === 'ta' ? '🚨 கடலுக்கு செல்ல வேண்டாம் (SAFETY VETO)' : '🚨 DO NOT VENTURE TO SEA (SAFETY VETO)'
                : lang === 'ta' ? '✓ மீன்பிடிக்க பாதுகாப்பானது (SAFE TO FISH)' : '✓ SAFE TO FISH'}
            </h3>
            <p className="text-xs mt-1 text-slate-200">
              {response?.safety?.safety_summary || 'Marine conditions safe for navigation and fishing operations.'}
            </p>
          </div>
        </div>

        {/* Audio Player Button */}
        <button
          onClick={handlePlayAudio}
          disabled={isPlayingAudio}
          className="mt-4 w-full py-3 bg-[#070f1e] hover:bg-[#0d1728] border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>{isPlayingAudio ? 'குரல் ஒலிபரப்பு நடக்கிறது...' : lang === 'ta' ? 'தமிழ் குரல் தகவலைக் கேட்கவும் (Listen Tamil Audio)' : 'Listen Audio Narrative'}</span>
        </button>
      </div>

      {/* Recommended Zone Card */}
      {rec && !isVeto && (
        <div className="bg-[#0b172a] border border-[#1b2b45] p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2b45]">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {lang === 'ta' ? 'பரிந்துரைக்கப்பட்ட பகுதி' : 'RECOMMENDED FISHING ZONE'}
            </span>
            <span className="text-xl font-extrabold text-emerald-400">88%</span>
          </div>

          <h3 className="text-lg font-bold text-slate-100">{rec.sector_name}</h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#070f1e] p-2.5 rounded-lg border border-[#1b2b45]">
              <span className="text-[10px] text-slate-400 block">தொலைவு (Distance)</span>
              <strong className="text-cyan-300 font-mono text-sm">{rec.distance_km} km</strong>
            </div>
            <div className="bg-[#070f1e] p-2.5 rounded-lg border border-[#1b2b45]">
              <span className="text-[10px] text-slate-400 block">திசை (Bearing)</span>
              <strong className="text-cyan-300 font-mono text-sm">{rec.bearing_deg}° SE</strong>
            </div>
            <div className="bg-[#070f1e] p-2.5 rounded-lg border border-[#1b2b45]">
              <span className="text-[10px] text-slate-400 block">ஆழம் (Depth)</span>
              <strong className="text-cyan-300 font-mono text-sm">{rec.depth_m} m</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
