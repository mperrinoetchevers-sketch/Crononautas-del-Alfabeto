'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  HelpCircle,
  Award,
  RefreshCw,
  Plus,
  Flame,
  Radio
} from 'lucide-react';
import { aiLearningEngine, VocabularyWordItem } from '@/lib/ai-learning-engine';
import { storage } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';
import { stt, getMatchedWordIndices } from '@/lib/stt';
import AudioController from '@/components/AudioController';
import TimePortalCanvas from '@/components/TimePortalCanvas';
import StarCelebration from '@/components/ui/StarCelebration';

const TOPICS = [
  { id: 'Refuerzo IA', label: '⚡ Refuerzo IA', icon: '🧠', desc: 'Enfocado en tus letras desafío' },
  { id: 'Dinosaurios', label: 'Dinosaurios', icon: '🦖', desc: 'Criaturas de la prehistoria' },
  { id: 'Ninjas', label: 'Tortugas Ninja', icon: '🥷', desc: 'Artes marciales y honor' },
  { id: 'Espacio', label: 'Espacio & Robots', icon: '🚀', desc: 'Galaxias y tecnología' },
  { id: 'Medieval', label: 'Castillos & Dragones', icon: '🏰', desc: 'Mundo de fantasía y caballeros' },
  { id: 'Naturaleza', label: 'Naturaleza & Selva', icon: '🌿', desc: 'Animales y árboles del mundo' },
];

export default function VocabularyLabPage() {
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState('Refuerzo IA');
  const [isLoading, setIsLoading] = useState(false);
  const [activeWords, setActiveWords] = useState<VocabularyWordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Mini-activity state for currently inspected word
  const [activeTab, setActiveTab] = useState<'drums' | 'reading' | 'writing'>('drums');
  const [tappedSyllables, setTappedSyllables] = useState<number[]>([]);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [isActivityDone, setIsActivityDone] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [micFeedback, setMicFeedback] = useState('');

  // Codex list
  const [codexWords, setCodexWords] = useState<VocabularyWordItem[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState({ title: '', message: '', stars: 3 });

  // Initial load
  useEffect(() => {
    const profile = storage.getActiveProfile();
    setActiveProfile(profile);
    if (profile) {
      const analytics = aiLearningEngine.getAnalytics(profile.id);
      setCodexWords(analytics.discoveredVocabulary || []);
      // Auto fetch initial words
      fetchNewWords('Refuerzo IA', profile.id);
    }
  }, []);

  const fetchNewWords = async (topic: string, profileId?: string) => {
    const pid = profileId || activeProfile?.id;
    if (!pid) return;

    setIsLoading(true);
    audioSynth.playClick();

    const weakPhonemes = topic === 'Refuerzo IA' ? aiLearningEngine.getTopWeakPhonemes(pid, 3) : [];
    const exclude = codexWords.map((w) => w.word.toUpperCase());

    try {
      const res = await fetch('/api/ai/generate-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic === 'Refuerzo IA' ? 'General' : topic,
          targetPhonemes: weakPhonemes,
          age: activeProfile?.age || 7,
          count: 3,
          excludeWords: exclude,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.words && json.words.length > 0) {
          const formatted: VocabularyWordItem[] = json.words.map((w: any) => ({
            id: w.id || `vocab-${Date.now()}-${Math.random()}`,
            word: w.word,
            syllables: w.syllables,
            pictogram: w.pictogram,
            hint: w.hint,
            sentence: w.sentence,
            curiosity: w.curiosity,
            category: w.category || topic,
            masteryLevel: 1,
            practicedCount: 0,
            createdAt: new Date().toISOString(),
          }));

          setActiveWords(formatted);
          setCurrentWordIndex(0);
          resetActivityState(formatted[0]);
          tts.speak(`¡Cronobot descubrió ${formatted.length} nuevas palabras mágicas para ti!`);
        }
      }
    } catch (err) {
      console.warn('Failed to generate words:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentWord = activeWords[currentWordIndex];

  const resetActivityState = (word?: VocabularyWordItem) => {
    stt.stop();
    setIsListening(false);
    setSpokenTranscript('');
    setMicFeedback('');
    setTappedSyllables([]);
    setTypedLetters([]);
    setIsActivityDone(false);
    if (word) {
      tts.speak(`Palabra: ${word.word}. ${word.hint}`);
    }
  };

  const handleSelectWord = (idx: number) => {
    if (idx < 0 || idx >= activeWords.length) return;
    audioSynth.playClick();
    setCurrentWordIndex(idx);
    resetActivityState(activeWords[idx]);
  };

  // 1. DRUMS SYLLABLE TAP
  const handleDrumTap = (sylIdx: number) => {
    if (!currentWord || isActivityDone) return;
    const expected = tappedSyllables.length;

    if (sylIdx === expected) {
      audioSynth.playDrum('snare');
      audioSynth.playChime(sylIdx);
      const nextTapped = [...tappedSyllables, sylIdx];
      setTappedSyllables(nextTapped);
      tts.speak(currentWord.syllables[sylIdx], { rate: 1.1 });

      if (nextTapped.length === currentWord.syllables.length) {
        completeActivity();
      }
    } else if (!tappedSyllables.includes(sylIdx)) {
      audioSynth.playError();
      tts.speak(`Toca la sílaba ${currentWord.syllables[expected]}`);
    }
  };

  // 2. VOICE READING
  const handleStartMicReading = () => {
    if (!currentWord || isActivityDone) return;
    audioSynth.playClick();
    setSpokenTranscript('');
    setMicFeedback('🎙️ Escuchando... ¡Pronuncia la palabra o la oración!');

    const targetSentence = currentWord.sentence || currentWord.word;

    stt.start(targetSentence, {
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onTranscript: (txt) => setSpokenTranscript(txt),
      onMatch: () => {
        setIsListening(false);
        setMicFeedback('¡Excelente pronunciación! 🌟');
        completeActivity();
      },
      onError: (err) => {
        setIsListening(false);
        setMicFeedback(err);
      },
    });
  };

  // 3. LETTER WRITING
  const handleLetterPress = (letter: string) => {
    if (!currentWord || isActivityDone) return;
    const targetLetters = currentWord.word.toUpperCase().split('');
    const nextSlot = typedLetters.length;

    if (nextSlot >= targetLetters.length) return;

    if (letter.toUpperCase() === targetLetters[nextSlot]) {
      audioSynth.playKeyStroke();
      const updated = [...typedLetters, letter.toUpperCase()];
      setTypedLetters(updated);
      tts.speak(letter, { rate: 1.2 });

      if (updated.length === targetLetters.length) {
        completeActivity();
      }
    } else {
      audioSynth.playError();
      tts.speak(`La siguiente letra es ${targetLetters[nextSlot]}`);
    }
  };

  const completeActivity = () => {
    if (!currentWord || !activeProfile) return;
    setIsActivityDone(true);
    audioSynth.playCelebration();
    tts.speak(`¡Genial! Has dominado ${currentWord.word}. ¡Guardada en tu Códice!`);

    // Record learning stats
    aiLearningEngine.recordWordAttempt(activeProfile.id, currentWord.word, true);
    aiLearningEngine.addDiscoveredWord(activeProfile.id, currentWord);

    const updatedCodex = aiLearningEngine.getAnalytics(activeProfile.id).discoveredVocabulary;
    setCodexWords(updatedCodex);

    setCelebrationDetails({
      title: `¡Palabra Dominada!`,
      message: `Aprendiste ${currentWord.word} y expandiste tu vocabulario temporal.`,
      stars: 3,
    });
    setShowCelebration(true);
  };

  return (
    <main className="relative min-h-screen flex flex-col justify-between p-3 sm:p-6 overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Portal */}
      <div className="absolute inset-0 z-0 opacity-30">
        <TimePortalCanvas eraColor="#06b6d4" speedMultiplier={0.9} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full bg-slate-900/80 border border-slate-700 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            onClick={() => audioSynth.playClick()}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🧪</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-cyan-300 flex items-center gap-1.5">
                <span>Laboratorio de Vocabulario Infinito</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  IA
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold">
                Descubre nuevas palabras mágicas y agranda tu Códice
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1.5 rounded-2xl text-xs font-bold text-cyan-300 shadow">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Códice: {codexWords.length}</span>
          </div>
          <AudioController />
        </div>
      </header>

      {/* Topic Selection Bar */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-center gap-2 flex-wrap py-2">
        {TOPICS.map((t) => {
          const isSelected = selectedTopic === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTopic(t.id);
                fetchNewWords(t.id);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 scale-105 ring-2 ring-cyan-300'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div className="relative z-10 max-w-4xl mx-auto w-full my-auto py-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Discovered Words List */}
        <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Palabras Disponibles
              </h3>
              <button
                onClick={() => fetchNewWords(selectedTopic)}
                disabled={isLoading}
                title="Generar otras palabras"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-all active:scale-95 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-cyan-300 font-bold space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                <p>Cronobot está buscando palabras mágicas con IA...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeWords.map((w, idx) => {
                  const isCur = currentWordIndex === idx;
                  const isSaved = codexWords.some((c) => c.word.toUpperCase() === w.word.toUpperCase());

                  return (
                    <button
                      key={w.id || idx}
                      onClick={() => handleSelectWord(idx)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isCur
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md ring-2 ring-cyan-400/30'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{w.pictogram}</span>
                        <div>
                          <div className="text-sm font-black">{w.word}</div>
                          <div className="text-[10px] text-slate-400">{w.syllables.join(' - ')}</div>
                        </div>
                      </div>
                      {isSaved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => fetchNewWords(selectedTopic)}
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 shadow flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Generar Más con IA
          </button>
        </div>

        {/* Center & Right: Active Word Workshop Mini-Game */}
        {currentWord ? (
          <div className="md:col-span-2 space-y-4 bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            {/* Word Header Card */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 text-center space-y-2 shadow-inner relative">
              <div className="text-5xl sm:text-6xl animate-bounce-slow">{currentWord.pictogram}</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
                {currentWord.word}
              </div>
              <p className="text-xs text-slate-300 font-medium">&ldquo;{currentWord.hint}&rdquo;</p>
              {currentWord.curiosity && (
                <div className="text-[11px] text-cyan-300/90 font-medium bg-cyan-950/40 p-2 rounded-xl border border-cyan-500/30">
                  💡 {currentWord.curiosity}
                </div>
              )}
            </div>

            {/* Interactive Mode Selector */}
            <div className="flex justify-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('drums')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'drums'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                🥁 Sílabas
              </button>
              <button
                onClick={() => setActiveTab('reading')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'reading'
                    ? 'bg-purple-500 text-white font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                🎙️ Leer Voz
              </button>
              <button
                onClick={() => setActiveTab('writing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'writing'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ✍️ Escribir
              </button>
            </div>

            {/* TAB 1: DRUMS */}
            {activeTab === 'drums' && (
              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-300 font-bold">Toca los tambores silábicos en orden:</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {currentWord.syllables.map((syl, idx) => {
                    const isTapped = tappedSyllables.includes(idx);
                    const isNext = tappedSyllables.length === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDrumTap(idx)}
                        disabled={isTapped || isActivityDone}
                        className={`px-5 py-4 rounded-2xl font-black text-base sm:text-lg border-2 transition-all transform active:scale-95 shadow ${
                          isTapped
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 opacity-60'
                            : isNext
                            ? 'bg-gradient-to-b from-emerald-500 to-teal-600 border-emerald-300 text-slate-950 animate-pulse scale-105'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        {syl}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: VOICE READING */}
            {activeTab === 'reading' && (
              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-300 font-bold">
                  Lee la oración completa al micrófono:
                </p>
                <div className="bg-purple-950/40 border border-purple-800/40 p-3.5 rounded-2xl font-black text-sm sm:text-base text-yellow-100">
                  &ldquo;{currentWord.sentence || currentWord.word}&rdquo;
                </div>

                {spokenTranscript && (
                  <div className="text-xs font-medium text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span>Te escuché: &ldquo;{spokenTranscript}&rdquo;</span>
                  </div>
                )}

                {micFeedback && (
                  <p className="text-xs text-purple-300 font-bold">{micFeedback}</p>
                )}

                <div className="flex justify-center gap-2 pt-1">
                  {isListening ? (
                    <button
                      onClick={() => {
                        stt.stop();
                        setIsListening(false);
                      }}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow animate-pulse flex items-center gap-1.5"
                    >
                      <MicOff className="w-4 h-4" /> Detener
                    </button>
                  ) : (
                    <button
                      onClick={handleStartMicReading}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Mic className="w-4 h-4" /> 🎙️ ¡Leer en Voz Alta!
                    </button>
                  )}

                  <button
                    onClick={() => {
                      audioSynth.playClick();
                      tts.speak(currentWord.sentence || currentWord.word);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1"
                  >
                    <Volume2 className="w-4 h-4" /> Oír
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: WRITING */}
            {activeTab === 'writing' && (
              <div className="space-y-3 text-center">
                {/* Letter Slots */}
                <div className="flex justify-center gap-1.5">
                  {currentWord.word.split('').map((char, i) => {
                    const typed = typedLetters[i];
                    return (
                      <div
                        key={i}
                        className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl flex items-center justify-center font-black text-lg border-2 ${
                          typed
                            ? 'bg-cyan-500 border-cyan-300 text-slate-950'
                            : 'bg-slate-900 border-slate-700 text-slate-600'
                        }`}
                      >
                        {typed || '_'}
                      </div>
                    );
                  })}
                </div>

                {/* Touch Keyboard Letters for this word */}
                <div className="flex justify-center gap-1.5 flex-wrap pt-1">
                  {Array.from(new Set([...currentWord.word.toUpperCase().split(''), 'A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'L', 'M', 'P'])).slice(0, 12).map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLetterPress(l)}
                      className="w-9 h-10 bg-slate-800 hover:bg-cyan-600 text-white font-black text-sm rounded-xl border border-slate-700 active:scale-95 transition-transform"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center p-8 text-center text-slate-400">
            Selecciona o genera una palabra para comenzar.
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      <StarCelebration
        isOpen={showCelebration}
        starsEarned={celebrationDetails.stars}
        title={celebrationDetails.title}
        message={celebrationDetails.message}
        onContinue={() => setShowCelebration(false)}
      />
    </main>
  );
}
