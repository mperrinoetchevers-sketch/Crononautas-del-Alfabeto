'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, ArrowLeft, ArrowRight, Mic, MicOff, Radio, CheckCircle2 } from 'lucide-react';
import { KamishibaiStory, KamishibaiCard } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';
import { stt, getMatchedWordIndices } from '@/lib/stt';

interface KamishibaiTheaterProps {
  story: KamishibaiStory;
  onComplete: (stars: number) => void;
}

export default function KamishibaiTheater({ story, onComplete }: KamishibaiTheaterProps) {
  const [userSequence, setUserSequence] = useState<KamishibaiCard[]>([]);
  const [isOrdered, setIsOrdered] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Speech Recognition state for Theater Narration
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set());
  const [micFeedback, setMicFeedback] = useState('');

  // Shuffle the cards on load
  useEffect(() => {
    const shuffled = [...story.cards].sort(() => Math.random() - 0.5);
    setUserSequence(shuffled);
    setIsOrdered(false);
    setActiveSlideIndex(0);
    setSpokenTranscript('');
    setMatchedIndices(new Set());
    setMicFeedback('');
    tts.speak(
      `Bienvenido al Gran Teatro Kamishibai. Ordena las láminas de la historia desde el inicio hasta el final.`
    );

    return () => {
      stt.stop();
    };
  }, [story]);

  // Card movement in sequence
  const handleMoveCard = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= userSequence.length) return;
    audioSynth.playClick();
    const updated = [...userSequence];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setUserSequence(updated);
  };

  const handleVerifySequence = () => {
    const isCorrect = userSequence.every((card, idx) => card.sequenceIndex === idx + 1);

    if (isCorrect) {
      setIsOrdered(true);
      audioSynth.playCelebration();
      tts.speak(
        `¡Excelente! Ordenaste la historia a la perfección. Ahora eres el narrador oficial del Gran Teatro. ¡Lee la lámina completa en voz alta!`
      );
      setActiveSlideIndex(0);
      setMicFeedback('🎙️ Pulsa "Narrar en Voz Alta" para leer con tu micrófono.');
    } else {
      audioSynth.playError();
      tts.speak(`Casi lo logras. Revisa el orden de las láminas para que la historia tenga sentido.`);
    }
  };

  const playSlideAudio = (card: KamishibaiCard) => {
    stt.stop();
    setIsListening(false);
    audioSynth.playChime(card.sequenceIndex);
    tts.speak(card.narrativeText);
  };

  const handleNextSlide = () => {
    stt.stop();
    setIsListening(false);
    setSpokenTranscript('');
    setMatchedIndices(new Set());
    setMicFeedback('');

    if (activeSlideIndex + 1 < userSequence.length) {
      const nextIdx = activeSlideIndex + 1;
      setActiveSlideIndex(nextIdx);
    } else {
      // Theater finished!
      audioSynth.playCelebration();
      tts.speak(`Fin de la historia. ¡Gran trabajo como narrador de ${story.title}!`);
      setTimeout(() => {
        onComplete(3);
      }, 1800);
    }
  };

  const handlePrevSlide = () => {
    stt.stop();
    setIsListening(false);
    setSpokenTranscript('');
    setMatchedIndices(new Set());
    setMicFeedback('');

    if (activeSlideIndex > 0) {
      const prevIdx = activeSlideIndex - 1;
      setActiveSlideIndex(prevIdx);
    }
  };

  const currentSlide = userSequence[activeSlideIndex] || userSequence[0];
  const slideWords = currentSlide.narrativeText.split(' ');

  // Start Mic Narration
  const handleStartMicNarration = () => {
    audioSynth.playClick();
    setSpokenTranscript('');
    setMatchedIndices(new Set());
    setMicFeedback('🎙️ Escuchando... ¡Lee toda la historia de la lámina!');

    stt.start(currentSlide.narrativeText, {
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onTranscript: (text) => {
        setSpokenTranscript(text);
        const matched = getMatchedWordIndices(currentSlide.narrativeText, text);
        setMatchedIndices(matched);
      },
      onMatch: () => {
        setIsListening(false);
        setMatchedIndices(new Set(slideWords.map((_, i) => i)));
        setMicFeedback('¡Excelente narración completa! ✨ Avanzando...');
        audioSynth.playCelebration();
        tts.speak('¡Excelente narración!');
        setTimeout(() => {
          handleNextSlide();
        }, 1200);
      },
      onError: (err) => {
        setIsListening(false);
        setMicFeedback(err);
      },
    });
  };

  const handleStopMicNarration = () => {
    stt.stop();
    setIsListening(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎭</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-rose-300">Gran Teatro Kamishibai</h3>
            <p className="text-xs text-slate-400">{story.title}</p>
          </div>
        </div>
        <span className="text-xs bg-rose-950 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30 font-bold">
          {isOrdered ? `Lámina ${activeSlideIndex + 1} de ${userSequence.length}` : 'Modo Ordenar'}
        </span>
      </div>

      {!isOrdered ? (
        /* PHASE 1: SEQUENCING THE CARDS */
        <div className="space-y-4">
          <p className="text-xs text-slate-300 text-center font-medium">
            Usa las flechas ⬅️ ➡️ para ordenar las 4 láminas (Inicio, Nudo, Clímax y Final):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userSequence.map((card, idx) => (
              <div
                key={card.id}
                className="bg-slate-950 border-2 border-slate-700 hover:border-amber-400 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
                    Lámina #{idx + 1}
                  </span>
                  <div className="flex gap-1 text-2xl">
                    {card.pictograms.join(' ')}
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  &ldquo;{card.narrativeText}&rdquo;
                </p>

                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={() => handleMoveCard(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold"
                  >
                    ⬅️ Mover
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.playClick();
                      tts.speak(card.narrativeText);
                    }}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Escuchar
                  </button>
                  <button
                    onClick={() => handleMoveCard(idx, idx + 1)}
                    disabled={idx === userSequence.length - 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold"
                  >
                    Mover ➡️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleVerifySequence}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            <span>¡Validar Secuencia y Abrir el Teatro!</span>
          </button>
        </div>
      ) : (
        /* PHASE 2: KAMISHIBAI THEATER STAGE */
        <div className="space-y-4">
          {/* Wooden Theater Frame */}
          <div className="relative bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 p-4 sm:p-6 rounded-3xl border-4 border-amber-700 shadow-2xl">
            {/* Paper Story Card */}
            <div className="bg-slate-950 border-2 border-amber-600/40 rounded-2xl p-5 sm:p-6 text-center space-y-4 min-h-[220px] flex flex-col justify-between shadow-inner">
              <div className="flex justify-center items-center gap-3 text-5xl sm:text-6xl animate-bounce-slow">
                {currentSlide.pictograms.map((p, i) => (
                  <span key={i}>{p}</span>
                ))}
              </div>

              {/* Word Highlighting Sentence for Narration */}
              <div className="text-base sm:text-lg font-black leading-relaxed px-2 flex flex-wrap justify-center gap-1.5">
                {slideWords.map((word, wordIdx) => {
                  const isWordRead = matchedIndices.has(wordIdx);
                  return (
                    <span
                      key={wordIdx}
                      className={`px-1.5 py-0.5 rounded-lg transition-all duration-200 ${
                        isWordRead
                          ? 'bg-amber-400/30 text-amber-300 border border-amber-400/50 scale-105 shadow'
                          : 'text-amber-200'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>

              <div className="text-[11px] text-amber-400/80 font-bold uppercase tracking-wider">
                {currentSlide.title} • ({matchedIndices.size} de {slideWords.length} palabras leídas)
              </div>
            </div>
          </div>

          {/* Voice Reading Transcript Feedback */}
          {spokenTranscript && (
            <div className="text-xs font-medium text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-rose-500/40 flex items-center justify-center gap-1.5 animate-fade-in">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>
                Te escuché: <strong className="text-amber-300">&ldquo;{spokenTranscript}&rdquo;</strong>
              </span>
            </div>
          )}

          {micFeedback && (
            <p className="text-center text-[11px] text-rose-300 font-bold">{micFeedback}</p>
          )}

          {/* Controls Bar */}
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex === 0}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold rounded-xl flex items-center gap-1 text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>

            {/* Speech Recognition Mic Button */}
            {isListening ? (
              <button
                onClick={handleStopMicNarration}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow flex items-center gap-1.5 animate-pulse"
              >
                <MicOff className="w-4 h-4" /> Detener Micrófono
              </button>
            ) : (
              <button
                onClick={handleStartMicNarration}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Mic className="w-4 h-4" /> 🎙️ ¡Narrar en Voz Alta!
              </button>
            )}

            <button
              onClick={() => playSlideAudio(currentSlide)}
              className="px-3 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/40 flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" /> Oír
            </button>

            <button
              onClick={handleNextSlide}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 text-xs font-black rounded-xl shadow flex items-center gap-1"
            >
              <span>{activeSlideIndex + 1 === userSequence.length ? 'Finalizar 🎉' : 'Siguiente'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
