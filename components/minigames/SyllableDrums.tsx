'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { SyllableWord } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';
import { storage } from '@/lib/storage';
import { aiLearningEngine } from '@/lib/ai-learning-engine';

interface SyllableDrumsProps {
  words: SyllableWord[];
  onComplete: (stars: number) => void;
}

export default function SyllableDrums({ words, onComplete }: SyllableDrumsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tappedSyllables, setTappedSyllables] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [totalMistakes, setTotalMistakes] = useState(0);

  const currentWord = words?.[currentIndex] || words?.[0];

  useEffect(() => {
    setTappedSyllables([]);
    setIsSuccess(false);
    if (currentWord?.word) {
      tts.speak(`¡Sigue el ritmo! Separa la palabra: ${currentWord.word}`);
    }
  }, [currentIndex, currentWord]);

  const handleDrumTap = (sylIndex: number) => {
    if (!currentWord?.syllables) return;
    const expectedNextIndex = tappedSyllables.length;
    const profile = storage.getActiveProfile();

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

        if (profile) {
          aiLearningEngine.recordWordAttempt(profile.id, currentWord.word, true);
        }

        setTimeout(() => {
          if (words && currentIndex + 1 < words.length) {
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
      if (currentWord.syllables[expectedNextIndex]) {
        tts.speak(`Toca primero la sílaba ${currentWord.syllables[expectedNextIndex]}`);
      }

      if (profile) {
        aiLearningEngine.recordWordAttempt(profile.id, currentWord.word, false);
      }
    }
  };

  const handleHearFullWord = () => {
    if (!currentWord?.syllables) return;
    audioSynth.playClick();
    tts.speakSyllables(currentWord.syllables);
  };

  if (!words || !currentWord) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl text-center text-emerald-300 font-bold">
        Cargando tambores silábicos...
      </div>
    );
  }

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
          className="bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Volume2 className="w-4 h-4" /> Escuchar
        </button>
      </div>

      {/* Target Word Display */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-center space-y-3 shadow-inner">
        <div className="text-6xl sm:text-7xl">{currentWord.pictogram}</div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider">
          {currentWord.word.toUpperCase()}
        </div>
        <p className="text-xs text-slate-400 font-medium">&ldquo;{currentWord.hint}&rdquo;</p>
      </div>

      {/* Interactive Syllable Drums */}
      <div className="space-y-3">
        <p className="text-xs text-slate-300 text-center font-bold">
          Toca los tambores en orden para formar la palabra:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentWord.syllables?.map((syl, idx) => {
            const isTapped = tappedSyllables.includes(idx);
            const isNext = idx === tappedSyllables.length;

            return (
              <button
                key={idx}
                onClick={() => handleDrumTap(idx)}
                disabled={isTapped || isSuccess}
                className={`py-4 px-3 rounded-2xl font-black text-lg sm:text-xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg ${
                  isTapped
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 opacity-60 scale-95'
                    : isNext
                    ? 'bg-gradient-to-b from-emerald-500 to-teal-600 border-emerald-300 text-slate-950 animate-pulse scale-102 ring-4 ring-emerald-400/30'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <span className="text-xl">🪘</span>
                <span>{syl.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isSuccess && (
        <div className="bg-emerald-950 border-2 border-emerald-400 rounded-2xl p-4 text-center text-emerald-300 font-black flex items-center justify-center gap-2 animate-bounce-slow">
          <CheckCircle2 className="w-5 h-5" />
          <span>¡Excelente Ritmo! Palabra Completada</span>
        </div>
      )}
    </div>
  );
}
