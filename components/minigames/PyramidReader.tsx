'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Lock, Unlock, Sparkles, Check, Mic, MicOff, Radio } from 'lucide-react';
import { PyramidChallenge } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';
import { stt, getMatchedWordIndices } from '@/lib/stt';

interface PyramidReaderProps {
  challenge: PyramidChallenge;
  onComplete: (stars: number) => void;
}

export default function PyramidReader({ challenge, onComplete }: PyramidReaderProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set());
  const [micSupported, setMicSupported] = useState(true);
  const [micFeedback, setMicFeedback] = useState<string>('');

  const currentStep = challenge.steps[activeStepIndex] || challenge.steps[0];
  const stepWords = currentStep.text.split(' ');

  useEffect(() => {
    setActiveStepIndex(0);
    setIsUnlocked(false);
    setSpokenTranscript('');
    setMatchedIndices(new Set());
    setMicSupported(stt.isSupported());

    tts.speak(
      `Lectura en Pirámide: ${challenge.title}. Lee la oración completa en voz alta al micrófono para abrir el candado.`
    );

    return () => {
      stt.stop();
    };
  }, [challenge]);

  // Handle floor completion
  const handleFloorPassed = (stepIdx: number) => {
    stt.stop();
    setIsListening(false);
    audioSynth.playChime(stepIdx);

    if (stepIdx + 1 < challenge.steps.length) {
      setActiveStepIndex(stepIdx + 1);
      setSpokenTranscript('');
      setMatchedIndices(new Set());
      setMicFeedback('¡Piso completado! Lee la siguiente oración completa:');
    } else {
      // Pyramid fully unlocked!
      setIsUnlocked(true);
      audioSynth.playUnlock();
      audioSynth.playCelebration();
      tts.speak(
        `¡Felicitaciones! Has leído toda la pirámide y revelado la palabra mágica: ${challenge.secretCodeWord}.`
      );
      setTimeout(() => {
        onComplete(3);
      }, 2400);
    }
  };

  // Start listening to child's voice for current floor
  const handleStartMicReading = () => {
    audioSynth.playClick();
    setSpokenTranscript('');
    setMatchedIndices(new Set());
    setMicFeedback('🎙️ Escuchando... ¡Lee toda la oración de corrido!');

    const success = stt.start(currentStep.text, {
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onTranscript: (text) => {
        setSpokenTranscript(text);
        // Real-time word highlight
        const matched = getMatchedWordIndices(currentStep.text, text);
        setMatchedIndices(matched);
      },
      onMatch: () => {
        setMatchedIndices(new Set(stepWords.map((_, i) => i)));
        setMicFeedback('¡Excelente lectura completa! ✨');
        tts.speak('¡Muy bien leído!');
        setTimeout(() => {
          handleFloorPassed(activeStepIndex);
        }, 1200);
      },
      onError: (err) => {
        setIsListening(false);
        setMicFeedback(err);
      },
    });

    if (!success) {
      setMicSupported(false);
    }
  };

  const handleStopMic = () => {
    stt.stop();
    setIsListening(false);
  };

  // Manual / TTS fallback
  const handleListenCronobot = (stepIdx: number) => {
    if (stepIdx !== activeStepIndex) return;
    stt.stop();
    setIsListening(false);
    audioSynth.playClick();

    tts.speak(currentStep.text, {
      onEnd: () => {
        setMicFeedback('¡Ahora intenta leer tú la oración completa en voz alta!');
      },
    });
  };

  const handleManualPass = () => {
    audioSynth.playClick();
    handleFloorPassed(activeStepIndex);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📐</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-purple-300">Lectura en Pirámide</h3>
            <p className="text-xs text-slate-400">{challenge.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-bold text-amber-300">
          {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
          <span>{isUnlocked ? '¡Abierto!' : 'Cerradura Real'}</span>
        </div>
      </div>

      {/* Speech Recognition Active Reading Card */}
      {!isUnlocked && (
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-2xl p-4 text-center space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Piso {activeStepIndex + 1} de {challenge.steps.length}
            </span>
            <span className="text-amber-300">
              {matchedIndices.size} de {stepWords.length} palabras leídas
            </span>
          </div>

          {/* Interactive Word Highlighting Sentence */}
          <div className="text-base sm:text-lg font-black leading-relaxed px-3 bg-purple-950/40 py-3 rounded-xl border border-purple-800/40 flex flex-wrap justify-center gap-1.5">
            {stepWords.map((word, wordIdx) => {
              const isWordRead = matchedIndices.has(wordIdx);
              return (
                <span
                  key={wordIdx}
                  className={`px-1.5 py-0.5 rounded-lg transition-all duration-200 ${
                    isWordRead
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 scale-105 shadow'
                      : 'text-yellow-100'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {/* Real-time transcript feedback */}
          {spokenTranscript && (
            <div className="text-xs font-medium text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-700 animate-fade-in flex items-center justify-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>
                Te escuché: <strong className="text-emerald-300">&ldquo;{spokenTranscript}&rdquo;</strong>
              </span>
            </div>
          )}

          {/* Microphone Action Controls */}
          <div className="flex justify-center items-center gap-2 pt-1">
            {isListening ? (
              <button
                onClick={handleStopMic}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 animate-pulse"
              >
                <MicOff className="w-4 h-4" /> Detener Micrófono
              </button>
            ) : (
              <button
                onClick={handleStartMicReading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Mic className="w-4 h-4" /> 🎙️ ¡Leer en Voz Alta!
              </button>
            )}

            <button
              onClick={() => handleListenCronobot(activeStepIndex)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 shadow flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-amber-300" /> Escuchar
            </button>

            {/* Fallback button in case of noise / mic issues */}
            <button
              onClick={handleManualPass}
              title="Avanzar manualmente si hay mucho ruido"
              className="px-3.5 py-2.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/40 shadow flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Ya lo leí
            </button>
          </div>

          {micFeedback && (
            <p className="text-[11px] text-purple-300 font-medium">{micFeedback}</p>
          )}
        </div>
      )}

      {/* Pyramid Steps Visual Stack */}
      <div className="space-y-2 flex flex-col items-center">
        {challenge.steps.map((step, idx) => {
          const isCurrent = activeStepIndex === idx;
          const isPassed = idx < activeStepIndex;

          return (
            <div
              key={idx}
              className={`w-full max-w-lg p-3 sm:p-3.5 rounded-2xl font-bold text-center border-2 transition-all flex items-center justify-between ${
                isCurrent
                  ? 'bg-purple-900/90 border-amber-400 text-yellow-100 scale-102 shadow-xl ring-2 ring-amber-400/30'
                  : isPassed
                  ? 'bg-slate-800/90 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded bg-slate-900/80 text-amber-300">
                Piso {idx + 1}
              </span>
              <span className="text-xs sm:text-sm font-black tracking-wide flex-1 px-2">
                {step.text}
              </span>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {isPassed ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Mic className="w-4 h-4 text-amber-300 animate-bounce" />
                ) : (
                  '🔒'
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Secret Word Revealed */}
      {isUnlocked && (
        <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border-2 border-amber-400 p-5 rounded-2xl text-center space-y-1 animate-scale-up">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 uppercase">
            <Sparkles className="w-4 h-4" /> Palabra Secreta Revelada
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-widest">
            {challenge.secretCodeWord}
          </div>
        </div>
      )}
    </div>
  );
}
