import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectManager } from '../../../../main/typescript/components/daw/ProjectManager';

// Mock the DAW store
const mockCreateNewProject = jest.fn();
const mockLoadProject = jest.fn();
const mockSaveCurrentProject = jest.fn();

jest.mock('../../../../main/typescript/stores/dawStore', () => ({
  useDAWStore: () => ({
    currentProject: null,
    createNewProject: mockCreateNewProject,
    loadProject: mockLoadProject,
    saveCurrentProject: mockSaveCurrentProject
  })
}));

// Mock the project manager service
jest.mock('../../../../main/typescript/services/projectManager', () => ({
  projectManager: {
    listProjects: jest.fn().mockResolvedValue([]),
    importProject: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('ProjectManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Project Creation Validation', () => {
    it('shows error message when trying to create project without name', async () => {
      render(<ProjectManager />);
      
      // Click the New Project button
      const newProjectButton = screen.getByTitle('New Project');
      fireEvent.click(newProjectButton);
      
      // Dialog should be open
      expect(screen.getByText('New Project')).toBeInTheDocument();
      
      // Click Create without entering a name
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });
      
      // Dialog should still be open
      expect(screen.getByText('New Project')).toBeInTheDocument();
      
      // Should not have called createNewProject
      expect(mockCreateNewProject).not.toHaveBeenCalled();
    });

    it('shows error styling on input field when error is present', async () => {
      render(<ProjectManager />);
      
      // Open dialog
      const newProjectButton = screen.getByTitle('New Project');
      fireEvent.click(newProjectButton);
      
      // Try to create without name
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);
      
      // Check that input has error styling
      await waitFor(() => {
        const input = screen.getByPlaceholderText('My Awesome Beat');
        expect(input).toHaveClass('border-red-500');
      });
    });

    it('clears error when user starts typing', async () => {
      render(<ProjectManager />);
      
      // Open dialog and trigger error
      const newProjectButton = screen.getByTitle('New Project');
      fireEvent.click(newProjectButton);
      
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);
      
      // Error should be present
      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });
      
      // Type in the input
      const input = screen.getByPlaceholderText('My Awesome Beat');
      fireEvent.change(input, { target: { value: 'New Project Name' } });
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
      });
    });

    it('creates project successfully when name is provided', async () => {
      mockCreateNewProject.mockResolvedValue(undefined);
      render(<ProjectManager />);
      
      // Open dialog
      const newProjectButton = screen.getByTitle('New Project');
      fireEvent.click(newProjectButton);
      
      // Enter project name
      const input = screen.getByPlaceholderText('My Awesome Beat');
      fireEvent.change(input, { target: { value: 'Test Project' } });
      
      // Click create
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);
      
      // Should call createNewProject
      await waitFor(() => {
        expect(mockCreateNewProject).toHaveBeenCalledWith(
          'Test Project',
          { tonic: 'C', mode: 'major' },
          120
        );
      });
    });

    it('clears error when dialog is reopened', async () => {
      render(<ProjectManager />);
      
      // Open dialog and trigger error
      const newProjectButton = screen.getByTitle('New Project');
      fireEvent.click(newProjectButton);
      
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);
      
      // Error should be present
      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });
      
      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
      
      // Reopen dialog
      fireEvent.click(newProjectButton);
      
      // Error should be cleared
      expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
    });
  });
});