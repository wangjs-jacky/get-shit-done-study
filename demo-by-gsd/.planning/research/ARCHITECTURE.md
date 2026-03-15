# Architecture Research

**Domain:** Live Preview UI Gallery with Style Switching
**Researched:** 2026-03-15
**Confidence:** HIGH

## Recommended Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Pages (Static)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Astro 5.x SSG                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │   Layout     │  │   Styles     │  │   Preview    │   │ │
│  │  │  Component   │  │   Registry   │  │   Island     │   │ │
│  │  │  (Server)    │  │   (Static)   │  │  (Client)    │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── components/
│   ├── Layout.astro              # Main layout with left-right split
│   ├── PreviewPane.tsx           # React island - live preview container
│   ├── StyleList.astro           # Static list of style options
│   ├── StyleCard.astro           # Individual style card
│   ├── CopyButton.tsx            # React island - copy to clipboard
│   ├── Toast.tsx                 # React island - copy feedback
│   └── DemoApps/
│       ├── PomodoroTimer.tsx     # Demo app with style variants
│       └── styles/
│           ├── terminal-noir.tsx
│           ├── glassmorphism.tsx
│           └── ...
├── data/
│   └── styles.json               # Pre-generated style data
├── pages/
│   └── index.astro               # Main page
└── styles/
    └── global.css                # Base styles
```

## Key Architectural Patterns

### 1. Islands Architecture

Use Astro's Islands for interactive components only:

| Component | Type | Why |
|-----------|------|-----|
| PreviewPane | `client:load` | Must be interactive immediately |
| CopyButton | `client:load` | Click handler needed |
| Toast | `client:only="react"` | Client-side state for show/hide |
| StyleList | Server | Static, no interactivity needed |
| StyleCard | Server | Static until clicked (page navigation) |

### 2. Style Data Flow

```
Build Time:
  frontend-design skill
       ↓
  Extract style definitions
       ↓
  Generate styles.json
       ↓
  Pre-build demo app variants

Runtime:
  User clicks style
       ↓
  State update (currentStyle)
       ↓
  PreviewPane re-renders with selected style
       ↓
  CopyButton has correct prompt ready
```

### 3. State Management

Minimal state needed - use React's useState:

```typescript
// In PreviewPane.tsx
const [currentStyle, setCurrentStyle] = useState<Style>(defaultStyle);

// State shape
interface AppState {
  currentStyle: StyleId;
  copySuccess: boolean;
}
```

No need for Zustand/Redux - state is simple and local.

## Critical Implementation Patterns

### Live Preview Pattern

The preview component must support instant style switching:

```tsx
// PreviewPane.tsx
import { styles } from '../data/styles.json';

export default function PreviewPane({ styleId }: { styleId: string }) {
  const style = styles.find(s => s.id === styleId);

  return (
    <div className="preview-container" style={style.cssVariables}>
      <PomodoroTimer variant={styleId} />
    </div>
  );
}
```

### CSS Variable Injection Pattern

Use CSS custom properties for instant theme switching:

```css
/* Each style defines CSS variables */
:root {
  --color-bg: #0a0a0b;
  --color-primary: #00ff88;
  /* ... */
}

/* Components use these variables */
.button {
  background: var(--color-primary);
  color: var(--color-bg);
}
```

### Copy to Clipboard Pattern

Modern clipboard API with fallback:

```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
```

## Performance Architecture

### Build-Time Optimization

| Optimization | How |
|--------------|-----|
| **Pre-render all pages** | Astro static generation |
| **Inline critical CSS** | Astro automatic |
| **Lazy load non-critical JS** | Islands architecture |
| **Preload fonts** | `<link rel="preload">` in head |

### Runtime Performance

| Concern | Solution |
|---------|----------|
| **Style switching** | CSS variable change only, no re-fetch |
| **Copy feedback** | Client-side state, no network |
| **Preview interaction** | Already loaded, instant response |

### Bundle Size Targets

| Bundle | Target | Notes |
|--------|--------|-------|
| Initial HTML | < 50KB | Static, pre-rendered |
| CSS | < 20KB | Tailwind purged |
| React Island JS | < 30KB | Preview + Copy + Toast |
| Fonts | < 100KB | Subset to used characters |

## Deployment Architecture

### GitHub Pages + Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: withastro/action@v5
        with:
          path: ./

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/deploy-pages@v4
```

### Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/frontend-design-gallery',
  output: 'static',
  integrations: [react(), tailwind()],
  build: {
    inlineStylesheets: 'auto'
  }
});
```

## Alternative Architectures Considered

| Architecture | Pros | Cons | When to Use |
|--------------|------|------|-------------|
| **Pure React SPA** | Simpler mental model | No SEO, larger bundle | When SEO doesn't matter |
| **Next.js SSG** | Mature ecosystem | Overkill for static site | When you need API routes |
| **Vue + Vite** | Fast builds | Different ecosystem | When team knows Vue |
| **Svelte** | Smallest bundles | Less React ecosystem | When bundle size is critical |

## Sources

- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) - Official docs
- [Astro + React Integration](https://docs.astro.build/en/guides/integrations-guide-react/) - Official guide
- [GitHub Pages Deployment for Astro](https://docs.astro.build/en/guides/deploy/github/) - Official guide
- [CSS Custom Properties for Theming](https://web.dev/articles/baseline-in-action-color-theme) - web.dev

---
*Architecture research for: Frontend Design Gallery*
*Researched: 2026-03-15*
