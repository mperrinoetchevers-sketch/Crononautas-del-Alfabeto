// Web Speech API Speech-to-Text Recognition Engine with Strict Multi-Word Sentence Verification

export interface STTOptions {
  lang?: string; // default: 'es-ES' or 'es-AR'
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onMatch?: (transcript: string, score: number) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

// Normalize Spanish text for child-tolerant phonetic comparison
export function normalizeSpeechText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents / tildes
    .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ')
    .trim();
}

// Compare spoken speech with target phrase ensuring the entire sentence (or >=80%) is read
export function calculateSpeechMatchScore(target: string, spoken: string): number {
  const normTarget = normalizeSpeechText(target);
  const normSpoken = normalizeSpeechText(spoken);

  if (!normTarget || !normSpoken) return 0;
  if (normTarget === normSpoken) return 1.0;

  const targetWords = normTarget.split(' ').filter((w) => w.trim().length > 0);
  const spokenWords = normSpoken.split(' ').filter((w) => w.trim().length > 0);

  if (targetWords.length === 0 || spokenWords.length === 0) return 0;

  // Exact full match or spoken contains entire target sentence
  if (normSpoken.includes(normTarget)) {
    return 1.0;
  }

  // Single word target
  if (targetWords.length === 1) {
    const t = targetWords[0];
    const exactFound = spokenWords.some((s) => s === t);
    if (exactFound) return 1.0;

    const fuzzyFound = spokenWords.some((s) => {
      if (Math.abs(s.length - t.length) <= 2) {
        let common = 0;
        for (const c of t) {
          if (s.includes(c)) common++;
        }
        return common / t.length >= 0.75;
      }
      return false;
    });
    return fuzzyFound ? 0.85 : 0;
  }

  // 2-word sentences: require speaking at least 2 words
  if (targetWords.length === 2) {
    if (spokenWords.length < 2) return 0;
  }

  // Multi-word sentences (3+ words): require speaking at least 75% of the word count
  const minRequiredSpokenLength = Math.max(2, Math.floor(targetWords.length * 0.75));
  if (spokenWords.length < minRequiredSpokenLength) {
    return 0; // Child only spoke 1 or 2 words of a longer sentence!
  }

  // Calculate matched words
  let matchedTargetWords = 0;
  const usedSpokenIndices = new Set<number>();

  for (let i = 0; i < targetWords.length; i++) {
    const tWord = targetWords[i];
    let foundIdx = -1;

    for (let j = 0; j < spokenWords.length; j++) {
      if (usedSpokenIndices.has(j)) continue;
      const sWord = spokenWords[j];

      if (sWord === tWord) {
        foundIdx = j;
        break;
      } else if (Math.abs(sWord.length - tWord.length) <= 1 && tWord.length >= 3) {
        let common = 0;
        for (const char of tWord) {
          if (sWord.includes(char)) common++;
        }
        if (common / tWord.length >= 0.75) {
          foundIdx = j;
          break;
        }
      }
    }

    if (foundIdx !== -1) {
      usedSpokenIndices.add(foundIdx);
      matchedTargetWords++;
    }
  }

  const matchRatio = matchedTargetWords / targetWords.length;
  return matchRatio;
}

// Helper to determine which words of the target sentence have been read so far
export function getMatchedWordIndices(target: string, spoken: string): Set<number> {
  const normTarget = normalizeSpeechText(target);
  const normSpoken = normalizeSpeechText(spoken);
  const matched = new Set<number>();

  if (!normTarget || !normSpoken) return matched;

  const targetWords = normTarget.split(' ').filter((w) => w.trim().length > 0);
  const spokenWords = normSpoken.split(' ').filter((w) => w.trim().length > 0);

  const usedSpoken = new Set<number>();

  for (let i = 0; i < targetWords.length; i++) {
    const tWord = targetWords[i];
    for (let j = 0; j < spokenWords.length; j++) {
      if (usedSpoken.has(j)) continue;
      const sWord = spokenWords[j];

      if (
        sWord === tWord ||
        (Math.abs(sWord.length - tWord.length) <= 1 &&
          tWord.length >= 3 &&
          sWord.includes(tWord))
      ) {
        usedSpoken.add(j);
        matched.add(i);
        break;
      }
    }
  }

  return matched;
}

export class SpeechRecognitionEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentTargetText: string = '';
  private currentOptions: STTOptions | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-AR';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;

        this.setupHandlers();
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.currentOptions?.onStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.currentOptions?.onEnd?.();
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorMsg =
        event.error === 'not-allowed'
          ? 'Permiso de micrófono denegado'
          : event.error === 'no-speech'
          ? 'No se detectó voz'
          : `Error de audio: ${event.error}`;
      this.currentOptions?.onError?.(errorMsg);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const spokenText = finalTranscript || interimTranscript;
      const isFinal = Boolean(finalTranscript);

      this.currentOptions?.onTranscript?.(spokenText, isFinal);

      // Verify if spoken text completes the full target sentence
      if (this.currentTargetText && spokenText) {
        const score = calculateSpeechMatchScore(this.currentTargetText, spokenText);
        const targetWords = normalizeSpeechText(this.currentTargetText)
          .split(' ')
          .filter((w) => w.trim().length > 0);

        // Required score:
        // 1-2 words: 0.90+
        // 3+ words: 0.80+ (at least 80% of words spoken)
        const requiredScore = targetWords.length <= 2 ? 0.9 : 0.8;

        if (score >= requiredScore) {
          this.currentOptions?.onMatch?.(spokenText, score);
          this.stop();
        }
      }
    };
  }

  public start(targetText: string, options: STTOptions = {}): boolean {
    if (!this.recognition) {
      options.onError?.('El reconocimiento de voz no está soportado en este navegador.');
      return false;
    }

    try {
      if (this.isListening) {
        this.recognition.stop();
      }

      this.currentTargetText = targetText;
      this.currentOptions = options;
      this.recognition.lang = options.lang || 'es-AR';

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      options.onError?.('No se pudo iniciar el micrófono.');
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.isListening = false;
    }
  }
}

export const stt = new SpeechRecognitionEngine();
