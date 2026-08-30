'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Star, Sparkles, Trophy, Play, CheckCircle2 } from 'lucide-react';
import TimePortalCanvas from '@/components/TimePortalCanvas';
import AudioController from '@/components/AudioController';
import ProfileSelector from '@/components/ProfileSelector';
import { GAME_ERAS, EraDefinition } from '@/lib/game-data';
import { storage, PlayerProfile, GameProgress, DEFAULT_AVATARS } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

export default function TimeMapPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [selectedEra, setSelectedEra] = useState<EraDefinition>(GAME_ERAS[0]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const current = storage.getActiveProfile();
    if (current) {
      setProfile(current);
      const prog = storage.getProgress(current.id);
      setProgress(prog);
    }
    tts.speak(`Bienvenido al Mapa del Tiempo. Selecciona una época histórica para viajar y recuperar sus palabras.`);
  }, []);

  const handleSelectEra = (era: EraDefinition) => {
    setSelectedEra(era);
    const isUnlocked = progress?.unlockedEras.includes(era.id);

    audioSynth.playClick();
    if (isUnlocked) {
      tts.speak(`${era.name}. ${era.description}`);
    } else {
      audioSynth.playError();
      tts.speak(`Esta época aún está bloqueada por la tormenta temporal. Completa las eras anteriores para desbloquearla.`);
    }
  };

  const currentAvatar = DEFAULT_AVATARS.find((a) => a.id === profile?.avatar) || DEFAULT_AVATARS[0];

  return (
    <main className="relative min-h-screen flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* Dynamic Background Portal matched with selected era */}
      <div className="absolute inset-0 z-0 opacity-35">
        <TimePortalCanvas eraColor={selectedEra.themeColor} speedMultiplier={1.0} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full bg-slate-900/80 border border-slate-700 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => audioSynth.playClick()}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-black text-amber-300 flex items-center gap-2">
              <span>🗺️</span> El Mapa del Tiempo
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Viaja a través de 5 épocas históricas y repara la máquina
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Machine Integrity Badge */}
          <Link
            href="/rewards"
            onClick={() => audioSynth.playClick()}
            className="flex items-center gap-2 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/40 px-3 py-1.5 rounded-2xl shadow"
          >
            <span className="text-lg">⏳</span>
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-indigo-300 font-bold">Máquina del Tiempo</span>
              <p className="text-xs font-black text-amber-300">{progress?.machineIntegrity || 20}% Integridad</p>
            </div>
          </Link>

          {/* Profile Switcher */}
          <button
            onClick={() => {
              audioSynth.playClick();
              setIsProfileModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-700"
          >
            <span className="text-lg">{currentAvatar.emoji}</span>
            <span className="text-xs font-bold text-amber-300 hidden sm:inline">⭐ {progress?.starsTotal || 0}</span>
          </button>

          <AudioController />
        </div>
      </header>

      {/* Main Map Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4">
        {/* 5 Eras Horizontal Road / Cards (Cols 8) */}
        <div className="lg:col-span-8 space-y-3">
          <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Línea Temporal de la Historia:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GAME_ERAS.map((era, index) => {
              const isUnlocked = progress?.unlockedEras.includes(era.id) ?? (index === 0);
              const isSelected = selectedEra.id === era.id;
              const hasArtifact = progress?.timeMachineParts.includes(era.artifactName);

              return (
                <button
                  key={era.id}
                  onClick={() => handleSelectEra(era)}
                  className={`relative p-5 rounded-3xl border-2 text-left transition-all transform active:scale-95 flex flex-col justify-between min-h-[160px] ${
                    isSelected
                      ? 'bg-slate-900/95 border-amber-400 scale-102 shadow-2xl ring-2 ring-amber-400/40'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-700 hover:border-indigo-400 hover:scale-101'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start w-full">
                    <span className="text-3xl">{era.icon}</span>
                    {hasArtifact ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                    ) : isUnlocked ? (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        ¡Disponible!
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </div>

                  {/* Era Info */}
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] font-bold text-indigo-300">{era.periodLabel}</span>
                    <h3 className="font-black text-base text-slate-100">{era.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{era.badge}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Era Details Panel (Cols 4) */}
        <div className="lg:col-span-4 bg-slate-900/95 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 to-purple-600 flex items-center justify-center text-4xl shadow-lg border-2 border-amber-400">
                {selectedEra.icon}
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300">{selectedEra.periodLabel}</span>
                <h3 className="text-lg font-black text-white">{selectedEra.name}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {selectedEra.description}
            </p>

            {/* Pedagogical Focus Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Objetivo de Aprendizaje:</span>
              <p className="text-xs font-semibold text-emerald-300">
                {selectedEra.pedagogicalFocus}
              </p>
            </div>

            {/* Artifact to Win */}
            <div className="flex items-center gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <span className="text-2xl">{selectedEra.artifactIcon}</span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Artefacto de la Era:</span>
                <h4 className="text-xs font-black text-amber-300">{selectedEra.artifactName}</h4>
              </div>
            </div>
          </div>

          {/* Action Launch Button */}
          {progress?.unlockedEras.includes(selectedEra.id) ? (
            <Link
              href={`/play/${selectedEra.id}`}
              onClick={() => {
                audioSynth.playPortalWarp();
                tts.speak(`¡Viajando a ${selectedEra.name}!`);
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-102 active:scale-95 border-b-4 border-emerald-800"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>¡Entrar al Portal de {selectedEra.name.split('&')[0]}!</span>
            </Link>
          ) : (
            <button
              disabled
              className="w-full py-3.5 bg-slate-800 text-slate-500 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700"
            >
              <Lock className="w-4 h-4" />
              <span>Completa la era anterior para desbloquear</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-xs text-slate-400 pt-2">
        <span>Toca cualquier época para ver sus minijuegos y artefactos coleccionables</span>
      </footer>

      {/* Profile Selector */}
      <ProfileSelector
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileChange={(p) => {
          setProfile(p);
          setProgress(storage.getProgress(p.id));
        }}
      />
    </main>
  );
}
