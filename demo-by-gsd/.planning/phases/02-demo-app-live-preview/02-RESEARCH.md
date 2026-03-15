# Phase 2: Demo App & Live Preview - Research

**Researched:** 2026-03-15
**Domain:** React Interactive Timer with CSS Variable-based Style Switching
**Confidence:** HIGH

## Summary

Phase 2 构建功能性番茄时钟演示应用并实现风格实时切换。核心技术方案是通过 CSS 变量注入实现 < 100ms 的风格切换，使用 React 状态管理计时器逻辑。

**Primary recommendation:** 复用已有的 PomodoroTimer.tsx 和 Gallery.tsx 组件，通过 CSS 变量注入实现即时风格切换。计时器状态在风格切换时保持不变。

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 默认时长：25 分钟工作 + 5 分钟休息（经典番茄钟）
- 计时器功能：开始、暂停、重置按钮
- 交互方式：点击风格卡片即切换（无需 Apply 按钮）
- 切换时计时器状态保持不变（不重置）
- 切换延迟：< 100ms（CSS 变量注入）
- 计时器样式：圆形进度环 + 大号数字显示
- 控制按钮：开始/暂停、重置
- 进度指示：环形进度条显示剩余时间比例

### Claude's Discretion
- 精确的按钮样式和布局
- 进度环的动画效果
- 数字字体选择
- 移动端适配细节

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PREV-01 | 功能性演示应用（番茄时钟），有真实交互 | React + useState/useEffect 模式，计时器逻辑已实现于 PomodoroTimer.tsx |
| PREV-02 | 点击风格后左侧立即更新预览（无页面刷新） | CSS 变量注入模式，通过 document.documentElement.style.setProperty 实现 |
| PREV-03 | 预览区显示完整的演示应用，包含所有 UI 元素 | PomodoroTimer 包含：模式切换、圆形进度、时间显示、控制按钮 |
| PREV-04 | 演示应用有真实的计时器功能 | setInterval + useState 模式，支持开始/暂停/重置 |
| PERF-01 | 风格切换时间 < 100ms | CSS 变量切换是同步操作，无需网络请求 |
| PERF-02 | 初始页面加载 < 3s | Astro SSG + React Islands，静态预渲染 |
| PERF-03 | 无 FOUC（Flash of Unstyled Content） | CSS 变量预加载在 global.css，切换时不触发重绘 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI 组件 | 已集成，用于计时器状态管理和交互 |
| @astrojs/react | 5.x | React 集成 | 已配置，支持 client:load 指令 |
| Tailwind CSS | 4.x | 样式 | 已集成，通过 @tailwindcss/vite |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 3.x | 测试框架 | 已配置，用于组件测试 |
| @testing-library/react | 16.x | React 测试 | 已安装，用于行为测试 |

### Existing Implementation
| Component | Status | Notes |
|-----------|--------|-------|
| PomodoroTimer.tsx | 已实现 | 包含完整计时器逻辑、圆形进度环、控制按钮 |
| Gallery.tsx | 已实现 | 包含风格切换逻辑、CSS 变量注入 |
| PreviewPane.tsx | 已实现 | 独立预览组件，含 Copy Prompt 功能 |
| styles.json | 已实现 | Terminal Noir 风格数据 |

**Installation:**
无需额外安装，所有依赖已在 Phase 1 配置完成。

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── PomodoroTimer.tsx    # 计时器组件（已存在）
│   ├── PreviewPane.tsx      # 预览面板（已存在）
│   ├── Gallery.tsx          # 主容器（已存在）
│   └── __tests__/           # 测试文件
├── data/
│   └── styles.json          # 风格数据（已存在）
├── types/
│   └── style.ts             # 类型定义（已存在）
└── styles/
    └── global.css           # CSS 变量定义（已存在）
```

### Pattern 1: CSS Variable Injection for Style Switching
**What:** 通过修改 :root 的 CSS 变量实现即时风格切换
**When to use:** 所有需要主题切换的场景
**Example:**
```typescript
// 已在 Gallery.tsx 中实现
const handleStyleSelect = (styleId: string) => {
  const selected = styles.find(s => s.id === styleId);
  if (selected) {
    const root = document.documentElement;
    Object.entries(selected.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
};
```
**Source:** 项目现有实现

### Pattern 2: Timer State with useState + useEffect
**What:** 使用 React hooks 管理计时器状态
**When to use:** 所有需要定时更新的场景
**Example:**
```typescript
// 已在 PomodoroTimer.tsx 中实现
const [timeLeft, setTimeLeft] = useState(TIMES.work);
const [isRunning, setIsRunning] = useState(false);

useEffect(() => {
  if (!isRunning) return;
  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // 切换模式
        return TIMES[nextMode];
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(interval);
}, [isRunning, mode]);
```
**Source:** 项目现有实现

### Pattern 3: Circular Progress with SVG
**What:** 使用 SVG circle + stroke-dashoffset 实现圆形进度
**When to use:** 需要环形进度指示的场景
**Example:**
```typescript
// 已在 PomodoroTimer.tsx 中实现
const radius = 120;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference * (1 - progress);

<circle
  cx="140"
  cy="140"
  r={radius}
  stroke="var(--color-primary)"
  strokeDasharray={circumference}
  strokeDashoffset={strokeDashoffset}
  style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
/>
```
**Source:** 项目现有实现

### Anti-Patterns to Avoid
- **内联样式覆盖 CSS 变量：** 会破坏主题切换能力
- **setInterval 不清理：** 会导致内存泄漏和多个计时器并行
- **计时器状态重置：** 风格切换时不应重置计时器

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 计时器逻辑 | 自己写 setInterval | 现有 PomodoroTimer | 已完整实现，包含模式切换 |
| 风格切换 | 复杂的状态管理 | CSS 变量注入 | 简单高效，< 1ms |
| 进度环动画 | CSS animation 关键帧 | SVG strokeDashoffset + transition | 平滑且性能好 |
| 时间格式化 | moment.js 等库 | 原生 padStart | 简单场景无需依赖 |

**Key insight:** 项目已有完整的计时器实现，Phase 2 主要是验证和完善，而非重新构建。

## Common Pitfalls

### Pitfall 1: CSS Variable Not Updating on Time Display
**What goes wrong:** 时间数字使用固定颜色，不响应主题切换
**Why it happens:** 样式硬编码而非使用 CSS 变量
**How to avoid:** 所有颜色使用 `var(--color-xxx)` 格式
**Warning signs:** 切换风格后部分元素颜色不变

### Pitfall 2: Timer Continues After Unmount
**What goes wrong:** 组件卸载后计时器仍在运行
**Why it happens:** useEffect 清理函数缺失或不正确
**How to avoid:** 确保 `return () => clearInterval(interval)` 存在
**Warning signs:** 控制台警告或页面卡顿

### Pitfall 3: Progress Ring Animation Jank
**What goes wrong:** 进度环更新时出现跳帧或闪烁
**Why it happens:** transition 未正确设置或计算错误
**How to avoid:** 使用 `transition: stroke-dashoffset 0.5s ease-in-out`
**Warning signs:** 进度环不流畅或有跳跃

### Pitfall 4: Mode Switch Resets Timer Unexpectedly
**What goes wrong:** 切换 Work/Break 模式时计时器状态丢失
**Why it happens:** 状态更新逻辑错误
**How to avoid:** 使用函数式更新 `setTimeLeft(TIMES[newMode])`
**Warning signs:** 计时器意外重置为初始值

## Code Examples

Verified patterns from existing codebase:

### Timer Toggle Logic
```typescript
// Source: src/components/PomodoroTimer.tsx
const toggleTimer = useCallback(() => {
  setIsRunning((prev) => !prev);
}, []);

const resetTimer = useCallback(() => {
  setIsRunning(false);
  setTimeLeft(TIMES[mode]);
}, [mode]);
```

### Style Variable Application
```typescript
// Source: src/components/Gallery.tsx
const handleStyleSelect = (styleId: string) => {
  setSelectedId(styleId);
  const selected = styles.find(s => s.id === styleId);
  if (selected) {
    setCurrentStyle(selected);
    const root = document.documentElement;
    Object.entries(selected.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
};
```

### Time Display Formatting
```typescript
// Source: src/components/PomodoroTimer.tsx
const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;
const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 类名切换 | CSS 变量注入 | Phase 1 | < 100ms 切换 |
| useState 单独管理 | useCallback 优化 | Phase 1 | 避免不必要渲染 |
| 内联 style 对象 | Tailwind + CSS 变量 | Phase 1 | 更好的主题支持 |

**Deprecated/outdated:**
- @astrojs/tailwind: 已弃用，使用 @tailwindcss/vite 替代

## Open Questions

1. **多风格支持扩展**
   - What we know: 当前只有 Terminal Noir 一个风格
   - What's unclear: 是否需要在 Phase 2 添加更多风格数据
   - Recommendation: 保持单一风格，Phase 3 后再扩展

2. **计时器音效**
   - What we know: 当前无音效
   - What's unclear: 用户是否需要计时结束提示音
   - Recommendation: Phase 2 不实现，作为 v2 功能

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | vitest.config.ts |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PREV-01 | 功能性演示应用有真实交互 | unit | `vitest run src/components/__tests__/PomodoroTimer.test.tsx` | Wave 0 |
| PREV-02 | 点击风格后立即更新预览 | unit | `vitest run src/components/__tests__/Gallery.test.tsx` | Wave 0 |
| PREV-03 | 预览区显示完整演示应用 | integration | `vitest run` | Partial |
| PREV-04 | 演示应用有真实计时器功能 | unit | `vitest run src/components/__tests__/PomodoroTimer.test.tsx` | Wave 0 |
| PERF-01 | 风格切换 < 100ms | manual | Chrome DevTools Performance | N/A |
| PERF-02 | 初始页面加载 < 3s | manual | Lighthouse audit | N/A |
| PERF-03 | 无 FOUC | manual | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/__tests__/PomodoroTimer.test.tsx` - tests for PREV-01, PREV-04
- [ ] `src/components/__tests__/Gallery.test.tsx` - tests for PREV-02
- [ ] `src/components/__tests__/PreviewPane.test.tsx` - tests for PREV-03

*(If no gaps: "None - existing test infrastructure covers all phase requirements")*

## Sources

### Primary (HIGH confidence)
- 项目源码 - 已实现组件分析
- src/components/PomodoroTimer.tsx - 计时器实现
- src/components/Gallery.tsx - 风格切换实现
- src/data/styles.json - 风格数据结构

### Secondary (MEDIUM confidence)
- .planning/research/ARCHITECTURE.md - 架构模式参考
- .planning/research/PITFALLS.md - 常见陷阱

### Tertiary (LOW confidence)
- None for this phase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 项目已完整实现
- Architecture: HIGH - 代码已存在且可验证
- Pitfalls: HIGH - 基于现有代码分析

**Research date:** 2026-03-15
**Valid until:** 30 days (stable React patterns)
