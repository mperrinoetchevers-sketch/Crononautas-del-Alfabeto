'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Award,
  Brain,
  TrendingUp,
  BookOpen,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Lock,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { aiLearningEngine, LearningAnalytics } from '@/lib/ai-learning-engine';
import { storage } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface ParentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParentDashboardModal({ isOpen, onClose }: ParentDashboardModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinChallenge, setPinChallenge] = useState<{ n1: number; n2: number; ans: number }>({
    n1: 3,
    n2: 4,
    ans: 7,
  });

  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  // Generate math lock on open
  useEffect(() => {
    if (isOpen) {
      const n1 = Math.floor(2 + Math.random() * 6);
      const n2 = Math.floor(2 + Math.random() * 6);
      setPinChallenge({ n1, n2, ans: n1 + n2 });
      setPinInput('');
      setIsUnlocked(false);

      const profile = storage.getActiveProfile();
      setActiveProfile(profile);
      if (profile) {
        const data = aiLearningEngine.getAnalytics(profile.id);
        setAnalytics(data);
        if (data.lastAiAnalysis) {
          setAiReport(data.lastAiAnalysis);
        }
      }
    }
  }, [isOpen]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(pinInput.trim(), 10) === pinChallenge.ans) {
      audioSynth.playUnlock();
      setIsUnlocked(true);
    } else {
      audioSynth.playError();
      setPinInput('');
    }
  };

  const handleGenerateAiReport = async () => {
    if (!activeProfile || !analytics) return;
    audioSynth.playClick();
    setIsLoadingReport(true);

    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: activeProfile.name,
          age: activeProfile.age,
          phonemeStats: analytics.phonemeStats,
          readingSpeedWpm: analytics.readingSpeedWpm,
          accuracyRate: analytics.accuracyRate,
          totalWordsPracticed: analytics.totalWordsPracticed,
          discoveredVocabularyCount: analytics.discoveredVocabulary.length,
          recentErrors: analytics.recentErrors,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.report) {
          setAiReport(json.report);
          analytics.lastAiAnalysis = json.report;
          aiLearningEngine.saveAnalytics(analytics);
          audioSynth.playCelebration();
          tts.speak('Reporte pedagógico generado con éxito.');
        }
      }
    } catch (err) {
      console.warn('Error loading AI report:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh] space-y-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Parental Security Gate */}
        {!isUnlocked ? (
          <div className="py-8 text-center space-y-5 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-indigo-950/80 border-2 border-indigo-500/50 rounded-3xl mx-auto flex items-center justify-center text-indigo-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-amber-300">Control para Adultos</h3>
              <p className="text-xs text-slate-400">
                Resuelve la siguiente suma para acceder al panel pedagógico:
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="text-2xl font-black text-amber-400 tracking-wider">
                {pinChallenge.n1} + {pinChallenge.n2} = ?
              </div>

              <input
                type="number"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Resultado"
                autoFocus
                className="w-32 mx-auto text-center text-xl font-black py-2.5 bg-slate-950 border-2 border-indigo-500/50 rounded-2xl focus:outline-none focus:border-amber-400 text-white"
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                Acceder al Panel
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED PARENTAL & TEACHER DASHBOARD */
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-md">
                  📊
                </div>
                <div>
                  <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
                    <span>Panel Pedagógico del Alumno</span>
                    <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                      IA Adaptativa
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Estudiante: <strong className="text-slate-200">{activeProfile?.name || 'Crononauta'}</strong> ({activeProfile?.age || 7} años)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button
                  onClick={handleGenerateAiReport}
                  disabled={isLoadingReport}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isLoadingReport ? 'animate-spin' : ''}`} />
                  <span>{isLoadingReport ? 'Analizando...' : 'Generar Informe con IA'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <Award className="w-4 h-4 text-amber-400" /> Nivel Lector
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300">
                  {aiReport?.readingLevel || 'Crononauta Lector'}
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Precisión Global
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {analytics?.accuracyRate || 92}%
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <Brain className="w-4 h-4 text-cyan-400" /> Velocidad Lectora
                </div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400">
                  ~{analytics?.readingSpeedWpm || 45} <span className="text-xs text-slate-400 font-normal">WPM</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <BookOpen className="w-4 h-4 text-purple-400" /> Vocabulario Códice
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-300">
                  {analytics?.discoveredVocabulary?.length || 0} <span className="text-xs text-slate-400 font-normal">palabras</span>
                </div>
              </div>
            </div>

            {/* AI Pedagogical Insights Report */}
            {aiReport && (
              <div className="bg-gradient-to-b from-indigo-950/50 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Diagnóstico Psicopedagógico</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Actualizado: {new Date(aiReport.generatedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-slate-900/80 p-3.5 rounded-2xl border border-indigo-500/30">
                  &ldquo;{aiReport.summary}&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Strengths */}
                  <div className="space-y-2 bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl">
                    <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4" /> Fortalezas Clave
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiReport.strengths?.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Focus Areas */}
                  <div className="space-y-2 bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <Brain className="w-4 h-4" /> Áreas de Refuerzo Sugeridas
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiReport.focusAreas?.map((foc: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{foc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Family Activities Recommendations */}
                <div className="space-y-2 bg-purple-950/30 border border-purple-500/30 p-3.5 rounded-2xl">
                  <h4 className="text-xs font-black text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Actividades Recomendadas en Familia (Sin Pantallas)
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                    {aiReport.recommendedActivities?.map((act: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-xl">
                        <span className="text-purple-400 font-bold">✨</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Phoneme Mastery Table */}
            <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Desglose de Conciencia Fonológica y Sílabas</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {analytics &&
                  Object.values(analytics.phonemeStats).map((stat) => {
                    const pct =
                      stat.attempts > 0 ? Math.round((stat.successes / stat.attempts) * 100) : 100;
                    const isGood = pct >= 80;

                    return (
                      <div
                        key={stat.phoneme}
                        className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="text-sm font-black text-amber-300">{stat.phoneme}</span>
                          <p className="text-[10px] text-slate-400 capitalize">{stat.category}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-black px-1.5 py-0.5 rounded ${
                              isGood
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {pct}%
                          </span>
                          <p className="text-[9px] text-slate-500 font-medium">
                            {stat.successes}/{stat.attempts} aciertos
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
