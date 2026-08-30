'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, UserCheck, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface CoReadingDuoProps {
  dialogues: {
    speaker: 'cronobot' | 'child';
    text: string;
    pictogram: string;
  }[];
  onComplete: (stars: number) => void;
}

export default function CoReadingDuo({ dialogues, onComplete }: CoReadingDuoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const currentLine = dialogues[currentIndex] || dialogues[0];

  useEffect(() => {
    if (currentLine.speaker === 'cronobot') {
      triggerBotSpeech();
    }
  }, [currentIndex]);

  const triggerBotSpeech = () => {
    setIsBotSpeaking(true);
    audioSynth.playClick();
    tts.speak(currentLine.text, {
      onEnd: () => {
        setIsBotSpeaking(false);
      },
    });
  };

  const handleChildRead = () => {
    audioSynth.playCelebration();
    tts.speak(`¡Excelente lectura!`);

    setTimeout(() => {
      if (currentIndex + 1 < dialogues.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(3);
      }
    }, 1500);
  };

  const handleAdvanceBot = () => {
    if (currentIndex + 1 < dialogues.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(3);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🤝</span>
          <div>
            <h3 className="text-lg font-black text-indigo-300">Lectura en Duplas</h3>
            <p className="text-xs text-slate-400">Leyendo junto a Cronobot</p>
          </div>
        </div>
        <span className="text-xs bg-indigo-900/80 text-amber-300 px-3 py-1 rounded-full border border-indigo-500/30 font-bold">
          Turno {currentIndex + 1} de {dialogues.length}
        </span>
      </div>

      {/* Active Speaker Card */}
      <div
        className={`p-6 rounded-3xl border-2 transition-all text-center space-y-4 shadow-xl ${
          currentLine.speaker === 'cronobot'
            ? 'bg-slate-950 border-indigo-400'
            : 'bg-indigo-950/70 border-amber-400 animate-pulse'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {currentLine.speaker === 'cronobot' ? (
            <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Turno de Cronobot
            </span>
          ) : (
            <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> ¡Tu Turno de Leer, Explorador!
            </span>
          )}
        </div>

        <div className="text-5xl">{currentLine.pictogram}</div>

        <p className="text-lg sm:text-xl font-black text-slate-100 leading-relaxed">
          &ldquo;{currentLine.text}&rdquo;
        </p>

        {currentLine.speaker === 'cronobot' ? (
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={triggerBotSpeech}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" /> Repetir Voz de Cronobot
            </button>
            <button
              onClick={handleAdvanceBot}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Siguiente ➡️
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={handleChildRead}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Ya lo leí en voz alta!</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
