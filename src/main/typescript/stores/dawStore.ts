import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { Project, Note, Track, Key, TimeSignature, SynthType, InstrumentConfig } from '../types/music';
import { DAWState, PianoRollState, TimelineState, TheoryTooltip } from '../types/ui';
import { AIInteraction, AIPreferences, AITheoryResponse } from '../types/ai';
import { projectManager } from '../services/projectManager';
import { audioEngine } from '../services/audioEngine';
import { aiService } from '../services/aiService';

interface DAWStore {
  // Project state
  currentProject: Project | null;
  projects: Project[];
  
  // Playback state
  isPlaying: boolean;
  isRecording: boolean;
  tempo: number;
  masterVolume: number;
  
  // UI state
  pianoRoll: PianoRollState;
  timeline: TimelineState;
  theoryHelperVisible: boolean;
  activeTooltip: TheoryTooltip | null;
  
  // Actions - Project Management
  createNewProject: (name: string, key: Key, tempo: number) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  updateProjectName: (name: string) => void;
  updateProjectTempo: (tempo: number) => void;
  updateProjectKey: (key: Key) => void;
  updateProjectTimeSignature: (timeSignature: TimeSignature) => void;
  
  // Actions - Track Management
  addTrack: (name: string, instrument: SynthType) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  muteTrack: (trackId: string, muted: boolean) => void;
  soloTrack: (trackId: string, soloed: boolean) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  
  // Actions - Note Management
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  removeNote: (noteId: string) => void;
  selectNotes: (noteIds: string[]) => void;
  clearNoteSelection: () => void;
  
  // Actions - Playback Control
  play: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  setPlayheadPosition: (position: number) => void;
  setMasterVolume: (volume: number) => void;
  
  // Actions - UI State
  updatePianoRoll: (updates: Partial<PianoRollState>) => void;
  updateTimeline: (updates: Partial<TimelineState>) => void;
  toggleTheoryHelper: () => void;
  showTooltip: (tooltip: TheoryTooltip) => void;
  hideTooltip: () => void;
  
  // Actions - Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // AI State
  aiAssistantVisible: boolean;
  aiGenerating: boolean;
  lastAIRequest: string;
  aiHistory: AIInteraction[];
  aiPreferences: AIPreferences;
  lastTheoryResponse: AITheoryResponse | null;
  
  // AI Actions
  toggleAIAssistant: () => void;
  generateAIMelody: (prompt: string, trackId: string, constraints?: any) => Promise<void>;
  askAIQuestion: (question: string) => Promise<AITheoryResponse>;
  createAIInstrument: (prompt: string, characteristics?: any) => Promise<InstrumentConfig>;
  refineAIMelody: (notes: Note[], refinementPrompt: string) => Promise<void>;
  setAIPreferences: (preferences: Partial<AIPreferences>) => void;
  clearAIHistory: () => void;
  setAIApiKey: (apiKey: string) => void;
}

const createDefaultProject = (name: string, key: Key, tempo: number): Project => ({
  id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  tempo,
  key,
  timeSignature: { numerator: 4, denominator: 4 },
  tracks: [],
  createdAt: new Date(),
  modifiedAt: new Date()
});

const createDefaultTrack = (name: string, instrument: SynthType): Track => ({
  id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  instrument: { type: instrument, params: {} },
  notes: [],
  volume: 0.7,
  pan: 0,
  muted: false,
  soloed: false
});

export const useDAWStore = create<DAWStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      isPlaying: false,
      isRecording: false,
      tempo: 120,
      masterVolume: 0.8,
      
      pianoRoll: {
        selectedNotes: [],
        viewRange: {
          startTime: 0,
          endTime: 32,
          minPitch: 36,
          maxPitch: 84
        },
        snapToGrid: true,
        gridResolution: 0.25,
        zoom: {
          horizontal: 1,
          vertical: 1
        }
      },
      
      timeline: {
        playheadPosition: 0,
        loopEnabled: false,
        loopStart: 0,
        loopEnd: 32,
        selectedTracks: []
      },
      
      theoryHelperVisible: false,
      activeTooltip: null,

      // AI State
      aiAssistantVisible: false,
      aiGenerating: false,
      lastAIRequest: '',
      aiHistory: [],
      aiPreferences: {
        theoryLevel: 'beginner',
        preferredGenres: ['pop', 'rock'],
        explanationStyle: 'conversational',
        creativityLevel: 0.7
      },
      lastTheoryResponse: null,

      // Project Management Actions
      createNewProject: async (name: string, key: Key, tempo: number) => {
        const newProject = createDefaultProject(name, key, tempo);
        
        // Add a default track
        const defaultTrack = createDefaultTrack('Piano', 'piano');
        newProject.tracks.push(defaultTrack);
        
        await projectManager.saveProject(newProject);
        
        set((state) => ({
          currentProject: newProject,
          projects: [...state.projects, newProject],
          tempo: newProject.tempo
        }));
      },

      loadProject: async (id: string) => {
        try {
          const project = await projectManager.loadProject(id);
          set({
            currentProject: project,
            tempo: project.tempo
          });
          
          // Initialize audio engine with project tracks
          for (const track of project.tracks) {
            await audioEngine.createSynthesizer(track.instrument.type);
          }
        } catch (error) {
          console.error('Failed to load project:', error);
          throw error;
        }
      },

      saveCurrentProject: async () => {
        const { currentProject } = get();
        if (currentProject) {
          currentProject.modifiedAt = new Date();
          await projectManager.saveProject(currentProject);
        }
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      updateProjectName: (name) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = { ...currentProject, name, modifiedAt: new Date() };
          set({ currentProject: updatedProject });
        }
      },

      updateProjectTempo: (tempo) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = { ...currentProject, tempo, modifiedAt: new Date() };
          set({ currentProject: updatedProject, tempo });
          audioEngine.setTempo(tempo);
        }
      },

      updateProjectKey: (key) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = { ...currentProject, key, modifiedAt: new Date() };
          set({ currentProject: updatedProject });
        }
      },

      updateProjectTimeSignature: (timeSignature) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = { ...currentProject, timeSignature, modifiedAt: new Date() };
          set({ currentProject: updatedProject });
        }
      },

      // Track Management Actions
      addTrack: (name, instrument) => {
        const { currentProject } = get();
        if (currentProject) {
          const newTrack = createDefaultTrack(name, instrument);
          const updatedProject = {
            ...currentProject,
            tracks: [...currentProject.tracks, newTrack],
            modifiedAt: new Date()
          };
          set({ currentProject: updatedProject });
          
          // Initialize synthesizer for new track
          audioEngine.createSynthesizer(instrument);
        }
      },

      removeTrack: (trackId) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.filter(t => t.id !== trackId),
            modifiedAt: new Date()
          };
          set({ currentProject: updatedProject });
        }
      },

      updateTrack: (trackId, updates) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.map(track =>
              track.id === trackId ? { ...track, ...updates } : track
            ),
            modifiedAt: new Date()
          };
          set({ currentProject: updatedProject });
        }
      },

      muteTrack: (trackId, muted) => {
        get().updateTrack(trackId, { muted });
      },

      soloTrack: (trackId, soloed) => {
        const { currentProject } = get();
        if (currentProject) {
          // If soloing this track, unmute it and mute others
          // If unsoloing, unmute all tracks
          const updatedTracks = currentProject.tracks.map(track => ({
            ...track,
            soloed: track.id === trackId ? soloed : false,
            muted: soloed && track.id !== trackId
          }));
          
          const updatedProject = {
            ...currentProject,
            tracks: updatedTracks,
            modifiedAt: new Date()
          };
          set({ currentProject: updatedProject });
        }
      },

      setTrackVolume: (trackId, volume) => {
        get().updateTrack(trackId, { volume });
      },

      setTrackPan: (trackId, pan) => {
        get().updateTrack(trackId, { pan });
      },

      // Note Management Actions
      addNote: (noteData) => {
        const { currentProject } = get();
        if (currentProject) {
          const newNote: Note = {
            ...noteData,
            id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.map(track =>
              track.id === noteData.trackId
                ? { ...track, notes: [...track.notes, newNote] }
                : track
            ),
            modifiedAt: new Date()
          };
          set({ currentProject: updatedProject });
        }
      },

      updateNote: (noteId, updates) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.map(track => ({
              ...track,
              notes: track.notes.map(note =>
                note.id === noteId ? { ...note, ...updates } : note
              )
            })),
            modifiedAt: new Date()
          };
          set({ currentProject: updatedProject });
        }
      },

      removeNote: (noteId) => {
        const { currentProject, pianoRoll } = get();
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.map(track => ({
              ...track,
              notes: track.notes.filter(note => note.id !== noteId)
            })),
            modifiedAt: new Date()
          };
          
          const updatedPianoRoll = {
            ...pianoRoll,
            selectedNotes: pianoRoll.selectedNotes.filter(id => id !== noteId)
          };
          
          set({ 
            currentProject: updatedProject,
            pianoRoll: updatedPianoRoll
          });
        }
      },

      selectNotes: (noteIds) => {
        const { pianoRoll } = get();
        set({
          pianoRoll: {
            ...pianoRoll,
            selectedNotes: noteIds
          }
        });
      },

      clearNoteSelection: () => {
        const { pianoRoll } = get();
        set({
          pianoRoll: {
            ...pianoRoll,
            selectedNotes: []
          }
        });
      },

      // Playback Control Actions
      play: async () => {
        const { currentProject, timeline } = get();
        if (currentProject && !get().isPlaying) {
          await audioEngine.start();
          
          // Schedule all notes for playback
          for (const track of currentProject.tracks) {
            if (!track.muted) {
              for (const note of track.notes) {
                if (note.startTime >= timeline.playheadPosition) {
                  audioEngine.playNote(note, note.duration);
                }
              }
            }
          }
          
          set({ isPlaying: true });
        }
      },

      stop: () => {
        audioEngine.stop();
        set({ 
          isPlaying: false, 
          timeline: { ...get().timeline, playheadPosition: 0 }
        });
      },

      pause: () => {
        audioEngine.stop();
        set({ isPlaying: false });
      },

      setPlayheadPosition: (position) => {
        const { timeline } = get();
        set({
          timeline: { ...timeline, playheadPosition: position }
        });
      },

      setMasterVolume: (volume) => {
        set({ masterVolume: volume });
        // Apply to audio engine master volume
      },

      // UI State Actions
      updatePianoRoll: (updates) => {
        const { pianoRoll } = get();
        set({ pianoRoll: { ...pianoRoll, ...updates } });
      },

      updateTimeline: (updates) => {
        const { timeline } = get();
        set({ timeline: { ...timeline, ...updates } });
      },

      toggleTheoryHelper: () => {
        set((state) => ({ theoryHelperVisible: !state.theoryHelperVisible }));
      },

      showTooltip: (tooltip) => {
        set({ activeTooltip: tooltip });
      },

      hideTooltip: () => {
        set({ activeTooltip: null });
      },

      // Undo/Redo Actions
      undo: () => {
        const action = projectManager.undo();
        if (action) {
          // Apply undo action to current project state
          console.log('Undoing action:', action);
        }
      },

      redo: () => {
        const action = projectManager.redo();
        if (action) {
          // Apply redo action to current project state
          console.log('Redoing action:', action);
        }
      },

      canUndo: () => projectManager.canUndo(),
      canRedo: () => projectManager.canRedo(),

      // AI Actions
      toggleAIAssistant: () => {
        set((state) => ({ aiAssistantVisible: !state.aiAssistantVisible }));
      },

      generateAIMelody: async (prompt: string, trackId: string, constraints?: any) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set({ aiGenerating: true, lastAIRequest: prompt });

        try {
          const request = {
            prompt,
            projectContext: {
              key: currentProject.key,
              tempo: currentProject.tempo,
              timeSignature: currentProject.timeSignature,
              existingTracks: currentProject.tracks
            },
            constraints: {
              length: 8,
              targetTrack: trackId,
              noteRange: { min: 36, max: 84 },
              rhythmicDensity: 'moderate',
              ...constraints
            }
          };

          const response = await aiService.generateMelody(request);
          
          // Add generated notes to the track
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.map(track =>
              track.id === trackId
                ? { ...track, notes: [...track.notes, ...response.notes] }
                : track
            ),
            modifiedAt: new Date()
          };

          // Record AI interaction
          const interaction: AIInteraction = {
            id: `ai_${Date.now()}`,
            timestamp: new Date(),
            type: 'melody',
            prompt,
            response,
            applied: true
          };

          set((state) => ({
            currentProject: updatedProject,
            aiHistory: [...state.aiHistory, interaction],
            aiGenerating: false
          }));

          // Save the project
          await projectManager.saveProject(updatedProject);

        } catch (error) {
          console.error('AI melody generation failed:', error);
          set({ aiGenerating: false });
        }
      },

      askAIQuestion: async (question: string) => {
        const { currentProject, pianoRoll, aiPreferences } = get();
        if (!currentProject) {
          const fallbackResponse: AITheoryResponse = {
            explanation: 'Please load or create a project first to get contextual theory explanations.',
            concepts: [],
            examples: {},
            relatedQuestions: []
          };
          set({ lastTheoryResponse: fallbackResponse });
          return fallbackResponse;
        }

        set({ aiGenerating: true, lastAIRequest: question });

        try {
          const query = {
            question,
            context: {
              project: currentProject,
              selectedNotes: pianoRoll.selectedNotes,
              userKnowledgeLevel: aiPreferences.theoryLevel
            }
          };

          const response = await aiService.explainTheory(query);

          // Record AI interaction
          const interaction: AIInteraction = {
            id: `ai_${Date.now()}`,
            timestamp: new Date(),
            type: 'theory',
            prompt: question,
            response,
            applied: false
          };

          set((state) => ({
            lastTheoryResponse: response,
            aiHistory: [...state.aiHistory, interaction],
            aiGenerating: false
          }));

          return response;

        } catch (error) {
          console.error('AI theory question failed:', error);
          const errorResponse: AITheoryResponse = {
            explanation: 'Sorry, I encountered an error processing your question. Please check your AI configuration and try again.',
            concepts: [],
            examples: {},
            relatedQuestions: []
          };
          set({ lastTheoryResponse: errorResponse, aiGenerating: false });
          return errorResponse;
        }
      },

      createAIInstrument: async (prompt: string, characteristics?: any) => {
        set({ aiGenerating: true, lastAIRequest: prompt });

        try {
          const request = {
            prompt,
            targetCharacteristics: {
              brightness: 0.5,
              warmth: 0.5,
              attack: 0.5,
              sustain: 0.5,
              complexity: 0.5,
              ...characteristics
            }
          };

          const response = await aiService.createInstrument(request);

          // Record AI interaction
          const interaction: AIInteraction = {
            id: `ai_${Date.now()}`,
            timestamp: new Date(),
            type: 'instrument',
            prompt,
            response,
            applied: false
          };

          set((state) => ({
            aiHistory: [...state.aiHistory, interaction],
            aiGenerating: false
          }));

          return response.instrumentConfig;

        } catch (error) {
          console.error('AI instrument creation failed:', error);
          set({ aiGenerating: false });
          return {
            type: 'sine' as const,
            params: {}
          };
        }
      },

      refineAIMelody: async (notes: Note[], refinementPrompt: string) => {
        const { currentProject } = get();
        if (!currentProject || notes.length === 0) return;

        set({ aiGenerating: true, lastAIRequest: refinementPrompt });

        try {
          const context = {
            key: currentProject.key,
            tempo: currentProject.tempo,
            timeSignature: currentProject.timeSignature,
            existingTracks: currentProject.tracks
          };

          const response = await aiService.refineMelody(notes, refinementPrompt, context);
          
          // Replace the refined notes in the track
          const trackId = notes[0].trackId;
          const noteIds = new Set(notes.map(n => n.id));
          
          const updatedProject = {
            ...currentProject,
            tracks: currentProject.tracks.map(track =>
              track.id === trackId
                ? {
                    ...track,
                    notes: [
                      ...track.notes.filter(n => !noteIds.has(n.id)),
                      ...response.notes
                    ]
                  }
                : track
            ),
            modifiedAt: new Date()
          };

          // Record AI interaction
          const interaction: AIInteraction = {
            id: `ai_${Date.now()}`,
            timestamp: new Date(),
            type: 'melody',
            prompt: `Refine: ${refinementPrompt}`,
            response,
            applied: true
          };

          set((state) => ({
            currentProject: updatedProject,
            aiHistory: [...state.aiHistory, interaction],
            aiGenerating: false
          }));

          // Save the project
          await projectManager.saveProject(updatedProject);

        } catch (error) {
          console.error('AI melody refinement failed:', error);
          set({ aiGenerating: false });
        }
      },

      setAIPreferences: (preferences: Partial<AIPreferences>) => {
        set((state) => ({
          aiPreferences: { ...state.aiPreferences, ...preferences }
        }));
        aiService.setUserPreferences(preferences);
      },

      clearAIHistory: () => {
        set({ aiHistory: [], lastTheoryResponse: null });
      },

      setAIApiKey: (apiKey: string) => {
        aiService.setApiKey(apiKey);
      }
    })),
    { name: 'daw-store' }
  )
);