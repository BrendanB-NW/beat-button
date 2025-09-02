import { Note, Track, Project, Key, TimeSignature, InstrumentConfig, Chord } from './music';

// Core AI Service Interfaces

export interface AIMelodyRequest {
  prompt: string;
  projectContext: {
    key: Key;
    tempo: number;
    timeSignature: TimeSignature;
    existingTracks: Track[];
  };
  constraints: {
    length: number; // in beats
    targetTrack: string;
    noteRange: { min: number; max: number }; // MIDI note range
    rhythmicDensity: 'sparse' | 'moderate' | 'dense';
  };
}

export interface AIMelodyResponse {
  notes: Note[];
  explanation: string;
  confidence: number; // 0-1
  alternativeVersions: Note[][];
  theoryAnalysis: {
    scaleUsed: string[];
    rhythmicPattern: string;
    melodicDirection: 'ascending' | 'descending' | 'contoured';
  };
}

export interface AITheoryQuery {
  question: string;
  context: {
    project: Project;
    selectedTrack?: string;
    selectedNotes?: string[];
    userKnowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface AITheoryResponse {
  explanation: string;
  concepts: string[]; // theory concepts mentioned
  examples: {
    audioSnippets?: Note[][];
    visualizations?: ChordDiagram[];
  };
  relatedQuestions: string[];
  practiceExercises?: {
    description: string;
    targetNotes: Note[];
    correctAnswer: boolean;
  }[];
}

export interface ChordDiagram {
  chord: Chord;
  visualization: 'piano' | 'staff' | 'circle';
  highlights: number[]; // note positions to highlight
}

export interface AIInstrumentRequest {
  prompt: string;
  baseInstrument?: string;
  referenceAudio?: AudioBuffer;
  targetCharacteristics: {
    brightness: number; // 0-1
    warmth: number; // 0-1
    attack: number; // 0-1
    sustain: number; // 0-1
    complexity: number; // 0-1
  };
}

export interface OscillatorConfig {
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';
  frequency: number;
  amplitude: number;
  modulation?: {
    type: 'am' | 'fm' | 'pm';
    rate: number;
    depth: number;
  };
}

export interface FilterConfig {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  frequency: number;
  resonance: number;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface EnvelopeConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface EffectConfig {
  type: 'reverb' | 'delay' | 'chorus' | 'distortion' | 'compressor';
  parameters: Record<string, number>;
}

export interface AIInstrumentResponse {
  instrumentConfig: InstrumentConfig;
  presetName: string;
  description: string;
  parameters: {
    synthesisType: 'subtractive' | 'additive' | 'fm' | 'wavetable';
    oscillators: OscillatorConfig[];
    filters: FilterConfig[];
    envelopes: EnvelopeConfig[];
    effects: EffectConfig[];
  };
  audioPreview?: AudioBuffer;
}

export interface TrackAnalysis {
  key: Key;
  tempo: number;
  chords: Chord[];
  melodicDirection: 'ascending' | 'descending' | 'contoured';
  complexity: 'simple' | 'moderate' | 'complex';
  suggestions: string[];
}

// AI Service Configuration

export interface AIModel {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  apiEndpoint?: string;
}

export interface AIPreferences {
  theoryLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredGenres: string[];
  explanationStyle: 'technical' | 'conversational' | 'minimal';
  creativityLevel: number; // 0-1, how experimental the AI should be
}

export interface AIInteraction {
  id: string;
  timestamp: Date;
  type: 'melody' | 'theory' | 'instrument';
  prompt: string;
  response: AIMelodyResponse | AITheoryResponse | AIInstrumentResponse;
  applied: boolean;
}

// Core AI Service Interface

export interface AIService {
  // Melody Generation
  generateMelody(request: AIMelodyRequest): Promise<AIMelodyResponse>;
  refineMelody(notes: Note[], refinementPrompt: string, context: AIMelodyRequest['projectContext']): Promise<AIMelodyResponse>;
  
  // Theory Analysis
  explainTheory(query: AITheoryQuery): Promise<AITheoryResponse>;
  analyzeTrack(track: Track, project: Project): Promise<TrackAnalysis>;
  
  // Instrument Synthesis
  createInstrument(request: AIInstrumentRequest): Promise<AIInstrumentResponse>;
  modifyInstrument(instrument: InstrumentConfig, prompt: string): Promise<AIInstrumentResponse>;
  
  // Configuration
  setApiKey(key: string): void;
  setModel(model: AIModel): void;
  getUserPreferences(): AIPreferences;
  setUserPreferences(preferences: Partial<AIPreferences>): void;
  
  // Health check
  isAvailable(): Promise<boolean>;
}