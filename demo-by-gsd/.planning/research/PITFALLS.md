# Domain Pitfalls

**Domain:** UI Gallery / Design Showcase (Frontend Design Gallery)
**Researched:** 2026-03-15
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: FOUC (Flash of Unstyled Content) During Style Switching

**What goes wrong:**
When switching between styles, users briefly see unstyled or partially styled content before the new theme fully applies. This creates a jarring visual experience and makes the gallery feel unpolished.

**Why it happens:**
CSS loads asynchronously, and style switching without proper synchronization causes the browser to render before all styles are ready. Using JavaScript to apply styles after page render exacerbates this.

**Consequences:**
- Unprofessional appearance
- Users lose confidence in the quality of the design prompts
- Jarring transitions defeat the purpose of a "live preview" gallery

**Prevention:**
- Use CSS custom properties (CSS variables) for theme switching instead of swapping entire stylesheets
- Hide preview content with `visibility: hidden` until styles are fully loaded
- Preload all style definitions before user interaction
- Consider server-side theme detection for initial render

**Detection:**
- Test style switching on slow 3G network throttling
- Watch for brief flashes during rapid style changes
- Monitor LCP (Largest Contentful Paint) metrics during switches

**Phase to address:**
Phase 1 (Core Gallery) — establish proper style loading architecture from the start

---

### Pitfall 2: Runtime CSS-in-JS Performance Overhead

**What goes wrong:**
Using runtime CSS-in-JS libraries (styled-components, emotion) for a theme gallery causes noticeable lag during style switching, especially with many components.

**Why it happens:**
Runtime CSS-in-JS computes styles dynamically during component render, injecting new style rules on every theme change. This is "pure overhead" compared to static CSS or zero-runtime solutions.

**Consequences:**
- Sluggish style switching (300ms+ delays)
- Poor user experience that contradicts "instant preview" promise
- Larger bundle size (7-13KB+ for styling library alone)
- Memory overhead from style cache management

**Prevention:**
- Use CSS custom properties (CSS variables) for theming — significantly faster
- Consider zero-runtime solutions (vanilla-extract, Linaria) if CSS-in-JS DX is needed
- Pre-generate all style code at build time (as stated in PROJECT.md)
- Avoid dynamic style generation entirely

**Detection:**
- Profile style switching with Chrome DevTools Performance tab
- Measure time from click to visual completion
- Check for style recalculation spikes in performance timeline

**Phase to address:**
Phase 1 (Core Gallery) — architectural decision made early

---

### Pitfall 3: Overly Aggressive Toast Notifications

**What goes wrong:**
Every copy action triggers a dismissible toast notification that blocks content, stacks poorly, or lingers too long. Users become annoyed by the constant feedback.

**Why it happens:**
Developers assume "more feedback = better UX" without considering the frequency of the action. Toasts are easy to implement but often overused.

**Consequences:**
- Notification fatigue
- Blocked content during rapid exploration
- Poor mobile experience (toasts take more screen real estate)
- Accessibility issues if not properly announced

**Prevention:**
- Use subtle feedback (checkmark icon, brief highlight) for simple clipboard copy
- If toast is used: keep under 10 words, auto-dismiss after 2-3 seconds
- Stack toasts vertically (newest at top) if multiple can occur
- Ensure screen readers can announce feedback

**Detection:**
- User testing feedback about "annoying popups"
- Multiple toasts visible simultaneously
- Toasts blocking interactive elements

**Phase to address:**
Phase 1 (Core Gallery) — implement correct feedback pattern from start

---

### Pitfall 4: Clipboard Formatting Loss

**What goes wrong:**
Copied prompts lose critical formatting when pasted into CLAUDE.md — indentation breaks, code fences disappear, or special characters get mangled.

**Why it happens:**
Browser clipboard API handles plain text differently than formatted content. HTML-to-Markdown conversion is lossy. Indentation and code blocks are particularly fragile.

**Consequences:**
- Users get broken prompts that don't work in CLAUDE.md
- Wasted time debugging formatting issues
- Loss of trust in the gallery's reliability

**Prevention:**
- Use `navigator.clipboard.writeText()` with pre-formatted Markdown string
- Store prompts as raw Markdown strings, not rendered HTML
- Test copy-paste flow with various target applications
- Include code fences with language specifiers in prompt templates
- Consider providing "copy as raw text" fallback

**Detection:**
- Paste copied content into actual CLAUDE.md file and verify formatting
- Test with different editors (VS Code, Obsidian, plain text)
- Check indentation preservation in nested code blocks

**Phase to address:**
Phase 1 (Core Gallery) — clipboard functionality is core feature

---

### Pitfall 5: Mobile Responsiveness Neglect

**What goes wrong:**
Gallery works on desktop but is unusable on mobile — side-by-side layout becomes cramped, touch targets are too small, or content is hidden.

**Why it happens:**
Developers test primarily on desktop during development. The "left preview + right list" paradigm assumes wide screens. Mobile is treated as afterthought.

**Consequences:**
- Unusable on mobile devices
- Large portion of potential users excluded
- Poor SEO (mobile-first indexing)

**Prevention:**
- Design mobile-first, then enhance for desktop
- Use stacked layout (preview on top, list below) for narrow screens
- Ensure touch targets are at least 44x44px
- Test on actual devices, not just browser resize
- Consider gestures (swipe between styles) for mobile

**Detection:**
- Test on actual phone/tablet during development
- Use Chrome DevTools device emulation as minimum check
- Verify all interactive elements are touch-accessible

**Phase to address:**
Phase 1 (Core Gallery) — responsive design is foundational

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline all styles | Faster initial development | Hard to maintain, no theming capability | Never for a theme gallery |
| Single large CSS file | Simpler build | Large initial load, no caching benefit | Only for <5 styles |
| Skip accessibility | Faster to ship | Legal risk, excludes users, poor SEO | Never |
| No build optimization | Simpler setup | Slow loads, poor UX | Never for production |
| Hardcode style data | Quick prototype | Can't update styles without code change | Only for proof-of-concept |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages | Using root-relative paths that break in subdirectory deployment | Use relative paths or base URL configuration |
| Clipboard API | Assuming API is always available | Feature detection with fallback message |
| GitHub Actions | Using outdated action versions | Pin to specific versions, update regularly |
| Style Data Import | Importing at runtime from external source | Bundle style data at build time for performance |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No code splitting | Slow initial load, unused code loaded | Lazy load style components | >10 styles |
| Large style bundles | Long download time, slow switching | Split styles into separate chunks | >500KB total |
| No image optimization | Slow preview rendering | Optimize preview screenshots, use modern formats | Any images |
| Synchronous style loading | UI freezes during switch | Async loading with loading states | Always |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| XSS in style previews | Malicious code execution if styles contain scripts | Sanitize all style definitions, use CSP |
| Unvalidated external content | Injection attacks | Never load styles from untrusted sources |
| Exposed API keys in client code | Abuse, quota exhaustion | No API keys needed for static gallery |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback during switch | Users click multiple times, confused state | Show loading state, disable during switch |
| Style list too long without search | Users can't find desired style | Add search/filter, categorize styles |
| No preview of style before selecting | Users must click to see, slow exploration | Show thumbnail or color palette preview |
| Copy button not obvious | Users don't realize they can copy | Clear CTA, visible button placement |
| No indication of what was copied | Users unsure if copy worked | Brief highlight or checkmark feedback |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Style Switching:** Often missing smooth transitions — verify with rapid switching tests
- [ ] **Copy Functionality:** Often missing format preservation — verify by pasting into actual CLAUDE.md
- [ ] **Mobile Layout:** Often missing touch-friendly targets — verify on actual devices
- [ ] **Accessibility:** Often missing keyboard navigation — verify Tab/Enter works for all actions
- [ ] **Performance:** Often missing optimization — verify with Lighthouse audit
- [ ] **Error Handling:** Often missing clipboard failure handling — verify on browsers without clipboard API
- [ ] **Loading States:** Often missing during initial load — verify with slow network throttling

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| FOUC issues | LOW | Add CSS loading synchronization, minimal refactor |
| Runtime CSS-in-JS | HIGH | Migrate to CSS variables, requires style architecture rewrite |
| Toast overuse | LOW | Replace with subtler feedback, simple component change |
| Clipboard formatting | MEDIUM | Reformat stored prompts, test with target applications |
| Mobile neglect | HIGH | Redesign layout, may require significant CSS changes |
| No code splitting | MEDIUM | Implement dynamic imports, restructure build |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| FOUC during switching | Phase 1 (Core Gallery) | Test on 3G throttling, no visual glitches |
| Runtime CSS-in-JS overhead | Phase 1 (Core Gallery) | Profile with DevTools, switching <100ms |
| Aggressive toast notifications | Phase 1 (Core Gallery) | User testing, no notification complaints |
| Clipboard formatting loss | Phase 1 (Core Gallery) | Paste into actual CLAUDE.md, verify formatting |
| Mobile responsiveness | Phase 1 (Core Gallery) | Test on actual devices, all interactions work |
| No code splitting | Phase 2 (Enhancement) | Lighthouse audit, bundle <200KB initial |
| Accessibility gaps | Phase 2 (Enhancement) | Keyboard navigation test, screen reader test |

## Sources

- [UI/UX Design Mistakes to Avoid in 2025](https://medium.com/@rodolphe-balay-iterates/ui-ux-design-mistakes-to-avoid-in-2025-834299bd8ffb) — General UI/UX patterns (MEDIUM confidence)
- [10 Common UI Design Mistakes and Best Practices](https://dev.to/jennysmith7/10-common-ui-design-mistakes-and-best-practices-to-avoid-them-2ik7) — General design patterns (MEDIUM confidence)
- [How to deal with FOUC while implementing style switch](https://stackoverflow.com/questions/74392527/how-to-deal-with-fouc-while-implementing-style-switch) — FOUC solutions (HIGH confidence)
- [Building a theme switch component](https://web.dev/articles/building/a-theme-switch-component) — Official web.dev guide (HIGH confidence)
- [The Unseen Performance Costs of CSS-in-JS](https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/) — Performance analysis (HIGH confidence)
- [Why We're Breaking Up with CSS-in-JS](https://dev.to/srmagura/why-were-breaking-up-wiht-css-in-js-4g9b) — Runtime overhead discussion (HIGH confidence)
- [Should I issue a toast when something is copied to clipboard?](https://ux.stackexchange.com/questions/149304/should-i-issue-a-toast-when-something-is-copied-to-clipboard) — UX best practices (HIGH confidence)
- [Toast notifications — how to make it efficient](https://medium.com/design-bootcamp/toast-notifications-how-to-make-it-efficient-400cab6026e9) — Toast timing guidelines (MEDIUM confidence)
- [clipboard2markdown](https://newsletter.pnote.eu/p/better-copy-paste-for-llms) — Clipboard formatting tool (MEDIUM confidence)
- [Storybook bloat? Fixed.](https://storybook.js.org/blog/storybook-bloat-fixed/) — Component gallery optimization (HIGH confidence)
- [Storybook on-demand architecture](https://storybook.js.org/blog/storybook-on-demand-architecture/) — Bundle optimization patterns (HIGH confidence)
- [GitHub Actions CI/CD Best Practices](https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md) — Deployment patterns (HIGH confidence)
- [Responsive Web Design: Breakpoints, Layouts & Real Testing Guide](https://dev.to/prateekshaweb/responsive-web-design-breakpoints-layouts-real-testing-guide-5ee5) — Mobile testing (MEDIUM confidence)
- [5 Responsive Web Design Mistakes and How to Fix Them](https://www.capitalnumbers.com/blog/5-responsive-web-design-mistakes-and-how-to-avoid-them/) — Mobile pitfalls (MEDIUM confidence)
- [The Developer's Guide to Design Tokens and CSS Variables](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/) — Theme architecture (HIGH confidence)
- [Code Splitting Causes Chunks to Fail After New Deployment](https://stackoverflow.com/questions/44601121/code-splitting-causes-chunks-to-fail-to-load-after-new-deployment-for-spa) — SPA deployment issues (HIGH confidence)

---
*Pitfalls research for: Frontend Design Gallery*
*Researched: 2026-03-15*
