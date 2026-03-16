---
phase: 4
slug: 04-deployment
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-16
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | GitHub Actions + Manual E2E |
| **Config file** | `.github/workflows/deploy.yml` (Wave 0 creates) |
| **Quick run command** | `npm run build && npm run preview` |
| **Full suite command** | GitHub Actions workflow auto-runs on push |
| **Estimated runtime** | ~2-3 minutes |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` locally to verify build succeeds
- **After every plan wave:** GitHub Actions automatically runs full workflow
- **Before `/gsd:verify-work`:** Workflow must be green + site accessible
- **Max feedback latency:** ~3 minutes (Actions runtime)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DEPL-01 | integration | GitHub Actions build job | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DEPL-03 | integration | `withastro/action@v5` runs | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | DEPL-02 | integration | `on: push: branches: [main]` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | DEPL-01 | e2e | Visit deployed site | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | DEPL-02 | e2e | Push → auto-deploy | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.github/workflows/deploy.yml` — GitHub Actions workflow file
- [ ] Repository setting: Settings > Pages > Source = "GitHub Actions"
- [ ] First push triggers deployment for verification

*These are created in Plan 04-01*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Site accessible at URL | DEPL-01 | External service verification | Visit https://wangjs-jacky.github.io/frontend-design-gallery |
| Auto-deploy on push | DEPL-02 | Requires external trigger | Make small change, push, verify deployed |
| All features work | DEPL-01 | E2E functional test | Test preview, style switch, copy button |

---

## Acceptance Criteria (Testable)

### DEPL-01: 自动部署到 GitHub Pages
1. 推送代码到 main 分支
2. 等待 Actions 工作流完成（绿色勾）
3. 访问 https://wangjs-jacky.github.io/frontend-design-gallery
4. 确认页面加载成功，无 404 错误

### DEPL-02: 推送到 main 分支时自动触发部署
1. 做一个小改动（如修改标题）
2. 推送到 main 分支
3. 观察 Actions 自动触发
4. 确认新改动已部署

### DEPL-03: 使用 GitHub Actions 进行 CI/CD
1. 检查 `.github/workflows/deploy.yml` 存在
2. 检查工作流使用 `withastro/action@v5`
3. 检查工作流使用 `actions/deploy-pages@v4`
4. 确认无需手动操作

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 3 minutes
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-16
