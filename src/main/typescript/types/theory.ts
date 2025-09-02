import { Note, Chord, Key, Scale } from './music';

export interface ChordSuggestion {
  chord: Chord;
  confidence: number; // 0-1
  reason: string;
  voicing?: string[];
}

export interface ProgressionAnalysis {
  key: Key;
  chords: Chord[];
  romanNumerals: string[];
  functions: ChordFunction[];
  suggestions: ChordSuggestion[];
}

export interface MelodyAnalysis {
  key: Key;
  scale: Scale;
  intervals: string[];
  direction: 'ascending' | 'descending' | 'mixed';
  range: {
    lowest: Note;
    highest: Note;
  };
  suggestions: MelodySuggestion[];
}

export interface MelodySuggestion {
  description: string;
  notes: Note[];
  reason: string;
}

export type ChordFunction = 'tonic' | 'subdominant' | 'dominant' | 'predominant' | 'secondary' | 'passing';

export interface ScalePattern {
  name: string;
  intervals: number[];
  description: string;
}

export interface MusicTheoryService {
  analyzeChordProgression(chords: Chord[]): ProgressionAnalysis;
  suggestNextChord(currentChords: Chord[], key: Key): ChordSuggestion[];
  analyzeMelody(notes: Note[], key: Key): MelodyAnalysis;
  getScaleNotes(key: Key, scaleType: string): Note[];
  identifyKey(notes: Note[]): Key[];
  getChordVoicings(chord: Chord): string[][];
  explainInterval(note1: Note, note2: Note): string;
  suggestMelody(chords: Chord[], key: Key): MelodySuggestion[];
}