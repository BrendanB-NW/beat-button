# CLAUDE.md - B. Boyd's Bangin' Beat Button Specification

## Project Overview

**Project Name**: B. Boyd's Bangin' Beat Button  
**Type**: Web-based Digital Audio Workstation (DAW)  
**Purpose**: Educational melody creation tool with integrated music theory guidance  
**Target Users**: Musically interested individuals who are novices with music theory  

## Core Requirements

### Functional Requirements

#### Audio Engine (Priority 1)
- **Real-time audio synthesis** using Web Audio API
- **Dual synthesis modes**:
  - Pure synthesized sounds (sine, square, sawtooth, triangle waves)
  - Realistic instrument simulation (piano, guitar, strings, etc.)
- **Adjustable tempo** from 60-200 BPM with real-time changes
- **Multi-track support** for layered melodies and harmonies
- **Note precision** down to 16th note subdivisions minimum

#### Music Theory Integration (Priority 1)
- **Modal theory assistance**: Pop-ups and tooltips triggered by user request
- **Key/scale awareness**: Project-specific key signatures with explanations
- **Chord progression suggestions** based on selected key and mood
- **Melody analysis**: Real-time feedback on user-created melodies
- **Theory explanations**: Clear, jargon-free explanations for every musical concept
- **Non-enforcement approach**: Suggestions only, never blocking user creativity

#### User Interface (Priority 1)
- **Intuitive design**: Clear visual hierarchy for complex DAW functionality
- **Piano roll editor**: Visual note editing with drag-and-drop
- **Timeline view**: Horizontal arrangement of musical phrases
- **Instrument selector**: Easy switching between synthesis modes
- **Theory helper panel**: Toggleable theory assistance sidebar
- **Responsive design**: Functional on desktop and tablet devices

#### Project Management (Priority 2)
- **Local project saving**: Browser localStorage for session persistence
- **Project naming and organization**: User-friendly project management
- **Undo/redo system**: Comprehensive action history (minimum 50 steps)
- **Auto-save functionality**: Prevent data loss during composition

#### Export Functionality (Priority 2)
- **Full mix export**: WAV and MP3 format support
- **Stem export**: Individual track export for further production
- **Quality options**: Multiple bitrate/quality settings
- **Export progress indication**: User feedback during processing

### Non-Functional Requirements

#### Performance
- **Real-time audio**: <10ms latency for note playback
- **Smooth UI**: 60fps interface updates during playback
- **Memory efficiency**: <500MB RAM usage for typical projects
- **Load times**: <3 seconds initial application load

#### Usability
- **Learning curve**: New users productive within 15 minutes
- **Error recovery**: Graceful handling of audio context issues
- **Accessibility**: Keyboard shortcuts and screen reader support
- **Cross-browser**: Chrome, Firefox, Safari, Edge compatibility

#### Quality
- **Test coverage**: 90%+ code coverage across all test types
- **Error handling**: Comprehensive error boundaries and user feedback
- **Documentation**: Complete JSDoc coverage for public APIs
- **Performance monitoring**: Built-in performance benchmarking

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **Audio Processing**: Web Audio API with Tone.js for enhanced synthesis
- **State Management**: Zustand for application state
- **UI Components**: Headless UI with Tailwind CSS
- **Build System**: Vite with Gradle wrapper for Java preference compatibility
- **Testing**: Jest + React Testing Library + Playwright for E2E

### Core Services Architecture

#### AudioEngine Service
```typescript
interface AudioEngine {
  createSynthesizer(type: SynthType): Synthesizer;
  playNote(note: Note, duration: number): void;
  stopNote(noteId: string): void;
  setTempo(bpm: number): void;
  exportAudio(tracks: Track[]): Promise<AudioBuffer>;
}
```

#### MusicTheoryService
```typescript
interface MusicTheoryService {
  analyzeChordProgression(chords: Chord[]): ProgressionAnalysis;
  suggestNextChord(currentChords: Chord[], key: Key): ChordSuggestion[];
  analyzeMelody(notes: Note[], key: Key): MelodyAnalysis;
  getScaleNotes(key: Key, scaleType: ScaleType): Note[];
}
```

#### ProjectManager Service
```typescript
interface ProjectManager {
  saveProject(project: Project): Promise<void>;
  loadProject(id: string): Promise<Project>;
  exportProject(project: Project, format: ExportFormat): Promise<Blob>;
  listProjects(): Promise<ProjectSummary[]>;
}
```

### Data Models

#### Core Music Types
```typescript
interface Note {
  id: string;
  pitch: number; // MIDI note number
  velocity: number; // 0-127
  startTime: number; // in beats
  duration: number; // in beats
  trackId: string;
}

interface Track {
  id: string;
  name: string;
  instrument: InstrumentConfig;
  notes: Note[];
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
}

interface Project {
  id: string;
  name: string;
  tempo: number;
  key: Key;
  timeSignature: TimeSignature;
  tracks: Track[];
  createdAt: Date;
  modifiedAt: Date;
}
```

## Implementation Guidelines

### Development Approach
1. **Test-Driven Development**: Write tests before implementation
2. **Component-First**: Build reusable UI components with Storybook
3. **Service-Oriented**: Clear separation between UI and business logic
4. **Progressive Enhancement**: Core functionality first, advanced features second

### Code Quality Standards
- **TypeScript Strict Mode**: No `any` types except for external library integrations
- **ESLint + Prettier**: Consistent code formatting and quality
- **JSDoc Documentation**: Complete API documentation for all public interfaces
- **Error Boundaries**: React error boundaries for graceful failure handling
- **Performance Monitoring**: Built-in metrics collection for optimization

### Testing Strategy
- **Unit Tests**: All services, utilities, and pure functions
- **Component Tests**: React Testing Library for all UI components
- **Integration Tests**: Service integration and data flow
- **E2E Tests**: Critical user workflows with Playwright
- **Performance Tests**: Audio latency and UI responsiveness benchmarks

## File Structure Details

### Core Components
- `src/main/typescript/components/daw/` - Main DAW interface components
- `src/main/typescript/services/` - Business logic and external integrations
- `src/main/typescript/types/` - TypeScript type definitions
- `src/main/typescript/hooks/` - Custom React hooks for audio and state

### Configuration Files
- `tsconfig.json` - TypeScript strict mode configuration
- `vite.config.ts` - Build optimization for audio processing
- `jest.config.js` - Test configuration with coverage reporting
- `build.gradle.kts` - Gradle integration for Java toolchain compatibility

## Success Criteria

### Technical Success
- [ ] Real-time audio synthesis with <10ms latency
- [ ] 90%+ test coverage across all test types
- [ ] Sub-3-second application load time
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Memory usage <500MB for typical projects

### User Experience Success
- [ ] New users creating melodies within 15 minutes
- [ ] Intuitive music theory integration without workflow disruption
- [ ] Reliable project save/load functionality
- [ ] High-quality audio export matching user expectations
- [ ] Responsive interface during real-time playback

### Educational Success
- [ ] Clear, accessible explanations for music theory concepts
- [ ] Progressive disclosure of advanced features
- [ ] Non-intrusive suggestion system
- [ ] User-driven learning pace and depth

## Regeneration Instructions

To regenerate this project:

1. **Initialize Project**: Create directory structure as specified above
2. **Install Dependencies**: Run package installation and Gradle wrapper setup
3. **Configure Build**: Set up TypeScript, Vite, and Jest configurations
4. **Implement Core Services**: Start with AudioEngine and MusicTheoryService
5. **Build UI Components**: Create DAW interface components with testing
6. **Integrate Features**: Connect audio engine to UI with state management
7. **Add Theory Integration**: Implement modal theory assistance
8. **Test Thoroughly**: Achieve 90%+ coverage before feature completion
9. **Performance Optimize**: Meet latency and responsiveness requirements
10. **Document Completely**: Ensure all APIs have JSDoc documentation

This specification provides everything needed to recreate "B. Boyd's Bangin' Beat Button" from scratch while maintaining architectural consistency and quality standards.