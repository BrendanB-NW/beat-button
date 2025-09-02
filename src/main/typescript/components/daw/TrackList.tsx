import React from 'react';
import { Plus, Volume2, VolumeX, Headphones } from 'lucide-react';
import { useDAWStore } from '@/stores/dawStore';
import { SynthType } from '@/types/music';

export function TrackList() {
  const {
    currentProject,
    addTrack,
    removeTrack,
    muteTrack,
    soloTrack,
    setTrackVolume,
    setTrackPan
  } = useDAWStore();

  const tracks = currentProject?.tracks || [];

  const handleAddTrack = () => {
    const trackNumber = tracks.length + 1;
    addTrack(`Track ${trackNumber}`, 'piano');
  };

  const synthTypes: { value: SynthType; label: string }[] = [
    { value: 'piano', label: 'Piano' },
    { value: 'sine', label: 'Sine' },
    { value: 'square', label: 'Square' },
    { value: 'sawtooth', label: 'Sawtooth' },
    { value: 'triangle', label: 'Triangle' },
    { value: 'guitar', label: 'Guitar' },
    { value: 'strings', label: 'Strings' }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-2">
        <button
          onClick={handleAddTrack}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-primary-600 hover:bg-primary-500 rounded-md text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Track</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tracks.map((track) => (
          <div key={track.id} className="track-header">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={track.name}
                onChange={(_e) => {
                  // Update track name - this would need to be implemented in the store
                }}
                className="bg-transparent text-sm font-medium focus:outline-none focus:bg-gray-700 px-1 rounded"
              />
              <button
                onClick={() => removeTrack(track.id)}
                className="text-gray-400 hover:text-red-400 text-xs"
              >
                ×
              </button>
            </div>

            <div className="mb-2">
              <select
                value={track.instrument.type}
                onChange={(_e) => {
                  // Update track instrument - this would need to be implemented in the store
                }}
                className="w-full text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1"
              >
                {synthTypes.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 mb-2">
              <button
                onClick={() => muteTrack(track.id, !track.muted)}
                className={`track-control-button mute-button ${track.muted ? 'active' : ''}`}
                title={track.muted ? 'Unmute' : 'Mute'}
              >
                {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>

              <button
                onClick={() => soloTrack(track.id, !track.soloed)}
                className={`track-control-button solo-button ${track.soloed ? 'active' : ''}`}
                title={track.soloed ? 'Unsolo' : 'Solo'}
              >
                <Headphones size={12} />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-400 w-8">Vol</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                  className="volume-fader flex-1"
                />
                <span className="text-xs text-gray-400 w-8">
                  {Math.round(track.volume * 100)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-400 w-8">Pan</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={track.pan}
                  onChange={(e) => setTrackPan(track.id, parseFloat(e.target.value))}
                  className="volume-fader flex-1"
                />
                <span className="text-xs text-gray-400 w-8">
                  {track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}