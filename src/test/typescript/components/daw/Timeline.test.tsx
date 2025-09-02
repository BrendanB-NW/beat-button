import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from '../../../../main/typescript/components/daw/Timeline';
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

// Mock the TransportControls component
jest.mock('../../../../main/typescript/components/daw/TransportControls', () => ({
  TransportControls: () => <div data-testid="transport-controls">Transport Controls</div>
}));

describe('Timeline', () => {
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

  const mockTimeline = {
    playheadPosition: 0,
    isPlaying: false,
    isRecording: false
  };

  const mockSetPlayheadPosition = jest.fn();
  const mockToggleTheoryHelper = jest.fn();
  const mockToggleAIAssistant = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when no project is loaded', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: null,
      timeline: null,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    const { container } = render(<Timeline />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when no timeline is available', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: null,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    const { container } = render(<Timeline />);
    expect(container.firstChild).toBeNull();
  });

  it('renders timeline with fixed positioned transport controls when project is loaded', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    // Check that transport controls are present
    expect(screen.getByTestId('transport-controls')).toBeInTheDocument();
    
    // Check that helper buttons are present
    expect(screen.getByTitle('Theory Helper')).toBeInTheDocument();
    expect(screen.getByTitle('AI Assistant')).toBeInTheDocument();
  });

  it('applies fixed positioning styles to transport controls panel', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    // Find the fixed positioned panel
    const fixedPanel = screen.getByTestId('transport-controls').closest('.fixed');
    expect(fixedPanel).toBeInTheDocument();
    expect(fixedPanel).toHaveClass('fixed', 'top-20', 'right-4', 'z-50');
    expect(fixedPanel).toHaveClass('bg-earth-bg-900', 'border', 'border-earth-bg-700', 'rounded-lg', 'shadow-lg', 'p-3');
  });

  it('renders measure markers correctly based on time signature', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    // For 4/4 time signature with 32 beats total, we should have 8 measures (32/4)
    const measureLabels = screen.getAllByText(/^[1-8]$/);
    expect(measureLabels).toHaveLength(8);
  });

  it('calls setPlayheadPosition when timeline is clicked', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    // Find the timeline container (the clickable area)
    const timelineContainer = document.querySelector('.cursor-pointer');
    expect(timelineContainer).toBeInTheDocument();

    // Mock getBoundingClientRect for click position calculation
    Object.defineProperty(timelineContainer, 'getBoundingClientRect', {
      writable: true,
      value: jest.fn(() => ({
        left: 0,
        top: 0,
        right: 960, // 32 beats * 30px = 960px
        bottom: 100,
        width: 960,
        height: 100
      }))
    });

    // Simulate click at position x=150 (should be beat 5: 150/30 = 5)
    fireEvent.click(timelineContainer!, { clientX: 150 });

    expect(mockSetPlayheadPosition).toHaveBeenCalledWith(5);
  });

  it('calls toggleTheoryHelper when theory helper button is clicked', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    const theoryButton = screen.getByTitle('Theory Helper');
    fireEvent.click(theoryButton);

    expect(mockToggleTheoryHelper).toHaveBeenCalledTimes(1);
  });

  it('calls toggleAIAssistant when AI assistant button is clicked', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    const aiButton = screen.getByTitle('AI Assistant');
    fireEvent.click(aiButton);

    expect(mockToggleAIAssistant).toHaveBeenCalledTimes(1);
  });

  it('applies active styling to AI assistant button when aiAssistantVisible is true', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: true
    });

    render(<Timeline />);

    const aiButton = screen.getByTitle('AI Assistant');
    expect(aiButton).toHaveClass('bg-earth-green-600', 'text-earth-bg-50');
  });

  it('applies inactive styling to AI assistant button when aiAssistantVisible is false', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    const aiButton = screen.getByTitle('AI Assistant');
    expect(aiButton).toHaveClass('bg-earth-ochre-600', 'text-earth-bg-100');
  });

  it('positions playhead correctly based on timeline position', () => {
    const timelineWithPlayhead = {
      ...mockTimeline,
      playheadPosition: 8 // 8 beats
    };

    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: timelineWithPlayhead,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    // Playhead should be positioned at 8 * 30px = 240px from the left
    const playhead = document.querySelector('.border-earth-green-400');
    expect(playhead).toBeInTheDocument();
    expect(playhead).toHaveStyle('left: 240px');
  });

  it('renders timeline with correct width based on totalBeats and beatWidth', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    // Timeline should be 32 beats * 30px = 960px wide
    const timelineContainer = document.querySelector('.cursor-pointer');
    expect(timelineContainer).toHaveStyle('width: 960px');
  });

  it('prevents playhead position from going below zero', () => {
    mockUseDAWStore.mockReturnValue({
      currentProject: mockProject,
      timeline: mockTimeline,
      setPlayheadPosition: mockSetPlayheadPosition,
      toggleTheoryHelper: mockToggleTheoryHelper,
      toggleAIAssistant: mockToggleAIAssistant,
      aiAssistantVisible: false
    });

    render(<Timeline />);

    const timelineContainer = document.querySelector('.cursor-pointer');
    
    // Mock getBoundingClientRect for click position calculation
    Object.defineProperty(timelineContainer, 'getBoundingClientRect', {
      writable: true,
      value: jest.fn(() => ({
        left: 100, // Timeline starts at x=100
        top: 0,
        right: 1060,
        bottom: 100,
        width: 960,
        height: 100
      }))
    });

    // Simulate click at x=50 (before timeline start)
    // This should result in a negative beat position, but should be clamped to 0
    fireEvent.click(timelineContainer!, { clientX: 50 });

    expect(mockSetPlayheadPosition).toHaveBeenCalledWith(0);
  });
});