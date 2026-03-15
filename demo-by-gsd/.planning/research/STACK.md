# Stack Research

**Domain:** Static Site Gallery with Live UI Component Previews
**Researched:** 2026-03-15
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro** | 5.x | Static Site Generator | Ships 90% less JS, built for content-driven sites, Islands architecture for interactive components, native GitHub Pages support via official action |
| **React** | 19.x | Interactive Components | User's existing skill uses React, excellent for interactive widgets (Pomodoro timer), mature ecosystem |
| **TypeScript** | 5.x | Type Safety | Industry standard, catches errors at compile time, excellent IDE support |
| **Vite** | 6.x (via Astro) | Build Tool | Already bundled with Astro, instant HMR, optimized production builds |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@astrojs/react** | 4.x | React integration for Astro | Required - enables React components in Astro with client directives |
| **Tailwind CSS** | 4.x | Utility-first CSS | Required - rapid styling, matches user's design preferences (Terminal Noir, etc.) |
| **@astrojs/tailwind** | 3.x | Tailwind integration | Required - seamless Tailwind setup in Astro |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** | Package Manager | Faster than npm, efficient disk usage, Astro docs recommend it |
| **withastro/action** | GitHub Actions deployment | Official Astro GitHub Pages action, zero-config deployment |

## Installation

```bash
# Create new Astro project with React and Tailwind
pnpm create astro@latest frontend-design-gallery --template minimal
cd frontend-design-gallery

# Add integrations
pnpm astro add react tailwind

# Dev dependencies (included with Astro)
# - Vite 6.x
# - TypeScript 5.x
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Astro** | Next.js | When you need SSR, API routes, or heavy dynamic functionality |
| **Astro** | Vite + React SPA | When SEO doesn't matter and you want pure SPA simplicity |
| **Astro** | Storybook | When building a component library for npm distribution, not a public showcase |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Next.js** | Overkill for static showcase, ships more JS, slower builds for static sites | Astro |
| **Create React App** | Deprecated, no longer recommended by React team | Vite (via Astro) |
| **Webpack** | Slower than Vite, more complex configuration | Vite (via Astro) |
| **Gatsby** | GraphQL complexity, slower builds, heavier than Astro for simple sites | Astro |
| **Storybook** | Too heavy, designed for component development not public galleries | Custom Astro pages |

## Stack Patterns by Variant

**For this project (Frontend Design Gallery):**
- Use **Astro** with React islands
- Static build for GitHub Pages
- `client:load` directive for interactive preview components
- Because: Minimal JS, fast loads, perfect for showcase/gallery sites

**If you needed real-time code editing:**
- Use Astro + Monaco Editor (client:only)
- Because: Code editor requires client-side only rendering

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Astro 5.x | Vite 6.x, Node 20.19+/22.12+ | Built-in, no configuration needed |
| @astrojs/react 4.x | React 18.x/19.x | Supports React 19 |
| Tailwind 4.x | Astro 5.x | Via @astrojs/tailwind 3.x |

## Deployment Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: withastro/action@v5
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

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/frontend-design-gallery',
  integrations: [react(), tailwind()]
})
```

## Sources

- [Astro Official Docs - GitHub Pages Deployment](https://docs.astro.build/en/guides/deploy/github/) - HIGH confidence
- [Astro 5 Year in Review 2025](https://astro.build/blog/year-in-review-2025/) - HIGH confidence
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) - HIGH confidence
- [Jamstack.org SSG Comparison](https://jamstack.org/generators/) - HIGH confidence
- [Astro vs Next.js Performance Comparison 2025](https://eastondev.com) - MEDIUM confidence
- [Ladle - Storybook Alternative](https://ladle.dev/docs/) - MEDIUM confidence

---
*Stack research for: Frontend Design Gallery*
*Researched: 2026-03-15*
