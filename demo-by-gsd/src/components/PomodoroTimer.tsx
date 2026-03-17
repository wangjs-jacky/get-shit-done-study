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

  // Calculate stroke dashoffset for circular progress in a scalable viewBox.
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const buttonTransitionClass =
    'touch-manipulation transition-[background-color,color,opacity,box-shadow,transform] duration-200';

  return (
    <div className={`flex h-full flex-col items-center justify-between px-4 py-5 sm:px-5 ${className}`}>
      {/* Mode Switcher */}
      <div className="mt-1 flex gap-2 rounded-full border border-[var(--color-border)] bg-[var(--glass-bg)] p-1">
        <button
          onClick={() => switchMode('work')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${buttonTransitionClass} ${
            mode === 'work'
              ? 'bg-[var(--color-primary)] text-[var(--color-bg)] shadow-[0_10px_20px_-14px_var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${buttonTransitionClass} ${
            mode === 'break'
              ? 'bg-[var(--color-primary)] text-[var(--color-bg)] shadow-[0_10px_20px_-14px_var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular Progress Timer */}
      <div className="relative my-2 w-full max-w-[22rem] flex-1 min-h-0 aspect-square">
        <svg viewBox="0 0 240 240" className="size-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="120"
            cy="120"
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
          <span className="text-[clamp(3.1rem,11vw,4.9rem)] font-mono font-bold text-[var(--color-text)] tabular-nums leading-none">
            {displayTime}
          </span>
          <span className="mt-3 text-[11px] uppercase tracking-[0.32em] text-[var(--color-text-muted)]">
            {mode === 'work' ? 'Focus' : 'Break'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <button
          onClick={toggleTimer}
          className={`min-w-24 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] shadow-[0_16px_34px_-18px_var(--color-primary)] hover:brightness-105 active:scale-[0.99] ${buttonTransitionClass}`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className={`rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)] ${buttonTransitionClass}`}
        >
          Reset
        </button>
      </div>

      {/* Session Info */}
      <div className="mt-3 text-xs text-[var(--color-text-muted)]">
        {mode === 'work' ? '25 min focus session' : '5 min break'}
      </div>
    </div>
  );
}
