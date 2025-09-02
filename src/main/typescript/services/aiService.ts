import {
  AIService,
  AIMelodyRequest,
  AIMelodyResponse,
  AITheoryQuery,
  AITheoryResponse,
  AIInstrumentRequest,
  AIInstrumentResponse,
  AIModel,
  AIPreferences,
  TrackAnalysis
} from '../types/ai';
import { Note, Track, Project, InstrumentConfig } from '../types/music';
import { TheoryService } from './musicTheory';

export class AIServiceImpl implements AIService {
  private apiKey: string = '';
  private model: AIModel = {
    provider: 'openai',
    model: 'gpt-4',
    apiEndpoint: 'https://api.openai.com/v1'
  };
  private preferences: AIPreferences = {
    theoryLevel: 'beginner',
    preferredGenres: ['pop', 'rock'],
    explanationStyle: 'conversational',
    creativityLevel: 0.7
  };
  private theoryService: TheoryService;

  constructor() {
    this.theoryService = new TheoryService();
  }

  // Configuration methods
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  setModel(model: AIModel): void {
    this.model = model;
  }

  getUserPreferences(): AIPreferences {
    return { ...this.preferences };
  }

  setUserPreferences(preferences: Partial<AIPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }
    
    try {
      // Simple health check - attempt a basic API call
      const response = await this.makeAPICall('test connection', 'theory');
      return response !== null;
    } catch {
      return false;
    }
  }

  // Melody Generation
  async generateMelody(request: AIMelodyRequest): Promise<AIMelodyResponse> {
    const prompt = this.buildMelodyPrompt(request);
    
    try {
      const response = await this.makeAPICall(prompt, 'melody');
      return this.parseMelodyResponse(response, request);
    } catch (error) {
      console.error('AI melody generation failed:', error);
      // Fallback to rule-based generation
      return this.generateFallbackMelody(request);
    }
  }

  async refineMelody(
    notes: Note[], 
    refinementPrompt: string, 
    context: AIMelodyRequest['projectContext']
  ): Promise<AIMelodyResponse> {
    const prompt = this.buildRefinementPrompt(notes, refinementPrompt, context);
    
    try {
      const response = await this.makeAPICall(prompt, 'melody');
      return this.parseMelodyResponse(response, { 
        prompt: refinementPrompt, 
        projectContext: context,
        constraints: {
          length: notes.length > 0 ? Math.max(...notes.map(n => n.startTime + n.duration)) : 8,
          targetTrack: notes[0]?.trackId || '',
          noteRange: { min: 36, max: 84 },
          rhythmicDensity: 'moderate'
        }
      });
    } catch (error) {
      console.error('AI melody refinement failed:', error);
      // Return original notes if refinement fails
      return {
        notes,
        explanation: 'Refinement unavailable - returning original melody',
        confidence: 0.5,
        alternativeVersions: [],
        theoryAnalysis: {
          scaleUsed: ['Unknown'],
          rhythmicPattern: 'Varied',
          melodicDirection: 'contoured'
        }
      };
    }
  }

  // Theory Analysis
  async explainTheory(query: AITheoryQuery): Promise<AITheoryResponse> {
    const prompt = this.buildTheoryPrompt(query);
    
    try {
      const response = await this.makeAPICall(prompt, 'theory');
      return this.parseTheoryResponse(response, query);
    } catch (error) {
      console.error('AI theory explanation failed:', error);
      return this.generateFallbackTheoryResponse(query);
    }
  }

  async analyzeTrack(track: Track, project: Project): Promise<TrackAnalysis> {
    const prompt = this.buildTrackAnalysisPrompt(track, project);
    
    try {
      const response = await this.makeAPICall(prompt, 'analysis');
      return this.parseTrackAnalysis(response, track, project);
    } catch (error) {
      console.error('AI track analysis failed:', error);
      return this.generateFallbackTrackAnalysis(track, project);
    }
  }

  // Instrument Synthesis
  async createInstrument(request: AIInstrumentRequest): Promise<AIInstrumentResponse> {
    const prompt = this.buildInstrumentPrompt(request);
    
    try {
      const response = await this.makeAPICall(prompt, 'instrument');
      return this.parseInstrumentResponse(response, request);
    } catch (error) {
      console.error('AI instrument creation failed:', error);
      return this.generateFallbackInstrument(request);
    }
  }

  async modifyInstrument(
    instrument: InstrumentConfig, 
    prompt: string
  ): Promise<AIInstrumentResponse> {
    const modificationPrompt = this.buildInstrumentModificationPrompt(instrument, prompt);
    
    try {
      const response = await this.makeAPICall(modificationPrompt, 'instrument');
      return this.parseInstrumentResponse(response, {
        prompt,
        targetCharacteristics: {
          brightness: 0.5,
          warmth: 0.5,
          attack: 0.5,
          sustain: 0.5,
          complexity: 0.5
        }
      });
    } catch (error) {
      console.error('AI instrument modification failed:', error);
      return {
        instrumentConfig: instrument,
        presetName: 'Modified Instrument',
        description: 'Modification unavailable - returning original instrument',
        parameters: {
          synthesisType: 'subtractive',
          oscillators: [],
          filters: [],
          envelopes: [],
          effects: []
        }
      };
    }
  }

  // Private helper methods
  private async makeAPICall(prompt: string, type: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const endpoint = this.getAPIEndpoint();
    const headers = this.getAPIHeaders();
    const body = this.buildAPIRequest(prompt, type);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getAPIEndpoint(): string {
    switch (this.model.provider) {
      case 'openai':
        return `${this.model.apiEndpoint}/chat/completions`;
      case 'anthropic':
        return `${this.model.apiEndpoint}/v1/messages`;
      default:
        return this.model.apiEndpoint || 'http://localhost:8080/api/generate';
    }
  }

  private getAPIHeaders(): Record<string, string> {
    switch (this.model.provider) {
      case 'openai':
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        };
      case 'anthropic':
        return {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        };
      default:
        return {
          'Content-Type': 'application/json'
        };
    }
  }

  private buildAPIRequest(prompt: string, type: string): any {
    switch (this.model.provider) {
      case 'openai':
        return {
          model: this.model.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(type)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.preferences.creativityLevel,
          max_tokens: 2000
        };
      case 'anthropic':
        return {
          model: this.model.model,
          max_tokens: 2000,
          system: this.getSystemPrompt(type),
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        };
      default:
        return { prompt, type };
    }
  }

  private getSystemPrompt(type: string): string {
    const basePrompt = `You are an AI music theory and composition assistant integrated into "B. Boyd's Bangin' Beat Button," an educational DAW. Your role is to help users learn music theory while creating compositions.

User preferences:
- Theory level: ${this.preferences.theoryLevel}
- Explanation style: ${this.preferences.explanationStyle}
- Preferred genres: ${this.preferences.preferredGenres.join(', ')}

Always provide educational value and encourage creativity while respecting musical theory principles.`;

    switch (type) {
      case 'melody':
        return `${basePrompt}

For melody generation requests:
- Generate MIDI note data as JSON arrays with pitch, velocity, startTime, duration
- Explain the theory behind your choices
- Provide alternative versions when possible
- Respect the given key signature and musical context`;

      case 'theory':
        return `${basePrompt}

For theory explanation requests:
- Provide clear, jargon-free explanations appropriate for the user's theory level
- Use examples when helpful
- Suggest related concepts to explore
- Offer practice exercises when relevant`;

      case 'instrument':
        return `${basePrompt}

For instrument creation requests:
- Design synthesis parameters that match the described sound
- Provide meaningful preset names and descriptions
- Explain the synthesis techniques used
- Consider the musical context when relevant`;

      default:
        return basePrompt;
    }
  }

  private buildMelodyPrompt(request: AIMelodyRequest): string {
    return `Generate a melody with the following requirements:

Prompt: "${request.prompt}"

Musical Context:
- Key: ${request.projectContext.key.tonic} ${request.projectContext.key.mode}
- Tempo: ${request.projectContext.tempo} BPM
- Time Signature: ${request.projectContext.timeSignature.numerator}/${request.projectContext.timeSignature.denominator}
- Existing tracks: ${request.projectContext.existingTracks.length}

Constraints:
- Length: ${request.constraints.length} beats
- Note range: MIDI ${request.constraints.noteRange.min}-${request.constraints.noteRange.max}
- Rhythmic density: ${request.constraints.rhythmicDensity}

Please respond with a JSON object containing:
- notes: Array of {pitch: number, velocity: number, startTime: number, duration: number}
- explanation: String describing your creative choices
- confidence: Number 0-1 rating your confidence in this melody
- theoryAnalysis: Object with scaleUsed, rhythmicPattern, melodicDirection`;
  }

  private buildRefinementPrompt(notes: Note[], refinementPrompt: string, context: AIMelodyRequest['projectContext']): string {
    return `Refine the following melody according to the user's request.

Original melody (MIDI notes):
${JSON.stringify(notes.map(n => ({ pitch: n.pitch, startTime: n.startTime, duration: n.duration })))}

User's refinement request: "${refinementPrompt}"

Musical context:
- Key: ${context.key.tonic} ${context.key.mode}
- Tempo: ${context.tempo} BPM

Please provide the refined melody in the same JSON format as melody generation.`;
  }

  private buildTheoryPrompt(query: AITheoryQuery): string {
    return `Answer the following music theory question in a ${this.preferences.explanationStyle} style appropriate for a ${this.preferences.theoryLevel} level student:

Question: "${query.question}"

Musical context:
- Project key: ${query.context.project.key.tonic} ${query.context.project.key.mode}
- Tempo: ${query.context.project.tempo} BPM
${query.context.selectedTrack ? `- Selected track: ${query.context.selectedTrack}` : ''}
${query.context.selectedNotes ? `- Selected notes: ${query.context.selectedNotes.length} notes` : ''}

Please provide:
- A clear explanation
- Key theory concepts mentioned
- Related questions the user might want to explore
- Practical examples when helpful`;
  }

  private buildTrackAnalysisPrompt(track: Track, project: Project): string {
    return `Analyze this musical track and provide insights:

Track: ${track.name}
Notes: ${track.notes.length} notes
Project key: ${project.key.tonic} ${project.key.mode}
Tempo: ${project.tempo} BPM

Note data (first 10 notes):
${JSON.stringify(track.notes.slice(0, 10).map(n => ({ pitch: n.pitch, startTime: n.startTime, duration: n.duration })))}

Provide analysis of:
- Melodic direction and contour
- Rhythmic patterns
- Relationship to the project key
- Suggestions for improvement or development`;
  }

  private buildInstrumentPrompt(request: AIInstrumentRequest): string {
    return `Create a synthesizer instrument based on this description:

Description: "${request.prompt}"

Target characteristics:
- Brightness: ${request.targetCharacteristics.brightness * 100}%
- Warmth: ${request.targetCharacteristics.warmth * 100}%
- Attack: ${request.targetCharacteristics.attack * 100}%
- Sustain: ${request.targetCharacteristics.sustain * 100}%
- Complexity: ${request.targetCharacteristics.complexity * 100}%

Please provide synthesis parameters including:
- Oscillator configurations (waveforms, frequencies)
- Filter settings (type, frequency, resonance)
- Envelope parameters (ADSR)
- Effect chain recommendations
- A creative preset name and description`;
  }

  private buildInstrumentModificationPrompt(instrument: InstrumentConfig, prompt: string): string {
    return `Modify the following instrument according to the user's request:

Current instrument: ${JSON.stringify(instrument)}

Modification request: "${prompt}"

Please provide the modified instrument parameters with explanations of the changes made.`;
  }

  // Fallback methods for when AI is unavailable
  private generateFallbackMelody(request: AIMelodyRequest): AIMelodyResponse {
    // Simple algorithmic melody generation based on key and constraints
    const scale = this.theoryService.getScaleNotes(request.projectContext.key, request.projectContext.key.mode);
    const notes: Note[] = [];
    
    const noteCount = Math.floor(request.constraints.length / 0.5); // Half notes
    
    for (let i = 0; i < noteCount; i++) {
      const scaleNote = scale[i % scale.length];
      notes.push({
        id: `fallback_note_${i}`,
        pitch: scaleNote.pitch,
        velocity: 80,
        startTime: i * 0.5,
        duration: 0.5,
        trackId: request.constraints.targetTrack
      });
    }

    return {
      notes,
      explanation: 'Generated using rule-based fallback (AI unavailable)',
      confidence: 0.6,
      alternativeVersions: [],
      theoryAnalysis: {
        scaleUsed: [request.projectContext.key.mode],
        rhythmicPattern: 'Regular half notes',
        melodicDirection: 'ascending'
      }
    };
  }

  private generateFallbackTheoryResponse(query: AITheoryQuery): AITheoryResponse {
    return {
      explanation: 'AI theory explanation is currently unavailable. Please check your API configuration.',
      concepts: [],
      examples: {},
      relatedQuestions: [
        'What makes a chord progression work?',
        'How do I choose the right scale?',
        'What are the basic rules of melody writing?'
      ]
    };
  }

  private generateFallbackTrackAnalysis(track: Track, project: Project): TrackAnalysis {
    return {
      key: project.key,
      tempo: project.tempo,
      chords: [],
      melodicDirection: 'contoured',
      complexity: track.notes.length > 20 ? 'complex' : track.notes.length > 10 ? 'moderate' : 'simple',
      suggestions: ['Track analysis unavailable - AI service not configured']
    };
  }

  private generateFallbackInstrument(request: AIInstrumentRequest): AIInstrumentResponse {
    return {
      instrumentConfig: {
        type: 'sine',
        params: {}
      },
      presetName: 'Basic Sine',
      description: 'Simple sine wave (AI unavailable)',
      parameters: {
        synthesisType: 'subtractive',
        oscillators: [{
          waveform: 'sine',
          frequency: 440,
          amplitude: 0.7
        }],
        filters: [],
        envelopes: [{
          attack: 0.01,
          decay: 0.3,
          sustain: 0.5,
          release: 1.0
        }],
        effects: []
      }
    };
  }

  // Response parsing methods
  private parseMelodyResponse(response: any, request: AIMelodyRequest): AIMelodyResponse {
    try {
      const content = this.extractContentFromResponse(response);
      const parsed = JSON.parse(content);
      
      // Validate and format the response
      return {
        notes: parsed.notes.map((note: any, index: number) => ({
          id: `ai_note_${Date.now()}_${index}`,
          pitch: note.pitch,
          velocity: note.velocity || 80,
          startTime: note.startTime,
          duration: note.duration,
          trackId: request.constraints.targetTrack
        })),
        explanation: parsed.explanation || 'AI-generated melody',
        confidence: parsed.confidence || 0.7,
        alternativeVersions: parsed.alternativeVersions || [],
        theoryAnalysis: parsed.theoryAnalysis || {
          scaleUsed: [request.projectContext.key.mode],
          rhythmicPattern: 'Generated',
          melodicDirection: 'contoured'
        }
      };
    } catch (error) {
      console.error('Failed to parse melody response:', error);
      return this.generateFallbackMelody(request);
    }
  }

  private parseTheoryResponse(response: any, query: AITheoryQuery): AITheoryResponse {
    try {
      const content = this.extractContentFromResponse(response);
      
      return {
        explanation: content,
        concepts: this.extractTheoryConcepts(content),
        examples: {},
        relatedQuestions: this.generateRelatedQuestions(query.question)
      };
    } catch (error) {
      console.error('Failed to parse theory response:', error);
      return this.generateFallbackTheoryResponse(query);
    }
  }

  private parseTrackAnalysis(response: any, track: Track, project: Project): TrackAnalysis {
    try {
      const content = this.extractContentFromResponse(response);
      
      return {
        key: project.key,
        tempo: project.tempo,
        chords: [],
        melodicDirection: 'contoured',
        complexity: 'moderate',
        suggestions: [content]
      };
    } catch (error) {
      console.error('Failed to parse track analysis:', error);
      return this.generateFallbackTrackAnalysis(track, project);
    }
  }

  private parseInstrumentResponse(response: any, request: AIInstrumentRequest): AIInstrumentResponse {
    try {
      const content = this.extractContentFromResponse(response);
      
      return {
        instrumentConfig: {
          type: 'sine',
          params: {}
        },
        presetName: 'AI Generated',
        description: content,
        parameters: {
          synthesisType: 'subtractive',
          oscillators: [],
          filters: [],
          envelopes: [],
          effects: []
        }
      };
    } catch (error) {
      console.error('Failed to parse instrument response:', error);
      return this.generateFallbackInstrument(request);
    }
  }

  private extractContentFromResponse(response: any): string {
    // Handle different API response formats
    if (response.choices && response.choices[0]) {
      return response.choices[0].message?.content || response.choices[0].text || '';
    }
    if (response.content) {
      return response.content;
    }
    if (typeof response === 'string') {
      return response;
    }
    return JSON.stringify(response);
  }

  private extractTheoryConcepts(content: string): string[] {
    const concepts = [];
    const theoryTerms = [
      'chord', 'scale', 'key', 'melody', 'harmony', 'rhythm', 'tempo', 'interval',
      'progression', 'cadence', 'modulation', 'voice leading', 'counterpoint'
    ];
    
    for (const term of theoryTerms) {
      if (content.toLowerCase().includes(term)) {
        concepts.push(term);
      }
    }
    
    return concepts;
  }

  private generateRelatedQuestions(originalQuestion: string): string[] {
    return [
      'How can I apply this concept in my composition?',
      'What are some common variations of this technique?',
      'Are there any famous examples of this in popular music?',
      'What should I learn next to build on this concept?'
    ];
  }
}

// Export a singleton instance
export const aiService = new AIServiceImpl();