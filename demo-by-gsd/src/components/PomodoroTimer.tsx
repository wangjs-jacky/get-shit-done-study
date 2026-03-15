import { useState, useEffect, useCallback } from 'react';

interface PomodoroTimerProps {
  className?: string;
}

type TimerMode = 'work' | 'break';

const TIMES = {
  work: 25 * 60, // 25 minutes in seconds
  break: 5 * 60, // 5 minutes in seconds
};

export default function PomodoroTimer({ className = '' }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMES.work);
  const [isRunning, setIsRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch mode when timer ends
          const nextMode = mode === 'work' ? 'break' : 'work';
          setMode(nextMode);
          setIsRunning(false);
          return TIMES[nextMode];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(TIMES[mode]);
  }, [mode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMES[newMode]);
  }, []);

  // Calculate progress (0 to 1)
  const totalTime = TIMES[mode];
  const progress = timeLeft / totalTime;

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate stroke dashoffset for circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Mode Switcher */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => switchMode('work')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            mode === 'work'
              ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            mode === 'break'
              ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular Progress Timer */}
      <div className="relative">
        <svg
          width="280"
          height="280"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold text-[var(--color-text)] tabular-nums">
            {displayTime}
          </span>
          <span className="text-sm text-[var(--color-text-muted)] mt-2 uppercase tracking-wider">
            {mode === 'work' ? 'Focus Time' : 'Break Time'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={toggleTimer}
          className="px-8 py-3 rounded-lg font-medium transition-all duration-200 bg-[var(--color-primary)] text-[var(--color-bg)] hover:opacity-90 active:scale-95"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
        >
          Reset
        </button>
      </div>

      {/* Session Info */}
      <div className="mt-6 text-sm text-[var(--color-text-muted)]">
        {mode === 'work' ? '25 min focus session' : '5 min break'}
      </div>
    </div>
  );
}
