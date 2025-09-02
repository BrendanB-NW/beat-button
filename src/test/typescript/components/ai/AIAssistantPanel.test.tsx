import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIAssistantPanel } from '../../../../main/typescript/components/ai/AIAssistantPanel';
import { useDAWStore } from '../../../../main/typescript/stores/dawStore';

// Mock the DAW store
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

// Mock the child components
jest.mock('../../../../main/typescript/components/ai/AIMelodyGenerator', () => ({
  AIMelodyGenerator: () => <div data-testid="melody-generator">Melody Generator</div>
}));

jest.mock('../../../../main/typescript/components/ai/TheoryExplanationModal', () => ({
  TheoryExplanationModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="theory-modal">
      <button onClick={onClose}>Close Theory Modal</button>
    </div>
  )
}));

jest.mock('../../../../main/typescript/components/ai/AIInstrumentDesigner', () => ({
  AIInstrumentDesigner: () => <div data-testid="instrument-designer">Instrument Designer</div>
}));

describe('AIAssistantPanel', () => {
  const mockStoreState = {
    aiHistory: [],
    aiGenerating: false,
    lastTheoryResponse: null,
    aiPreferences: {
      theoryLevel: 'beginner' as const,
      preferredGenres: ['pop', 'rock'],
      explanationStyle: 'conversational' as const,
      creativityLevel: 0.7
    },
    currentProject: null,
    askAIQuestion: jest.fn(),
    setAIPreferences: jest.fn(),
    clearAIHistory: jest.fn(),
    setAIApiKey: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDAWStore.mockReturnValue(mockStoreState);
    
    // Mock scrollIntoView for JSDOM
    Element.prototype.scrollIntoView = jest.fn();
  });

  describe('visibility', () => {
    it('should not render when visible is false', () => {
      render(<AIAssistantPanel visible={false} onClose={jest.fn()} />);
      expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
    });

    it('should render when visible is true', () => {
      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      expect(screen.getByText('🤖 AI Assistant')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      render(<AIAssistantPanel visible={true} onClose={onClose} />);
      
      const closeButton = screen.getByText('✕');
      await userEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('mode switching', () => {
    it('should switch between different modes', async () => {
      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      // Should start in chat mode
      expect(screen.getByText('👋 Hi! I\'m your AI music assistant.')).toBeInTheDocument();
      
      // Switch to melody mode
      const melodyButton = screen.getByTitle('Generate Melody');
      await userEvent.click(melodyButton);
      expect(screen.getByTestId('melody-generator')).toBeInTheDocument();
      
      // Switch to theory mode
      const theoryButton = screen.getByTitle('Theory Help');
      await userEvent.click(theoryButton);
      expect(screen.getByText('Theory Helper')).toBeInTheDocument();
      
      // Switch to instrument mode
      const instrumentButton = screen.getByTitle('Create Instrument');
      await userEvent.click(instrumentButton);
      expect(screen.getByTestId('instrument-designer')).toBeInTheDocument();
      
      // Switch to settings mode
      const settingsButton = screen.getByTitle('Settings');
      await userEvent.click(settingsButton);
      expect(screen.getByText('AI Configuration')).toBeInTheDocument();
    });
  });

  describe('chat functionality', () => {
    it('should display empty state message when no history', () => {
      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      expect(screen.getByText('👋 Hi! I\'m your AI music assistant.')).toBeInTheDocument();
      expect(screen.getByText('Quick questions:')).toBeInTheDocument();
    });

    it('should display project warning when no project loaded', () => {
      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      expect(screen.getByText('💡 Create or load a project to get contextual theory help!')).toBeInTheDocument();
    });

    it('should allow asking questions', async () => {
      const mockAskAIQuestion = jest.fn();
      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        askAIQuestion: mockAskAIQuestion
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      const input = screen.getByPlaceholderText('Ask me about music theory...');
      const askButton = screen.getByText('Ask');
      
      await userEvent.type(input, 'What is a chord?');
      await userEvent.click(askButton);
      
      expect(mockAskAIQuestion).toHaveBeenCalledWith('What is a chord?');
    });

    it('should handle quick questions', async () => {
      const mockAskAIQuestion = jest.fn();
      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        askAIQuestion: mockAskAIQuestion
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      const quickQuestion = screen.getByText('Why does this chord progression work?');
      await userEvent.click(quickQuestion);
      
      expect(mockAskAIQuestion).toHaveBeenCalledWith('Why does this chord progression work?');
    });

    it('should show loading state when AI is generating', () => {
      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        aiGenerating: true
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      expect(screen.getByText('🤖 AI Assistant')).toBeInTheDocument();
      // Loading indicator should be visible
      const loadingDot = document.querySelector('.animate-pulse');
      expect(loadingDot).toBeInTheDocument();
    });

    it('should display AI history when available', () => {
      const mockHistory = [
        {
          id: 'interaction1',
          timestamp: new Date(),
          type: 'theory' as const,
          prompt: 'What is a scale?',
          response: {
            explanation: 'A scale is a series of musical notes.',
            concepts: ['scale', 'notes'],
            examples: {},
            relatedQuestions: []
          },
          applied: false
        }
      ];

      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        aiHistory: mockHistory
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      expect(screen.getByText('What is a scale?')).toBeInTheDocument();
      expect(screen.getByText('A scale is a series of musical notes.')).toBeInTheDocument();
      expect(screen.getByText('theory')).toBeInTheDocument();
    });
  });

  describe('settings functionality', () => {
    it('should display current preferences in settings', async () => {
      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      // Switch to settings mode
      const settingsButton = screen.getByTitle('Settings');
      await userEvent.click(settingsButton);
      
      expect(screen.getByDisplayValue('beginner')).toBeInTheDocument();
      expect(screen.getByDisplayValue('conversational')).toBeInTheDocument();
    });

    it('should update preferences when changed', async () => {
      const mockSetAIPreferences = jest.fn();
      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        setAIPreferences: mockSetAIPreferences
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      // Switch to settings mode
      const settingsButton = screen.getByTitle('Settings');
      await userEvent.click(settingsButton);
      
      const theoryLevelSelect = screen.getByDisplayValue('beginner');
      await userEvent.selectOptions(theoryLevelSelect, 'intermediate');
      
      expect(mockSetAIPreferences).toHaveBeenCalledWith({ theoryLevel: 'intermediate' });
    });

    it('should handle API key saving', async () => {
      const mockSetAIApiKey = jest.fn();
      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        setAIApiKey: mockSetAIApiKey
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      // Switch to settings mode
      const settingsButton = screen.getByTitle('Settings');
      await userEvent.click(settingsButton);
      
      const apiKeyInput = screen.getByPlaceholderText('Enter your OpenAI API key');
      const saveButton = screen.getByText('Save');
      
      await userEvent.type(apiKeyInput, 'test-api-key');
      await userEvent.click(saveButton);
      
      expect(mockSetAIApiKey).toHaveBeenCalledWith('test-api-key');
    });
  });

  describe('theory modal integration', () => {
    it('should show theory modal when theory response is available', () => {
      const mockTheoryResponse = {
        explanation: 'This is a theory explanation',
        concepts: ['concept1'],
        examples: {},
        relatedQuestions: []
      };

      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        lastTheoryResponse: mockTheoryResponse
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      // Theory modal should be visible by default when there's a response
      expect(screen.getByTestId('theory-modal')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      const input = screen.getByPlaceholderText('Ask me about music theory...');
      expect(input).toHaveAttribute('type', 'text');
      
      const askButton = screen.getByRole('button', { name: 'Ask' });
      expect(askButton).toBeInTheDocument();
    });

    it('should disable controls when AI is generating', () => {
      mockUseDAWStore.mockReturnValue({
        ...mockStoreState,
        aiGenerating: true
      });

      render(<AIAssistantPanel visible={true} onClose={jest.fn()} />);
      
      const input = screen.getByPlaceholderText('Ask me about music theory...');
      const askButton = screen.getByText('...');
      
      expect(input).toBeDisabled();
      expect(askButton).toBeDisabled();
    });
  });
});