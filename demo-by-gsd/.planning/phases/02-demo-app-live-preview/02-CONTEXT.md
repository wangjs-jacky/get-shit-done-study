# Phase 2: Demo App & Live Preview - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

构建功能性番茄时钟演示应用，支持风格实时切换。用户可以在左侧预览区看到番茄时钟，点击右侧风格卡片后预览区立即更新为新风格。

</domain>

<decisions>
## Implementation Decisions

### Timer Configuration
- 默认时长：25 分钟工作 + 5 分钟休息（经典番茄钟）
- 计时器功能：开始、暂停、重置按钮

### Style Switching
- 交互方式：点击风格卡片即切换（无需 Apply 按钮）
- 切换时计时器状态保持不变（不重置）
- 切换延迟：< 100ms（CSS 变量注入）

### Visual Design
- 计时器样式：圆形进度环 + 大号数字显示
- 控制按钮：开始/暂停、重置
- 进度指示：环形进度条显示剩余时间比例

### Claude's Discretion
- 精确的按钮样式和布局
- 进度环的动画效果
- 数字字体选择
- 移动端适配细节

</decisions>

<specifics>
## Specific Ideas

- 用户已验证 70/30 布局比例（Phase 1）
- 使用 Terminal Noir 风格的霓虹绿作为强调色
- 计时器应有"功能性"感觉，不是静态 mock

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/Layout.astro`: 主布局组件，70/30 分栏
- `src/components/StyleCard.astro`: 风格卡片组件
- `src/components/StyleList.astro`: 风格列表组件
- `src/data/styles.json`: 风格数据（含 CSS 变量）
- `src/types/style.ts`: Style, StyleData 类型定义

### Established Patterns
- CSS 变量注入：`styles.json` 中的 `cssVariables` 字段
- Astro islands：React 组件通过 `client:` 指令水合
- Tailwind CSS：通过 `@tailwindcss/vite` 集成

### Integration Points
- PreviewPane 需要放在 `index.astro` 左侧区域
- 风格切换通过更新 CSS 变量实现
- React 状态管理用于计时器和选中风格

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-demo-app-live-preview*
*Context gathered: 2026-03-15*
