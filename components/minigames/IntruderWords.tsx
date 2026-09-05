'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import { IntruderChallenge } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface IntruderWordsProps {
  challenges: IntruderChallenge[];
  onComplete: (stars: number) => void;
}

export default function IntruderWords({ challenges, onComplete }: IntruderWordsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [mistakes, setMistakes] = useState(0);

  const currentChallenge = challenges?.[currentIndex] || challenges?.[0];

  useEffect(() => {
    setSelectedIndex(null);
    setIsCorrect(null);
    setFeedback('');
    if (currentChallenge?.instruction) {
      tts.speak(currentChallenge.instruction);
    }
  }, [currentIndex, currentChallenge]);

  const handleSelectOption = (index: number) => {
    if (isCorrect || !currentChallenge?.options) return;

    setSelectedIndex(index);
    const chosen = currentChallenge.options[index];
    if (!chosen) return;

    if (chosen.isIntruder) {
      // Found the intruder!
      setIsCorrect(true);
      setFeedback(chosen.reason);
      audioSynth.playCelebration();
      tts.speak(`¡Muy bien! Descubriste la intrusa: ${chosen.text}. ${chosen.reason}`);

      setTimeout(() => {
        if (challenges && currentIndex + 1 < challenges.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
          onComplete(stars);
        }
      }, 2200);
    } else {
      // Wrong pick
      setIsCorrect(false);
      setFeedback(chosen.reason);
      setMistakes((m) => m + 1);
      audioSynth.playError();
      tts.speak(`No es la palabra intrusa. ${chosen.reason}`);
    }
  };

  const handleSpeakInstruction = () => {
    if (!currentChallenge?.instruction) return;
    audioSynth.playClick();
    tts.speak(currentChallenge.instruction);
  };

  if (!challenges || !currentChallenge) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl text-center text-amber-300 font-bold">
        Cargando desafío de intrusas...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔍</span>
          <div>
            <h3 className="text-lg font-black text-amber-300">Caza de Palabras Intrusas</h3>
            <p className="text-xs text-slate-400">Desafío {currentIndex + 1} de {challenges.length}</p>
          </div>
        </div>
        <button
          onClick={handleSpeakInstruction}
          className="bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Volume2 className="w-4 h-4" /> Escuchar
        </button>
      </div>

      {/* Instruction Card */}
      <div className="bg-slate-950 border-2 border-amber-500/30 rounded-2xl p-4 text-center">
        <p className="text-sm sm:text-base text-amber-200 font-bold leading-relaxed">
          {currentChallenge.instruction}
        </p>
      </div>

      {/* Word Options Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {currentChallenge.options?.map((opt, idx) => {
          const isSelected = selectedIndex === idx;

          let btnStyles = 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100';

          if (isSelected && isCorrect === true) {
            btnStyles = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-4 ring-emerald-400/40';
          } else if (isSelected && isCorrect === false) {
            btnStyles = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-4 ring-rose-500/40 animate-shake';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isCorrect === true}
              className={`p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${btnStyles}`}
            >
              <span className="text-4xl">{opt.pictogram}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-center text-xs sm:text-sm font-bold border flex items-center justify-center gap-2 ${
            isCorrect
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500 text-rose-300'
          }`}
        >
          {isCorrect ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
