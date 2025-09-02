import { Project, ExportFormat } from './music';

export interface ProjectSummary {
  id: string;
  name: string;
  tempo: number;
  key: string;
  trackCount: number;
  duration: number; // in beats
  createdAt: Date;
  modifiedAt: Date;
}

export interface ProjectManager {
  saveProject(project: Project): Promise<void>;
  loadProject(id: string): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<ProjectSummary[]>;
  exportProject(project: Project, format: ExportFormat): Promise<Blob>;
  importProject(file: File): Promise<Project>;
  autoSave(project: Project): Promise<void>;
}

export interface ProjectAction {
  id: string;
  type: ActionType;
  timestamp: Date;
  data: unknown;
  description: string;
}

export type ActionType = 
  | 'ADD_NOTE'
  | 'DELETE_NOTE'
  | 'MOVE_NOTE'
  | 'EDIT_NOTE'
  | 'ADD_TRACK'
  | 'DELETE_TRACK'
  | 'EDIT_TRACK'
  | 'CHANGE_TEMPO'
  | 'CHANGE_KEY'
  | 'CHANGE_TIME_SIGNATURE';

export interface UndoRedoState {
  history: ProjectAction[];
  currentIndex: number;
  maxHistorySize: number;
}

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  maxVersions: number;
}