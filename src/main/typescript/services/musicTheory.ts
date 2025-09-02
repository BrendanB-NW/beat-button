import { 
  MusicTheoryService, 
  ChordSuggestion, 
  ProgressionAnalysis, 
  MelodyAnalysis,
  MelodySuggestion,
  ChordFunction 
} from '@/types/theory';
import { Note, Chord, Key, Scale } from '@/types/music';

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_PATTERNS: Record<string, number[]> = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'phrygian': [0, 1, 3, 5, 7, 8, 10],
  'lydian': [0, 2, 4, 6, 7, 9, 11],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'aeolian': [0, 2, 3, 5, 7, 8, 10], // natural minor
  'locrian': [0, 1, 3, 5, 6, 8, 10]
};

const CHORD_QUALITIES: Record<string, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  'major7': [0, 4, 7, 11],
  'minor7': [0, 3, 7, 10],
  'dominant7': [0, 4, 7, 10],
  'diminished7': [0, 3, 6, 9]
};

const ROMAN_NUMERALS = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

const CHORD_FUNCTIONS: ChordFunction[][] = [
  ['tonic'], ['subdominant'], ['tonic'], ['subdominant'], 
  ['dominant'], ['tonic'], ['dominant']
];

export class TheoryService implements MusicTheoryService {
  
  analyzeChordProgression(chords: Chord[]): ProgressionAnalysis {
    if (chords.length === 0) {
      throw new Error('Cannot analyze empty chord progression');
    }

    // Identify key based on chord roots
    const key = this.identifyKeyFromChords(chords);
    const romanNumerals = this.getChordsInRomanNumerals(chords, key);
    const functions = this.getChordFunctions(romanNumerals, key);
    const suggestions = this.suggestNextChord(chords, key);

    return {
      key,
      chords,
      romanNumerals,
      functions,
      suggestions
    };
  }

  suggestNextChord(currentChords: Chord[], key: Key): ChordSuggestion[] {
    if (currentChords.length === 0) {
      return this.getCommonFirstChords(key);
    }

    const lastChord = currentChords[currentChords.length - 1];
    if (!lastChord) return [];
    const lastRomanNumeral = this.getChordRomanNumeral(lastChord, key);
    
    return this.getChordProgressionSuggestions(lastRomanNumeral, key);
  }

  analyzeMelody(notes: Note[], key: Key): MelodyAnalysis {
    if (notes.length === 0) {
      throw new Error('Cannot analyze empty melody');
    }

    const scale = this.getScale(key.tonic, key.mode);
    const intervals = this.analyzeIntervals(notes);
    const direction = this.analyzeMelodyDirection(notes);
    const range = this.getMelodyRange(notes);
    const suggestions = this.suggestMelodyImprovements(notes, key);

    return {
      key,
      scale,
      intervals,
      direction,
      range,
      suggestions
    };
  }

  getScaleNotes(key: Key, scaleType: string): Note[] {
    const pattern = SCALE_PATTERNS[scaleType] || SCALE_PATTERNS[key.mode] || SCALE_PATTERNS.major;
    const rootIndex = CHROMATIC_NOTES.indexOf(key.tonic);
    
    return pattern.map((interval, index) => ({
      id: `scale_note_${index}`,
      pitch: rootIndex + interval + 60, // Start from middle C
      velocity: 64,
      startTime: 0,
      duration: 1,
      trackId: 'theory_helper'
    }));
  }

  identifyKey(notes: Note[]): Key[] {
    const pitchClasses = notes.map(note => note.pitch % 12);
    const uniquePitches = [...new Set(pitchClasses)];
    
    const keyScores: { key: Key; score: number }[] = [];

    // Test each possible key and mode
    for (const tonic of CHROMATIC_NOTES) {
      for (const [mode, pattern] of Object.entries(SCALE_PATTERNS)) {
        const tonicIndex = CHROMATIC_NOTES.indexOf(tonic);
        const scaleNotes = pattern.map(interval => (tonicIndex + interval) % 12);
        
        // Score based on how many melody notes fit in this scale
        let score = 0;
        for (const pitch of uniquePitches) {
          if (scaleNotes.includes(pitch)) {
            score++;
          }
        }
        
        keyScores.push({
          key: { tonic, mode },
          score: score / uniquePitches.length
        });
      }
    }

    // Return top 3 most likely keys
    return keyScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.key);
  }

  getChordVoicings(chord: Chord): string[][] {
    const rootIndex = CHROMATIC_NOTES.indexOf(chord.root);
    const quality = CHORD_QUALITIES[chord.quality] || CHORD_QUALITIES.major;
    
    const voicings: string[][] = [];
    
    // Root position
    voicings.push(quality.map(interval => CHROMATIC_NOTES[(rootIndex + interval) % 12] || 'C'));
    
    // First inversion
    if (quality.length >= 3) {
      const firstInv = [quality[1] || 0, quality[2] || 0, (quality[0] || 0) + 12];
      voicings.push(firstInv.map(interval => 
        CHROMATIC_NOTES[(rootIndex + interval) % 12] || 'C'
      ));
    }
    
    // Second inversion
    if (quality.length >= 3) {
      const secondInv = [quality[2] || 0, (quality[0] || 0) + 12, (quality[1] || 0) + 12];
      voicings.push(secondInv.map(interval => 
        CHROMATIC_NOTES[(rootIndex + interval) % 12] || 'C'
      ));
    }

    return voicings;
  }

  explainInterval(note1: Note, note2: Note): string {
    const semitones = Math.abs(note2.pitch - note1.pitch);
    const intervalNames = [
      'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
      'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th',
      'Minor 7th', 'Major 7th', 'Octave'
    ];
    
    const intervalIndex = semitones % 12;
    const octaves = Math.floor(semitones / 12);
    
    let description = intervalNames[intervalIndex] || 'Unknown interval';
    if (octaves > 0) {
      description += ` + ${octaves} octave${octaves > 1 ? 's' : ''}`;
    }
    
    return description;
  }

  suggestMelody(chords: Chord[], key: Key): MelodySuggestion[] {
    const suggestions: MelodySuggestion[] = [];
    const scaleNotes = this.getScaleNotes(key, key.mode);
    
    // Suggest chord tones for each chord
    chords.forEach((chord, index) => {
      const chordTones = this.getChordTones(chord);
      const notes: Note[] = chordTones.map(tone => ({
        id: `suggestion_${index}_${tone}`,
        pitch: tone + 60,
        velocity: 80,
        startTime: index * 4, // One chord per measure
        duration: 1,
        trackId: 'melody_suggestion'
      }));
      
      suggestions.push({
        description: `Chord tones for ${chord.root} ${chord.quality}`,
        notes,
        reason: 'Chord tones provide strong harmonic support and are always safe choices for melody.'
      });
    });

    return suggestions;
  }

  private identifyKeyFromChords(chords: Chord[]): Key {
    // Simple heuristic: most common chord root is likely the key
    const rootCounts = new Map<string, number>();
    
    chords.forEach(chord => {
      rootCounts.set(chord.root, (rootCounts.get(chord.root) || 0) + 1);
    });
    
    const mostCommonRoot = Array.from(rootCounts.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'C';
    
    // Determine if major or minor based on chord qualities
    const majorChords = chords.filter(c => c.quality === 'major').length;
    const minorChords = chords.filter(c => c.quality === 'minor').length;
    const mode = majorChords >= minorChords ? 'major' : 'minor';
    
    return { tonic: mostCommonRoot, mode };
  }

  private getChordsInRomanNumerals(chords: Chord[], key: Key): string[] {
    return chords.map(chord => this.getChordRomanNumeral(chord, key));
  }

  private getChordRomanNumeral(chord: Chord, key: Key): string {
    const keyIndex = CHROMATIC_NOTES.indexOf(key.tonic);
    const chordIndex = CHROMATIC_NOTES.indexOf(chord.root);
    const scaleStep = (chordIndex - keyIndex + 12) % 12;
    
    const pattern = SCALE_PATTERNS[key.mode];
    const scaleStepIndex = pattern.indexOf(scaleStep);
    
    if (scaleStepIndex === -1) return '?'; // Chord not in scale
    
    const romanNumerals = key.mode === 'major' ? ROMAN_NUMERALS.major : ROMAN_NUMERALS.minor;
    return romanNumerals[scaleStepIndex] || '?';
  }

  private getChordFunctions(romanNumerals: string[], key: Key): ChordFunction[] {
    return romanNumerals.map(numeral => {
      const scaleStep = this.romanNumeralToScaleStep(numeral);
      return CHORD_FUNCTIONS[scaleStep]?.[0] || 'tonic';
    });
  }

  private romanNumeralToScaleStep(numeral: string): number {
    const clean = numeral.replace(/[°+]/g, '').toLowerCase();
    const mapping: Record<string, number> = {
      'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6
    };
    return mapping[clean] || 0;
  }

  private getCommonFirstChords(key: Key): ChordSuggestion[] {
    const suggestions: ChordSuggestion[] = [
      {
        chord: { id: '1', root: key.tonic, quality: key.mode, extensions: [], inversion: 0 },
        confidence: 0.9,
        reason: 'Tonic chord - establishes the key center'
      }
    ];
    
    if (key.mode === 'major') {
      suggestions.push({
        chord: { id: '2', root: this.getScaleNote(key, 3), quality: 'minor', extensions: [], inversion: 0 },
        confidence: 0.7,
        reason: 'vi chord - relative minor, common starting point'
      });
    }
    
    return suggestions;
  }

  private getChordProgressionSuggestions(lastRomanNumeral: string, key: Key): ChordSuggestion[] {
    const suggestions: ChordSuggestion[] = [];
    
    // Common progressions based on last chord
    const progressions: Record<string, Array<{ numeral: string; confidence: number; reason: string }>> = {
      'I': [
        { numeral: 'vi', confidence: 0.8, reason: 'I-vi is a very common progression' },
        { numeral: 'IV', confidence: 0.7, reason: 'I-IV establishes subdominant function' },
        { numeral: 'V', confidence: 0.6, reason: 'I-V creates tension' }
      ],
      'vi': [
        { numeral: 'IV', confidence: 0.9, reason: 'vi-IV is extremely popular in pop music' },
        { numeral: 'ii', confidence: 0.7, reason: 'vi-ii creates smooth voice leading' }
      ],
      'IV': [
        { numeral: 'V', confidence: 0.9, reason: 'IV-V is a classic subdominant to dominant movement' },
        { numeral: 'I', confidence: 0.7, reason: 'IV-I is a plagal cadence' }
      ],
      'V': [
        { numeral: 'I', confidence: 0.95, reason: 'V-I is the strongest resolution in tonal music' },
        { numeral: 'vi', confidence: 0.6, reason: 'V-vi is a deceptive cadence' }
      ]
    };

    const nextChords = progressions[lastRomanNumeral] || [];
    
    return nextChords.map(({ numeral, confidence, reason }) => ({
      chord: this.romanNumeralToChord(numeral, key),
      confidence,
      reason
    }));
  }

  private romanNumeralToChord(numeral: string, key: Key): Chord {
    const scaleStep = this.romanNumeralToScaleStep(numeral);
    const root = this.getScaleNote(key, scaleStep);
    const isUpperCase = numeral === numeral.toUpperCase();
    const quality = isUpperCase ? 'major' : 'minor';
    
    return {
      id: `chord_${numeral}_${Date.now()}`,
      root,
      quality,
      extensions: [],
      inversion: 0
    };
  }

  private getScaleNote(key: Key, scaleStep: number): string {
    const keyIndex = CHROMATIC_NOTES.indexOf(key.tonic);
    const pattern = SCALE_PATTERNS[key.mode];
    const interval = pattern[scaleStep] || 0;
    return CHROMATIC_NOTES[(keyIndex + interval) % 12];
  }

  private analyzeIntervals(notes: Note[]): string[] {
    const intervals: string[] = [];
    
    for (let i = 1; i < notes.length; i++) {
      const interval = this.explainInterval(notes[i - 1], notes[i]);
      intervals.push(interval);
    }
    
    return intervals;
  }

  private analyzeMelodyDirection(notes: Note[]): 'ascending' | 'descending' | 'mixed' {
    if (notes.length < 2) return 'mixed';
    
    let ascending = 0;
    let descending = 0;
    
    for (let i = 1; i < notes.length; i++) {
      if (notes[i].pitch > notes[i - 1].pitch) ascending++;
      else if (notes[i].pitch < notes[i - 1].pitch) descending++;
    }
    
    if (ascending > descending * 2) return 'ascending';
    if (descending > ascending * 2) return 'descending';
    return 'mixed';
  }

  private getMelodyRange(notes: Note[]): { lowest: Note; highest: Note } {
    const sortedByPitch = [...notes].sort((a, b) => a.pitch - b.pitch);
    return {
      lowest: sortedByPitch[0],
      highest: sortedByPitch[sortedByPitch.length - 1]
    };
  }

  private suggestMelodyImprovements(notes: Note[], key: Key): MelodySuggestion[] {
    const suggestions: MelodySuggestion[] = [];
    const scaleNotes = this.getScaleNotes(key, key.mode);
    
    // Check for notes outside the scale
    const outsideScale = notes.filter(note => 
      !scaleNotes.some(scaleNote => scaleNote.pitch % 12 === note.pitch % 12)
    );
    
    if (outsideScale.length > 0) {
      suggestions.push({
        description: 'Some notes are outside the current scale',
        notes: outsideScale,
        reason: 'Consider using scale tones or chromatic passing tones for smoother melodies.'
      });
    }
    
    return suggestions;
  }

  private getScale(tonic: string, mode: string): Scale {
    const pattern = SCALE_PATTERNS[mode] || SCALE_PATTERNS['major'];
    
    return {
      name: `${tonic} ${mode}`,
      intervals: pattern,
      modes: Object.keys(SCALE_PATTERNS)
    };
  }

  private getChordTones(chord: Chord): number[] {
    const rootIndex = CHROMATIC_NOTES.indexOf(chord.root);
    const quality = CHORD_QUALITIES[chord.quality] || CHORD_QUALITIES.major;
    
    return quality.map(interval => (rootIndex + interval) % 12);
  }
}

export const musicTheoryService = new TheoryService();