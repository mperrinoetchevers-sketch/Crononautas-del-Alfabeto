'use client';

import React, { useState } from 'react';
import { Volume2, Sparkles, MessageCircle } from 'lucide-react';
import { tts } from '@/lib/tts';
import { audioSynth } from '@/lib/audio-synth';

interface CronobotCompanionProps {
  message?: string;
  expression?: 'happy' | 'talking' | 'thinking' | 'celebrating';
  onTalk?: () => void;
  autoSpeak?: boolean;
}

export default function CronobotCompanion({
  message = '¡Hola, explorador! Soy Cronobot. ¡Juntos viajaremos por el tiempo para recolectar las palabras mágicas!',
  expression = 'happy',
  onTalk,
  autoSpeak = false,
}: CronobotCompanionProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      tts.cancel();
      setIsSpeaking(false);
      return;
    }

    audioSynth.playClick();
    setIsSpeaking(true);
    onTalk?.();

    await tts.speak(message, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  React.useEffect(() => {
    if (autoSpeak && message) {
      handleSpeak();
    }
  }, [message]);

  const robotIcons = {
    happy: '🤖',
    talking: '🎙️🤖',
    thinking: '🤔🤖',
    celebrating: '🎉🤖',
  };

  return (
    <aside aria-label="Compañero Cronobot" className="bg-slate-900/90 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-xl flex items-center gap-4 transition-all hover:border-indigo-400">
      {/* Animated Robot Avatar */}
      <button
        onClick={handleSpeak}
        title="Toca a Cronobot para escucharlo"
        className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 via-purple-600 to-amber-500 p-0.5 shadow-lg active:scale-95 transition-transform flex items-center justify-center ${
          isSpeaking ? 'animate-bounce' : 'animate-float'
        }`}
      >
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl">
          {isSpeaking ? '🗣️' : robotIcons[expression] || '🤖'}
        </div>
        {isSpeaking && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
        )}
      </button>

      {/* Speech Bubble */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Cronobot Guía</span>
          </div>
          <button
            onClick={handleSpeak}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              isSpeaking
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-indigo-600/80 hover:bg-indigo-500 text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isSpeaking ? 'Pausar' : 'Escuchar'}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          &ldquo;{message}&rdquo;
        </p>
      </div>
    </aside>
  );
}
