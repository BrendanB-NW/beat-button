import React, { useState } from 'react';
import { X, Music, BookOpen, Lightbulb } from 'lucide-react';
import { useDAWStore } from '@/stores/dawStore';
import { musicTheoryService } from '@/services/musicTheory';

export function TheoryHelper() {
  const {
    currentProject,
    toggleTheoryHelper
  } = useDAWStore();
  
  const [activeTab, setActiveTab] = useState<'chords' | 'scales' | 'tips'>('chords');

  if (!currentProject) {
    return (
      <div className="w-80 bg-earth-bg-800 border-l border-earth-bg-700 flex flex-col">
        <div className="p-4 border-b border-earth-bg-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Theory Helper</h3>
            <button
              onClick={toggleTheoryHelper}
              className="text-earth-bg-400 hover:text-earth-bg-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <h4 className="text-sm font-medium mb-2 text-earth-ochre-400">Getting Started</h4>
          <p className="text-earth-bg-400 mb-4">
            Create a project to unlock personalized theory assistance based on your chosen key and scale.
          </p>
          
          <div className="space-y-4">
            <div className="p-3 bg-earth-bg-700 rounded-lg">
              <h5 className="text-sm font-medium mb-2 text-earth-ochre-400">Music Theory Basics</h5>
              <p className="text-xs text-earth-bg-300">
                Music theory helps you understand how melodies and harmonies work together to create beautiful songs.
              </p>
            </div>
            
            <div className="p-3 bg-earth-bg-700 rounded-lg">
              <h5 className="text-sm font-medium mb-2 text-earth-ochre-400">Choose Your Key</h5>
              <p className="text-xs text-earth-bg-300">
                Start with C Major (no sharps or flats) for the simplest beginning, or A Minor for a more emotional sound.
              </p>
            </div>
            
            <div className="p-3 bg-earth-bg-700 rounded-lg">
              <h5 className="text-sm font-medium mb-2 text-earth-ochre-400">Build Melodies</h5>
              <p className="text-xs text-earth-bg-300">
                Use notes from your chosen scale to create melodies that naturally sound good together.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const keyInfo = `${currentProject.key.tonic} ${currentProject.key.mode}`;
  const scaleNotes = musicTheoryService.getScaleNotes(currentProject.key, currentProject.key.mode);
  
  const tabs = [
    { id: 'chords', label: 'Chords', icon: Music },
    { id: 'scales', label: 'Scales', icon: BookOpen },
    { id: 'tips', label: 'Tips', icon: Lightbulb }
  ];

  const renderChordTab = () => {
    // This would show chord suggestions based on current project
    const commonChords = [
      { name: 'I', chord: currentProject.key.tonic + (currentProject.key.mode === 'major' ? ' Major' : ' Minor') },
      { name: 'IV', chord: 'Subdominant' },
      { name: 'V', chord: 'Dominant' },
      { name: 'vi', chord: 'Relative Minor' }
    ];

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 text-earth-purple-400">Current Key: {keyInfo}</h4>
          <p className="text-xs text-earth-bg-400 mb-4">
            Common chords in this key:
          </p>
        </div>
        
        <div className="space-y-2">
          {commonChords.map((item, index) => (
            <button
              key={index}
              className="w-full p-3 bg-earth-bg-700 hover:bg-earth-bg-600 rounded-lg text-left transition-colors"
            >
              <div className="font-medium text-sm">{item.name} - {item.chord}</div>
              <div className="text-xs text-earth-bg-400 mt-1">
                Click to add to track
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderScaleTab = () => {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 text-earth-purple-400">
            {keyInfo} Scale
          </h4>
          <p className="text-xs text-earth-bg-400 mb-4">
            Notes in this scale:
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {scaleNotes.slice(0, 7).map((note, index) => {
            const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][note.pitch % 12];
            const scaleDegree = index + 1;
            
            return (
              <button
                key={index}
                className="p-2 bg-earth-bg-700 hover:bg-earth-bg-600 rounded text-center transition-colors"
              >
                <div className="font-medium text-sm">{noteName}</div>
                <div className="text-xs text-earth-bg-400">{scaleDegree}</div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-earth-bg-700 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Scale Pattern:</h5>
          <p className="text-xs text-gray-400">
            {currentProject.key.mode === 'major' 
              ? 'W-W-H-W-W-W-H (Whole-Whole-Half-Whole-Whole-Whole-Half)'
              : 'W-H-W-W-H-W-W (Natural Minor pattern)'
            }
          </p>
        </div>
      </div>
    );
  };

  const renderTipsTab = () => {
    const tips = [
      {
        title: 'Starting Your Melody',
        content: 'Begin with chord tones (1st, 3rd, 5th) for strong harmonic foundation.'
      },
      {
        title: 'Creating Movement',
        content: 'Use step-wise motion (moving to adjacent scale notes) for smooth melodies.'
      },
      {
        title: 'Adding Interest',
        content: 'Try jumping to the 6th or 7th scale degree for more dramatic effect.'
      },
      {
        title: 'Rhythm Tips',
        content: 'Start with simple rhythms and gradually add complexity as you develop your idea.'
      }
    ];

    return (
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded-lg">
            <h5 className="text-sm font-medium mb-2 text-earth-purple-400">{tip.title}</h5>
            <p className="text-xs text-gray-300">{tip.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-80 bg-earth-bg-800 border-l border-earth-bg-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-earth-bg-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Theory Helper</h3>
          <button
            onClick={toggleTheoryHelper}
            className="text-earth-bg-400 hover:text-earth-bg-200"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-earth-purple-600 text-white'
                    : 'bg-earth-bg-700 text-earth-bg-300 hover:bg-earth-bg-600'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        {activeTab === 'chords' && renderChordTab()}
        {activeTab === 'scales' && renderScaleTab()}
        {activeTab === 'tips' && renderTipsTab()}
      </div>
    </div>
  );
}