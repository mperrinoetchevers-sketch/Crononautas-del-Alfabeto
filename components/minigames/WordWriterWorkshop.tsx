'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Sparkles, CheckCircle2, Delete, HelpCircle, ArrowRight, PenTool } from 'lucide-react';
import { WritingChallenge } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface WordWriterWorkshopProps {
  challenge: WritingChallenge;
  onComplete: (stars: number) => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const ACCENT_MAP: Record<string, string> = {
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
};

// Normalize accents for friendly comparison
function normalizeLetter(l: string): string {
  return ACCENT_MAP[l.toUpperCase()] || l.toUpperCase();
}

export default function WordWriterWorkshop({ challenge, onComplete }: WordWriterWorkshopProps) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [isWordSuccess, setIsWordSuccess] = useState(false);
  const [totalMistakes, setTotalMistakes] = useState(0);

  const currentWordObj = challenge.words[currentWordIdx] || challenge.words[0];
  const targetLetters = currentWordObj.word.toUpperCase().split('');

  // Setup word when index changes
  useEffect(() => {
    setTypedLetters([]);
    setIsWordSuccess(false);
    tts.speak(`Taller de escritura: Escribe la palabra ${currentWordObj.word}.`);
  }, [currentWordIdx, currentWordObj]);

  const handleLetterPress = useCallback((letter: string) => {
    if (isWordSuccess) return;

    const nextSlotIndex = typedLetters.length;
    if (nextSlotIndex >= targetLetters.length) return;

    const expectedLetter = targetLetters[nextSlotIndex];

    // Smart comparison (matches normalized or exact letter)
    const isCorrect =
      letter.toUpperCase() === expectedLetter ||
      normalizeLetter(letter) === normalizeLetter(expectedLetter);

    if (isCorrect) {
      audioSynth.playKeyStroke();
      const updated = [...typedLetters, expectedLetter];
      setTypedLetters(updated);

      // Pronounce letter phoneme
      tts.speak(expectedLetter, { rate: 1.2 });

      // Check if word completed
      if (updated.length === targetLetters.length) {
        setIsWordSuccess(true);
        audioSynth.playWordComplete();
        tts.speak(`¡Excelente! ¡${currentWordObj.word}! ${currentWordObj.hint}.`);

        setTimeout(() => {
          if (currentWordIdx + 1 < challenge.words.length) {
            setCurrentWordIdx((prev) => prev + 1);
          } else {
            // All words completed!
            audioSynth.playCelebration();
            tts.speak(`¡Felicidades! Has completado todas las palabras del taller de escritura.`);
            setTimeout(() => {
              const stars = totalMistakes === 0 ? 3 : totalMistakes <= 2 ? 2 : 1;
              onComplete(stars);
            }, 2000);
          }
        }, 1800);
      }
    } else {
      audioSynth.playError();
      setTotalMistakes((m) => m + 1);
      tts.speak(`La siguiente letra es ${expectedLetter}`);
    }
  }, [isWordSuccess, typedLetters, targetLetters, currentWordObj, currentWordIdx, challenge.words.length, totalMistakes, onComplete]);

  const handleBackspace = () => {
    if (typedLetters.length > 0 && !isWordSuccess) {
      audioSynth.playClick();
      setTypedLetters((prev) => prev.slice(0, -1));
    }
  };

  const handleHearClue = () => {
    audioSynth.playClick();
    tts.speak(
      `Palabra: ${currentWordObj.word}. Sílabas: ${currentWordObj.syllables.join(' - ')}. Pista: ${currentWordObj.hint}`
    );
  };

  const handleSyllableHint = () => {
    audioSynth.playClick();
    const nextSlot = typedLetters.length;
    if (nextSlot < targetLetters.length) {
      const nextChar = targetLetters[nextSlot];
      tts.speak(`Toca la letra ${nextChar}`);
    }
  };

  // Keyboard physical input listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(e.key)) {
        e.preventDefault();
        handleLetterPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLetterPress]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce">✍️</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-cyan-300">
              {challenge.title}
            </h3>
            <p className="text-xs text-slate-400">
              Palabra {currentWordIdx + 1} de {challenge.words.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHearClue}
            className="bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Volume2 className="w-4 h-4" /> Escuchar
          </button>
          <button
            onClick={handleSyllableHint}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1 transition-all"
          >
            <HelpCircle className="w-4 h-4" /> Pista
          </button>
        </div>
      </div>

      {/* Active Word Visual Card */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 text-center space-y-4 shadow-inner relative overflow-hidden">
        {/* Pictogram */}
        <div className="text-6xl sm:text-7xl animate-pulse">
          {currentWordObj.pictogram}
        </div>

        {/* Syllables Badge */}
        <div className="flex justify-center items-center gap-1.5 flex-wrap">
          {currentWordObj.syllables.map((syl, i) => (
            <span
              key={i}
              className="text-xs font-black bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full"
            >
              {syl.toUpperCase()}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-300 font-medium px-4">
          &ldquo;{currentWordObj.hint}&rdquo;
        </p>

        {/* Letter Slots */}
        <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 flex-wrap pt-2">
          {targetLetters.map((targetL, idx) => {
            const typedL = typedLetters[idx];
            const isFilled = Boolean(typedL);
            const isCurrentFocus = typedLetters.length === idx;

            return (
              <div
                key={idx}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl transition-all transform ${
                  isFilled
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-300 border-2 border-emerald-200 text-slate-950 scale-105 shadow-md'
                    : isCurrentFocus
                    ? 'bg-cyan-950/60 border-2 border-cyan-400 text-cyan-300 scale-105 animate-pulse shadow-lg ring-2 ring-cyan-400/30'
                    : 'bg-slate-900 border-2 border-slate-800 text-slate-600 border-dashed'
                }`}
              >
                {typedL || '_'}
              </div>
            );
          })}
        </div>

        {/* Success Banner */}
        {isWordSuccess && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex items-center justify-center gap-2 text-emerald-300 font-black text-xl animate-fade-in z-10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span>¡Palabra Correcta!</span>
          </div>
        )}
      </div>

      {/* Virtual Touch Keyboard */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-3 sm:p-4 space-y-2 select-none shadow-xl">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Toca las letras o usa el teclado físico para escribir:
        </p>

        {/* Rows */}
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterPress(letter)}
                disabled={isWordSuccess}
                className="w-7 h-9 sm:w-10 sm:h-12 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 active:text-slate-950 text-slate-100 font-black text-xs sm:text-base rounded-xl border border-slate-700 shadow transition-all active:scale-95 disabled:opacity-40"
              >
                {letter}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom Utility Row (Accents + Backspace) */}
        <div className="flex justify-center items-center gap-1 sm:gap-2 pt-1">
          {['Á', 'É', 'Í', 'Ó', 'Ú'].map((acc) => (
            <button
              key={acc}
              onClick={() => handleLetterPress(acc)}
              disabled={isWordSuccess}
              className="w-7 h-8 sm:w-9 sm:h-10 bg-slate-800/80 hover:bg-cyan-700 text-amber-300 font-black text-xs sm:text-sm rounded-lg border border-slate-700 transition-all active:scale-95 disabled:opacity-40"
            >
              {acc}
            </button>
          ))}

          <button
            onClick={handleBackspace}
            disabled={typedLetters.length === 0 || isWordSuccess}
            className="px-3 h-8 sm:h-10 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-black text-xs rounded-xl border border-rose-700/50 flex items-center gap-1 shadow active:scale-95 transition-all disabled:opacity-30"
          >
            <Delete className="w-4 h-4" />
            <span className="hidden sm:inline">Borrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
