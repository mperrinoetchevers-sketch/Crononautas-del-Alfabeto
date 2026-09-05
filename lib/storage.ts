// Offline-first Storage Repository with LocalStorage and Supabase Multi-Device Cloud Sync

import { supabase } from './supabase';

export interface PlayerProfile {
  id: string;
  syncCode: string; // Friendly recovery code (e.g. 'CRONO-8492' or 'REX-3810')
  name: string;
  avatar: string; // 'rex' | 'ninja_turtle' | 'ninja_master' | 'scout' | 'robot' | 'knight' | 'astronaut' | 'wizard'
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
  { id: 'ninja_turtle', emoji: '🐢', label: 'Tortuga Ninja' },
  { id: 'ninja_master', emoji: '🥷', label: 'Sensei Ninja' },
  { id: 'scout', emoji: '🧭', label: 'Explorador' },
  { id: 'robot', emoji: '🤖', label: 'Cronobot' },
  { id: 'knight', emoji: '🛡️', label: 'Caballero' },
  { id: 'astronaut', emoji: '🚀', label: 'Astronauta' },
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Mago del Tiempo' },
];

function generateFriendlyCode(avatar: string): string {
  const prefix = avatar.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'CRONO';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

export class StorageManager {
  private syncListeners: ((status: 'synced' | 'syncing' | 'offline' | 'error') => void)[] = [];
  public syncStatus: 'synced' | 'syncing' | 'offline' | 'error' = 'synced';

  public onSyncChange(listener: (status: 'synced' | 'syncing' | 'offline' | 'error') => void) {
    this.syncListeners.push(listener);
    listener(this.syncStatus);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  private notifySync(status: 'synced' | 'syncing' | 'offline' | 'error') {
    this.syncStatus = status;
    this.syncListeners.forEach((l) => l(status));
  }

  // Profiles
  public getProfiles(): PlayerProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      const list: PlayerProfile[] = raw ? JSON.parse(raw) : [];
      return list.map((p) => ({
        ...p,
        syncCode: p.syncCode || generateFriendlyCode(p.avatar || 'crono'),
      }));
    } catch {
      return [];
    }
  }

  public getActiveProfile(): PlayerProfile | null {
    if (typeof window === 'undefined') return null;
    const profiles = this.getProfiles();
    if (profiles.length === 0) return null;
    const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    return profiles.find((p) => p.id === activeId) || profiles[0];
  }

  public setActiveProfile(profileId: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    this.pullCloudProgress(profileId).catch(() => {});
  }

  public createProfile(name: string, avatar: string = 'rex', age: number = 8): PlayerProfile {
    const syncCode = generateFriendlyCode(avatar);
    const profile: PlayerProfile = {
      id: `p_${syncCode.replace('-', '_')}`,
      syncCode,
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
    // 6 total eras: 20% base + 13.3% per artifact
    progress.machineIntegrity = Math.min(100, Math.round(20 + (progress.timeMachineParts.length / 6) * 80));
    localStorage.setItem(PROGRESS_KEY_PREFIX + progress.profileId, JSON.stringify(progress));

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

  // ==========================================
  // SUPABASE CLOUD SYNC & RECOVERY ENGINE
  // ==========================================

  public async syncProfileToSupabase(profile: PlayerProfile): Promise<boolean> {
    try {
      this.notifySync('syncing');
      const { error } = await supabase.from('player_profiles').upsert(
        {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          age: profile.age,
          created_at: profile.createdAt,
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.warn('Supabase profile sync error:', error.message);
        this.notifySync('error');
        return false;
      }

      this.notifySync('synced');
      return true;
    } catch {
      this.notifySync('offline');
      return false;
    }
  }

  public async syncProgressToSupabase(progress: GameProgress): Promise<boolean> {
    try {
      this.notifySync('syncing');
      const { error } = await supabase.from('game_progress').upsert(
        {
          profile_id: progress.profileId,
          unlocked_eras: progress.unlockedEras,
          stars_total: progress.starsTotal,
          time_machine_parts: progress.timeMachineParts,
          completed_levels: progress.completedLevels,
          updated_at: progress.lastPlayedAt,
        },
        { onConflict: 'profile_id' }
      );

      if (error) {
        console.warn('Supabase progress sync error:', error.message);
        this.notifySync('error');
        return false;
      }

      this.notifySync('synced');
      return true;
    } catch {
      this.notifySync('offline');
      return false;
    }
  }

  // Pull latest progress from cloud to local device
  public async pullCloudProgress(profileId: string): Promise<GameProgress | null> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error || !data) return null;

      const localProg = this.getProgress(profileId);

      const mergedUnlocked = Array.from(
        new Set([...(localProg.unlockedEras || []), ...(data.unlocked_eras || [])])
      );
      const mergedLevels = Array.from(
        new Set([...(localProg.completedLevels || []), ...(data.completed_levels || [])])
      );
      const mergedArtifacts = Array.from(
        new Set([...(localProg.timeMachineParts || []), ...(data.time_machine_parts || [])])
      );

      const mergedProgress: GameProgress = {
        profileId,
        unlockedEras: mergedUnlocked.length > 0 ? mergedUnlocked : ['prehistory'],
        starsTotal: Math.max(localProg.starsTotal || 0, data.stars_total || 0),
        completedLevels: mergedLevels,
        timeMachineParts: mergedArtifacts,
        machineIntegrity: Math.min(100, Math.round(20 + (mergedArtifacts.length / 6) * 80)),
        lastPlayedAt: new Date().toISOString(),
      };

      localStorage.setItem(PROGRESS_KEY_PREFIX + profileId, JSON.stringify(mergedProgress));
      this.notifySync('synced');
      return mergedProgress;
    } catch {
      return null;
    }
  }

  // Recover profile from Cloud using Code or Name on ANY device
  public async recoverProfileFromCloud(
    queryCodeOrName: string
  ): Promise<{ profile: PlayerProfile; progress: GameProgress } | null> {
    try {
      this.notifySync('syncing');
      const clean = queryCodeOrName.trim();
      if (!clean) return null;

      const formattedCode = clean.toUpperCase();
      const possibleId1 = `p_${formattedCode.replace('-', '_')}`;
      const possibleId2 = clean;

      let { data: profileRow, error } = await supabase
        .from('player_profiles')
        .select('*')
        .or(`id.eq.${possibleId1},id.eq.${possibleId2},name.ilike.${clean}`)
        .limit(1)
        .single();

      if (error || !profileRow) {
        this.notifySync('error');
        return null;
      }

      const syncCode =
        profileRow.id.startsWith('p_')
          ? profileRow.id.replace('p_', '').replace('_', '-')
          : generateFriendlyCode(profileRow.avatar || 'crono');

      const profile: PlayerProfile = {
        id: profileRow.id,
        syncCode,
        name: profileRow.name,
        avatar: profileRow.avatar || 'rex',
        age: profileRow.age || 8,
        createdAt: profileRow.created_at || new Date().toISOString(),
      };

      const { data: progressRow } = await supabase
        .from('game_progress')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      const progress: GameProgress = {
        profileId: profile.id,
        unlockedEras: progressRow?.unlocked_eras || ['prehistory'],
        starsTotal: progressRow?.stars_total || 0,
        completedLevels: progressRow?.completed_levels || [],
        timeMachineParts: progressRow?.time_machine_parts || [],
        machineIntegrity: progressRow
          ? Math.min(100, Math.round(20 + ((progressRow.time_machine_parts?.length || 0) / 6) * 80))
          : 20,
        lastPlayedAt: progressRow?.updated_at || new Date().toISOString(),
      };

      const existingProfiles = this.getProfiles();
      const alreadySaved = existingProfiles.some((p) => p.id === profile.id);
      if (!alreadySaved) {
        existingProfiles.push(profile);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(existingProfiles));
      }

      this.setActiveProfile(profile.id);
      localStorage.setItem(PROGRESS_KEY_PREFIX + profile.id, JSON.stringify(progress));

      this.notifySync('synced');
      return { profile, progress };
    } catch (err) {
      console.warn('Profile recovery failed:', err);
      this.notifySync('offline');
      return null;
    }
  }
}

export const storage = new StorageManager();
