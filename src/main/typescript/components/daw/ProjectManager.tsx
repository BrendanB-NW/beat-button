import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Plus, FolderOpen, Save, Download, Upload, X } from 'lucide-react';
import { useDAWStore } from '@/stores/dawStore';
import { projectManager } from '@/services/projectManager';
import { ProjectSummary } from '@/types/project';
import { Tooltip } from '../common/Tooltip';

export function ProjectManager() {
  const {
    currentProject,
    createNewProject,
    loadProject,
    saveCurrentProject
  } = useDAWStore();
  
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showLoadProjectDialog, setShowLoadProjectDialog] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState({ tonic: 'C', mode: 'major' });
  const [newProjectTempo, setNewProjectTempo] = useState(120);

  useEffect(() => {
    loadProjectList();
  }, []);

  const loadProjectList = async () => {
    try {
      const projectList = await projectManager.listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleNewProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await createNewProject(newProjectName, newProjectKey, newProjectTempo);
      setShowNewProjectDialog(false);
      setNewProjectName('');
      setNewProjectTempo(120);
      setNewProjectKey({ tonic: 'C', mode: 'major' });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleLoadProject = async (id: string) => {
    try {
      await loadProject(id);
      setShowLoadProjectDialog(false);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleSave = async () => {
    if (currentProject) {
      try {
        await saveCurrentProject();
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    }
  };

  const handleExport = async () => {
    if (!currentProject) return;
    
    try {
      // Export as JSON (the ProjectManager only supports JSON export)
      const projectData = JSON.stringify(currentProject, null, 2);
      const blob = new Blob([projectData], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
      alert('Failed to export project. Please try again.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    projectManager.importProject(file)
      .then(() => loadProjectList())
      .catch(error => console.error('Failed to import project:', error));
  };

  const tonics = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const modes = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];

  const keyDescriptions: Record<string, string> = {
    'C': 'C - Pure and bright, no sharps or flats. Great for beginners and pop music.',
    'C#': 'C# - Warm and rich sound. Often used in jazz and contemporary music.',
    'D': 'D - Bright and energetic. Popular for uplifting songs and folk music.',
    'D#': 'D# - Deep and mysterious. Common in blues and rock music.',
    'E': 'E - Vibrant and guitar-friendly. Perfect for rock, pop, and country.',
    'F': 'F - Gentle and warm. Often used for ballads and classical pieces.',
    'F#': 'F# - Bright and sparkling. Popular in electronic and modern music.',
    'G': 'G - Cheerful and open. Great for folk, country, and happy songs.',
    'G#': 'G# - Dramatic and intense. Often used in dramatic or emotional pieces.',
    'A': 'A - Natural and resonant. Perfect for acoustic music and sing-alongs.',
    'A#': 'A# - Rich and full. Common in jazz, blues, and sophisticated music.',
    'B': 'B - Bright and triumphant. Often used for celebration and victory themes.'
  };

  const modeDescriptions: Record<string, string> = {
    'major': 'Major - Happy, bright, and uplifting. Perfect for pop, rock, and cheerful melodies.',
    'minor': 'Minor - Sad, emotional, and dramatic. Great for ballads and introspective music.',
    'dorian': 'Dorian - Slightly melancholy but hopeful. Used in folk, jazz, and progressive music.',
    'phrygian': 'Phrygian - Dark and exotic. Common in flamenco, metal, and Middle Eastern music.',
    'lydian': 'Lydian - Dreamy and ethereal. Perfect for film scores and ambient music.',
    'mixolydian': 'Mixolydian - Bluesy and rock-oriented. Great for blues, rock, and country music.',
    'aeolian': 'Aeolian - Natural minor scale. Melancholic and introspective, used in classical and folk.',
    'locrian': 'Locrian - Unstable and mysterious. Rarely used, creates tension and unease.'
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowNewProjectDialog(true)}
          className="transport-button"
          title="New Project"
        >
          <Plus size={16} />
        </button>
        
        <button
          onClick={() => setShowLoadProjectDialog(true)}
          className="transport-button"
          title="Load Project"
        >
          <FolderOpen size={16} />
        </button>
        
        {currentProject && (
          <>
            <button
              onClick={handleSave}
              className="transport-button"
              title="Save Project"
            >
              <Save size={16} />
            </button>
            
            <button
              onClick={handleExport}
              className="transport-button"
              title="Export Project"
            >
              <Download size={16} />
            </button>
          </>
        )}
        
        <label className="transport-button cursor-pointer" title="Import Project">
          <Upload size={16} />
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* New Project Dialog */}
      <Dialog
        open={showNewProjectDialog}
        onClose={() => setShowNewProjectDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">New Project</Dialog.Title>
              <button
                onClick={() => setShowNewProjectDialog(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="My Awesome Beat"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="project-key" className="block text-sm font-medium">
                      Key
                    </label>
                    <Tooltip 
                      content={keyDescriptions[newProjectKey.tonic]}
                      position="top"
                    />
                  </div>
                  <select
                    id="project-key"
                    value={newProjectKey.tonic}
                    onChange={(e) => setNewProjectKey(prev => ({ ...prev, tonic: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {tonics.map(tonic => (
                      <option key={tonic} value={tonic}>{tonic}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="project-mode" className="block text-sm font-medium">
                      Mode
                    </label>
                    <Tooltip 
                      content={modeDescriptions[newProjectKey.mode]}
                      position="top"
                    />
                  </div>
                  <select
                    id="project-mode"
                    value={newProjectKey.mode}
                    onChange={(e) => setNewProjectKey(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {modes.map(mode => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="project-tempo" className="block text-sm font-medium mb-1">
                  Tempo (BPM)
                </label>
                <input
                  id="project-tempo"
                  type="number"
                  min="60"
                  max="200"
                  value={newProjectTempo}
                  onChange={(e) => setNewProjectTempo(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewProjectDialog(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-md font-medium"
                disabled={!newProjectName.trim()}
              >
                Create
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Load Project Dialog */}
      <Dialog
        open={showLoadProjectDialog}
        onClose={() => setShowLoadProjectDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">Load Project</Dialog.Title>
              <button
                onClick={() => setShowLoadProjectDialog(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No projects found. Create your first project!
                </div>
              ) : (
                <div className="grid gap-3">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleLoadProject(project.id)}
                      className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {project.key} • {project.tempo} BPM • {project.trackCount} tracks
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Modified {new Date(project.modifiedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}