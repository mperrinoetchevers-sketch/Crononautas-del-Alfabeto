import { describe, it, expect } from 'vitest';
import { GAME_ERAS, getEraById, getAllEras } from '../lib/game-data';

describe('Game Data & Pedagogical Eras', () => {
  it('should define exactly 5 historical eras', () => {
    const eras = getAllEras();
    expect(eras).toHaveLength(5);
    expect(eras.map(e => e.id)).toEqual(['prehistory', 'egypt', 'medieval', 'industrial', 'future']);
  });

  it('each era should have valid minigames, escape riddles and artifacts', () => {
    GAME_ERAS.forEach(era => {
      expect(era.name).toBeTruthy();
      expect(era.artifactName).toBeTruthy();
      expect(era.syllablesWords.length).toBeGreaterThanOrEqual(4);
      expect(era.intruderChallenges.length).toBeGreaterThanOrEqual(1);
      expect(era.pyramidChallenges.length).toBeGreaterThanOrEqual(1);
      expect(era.kamishibaiStory.cards).toHaveLength(4);
      expect(era.escapeRiddle.expectedAnswer).toBeTruthy();

      // Check syllable words
      era.syllablesWords.forEach(word => {
        expect(word.syllables.join('')).toBe(word.word.toLowerCase().replace(/[^a-záéíóúüñ]/gi, ''));
        expect(word.pictogram).toBeTruthy();
      });

      // Check intruder challenge
      era.intruderChallenges.forEach(ic => {
        const intruders = ic.options.filter(o => o.isIntruder);
        expect(intruders.length).toBe(1);
      });

      // Check kamishibai sequencing 1 to 4
      const indices = era.kamishibaiStory.cards.map(c => c.sequenceIndex).sort();
      expect(indices).toEqual([1, 2, 3, 4]);
    });
  });

  it('getEraById should return the correct era', () => {
    const egypt = getEraById('egypt');
    expect(egypt?.name).toContain('Egipto');
    expect(egypt?.artifactName).toBe('Escarabajo Dorado Sagrado');
  });
});
