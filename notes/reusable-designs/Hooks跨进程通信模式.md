# Hooks 跨进程通信模式

**来源**：get-shit-done-study / Claude Code 官方
**发现时间**：2025-03-15
**关键词**：`hooks` `进程通信` `临时文件` `状态共享`

## 核心思想

使用临时文件作为不同 Hook 之间的通信桥梁，实现跨进程状态共享和数据传递。

## 设计要点

- 使用 `/tmp` 目录存放临时文件，会话结束自动清理
- 文件名包含 `session_id` 实现多会话隔离
- JSON 格式便于读写和扩展
- 写入端不阻塞，读取端容错处理（文件不存在时静默退出）
- 通过 `hookSpecificOutput.additionalContext` 向 AI 注入信息

## 代码示例

```javascript
// 写入端（Statusline，定期执行）
fs.writeFileSync(`/tmp/claude-ctx-${sessionId}.json`, JSON.stringify({
  remaining_percentage: remaining,
  used_pct: used,
  timestamp: Date.now()
}));

// 读取端（PostToolUse，每次工具调用后）
const metrics = JSON.parse(fs.readFileSync(`/tmp/claude-ctx-${sessionId}.json`));
if (metrics.remaining_percentage <= 25) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: "⚠️ 上下文即将耗尽"
    }
  }));
}
```

## 可能的复用场景

- [ ] **jacky-skills**：多个 skill 之间共享执行状态
- [ ] **jacky-monitor**：不同监控组件之间传递指标数据
- [ ] **jacky-claude-monitor**：多个 hook 脚本共享会话上下文
- [ ] **VSCode 插件**：webview 和 extension 之间通信

## 复用记录

- _暂无_
