import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Gallery from '../Gallery';
import type { Style } from '../../types/style';

// Mock styles data
const mockStyles: Style[] = [
  {
    id: 'terminal-noir',
    name: 'Terminal Noir',
    description: 'Dark theme with neon accents',
    cssVariables: {
      '--color-bg': '#0a0a0b',
      '--color-primary': '#00ff88',
    },
    promptText: 'Terminal Noir theme prompt',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Cool blue theme',
    cssVariables: {
      '--color-bg': '#0a1628',
      '--color-primary': '#00d4ff',
    },
    promptText: 'Ocean Breeze theme prompt',
  },
];

describe('Gallery', () => {
  beforeEach(() => {
    // Spy on document.documentElement.style.setProperty
    vi.spyOn(document.documentElement.style, 'setProperty');
  });

  // Test 1: Renders header with title
  it('renders header with title', () => {
    render(<Gallery styles={mockStyles} />);

    expect(screen.getByText('Frontend Design Gallery')).toBeInTheDocument();
    expect(screen.getByText('快速预览和选择 UI 风格')).toBeInTheDocument();
  });

  // Test 2: Renders 70/30 split layout
  it('renders 70/30 split layout with correct grid classes', () => {
    const { container } = render(<Gallery styles={mockStyles} />);

    // Check for grid layout
    const mainGrid = container.querySelector('.grid-cols-1.lg\\:grid-cols-10');
    expect(mainGrid).toBeInTheDocument();

    // Check for 70% section (7 columns)
    const previewSection = container.querySelector('.lg\\:col-span-7');
    expect(previewSection).toBeInTheDocument();

    // Check for 30% section (3 columns)
    const listSection = container.querySelector('.lg\\:col-span-3');
    expect(listSection).toBeInTheDocument();
  });

  // Test 3: Renders PomodoroTimer in preview area
  it('renders PomodoroTimer in preview area', () => {
    render(<Gallery styles={mockStyles} />);

    // PomodoroTimer displays 25:00 by default
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  // Test 4: Renders style cards list
  it('renders style cards with names and descriptions', () => {
    render(<Gallery styles={mockStyles} />);

    // Terminal Noir appears twice (footer + style list), so use getAllByText
    expect(screen.getAllByText('Terminal Noir').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dark theme with neon accents').length).toBeGreaterThan(0);
    expect(screen.getByText('Ocean Breeze')).toBeInTheDocument();
    expect(screen.getByText('Cool blue theme')).toBeInTheDocument();
  });

  // Test 5: Clicking style card updates selection and applies CSS variables
  it('applies CSS variables when style card is clicked', () => {
    render(<Gallery styles={mockStyles} />);

    // Click on Ocean Breeze style
    const oceanBreezeButton = screen.getByRole('button', { name: /Ocean Breeze/ });
    fireEvent.click(oceanBreezeButton);

    // Verify CSS variables were set
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--color-bg', '#0a1628');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--color-primary', '#00d4ff');
  });

  // Test 6: Copy Prompt button exists in footer
  it('renders Copy Prompt button in footer', () => {
    render(<Gallery styles={mockStyles} />);

    expect(screen.getByRole('button', { name: 'Copy Prompt' })).toBeInTheDocument();
  });
});
