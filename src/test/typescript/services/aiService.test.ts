import { aiService } from '../../../main/typescript/services/aiService';
import { AIServiceImpl } from '../../../main/typescript/services/aiService';
import { Note, Project, Track } from '../../../main/typescript/types/music';

// Mock the music theory service
jest.mock('../../../main/typescript/services/musicTheory', () => ({
  TheoryService: jest.fn().mockImplementation(() => ({
    getScaleNotes: jest.fn().mockReturnValue([
      { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' },
      { id: '2', pitch: 62, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' },
    ])
  }))
}));

describe('AIService', () => {
  let service: AIServiceImpl;

  beforeEach(() => {
    service = new AIServiceImpl();
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('configuration', () => {
    it('should set API key', () => {
      service.setApiKey('test-key');
      expect(service).toBeDefined(); // API key is private, so we just verify no error
    });

    it('should set user preferences', () => {
      const preferences = {
        theoryLevel: 'intermediate' as const,
        creativityLevel: 0.8
      };
      
      service.setUserPreferences(preferences);
      const userPrefs = service.getUserPreferences();
      
      expect(userPrefs.theoryLevel).toBe('intermediate');
      expect(userPrefs.creativityLevel).toBe(0.8);
    });

    it('should return availability status', async () => {
      // Without API key, should be unavailable
      const available = await service.isAvailable();
      expect(available).toBe(false);
    });
  });

  describe('melody generation', () => {
    it('should generate fallback melody when API fails', async () => {
      const request = {
        prompt: 'Create a happy melody',
        projectContext: {
          key: { tonic: 'C', mode: 'major' },
          tempo: 120,
          timeSignature: { numerator: 4, denominator: 4 },
          existingTracks: []
        },
        constraints: {
          length: 8,
          targetTrack: 'track1',
          noteRange: { min: 36, max: 84 },
          rhythmicDensity: 'moderate' as const
        }
      };

      const response = await service.generateMelody(request);
      
      expect(response).toBeDefined();
      expect(response.notes).toBeInstanceOf(Array);
      expect(response.explanation).toContain('fallback');
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.theoryAnalysis).toBeDefined();
    });

    it('should refine melody with fallback', async () => {
      const notes: Note[] = [
        { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' }
      ];
      
      const context = {
        key: { tonic: 'C', mode: 'major' },
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        existingTracks: []
      };

      const response = await service.refineMelody(notes, 'make it more energetic', context);
      
      expect(response).toBeDefined();
      expect(response.notes).toBeInstanceOf(Array);
      expect(response.explanation).toBeDefined();
    });
  });

  describe('theory explanations', () => {
    it('should provide fallback theory response', async () => {
      const mockProject: Project = {
        id: 'test-project',
        name: 'Test Project',
        key: { tonic: 'C', mode: 'major' },
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        tracks: [],
        createdAt: new Date(),
        modifiedAt: new Date()
      };

      const query = {
        question: 'What makes this chord progression work?',
        context: {
          project: mockProject,
          userKnowledgeLevel: 'beginner' as const
        }
      };

      const response = await service.explainTheory(query);
      
      expect(response).toBeDefined();
      expect(response.explanation).toBeDefined();
      expect(response.concepts).toBeInstanceOf(Array);
      expect(response.relatedQuestions).toBeInstanceOf(Array);
    });
  });

  describe('track analysis', () => {
    it('should analyze track with fallback', async () => {
      const mockTrack: Track = {
        id: 'track1',
        name: 'Test Track',
        instrument: { type: 'piano', params: {} },
        notes: [
          { id: '1', pitch: 60, velocity: 80, startTime: 0, duration: 1, trackId: 'track1' },
          { id: '2', pitch: 64, velocity: 80, startTime: 1, duration: 1, trackId: 'track1' }
        ],
        volume: 0.8,
        pan: 0,
        muted: false,
        soloed: false
      };

      const mockProject: Project = {
        id: 'test-project',
        name: 'Test Project',
        key: { tonic: 'C', mode: 'major' },
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        tracks: [mockTrack],
        createdAt: new Date(),
        modifiedAt: new Date()
      };

      const analysis = await service.analyzeTrack(mockTrack, mockProject);
      
      expect(analysis).toBeDefined();
      expect(analysis.key).toEqual(mockProject.key);
      expect(analysis.tempo).toBe(mockProject.tempo);
      expect(analysis.complexity).toBeDefined();
      expect(analysis.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('instrument creation', () => {
    it('should create instrument with fallback', async () => {
      const request = {
        prompt: 'Create a warm pad sound',
        targetCharacteristics: {
          brightness: 0.3,
          warmth: 0.8,
          attack: 0.2,
          sustain: 0.9,
          complexity: 0.5
        }
      };

      const response = await service.createInstrument(request);
      
      expect(response).toBeDefined();
      expect(response.instrumentConfig).toBeDefined();
      expect(response.presetName).toBeDefined();
      expect(response.description).toBeDefined();
      expect(response.parameters).toBeDefined();
      expect(response.parameters.synthesisType).toBeDefined();
    });

    it('should modify instrument with fallback', async () => {
      const instrument = { type: 'sine' as const, params: {} };
      const response = await service.modifyInstrument(instrument, 'make it brighter');
      
      expect(response).toBeDefined();
      expect(response.instrumentConfig).toEqual(instrument);
      expect(response.description).toContain('unavailable');
    });
  });

  describe('API integration', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              notes: [{ pitch: 60, velocity: 80, startTime: 0, duration: 1 }],
              explanation: 'AI generated melody',
              confidence: 0.9,
              theoryAnalysis: {
                scaleUsed: ['major'],
                rhythmicPattern: 'quarter notes',
                melodicDirection: 'ascending'
              }
            })
          }
        }]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      service.setApiKey('test-key');
      
      const request = {
        prompt: 'Create a simple melody',
        projectContext: {
          key: { tonic: 'C', mode: 'major' },
          tempo: 120,
          timeSignature: { numerator: 4, denominator: 4 },
          existingTracks: []
        },
        constraints: {
          length: 4,
          targetTrack: 'track1',
          noteRange: { min: 60, max: 72 },
          rhythmicDensity: 'moderate' as const
        }
      };

      const response = await service.generateMelody(request);
      
      expect(response.notes).toHaveLength(1);
      expect(response.notes[0].pitch).toBe(60);
      expect(response.explanation).toBe('AI generated melody');
      expect(response.confidence).toBe(0.9);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      service.setApiKey('invalid-key');
      
      const request = {
        prompt: 'Create a melody',
        projectContext: {
          key: { tonic: 'C', mode: 'major' },
          tempo: 120,
          timeSignature: { numerator: 4, denominator: 4 },
          existingTracks: []
        },
        constraints: {
          length: 4,
          targetTrack: 'track1',
          noteRange: { min: 60, max: 72 },
          rhythmicDensity: 'moderate' as const
        }
      };

      const response = await service.generateMelody(request);
      
      // Should fall back to rule-based generation
      expect(response).toBeDefined();
      expect(response.explanation).toContain('fallback');
    });
  });
});