'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { tts } from '@/lib/tts';
import { audioSynth } from '@/lib/audio-synth';

interface PictogramCardProps {
  word: string;
  syllables?: string[];
  pictogram: string;
  hint?: string;
  highlightSyllableIndex?: number;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PictogramCard({
  word,
  syllables,
  pictogram,
  hint,
  highlightSyllableIndex,
  interactive = true,
  onClick,
  className = '',
}: PictogramCardProps) {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioSynth.playClick();
    if (syllables && syllables.length > 1) {
      tts.speakSyllables(syllables);
    } else {
      tts.speak(word);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-slate-900/90 border-2 border-indigo-500/40 hover:border-amber-400 rounded-3xl p-4 shadow-xl transition-all flex flex-col items-center justify-between text-center ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      {/* Audio Button in Top-Right */}
      <button
        onClick={handleSpeak}
        title="Escuchar pronunciación"
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 text-amber-300 flex items-center justify-center transition-colors shadow"
      >
        <Volume2 className="w-3.5 h-3.5" />
      </button>

      {/* Pictogram Emoji / Icon */}
      <div className="text-5xl sm:text-6xl py-2 group-hover:animate-bounce-slow transition-transform">
        {pictogram}
      </div>

      {/* Word / Syllables */}
      <div className="space-y-1 w-full">
        {syllables && syllables.length > 0 ? (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {syllables.map((syl, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded-lg text-sm sm:text-base font-black transition-all ${
                  highlightSyllableIndex === i
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-md'
                    : 'bg-indigo-900/40 text-amber-200 border border-indigo-500/30'
                }`}
              >
                {syl.toUpperCase()}
              </span>
            ))}
          </div>
        ) : (
          <h3 className="text-lg sm:text-xl font-black text-amber-300 tracking-wide uppercase">
            {word}
          </h3>
        )}

        {hint && (
          <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
