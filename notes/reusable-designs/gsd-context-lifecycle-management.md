---
article_id: OBA-2rxlpnc7
tags: [open-source, get-shit-done, reusable-designs, ai-agent, ai, hooks]
type: learning
updated_at: 2026-03-17
---

# GSD Context Lifecycle Management（上下文生命周期管理）

**来源**：get-shit-done 框架 / hooks + workflows
**发现时间**：2026-03-15
**关键词**：#context-management #hook #state-persistence #session-continuity #ai-agent

## 核心思想

**与其压缩上下文，不如优雅地管理上下文的生命周期。**

通过三层架构实现 AI Agent 的上下文感知、状态持久化和会话恢复：
1. **监控层**：让 Agent 感知自己的上下文边界
2. **持久化层**：分层存储状态（任务级、项目级、全局级）
3. **恢复层**：一键重建完整上下文

## 设计要点

### 1. Bridge File 模式（跨进程通信）

```javascript
// Statusline Hook（每次渲染时执行）
const bridgePath = path.join(os.tmpdir(), `claude-ctx-${session}.json`);
fs.writeFileSync(bridgePath, JSON.stringify({
  session_id: session,
  remaining_percentage: remaining,
  used_pct: used,
  timestamp: Math.floor(Date.now() / 1000)
}));

// Context Monitor Hook（PostToolUse，每次工具调用后执行）
const metrics = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
if (metrics.remaining_percentage <= 25) {
  output.hookSpecificOutput.additionalContext = "CONTEXT CRITICAL...";
}
```

**要点**：
- 临时文件作为 bridge，解耦两个独立进程
- 包含 timestamp 用于过滤陈旧数据
- 静默失败，永不阻塞主流程

### 2. 渐进式警告 + 防抖机制

```javascript
const WARNING_THRESHOLD = 35;  // remaining <= 35%
const CRITICAL_THRESHOLD = 25; // remaining <= 25%
const DEBOUNCE_CALLS = 5;      // 5次tool calls之间才警告一次

// 严重程度升级绕过防抖
const severityEscalated = currentLevel === 'critical' && warnData.lastLevel === 'warning';
if (!firstWarn && warnData.callsSinceWarn < DEBOUNCE_CALLS && !severityEscalated) {
  // 跳过警告，只更新计数器
}
```

### 3. 分层状态存储

| 文件 | 粒度 | 内容 |
|------|------|------|
| `.continue-here.md` | 任务级 | 当前位置、完成/剩余工作、决策、心智状态、下一步 |
| `STATE.md` | 项目级 | Phase进度、进度条、最近决策、会话连续性 |
| `PROJECT.md` | 全局级 | 项目定义、技术约束、需求、决策日志 |

### 4. 心智状态捕获（关键创新）

```markdown
<context>
The approach is: intercept 401s → try refresh → retry original request.
Next step is adding axios interceptor in src/lib/api.ts
</context>

<next_action>
Open src/lib/api.ts and add axios interceptor for token refresh
</next_action>
```

**不仅记录做了什么，还记录"当时的思路"** - 这是恢复后最关键的信息。

### 5. Continuation Format（标准化下一步展示）

```markdown
---

## ▶ Next Up

**{identifier}: {name}** — {one-line description}

`{command to copy-paste}`

<sub>`/clear` first → fresh context window</sub>

---

**Also available:**
- `{alternative option 1}` — description

---
```

**要点**：
- 命令 + 解释，不仅给命令
- 强制提醒 `/clear` 及其原因
- 提供备选路径

### 6. 一键恢复流程

```bash
# 单命令加载所有状态
INIT=$(node "gsd-tools.cjs" init resume)
# 返回: state_exists, roadmap_exists, has_interrupted_agent 等

# 检测中断点
ls .planning/phases/*/.continue-here*.md
# 检测未完成的 plan
for plan in .planning/phases/*/*-PLAN.md; do
  summary="${plan/PLAN/SUMMARY}"
  [ ! -f "$summary" ] && echo "Incomplete: $plan"
done
```

## 代码示例

### 完整的 Context Monitor Hook

```javascript
#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const WARNING_THRESHOLD = 35;
const CRITICAL_THRESHOLD = 25;
const STALE_SECONDS = 60;
const DEBOUNCE_CALLS = 5;

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id;
    if (!sessionId) process.exit(0);

    const metricsPath = path.join(os.tmpdir(), `claude-ctx-${sessionId}.json`);
    if (!fs.existsSync(metricsPath)) process.exit(0);

    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const now = Math.floor(Date.now() / 1000);

    // 过滤陈旧数据
    if (metrics.timestamp && (now - metrics.timestamp) > STALE_SECONDS) {
      process.exit(0);
    }

    const remaining = metrics.remaining_percentage;
    if (remaining > WARNING_THRESHOLD) process.exit(0);

    // 防抖逻辑...
    // 严重程度升级检测...
    // 构建警告消息...
    // 注入 additionalContext...

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0); // 静默失败
  }
});
```

## 可能的复用场景

- [ ] **jacky-skills**：为长运行的 skill 添加上下文监控
- [ ] **jacky-obsidian**：长时间写作任务的断点保存
- [ ] **视频处理工具**：长时间视频处理任务的进度追踪
- [ ] **多步骤代码生成**：复杂功能开发的会话恢复
- [ ] **Agent 工作流**：任何需要跨会话连续性的 AI 工作流

## 复用记录

- {日期} 在 {项目} 中复用：{效果如何}

---

## 相关资源

- [GSD Context Monitor 文档](../../get-shit-done/docs/context-monitor.md)
- [GSD pause-work workflow](../../get-shit-done/get-shit-done/workflows/pause-work.md)
- [GSD resume-project workflow](../../get-shit-done/get-shit-done/workflows/resume-project.md)
- [Checkpoints 设计](../../get-shit-done/get-shit-done/references/checkpoints.md)
