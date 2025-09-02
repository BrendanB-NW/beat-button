import React from 'react';
import { Play, Pause, Square, SkipBack, RotateCcw, RotateCw } from 'lucide-react';
import { useDAWStore } from '../../stores/dawStore';

export function TransportControls() {
  const {
    isPlaying,
    masterVolume,
    play,
    pause,
    stop,
    setMasterVolume,
    setPlayheadPosition,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDAWStore();

  const handlePlay = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleRewind = () => {
    setPlayheadPosition(0);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Playback controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleRewind}
          className="transport-button"
          title="Rewind to beginning"
        >
          <SkipBack size={16} />
        </button>
        
        <button
          onClick={handlePlay}
          className={`transport-button ${isPlaying ? 'active' : ''}`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button
          onClick={handleStop}
          className="transport-button"
          title="Stop"
        >
          <Square size={16} />
        </button>
      </div>

      {/* Master volume */}
      <div className="flex items-center space-x-2">
        <label htmlFor="master-volume" className="text-xs text-earth-bg-300">
          Master
        </label>
        <input
          id="master-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="volume-fader w-20"
        />
        <span className="text-xs text-earth-bg-300 w-8">
          {Math.round(masterVolume * 100)}
        </span>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center space-x-1">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="transport-button disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <RotateCcw size={16} />
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="transport-button disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>

    </div>
  );
}