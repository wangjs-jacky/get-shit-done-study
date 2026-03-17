import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '../../context/ToastContext';
import PreviewPane from '../PreviewPane';
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

describe('PreviewPane', () => {
  const mockOnStyleSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on document.documentElement.style.setProperty
    vi.spyOn(document.documentElement.style, 'setProperty');
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  // Test 1: Renders PomodoroTimer component
  it('renders PomodoroTimer component', () => {
    render(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="terminal-noir"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    // PomodoroTimer displays 25:00 by default
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  // Test 2: Displays current style name and description
  it('displays current style name and description', () => {
    render(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="terminal-noir"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Terminal Noir')).toBeInTheDocument();
    expect(screen.getByText('Dark theme with neon accents')).toBeInTheDocument();
  });

  // Test 3: Copy Prompt button triggers clipboard API
  it('copies prompt to clipboard when localized copy button is clicked', async () => {
    render(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="terminal-noir"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    const copyButton = screen.getByRole('button', { name: /复制设计提示词/i });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Terminal Noir theme prompt');
  });

  // Test 4: CSS variables injected when selectedStyleId changes
  it('injects CSS variables when selectedStyleId changes', () => {
    const { rerender } = render(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="terminal-noir"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    // Clear mock calls from initial render
    vi.mocked(document.documentElement.style.setProperty).mockClear();

    // Rerender with new style
    rerender(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="ocean-breeze"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    // Verify new CSS variables were set
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--color-bg', '#0a1628');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--color-primary', '#00d4ff');
  });

  // Test 5: Shows loading state when style not found
  it('shows loading state when style not found', () => {
    render(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="non-existent"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Loading style...')).toBeInTheDocument();
  });

  it('renders the mobile preview inside a phone frame shell', () => {
    const { container } = render(
      <ToastProvider>
        <PreviewPane
          styles={mockStyles}
          selectedStyleId="terminal-noir"
          onStyleSelect={mockOnStyleSelect}
        />
      </ToastProvider>
    );

    const screenContent = container.querySelector('.w-full.aspect-\\[14\\/25\\]');
    expect(screenContent).toBeInTheDocument();
  });
});
