// Web Speech API Wrapper with Spanish Dialect selection, Rate Modulation & Word Highlight Events

export interface TTSOptions {
  rate?: number; // 0.7 to 1.2 (default: 0.9 for 8-year-old learning pace)
  pitch?: number; // default: 1.05
  lang?: string; // default: 'es-ES' or 'es-AR' or 'es-MX'
  onWordBoundary?: (wordIndex: number, charIndex: number, length: number) => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

// Hyphenation dictionary for high-frequency educational words
const SYLLABLE_DICTIONARY: Record<string, string[]> = {
  'dinosaurio': ['di', 'no', 'sau', 'rio'],
  'dinosauro': ['di', 'no', 'sau', 'ro'],
  'fósil': ['fó', 'sil'],
  'fosil': ['fo', 'sil'],
  'volcán': ['vol', 'cán'],
  'volcan': ['vol', 'can'],
  'pirámide': ['pi', 'rá', 'mi', 'de'],
  'piramide': ['pi', 'ra', 'mi', 'de'],
  'castillo': ['cas', 'ti', 'llo'],
  'sol': ['sol'],
  'estrella': ['es', 'tre', 'lla'],
  'dragón': ['dra', 'gón'],
  'dragon': ['dra', 'gon'],
  'espada': ['es', 'pa', 'da'],
  'escudo': ['es', 'cu', 'do'],
  'rey': ['rey'],
  'reina': ['rei', 'na'],
  'tren': ['tren'],
  'vapor': ['va', 'por'],
  'máquina': ['má', 'qui', 'na'],
  'maquina': ['ma', 'qui', 'na'],
  'engranaje': ['en', 'gra', 'na', 'je'],
  'cohete': ['co', 'he', 'te'],
  'planeta': ['pla', 'ne', 'ta'],
  'robot': ['ro', 'bot'],
  'tiempo': ['tiem', 'po'],
  'portal': ['por', 'tal'],
  'llave': ['lla', 've'],
  'puerta': ['puer', 'ta'],
  'tesoro': ['te', 'so', 'ro'],
  'árbol': ['ár', 'bol'],
  'arbol': ['ar', 'bol'],
  'mamut': ['ma', 'mut'],
  'fuego': ['fue', 'go'],
  'cueva': ['cue', 'va'],
  'hueso': ['hue', 'so'],
  'pluma': ['plu', 'ma'],
  'arena': ['a', 're', 'na'],
  'momia': ['mo', 'mia'],
  'faraón': ['fa', 'ra', 'ón'],
  'faraon': ['fa', 'ra', 'on'],
  'río': ['rí', 'o'],
  'rio': ['ri', 'o'],
  'oro': ['o', 'ro'],
  'gato': ['ga', 'to'],
  'perro': ['pe', 'rro'],
  'libro': ['li', 'bro'],
  'mágico': ['má', 'gi', 'co'],
  'magico': ['ma', 'gi', 'co'],
};

// Algorithmic syllabification for Spanish words
export function splitIntoSyllables(rawWord: string): string[] {
  const normalized = rawWord.trim().toLowerCase().replace(/[^a-záéíóúüñ]/gi, '');
  if (!normalized) return [rawWord];

  if (SYLLABLE_DICTIONARY[normalized]) {
    return [...SYLLABLE_DICTIONARY[normalized]];
  }

  // Fallback Spanish Syllabifier heuristics
  const vowels = 'aáeéiíoóuúü';
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    current += char;

    const isVowel = vowels.includes(char);
    const nextChar = normalized[i + 1];
    const nextIsVowel = nextChar ? vowels.includes(nextChar) : false;
    const afterNext = normalized[i + 2];
    const afterNextIsVowel = afterNext ? vowels.includes(afterNext) : false;

    if (isVowel) {
      if (!nextChar) {
        // End of word
        syllables.push(current);
        current = '';
      } else if (!nextIsVowel) {
        // Next is consonant
        if (afterNextIsVowel) {
          // V-CV pattern -> break before consonant
          syllables.push(current);
          current = '';
        } else if (afterNext) {
          // V-CCV pattern -> check inseparable consonant clusters (bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr, ch, ll, rr)
          const pair = nextChar + afterNext;
          const clusters = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];
          if (clusters.includes(pair)) {
            syllables.push(current);
            current = '';
          } else {
            // Split between consonants: VC-CV
            current += nextChar;
            syllables.push(current);
            current = '';
            i++; // skip nextChar
          }
        }
      }
    }
  }

  if (current) {
    if (syllables.length > 0) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }

  return syllables.length > 0 ? syllables : [rawWord];
}

export function countSyllables(word: string): number {
  return splitIntoSyllables(word).length;
}

export function cleanTextForTTS(text: string): string {
  const trimmed = text.trim();
  // If it is a hyphenated sequence like "DI - NO - SAU - RIO" or "fó-sil"
  if (/^[a-záéíóúüñ\s-]+$/i.test(trimmed) && trimmed.includes('-')) {
    const compact = trimmed.replace(/[\s-]+/g, '');
    if (compact.length > 0 && !compact.includes(' ')) {
      return compact.toLowerCase();
    }
  }

  return trimmed
    .replace(/[¡¿]/g, '')
    .replace(/[!?]/g, '.')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class TTSEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private defaultRate: number = 0.9;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
    this.voice = spanishVoices.find(v => v.lang === 'es-AR') ||
                 spanishVoices.find(v => v.lang === 'es-ES') ||
                 spanishVoices.find(v => v.lang === 'es-MX') ||
                 spanishVoices[0] ||
                 null;
  }

  public setRate(rate: number) {
    this.defaultRate = Math.max(0.6, Math.min(1.5, rate));
  }

  public getRate(): number {
    return this.defaultRate;
  }

  public speak(text: string, options?: TTSOptions): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        options?.onEnd?.();
        resolve();
        return;
      }

      this.cancel();

      const cleaned = cleanTextForTTS(text);
      if (!cleaned) {
        options?.onEnd?.();
        resolve();
        return;
      }

      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.rate = options?.rate ?? this.defaultRate;
      utter.pitch = options?.pitch ?? 1.05;
      utter.lang = options?.lang ?? (this.voice?.lang || 'es-ES');
      if (this.voice) {
        utter.voice = this.voice;
      }

      if (options?.onWordBoundary) {
        utter.onboundary = (event) => {
          if (event.name === 'word') {
            options.onWordBoundary?.(0, event.charIndex, event.charLength || 4);
          }
        };
      }

      utter.onend = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
        resolve();
      };

      utter.onerror = (err) => {
        this.currentUtterance = null;
        options?.onError?.(err);
        resolve();
      };

      this.currentUtterance = utter;
      window.speechSynthesis.speak(utter);
    });
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public async speakSyllables(syllables: string[], onSyllable?: (index: number) => void): Promise<void> {
    for (let i = 0; i < syllables.length; i++) {
      onSyllable?.(i);
      await this.speak(syllables[i], { rate: 0.85 });
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

export const tts = new TTSEngine();
