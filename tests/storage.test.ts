import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager, DEFAULT_AVATARS } from '../lib/storage';

describe('Offline-First Storage Manager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
  });

  it('should list default available avatars for the 8-year-old child', () => {
    expect(DEFAULT_AVATARS.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_AVATARS.some(a => a.id === 'rex')).toBe(true);
    expect(DEFAULT_AVATARS.some(a => a.id === 'robot')).toBe(true);
  });

  it('should create and retrieve a player profile', () => {
    const profile = storage.createProfile('Valen', 'robot', 8);
    expect(profile.name).toBe('Valen');
    expect(profile.avatar).toBe('robot');
    expect(profile.age).toBe(8);

    const active = storage.getActiveProfile();
    expect(active?.id).toBe(profile.id);
    expect(active?.name).toBe('Valen');
  });

  it('should initialize game progress with prehistory unlocked', () => {
    const profile = storage.createProfile('Lucas', 'rex', 8);
    const progress = storage.getProgress(profile.id);

    expect(progress.unlockedEras).toEqual(['prehistory']);
    expect(progress.starsTotal).toBe(0);
    expect(progress.timeMachineParts).toEqual([]);
    expect(progress.machineIntegrity).toBe(20);
  });

  it('should record level completions and increase stars and machine integrity', () => {
    const profile = storage.createProfile('Sofi', 'scout', 8);
    let prog = storage.recordLevelCompletion(profile.id, 'prehistory_drums', 3, 'Cristal Fósil de Ámbar', 'egypt');

    expect(prog.starsTotal).toBe(3);
    expect(prog.completedLevels).toContain('prehistory_drums');
    expect(prog.timeMachineParts).toContain('Cristal Fósil de Ámbar');
    expect(prog.unlockedEras).toContain('egypt');
    expect(prog.machineIntegrity).toBeGreaterThan(20);
  });
});
