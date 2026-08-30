'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { SyllableWord } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface SyllableDrumsProps {
  words: SyllableWord[];
  onComplete: (stars: number) => void;
}

export default function SyllableDrums({ words, onComplete }: SyllableDrumsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tappedSyllables, setTappedSyllables] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [totalMistakes, setTotalMistakes] = useState(0);

  const currentWord = words[currentIndex] || words[0];

  useEffect(() => {
    setTappedSyllables([]);
    setIsSuccess(false);
    // Welcome audio for the current word
    tts.speak(`¡Sigue el ritmo! Separa la palabra: ${currentWord.word}`);
  }, [currentIndex]);

  const handleDrumTap = (sylIndex: number) => {
    const expectedNextIndex = tappedSyllables.length;

    if (sylIndex === expectedNextIndex) {
      // Correct syllable in order
      const drumTypes: ('low' | 'high' | 'snare')[] = ['low', 'high', 'snare', 'high'];
      audioSynth.playDrum(drumTypes[sylIndex % drumTypes.length]);
      audioSynth.playChime(sylIndex);

      const nextTapped = [...tappedSyllables, sylIndex];
      setTappedSyllables(nextTapped);

      // Pronounce this syllable
      tts.speak(currentWord.syllables[sylIndex], { rate: 1.0 });

      if (nextTapped.length === currentWord.syllables.length) {
        // Word complete!
        setIsSuccess(true);
        audioSynth.playCelebration();
        tts.speak(`¡Excelente! ${currentWord.word} tiene ${currentWord.syllables.length} sílabas.`);

        setTimeout(() => {
          if (currentIndex + 1 < words.length) {
            setCurrentIndex(currentIndex + 1);
          } else {
            const stars = totalMistakes === 0 ? 3 : totalMistakes <= 2 ? 2 : 1;
            onComplete(stars);
          }
        }, 1800);
      }
    } else if (!tappedSyllables.includes(sylIndex)) {
      // Wrong order tap
      audioSynth.playError();
      setTotalMistakes((m) => m + 1);
      tts.speak(`Toca primero la sílaba ${currentWord.syllables[expectedNextIndex]}`);
    }
  };

  const handleHearFullWord = () => {
    audioSynth.playClick();
    tts.speakSyllables(currentWord.syllables);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce">🥁</span>
          <div>
            <h3 className="text-lg font-black text-emerald-300">Tambores Silábicos</h3>
            <p className="text-xs text-slate-400">Palabra {currentIndex + 1} de {words.length}</p>
          </div>
        </div>
        <button
          onClick={handleHearFullWord}
          className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Volume2 className="w-4 h-4" /> Escuchar Ritmo
        </button>
      </div>

      {/* Main Pictogram & Word Card */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-inner relative overflow-hidden">
        <div className="text-6xl sm:text-7xl animate-pulse">{currentWord.pictogram}</div>
        
        {/* Syllables visualizer */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
          {currentWord.syllables.map((syl, idx) => {
            const isTapped = tappedSyllables.includes(idx);
            const isNext = tappedSyllables.length === idx;
            return (
              <span
                key={idx}
                className={`px-3 sm:px-4 py-2 rounded-2xl text-lg sm:text-2xl font-black transition-all transform ${
                  isTapped
                    ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg'
                    : isNext
                    ? 'bg-amber-400/20 text-amber-300 border-2 border-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {syl.toUpperCase()}
              </span>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {currentWord.hint}
        </p>

        {isSuccess && (
          <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center gap-2 text-emerald-300 font-black text-xl animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span>¡Ritmo Perfecto!</span>
          </div>
        )}
      </div>

      {/* Drum Beat Buttons */}
      <div className="space-y-3">
        <p className="text-center text-xs font-bold text-slate-300">
          Toca los tambores en orden para marcar cada sílaba:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentWord.syllables.map((syl, idx) => {
            const isTapped = tappedSyllables.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleDrumTap(idx)}
                disabled={isTapped || isSuccess}
                className={`p-4 rounded-2xl font-black text-lg sm:text-xl border-b-4 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  isTapped
                    ? 'bg-emerald-700 border-emerald-900 text-emerald-100 opacity-80 cursor-default'
                    : 'bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-amber-800 text-slate-950 shadow-lg hover:scale-105'
                }`}
              >
                <span>{syl.toUpperCase()}</span>
                <span className="text-[10px] font-bold text-amber-950 bg-amber-300/80 px-2 py-0.5 rounded-full">
                  👏 Golpe {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
