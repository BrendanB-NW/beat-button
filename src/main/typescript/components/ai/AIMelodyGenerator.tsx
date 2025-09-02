import React, { useState } from 'react';
import { useDAWStore } from '../../stores/dawStore';
import { Track } from '../../types/music';

export function AIMelodyGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [length, setLength] = useState(8);
  const [rhythmicDensity, setRhythmicDensity] = useState<'sparse' | 'moderate' | 'dense'>('moderate');
  const [noteRangeMin, setNoteRangeMin] = useState(36);
  const [noteRangeMax, setNoteRangeMax] = useState(84);

  const {
    currentProject,
    aiGenerating,
    generateAIMelody,
    addTrack
  } = useDAWStore();

  const [promptSuggestions] = useState([
    "Create a melancholy melody in a minor key",
    "Generate an uplifting chorus melody",
    "Make a mysterious intro melody with sparse notes",
    "Create a jazzy melody with complex rhythms",
    "Generate a simple pop melody for the verse",
    "Make an energetic melody with dense rhythmic patterns",
    "Create a dreamy ambient melody",
    "Generate a funky bass line melody"
  ]);

  const handleGenerateMelody = async () => {
    if (!prompt.trim() || !selectedTrackId) return;

    const constraints = {
      length,
      rhythmicDensity,
      noteRange: { min: noteRangeMin, max: noteRangeMax }
    };

    await generateAIMelody(prompt, selectedTrackId, constraints);
    setPrompt('');
  };

  const handleCreateNewTrack = () => {
    addTrack('AI Generated Track', 'piano');
    // The new track will be added to currentProject.tracks, so we need to select it
    if (currentProject) {
      const newTrack = currentProject.tracks[currentProject.tracks.length - 1];
      setSelectedTrackId(newTrack.id);
    }
  };

  const getTrackDisplayName = (track: Track) => {
    const noteCount = track.notes.length;
    return `${track.name} (${noteCount} notes)`;
  };

  if (!currentProject) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-400">
          <div className="mb-4 text-4xl">🎵</div>
          <h3 className="text-lg font-medium mb-2">No Project Loaded</h3>
          <p className="text-sm">Please create or load a project to generate melodies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          🎵 Generate Melody
          {aiGenerating && (
            <div className="w-2 h-2 bg-earth-green-500 rounded-full animate-pulse"></div>
          )}
        </h3>

        {/* Current Project Info */}
        <div className="bg-gray-800 p-3 rounded mb-4">
          <div className="text-sm text-gray-300">
            <div className="font-medium">{currentProject.name}</div>
            <div className="text-gray-400">
              {currentProject.key.tonic} {currentProject.key.mode} • {currentProject.tempo} BPM
            </div>
          </div>
        </div>

        {/* Track Selection */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Target Track</label>
          <div className="flex gap-2">
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-earth-purple-500 focus:outline-none text-sm"
            >
              <option value="">Select a track...</option>
              {currentProject.tracks.map(track => (
                <option key={track.id} value={track.id}>
                  {getTrackDisplayName(track)}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateNewTrack}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded transition-colors text-sm"
              title="Create new track"
            >
              + New
            </button>
          </div>
        </div>

        {/* Melody Prompt */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Melody Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the melody you want to generate..."
            className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-earth-purple-500 focus:outline-none text-sm h-20 resize-none"
            disabled={aiGenerating}
          />
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Quick Ideas</label>
          <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
            {promptSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors border border-gray-700"
                disabled={aiGenerating}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Constraints */}
        <details className="space-y-2">
          <summary className="text-sm text-gray-300 cursor-pointer select-none">
            Advanced Options
          </summary>
          
          <div className="pl-4 space-y-3 mt-2">
            {/* Length */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Length: {length} beats
              </label>
              <input
                type="range"
                min="4"
                max="32"
                step="4"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>4 beats</span>
                <span>32 beats</span>
              </div>
            </div>

            {/* Rhythmic Density */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Rhythmic Density</label>
              <select
                value={rhythmicDensity}
                onChange={(e) => setRhythmicDensity(e.target.value as any)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-earth-purple-500 focus:outline-none text-sm"
              >
                <option value="sparse">Sparse (few notes)</option>
                <option value="moderate">Moderate</option>
                <option value="dense">Dense (many notes)</option>
              </select>
            </div>

            {/* Note Range */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Note Range: {noteRangeMin} - {noteRangeMax}
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="range"
                    min="21"
                    max="108"
                    value={noteRangeMin}
                    onChange={(e) => setNoteRangeMin(Math.min(parseInt(e.target.value), noteRangeMax - 12))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">Min: {noteRangeMin}</div>
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="21"
                    max="108"
                    value={noteRangeMax}
                    onChange={(e) => setNoteRangeMax(Math.max(parseInt(e.target.value), noteRangeMin + 12))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">Max: {noteRangeMax}</div>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Generate Button */}
        <button
          onClick={handleGenerateMelody}
          disabled={aiGenerating || !prompt.trim() || !selectedTrackId}
          className="w-full bg-earth-purple-600 hover:bg-earth-purple-500 disabled:bg-gray-600 text-white py-3 rounded transition-colors font-medium"
        >
          {aiGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Melody...
            </span>
          ) : (
            'Generate Melody'
          )}
        </button>

        {/* Tips */}
        {!aiGenerating && (
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p>💡 Tips for better results:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Be specific about mood and style</li>
              <li>Mention the musical context (verse, chorus, etc.)</li>
              <li>Use descriptive words (bright, dark, bouncy, smooth)</li>
              <li>Reference genres if helpful (jazz, pop, classical)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}