---
article_id: OBA-wp8zrskd
tags: [open-source, get-shit-done, claude-code, ai, hooks, claude]
type: learning
updated_at: 2026-03-17
---

# Claude Code Hooks 使用指南

> Hooks 是 Claude Code 的事件钩子机制，允许在特定时机执行自定义脚本，实现上下文监控、状态同步等功能。

## 问题

- Claude Code 的 Hooks 是做什么的？
- 具体内容有什么？
- 如何配置？
- 如何让 AI 感知上下文耗尽风险？
- 如何复用这种逻辑？

## 核心概念

### Hook 事件类型

| Hook 事件 | 触发时机 | stdin 数据 |
|-----------|----------|------------|
| `SessionStart` | 会话开始 | `{ session_id, workspace }` |
| `SessionEnd` | 会话结束 | `{ session_id }` |
| `PreToolUse` | 工具调用前 | `{ tool, input }` |
| `PostToolUse` | 工具调用后 | `{ tool, success, error, toolCallId }` |
| `UserPromptSubmit` | 用户提交消息 | `{ prompt }` |
| `Stop` | AI 响应结束 | `{ session_id }` |
| `PermissionRequest` | 权限请求 | `{ tool, input }` |
| `Statusline` | 定期刷新 | `{ model, session_id, context_window, workspace }` |

### 配置方式

在 `~/.claude/settings.local.json` 中配置：

```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude/hooks/session-start.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": ".*", "hooks": [{ "type": "command", "command": "~/.claude/hooks/tool-end.sh" }] }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/hooks/statusline.js"
  }
}
```

**关键字段**：
- `matcher`：正则匹配工具名，`""` 或 `".*"` 匹配所有
- `type`：目前只有 `"command"`
- `command`：脚本路径

## 让 AI 感知上下文耗尽

**核心机制**：通过 `PostToolUse` hook 的 `additionalContext` 字段注入警告消息

### 实现步骤

1. **Statusline 写入上下文指标**（定期执行）
   ```javascript
   // 写入临时文件作为跨 hook 通信桥梁
   fs.writeFileSync(`/tmp/claude-ctx-${sessionId}.json`, JSON.stringify({
     remaining_percentage: remaining,
     used_pct: used
   }));
   ```

2. **PostToolUse hook 读取并判断**（每次工具调用后）
   ```javascript
   const metrics = JSON.parse(fs.readFileSync(`/tmp/claude-ctx-${sessionId}.json`));

   if (metrics.remaining_percentage <= 25) {
     const output = {
       hookSpecificOutput: {
         hookEventName: "PostToolUse",
         additionalContext: "⚠️ 上下文即将耗尽，请告知用户..."
       }
     };
     process.stdout.write(JSON.stringify(output));
   }
   ```

### 阈值设计

```javascript
const WARNING_THRESHOLD = 35;  // 剩余 ≤ 35% 时警告
const CRITICAL_THRESHOLD = 25; // 剩余 ≤ 25% 时严重警告
const DEBOUNCE_CALLS = 5;      // 每 5 次工具调用警告一次（防刷屏）
```

## 跨 Hook 通信模式

```
┌──────────────────┐
│ Hook A (写入端)   │ ──→ /tmp/bridge-{session}.json
└──────────────────┘              │
                                  ↓
┌──────────────────┐
│ Hook B (读取端)   │ ←── 读取并处理
└──────────────────┘
```

使用临时文件作为桥梁，实现不同 Hook 之间的数据共享。

## 代码示例

### 简化版上下文监控 Hook

```javascript
#!/usr/bin/env node
// ~/.claude/hooks/my-context-monitor.js
const fs = require('fs');
const os = require('os');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const data = JSON.parse(input);
  const sessionId = data.session_id;

  const metricsPath = path.join(os.tmpdir(), `claude-ctx-${sessionId}.json`);
  if (!fs.existsSync(metricsPath)) process.exit(0);

  const { remaining_percentage, used_pct } = JSON.parse(fs.readFileSync(metricsPath));

  if (remaining_percentage <= 30) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `⚠️ 上下文告警：已使用 ${used_pct}%`
      }
    }));
  }
});
```

## 参考资源

- GSD 框架 hooks 实现：`~/.claude/hooks/gsd-*.js`
- Claude Code Monitor：`~/.claude-monitor/hooks/`
