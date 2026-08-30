'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, ArrowRight, Trophy } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface StarCelebrationProps {
  isOpen: boolean;
  starsEarned: number; // 1, 2, 3
  title?: string;
  message?: string;
  artifactUnlocked?: {
    name: string;
    icon: string;
  };
  nextEraUnlocked?: string;
  onContinue: () => void;
}

export default function StarCelebration({
  isOpen,
  starsEarned,
  title = '¡Misión Cumplida, Crononauta!',
  message = '¡Has completado el desafío con éxito y reparado parte de la máquina del tiempo!',
  artifactUnlocked,
  nextEraUnlocked,
  onContinue,
}: StarCelebrationProps) {
  useEffect(() => {
    if (!isOpen) return;

    audioSynth.playCelebration();

    // Trigger confetti cannon
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#34d399', '#818cf8', '#f472b6'],
      });
    } catch {}

    const ttsText = `${title}. Ganaste ${starsEarned} estrellas. ${artifactUnlocked ? `¡Desbloqueaste el artefacto ${artifactUnlocked.name}!` : ''}`;
    tts.speak(ttsText);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-scale-up">
        {/* Animated Trophy Header */}
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-4xl shadow-xl animate-bounce">
            🏆
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {message}
          </p>
        </div>

        {/* Stars Earned */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= starsEarned;
            return (
              <div
                key={starIdx}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all transform ${
                  isEarned
                    ? 'bg-amber-400/20 border-amber-400 text-yellow-300 scale-110 shadow-lg animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-600'
                }`}
              >
                <Star className={`w-8 h-8 ${isEarned ? 'fill-yellow-400 text-yellow-300' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Artifact Piece Unlocked */}
        {artifactUnlocked && (
          <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border-2 border-indigo-400/50 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-inner">
            <span className="text-3xl animate-pulse">{artifactUnlocked.icon}</span>
            <div className="text-left">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">¡Nuevo Artefacto Temporal!</span>
              <h4 className="text-sm font-black text-amber-300">{artifactUnlocked.name}</h4>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={() => {
            audioSynth.playClick();
            onContinue();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>Continuar Aventura</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
