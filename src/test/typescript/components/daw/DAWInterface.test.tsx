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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows welcome screen when no project is loaded', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: null,
      aiAssistantVisible: false,
      toggleAIAssistant: jest.fn()
    });

    render(<DAWInterface />);

    expect(screen.getByText('Welcome to B. Boyd\'s Bangin\' Beat Button')).toBeInTheDocument();
    expect(screen.getByText('Create a new project or load an existing one to start making music')).toBeInTheDocument();
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();
    expect(screen.getByTestId('project-manager')).toBeInTheDocument();
    
    // Should not show DAW interface components
    expect(screen.queryByTestId('track-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('timeline')).not.toBeInTheDocument();
    expect(screen.queryByTestId('piano-roll')).not.toBeInTheDocument();
  });

  it('shows full DAW interface when project is loaded', () => {
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

    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      aiAssistantVisible: false,
      toggleAIAssistant: jest.fn()
    });

    render(<DAWInterface />);

    // Should show project info
    expect(screen.getByText(/Test Project.*C major.*120 BPM/)).toBeInTheDocument();
    
    // Should show all DAW components
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();
    expect(screen.getByTestId('project-manager')).toBeInTheDocument();
    expect(screen.getByTestId('track-list')).toBeInTheDocument();
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
    expect(screen.getByTestId('piano-roll')).toBeInTheDocument();
    
    // Should not show welcome screen
    expect(screen.queryByText('Welcome to B. Boyd\'s Bangin\' Beat Button')).not.toBeInTheDocument();
  });

  it('always shows transport controls regardless of project state', () => {
    // Test with no project
    mockUseDAWStore.mockReturnValue({
      currentProject: null,
      aiAssistantVisible: false,
      toggleAIAssistant: jest.fn()
    });
    const { rerender } = render(<DAWInterface />);
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();

    // Test with project
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

    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      aiAssistantVisible: false,
      toggleAIAssistant: jest.fn()
    });
    rerender(<DAWInterface />);
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();
  });
});