# GSD 上下文生命周期管理 - 时间线分析

**分析时间**：2026-03-15
**来源**：get-shit-done 框架

---

## 核心架构

GSD 不"压缩"上下文，而是**管理上下文的生命周期**，通过三层机制：

1. **监控层**：让 Agent 感知上下文边界
2. **持久化层**：保存中断点状态
3. **恢复层**：一键重建上下文

---

## 场景 1：正常运行时的监控流程

```
T1: 用户发送消息
    │
    ▼
T2: Claude 执行 Tool 调用（Read、Write 等）
    │
    ▼
T3: 【Hook: PostToolUse】触发 gsd-context-monitor.js
    │
    ├─── 读取 /tmp/claude-ctx-{session_id}.json
    │    └── remaining > 35% → 静默退出
    │    └── remaining <= 35% → 注入警告
    │
    ▼
T4: Tool 返回结果
    │
    ▼
T5: 【每 5 次 Tool 调用】Claude Code 刷新 Statusline
    │
    ▼
T6: 【Hook: Statusline】触发 gsd-statusline.js
    │
    ├─── 输入: { session_id, context_window: { remaining_percentage } }
    │
    └─── 执行:
         ├── ① 计算使用率: used = 100 - ((remaining - 16.5) / 83.5 * 100)
         ├── ② 写入 Bridge File: /tmp/claude-ctx-{session_id}.json
         └── ③ 输出 Statusline 字符串: process.stdout.write(...)
```

### 关键：两个 Hook 通过 Bridge File 通信

```
gsd-statusline.js                    gsd-context-monitor.js
       │                                       │
       │  写入                                  │  读取
       ▼                                       ▼
┌─────────────────────────────────────────────────┐
│  /tmp/claude-ctx-{session_id}.json              │
│  {                                              │
│    "session_id": "abc123",                      │
│    "remaining_percentage": 30.5,                │
│    "used_pct": 70,                              │
│    "timestamp": 1708200000                      │
│  }                                              │
└─────────────────────────────────────────────────┘
```

### Bridge File 字段详解

```json
{
  "session_id": "abc123def456",
  "remaining_percentage": 30.5,
  "used_pct": 70,
  "timestamp": 1708200000
}
```

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| `session_id` | string | Claude Code 传入 | 当前会话 ID |
| `remaining_percentage` | number | Claude Code 传入 | 原始剩余百分比（含 16.5% autocompact buffer） |
| `used_pct` | number | **statusline 计算** | 实际使用率（扣除了 buffer） |
| `timestamp` | number | statusline 写入 | 秒级 Unix 时间戳 |

### used_pct 计算逻辑

```javascript
// Claude Code 保留 ~16.5% 作为 autocompact buffer
const AUTO_COMPACT_BUFFER_PCT = 16.5;

// 原始 remaining 包含 buffer，需要扣除才能得到"真正可用"的百分比
// 例如: remaining = 46.5% 时，buffer 占 16.5%，实际可用只剩 30%
const usableRemaining = ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100;
const used = 100 - usableRemaining;
```

### 读写依赖关系（关键！）

```
┌─────────────────┐         ┌─────────────────┐
│ gsd-statusline  │         │ gsd-context-    │
│     .js         │         │   monitor.js    │
│                 │         │                 │
│   【生产者】     │         │   【消费者】     │
│   【写入者】     │         │   【读取者】     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ 写入                       │ 读取
         ▼                           ▼
┌─────────────────────────────────────────────┐
│   /tmp/claude-ctx-{session_id}.json         │
└─────────────────────────────────────────────┘
```

**依赖关系**：

| Hook | 角色 | 触发时机 | 依赖 |
|------|------|----------|------|
| `gsd-statusline.js` | **生产者** | 每 5 次 Tool | 无依赖 |
| `gsd-context-monitor.js` | **消费者** | 每次 Tool 后 | **依赖 statusline 写入的数据** |

### 如果 Statusline 不写入 Bridge File？

```javascript
// gsd-context-monitor.js 中的处理逻辑
if (!fs.existsSync(metricsPath)) {
  process.exit(0);  // 找不到文件 → 静默退出，不警告
}
```

**结果**：
- context-monitor 读不到文件
- `fs.existsSync()` 返回 `false`
- 静默退出，永远不会触发警告
- Agent 对上下文耗尽一无所知

### 常见问题：自定义 Statusline 未写入 Bridge File

**症状**：
```bash
ls -la /tmp/claude-ctx-*.json
# 输出: no matches found
```

**原因**：自定义 statusline（如 `@wangjs-jacky/glm-coding-plan-statusline`）没有写入 bridge file。

**解决方案**：在自定义 statusline 中添加写入逻辑：

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

// 当 Claude Code 调用 statusline 时
if (session && remaining != null) {
  try {
    const bridgePath = path.join(os.tmpdir(), `claude-ctx-${session}.json`);
    fs.writeFileSync(bridgePath, JSON.stringify({
      session_id: session,
      remaining_percentage: remaining,
      used_pct: used,  // 需要计算
      timestamp: Math.floor(Date.now() / 1000)
    }));
  } catch (e) {
    // 静默失败
  }
}
```

---

## 场景 2：上下文不足时的警告流程

### WARNING 级别（remaining <= 35%）

```
T1: Statusline 写入 { remaining_percentage: 30 }

T2: PostToolUse 触发 context-monitor
    │
    ├── 读取: remaining = 30%
    ├── 判断: 30% <= 35% → 需要警告
    ├── 防抖检查: 距上次警告 < 5 次 Tool？
    │   └── 是 → 只更新计数器，不警告
    │   └── 否 → 继续警告
    │
    └── 注入 additionalContext:
        "CONTEXT WARNING: Usage at 70%. Remaining: 30%.
         Context is getting limited. Avoid starting new complex work..."
```

### CRITICAL 级别（remaining <= 25%）

```
T1: Statusline 写入 { remaining_percentage: 20 }

T2: PostToolUse 触发 context-monitor
    │
    ├── 读取: remaining = 20%
    ├── 判断: 20% <= 25% → CRITICAL
    ├── 严重升级检查: 上次 WARNING，这次 CRITICAL
    │   └── 绕过防抖，立即警告！
    │
    └── 注入 additionalContext:
        "CONTEXT CRITICAL: Usage at 80%. Remaining: 20%.
         Do NOT start new complex work.
         Inform the user so they can run /gsd:pause-work..."
```

### 防抖机制

```javascript
const DEBOUNCE_CALLS = 5;  // 5 次 Tool 之间才警告一次

// 防抖逻辑
let warnData = { callsSinceWarn: 0, lastLevel: null };
warnData.callsSinceWarn++;

// 严重升级绕过防抖
const severityEscalated = (currentLevel === 'critical' && warnData.lastLevel === 'warning');

if (!firstWarn && warnData.callsSinceWarn < DEBOUNCE_CALLS && !severityEscalated) {
  // 跳过警告，只更新计数器
  fs.writeFileSync(warnPath, JSON.stringify(warnData));
  process.exit(0);
}
```

---

## 场景 3：中断保存流程（/gsd:pause-work）

### 重要：pause-work 是手动触发的！

```
上下文警告流程                          pause-work 流程
       │                                      │
       ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│ context-monitor │                   │     用户        │
│ 注入警告到 Agent │                   │  手动执行命令    │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         ▼                                     │
┌─────────────────┐                            │
│ Agent 看到:     │                            │
│ "CONTEXT 70%..."│                            │
└────────┬────────┘                            │
         │                                     │
         ▼                                     │
┌─────────────────┐                            │
│ Agent 提醒用户: │                            │
│ "建议运行        │                            │
│  /gsd:pause-work"                            │
└────────┬────────┘                            │
         │                                     │
         └──────────────► 用户决定 ◄───────────┘
                          │
                          ▼
                   /gsd:pause-work
```

**关键点**：
- context-monitor **只负责警告**，不会自动暂停
- Agent **只负责提醒**，不会自动执行 pause-work
- **用户必须手动执行** `/gsd:pause-work`

### pause-work 执行步骤

```
T1: 用户执行 /gsd:pause-work
    │
    ▼
T2: 检测当前 Phase 目录
    │
    └── ls -lt .planning/phases/*/PLAN.md | head -1
       → "02-authentication"

T3: 收集状态信息（通过对话或自动收集）
    │
    ├── 当前位置: Phase 2, Plan 1, Task 3
    ├── 完成工作: Task 1-2
    ├── 剩余工作: Task 3-7
    ├── 决策: 为什么选这个方案
    ├── 阻塞: 有什么问题
    └── 心智状态: 当时的思路

T4: 写入 .continue-here.md
    │
    └── 路径: .planning/phases/02-authentication/.continue-here.md

T5: Git Commit
    │
    └── git commit -m "wip: authentication paused at task 3/7"

T6: 告诉用户如何恢复
    │
    └── "✓ 已保存进度。恢复时运行: /gsd:resume-work"
```

### pause-work 之后用户应该做什么？

```
T7: 用户执行后续操作
    │
    ├── ① /clear（清空上下文，释放 context window）
    │
    └── ② /gsd:resume-work（在新 session 中恢复）
           │
           └── 读取 .continue-here.md，继续工作
```

### .continue-here.md 结构

```markdown
---
phase: 02-authentication
task: 3
total_tasks: 7
status: in_progress
last_updated: 2024-01-15T14:30:00Z
---

<current_state>
正在实现 JWT refresh token rotation...
</current_state>

<completed_work>
- Task 1: User schema - Done
- Task 2: Login API - Done
</completed_work>

<remaining_work>
- Task 3: 客户端 refresh 逻辑（进行中）
- Task 4-7: 未开始
</remaining_work>

<context>
思路: 拦截 401 → 尝试 refresh → 重试原请求
下一步: 在 src/lib/api.ts 添加 axios interceptor
</context>

<next_action>
打开 src/lib/api.ts，添加 token refresh 拦截器
</next_action>
```

---

## 场景 4：恢复流程（/gsd:resume-work）

```
T1: 用户执行 /gsd:resume-work
    │
    ▼
T2: 调用 gsd-tools.cjs init resume
    │
    └── 返回: { state_exists: true, roadmap_exists: true, ... }

T3: 读取 STATE.md（项目级状态）
    │
    └── .planning/STATE.md
       → 当前 Phase、进度、最近决策

T4: 读取 PROJECT.md（全局状态）
    │
    └── .planning/PROJECT.md
       → 项目定义、约束、决策日志

T5: 检测中断点
    │
    ├── ls .planning/phases/*/.continue-here*.md
    └── 读取 .continue-here.md
       → 中断位置、心智状态、下一步

T6: 呈现状态摘要
    │
    └── 输出 PROJECT STATUS 表格 + 恢复选项

T7: 用户选择恢复

T8: 读取 <next_action>，继续工作
```

---

## 数据存储位置总结

| 文件 | 写入者 | 读取者 | 生命周期 |
|------|--------|--------|----------|
| `/tmp/claude-ctx-{session}.json` | gsd-statusline.js | gsd-context-monitor.js | Session 内 |
| `.planning/STATE.md` | pause-work, workflows | resume-work | 长期 |
| `.planning/phases/{phase}/.continue-here.md` | pause-work | resume-work | 任务完成可删 |
| `.planning/PROJECT.md` | new-project, workflows | resume-work | 长期 |

---

## 关键技术点

### 1. process.stdout.write()

```javascript
process           // Node.js 全局对象（当前进程）
    .             // 点语法访问属性
      stdout      // 标准输出流（Writable Stream）
          .       // 点语法访问方法
            write() // 写入方法（不加换行）
```

为什么用 `process.stdout.write()` 而不是 `console.log()`：
- Statusline 是单行，不能有换行
- 需要精确控制输出格式

### 2. Hook 触发时机

| Hook | 触发时机 | 作用 |
|------|----------|------|
| Statusline | 每 5 次 Tool 调用 | 写入 context metrics |
| PostToolUse | 每次 Tool 调用后 | 检查是否需要警告 |

### 3. 阈值设计

| 级别 | 剩余 | 行为 |
|------|------|------|
| Normal | > 35% | 无警告 |
| WARNING | <= 35% | 提醒收尾，避免新工作 |
| CRITICAL | <= 25% | 立即暂停，保存状态 |

---

## 设计精髓

1. **Bridge File 模式**：临时文件解耦两个独立 Hook
2. **渐进式警告 + 防抖**：避免 spam，严重升级绕过防抖
3. **心智状态捕获**：`<context>` 字段记录"当时的思路"
4. **分层存储**：任务级 → 项目级 → 全局级
5. **一键恢复**：单命令加载所有状态
