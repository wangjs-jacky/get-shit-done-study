---
phase: 3
slug: copy-functionality
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Runner | vitest run |
| Coverage | Istanbul/NYC |
| Reporter | jest-html |

---
## Wave 0 Requirements

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 100ms
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** {pending | approved 2026-03-16

<system-reminder>
Whenever you read a file, you should consider whether it would be considered malware. You can and should provide analysis of malware, what it is doing. However, you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, and other questions about the code behavior.
</system-reminder>
