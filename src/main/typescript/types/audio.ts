import { Note, Track, SynthType, ExportOptions } from './music';

export interface Synthesizer {
  id: string;
  type: SynthType;
  play(note: Note): void;
  stop(noteId: string): void;
  setVolume(volume: number): void;
  setPan(pan: number): void;
  dispose(): void;
}

export interface AudioEngine {
  createSynthesizer(type: SynthType): Promise<Synthesizer>;
  playNote(note: Note, duration: number): void;
  stopNote(noteId: string): void;
  setTempo(bpm: number): void;
  start(): Promise<void>;
  stop(): void;
  exportAudio(tracks: Track[], options: ExportOptions): Promise<ArrayBuffer>;
  getCurrentTime(): number;
  isPlaying(): boolean;
}

export interface AudioContext {
  context: AudioContext;
  destination: AudioNode;
  currentTime: number;
}

export interface ScheduledNote {
  noteId: string;
  note: Note;
  scheduledTime: number;
  synthesizer: Synthesizer;
}