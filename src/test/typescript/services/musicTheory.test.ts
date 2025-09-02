import { TheoryService } from '@/services/musicTheory';
import { Chord, Key, Note } from '@/types/music';

describe('TheoryService', () => {
  let theoryService: TheoryService;

  beforeEach(() => {
    theoryService = new TheoryService();
  });

  describe('getScaleNotes', () => {
    it('returns correct notes for C major scale', () => {
      const key: Key = { tonic: 'C', mode: 'major' };
      const scaleNotes = theoryService.getScaleNotes(key, 'major');

      expect(scaleNotes).toHaveLength(7);
      expect(scaleNotes[0].pitch).toBe(60); // Middle C
      expect(scaleNotes[1].pitch).toBe(62); // D
      expect(scaleNotes[2].pitch).toBe(64); // E
      expect(scaleNotes[3].pitch).toBe(65); // F
      expect(scaleNotes[4].pitch).toBe(67); // G
      expect(scaleNotes[5].pitch).toBe(69); // A
      expect(scaleNotes[6].pitch).toBe(71); // B
    });

    it('returns correct notes for A minor scale', () => {
      const key: Key = { tonic: 'A', mode: 'minor' };
      const scaleNotes = theoryService.getScaleNotes(key, 'minor');

      expect(scaleNotes).toHaveLength(7);
      expect(scaleNotes[0].pitch).toBe(69); // A
      expect(scaleNotes[1].pitch).toBe(71); // B
      expect(scaleNotes[2].pitch).toBe(60); // C
    });
  });

  describe('identifyKey', () => {
    it('identifies C major from scale notes', () => {
      const notes: Note[] = [
        { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }, // C
        { id: '2', pitch: 62, velocity: 80, startTime: 1, duration: 1, trackId: 'track1' }, // D
        { id: '3', pitch: 64, velocity: 80, startTime: 2, duration: 1, trackId: 'track1' }, // E
        { id: '4', pitch: 65, velocity: 80, startTime: 3, duration: 1, trackId: 'track1' }, // F
        { id: '5', pitch: 67, velocity: 80, startTime: 4, duration: 1, trackId: 'track1' }, // G
      ];

      const possibleKeys = theoryService.identifyKey(notes);
      
      expect(possibleKeys).toHaveLength(3);
      expect(possibleKeys[0]).toEqual({ tonic: 'C', mode: 'major' });
    });

    it('handles empty note array', () => {
      expect(() => theoryService.identifyKey([])).not.toThrow();
    });
  });

  describe('explainInterval', () => {
    it('identifies perfect fifth correctly', () => {
      const note1: Note = { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }; // C
      const note2: Note = { id: '2', pitch: 67, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }; // G

      const interval = theoryService.explainInterval(note1, note2);
      expect(interval).toBe('Perfect 5th');
    });

    it('identifies major third correctly', () => {
      const note1: Note = { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }; // C
      const note2: Note = { id: '2', pitch: 64, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }; // E

      const interval = theoryService.explainInterval(note1, note2);
      expect(interval).toBe('Major 3rd');
    });

    it('handles octave intervals', () => {
      const note1: Note = { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }; // C4
      const note2: Note = { id: '2', pitch: 84, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }; // C6

      const interval = theoryService.explainInterval(note1, note2);
      expect(interval).toBe('Octave + 1 octave');
    });
  });

  describe('suggestNextChord', () => {
    it('suggests common progression chords', () => {
      const key: Key = { tonic: 'C', mode: 'major' };
      const currentChords: Chord[] = [
        { id: '1', root: 'C', quality: 'major', extensions: [] }
      ];

      const suggestions = theoryService.suggestNextChord(currentChords, key);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeGreaterThan(0);
      expect(suggestions[0].reason).toBeTruthy();
    });

    it('provides different suggestions for minor keys', () => {
      const key: Key = { tonic: 'A', mode: 'minor' };
      const currentChords: Chord[] = [
        { id: '1', root: 'A', quality: 'minor', extensions: [] }
      ];

      const suggestions = theoryService.suggestNextChord(currentChords, key);
      
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('handles empty chord progression', () => {
      const key: Key = { tonic: 'C', mode: 'major' };
      const currentChords: Chord[] = [];

      const suggestions = theoryService.suggestNextChord(currentChords, key);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].chord.root).toBe('C');
    });
  });

  describe('analyzeMelody', () => {
    it('analyzes melody direction correctly', () => {
      const key: Key = { tonic: 'C', mode: 'major' };
      const ascendingNotes: Note[] = [
        { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }, // C
        { id: '2', pitch: 62, velocity: 80, startTime: 1, duration: 1, trackId: 'track1' }, // D
        { id: '3', pitch: 64, velocity: 80, startTime: 2, duration: 1, trackId: 'track1' }, // E
        { id: '4', pitch: 67, velocity: 80, startTime: 3, duration: 1, trackId: 'track1' }, // G
      ];

      const analysis = theoryService.analyzeMelody(ascendingNotes, key);
      
      expect(analysis.direction).toBe('ascending');
      expect(analysis.range.lowest.pitch).toBe(60);
      expect(analysis.range.highest.pitch).toBe(67);
    });

    it('throws error for empty melody', () => {
      const key: Key = { tonic: 'C', mode: 'major' };
      
      expect(() => theoryService.analyzeMelody([], key)).toThrow('Cannot analyze empty melody');
    });
  });

  describe('getChordVoicings', () => {
    it('returns multiple voicings for major chord', () => {
      const chord: Chord = { id: '1', root: 'C', quality: 'major', extensions: [] };
      
      const voicings = theoryService.getChordVoicings(chord);
      
      expect(voicings.length).toBeGreaterThan(1);
      expect(voicings[0]).toEqual(['C', 'E', 'G']); // Root position
    });

    it('handles different chord qualities', () => {
      const minorChord: Chord = { id: '1', root: 'A', quality: 'minor', extensions: [] };
      
      const voicings = theoryService.getChordVoicings(minorChord);
      
      expect(voicings.length).toBeGreaterThan(0);
      expect(voicings[0][0]).toBe('A');
    });
  });
});