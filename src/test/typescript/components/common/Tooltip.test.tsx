import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip } from '../../../../main/typescript/components/common/Tooltip';

describe('Tooltip Component', () => {
  it('renders help icon by default', () => {
    render(<Tooltip content="Test tooltip content" />);
    
    const helpButton = screen.getByRole('button', { name: 'Help' });
    expect(helpButton).toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    render(<Tooltip content="Test tooltip content" />);
    
    const helpButton = screen.getByRole('button', { name: 'Help' });
    fireEvent.mouseEnter(helpButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });
  });

  it('hides tooltip content on mouse leave', async () => {
    render(<Tooltip content="Test tooltip content" />);
    
    const helpButton = screen.getByRole('button', { name: 'Help' });
    fireEvent.mouseEnter(helpButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });
    
    fireEvent.mouseLeave(helpButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
    });
  });

  it('renders custom children instead of help icon', () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Custom Button</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur', async () => {
    render(<Tooltip content="Test tooltip content" />);
    
    const helpButton = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(helpButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });
    
    fireEvent.blur(helpButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
    });
  });

  it('can render without help icon when showIcon is false', () => {
    render(<Tooltip content="Test tooltip content" showIcon={false} />);
    
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
  });
});