'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Sparkles, User, Trophy, Volume2, Shield, Brain, BookOpen } from 'lucide-react';
import TimePortalCanvas from '@/components/TimePortalCanvas';
import ProfileSelector from '@/components/ProfileSelector';
import AudioController from '@/components/AudioController';
import ParentDashboardModal from '@/components/ParentDashboardModal';
import { storage, PlayerProfile, DEFAULT_AVATARS } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

export default function LobbyPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);

  useEffect(() => {
    let current = storage.getActiveProfile();
    if (!current) {
      // Create initial default profile if empty
      current = storage.createProfile('Explorador', 'rex', 8);
    }
    setProfile(current);
  }, []);

  const handleStartGame = () => {
    audioSynth.playPortalWarp();
    tts.speak(`¡Iniciando viaje temporal! ¡A las máquinas, ${profile?.name || 'explorador'}!`);
  };

  const currentAvatar = DEFAULT_AVATARS.find((a) => a.id === profile?.avatar) || DEFAULT_AVATARS[0];
  const progress = profile ? storage.getProgress(profile.id) : null;

  return (
    <main className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 overflow-hidden bg-slate-950 text-slate-100">
      {/* Background 2D Time Portal Canvas */}
      <div className="absolute inset-0 z-0 opacity-40">
        <TimePortalCanvas eraColor="#6366f1" speedMultiplier={1.2} />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-amber-300">
            ⏳
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              CRONONAUTAS DEL ALFABETO
            </h1>
            <p className="text-[11px] text-indigo-300 font-bold hidden sm:block">
              Aventura 2D de Lectoescritura a través del Tiempo con IA Adaptativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Parent Dashboard Button */}
          <button
            onClick={() => {
              audioSynth.playClick();
              setIsParentDashboardOpen(true);
            }}
            title="Panel de Control para Padres y Educadores"
            className="flex items-center gap-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 px-3 py-1.5 rounded-2xl text-xs font-bold text-purple-300 shadow transition-all active:scale-95"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Panel Padres</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              audioSynth.playClick();
              setIsProfileModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-2xl border border-indigo-500/40 shadow transition-all active:scale-95"
          >
            <span className="text-xl">{currentAvatar.emoji}</span>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-amber-300">{profile?.name || 'Jugador'}</p>
              <p className="text-[10px] text-emerald-400 font-bold">⭐ {progress?.starsTotal || 0} Estrellas</p>
            </div>
          </button>

          {/* Audio Controls */}
          <AudioController />
        </div>
      </header>

      {/* Hero Body */}
      <div className="relative z-10 max-w-3xl mx-auto w-full text-center space-y-6 py-6 sm:py-12 my-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/50 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-200 shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>¡Una tormenta temporal dispersó las palabras de la historia!</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Viaja por la Historia,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Aprende a Leer Jugando
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Supera tambores de sílabas prehistóricos, caza palabras intrusas en Egipto, resuelve acertijos de castillos y domina el Gran Teatro Kamishibai.
          </p>
        </div>

        {/* Start Game Big CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <Link
            href="/map"
            onClick={handleStartGame}
            className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg rounded-3xl shadow-2xl flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 border-b-4 border-amber-800"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>¡INICIAR VIAJE TEMPORAL!</span>
          </Link>

          <Link
            href="/vocabulary"
            onClick={() => audioSynth.playClick()}
            className="w-full sm:w-auto px-6 py-4 bg-cyan-950/80 hover:bg-cyan-900 border-2 border-cyan-500/50 text-cyan-200 font-bold text-sm rounded-3xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span className="text-lg">🧪</span>
            <span>Laboratorio de Vocabulario IA</span>
          </Link>

          <Link
            href="/rewards"
            onClick={() => audioSynth.playClick()}
            className="w-full sm:w-auto px-6 py-4 bg-slate-900/80 hover:bg-slate-800 border-2 border-indigo-500/50 text-indigo-200 font-bold text-sm rounded-3xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Taller de la Máquina</span>
          </Link>
        </div>

        {/* Companion Greetings Box */}
        <div className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-5 max-w-lg mx-auto flex items-center gap-4 text-left shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-700 flex items-center justify-center text-3xl animate-bounce-slow flex-shrink-0 border-2 border-amber-400">
            🤖
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-300">Cronobot Guía</h4>
            <p className="text-xs text-slate-200 font-medium">
              &ldquo;¡Hola {profile?.name || 'explorador'}! ¿Listo para reparar la máquina del tiempo? ¡Toca Iniciar para viajar a la Prehistoria o explora el Laboratorio para descubrir nuevas palabras!&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2 pt-4">
        <span>Crononautas del Alfabeto • 100% Funcional Offline (PWA) con Resaltado Silábico y TTS</span>
        <span className="flex items-center gap-1 text-slate-400 font-bold">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> Seguridad RLS & Guardado Local Activo
        </span>
      </footer>

      {/* Profile Selector Modal */}
      <ProfileSelector
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileChange={(p) => setProfile(p)}
      />

      {/* Parent Dashboard Modal */}
      <ParentDashboardModal
        isOpen={isParentDashboardOpen}
        onClose={() => setIsParentDashboardOpen(false)}
      />
    </main>
  );
}
