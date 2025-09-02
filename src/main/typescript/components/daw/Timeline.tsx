import React from 'react';
import { useDAWStore } from '../../stores/dawStore';
import { TransportControls } from './TransportControls';

export function Timeline() {
  const {
    currentProject,
    timeline,
    setPlayheadPosition
  } = useDAWStore();

  if (!currentProject) return null;

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
      {/* Timeline ruler */}
      <div
        className="flex-1 h-full relative cursor-pointer overflow-x-auto scrollbar-thin"
        style={{ minWidth: totalBeats * beatWidth }}
        onClick={handleTimelineClick}
      >
        {renderTimelineMarkers()}
        
        {/* Loop markers */}
        {timeline.loopEnabled && (
          <>
            <div
              className="absolute top-0 bottom-0 bg-primary-600 bg-opacity-20 pointer-events-none"
              style={{
                left: timeline.loopStart * beatWidth,
                width: (timeline.loopEnd - timeline.loopStart) * beatWidth
              }}
            />
            <div
              className="absolute top-0 bottom-0 border-l-2 border-primary-500 pointer-events-none"
              style={{ left: timeline.loopStart * beatWidth }}
            />
            <div
              className="absolute top-0 bottom-0 border-l-2 border-primary-500 pointer-events-none"
              style={{ left: timeline.loopEnd * beatWidth }}
            />
          </>
        )}
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 border-l-2 border-red-500 pointer-events-none z-10"
          style={{ left: playheadX }}
        />
        
        {/* Playhead triangle */}
        <div
          className="absolute top-0 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500 pointer-events-none z-10"
          style={{ left: playheadX - 4 }}
        />
      </div>
      
      {/* Transport Controls in timeline */}
      <div className="flex items-center justify-center bg-gray-800 border-l border-gray-700 px-4 min-w-fit">
        <TransportControls />
      </div>
    </div>
  );
}