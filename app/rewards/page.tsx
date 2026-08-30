'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Trophy, Star, Shield, Play, CheckCircle2, Lock } from 'lucide-react';
import TimePortalCanvas from '@/components/TimePortalCanvas';
import AudioController from '@/components/AudioController';
import { GAME_ERAS } from '@/lib/game-data';
import { storage, PlayerProfile, GameProgress, DEFAULT_AVATARS } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

export default function RewardsPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    const active = storage.getActiveProfile();
    if (active) {
      setProfile(active);
      const prog = storage.getProgress(active.id);
      setProgress(prog);
      tts.speak(`Bienvenido al Taller de la Máquina del Tiempo. Tienes ${prog.timeMachineParts.length} de 5 artefactos legendarios ensamblados.`);
    }
  }, []);

  const handleTestWarp = () => {
    audioSynth.playCelebration();
    audioSynth.playPortalWarp();
    tts.speak(`¡Motores cuánticos funcionando al ${progress?.machineIntegrity || 20} por ciento!`);
  };

  const currentAvatar = DEFAULT_AVATARS.find((a) => a.id === profile?.avatar) || DEFAULT_AVATARS[0];
  const allCollected = (progress?.timeMachineParts.length || 0) >= 5;

  return (
    <main className="relative min-h-screen flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* Background Portal Canvas */}
      <div className="absolute inset-0 z-0 opacity-30">
        <TimePortalCanvas eraColor="amber" speedMultiplier={0.9} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full bg-slate-900/80 border border-slate-700 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            onClick={() => audioSynth.playClick()}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-black text-amber-300 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Taller de la Máquina del Tiempo
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Ensambla los 5 artefactos legendarios para activar el retorno al presente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs font-bold text-amber-300">
            <span>{currentAvatar.emoji}</span>
            <span>⭐ {progress?.starsTotal || 0} Estrellas</span>
          </div>

          <AudioController />
        </div>
      </header>

      {/* Main Workshop Grid */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4">
        {/* Machine Core Visualizer (Cols 7) */}
        <div className="lg:col-span-7 bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <span>⚡</span> Estado del Motor Temporal
            </h3>
            <span className="text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full">
              {progress?.machineIntegrity || 20}% Operativo
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 via-emerald-400 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-md"
              style={{ width: `${progress?.machineIntegrity || 20}%` }}
            />
          </div>

          {/* 5 Artifact Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GAME_ERAS.map((era) => {
              const isCollected = progress?.timeMachineParts.includes(era.artifactName);

              return (
                <div
                  key={era.id}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    isCollected
                      ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-400 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                      isCollected
                        ? 'bg-emerald-900/40 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-slate-700 text-slate-600'
                    }`}
                  >
                    {isCollected ? era.artifactIcon : '🔒'}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {era.name.split('&')[0]}
                    </span>
                    <h4 className="text-xs font-black text-slate-100">{era.artifactName}</h4>
                    {isCollected ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ensamblado
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Por descubrir
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Engine Button */}
          <button
            onClick={handleTestWarp}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Probar Generador de Salto Temporal</span>
          </button>
        </div>

        {/* Medals & Badges (Cols 5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Medallero de Crononauta
            </h3>

            <div className="space-y-2.5">
              {GAME_ERAS.map((era) => {
                const isEarned = progress?.timeMachineParts.includes(era.artifactName);

                return (
                  <div
                    key={era.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isEarned
                        ? 'bg-indigo-950/60 border-amber-400/80 text-amber-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{isEarned ? '🏅' : '🎖️'}</span>
                      <div>
                        <h4 className="text-xs font-black">{era.badge}</h4>
                        <p className="text-[10px] text-slate-400">{era.name}</p>
                      </div>
                    </div>
                    {isEarned ? (
                      <span className="text-[11px] font-black text-amber-400">⭐⭐⭐</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold">Bloqueada</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/map"
            onClick={() => audioSynth.playClick()}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Volver al Mapa del Tiempo</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-xs text-slate-400 pt-2">
        <span>¡Cada palabra aprendida repara un engranaje del tiempo!</span>
      </footer>
    </main>
  );
}
