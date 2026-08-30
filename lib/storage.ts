// Offline-first Storage Repository with LocalStorage/IndexedDB and Supabase RLS sync

import { supabase } from './supabase';

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string; // 'rex' | 'scout' | 'robot' | 'knight' | 'astronaut'
  age: number;
  createdAt: string;
}

export interface GameProgress {
  profileId: string;
  unlockedEras: string[]; // ['prehistory', 'egypt', ...]
  starsTotal: number;
  completedLevels: string[]; // ['prehistory_drums', 'prehistory_intruder', ...]
  timeMachineParts: string[]; // ['Cristal Fósil de Ámbar', ...]
  machineIntegrity: number; // 0 to 100 %
  lastPlayedAt: string;
}

const PROFILES_KEY = 'crononautas_profiles';
const ACTIVE_PROFILE_KEY = 'crononautas_active_profile_id';
const PROGRESS_KEY_PREFIX = 'crononautas_progress_';

export const DEFAULT_AVATARS = [
  { id: 'rex', emoji: '🦖', label: 'T-Rex' },
  { id: 'scout', emoji: '🧭', label: 'Explorador' },
  { id: 'robot', emoji: '🤖', label: 'Cronobot' },
  { id: 'knight', emoji: '🛡️', label: 'Caballero' },
  { id: 'astronaut', emoji: '🚀', label: 'Astronauta' },
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Mago del Tiempo' },
];

export class StorageManager {
  // Profiles
  public getProfiles(): PlayerProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getActiveProfile(): PlayerProfile | null {
    if (typeof window === 'undefined') return null;
    const profiles = this.getProfiles();
    if (profiles.length === 0) return null;
    const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    return profiles.find(p => p.id === activeId) || profiles[0];
  }

  public setActiveProfile(profileId: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  }

  public createProfile(name: string, avatar: string = 'rex', age: number = 8): PlayerProfile {
    const profile: PlayerProfile = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Crononauta',
      avatar,
      age,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const profiles = this.getProfiles();
      profiles.push(profile);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      this.setActiveProfile(profile.id);
      this.initProgress(profile.id);

      // Async sync to Supabase if connected
      this.syncProfileToSupabase(profile).catch(() => {});
    }

    return profile;
  }

  // Progress
  public getProgress(profileId: string): GameProgress {
    const defaultProgress: GameProgress = {
      profileId,
      unlockedEras: ['prehistory'],
      starsTotal: 0,
      completedLevels: [],
      timeMachineParts: [],
      machineIntegrity: 20,
      lastPlayedAt: new Date().toISOString(),
    };

    if (typeof window === 'undefined') return defaultProgress;

    try {
      const raw = localStorage.getItem(PROGRESS_KEY_PREFIX + profileId);
      if (raw) {
        return { ...defaultProgress, ...JSON.parse(raw) };
      }
    } catch {}

    return defaultProgress;
  }

  public initProgress(profileId: string): GameProgress {
    const prog = this.getProgress(profileId);
    this.saveProgress(prog);
    return prog;
  }

  public saveProgress(progress: GameProgress) {
    if (typeof window === 'undefined') return;
    progress.lastPlayedAt = new Date().toISOString();
    // Calculate machine integrity: 20% base + 16% per collected artifact
    progress.machineIntegrity = Math.min(100, 20 + progress.timeMachineParts.length * 16);
    localStorage.setItem(PROGRESS_KEY_PREFIX + progress.profileId, JSON.stringify(progress));

    // Async sync to Supabase
    this.syncProgressToSupabase(progress).catch(() => {});
  }

  public recordLevelCompletion(
    profileId: string,
    levelKey: string,
    starsEarned: number,
    artifactEarned?: string,
    nextEraId?: string
  ): GameProgress {
    const prog = this.getProgress(profileId);

    if (!prog.completedLevels.includes(levelKey)) {
      prog.completedLevels.push(levelKey);
      prog.starsTotal += starsEarned;
    }

    if (artifactEarned && !prog.timeMachineParts.includes(artifactEarned)) {
      prog.timeMachineParts.push(artifactEarned);
    }

    if (nextEraId && !prog.unlockedEras.includes(nextEraId)) {
      prog.unlockedEras.push(nextEraId);
    }

    this.saveProgress(prog);
    return prog;
  }

  // Supabase RLS Sync
  private async syncProfileToSupabase(profile: PlayerProfile) {
    try {
      await supabase.from('player_profiles').upsert({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        age: profile.age,
        created_at: profile.createdAt,
      });
    } catch {
      // Offline mode safe ignore
    }
  }

  private async syncProgressToSupabase(progress: GameProgress) {
    try {
      await supabase.from('game_progress').upsert({
        profile_id: progress.profileId,
        unlocked_eras: progress.unlockedEras,
        stars_total: progress.starsTotal,
        time_machine_parts: progress.timeMachineParts,
        completed_levels: progress.completedLevels,
        updated_at: progress.lastPlayedAt,
      });
    } catch {
      // Offline mode safe ignore
    }
  }
}

export const storage = new StorageManager();
