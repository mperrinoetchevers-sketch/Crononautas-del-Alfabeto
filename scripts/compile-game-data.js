const fs = require("fs");
const path = require("path");

function readJsonClean(filename) {
  const raw = fs.readFileSync(path.join(__dirname, filename), "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, "").trim());
}

const prehistory = readJsonClean("data-prehistory.json");
const egypt = readJsonClean("data-egypt.json");
const medieval = readJsonClean("data-medieval.json");
const industrial = readJsonClean("data-industrial.json");
const future = readJsonClean("data-future.json");

const eras = [prehistory, egypt, medieval, industrial, future];

const fileContent = `// Curricular Pedagogical Game Data for Crononautas del Alfabeto

export interface SyllableWord {
  id: string;
  word: string;
  syllables: string[];
  pictogram: string;
  category: string;
  hint: string;
}

export interface IntruderChallenge {
  id: string;
  instruction: string;
  type: 'semantic' | 'orthographic';
  options: {
    text: string;
    pictogram: string;
    isIntruder: boolean;
    reason: string;
  }[];
}

export interface MazeCollectible {
  id: string;
  letter: string;
  x: number;
  y: number;
  phonemeHint?: string;
}

export interface MazeChaser {
  name: string;
  emoji: string;
  startX: number;
  startY: number;
  moveIntervalMs: number;
  warningMessage: string;
}

export interface MazeChallenge {
  id: string;
  title: string;
  theme: string;
  targetWord: string;
  wordPictogram: string;
  grid: string[];
  collectibles: MazeCollectible[];
  chaser?: MazeChaser;
  hint: string;
}

export interface PyramidStep {
  text: string;
  highlightWords?: string[];
}

export interface PyramidChallenge {
  id: string;
  title: string;
  theme: string;
  steps: PyramidStep[];
  secretCodeWord: string;
  rewardArtifactPiece: string;
}

export interface WritingWord {
  id: string;
  word: string;
  syllables: string[];
  pictogram: string;
  hint: string;
  audioClue: string;
}

export interface WritingChallenge {
  id: string;
  title: string;
  instruction: string;
  words: WritingWord[];
}

export interface KamishibaiCard {
  id: string;
  sequenceIndex: number; // 1 to 4
  title: string;
  narrativeText: string;
  pictograms: string[];
  soundCue: 'drum' | 'portal' | 'chime' | 'celebration';
}

export interface KamishibaiStory {
  id: string;
  title: string;
  eraId: string;
  cards: KamishibaiCard[];
  moral: string;
}

export interface EscapeRiddle {
  id: string;
  title: string;
  storyPrompt: string;
  targetQuestion: string;
  expectedAnswer: string;
  audioClue: string;
  options?: string[];
}

export interface EraDefinition {
  id: string;
  name: string;
  periodLabel: string;
  icon: string;
  themeColor: string; // Tailwind color class
  bgGradient: string;
  badge: string;
  artifactName: string;
  artifactIcon: string;
  description: string;
  pedagogicalFocus: string;
  syllablesWords: SyllableWord[];
  intruderChallenges: IntruderChallenge[];
  mazeChallenge: MazeChallenge;
  pyramidChallenges: PyramidChallenge[];
  writingChallenge: WritingChallenge;
  kamishibaiStory: KamishibaiStory;
  escapeRiddle: EscapeRiddle;
}

export const GAME_ERAS: EraDefinition[] = ${JSON.stringify(eras, null, 2)};

export function getEraById(id: string): EraDefinition | undefined {
  return GAME_ERAS.find(e => e.id === id);
}

export function getAllEras(): EraDefinition[] {
  return GAME_ERAS;
}
`;

fs.writeFileSync(path.join(__dirname, "../lib/game-data.ts"), fileContent, "utf8");
console.log("Successfully compiled lib/game-data.ts with chasers!");
