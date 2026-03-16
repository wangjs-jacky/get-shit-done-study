import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PomodoroTimer from '../PomodoroTimer';

describe('PomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Test 1: Renders timer display in MM:SS format (25:00 default)
  it('renders timer display in MM:SS format with 25:00 default', () => {
    render(<PomodoroTimer />);

    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  // Test 2: Start button toggles timer running state
  it('starts timer when Start button is clicked', () => {
    render(<PomodoroTimer />);

    const startButton = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(startButton);

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  // Test 3: Pause button pauses timer
  it('pauses timer when Pause button is clicked', () => {
    render(<PomodoroTimer />);

    // Start the timer
    const startButton = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(startButton);

    // Pause the timer
    const pauseButton = screen.getByRole('button', { name: 'Pause' });
    fireEvent.click(pauseButton);

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  // Test 4: Reset button resets timer to initial time
  it('resets timer to initial time when Reset button is clicked', () => {
    render(<PomodoroTimer />);

    // Start the timer
    const startButton = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(startButton);

    // Advance timer by 5 seconds
    vi.advanceTimersByTime(5000);

    // Reset the timer
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetButton);

    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  // Test 5: Work/Break mode switch updates time display
  it('switches to Break mode with 05:00 time when Break button is clicked', () => {
    render(<PomodoroTimer />);

    // Click Break mode button
    const breakButton = screen.getByRole('button', { name: 'Break' });
    fireEvent.click(breakButton);

    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByText('Break Time')).toBeInTheDocument();
  });

  // Test 6: Circular progress reflects remaining time
  it('renders circular progress ring with correct strokeDashoffset', () => {
    const { container } = render(<PomodoroTimer />);

    // Find the progress circle (second circle element)
    const circles = container.querySelectorAll('circle');
    const progressCircle = circles[1];

    // At 100% progress (25:00 of 25:00), strokeDashoffset should be 0
    // circumference = 2 * PI * 120 = ~754
    expect(progressCircle).toHaveStyle({ strokeDashoffset: '0' });
  });

  // Test 7: Timer counts down when running
  it('counts down when timer is running', () => {
    render(<PomodoroTimer />);

    // Start the timer
    const startButton = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(startButton);

    // Advance timer by 1 second (wrap in act for React state updates)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should show 24:59
    expect(screen.getByText('24:59')).toBeInTheDocument();
  });
});
