---
phase: 01
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Vite native) |
| **Config file** | vitest.config.ts (Wave 0 creates) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | LAYT-03 | unit | `pnpm test layout.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | DATA-01 | unit | `pnpm test styles.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | DATA-02 | unit | `pnpm test styles.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | DATA-03 | unit | `pnpm test styles.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | STYL-01 | unit | `pnpm test StyleList.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | STYL-02 | unit | `pnpm test StyleCard.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | LAYT-01 | visual | N/A (manual) | N/A | ⬜ pending |
| 01-03-04 | 03 | 2 | LAYT-02 | visual | N/A (manual) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration
- [ ] `src/data/styles.test.ts` — Tests for style data structure
- [ ] `src/components/__tests__/StyleCard.test.ts` — StyleCard component tests
- [ ] `src/components/__tests__/StyleList.test.ts` — StyleList component tests
- [ ] Framework install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Left-right split layout | LAYT-01 | Visual layout verification | Open site, verify left preview + right list |
| Responsive design | LAYT-02 | Visual + interaction | Resize browser, verify mobile stacked layout |
| Selected style highlight | STYL-03 | Visual state | Click style, verify visual feedback |
| Style list scrollable | STYL-04 | Visual + interaction | Scroll list, verify smooth scrolling |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
