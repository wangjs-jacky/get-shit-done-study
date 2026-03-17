import { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';
import CopyButton from './CopyButton';
import PhoneFrame from './PhoneFrame';
import { ToastProvider } from '../context/ToastContext';
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

  return (
    <ToastProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 grid min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left: enlarged preview */}
          <section className="lg:col-span-8 flex min-h-0 items-center justify-center border-b border-[var(--color-border)] px-3 py-4 sm:px-5 lg:border-b-0 lg:border-r lg:px-8 lg:py-5">
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <PhoneFrame className="max-h-full">
                <PomodoroTimer />
              </PhoneFrame>
            </div>
          </section>

          {/* Right: title, style summary, and list */}
          <section className="lg:col-span-4 flex min-h-0 flex-col overflow-hidden">
            <div className="flex-shrink-0 border-b border-[var(--color-border)] px-5 py-5 lg:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-balance text-2xl font-bold text-[var(--color-text)]">
                    Frontend Design Gallery
                  </h1>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    预览 UI 风格，把当前设计提示词一键带走。
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--color-primary-dim)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  {styles.length} 种风格
                </span>
              </div>

              {currentStyle && (
                <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--glass-bg)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                    当前风格
                  </p>
                  <h2 className="mt-3 text-[2rem] leading-none font-bold text-[var(--color-text)]">
                    {currentStyle.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {currentStyle.description}
                  </p>
                  <CopyButton className="mt-5 w-full" text={currentStyle.promptText} />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3 lg:px-6">
                <h3 className="font-semibold text-sm text-[var(--color-text)]">选择风格</h3>
                <span className="text-xs text-[var(--color-text-muted)]">按灵感切换</span>
              </div>
              {styles.map((style, index) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className="group w-full cursor-pointer border-b border-[var(--color-border)] p-4 text-left transition-[background-color,border-color,color] duration-200 lg:px-6"
                  style={{
                    background: selectedId === style.id
                      ? 'var(--color-primary-dim)'
                      : 'transparent',
                    borderLeftWidth: selectedId === style.id ? '4px' : '0px',
                    borderLeftColor: 'var(--color-primary)'
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-text-muted)] opacity-60">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h4 className="font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                          {style.name}
                        </h4>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1.5 line-clamp-2">
                        {style.description}
                      </p>
                    </div>
                    {/* Selection indicator */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-2 transition-opacity"
                      style={{
                        background: 'var(--color-primary)',
                        opacity: selectedId === style.id ? 1 : 0
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </ToastProvider>
  );
}
