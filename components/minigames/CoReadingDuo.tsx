'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, UserCheck, Bot, Sparkles, CheckCircle2, Mic, MicOff, Radio } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';
import { stt } from '@/lib/stt';

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
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [micFeedback, setMicFeedback] = useState('');

  const currentLine = dialogues[currentIndex] || dialogues[0];

  useEffect(() => {
    stt.stop();
    setIsListening(false);
    setSpokenTranscript('');
    setMicFeedback('');

    if (currentLine.speaker === 'cronobot') {
      triggerBotSpeech();
    } else {
      // Prompt child to read
      tts.speak(`¡Tu turno de leer en voz alta!`);
    }

    return () => {
      stt.stop();
    };
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

  const handleAdvance = () => {
    stt.stop();
    setIsListening(false);
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

  const handleStartMic = () => {
    audioSynth.playClick();
    setSpokenTranscript('');
    setMicFeedback('🎙️ Escuchando... ¡Lee la frase en voz alta!');

    stt.start(currentLine.text, {
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onTranscript: (text) => {
        setSpokenTranscript(text);
      },
      onMatch: () => {
        setMicFeedback('¡Te escuché genial! ✨');
        handleAdvance();
      },
      onError: (err) => {
        setIsListening(false);
        setMicFeedback(err);
      },
    });
  };

  const handleStopMic = () => {
    stt.stop();
    setIsListening(false);
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
              <UserCheck className="w-3.5 h-3.5" /> ¡Tu Turno de Leer en Voz Alta!
            </span>
          )}
        </div>

        <div className="text-5xl">{currentLine.pictogram}</div>

        <p className="text-lg sm:text-xl font-black text-slate-100 leading-relaxed">
          &ldquo;{currentLine.text}&rdquo;
        </p>

        {/* Live speech feedback for child */}
        {spokenTranscript && currentLine.speaker === 'child' && (
          <div className="text-xs font-medium text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/40 flex items-center justify-center gap-1.5 animate-fade-in">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Te escuché: <strong className="text-amber-300">&ldquo;{spokenTranscript}&rdquo;</strong></span>
          </div>
        )}

        {micFeedback && currentLine.speaker === 'child' && (
          <p className="text-[11px] text-amber-300 font-bold">{micFeedback}</p>
        )}

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
          <div className="flex flex-col gap-2 pt-2">
            {isListening ? (
              <button
                onClick={handleStopMic}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                <MicOff className="w-5 h-5" /> Detener Micrófono
              </button>
            ) : (
              <button
                onClick={handleStartMic}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Mic className="w-5 h-5" /> 🎙️ ¡Leer con mi Micrófono!
              </button>
            )}

            <button
              onClick={handleAdvance}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ya lo leí en voz alta (Avanzar)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
