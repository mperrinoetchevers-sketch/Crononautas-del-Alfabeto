'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, AlertCircle, CheckCircle, Search } from 'lucide-react';
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

  const currentChallenge = challenges[currentIndex] || challenges[0];

  useEffect(() => {
    setSelectedIndex(null);
    setIsCorrect(null);
    setFeedback('');
    tts.speak(currentChallenge.instruction);
  }, [currentIndex]);

  const handleSelectOption = (index: number) => {
    if (isCorrect) return;

    setSelectedIndex(index);
    const chosen = currentChallenge.options[index];

    if (chosen.isIntruder) {
      // Found the intruder!
      setIsCorrect(true);
      setFeedback(chosen.reason);
      audioSynth.playCelebration();
      tts.speak(`¡Muy bien! Descubriste la intrusa: ${chosen.text}. ${chosen.reason}`);

      setTimeout(() => {
        if (currentIndex + 1 < challenges.length) {
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
    audioSynth.playClick();
    tts.speak(currentChallenge.instruction);
  };

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
          <Volume2 className="w-4 h-4" /> Escuchar Misión
        </button>
      </div>

      {/* Challenge Instruction Prompt */}
      <div className="bg-slate-950 border-2 border-amber-500/30 rounded-2xl p-4 text-center">
        <p className="text-sm sm:text-base font-bold text-amber-200">
          {currentChallenge.instruction}
        </p>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {currentChallenge.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`group p-4 sm:p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95 ${
                isSelected && isCorrect
                  ? 'bg-emerald-950/80 border-emerald-400 scale-105 shadow-xl'
                  : isSelected && !isCorrect
                  ? 'bg-red-950/80 border-red-500 animate-shake'
                  : 'bg-slate-800/80 border-slate-700 hover:border-amber-400 hover:scale-102'
              }`}
            >
              <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                {opt.pictogram}
              </span>
              <span className="font-black text-base sm:text-lg text-slate-100 uppercase tracking-wide">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border text-xs sm:text-sm font-bold animate-fade-in ${
            isCorrect
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
              : 'bg-red-950/60 border-red-500 text-red-300'
          }`}
        >
          {isCorrect ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
