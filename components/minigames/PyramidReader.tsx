'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Lock, Unlock, Sparkles, Check } from 'lucide-react';
import { PyramidChallenge } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface PyramidReaderProps {
  challenge: PyramidChallenge;
  onComplete: (stars: number) => void;
}

export default function PyramidReader({ challenge, onComplete }: PyramidReaderProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    setActiveStepIndex(0);
    setIsUnlocked(false);
    tts.speak(`Lectura en Pirámide: ${challenge.title}. Lee cada nivel para desbloquear el candado del castillo.`);
  }, [challenge]);

  const handleReadStep = (stepIdx: number) => {
    if (stepIdx !== activeStepIndex) return;

    audioSynth.playClick();
    const currentStep = challenge.steps[stepIdx];

    tts.speak(currentStep.text, {
      onEnd: () => {
        audioSynth.playChime(stepIdx);
        if (stepIdx + 1 < challenge.steps.length) {
          setActiveStepIndex(stepIdx + 1);
        } else {
          // Pyramid complete!
          setIsUnlocked(true);
          audioSynth.playUnlock();
          audioSynth.playCelebration();
          tts.speak(`¡Felicitaciones! Has completado la pirámide y revelado la palabra mágica: ${challenge.secretCodeWord}.`);
          setTimeout(() => {
            onComplete(3);
          }, 2400);
        }
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📐</span>
          <div>
            <h3 className="text-lg font-black text-purple-300">Lectura en Pirámide</h3>
            <p className="text-xs text-slate-400">{challenge.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-bold text-amber-300">
          {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
          <span>{isUnlocked ? '¡Abierto!' : 'Cerradura Real'}</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 text-center font-medium">
        Toca cada piso de la pirámide en orden para leerlo con Cronobot y abrir el candado:
      </p>

      {/* Pyramid Steps */}
      <div className="space-y-2.5 flex flex-col items-center">
        {challenge.steps.map((step, idx) => {
          const isCurrent = activeStepIndex === idx;
          const isPassed = idx < activeStepIndex;

          return (
            <button
              key={idx}
              onClick={() => handleReadStep(idx)}
              disabled={idx > activeStepIndex || isUnlocked}
              className={`w-full max-w-lg p-3 sm:p-4 rounded-2xl font-bold text-center border-2 transition-all transform flex items-center justify-between ${
                isCurrent
                  ? 'bg-purple-900/90 border-amber-400 text-yellow-100 scale-102 shadow-xl animate-pulse'
                  : isPassed
                  ? 'bg-slate-800/90 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-900/80 text-amber-300">
                Piso {idx + 1}
              </span>
              <span className="text-sm sm:text-base font-black tracking-wide flex-1 px-2">
                {step.text}
              </span>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {isPassed ? <Check className="w-4 h-4 text-emerald-400" /> : isCurrent ? <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" /> : '🔒'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secret Word Revealed */}
      {isUnlocked && (
        <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border-2 border-amber-400 p-5 rounded-2xl text-center space-y-1 animate-scale-up">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 uppercase">
            <Sparkles className="w-4 h-4" /> Palabra Secreta Descifrada
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-widest">
            {challenge.secretCodeWord}
          </div>
        </div>
      )}
    </div>
  );
}
