// AI Learning Analytics & Adaptive Difficulty Engine for Crononautas del Alfabeto

import { supabase } from './supabase';

export interface PhonemeStats {
  phoneme: string; // e.g. 'TR', 'BL', 'CL', 'PR', 'CH', 'LL', 'RR', 'J', 'S', 'B', 'M', 'P'
  category: 'directa' | 'trabada' | 'digrafo' | 'inversa';
  attempts: number;
  successes: number;
  lastMistakeAt?: string;
}

export interface VocabularyWordItem {
  id: string;
  word: string;
  syllables: string[];
  pictogram: string;
  hint: string;
  sentence?: string;
  curiosity?: string;
  category: string;
  masteryLevel: number; // 0 to 3
  practicedCount: number;
  createdAt: string;
}

export interface LearningAnalytics {
  profileId: string;
  phonemeStats: Record<string, PhonemeStats>;
  readingSpeedWpm: number;
  totalWordsPracticed: number;
  accuracyRate: number; // 0 - 100 %
  favoriteTopics: string[];
  discoveredVocabulary: VocabularyWordItem[];
  recentErrors: { word: string; expected?: string; input?: string; timestamp: string }[];
  lastAiAnalysis?: {
    summary: string;
    readingLevel: string; // 'Explorador Inicial' | 'Navegante Silábico' | 'Crononauta Lector' | 'Maestro de las Palabras'
    strengths: string[];
    focusAreas: string[];
    recommendedActivities: string[];
    generatedAt: string;
  };
}

const ANALYTICS_KEY_PREFIX = 'crononautas_analytics_';

// Categorize common phonemes in Spanish
export function classifyPhoneme(ph: string): 'directa' | 'trabada' | 'digrafo' | 'inversa' {
  const upper = ph.toUpperCase();
  if (['BL', 'BR', 'CL', 'CR', 'DR', 'FL', 'FR', 'GL', 'GR', 'PL', 'PR', 'TR'].includes(upper)) {
    return 'trabada';
  }
  if (['CH', 'LL', 'RR', 'QU', 'GU'].includes(upper)) {
    return 'digrafo';
  }
  if (['AL', 'EL', 'IL', 'OL', 'UL', 'AS', 'ES', 'IS', 'OS', 'US', 'AN', 'EN', 'IN', 'ON', 'UN'].includes(upper)) {
    return 'inversa';
  }
  return 'directa';
}

// Extract phonemes of interest from a word
export function extractKeyPhonemes(word: string): string[] {
  const upper = word.toUpperCase();
  const phonemes: string[] = [];
  const patterns = [
    'BL', 'BR', 'CL', 'CR', 'DR', 'FL', 'FR', 'GL', 'GR', 'PL', 'PR', 'TR',
    'CH', 'LL', 'RR', 'QU', 'GU',
    'AL', 'EL', 'IL', 'OL', 'UL', 'AS', 'ES', 'IS', 'OS', 'US', 'AN', 'EN', 'IN', 'ON', 'UN',
    'J', 'Z', 'C', 'B', 'V', 'G', 'Ñ'
  ];

  for (const pat of patterns) {
    if (upper.includes(pat) && !phonemes.includes(pat)) {
      phonemes.push(pat);
    }
  }

  return phonemes.length > 0 ? phonemes : [upper.charAt(0)];
}

export class AiLearningEngine {
  public getAnalytics(profileId: string): LearningAnalytics {
    const defaultAnalytics: LearningAnalytics = {
      profileId,
      phonemeStats: {
        'MA': { phoneme: 'MA', category: 'directa', attempts: 5, successes: 5 },
        'PA': { phoneme: 'PA', category: 'directa', attempts: 5, successes: 5 },
        'TR': { phoneme: 'TR', category: 'trabada', attempts: 2, successes: 1 },
        'BL': { phoneme: 'BL', category: 'trabada', attempts: 2, successes: 1 },
        'CH': { phoneme: 'CH', category: 'digrafo', attempts: 3, successes: 3 },
        'LL': { phoneme: 'LL', category: 'digrafo', attempts: 2, successes: 2 },
      },
      readingSpeedWpm: 45,
      totalWordsPracticed: 12,
      accuracyRate: 92,
      favoriteTopics: ['Dinosaurios', 'Tortugas Ninja', 'Espacio'],
      discoveredVocabulary: [],
      recentErrors: [],
    };

    if (typeof window === 'undefined') return defaultAnalytics;

    try {
      const raw = localStorage.getItem(ANALYTICS_KEY_PREFIX + profileId);
      if (raw) {
        return { ...defaultAnalytics, ...JSON.parse(raw) };
      }
    } catch {}

    return defaultAnalytics;
  }

  public saveAnalytics(analytics: LearningAnalytics) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      ANALYTICS_KEY_PREFIX + analytics.profileId,
      JSON.stringify(analytics)
    );

    this.syncToSupabase(analytics).catch(() => {});
  }

  // Record an attempt during writing or syllable drum game
  public recordWordAttempt(
    profileId: string,
    word: string,
    success: boolean,
    mistakeContext?: { expected?: string; input?: string }
  ) {
    const analytics = this.getAnalytics(profileId);
    analytics.totalWordsPracticed += 1;

    const phonemes = extractKeyPhonemes(word);

    for (const ph of phonemes) {
      if (!analytics.phonemeStats[ph]) {
        analytics.phonemeStats[ph] = {
          phoneme: ph,
          category: classifyPhoneme(ph),
          attempts: 0,
          successes: 0,
        };
      }

      analytics.phonemeStats[ph].attempts += 1;
      if (success) {
        analytics.phonemeStats[ph].successes += 1;
      } else {
        analytics.phonemeStats[ph].lastMistakeAt = new Date().toISOString();
      }
    }

    if (!success) {
      analytics.recentErrors.unshift({
        word,
        expected: mistakeContext?.expected,
        input: mistakeContext?.input,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 20 errors
      analytics.recentErrors = analytics.recentErrors.slice(0, 20);
    }

    // Recalculate overall accuracy
    let totalAttempts = 0;
    let totalSuccesses = 0;
    for (const key in analytics.phonemeStats) {
      totalAttempts += analytics.phonemeStats[key].attempts;
      totalSuccesses += analytics.phonemeStats[key].successes;
    }
    analytics.accuracyRate =
      totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 100;

    this.saveAnalytics(analytics);
  }

  // Record voice recognition / reading in Pyramid or Kamishibai
  public recordReadingSpeed(
    profileId: string,
    wordCount: number,
    durationSeconds: number,
    matchedRatio: number
  ) {
    if (durationSeconds <= 0) return;
    const analytics = this.getAnalytics(profileId);
    const calculatedWpm = Math.round((wordCount / durationSeconds) * 60);

    // Exponential moving average for WPM
    if (analytics.readingSpeedWpm === 0) {
      analytics.readingSpeedWpm = calculatedWpm;
    } else {
      analytics.readingSpeedWpm = Math.round(
        analytics.readingSpeedWpm * 0.7 + calculatedWpm * 0.3
      );
    }

    this.saveAnalytics(analytics);
  }

  // Add a newly discovered word to player's dictionary
  public addDiscoveredWord(profileId: string, word: VocabularyWordItem) {
    const analytics = this.getAnalytics(profileId);
    const existingIdx = analytics.discoveredVocabulary.findIndex((w) => w.word.toUpperCase() === word.word.toUpperCase());

    if (existingIdx >= 0) {
      analytics.discoveredVocabulary[existingIdx].practicedCount += 1;
      analytics.discoveredVocabulary[existingIdx].masteryLevel = Math.min(
        3,
        analytics.discoveredVocabulary[existingIdx].masteryLevel + 1
      );
    } else {
      analytics.discoveredVocabulary.unshift(word);
    }

    if (!analytics.favoriteTopics.includes(word.category)) {
      analytics.favoriteTopics.push(word.category);
    }

    this.saveAnalytics(analytics);
  }

  // Get phonemes with highest error rates for adaptive focus
  public getTopWeakPhonemes(profileId: string, limit: number = 3): string[] {
    const analytics = this.getAnalytics(profileId);
    const statsList = Object.values(analytics.phonemeStats);

    // Calculate error rate
    const scored = statsList.map((stat) => {
      const errorRate = stat.attempts > 0 ? (stat.attempts - stat.successes) / stat.attempts : 0;
      return { phoneme: stat.phoneme, errorRate, attempts: stat.attempts };
    });

    // Sort by highest error rate, then by attempts
    scored.sort((a, b) => b.errorRate - a.errorRate || b.attempts - a.attempts);

    const weak = scored.filter((s) => s.errorRate > 0).map((s) => s.phoneme);
    return weak.length > 0 ? weak.slice(0, limit) : ['TR', 'BL', 'CH'];
  }

  // Sync metrics to Supabase cloud
  public async syncToSupabase(analytics: LearningAnalytics): Promise<boolean> {
    try {
      const { error } = await supabase.from('player_learning_metrics').upsert(
        {
          profile_id: analytics.profileId,
          phoneme_stats: analytics.phonemeStats,
          reading_speed_wpm: analytics.readingSpeedWpm,
          accuracy_rate: analytics.accuracyRate,
          total_words_practiced: analytics.totalWordsPracticed,
          discovered_vocabulary: analytics.discoveredVocabulary,
          recent_errors: analytics.recentErrors,
          last_ai_analysis: analytics.lastAiAnalysis,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id' }
      );

      if (error) {
        console.warn('Learning metrics sync warning:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const aiLearningEngine = new AiLearningEngine();
