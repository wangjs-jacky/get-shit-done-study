---
phase: 02
slug: demo-app-live-preview
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PREV-01 | unit | `npm test -- --run PomodoroTimer` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | PREV-02 | unit | `npm test -- --run PomodoroTimer` | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | PREV-03 | unit | `npm test -- --run PomodoroTimer` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 1 | PREV-04 | integration | `npm test -- --run Gallery` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 1 | PERF-01 | integration | `npm test -- --run style-switch` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PERF-02 | unit | `npm test -- --run performance` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | PERF-03 | unit | `npm test -- --run performance` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/__tests__/PomodoroTimer.test.tsx` — timer logic tests (if not exists)
- [ ] `src/components/__tests__/Gallery.test.tsx` — style switching tests
- [ ] `src/test/performance.test.ts` — style switching performance tests

*Note: Some tests exist from Phase 1, Wave 0 focuses on adding missing coverage.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual style switching | PREV-04 | Visual verification | Click style cards, verify instant update |
| No FOUC during switch | PERF-03 | Timing/visual check | Rapidly switch styles, observe for flashes |
| Timer state persistence | PREV-02 | State verification | Start timer, switch style, verify time preserved |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
