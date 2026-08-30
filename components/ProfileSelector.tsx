'use client';

import React, { useState, useEffect } from 'react';
import { User, Plus, Check, Sparkles } from 'lucide-react';
import { storage, PlayerProfile, DEFAULT_AVATARS } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

interface ProfileSelectorProps {
  onProfileChange?: (profile: PlayerProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSelector({ onProfileChange, isOpen, onClose }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('rex');

  useEffect(() => {
    const list = storage.getProfiles();
    const active = storage.getActiveProfile();
    setProfiles(list);
    if (active) {
      setActiveId(active.id);
    }
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
    setIsCreating(false);
    setNewName('');
    onProfileChange?.(created);
    tts.speak(`¡Hola ${created.name}! Preparando tu máquina del tiempo.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <h2 className="text-xl font-black text-amber-300">Exploradores del Tiempo</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 font-medium">
              Elige tu perfil de explorador para continuar tu aventura o crea uno nuevo:
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {profiles.map((p) => {
                const avatarObj = DEFAULT_AVATARS.find(a => a.id === p.avatar) || DEFAULT_AVATARS[0];
                const isActive = p.id === activeId;
                const prog = storage.getProgress(p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                      isActive
                        ? 'bg-indigo-900/50 border-amber-400 shadow-lg'
                        : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-indigo-500/30">
                        {avatarObj.emoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{p.name}</h4>
                        <p className="text-[11px] text-amber-300">⭐ {prog.starsTotal} Estrellas • {prog.unlockedEras.length}/5 Épocas</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="bg-amber-400 text-slate-950 p-1.5 rounded-full font-bold">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                audioSynth.playClick();
                setIsCreating(true);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Explorador
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-400" /> Nuevo Crononauta
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

            <div className="space-y-2">
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
                    className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
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

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                ¡Comenzar Viaje!
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
