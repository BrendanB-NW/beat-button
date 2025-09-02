import React from 'react';
import { useDAWStore } from '../../stores/dawStore';
import { TransportControls } from './TransportControls';

export function Timeline() {
  const {
    currentProject,
    timeline,
    setPlayheadPosition,
    toggleTheoryHelper,
    toggleAIAssistant,
    aiAssistantVisible
  } = useDAWStore();

  if (!currentProject || !timeline) {
    return null;
  }

  const beatsPerMeasure = currentProject.timeSignature.numerator;
  const totalBeats = 64; // Show 16 measures by default
  const beatWidth = 40; // pixels per beat

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const beat = x / beatWidth;
    setPlayheadPosition(Math.max(0, beat));
  };

  const renderTimelineMarkers = () => {
    const markers = [];
    const totalMeasures = Math.ceil(totalBeats / beatsPerMeasure);

    for (let measure = 0; measure < totalMeasures; measure++) {
      for (let beat = 0; beat < beatsPerMeasure; beat++) {
        const absoluteBeat = measure * beatsPerMeasure + beat;
        const x = absoluteBeat * beatWidth;

        // Measure lines
        if (beat === 0) {
          markers.push(
            <div
              key={`measure-${measure}`}
              className="absolute top-0 bottom-0 border-l-2 border-gray-500 pointer-events-none"
              style={{ left: x }}
            />
          );
          markers.push(
            <div
              key={`measure-label-${measure}`}
              className="absolute top-1 text-xs text-gray-400 pointer-events-none"
              style={{ left: x + 4 }}
            >
              {measure + 1}
            </div>
          );
        } else {
          // Beat lines
          markers.push(
            <div
              key={`beat-${absoluteBeat}`}
              className="absolute top-4 bottom-0 border-l border-gray-600 pointer-events-none"
              style={{ left: x }}
            />
          );
        }
      }
    }

    return markers;
  };

  const playheadX = timeline.playheadPosition * beatWidth;

  return (
    <div className="h-full bg-gray-800 relative border-b border-gray-700 flex">
      {/* Timeline ruler section */}
      <div className="flex-1 h-full relative bg-gray-800 border-r border-gray-600">
        <div className="h-full w-full overflow-x-auto">
          {/* Simple timeline with measure numbers */}
          <div className="h-full relative flex items-center" style={{ minWidth: totalBeats * beatWidth }}>
            {/* Measure markers - simplified */}
            {Array.from({ length: Math.ceil(totalBeats / beatsPerMeasure) }, (_, i) => (
              <div key={i} className="absolute top-2 text-xs text-gray-400" style={{ left: i * beatsPerMeasure * beatWidth + 4 }}>
                {i + 1}
              </div>
            ))}
            
            {/* Beat lines - simplified */}
            {Array.from({ length: totalBeats }, (_, i) => (
              <div 
                key={i} 
                className={`absolute top-4 bottom-0 pointer-events-none ${i % beatsPerMeasure === 0 ? 'border-l-2 border-gray-500' : 'border-l border-gray-600'}`}
                style={{ left: i * beatWidth }}
              />
            ))}
            
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 border-l-2 border-red-500 pointer-events-none z-10"
              style={{ left: playheadX }}
            />
          </div>
        </div>
      </div>
      
      {/* Transport Controls section */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center px-4">
        <div className="flex items-center space-x-3">
          <TransportControls />
          <div className="w-px h-8 bg-gray-600"></div>
          <button
            onClick={toggleTheoryHelper}
            className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Theory Helper"
          >
            ?
          </button>
          <button
            onClick={toggleAIAssistant}
            className={`p-2 rounded transition-colors ${
              aiAssistantVisible 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="AI Assistant"
          >
            🤖
          </button>
        </div>
      </div>
    </div>
  );
}