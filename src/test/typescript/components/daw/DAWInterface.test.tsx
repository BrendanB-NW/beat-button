import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DAWInterface } from '../../../../main/typescript/components/daw/DAWInterface';
import { useDAWStore } from '../../../../main/typescript/stores/dawStore';

// Mock the zustand store
jest.mock('../../../../main/typescript/stores/dawStore');
const mockUseDAWStore = useDAWStore as jest.MockedFunction<typeof useDAWStore>;

// Mock the audioEngine to avoid Tone.js issues
jest.mock('../../../../main/typescript/services/audioEngine', () => ({
  audioEngine: {
    setTempo: jest.fn(),
    createSynthesizer: jest.fn(),
    playNote: jest.fn(),
    stopNote: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  }
}));

// Mock the child components
jest.mock('../../../../main/typescript/components/daw/TransportControls', () => ({
  TransportControls: () => <div data-testid="transport-controls">Transport Controls</div>
}));

jest.mock('../../../../main/typescript/components/daw/ProjectManager', () => ({
  ProjectManager: () => <div data-testid="project-manager">Project Manager</div>
}));

jest.mock('../../../../main/typescript/components/daw/TrackList', () => ({
  TrackList: () => <div data-testid="track-list">Track List</div>
}));

jest.mock('../../../../main/typescript/components/daw/Timeline', () => ({
  Timeline: () => <div data-testid="timeline">Timeline</div>
}));

jest.mock('../../../../main/typescript/components/daw/PianoRoll', () => ({
  PianoRoll: () => <div data-testid="piano-roll">Piano Roll</div>
}));

// Mock the AI Assistant Panel
jest.mock('../../../../main/typescript/components/ai/AIAssistantPanel', () => ({
  AIAssistantPanel: ({ visible }: { visible: boolean }) => 
    visible ? <div data-testid="ai-assistant">AI Assistant</div> : null
}));

// Mock the AI service
jest.mock('../../../../main/typescript/services/aiService', () => ({
  aiService: {
    setApiKey: jest.fn(),
    setUserPreferences: jest.fn(),
    generateMelody: jest.fn(),
    explainTheory: jest.fn(),
    createInstrument: jest.fn()
  }
}));

describe('DAWInterface', () => {
  const mockProject = {
    id: 'test-project',
    name: 'Test Project',
    key: { tonic: 'C', mode: 'major' },
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    tracks: [],
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows welcome screen when no project is loaded', () => {
    // Mock the individual selector calls in the component
    mockUseDAWStore
      .mockReturnValueOnce(null) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId 
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    render(<DAWInterface />);

    expect(screen.getByText('Welcome to SoundSage')).toBeInTheDocument();
    expect(screen.getByText('Create a new project or load an existing one to start making music')).toBeInTheDocument();
    expect(screen.getByTestId('project-manager')).toBeInTheDocument();
    
    // Should not show DAW interface components
    expect(screen.queryByTestId('track-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('timeline')).not.toBeInTheDocument();
    expect(screen.queryByTestId('piano-roll')).not.toBeInTheDocument();
  });

  it('shows full DAW interface when project is loaded', () => {
    // Mock the individual selector calls in the component
    mockUseDAWStore
      .mockReturnValueOnce(mockProject) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    render(<DAWInterface />);

    // Should show project info
    expect(screen.getByText(/Test Project.*C major.*120 BPM/)).toBeInTheDocument();
    
    // Should show all DAW components
    expect(screen.getByTestId('project-manager')).toBeInTheDocument();
    expect(screen.getByTestId('track-list')).toBeInTheDocument();
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
    expect(screen.getByTestId('piano-roll')).toBeInTheDocument();
    
    // Should not show welcome screen
    expect(screen.queryByText('Welcome to SoundSage')).not.toBeInTheDocument();
  });

  it('shows timeline only when project is loaded (not on welcome screen)', () => {
    // Test with no project - timeline should not be visible
    mockUseDAWStore
      .mockReturnValueOnce(null) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    const { rerender } = render(<DAWInterface />);
    expect(screen.queryByTestId('timeline')).not.toBeInTheDocument();

    // Test with project - timeline should be visible
    // Clear the mock and set new return values
    mockUseDAWStore.mockClear();
    mockUseDAWStore
      .mockReturnValueOnce(mockProject) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    rerender(<DAWInterface />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('positions timeline above piano roll in correct layout hierarchy', () => {
    // Mock the individual selector calls in the component
    mockUseDAWStore
      .mockReturnValueOnce(mockProject) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    const { container } = render(<DAWInterface />);

    const timeline = screen.getByTestId('timeline');
    const pianoRoll = screen.getByTestId('piano-roll');
    
    // Both should be present
    expect(timeline).toBeInTheDocument();
    expect(pianoRoll).toBeInTheDocument();
    
    // Timeline should come before piano roll in DOM order (positioned above)
    // Get all elements and check their relative positions in the DOM
    const allElements = Array.from(container.querySelectorAll('[data-testid]'));
    const timelineIndex = allElements.indexOf(timeline);
    const pianoRollIndex = allElements.indexOf(pianoRoll);
    
    expect(timelineIndex).toBeLessThan(pianoRollIndex);
  });

  it('shows selected track information when track is selected', () => {
    const mockProjectWithTrack = {
      ...mockProject,
      tracks: [
        {
          id: 'track-1',
          name: 'Lead Synth',
          instrument: { type: 'piano' },
          notes: [],
          volume: 0.8,
          pan: 0,
          muted: false,
          soloed: false
        }
      ]
    };

    // Mock the individual selector calls with selected track
    mockUseDAWStore
      .mockReturnValueOnce(mockProjectWithTrack) // currentProject
      .mockReturnValueOnce('track-1') // selectedTrackId
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    render(<DAWInterface />);

    // Should show selected track info
    expect(screen.getByText(/🎹 Editing: Lead Synth \(piano\)/)).toBeInTheDocument();
  });

  it('shows AI assistant when toggled visible', () => {
    // Mock the individual selector calls with AI assistant visible
    mockUseDAWStore
      .mockReturnValueOnce(mockProject) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId
      .mockReturnValueOnce(true) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    render(<DAWInterface />);

    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });

  it('hides AI assistant when toggled invisible', () => {
    // Mock the individual selector calls with AI assistant hidden
    mockUseDAWStore
      .mockReturnValueOnce(mockProject) // currentProject
      .mockReturnValueOnce(null) // selectedTrackId
      .mockReturnValueOnce(false) // aiAssistantVisible
      .mockReturnValueOnce(jest.fn()) // toggleAIAssistant
      .mockReturnValueOnce(jest.fn()); // toggleTheoryHelper

    render(<DAWInterface />);

    expect(screen.queryByTestId('ai-assistant')).not.toBeInTheDocument();
  });
});