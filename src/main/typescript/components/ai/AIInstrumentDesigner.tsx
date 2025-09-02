import React, { useState } from 'react';
import { useDAWStore } from '../../stores/dawStore';

export function AIInstrumentDesigner() {
  const [prompt, setPrompt] = useState('');
  const [characteristics, setCharacteristics] = useState({
    brightness: 0.5,
    warmth: 0.5,
    attack: 0.5,
    sustain: 0.5,
    complexity: 0.5
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const {
    aiGenerating,
    createAIInstrument,
    addTrack
  } = useDAWStore();

  const [promptSuggestions] = useState([
    "Create a warm pad sound",
    "Make a percussive pluck",
    "Design an ethereal choir sound",
    "Create a bright lead synthesizer",
    "Make a deep bass sound",
    "Design a vintage electric piano",
    "Create a shimmering ambient texture",
    "Make a punchy drum sound",
    "Design a smooth jazz organ",
    "Create a metallic industrial sound"
  ]);

  const handleCreateInstrument = async () => {
    if (!prompt.trim()) return;

    const instrumentConfig = await createAIInstrument(prompt, characteristics);
    
    if (instrumentConfig) {
      // Create a new track with the AI-generated instrument
      addTrack('AI Instrument', instrumentConfig.type);
      setPrompt('');
    }
  };

  const handlePreviewInstrument = () => {
    setPreviewPlaying(true);
    // In a real implementation, this would play a preview of the instrument
    setTimeout(() => setPreviewPlaying(false), 2000);
  };

  const resetCharacteristics = () => {
    setCharacteristics({
      brightness: 0.5,
      warmth: 0.5,
      attack: 0.5,
      sustain: 0.5,
      complexity: 0.5
    });
  };

  const getCharacteristicDescription = (key: string, value: number) => {
    const descriptions = {
      brightness: value > 0.7 ? 'Very bright' : value > 0.3 ? 'Balanced' : 'Dark',
      warmth: value > 0.7 ? 'Very warm' : value > 0.3 ? 'Neutral' : 'Cold',
      attack: value > 0.7 ? 'Sharp attack' : value > 0.3 ? 'Medium attack' : 'Soft attack',
      sustain: value > 0.7 ? 'Long sustain' : value > 0.3 ? 'Medium sustain' : 'Short sustain',
      complexity: value > 0.7 ? 'Very complex' : value > 0.3 ? 'Moderate' : 'Simple'
    };
    return descriptions[key as keyof typeof descriptions] || 'Neutral';
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          🎹 Create Instrument
          {aiGenerating && (
            <div className="w-2 h-2 bg-earth-green-500 rounded-full animate-pulse"></div>
          )}
        </h3>

        {/* Instrument Description */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm text-gray-300">Instrument Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the sound you want to create..."
            className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-earth-purple-500 focus:outline-none text-sm h-20 resize-none"
            disabled={aiGenerating}
          />
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-2 mb-4">
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

        {/* Sound Characteristics */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-gray-300">Sound Characteristics</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-earth-ochre-400 hover:text-earth-ochre-300"
              >
                {showAdvanced ? 'Simple' : 'Advanced'}
              </button>
              <button
                onClick={resetCharacteristics}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg space-y-3">
            {Object.entries(characteristics).map(([key, value]) => (
              <div key={key} className={showAdvanced ? '' : (key === 'brightness' || key === 'warmth' ? '' : 'hidden')}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300 capitalize">{key}</span>
                  <span className="text-xs text-gray-400">
                    {getCharacteristicDescription(key, value)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={(e) => setCharacteristics(prev => ({
                    ...prev,
                    [key]: parseFloat(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{key === 'brightness' ? 'Dark' : key === 'warmth' ? 'Cold' : key === 'attack' ? 'Soft' : key === 'sustain' ? 'Short' : 'Simple'}</span>
                  <span>{key === 'brightness' ? 'Bright' : key === 'warmth' ? 'Warm' : key === 'attack' ? 'Sharp' : key === 'sustain' ? 'Long' : 'Complex'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Characteristic Summary */}
        <div className="bg-earth-purple-900 bg-opacity-30 p-3 rounded-lg mb-4">
          <div className="text-sm text-earth-purple-200 mb-1">Generated Sound Profile:</div>
          <div className="text-xs text-gray-300">
            A {getCharacteristicDescription('complexity', characteristics.complexity).toLowerCase()}, {' '}
            {getCharacteristicDescription('brightness', characteristics.brightness).toLowerCase()} sound with {' '}
            {getCharacteristicDescription('warmth', characteristics.warmth).toLowerCase()} tones, {' '}
            {getCharacteristicDescription('attack', characteristics.attack).toLowerCase()} and {' '}
            {getCharacteristicDescription('sustain', characteristics.sustain).toLowerCase()}.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCreateInstrument}
            disabled={aiGenerating || !prompt.trim()}
            className="flex-1 bg-earth-purple-600 hover:bg-earth-purple-500 disabled:bg-gray-600 text-white py-3 rounded transition-colors font-medium"
          >
            {aiGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Instrument...
              </span>
            ) : (
              'Create Instrument'
            )}
          </button>
          
          <button
            onClick={handlePreviewInstrument}
            disabled={aiGenerating || !prompt.trim() || previewPlaying}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-3 rounded transition-colors"
            title="Preview instrument sound"
          >
            {previewPlaying ? '🔊' : '▶️'}
          </button>
        </div>

        {/* File Upload for Reference Audio */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Reference Audio (Optional)</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              id="reference-audio"
              disabled={aiGenerating}
            />
            <label
              htmlFor="reference-audio"
              className="cursor-pointer text-sm text-gray-400 hover:text-gray-300"
            >
              <div className="mb-2">📁</div>
              Drop an audio file here or click to browse
              <div className="text-xs mt-1">AI will analyze and create a similar sound</div>
            </label>
          </div>
        </div>

        {/* Tips */}
        {!aiGenerating && (
          <div className="mt-6 text-xs text-gray-400 space-y-1">
            <p>💡 Tips for better instruments:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use descriptive adjectives (warm, bright, punchy, ethereal)</li>
              <li>Reference real instruments (like a vintage Rhodes, analog Moog)</li>
              <li>Describe the musical context (lead, pad, bass, percussion)</li>
              <li>Mention desired effects (reverb, chorus, distortion)</li>
              <li>Experiment with different characteristic settings</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}