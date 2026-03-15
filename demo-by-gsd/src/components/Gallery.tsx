import { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';
import type { Style } from '../types/style';

interface GalleryProps {
  styles: Style[];
}

export default function Gallery({ styles }: GalleryProps) {
  const [selectedId, setSelectedId] = useState(styles[0]?.id || '');
  const [currentStyle, setCurrentStyle] = useState<Style | null>(styles[0] || null);

  const handleStyleSelect = (styleId: string) => {
    setSelectedId(styleId);
    const selected = styles.find(s => s.id === styleId);
    if (selected) {
      setCurrentStyle(selected);
      // Inject CSS variables
      const root = document.documentElement;
      Object.entries(selected.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  };

  const handleCopyPrompt = async () => {
    if (!currentStyle) return;
    try {
      await navigator.clipboard.writeText(currentStyle.promptText);
      alert('Prompt copied!');
    } catch {
      console.error('Copy failed');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Frontend Design Gallery</h1>
        <p className="text-[var(--color-text-muted)] mt-1">快速预览和选择 UI 风格</p>
      </header>

      {/* Main Content - 70/30 split */}
      <main className="grid grid-cols-1 lg:grid-cols-10 min-h-[calc(100vh-5rem)]">
        {/* Left: Preview (70%) */}
        <section className="lg:col-span-7 flex flex-col border-r border-[var(--color-border)]">
          <div className="flex-1 flex items-center justify-center">
            <PomodoroTimer />
          </div>
          {/* Style Info Footer */}
          {currentStyle && (
            <div className="p-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--color-text)]">{currentStyle.name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{currentStyle.description}</p>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
                >
                  Copy Prompt
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right: Style List (30%) */}
        <section className="lg:col-span-3 overflow-y-auto">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`w-full p-4 text-left border-b border-[var(--color-border)] transition-all ${
                selectedId === style.id
                  ? 'bg-[var(--color-primary-dim)] border-l-4 border-l-[var(--color-primary)]'
                  : 'hover:bg-[var(--color-bg-elevated)]'
              }`}
            >
              <h3 className="font-bold text-[var(--color-text)]">{style.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{style.description}</p>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}
