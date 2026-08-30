'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Gauge, Sparkles } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

export default function AudioController() {
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioSynth.setMuted(newMuted);
    if (!newMuted) {
      audioSynth.playClick();
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    tts.setRate(newRate);
    tts.speak(`Velocidad de lectura al ${Math.round(newRate * 100)} por ciento`);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          className={`p-1.5 rounded-lg transition-all ${
            isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-amber-300 hover:bg-slate-600'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Speed / Settings toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Ajustar velocidad de voz"
          className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-700/70 px-2 py-1 rounded-lg"
        >
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span>{rate}x</span>
        </button>
      </div>

      {/* Speed Slider Popover */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Velocidad de Voz
            </span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Tranquilo (0.7x)</span>
              <span className="font-bold text-white">{rate}x</span>
              <span>Rápido (1.2x)</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => handleRateChange(0.7)}
              className={`text-[10px] py-1 rounded font-bold ${rate === 0.7 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Lento
            </button>
            <button
              onClick={() => handleRateChange(0.9)}
              className={`text-[10px] py-1 rounded font-bold ${rate === 0.9 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Ideal
            </button>
            <button
              onClick={() => handleRateChange(1.1)}
              className={`text-[10px] py-1 rounded font-bold ${rate === 1.1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Rápido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
