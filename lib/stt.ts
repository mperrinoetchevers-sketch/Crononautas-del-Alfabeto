// Web Speech API Speech-to-Text Recognition Engine for Children's Reading Activities

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

// Compare spoken speech with target phrase with high tolerance for kids
export function calculateSpeechMatchScore(target: string, spoken: string): number {
  const normTarget = normalizeSpeechText(target);
  const normSpoken = normalizeSpeechText(spoken);

  if (!normTarget || !normSpoken) return 0;
  if (normTarget === normSpoken) return 1.0;
  if (normSpoken.includes(normTarget) || normTarget.includes(normSpoken)) return 0.95;

  const targetWords = normTarget.split(' ').filter(w => w.length > 1);
  const spokenWords = normSpoken.split(' ').filter(w => w.length > 1);

  if (targetWords.length === 0) return 0;

  // Count how many target words are spoken
  let matchedCount = 0;
  for (const tWord of targetWords) {
    const found = spokenWords.some(sWord => {
      if (sWord === tWord) return true;
      // Allow 1 letter difference for short words, 2 for longer
      if (Math.abs(sWord.length - tWord.length) <= 2) {
        if (sWord.includes(tWord) || tWord.includes(sWord)) return true;
        // Simple letter overlap check
        let common = 0;
        for (const char of tWord) {
          if (sWord.includes(char)) common++;
        }
        return common / tWord.length >= 0.7;
      }
      return false;
    });

    if (found) matchedCount++;
  }

  return matchedCount / targetWords.length;
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
        this.recognition.lang = 'es-AR'; // Defaults to Spanish
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
      const errorMsg = event.error === 'not-allowed'
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

      // Check if matches target phrase
      if (this.currentTargetText && spokenText) {
        const score = calculateSpeechMatchScore(this.currentTargetText, spokenText);
        // If score >= 65%, validate reading!
        if (score >= 0.65) {
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
