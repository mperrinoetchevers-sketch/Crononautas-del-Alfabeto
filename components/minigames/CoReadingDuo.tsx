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

  const currentLine = dialogues?.[currentIndex] || dialogues?.[0];

  useEffect(() => {
    stt.stop();
    setIsListening(false);
    setSpokenTranscript('');
    setMicFeedback('');

    if (currentLine?.speaker === 'cronobot') {
      triggerBotSpeech();
    } else if (currentLine?.speaker === 'child') {
      // Prompt child to read
      tts.speak('¡Tu turno de leer en voz alta!');
    }

    return () => {
      stt.stop();
    };
  }, [currentIndex, currentLine]);

  const triggerBotSpeech = () => {
    if (!currentLine?.text) return;
    setIsBotSpeaking(true);
    audioSynth.playClick();
    tts.speak(currentLine.text, {
      onEnd: () => {
        setIsBotSpeaking(false);
      },
    });
  };

  const handleStartChildMic = () => {
    if (!currentLine?.text) return;
    audioSynth.playClick();
    setSpokenTranscript('');
    setMicFeedback('🎙️ Escuchando... ¡Lee tu línea en voz alta!');

    stt.start(currentLine.text, {
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onTranscript: (text) => {
        setSpokenTranscript(text);
      },
      onMatch: () => {
        setIsListening(false);
        setMicFeedback('¡Lectura perfecta! 🌟');
        audioSynth.playCelebration();
        tts.speak('¡Excelente lectura!');
        setTimeout(() => {
          handleAdvanceDialogue();
        }, 1200);
      },
      onError: (err) => {
        setIsListening(false);
        setMicFeedback(err);
      },
    });
  };

  const handleStopChildMic = () => {
    stt.stop();
    setIsListening(false);
  };

  const handleAdvanceDialogue = () => {
    stt.stop();
    setIsListening(false);
    setSpokenTranscript('');
    setMicFeedback('');

    if (dialogues && currentIndex + 1 < dialogues.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished Duo Reading
      audioSynth.playCelebration();
      tts.speak('¡Lectura compartida completada con gran sincronización!');
      setTimeout(() => {
        onComplete(3);
      }, 1800);
    }
  };

  if (!dialogues || !currentLine) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl text-center text-indigo-300 font-bold">
        Cargando lectura compartida...
      </div>
    );
  }

  const isChildTurn = currentLine.speaker === 'child';

  return (
    <div className="max-w-xl mx-auto space-y-5 bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">👥</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-indigo-300">Lectura en Dúo</h3>
            <p className="text-xs text-slate-400">
              Línea {currentIndex + 1} de {dialogues.length}
            </p>
          </div>
        </div>
        <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-bold">
          {isChildTurn ? '👧 Tu Turno' : '🤖 Turno de Cronobot'}
        </span>
      </div>

      {/* Active Dialogue Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-inner space-y-4 text-center ${
          isChildTurn
            ? 'bg-amber-950/40 border-amber-500/60'
            : 'bg-slate-950 border-indigo-500/40'
        }`}
      >
        <div className="flex justify-center items-center gap-3">
          <span className="text-5xl">{currentLine.pictogram}</span>
          <div className="text-left">
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                isChildTurn
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {isChildTurn ? 'TÚ DICES:' : 'CRONOBOT DICE:'}
            </span>
          </div>
        </div>

        <p className="text-base sm:text-lg font-black text-slate-100 leading-relaxed px-2">
          &ldquo;{currentLine.text}&rdquo;
        </p>

        {spokenTranscript && (
          <div className="text-xs font-medium text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 animate-fade-in">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              Te escuché: <strong className="text-amber-300">&ldquo;{spokenTranscript}&rdquo;</strong>
            </span>
          </div>
        )}

        {micFeedback && (
          <p className="text-xs text-amber-300 font-bold">{micFeedback}</p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex justify-center items-center gap-3 flex-wrap">
        {isChildTurn ? (
          <>
            {isListening ? (
              <button
                onClick={handleStopChildMic}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 animate-pulse"
              >
                <MicOff className="w-4 h-4" /> Detener Micrófono
              </button>
            ) : (
              <button
                onClick={handleStartChildMic}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Mic className="w-4 h-4" /> 🎙️ ¡Leer mi parte!
              </button>
            )}

            <button
              onClick={handleAdvanceDialogue}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" /> Ya lo leí
            </button>
          </>
        ) : (
          <button
            onClick={triggerBotSpeech}
            disabled={isBotSpeaking}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" /> Escuchar a Cronobot
          </button>
        )}

        {!isChildTurn && (
          <button
            onClick={handleAdvanceDialogue}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1"
          >
            <span>Siguiente</span>
          </button>
        )}
      </div>
    </div>
  );
}
