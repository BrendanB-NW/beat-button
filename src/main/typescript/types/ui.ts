// UI types for the Beat Button DAW

export interface PianoRollState {
  selectedNotes: string[];
  viewRange: {
    startTime: number;
    endTime: number;
    minPitch: number;
    maxPitch: number;
  };
  snapToGrid: boolean;
  gridResolution: number; // in beats (e.g., 0.25 for 16th notes)
  zoom: {
    horizontal: number;
    vertical: number;
  };
}

export interface TimelineState {
  playheadPosition: number; // in beats
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  selectedTracks: string[];
}

export interface DAWState {
  currentProject: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  tempo: number;
  masterVolume: number;
  pianoRoll: PianoRollState;
  timeline: TimelineState;
  theoryHelperVisible: boolean;
}

export interface TooltipContent {
  title: string;
  description: string;
  examples?: string[];
}

export interface TheoryTooltip {
  concept: string;
  content: TooltipContent;
  position: {
    x: number;
    y: number;
  };
  visible: boolean;
}

export interface NoteDragState {
  isDragging: boolean;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  noteIds: string[];
  operation: 'move' | 'resize' | 'select';
}

export interface GridConfiguration {
  beatsPerMeasure: number;
  subdivisions: number; // subdivisions per beat
  showMeasureLines: boolean;
  showBeatLines: boolean;
  showSubdivisionLines: boolean;
}