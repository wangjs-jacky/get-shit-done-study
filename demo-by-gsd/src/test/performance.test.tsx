import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Gallery from '../components/Gallery';
import PreviewPane from '../components/PreviewPane';
import PomodoroTimer from '../components/PomodoroTimer';
import type { Style } from '../types/style';

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

// Helper function to measure style switch time
function measureStyleSwitchTime(callback: () => void): number {
  const start = performance.now();
  callback();
  const end = performance.now();
  return end - start;
}

describe('performance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document.documentElement.style, 'setProperty');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Test 1: Style switching completes in < 100ms
  it('PERF-01: style switching completes in < 100ms', () => {
    render(<Gallery styles={mockStyles} />);

    // Clear initial calls
    vi.mocked(document.documentElement.style.setProperty).mockClear();

    const oceanBreezeButton = screen.getByRole('button', { name: /Ocean Breeze/ });

    const switchTime = measureStyleSwitchTime(() => {
      fireEvent.click(oceanBreezeButton);
    });

    // CSS variable injection should be nearly instant
    expect(switchTime).toBeLessThan(100);
    expect(document.documentElement.style.setProperty).toHaveBeenCalled();
  });

  // Test 2: Timer state preserved during style switch
  it('PERF-03: timer state preserved during style switch', () => {
    render(<Gallery styles={mockStyles} />);

    // Start the timer
    const startButton = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(startButton);

    // Advance timer by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Verify timer is running (shows 24:55)
    expect(screen.getByText('24:55')).toBeInTheDocument();

    // Switch style
    const oceanBreezeButton = screen.getByRole('button', { name: /Ocean Breeze/ });
    fireEvent.click(oceanBreezeButton);

    // Timer should still be at 24:55 (not reset)
    expect(screen.getByText('24:55')).toBeInTheDocument();
    // Pause button should still be visible (timer still running)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  // Test 3: No FOUC during style switching
  it('PERF-02: no FOUC during style switching - CSS variables have values', () => {
    const { rerender } = render(
      <PreviewPane
        styles={mockStyles}
        selectedStyleId="terminal-noir"
        onStyleSelect={() => {}}
      />
    );

    // Verify initial CSS variables are set (not empty)
    const setPropertyCalls = vi.mocked(document.documentElement.style.setProperty).mock.calls;
    expect(setPropertyCalls.length).toBeGreaterThan(0);

    // All CSS variable values should be defined
    setPropertyCalls.forEach((call) => {
      const [, value] = call;
      expect(value).toBeDefined();
      expect(value).not.toBe('');
      expect(value).not.toBe('undefined');
    });

    // Clear and switch style
    vi.mocked(document.documentElement.style.setProperty).mockClear();

    rerender(
      <PreviewPane
        styles={mockStyles}
        selectedStyleId="ocean-breeze"
        onStyleSelect={() => {}}
      />
    );

    // Verify new CSS variables are also defined
    const newSetPropertyCalls = vi.mocked(document.documentElement.style.setProperty).mock.calls;
    expect(newSetPropertyCalls.length).toBeGreaterThan(0);

    newSetPropertyCalls.forEach((call) => {
      const [, value] = call;
      expect(value).toBeDefined();
      expect(value).not.toBe('');
      expect(value).not.toBe('undefined');
    });
  });

  // Test 4: Initial page load is fast
  it('initial render completes in < 1000ms', () => {
    const renderStart = performance.now();

    render(<Gallery styles={mockStyles} />);

    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    // Verify key elements rendered
    expect(screen.getByText('Frontend Design Gallery')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    // Render should complete quickly
    expect(renderTime).toBeLessThan(1000);
  });
});
