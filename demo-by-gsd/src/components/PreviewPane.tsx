import { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';
import CopyButton from './CopyButton';
import PhoneFrame from './PhoneFrame';
import type { Style } from '../types/style';

interface PreviewPaneProps {
  styles: Style[];
  selectedStyleId: string;
  onStyleSelect: (styleId: string) => void;
  className?: string;
}

export default function PreviewPane({
  styles,
  selectedStyleId,
  onStyleSelect,
  className = ''
}: PreviewPaneProps) {
  const [currentStyle, setCurrentStyle] = useState<Style | null>(null);

  // Find and apply selected style
  useEffect(() => {
    const selected = styles.find(s => s.id === selectedStyleId);
    if (selected) {
      setCurrentStyle(selected);
      // Inject CSS variables into :root
      const root = document.documentElement;
      Object.entries(selected.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [selectedStyleId, styles]);

  if (!currentStyle) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-[var(--color-text-muted)]">Loading style...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-red)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-amber)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-2 uppercase tracking-[0.24em]">
          Mobile Preview
        </p>
      </div>

      {/* Phone Preview */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <PhoneFrame>
          <PomodoroTimer />
        </PhoneFrame>
      </div>

      {/* Style Info Footer */}
      <div className="p-6 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              当前风格
            </p>
            <h3 className="font-bold text-lg text-[var(--color-text)] truncate">
              {currentStyle.name}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-1">
              {currentStyle.description}
            </p>
          </div>
          <CopyButton text={currentStyle.promptText} />
        </div>
      </div>
    </div>
  );
}
