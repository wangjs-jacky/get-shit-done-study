# Phase 3: Copy Functionality - Research

**Researched:** 2026-03-16
**Domain:** Clipboard API, Toast Notifications, React Components
**Confidence:** HIGH

## Summary

本阶段实现一键复制功能，将 style prompt 复制到用户剪贴板并显示 toast 反馈。当前代码库已有基本的复制功能（使用 `navigator.clipboard.writeText` + `alert`），需要升级为专业的 Toast 通知系统。

**Primary recommendation:** 使用原生 `navigator.clipboard.writeText` API（现代浏览器全支持），无需 fallback；Toast 组件使用 React Portal + Context 模式自行实现，无需引入额外库。

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COPY-01 | "Copy Prompt" 按钮 - 一键复制风格 prompt 到剪贴板 | Clipboard API 全支持，现有代码已有基础实现 |
| COPY-02 | 复制成功提示（Toast 通知） | React Portal + Context 模式，参考下方代码示例 |
| COPY-03 | 复制的 prompt 适合粘贴到 CLAUDE.md 文件 | Style.promptText 已包含完整 prompt，无需额外格式化 |
| COPY-04 | 复制按钮有清晰的视觉标识 | 使用现有 CSS 变量，hover 状态用 `--color-primary` 高亮 |

## Standard Stack

### Core (Existing - No New Dependencies Required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **navigator.clipboard.writeText** | Native API | 复制文本到剪贴板 | 浏览器原生支持，无需库，2020年起全浏览器支持 |
| **React Portal** | 19.x | Toast 渲染到 body 根节点 | 避免 z-index 问题，React 内置功能 |
| **React Context** | 19.x | 全局 Toast 状态管理 | 简单状态，无需 Zustand/Redux |

### Supporting (Existing)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@testing-library/react** | 16.x | Toast 组件测试 | 已安装，用于测试交互 |
| **vitest** | 3.x | 单元测试运行 | 已配置，使用 jsdom 环境 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 自定义 Toast | react-hot-toast (~8KB) | 库提供更多功能但增加依赖；项目只需简单 success 提示 |
| 自定义 Toast | react-toastify (~10KB) | 功能丰富但过于臃肿；自定义实现仅需 ~50 行代码 |
| Clipboard API | document.execCommand('copy') | 已废弃但仍可用；现代浏览器 Clipboard API 覆盖率 97%+，无需 fallback |

**重要决策：不引入新依赖。** Toast 组件足够简单，自定义实现优于引入库。

## Architecture Patterns

### Recommended Component Structure

```
src/
├── components/
│   ├── CopyButton.tsx           # 复制按钮组件（从 Gallery 提取）
│   ├── Toast.tsx                # Toast 通知组件
│   └── Gallery.tsx              # 集成 CopyButton + Toast
├── context/
│   └── ToastContext.tsx         # Toast 状态管理 Context
└── test/
    └── setup.ts                 # 已有测试配置
```

### Pattern 1: Clipboard Copy with Error Handling

**What:** 使用 Clipboard API 复制文本，带完整错误处理
**When to use:** 所有复制操作
**Example:**

```typescript
// Source: MDN Web Docs - Clipboard.writeText()
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // SecurityError: HTTPS required or permission denied
    // NotAllowedError: User denied clipboard permission
    console.error('Copy failed:', error);
    return false;
  }
}
```

### Pattern 2: Toast Context + Provider Pattern

**What:** 使用 React Context 管理 Toast 状态，避免 prop drilling
**When to use:** 需要从任意组件触发 Toast 时
**Example:**

```typescript
// ToastContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastContextValue {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto-dismiss after 3s
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
```

### Pattern 3: Toast Component with Portal

**What:** 使用 Portal 将 Toast 渲染到 body，避免 z-index 冲突
**When to use:** Toast 需要始终显示在最上层时
**Example:**

```typescript
// Toast.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return createPortal(
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${
        type === 'success'
          ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
          : 'bg-[var(--color-red)] text-white'
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>,
    document.body
  );
}
```

### Anti-Patterns to Avoid

- **使用 alert() 显示复制结果**：用户体验差，阻塞页面，已在新版中被替换
- **内联 Toast 状态到 Gallery 组件**：状态管理混乱，难以扩展
- **使用 execCommand 作为 fallback**：已废弃，Clipboard API 覆盖率足够高
- **Toast 不使用 Portal**：可能被父元素的 overflow/transform 影响定位

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clipboard 复制 | 自定义复制逻辑 | `navigator.clipboard.writeText` | 原生 API，浏览器优化，无需库 |
| Toast 动画 | 复杂的 CSS 动画 | CSS `transition-all` + `transform` | Tailwind 内置，性能好 |
| Toast 定位 | 手动计算位置 | `fixed bottom-4 right-4` | 简单有效，响应式友好 |

**Key insight:** Toast 组件足够简单，50 行代码即可实现专业效果，无需引入 react-hot-toast 或 react-toastify。

## Common Pitfalls

### Pitfall 1: Clipboard API HTTPS 限制

**What goes wrong:** 在 HTTP 环境下 `navigator.clipboard` 为 undefined
**Why it happens:** Clipboard API 只在安全上下文（HTTPS/localhost）中可用
**How to avoid:**
- 本地开发使用 localhost（非 127.0.0.1）
- 生产环境必须使用 HTTPS
- 添加类型检查：`if (navigator.clipboard?.writeText)`
**Warning signs:** `Cannot read property 'writeText' of undefined`

### Pitfall 2: Toast 多实例叠加

**What goes wrong:** 快速点击复制按钮，多个 Toast 叠加显示
**Why it happens:** 每次调用都创建新 Toast，没有清理前一个
**How to avoid:**
- Context 中维护单一 toast 状态
- 新 Toast 自动替换旧 Toast
- 或使用队列管理多个 Toast
**Warning signs:** 屏幕上出现多个 Toast 重叠

### Pitfall 3: Toast 不消失

**What goes wrong:** Toast 显示后不会自动消失
**Why it happens:** 忘记设置 `setTimeout` 清理，或组件卸载时 timeout 未清理
**How to avoid:**
- 使用 `useEffect` 返回清理函数
- 或在 Context 中管理 timeout
**Warning signs:** Toast 一直停留在屏幕上

### Pitfall 4: Portal 渲染时机问题

**What goes wrong:** SSR 时 `document.body` 不存在导致错误
**Why it happens:** 服务端渲染时 DOM API 不可用
**How to avoid:**
- 使用 `useEffect` 确保 DOM 存在后再渲染 Portal
- 或检查 `typeof document !== 'undefined'`
**Warning signs:** `document is not defined` 错误

## Code Examples

### Complete CopyButton Implementation

```typescript
// CopyButton.tsx
import { useToast } from '../context/ToastContext';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { showToast } = useToast();

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) {
      showToast('Clipboard not supported', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('Prompt copied!', 'success');
    } catch (error) {
      showToast('Copy failed', 'error');
      console.error('Copy error:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        bg-[var(--color-bg-elevated)] text-[var(--color-text)] border border-[var(--color-border)]
        hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
        ${className}`}
      aria-label="Copy prompt to clipboard"
    >
      Copy Prompt
    </button>
  );
}
```

### Testing Clipboard with Vitest

```typescript
// __tests__/CopyButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CopyButton from '../CopyButton';
import { ToastProvider } from '../../context/ToastContext';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls clipboard.writeText with correct text', async () => {
    renderWithProvider(<CopyButton text="test prompt" />);

    fireEvent.click(screen.getByRole('button'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test prompt');
  });

  it('shows success toast after successful copy', async () => {
    renderWithProvider(<CopyButton text="test prompt" />);

    fireEvent.click(screen.getByRole('button'));

    // Toast appears with success message
    expect(await screen.findByText('Prompt copied!')).toBeInTheDocument();
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `document.execCommand('copy')` | `navigator.clipboard.writeText` | 2020+ | 异步 API，Promise 支持，更可靠 |
| 第三方 Toast 库 | 自定义 Portal + Context | 2023+ | 减少 bundle，Tailwind 原生支持 |
| alert() | Toast 通知 | 始终应该如此 | 更好的用户体验 |

**Deprecated/outdated:**
- `document.execCommand('copy')`: 已标记为废弃，但仍有教程引用
- `clipboard.js` 库: Clipboard API 原生支持后不再需要

## Open Questions

1. **Toast 位置是否需要可配置？**
   - What we know: 设计稿使用 bottom-right
   - What's unclear: 是否需要支持其他位置（top-center 等）
   - Recommendation: v1 使用固定 bottom-right，后续可扩展

2. **是否需要支持多 Toast 队列？**
   - What we know: 当前设计是单一 Toast 替换模式
   - What's unclear: 用户快速操作时是否需要显示历史
   - Recommendation: v1 使用单一 Toast，符合大多数场景

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COPY-01 | 点击按钮复制 prompt 到剪贴板 | unit | `npm test -- --run CopyButton` | Wave 0 |
| COPY-02 | Toast 通知显示复制成功 | unit | `npm test -- --run Toast` | Wave 0 |
| COPY-03 | promptText 格式正确 | unit | `npm test -- --run style.test` | Existing |
| COPY-04 | 按钮视觉标识清晰 | unit | `npm test -- --run CopyButton` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/CopyButton.tsx` - 复制按钮组件
- [ ] `src/components/Toast.tsx` - Toast 通知组件
- [ ] `src/context/ToastContext.tsx` - Toast 状态管理
- [ ] `src/components/__tests__/CopyButton.test.tsx` - CopyButton 测试
- [ ] `src/components/__tests__/Toast.test.tsx` - Toast 测试
- [ ] `src/context/__tests__/ToastContext.test.tsx` - Context 测试

## Sources

### Primary (HIGH confidence)
- [MDN - Clipboard.writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) - API 文档，浏览器兼容性
- [React 19 Portals](https://react.dev/reference/react-dom/createPortal) - 官方 Portal 文档
- [MDN - Baseline Status](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText#browser_compatibility) - 2020年起全浏览器支持

### Secondary (MEDIUM confidence)
- [LogRocket - React Toast Libraries 2025](https://blog.logrocket.com/react-toast-libraries-compared-2025/) - 库对比分析
- [Stack Overflow - Clipboard in React](https://stackoverflow.com/questions/39501289/in-reactjs-how-to-copy-text-to-clipboard) - 实现模式参考

### Tertiary (LOW confidence)
- N/A - 所有核心信息来自官方文档

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Clipboard API 是稳定的标准，Toast 自实现模式成熟
- Architecture: HIGH - Context + Portal 是 React 标准模式
- Pitfalls: HIGH - 基于实际开发经验和官方文档

**Research date:** 2026-03-16
**Valid until:** 90 days - Clipboard API 稳定，Toast 模式不变
