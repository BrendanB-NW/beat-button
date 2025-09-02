import React from 'react';
import { TransportControls } from './TransportControls';
import { ProjectManager } from './ProjectManager';
import { TrackList } from './TrackList';
import { PianoRoll } from './PianoRoll';
import { Timeline } from './Timeline';
import { useDAWStore } from '../../stores/dawStore';

export function DAWInterface() {
  const currentProject = useDAWStore((state) => state.currentProject);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top toolbar - Always show */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ProjectManager />
          {currentProject && (
            <div className="text-sm text-gray-300">
              {currentProject.name} • {currentProject.key.tonic} {currentProject.key.mode} • {currentProject.tempo} BPM
            </div>
          )}
        </div>
        
        <TransportControls />
      </div>

      {!currentProject ? (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Welcome to B. Boyd's Bangin' Beat Button</h2>
            <p className="text-gray-400 mb-6">Create a new project or load an existing one to start making music</p>
            <div className="text-sm text-gray-500">
              Use the <span className="font-mono bg-gray-800 px-2 py-1 rounded">+</span> button above to create a new project
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Left sidebar - Track list */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300">Tracks</h3>
            </div>
            <TrackList />
          </div>

          {/* Main editor area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Timeline */}
            <div className="h-16 border-b border-gray-700">
              <Timeline />
            </div>

            {/* Piano roll */}
            <div className="flex-1 min-h-0">
              <PianoRoll />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}