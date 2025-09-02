import React from 'react';
import { useDAWStore } from '@/stores/dawStore';

export function PianoRoll() {
  const {
    currentProject,
    pianoRoll,
    addNote,
    selectNotes
  } = useDAWStore();

  if (!currentProject || currentProject.tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No tracks available</p>
          <p className="text-sm">Add a track to start composing</p>
        </div>
      </div>
    );
  }

  // For now, show the first track
  const currentTrack = currentProject.tracks[0];
  if (!currentTrack) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <p>No track selected</p>
      </div>
    );
  }
  const notes = currentTrack.notes;
  
  const beatWidth = 40; // pixels per beat
  const noteHeight = 12; // pixels per semitone
  const totalBeats = 64;
  const minPitch = pianoRoll.viewRange.minPitch;
  const maxPitch = pianoRoll.viewRange.maxPitch;
  const pitchRange = maxPitch - minPitch;
  
  const midiToNoteName = (midi: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return `${note}${octave}`;
  };

  const isWhiteKey = (midi: number): boolean => {
    const pitchClass = midi % 12;
    return [0, 2, 4, 5, 7, 9, 11].includes(pitchClass);
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // Account for piano keys width
    const y = e.clientY - rect.top;
    
    const startTime = Math.floor((x / beatWidth) * 4) / 4; // Snap to 16th notes
    const pitch = Math.floor(maxPitch - (y / noteHeight));
    
    if (pitch >= minPitch && pitch <= maxPitch && startTime >= 0) {
      addNote({
        pitch,
        velocity: 80,
        startTime,
        duration: 0.25, // 16th note
        trackId: currentTrack.id
      });
    }
  };

  const renderPianoKeys = () => {
    const keys = [];
    for (let pitch = maxPitch; pitch >= minPitch; pitch--) {
      const y = (maxPitch - pitch) * noteHeight;
      const isWhite = isWhiteKey(pitch);
      
      keys.push(
        <div
          key={pitch}
          className={`absolute left-0 w-14 border-b border-gray-600 flex items-center justify-end pr-2 text-xs ${
            isWhite ? 'piano-white-key text-gray-800' : 'piano-black-key text-gray-200'
          }`}
          style={{
            top: y,
            height: noteHeight,
            zIndex: isWhite ? 1 : 2
          }}
        >
          {(pitch % 12 === 0 || pitch === minPitch) && midiToNoteName(pitch)}
        </div>
      );
    }
    return keys;
  };

  const renderGrid = () => {
    const lines = [];
    
    // Horizontal lines (pitch)
    for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
      const y = (maxPitch - pitch) * noteHeight;
      const isWhite = isWhiteKey(pitch);
      
      lines.push(
        <div
          key={`h-${pitch}`}
          className={`absolute left-0 right-0 border-b ${
            isWhite ? 'border-gray-700' : 'border-gray-800'
          }`}
          style={{ top: y }}
        />
      );
    }
    
    // Vertical lines (time)
    const beatsPerMeasure = currentProject.timeSignature.numerator;
    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = beat * beatWidth;
      const isMeasureLine = beat % beatsPerMeasure === 0;
      const isBeatLine = beat % 1 === 0;
      
      lines.push(
        <div
          key={`v-${beat}`}
          className={`absolute top-0 bottom-0 ${
            isMeasureLine
              ? 'grid-line-measure'
              : isBeatLine
              ? 'grid-line-beat'
              : 'grid-line-subdivision'
          }`}
          style={{ left: x + 60 }} // Account for piano keys width
        />
      );
    }
    
    return lines;
  };

  const renderNotes = () => {
    return notes.map((note) => {
      const x = note.startTime * beatWidth + 60; // Account for piano keys width
      const y = (maxPitch - note.pitch) * noteHeight;
      const width = note.duration * beatWidth;
      const isSelected = pianoRoll.selectedNotes.includes(note.id);
      
      return (
        <div
          key={note.id}
          className={`absolute note-block ${isSelected ? 'selected' : ''}`}
          style={{
            left: x,
            top: y,
            width: Math.max(width, 8), // Minimum width
            height: noteHeight - 2
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.ctrlKey || e.metaKey) {
              // Multi-select
              const newSelection = isSelected
                ? pianoRoll.selectedNotes.filter(id => id !== note.id)
                : [...pianoRoll.selectedNotes, note.id];
              selectNotes(newSelection);
            } else {
              selectNotes([note.id]);
            }
          }}
        />
      );
    });
  };

  return (
    <div className="flex-1 flex bg-gray-900 overflow-hidden">
      {/* Piano keys column */}
      <div className="w-14 bg-gray-800 border-r border-gray-700 relative flex-shrink-0">
        {renderPianoKeys()}
      </div>
      
      {/* Main grid area */}
      <div className="flex-1 relative overflow-auto scrollbar-thin">
        <div
          className="relative cursor-crosshair"
          style={{
            width: totalBeats * beatWidth + 60,
            height: pitchRange * noteHeight
          }}
          onClick={handleGridClick}
        >
          {renderGrid()}
          {renderNotes()}
        </div>
      </div>
    </div>
  );
}