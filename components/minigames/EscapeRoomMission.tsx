'use client';

import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { EscapeRiddle } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface EscapeRoomMissionProps {
  riddle: EscapeRiddle;
  artifactName: string;
  artifactIcon: string;
  onComplete: (stars: number) => void;
}

export default function EscapeRoomMission({
  riddle,
  artifactName,
  artifactIcon,
  onComplete,
}: EscapeRoomMissionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    setSelectedOption(null);
    setIsUnlocked(false);
    if (riddle) {
      tts.speak(`Misión de Escape: ${riddle.title}. ${riddle.storyPrompt}`);
    }
  }, [riddle]);

  const handleSelect = (option: string) => {
    if (isUnlocked || !riddle) return;
    setSelectedOption(option);

    if (option.toLowerCase() === riddle.expectedAnswer.toLowerCase()) {
      setIsUnlocked(true);
      audioSynth.playUnlock();
      audioSynth.playCelebration();
      tts.speak(`¡Acertijo resuelto! La puerta secreta se ha abierto y obtuviste el artefacto: ${artifactName}.`);
      setTimeout(() => {
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        onComplete(stars);
      }, 2200);
    } else {
      audioSynth.playError();
      setMistakes((m) => m + 1);
      tts.speak(`Código incorrecto. Pista: ${riddle.audioClue}`);
    }
  };

  const handleHearClue = () => {
    if (!riddle?.audioClue) return;
    audioSynth.playClick();
    tts.speak(riddle.audioClue);
  };

  if (!riddle) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-slate-900/90 border-2 border-yellow-500/50 rounded-3xl text-center text-amber-300 font-bold">
        Cargando misión de escape...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 bg-slate-900/90 border-2 border-yellow-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🗝️</span>
          <div>
            <h3 className="text-lg font-black text-amber-300">Escape Room: {riddle.title}</h3>
            <p className="text-xs text-slate-400">Resuelve el enigma para escapar</p>
          </div>
        </div>
        <button
          onClick={handleHearClue}
          className="bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Volume2 className="w-4 h-4" /> Escuchar Pista
        </button>
      </div>

      {/* Story Clue Box */}
      <div className="bg-slate-950 border-2 border-yellow-500/30 rounded-2xl p-5 space-y-2 text-center shadow-inner">
        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
          &ldquo;{riddle.storyPrompt}&rdquo;
        </p>
        <h4 className="text-sm font-black text-amber-300 pt-2">
          {riddle.targetQuestion}
        </h4>
      </div>

      {/* Answer Options */}
      {riddle.options && (
        <div className="grid grid-cols-2 gap-3">
          {riddle.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt.toLowerCase() === riddle.expectedAnswer.toLowerCase();

            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-2xl font-black text-base sm:text-lg border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isSelected && isUnlocked
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-xl'
                    : isSelected && !isCorrect
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-shake'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reward Artifact Preview */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400 font-bold">
        <span>Recompensa al escapar:</span>
        <span className="text-amber-300 flex items-center gap-1">
          <span className="text-lg">{artifactIcon}</span>
          {artifactName}
        </span>
      </div>
    </div>
  );
}
