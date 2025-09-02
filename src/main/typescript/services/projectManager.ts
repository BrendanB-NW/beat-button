import { ProjectManager, ProjectSummary, ProjectAction, UndoRedoState, AutoSaveConfig } from '@/types/project';
import { Project, ExportFormat } from '@/types/music';

const STORAGE_PREFIX = 'beat_button_project_';
const METADATA_KEY = 'beat_button_projects_metadata';
const AUTOSAVE_PREFIX = 'beat_button_autosave_';

interface ProjectMetadata {
  projects: ProjectSummary[];
  lastModified: Date;
}

export class LocalProjectManager implements ProjectManager {
  private undoRedoState: UndoRedoState = {
    history: [],
    currentIndex: -1,
    maxHistorySize: 50
  };

  private autoSaveConfig: AutoSaveConfig = {
    enabled: true,
    intervalMs: 30000, // 30 seconds
    maxVersions: 5
  };

  private autoSaveInterval?: NodeJS.Timeout;

  constructor() {
    this.startAutoSave();
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const projectData = {
        ...project,
        modifiedAt: new Date()
      };

      // Save project data
      const projectKey = STORAGE_PREFIX + project.id;
      localStorage.setItem(projectKey, JSON.stringify(projectData));

      // Update metadata
      await this.updateProjectMetadata(projectData);

      console.log(`Project ${project.name} saved successfully`);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadProject(id: string): Promise<Project> {
    try {
      const projectKey = STORAGE_PREFIX + id;
      const projectData = localStorage.getItem(projectKey);

      if (!projectData) {
        throw new Error(`Project with ID ${id} not found`);
      }

      const project = JSON.parse(projectData) as Project;
      
      // Convert date strings back to Date objects
      project.createdAt = new Date(project.createdAt);
      project.modifiedAt = new Date(project.modifiedAt);

      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw new Error(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const projectKey = STORAGE_PREFIX + id;
      
      // Remove project data
      localStorage.removeItem(projectKey);
      
      // Remove autosave versions
      for (let i = 0; i < this.autoSaveConfig.maxVersions; i++) {
        const autosaveKey = `${AUTOSAVE_PREFIX}${id}_${i}`;
        localStorage.removeItem(autosaveKey);
      }

      // Update metadata
      const metadata = await this.getProjectMetadata();
      metadata.projects = metadata.projects.filter(p => p.id !== id);
      localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));

      console.log(`Project ${id} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listProjects(): Promise<ProjectSummary[]> {
    try {
      const metadata = await this.getProjectMetadata();
      return metadata.projects.sort((a, b) => 
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to list projects:', error);
      return [];
    }
  }

  async exportProject(project: Project, format: ExportFormat): Promise<Blob> {
    try {
      if (format === 'wav' || format === 'mp3') {
        throw new Error('Audio export should be handled by AudioEngine service');
      }

      // For now, export as JSON
      const projectData = JSON.stringify(project, null, 2);
      return new Blob([projectData], { type: 'application/json' });
    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error(`Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importProject(file: File): Promise<Project> {
    try {
      const text = await file.text();
      const projectData = JSON.parse(text) as Project;

      // Generate new ID to avoid conflicts
      const newId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const importedProject: Project = {
        ...projectData,
        id: newId,
        name: `${projectData.name} (Imported)`,
        createdAt: new Date(),
        modifiedAt: new Date()
      };

      // Save the imported project
      await this.saveProject(importedProject);
      
      return importedProject;
    } catch (error) {
      console.error('Failed to import project:', error);
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Invalid project file'}`);
    }
  }

  async autoSave(project: Project): Promise<void> {
    if (!this.autoSaveConfig.enabled) return;

    try {
      const autosaveKey = `${AUTOSAVE_PREFIX}${project.id}_${Date.now()}`;
      const projectData = {
        ...project,
        modifiedAt: new Date()
      };

      localStorage.setItem(autosaveKey, JSON.stringify(projectData));

      // Clean up old autosave versions
      await this.cleanupAutosaveVersions(project.id);

      console.log(`Autosave completed for project ${project.name}`);
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }

  // Undo/Redo functionality
  addAction(action: ProjectAction): void {
    // Remove any actions after current index (when we're not at the end)
    if (this.undoRedoState.currentIndex < this.undoRedoState.history.length - 1) {
      this.undoRedoState.history = this.undoRedoState.history.slice(0, this.undoRedoState.currentIndex + 1);
    }

    // Add new action
    this.undoRedoState.history.push(action);
    this.undoRedoState.currentIndex++;

    // Trim history if it exceeds max size
    if (this.undoRedoState.history.length > this.undoRedoState.maxHistorySize) {
      this.undoRedoState.history = this.undoRedoState.history.slice(-this.undoRedoState.maxHistorySize);
      this.undoRedoState.currentIndex = this.undoRedoState.maxHistorySize - 1;
    }
  }

  canUndo(): boolean {
    return this.undoRedoState.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.undoRedoState.currentIndex < this.undoRedoState.history.length - 1;
  }

  getUndoAction(): ProjectAction | null {
    if (!this.canUndo()) return null;
    return this.undoRedoState.history[this.undoRedoState.currentIndex];
  }

  getRedoAction(): ProjectAction | null {
    if (!this.canRedo()) return null;
    return this.undoRedoState.history[this.undoRedoState.currentIndex + 1];
  }

  undo(): ProjectAction | null {
    if (!this.canUndo()) return null;
    const action = this.undoRedoState.history[this.undoRedoState.currentIndex];
    this.undoRedoState.currentIndex--;
    return action;
  }

  redo(): ProjectAction | null {
    if (!this.canRedo()) return null;
    this.undoRedoState.currentIndex++;
    const action = this.undoRedoState.history[this.undoRedoState.currentIndex];
    return action;
  }

  clearHistory(): void {
    this.undoRedoState.history = [];
    this.undoRedoState.currentIndex = -1;
  }

  // Configuration methods
  setAutoSaveConfig(config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
    
    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.startAutoSave();
      } else {
        this.stopAutoSave();
      }
    }
  }

  getAutoSaveConfig(): AutoSaveConfig {
    return { ...this.autoSaveConfig };
  }

  private async getProjectMetadata(): Promise<ProjectMetadata> {
    try {
      const metadataStr = localStorage.getItem(METADATA_KEY);
      if (!metadataStr) {
        return { projects: [], lastModified: new Date() };
      }

      const metadata = JSON.parse(metadataStr) as ProjectMetadata;
      metadata.lastModified = new Date(metadata.lastModified);
      
      // Convert date strings back to Date objects
      metadata.projects.forEach(project => {
        project.createdAt = new Date(project.createdAt);
        project.modifiedAt = new Date(project.modifiedAt);
      });

      return metadata;
    } catch (error) {
      console.error('Failed to get project metadata:', error);
      return { projects: [], lastModified: new Date() };
    }
  }

  private async updateProjectMetadata(project: Project): Promise<void> {
    const metadata = await this.getProjectMetadata();
    
    // Calculate project duration
    let duration = 0;
    for (const track of project.tracks) {
      for (const note of track.notes) {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > duration) {
          duration = noteEnd;
        }
      }
    }

    const summary: ProjectSummary = {
      id: project.id,
      name: project.name,
      tempo: project.tempo,
      key: `${project.key.tonic} ${project.key.mode}`,
      trackCount: project.tracks.length,
      duration,
      createdAt: project.createdAt,
      modifiedAt: project.modifiedAt
    };

    // Update or add project summary
    const existingIndex = metadata.projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      metadata.projects[existingIndex] = summary;
    } else {
      metadata.projects.push(summary);
    }

    metadata.lastModified = new Date();
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }

  private async cleanupAutosaveVersions(projectId: string): Promise<void> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${AUTOSAVE_PREFIX}${projectId}_`)) {
          keys.push(key);
        }
      }

      // Sort by timestamp (newest first)
      keys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0');
        const timestampB = parseInt(b.split('_').pop() || '0');
        return timestampB - timestampA;
      });

      // Remove older versions beyond max limit
      for (let i = this.autoSaveConfig.maxVersions; i < keys.length; i++) {
        localStorage.removeItem(keys[i]);
      }
    } catch (error) {
      console.error('Failed to cleanup autosave versions:', error);
    }
  }

  private startAutoSave(): void {
    this.stopAutoSave(); // Clear existing interval
    
    if (!this.autoSaveConfig.enabled) return;

    this.autoSaveInterval = setInterval(() => {
      // This will be triggered by the main application
      // when there's a current project to autosave
    }, this.autoSaveConfig.intervalMs);
  }

  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = undefined;
    }
  }

  dispose(): void {
    this.stopAutoSave();
  }
}

export const projectManager = new LocalProjectManager();