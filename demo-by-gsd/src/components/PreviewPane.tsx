import { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';
import CopyButton from './CopyButton';
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
      {/* Timer Preview */}
      <div className="flex-1 flex items-center justify-center">
        <PomodoroTimer />
      </div>

      {/* Style Info Footer */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[var(--color-text)]">{currentStyle.name}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{currentStyle.description}</p>
          </div>
          <CopyButton text={currentStyle.promptText} />
        </div>
      </div>
    </div>
  );
}
