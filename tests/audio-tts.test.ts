import { describe, it, expect } from 'vitest';
import { splitIntoSyllables, countSyllables, cleanTextForTTS } from '../lib/tts';

describe('Syllable Analyzer & TTS Helpers', () => {
  it('should split common prehistoric and educational words into syllables correctly', () => {
    expect(splitIntoSyllables('dinosaurio')).toEqual(['di', 'no', 'sau', 'rio']);
    expect(splitIntoSyllables('fósil')).toEqual(['fó', 'sil']);
    expect(splitIntoSyllables('volcán')).toEqual(['vol', 'cán']);
    expect(splitIntoSyllables('pirámide')).toEqual(['pi', 'rá', 'mi', 'de']);
    expect(splitIntoSyllables('castillo')).toEqual(['cas', 'ti', 'llo']);
    expect(splitIntoSyllables('sol')).toEqual(['sol']);
    expect(splitIntoSyllables('estrella')).toEqual(['es', 'tre', 'lla']);
  });

  it('should count syllables accurately', () => {
    expect(countSyllables('dinosaurio')).toBe(4);
    expect(countSyllables('fósil')).toBe(2);
    expect(countSyllables('sol')).toBe(1);
    expect(countSyllables('pirámide')).toBe(4);
  });

  it('should clean text for TTS pronunciation', () => {
    expect(cleanTextForTTS('¡Hola, explorador! ¿Listos?')).toBe('Hola, explorador. Listos.');
    expect(cleanTextForTTS('DI - NO - SAU - RIO')).toBe('dinosaurio');
  });
});
