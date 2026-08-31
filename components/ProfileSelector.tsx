'use client';

import React, { useState, useEffect } from 'react';
import { User, Plus, Check, Sparkles, Cloud, CloudDownload, Copy, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { storage, PlayerProfile, DEFAULT_AVATARS } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface ProfileSelectorProps {
  onProfileChange?: (profile: PlayerProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabMode = 'list' | 'create' | 'recover';

export default function ProfileSelector({ onProfileChange, isOpen, onClose }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [mode, setMode] = useState<TabMode>('list');
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('rex');
  
  // Cloud recovery state
  const [recoverCode, setRecoverCode] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  useEffect(() => {
    const list = storage.getProfiles();
    const active = storage.getActiveProfile();
    setProfiles(list);
    if (active) {
      setActiveId(active.id);
    }
    setMode('list');
    setRecoveryError(null);

    const unsubscribe = storage.onSyncChange((status) => {
      setSyncStatus(status);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (profile: PlayerProfile) => {
    audioSynth.playClick();
    storage.setActiveProfile(profile.id);
    setActiveId(profile.id);
    onProfileChange?.(profile);
    tts.speak(`¡Bienvenido de nuevo, ${profile.name}!`);
    onClose();
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    audioSynth.playCelebration();
    const created = storage.createProfile(newName.trim(), selectedAvatar, 8);
    setProfiles(storage.getProfiles());
    setActiveId(created.id);
    setMode('list');
    setNewName('');
    onProfileChange?.(created);
    tts.speak(`¡Hola ${created.name}! Tu código de viajero es ${created.syncCode}.`);
    onClose();
  };

  const handleRecoverFromCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverCode.trim()) return;

    setIsRecovering(true);
    setRecoveryError(null);
    audioSynth.playClick();

    const result = await storage.recoverProfileFromCloud(recoverCode.trim());

    setIsRecovering(false);

    if (result) {
      audioSynth.playCelebration();
      setProfiles(storage.getProfiles());
      setActiveId(result.profile.id);
      onProfileChange?.(result.profile);
      tts.speak(
        `¡Progreso recuperado con éxito! Bienvenido de nuevo ${result.profile.name}. Tienes ${result.progress.starsTotal} estrellas.`
      );
      onClose();
    } else {
      audioSynth.playError();
      setRecoveryError(
        'No encontramos ningún explorador con ese código o nombre. Revisa el código o asegúrate de tener conexión.'
      );
    }
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      audioSynth.playClick();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">Exploradores del Tiempo</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-400 animate-pulse'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-slate-400">
                  {syncStatus === 'synced'
                    ? 'Sincronizado en la Nube'
                    : syncStatus === 'syncing'
                    ? 'Guardando en la Nube...'
                    : 'Modo Offline'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1 text-xs font-bold">
          <button
            onClick={() => setMode('list')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'list'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mis Perfiles
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              mode === 'create'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo
          </button>
          <button
            onClick={() => setMode('recover')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              mode === 'recover'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudDownload className="w-3.5 h-3.5" /> Nube
          </button>
        </div>

        {/* TAB 1: LIST PROFILES */}
        {mode === 'list' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 font-medium">
              Elige tu perfil para continuar o copia tu código para jugar en otro dispositivo:
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {profiles.map((p) => {
                const avatarObj = DEFAULT_AVATARS.find((a) => a.id === p.avatar) || DEFAULT_AVATARS[0];
                const isActive = p.id === activeId;
                const prog = storage.getProgress(p.id);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      isActive
                        ? 'bg-indigo-950/70 border-amber-400 shadow-lg'
                        : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectProfile(p)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-indigo-500/30">
                        {avatarObj.emoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          {p.name}
                          {isActive && (
                            <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                              Activo
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-amber-300 font-medium">
                          <span>⭐ {prog.starsTotal} Estrellas</span>
                          <span>•</span>
                          <span className="font-mono text-cyan-300 text-[10px] bg-slate-900 px-1.5 rounded">
                            {p.syncCode}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCopyCode(p.syncCode)}
                      title="Copiar código de viajero para otro dispositivo"
                      className="p-2 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-amber-300 rounded-xl border border-slate-700 transition-colors ml-2"
                    >
                      {copiedCode ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE PROFILE */}
        {mode === 'create' && (
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-400" /> Crear Nuevo Crononauta
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-bold">Nombre del Niño/a:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Leo, Sofi, Mateo..."
                maxLength={20}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">Elige tu Avatar de Viaje:</label>
              <div className="grid grid-cols-3 gap-2">
                {DEFAULT_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      audioSynth.playClick();
                      setSelectedAvatar(av.id);
                    }}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-all ${
                      selectedAvatar === av.id
                        ? 'bg-indigo-900 border-amber-400 shadow-md'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-300">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95"
            >
              ¡Comenzar Aventura y Guardar en Nube!
            </button>
          </form>
        )}

        {/* TAB 3: RECOVER FROM CLOUD */}
        {mode === 'recover' && (
          <form onSubmit={handleRecoverFromCloud} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-cyan-400" /> Recuperar Progreso de la Nube
              </h3>
              <p className="text-xs text-slate-300">
                Escribe tu <strong>Código de Viajero</strong> (ej: <code>REX-7492</code>) o el nombre de tu explorador para cargar tus estrellas y niveles en este dispositivo:
              </p>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={recoverCode}
                onChange={(e) => setRecoverCode(e.target.value)}
                placeholder="Ej: REX-4820 o Sofi"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-sm uppercase tracking-wider focus:outline-none focus:border-cyan-400"
              />
            </div>

            {recoveryError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{recoveryError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isRecovering || !recoverCode.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-40"
            >
              {isRecovering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Buscando en la Nube...
                </>
              ) : (
                <>
                  <CloudDownload className="w-4 h-4" /> Cargar Mi Progreso
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
