# 上下文窗口监视器

一个后工具钩子（Claude Code 的 `PostToolUse`，Gemini CLI 的 `AfterTool`），在上下文使用量高时警告代理。

## 问题

状态栏向**用户**显示上下文使用情况，但**代理**没有上下文限制的感知。当上下文不足时，代理继续工作直到撞墙 — 可能在没有保存状态的情况下中途任务。

## 工作原理

1. 状态栏钩子将上下文指标写入 `/tmp/claude-ctx-{session_id}.json`
2. 每次工具使用后，上下文监视器读取这些指标
3. 当剩余上下文低于阈值时，它将警告作为 `additionalContext` 注入
4. 代理在其对话中收到警告并可以相应行动

## 阈值

| 级别 | 剩余比例 | 代理行为 |
|------|----------|----------|
| 正常 | > 35% | 无警告 |
| 警告 | <= 35% | 完成当前任务，避免开始新的复杂工作 |
| 关键 | <= 25% | 立即停止，保存状态 (`/gsd:pause-work`) |

## 防抖动

为了避免用重复警告轰炸代理：
- 首次警告总是立即触发
- 后续警告之间需要 5 次工具使用
- 严重程度升级（警告 -> 关键）绕过防抖动

## 架构

```
状态栏钩子 (gsd-statusline.js)
    | 写入
    v
/tmp/claude-ctx-{session_id}.json
    ^ 读取
    |
上下文监视器 (gsd-context-monitor.js, PostToolUse/AfterTool)
    | 注入
    v
additionalContext -> 代理看到警告
```

桥接文件是一个简单的 JSON 对象：

```json
{
  "session_id": "abc123",
  "remaining_percentage": 28.5,
  "used_pct": 71,
  "timestamp": 1708200000
}
```

## 与 GSD 集成

GSD 的 `/gsd:pause-work` 命令保存执行状态。警告消息建议使用它。关键消息指示立即保存状态。

## 设置

两个钩子在 `npx get-shit-done-cc` 安装期间自动注册：

- **状态栏**（写入桥接文件）：在 settings.json 中注册为 `statusLine`
- **上下文监视器**（读取桥接文件）：在 settings.json 中注册为 `PostToolUse` 钩子（Gemini 为 `AfterTool`）

在 `~/.claude/settings.json` 中手动注册（Claude Code）：

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/hooks/gsd-statusline.js"
  },
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/gsd-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

对于 Gemini CLI (`~/.gemini/settings.json`)，使用 `AfterTool` 而不是 `PostToolUse`：

```json
{
  "hooks": {
    "AfterTool": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.gemini/hooks/gsd-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

## 安全性

- 钩子将所有内容包装在 try/catch 中，错误时静默退出
- 它永远不会阻塞工具执行 — 损坏的监视器不应破坏代理的工作流
- 过时的指标（超过 60 秒）被忽略
- 优雅地处理缺失的桥接文件（子代理、新会话）