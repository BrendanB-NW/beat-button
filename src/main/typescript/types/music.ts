export interface Note {
  id: string;
  pitch: number; // MIDI note number (0-127)
  velocity: number; // 0-127
  startTime: number; // in beats
  duration: number; // in beats
  trackId: string;
}

export interface Track {
  id: string;
  name: string;
  instrument: InstrumentConfig;
  notes: Note[];
  volume: number; // 0-1
  pan: number; // -1 to 1
  muted: boolean;
  soloed: boolean;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface Key {
  tonic: string; // C, C#, D, etc.
  mode: string; // major, minor, dorian, etc.
}

export interface Project {
  id: string;
  name: string;
  tempo: number; // BPM
  key: Key;
  timeSignature: TimeSignature;
  tracks: Track[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface Chord {
  id: string;
  root: string;
  quality: string; // major, minor, diminished, etc.
  extensions: string[]; // 7th, 9th, etc.
  inversion?: number;
}

export interface Scale {
  name: string;
  intervals: number[]; // semitone intervals from root
  modes: string[];
}

export interface Interval {
  semitones: number;
  name: string;
  quality: 'perfect' | 'major' | 'minor' | 'augmented' | 'diminished';
}

export type SynthType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'piano' | 'guitar' | 'strings';

export interface InstrumentConfig {
  type: SynthType;
  params: Record<string, number | string>;
}

export type ExportFormat = 'wav' | 'mp3';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // bitrate for MP3, sample rate for WAV
  normalizeAudio: boolean;
}