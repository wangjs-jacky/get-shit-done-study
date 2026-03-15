# Phase 1: Project Foundation & Data Extraction - Research

**Researched:** 2026-03-15
**Domain:** Astro 5.x + React 19.x + Tailwind 4.x Static Site with Pre-generated Style Data
**Confidence:** HIGH

## Summary

Phase 1 建立项目基础架构：初始化 Astro 5.x 项目，集成 React 19.x 和 Tailwind 4.x（使用 Vite 插件），并从全局 CLAUDE.md 的"前端设计偏好"部分提取风格数据到 JSON 格式。

**Primary recommendation:** 使用 `pnpm create astro@latest` 创建项目，通过 `@tailwindcss/vite` Vite 插件集成 Tailwind 4.x（`@astrojs/tailwind` 已弃用），React 通过 `@astrojs/react` 集成。

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Astro** | 5.x | Static Site Generator | Ships 90% less JS, Islands architecture, native GitHub Pages support |
| **React** | 19.x | Interactive Components | User's existing skill uses React, excellent for interactive widgets |
| **TypeScript** | 5.x | Type Safety | Industry standard, catches errors at compile time |
| **Tailwind CSS** | 4.x | Utility-first CSS | Rapid styling, matches user's design preferences (Terminal Noir, etc.) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@astrojs/react** | 4.x | React integration for Astro | Required - enables React components with client directives |
| **@tailwindcss/vite** | 4.x | Tailwind Vite plugin | Required - preferred method for Tailwind 4.x in Astro 5.2+ |
| **pnpm** | latest | Package Manager | Faster than npm, efficient disk usage, Astro docs recommend it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro | Next.js | When you need SSR, API routes, or heavy dynamic functionality |
| Tailwind 4.x Vite plugin | @astrojs/tailwind | @astrojs/tailwind is DEPRECATED - use Vite plugin instead |
| React 19.x | React 18.x | React 19 has built-in optimizations, less need for useMemo/useCallback |

**Installation:**
```bash
# 1. Create new Astro project
pnpm create astro@latest frontend-design-gallery --template minimal

# 2. Add React integration
pnpm astro add react

# 3. Install Tailwind 4.x with Vite plugin
pnpm add tailwindcss @tailwindcss/vite

# 4. Install React dependencies (if not auto-installed)
pnpm add react react-dom @types/react @types/react-dom
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Layout.astro              # Main layout with left-right split
│   ├── StyleList.astro           # Static list of style options (server)
│   └── StyleCard.astro           # Individual style card (server)
├── data/
│   └── styles.json               # Pre-generated style data (from CLAUDE.md)
├── pages/
│   └── index.astro               # Main page
└── styles/
    └── global.css                # Tailwind import + base styles
```

### Pattern 1: Tailwind 4.x Vite Plugin Configuration

**What:** Tailwind CSS 4.x uses a Vite plugin instead of the deprecated `@astrojs/tailwind` integration.

**When to use:** Astro 5.2+ projects requiring Tailwind CSS.

**Example:**
```javascript
// astro.config.mjs
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/frontend-design-gallery',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Pattern 2: Tailwind CSS Import

**What:** Import Tailwind in a global CSS file.

**Example:**
```css
/* src/styles/global.css */
/* Source: https://docs.astro.build/en/guides/styling/ */
@import "tailwindcss";

/* Add custom CSS variables for theming */
:root {
  --color-bg: #0a0a0b;
  --color-primary: #00ff88;
}
```

### Pattern 3: React Integration with TypeScript

**What:** Configure tsconfig.json for React JSX.

**Example:**
```json
// tsconfig.json
// Source: https://docs.astro.build/en/guides/integrations-guide/react/
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### Anti-Patterns to Avoid

- **Using @astrojs/tailwind**: This integration is DEPRECATED. Use `@tailwindcss/vite` instead.
- **Creating tailwind.config.js for Tailwind 4**: Not required with Vite plugin approach.
- **Forgetting to set `site` and `base` in astro.config.mjs**: Required for GitHub Pages deployment.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS theming system | Custom CSS variables | Tailwind CSS + CSS custom properties | Industry standard, easier maintenance |
| Project scaffolding | Manual setup | `pnpm create astro@latest` | Includes best practices, saves time |
| GitHub Pages deployment | Custom GitHub Action | `withastro/action@v5` | Official, zero-config, automatic |
| Tailwind integration | PostCSS config | `@tailwindcss/vite` | Native Vite plugin, better DX |

**Key insight:** Astro's ecosystem provides official integrations that are better maintained than custom solutions.

## Common Pitfalls

### Pitfall 1: Using Deprecated @astrojs/tailwind
**What goes wrong:** Integration is deprecated and may not receive updates.
**Why it happens:** Old tutorials still reference the legacy integration.
**How to avoid:** Use `@tailwindcss/vite` plugin as documented in official Tailwind docs.
**Warning signs:** Build errors about missing PostCSS config, Tailwind classes not applying.

### Pitfall 2: Missing base Configuration for GitHub Pages
**What goes wrong:** Site loads but assets (CSS, JS) return 404 errors.
**Why it happens:** GitHub Pages serves from subdirectory, not root.
**How to avoid:** Set `base: '/frontend-design-gallery'` in astro.config.mjs.
**Warning signs:** Broken styles, missing images, JS errors in console.

### Pitfall 3: Not Importing Global CSS
**What goes wrong:** Tailwind classes don't work in components.
**Why it happens:** Tailwind CSS file must be imported to be processed.
**How to avoid:** Import global.css in Layout.astro or each page.
**Warning signs:** Utility classes have no effect, unstyled content.

### Pitfall 4: CSS Cascading Order Confusion
**What goes wrong:** Styles don't apply as expected, specificity conflicts.
**Why it happens:** Astro has specific CSS evaluation order.
**How to avoid:** Follow Astro's cascading order: link tags (lowest) < imported styles < scoped styles (highest).
**Warning signs:** Styles appearing/disappearing unexpectedly.

## Code Examples

### Complete astro.config.mjs
```javascript
// Source: https://docs.astro.build/en/guides/deploy/github/ + https://tailwindcss.com/docs/installation/framework-guides/astro
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/frontend-design-gallery',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto'
  }
});
```

### Layout Component Pattern
```astro
---
// src/components/Layout.astro
// Source: https://docs.astro.build/en/basics/layouts/
import "../styles/global.css";

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Style Data JSON Structure
```json
// src/data/styles.json
// Extracted from ~/.claude/CLAUDE.md "前端设计偏好" section
{
  "styles": [
    {
      "id": "terminal-noir",
      "name": "Terminal Noir",
      "description": "深色主题 + 霓虹绿强调色，终端/赛博朋克风格",
      "cssVariables": {
        "--color-bg": "#0a0a0b",
        "--color-bg-elevated": "#131316",
        "--color-text": "#e5e5e7",
        "--color-text-muted": "#6b6b76",
        "--color-border": "rgba(255, 255, 255, 0.06)",
        "--color-primary": "#00ff88",
        "--color-primary-dim": "rgba(0, 255, 136, 0.15)",
        "--color-amber": "#ffb800",
        "--color-red": "#ff4757",
        "--color-blue": "#00d4ff",
        "--glass-bg": "rgba(255, 255, 255, 0.02)",
        "--glass-border": "rgba(255, 255, 255, 0.05)"
      },
      "promptText": "## 前端设计偏好\n\n> **核心理念**：创建独特、有辨识度的界面...\n\n### Terminal Noir 配色方案\n\n```css\n/* 核心颜色 */\n--color-bg: #0a0a0b;\n..."
    }
  ]
}
```

### GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml
# Source: https://docs.astro.build/en/guides/deploy/github/
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v5
      - name: Install, build, and upload your site
        uses: withastro/action@v5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @astrojs/tailwind | @tailwindcss/vite | Tailwind 4.x release | Better DX, native Vite integration |
| tailwind.config.js | CSS-first config | Tailwind 4.x release | Simpler configuration |
| React 18 manual memo | React 19 auto-optimization | React 19 release | Less boilerplate code |

**Deprecated/outdated:**
- **@astrojs/tailwind**: Use `@tailwindcss/vite` instead
- **Create React App**: Use Vite (via Astro) instead

## Open Questions

1. **Style Data Extraction Method**
   - What we know: Styles are defined in `~/.claude/CLAUDE.md` "前端设计偏好" section
   - What's unclear: How many distinct style variants should be extracted (currently only Terminal Noir is explicitly defined)
   - Recommendation: Extract Terminal Noir as the primary style, consider creating additional style variants based on the design guidelines (Glassmorphism, Cyberpunk, etc.)

2. **Additional Style Variants**
   - What we know: The design guidelines mention "Terminal Noir" as a reference, and preferences for "霓虹色彩点缀", "玻璃态效果", etc.
   - What's unclear: Whether to create multiple pre-defined styles or just one
   - Recommendation: Start with 3-5 styles based on the design preferences: Terminal Noir, Glassmorphism, Minimal Light, etc.

## Validation Architecture

> nyquist_validation is enabled in config.json (workflow.nyquist_validation: true)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (Vite native) |
| Config file | vitest.config.ts (to be created) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test --run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYT-01 | Left-right split layout | visual | N/A (manual verification) | N/A |
| LAYT-02 | Responsive design | visual | N/A (manual verification) | N/A |
| LAYT-03 | Page title and description | unit | `pnpm test layout.test.ts` | Wave 0 |
| STYL-01 | List all available styles | unit | `pnpm test styles.test.ts` | Wave 0 |
| STYL-02 | Style card shows name and description | unit | `pnpm test StyleCard.test.ts` | Wave 0 |
| STYL-03 | Selected style visual highlight | visual | N/A (manual verification) | N/A |
| STYL-04 | Style list scrollable | visual | N/A (manual verification) | N/A |
| DATA-01 | Styles extracted from CLAUDE.md | unit | `pnpm test styles.test.ts` | Wave 0 |
| DATA-02 | Style code pre-generated | unit | `pnpm test styles.test.ts` | Wave 0 |
| DATA-03 | Style data has required fields | unit | `pnpm test styles.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test` (quick run)
- **Per wave merge:** `pnpm test --run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` - Vitest configuration
- [ ] `src/data/styles.test.ts` - Tests for style data structure
- [ ] `src/components/__tests__/StyleCard.test.ts` - StyleCard component tests
- [ ] Framework install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom` - if none detected

## Sources

### Primary (HIGH confidence)
- [Astro Docs - React Integration](https://docs.astro.build/en/guides/integrations-guide/react/) - React setup with Astro
- [Astro Docs - Styling](https://docs.astro.build/en/guides/styling/) - Tailwind 4 integration guide
- [Tailwind CSS - Astro Guide](https://tailwindcss.com/docs/installation/framework-guides/astro) - Official Tailwind + Astro setup
- [Astro Docs - GitHub Pages Deployment](https://docs.astro.build/en/guides/deploy/github/) - Official deployment guide

### Secondary (MEDIUM confidence)
- [Astro + Tailwind v4 Setup](https://tailkits.com/blog/astro-tailwind-setup/) - Step-by-step guide

### Tertiary (LOW confidence)
- N/A - All critical information verified with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified with official docs, Tailwind 4 Vite plugin is current best practice
- Architecture: HIGH - Based on official Astro documentation and patterns
- Pitfalls: HIGH - Documented in official docs and community resources

**Research date:** 2026-03-15
**Valid until:** 30 days (stable ecosystem)

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAYT-01 | Left-right split layout - left preview + right style list | Architecture Patterns section provides Layout.astro template with component structure |
| LAYT-02 | Responsive design - mobile stacked layout | Tailwind 4 responsive utilities via `@tailwindcss/vite` plugin |
| LAYT-03 | Page title and description | Layout.astro pattern with Props interface for title |
| STYL-01 | List all available styles on right side | StyleList.astro server component pattern, styles.json data structure |
| STYL-02 | Style card shows name and description | StyleCard.astro server component, styles.json structure with name/description fields |
| STYL-03 | Selected style visual highlight | CSS custom properties pattern, Tailwind utility classes for state |
| STYL-04 | Style list scrollable (horizontal on mobile) | Tailwind overflow utilities, responsive design patterns |
| DATA-01 | Style data extracted from frontend-design skill | Style Data JSON Structure example shows extraction from ~/.claude/CLAUDE.md |
| DATA-02 | All style code pre-generated at build time | Static JSON file in src/data/styles.json, loaded at build time |
| DATA-03 | Style data includes ID, name, description, CSS variables, prompt text | Complete styles.json structure with all required fields |

</phase_requirements>
