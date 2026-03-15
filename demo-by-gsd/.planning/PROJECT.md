# Frontend Design Gallery

## What This Is

一个 Frontend Design Gallery 网站，让开发者快速预览和选择不同 UI 风格，一键复制对应的 prompt 到自己的 CLAUDE.md 文件中使用。

左侧展示功能性小应用（如番茄时钟）的实时预览，右侧列出各种风格选项。用户点击风格后左侧立即切换，满意后点击 "Copy Prompt" 按钮复制到剪贴板。

## Core Value

让开发者在几秒钟内找到并复制他们想要的 UI 风格 prompt。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 左右分栏布局：左侧预览区 + 右侧风格列表
- [ ] 功能性演示应用（如番茄时钟），有真实交互
- [ ] 实时风格切换：点击风格 → 左侧立即更新预览
- [ ] Copy Prompt 按钮：一键复制风格 prompt 到剪贴板
- [ ] 复制成功提示（Toast 或类似反馈）
- [ ] 风格数据从 frontend-design skill 提取
- [ ] 自动部署到 GitHub Pages
- [ ] 流畅的切换体验（无页面刷新）

### Out of Scope

- 实时生成代码（所有风格代码是预生成的） — 避免复杂性和延迟
- 用户上传自定义风格 — v1 专注展示已有风格
- 用户账户系统 — 不需要登录即可使用
- 风格编辑器 — 超出展示和复制的核心目标
- 多语言支持 — v1 仅中文

## Context

- 用户有一个 frontend-design skill，包含多种视觉风格定义（如 Terminal Noir、Glassmorphism、Cyberpunk 等）
- 目标用户是开发者，需要快速找到合适的 UI 风格 prompt
- 需要展示真实的功能性应用（有交互），不只是静态页面
- 复制的 prompt 会被粘贴到用户自己项目的 CLAUDE.md 文件中

## Constraints

- **部署**: GitHub Pages（静态站点） — 免费且简单
- **性能**: 风格切换需要流畅，无感知延迟
- **兼容**: 现代浏览器（Chrome, Firefox, Safari, Edge）
- **数据**: 风格定义来自 frontend-design skill，需要提前提取

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 预生成风格代码而非实时生成 | 避免构建复杂性，确保切换流畅 | — Pending |
| GitHub Pages 部署 | 免费、简单、与 GitHub 生态集成 | — Pending |
| 单页应用架构 | 风格切换无刷新，用户体验更好 | — Pending |

---
*Last updated: 2026-03-15 after initialization*
