# Research Summary: Frontend Design Gallery

**Generated:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

Building a Frontend Design Gallery to showcase UI styles from the frontend-design skill. Users can preview different styles on a functional demo app (Pomodoro timer), then copy style prompts to their CLAUDE.md files.

### Core Value Proposition
让开发者在几秒钟内找到并复制他们想要的 UI 风格 prompt。

## Recommended Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Astro 5.x | Ships 90% less JS, perfect for static showcase |
| **Interactive** | React 19.x | User's existing skill uses React |
| **Styling** | Tailwind 4.x | Rapid development, matches design preferences |
| **Deployment** | GitHub Pages | Free, simple, official Astro action |

## Key Features (MVP)

### Must Have (P1)
- ✅ 左右分栏布局：左侧预览区 + 右侧风格列表
- ✅ 功能性演示应用（番茄时钟），有真实交互
- ✅ 实时风格切换：点击风格 → 左侧立即更新预览
- ✅ Copy Prompt 按钮：一键复制风格 prompt 到剪贴板
- ✅ 复制成功提示（Toast）
- ✅ 响应式布局
- ✅ 自动部署到 GitHub Pages

### Should Have (P2)
- 🔄 Dark/Light 模式切换
- 🔄 风格分类/标签
- 🔄 键盘导航

### Out of Scope (v1)
- ❌ 实时生成代码（所有风格代码是预生成的）
- ❌ 用户上传自定义风格
- ❌ 用户账户系统
- ❌ 风格编辑器
- ❌ 多语言支持

## Architecture Highlights

```
┌─────────────────────────────────────────┐
│           GitHub Pages (Static)          │
│  ┌─────────────────────────────────────┐│
│  │            Astro 5.x SSG            ││
│  │  ┌───────────┐  ┌─────────────────┐ ││
│  │  │  Layout   │  │  Preview Island │ ││
│  │  │ (Server)  │  │   (client:load) │ ││
│  │  └───────────┘  └─────────────────┘ ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Key Patterns
- **Islands Architecture**: Only interactive components (Preview, CopyButton, Toast) hydrate
- **CSS Variables**: Instant style switching via CSS custom properties
- **Pre-generated Data**: All styles extracted at build time

## Critical Pitfalls to Avoid

| Pitfall | Prevention |
|---------|------------|
| **FOUC (Flash of Unstyled Content)** | Load CSS before body, use CSS variables |
| **Copy Button Fails Silently** | Check clipboard API, show feedback |
| **Poor Mobile Experience** | Stack layout on mobile, test on devices |
| **Performance Issues** | Lazy load styles, preload on hover |
| **Accessibility Issues** | Keyboard navigation, screen reader support |

## Implementation Phases

### Phase 1: Foundation (v1)
1. Set up Astro project with React + Tailwind
2. Extract style data from frontend-design skill
3. Build left-right split layout
4. Implement Pomodoro timer demo app
5. Add style switching functionality
6. Implement copy to clipboard with toast feedback
7. Set up GitHub Pages deployment

### Phase 2: Enhancement (v1.x)
1. Add dark/light mode toggle
2. Add style categories/tags
3. Add keyboard navigation
4. Optimize performance

### Phase 3: Future (v2+)
1. Style comparison mode
2. Additional demo apps
3. Export history

## Data Flow

```
frontend-design skill
       ↓ (build-time extraction)
styles.json
       ↓ (static import)
StyleList + PreviewPane
       ↓ (user selection)
CSS Variable Injection
       ↓ (instant update)
Live Preview
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Initial page load | < 3s |
| Style switch time | < 100ms |
| Copy success rate | > 99% |
| Mobile usability | All touch targets > 44px |
| Accessibility | WCAG 2.1 AA |

## Sources

### Stack Research
- [Astro Official Docs](https://docs.astro.build/)
- [Astro GitHub Pages Deployment](https://docs.astro.build/en/guides/deploy/github/)

### Features Research
- [MUI Component Library](https://mui.com/)
- [Ant Design Theme Editor](https://ant.design/)
- [UIPrompt.site](https://www.uiprompt.site/)

### Architecture Research
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [CSS Custom Properties for Theming](https://web.dev/articles/baseline-in-action-color-theme)

### Pitfalls Research
- [FOUC Prevention - Stack Overflow](https://stackoverflow.com/questions/74392527/how-to-deal-with-fouc-while-implementing-style-switch)
- [Theme Switching Best Practices - web.dev](https://web.dev/articles/building/a-theme-switch-component)

---
*Research summary synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
