import { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';
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

  // Copy prompt to clipboard
  const handleCopyPrompt = async () => {
    if (!currentStyle) return;
    try {
      await navigator.clipboard.writeText(currentStyle.promptText);
      // Could add toast notification here
      alert('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
          <button
            onClick={handleCopyPrompt}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--color-bg-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Copy Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
