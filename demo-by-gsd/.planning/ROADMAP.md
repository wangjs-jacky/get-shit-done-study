# Roadmap: Frontend Design Gallery

## Overview

Build a static website that showcases UI design styles from the frontend-design skill. Users can preview each style on a functional Pomodoro timer app, then copy the style prompt to use in their own CLAUDE.md files. Deploy to GitHub Pages for free hosting.

## Phases

- [ ] **Phase 1: Project Foundation & Data Extraction** - Set up Astro project and extract style data
- [ ] **Phase 2: Demo App & Live Preview** - Build Pomodoro timer with style variants
- [ ] **Phase 3: Copy Functionality** - Implement clipboard copy with feedback
- [ ] **Phase 4: Deployment** - Set up GitHub Pages with CI/CD

## Phase Details

### Phase 1: Project Foundation & Data Extraction
**Goal**: Initialize Astro project with React and Tailwind, extract all style data from frontend-design skill
**Depends on**: Nothing (first phase)
**Requirements**: LAYT-01, LAYT-02, LAYT-03, STYL-01, STYL-02, STYL-03, STYL-04, DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. User can open the site and see a left-right split layout
  2. User can see a list of available styles on the right side
  3. Each style card shows the style name and description
  4. The page is responsive and works on mobile devices
  5. Style data is loaded from a pre-generated JSON file
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Initialize Astro 5.x project with React 19.x, Tailwind 4.x (Vite plugin), and Vitest
- [x] 01-02-PLAN.md — Extract Terminal Noir style data from CLAUDE.md to JSON with TypeScript types
- [ ] 01-03-PLAN.md — Build Layout, StyleList, StyleCard components with responsive split layout

### Phase 2: Demo App & Live Preview
**Goal**: Build functional Pomodoro timer demo app with style switching capability
**Depends on**: Phase 1
**Requirements**: PREV-01, PREV-02, PREV-03, PREV-04, PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. User can see a working Pomodoro timer in the preview area
  2. User can start, pause, and reset the timer
  3. User can click a style and see the preview update instantly (< 100ms)
  4. All UI elements (buttons, timer display, progress bar) update with the new style
  5. No flash of unstyled content during style switching
**Plans**: 3 plans

Plans:
- [ ] 02-01: Build Pomodoro timer component with all style variants
- [ ] 02-02: Implement PreviewPane island with style switching
- [ ] 02-03: Add CSS variable injection for instant style updates

### Phase 3: Copy Functionality
**Goal**: Enable one-click copy of style prompts with user feedback
**Depends on**: Phase 2
**Requirements**: COPY-01, COPY-02, COPY-03, COPY-04
**Success Criteria** (what must be TRUE):
  1. User can click a "Copy Prompt" button to copy the current style's prompt
  2. User sees a toast notification confirming successful copy
  3. The copied prompt is formatted for CLAUDE.md files
  4. Copy button is clearly visible and accessible
  5. Copy works on all modern browsers (Chrome, Firefox, Safari, Edge)
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement CopyButton component with clipboard API
- [ ] 03-02: Add Toast component for copy feedback

### Phase 4: Deployment
**Goal**: Deploy to GitHub Pages with automatic CI/CD
**Depends on**: Phase 3
**Requirements**: DEPL-01, DEPL-02, DEPL-03
**Success Criteria** (what must be TRUE):
  1. Site is accessible at https://wangjs-jacky.github.io/frontend-design-gallery
  2. Pushing to main branch automatically triggers deployment
  3. Deployment completes without manual intervention
  4. Site loads successfully with all features working
**Plans**: 2 plans

Plans:
- [ ] 04-01: Configure Astro for GitHub Pages deployment
- [ ] 04-02: Set up GitHub Actions workflow for CI/CD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data | 0/3 | Not started | - |
| 2. Demo App & Preview | 0/3 | Not started | - |
| 3. Copy Functionality | 0/2 | Not started | - |
| 4. Deployment | 0/2 | Not started | - |

---
*Roadmap created: 2026-03-15*
*Last updated: 2026-03-15 after plan-phase*
