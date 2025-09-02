import React from 'react';
import { ProjectManager } from './ProjectManager';
import { TrackList } from './TrackList';
import { PianoRoll } from './PianoRoll';
import { Timeline } from './Timeline';
import { AIAssistantPanel } from '../ai/AIAssistantPanel';
import { useDAWStore } from '../../stores/dawStore';

export function DAWInterface() {
  const currentProject = useDAWStore((state) => state.currentProject);
  const selectedTrackId = useDAWStore((state) => state.selectedTrackId);
  const aiAssistantVisible = useDAWStore((state) => state.aiAssistantVisible);
  const toggleAIAssistant = useDAWStore((state) => state.toggleAIAssistant);
  const toggleTheoryHelper = useDAWStore((state) => state.toggleTheoryHelper);
  
  // Get the selected track info
  const selectedTrack = currentProject?.tracks.find(t => t.id === selectedTrackId);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top toolbar - Always show */}
      <div className="bg-earth-bg-800 border-b border-earth-bg-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ProjectManager />
          {currentProject && (
            <div className="text-sm text-earth-bg-200">
              {currentProject.name} • {currentProject.key.tonic} {currentProject.key.mode} • {currentProject.tempo} BPM
              {selectedTrack && (
                <span className="ml-4 text-earth-purple-300">
                  🎹 Editing: {selectedTrack.name} ({selectedTrack.instrument.type})
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheoryHelper}
            className="p-2 rounded bg-earth-purple-600 text-earth-bg-100 hover:bg-earth-purple-500 transition-colors"
            title="Theory Helper"
          >
            ?
          </button>
          <button
            onClick={toggleAIAssistant}
            className={`p-2 rounded transition-colors ${
              aiAssistantVisible 
                ? 'bg-earth-green-600 text-earth-bg-50' 
                : 'bg-earth-ochre-600 text-earth-bg-100 hover:bg-earth-ochre-500'
            }`}
            title="AI Assistant"
          >
            🤖
          </button>
        </div>
      </div>

      {!currentProject ? (
        <div className="flex-1 flex items-center justify-center bg-earth-bg-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-earth-bg-200 mb-4">Welcome to SoundSage</h2>
            <p className="text-earth-bg-300 mb-6">Create a new project or load an existing one to start making music</p>
            <div className="text-sm text-earth-bg-400">
              Use the <span className="font-mono bg-earth-bg-800 px-2 py-1 rounded text-earth-ochre-300">+</span> button above to create a new project
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Left sidebar - Track list */}
          <div className="w-64 bg-earth-bg-800 border-r border-earth-bg-700 flex flex-col">
            <div className="p-3 border-b border-earth-bg-700">
              <h3 className="text-sm font-medium text-earth-bg-200">Tracks</h3>
            </div>
            <TrackList />
          </div>

          {/* Main editor area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Timeline - Above piano roll in project area */}
            <div className="h-20 border-b border-earth-bg-700">
              <Timeline />
            </div>

            {/* Piano roll */}
            <div className="flex-1 min-h-0 relative">
              <PianoRoll />
              
              {/* Track selection overlay */}
              {!selectedTrackId && (
                <div className="absolute inset-0 bg-earth-bg-900 bg-opacity-75 flex items-center justify-center z-10">
                  <div className="text-center text-earth-bg-200">
                    <div className="text-4xl mb-4">🎹</div>
                    <h3 className="text-lg font-medium mb-2 text-earth-purple-300">Select a Track to Edit</h3>
                    <p className="text-sm text-earth-bg-300">Click on a track in the left panel to start adding notes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      <AIAssistantPanel 
        visible={aiAssistantVisible} 
        onClose={toggleAIAssistant} 
      />
    </div>
  );
}