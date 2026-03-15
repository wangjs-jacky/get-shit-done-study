# 最简多 Agent 编排设计

> 参考 GSD 框架，提炼出最核心的多 Agent 编排机制

## 一、核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    用户调用 Command                      │
└─────────────────────────┬───────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Orchestrator (Workflow)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  1. 初始化 - 读取状态                             │   │
│  │  2. 分析 - 决定调用哪个 Agent                     │   │
│  │  3. 调度 - Task() 调用 Agent                      │   │
│  │  4. 处理 - 解析 Agent 返回结果                    │   │
│  │  5. 更新 - 写入状态文件                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ Task() tool
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Agent A  │    │ Agent B  │    │ Agent C  │
    │ (研究)    │    │ (规划)    │    │ (执行)    │
    └──────────┘    └──────────┘    └──────────┘
```

## 二、最小实现

### 1. 目录结构

```
.my-workflow/
├── commands/
│   └── my-workflow.md        # Command 入口（调用 workflow）
├── workflows/
│   └── run-task.md           # Orchestrator 编排逻辑
├── agents/
│   ├── researcher.md         # Agent A: 收集信息
│   ├── planner.md            # Agent B: 制定计划
│   └── executor.md           # Agent C: 执行任务
└── state.json                # 状态文件（最简版用 JSON）
```

### 2. Command 入口 (`commands/my-workflow.md`)

```markdown
---
name: my-workflow
description: 运行多 Agent 编排示例
---

@../workflows/run-task.md
```

### 3. Orchestrator (`workflows/run-task.md`)

```markdown
<purpose>
编排三个 Agent 完成任务：研究 → 规划 → 执行
</purpose>

<process>

## 1. 初始化状态

检查是否存在状态文件，不存在则创建：

```bash
if [ ! -f ".my-workflow/state.json" ]; then
  mkdir -p .my-workflow
  echo '{"stage": "init", "data": {}}' > .my-workflow/state.json
fi
STATE=$(cat .my-workflow/state.json)
```

解析当前阶段：`stage = init | researched | planned | done`

## 2. 路由到对应阶段

| Stage | 下一步动作 |
|-------|-----------|
| `init` | 调用 researcher |
| `researched` | 调用 planner |
| `planned` | 调用 executor |
| `done` | 显示完成信息 |

## 3. 调用 Agent

### Stage: init → 调用 researcher

```
Task(
  subagent_type="researcher",
  prompt="
    <objective>
    收集项目信息，为后续规划提供上下文
    </objective>

    <output>
    返回格式：
    ## RESEARCH COMPLETE
    {收集到的关键信息 JSON}
    </output>
  ",
  description="Research project"
)
```

### Stage: researched → 调用 planner

```
Task(
  subagent_type="planner",
  prompt="
    <objective>
    基于研究结果制定执行计划
    </objective>

    <context>
    {上一步 researcher 返回的数据}
    </context>

    <output>
    返回格式：
    ## PLAN CREATED
    {计划步骤 JSON}
    </output>
  ",
  description="Create plan"
)
```

### Stage: planned → 调用 executor

```
Task(
  subagent_type="executor",
  prompt="
    <objective>
    执行计划中的任务
    </objective>

    <plan>
    {上一步 planner 返回的计划}
    </plan>

    <output>
    返回格式：
    ## EXECUTION COMPLETE
    {执行结果}
    </output>
  ",
  description="Execute plan"
)
```

## 4. 更新状态

每次 Agent 返回后，更新状态文件：

```bash
# 根据返回结果更新 stage
# researcher 返回 → stage = "researched"
# planner 返回 → stage = "planned"
# executor 返回 → stage = "done"

echo '{"stage": "researched", "data": {...}}' > .my-workflow/state.json
```

## 5. 完成处理

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✓ 工作流完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

已完成所有阶段：研究 → 规划 → 执行

结果：{执行结果摘要}
```

</process>
```

### 4. Agent 定义

#### Agent A: Researcher (`agents/researcher.md`)

```markdown
---
name: researcher
description: 收集项目信息
tools: Read, Glob, Grep, Bash
---

<role>
你是研究员 Agent。你的任务是收集项目上下文信息。
</role>

<execution_flow>

## 1. 收集信息

1. 检查项目结构：`ls -la`
2. 查找关键文件：`Glob *.json`, `Glob *.md`
3. 读取配置：`Read package.json`（如存在）
4. 搜索关键代码模式

## 2. 返回结果

必须返回以下格式：

```
## RESEARCH COMPLETE

```json
{
  "project_type": "web|cli|library",
  "language": "typescript|javascript|python",
  "key_files": ["file1", "file2"],
  "dependencies": ["dep1", "dep2"],
  "notes": "其他发现"
}
```
```

</execution_flow>
```

#### Agent B: Planner (`agents/planner.md`)

```markdown
---
name: planner
description: 制定执行计划
tools: Read, Write
---

<role>
你是规划师 Agent。基于研究结果制定执行计划。
</role>

<execution_flow>

## 1. 分析上下文

读取传入的 `<context>` 数据，理解项目现状。

## 2. 生成计划

创建结构化的执行计划：

```json
{
  "steps": [
    {
      "id": 1,
      "action": "具体操作",
      "files": ["要修改的文件"],
      "validation": "如何验证完成"
    }
  ]
}
```

## 3. 返回结果

```
## PLAN CREATED

```json
{
  "steps": [...]
}
```
```

</execution_flow>
```

#### Agent C: Executor (`agents/executor.md`)

```markdown
---
name: executor
description: 执行计划任务
tools: Read, Write, Edit, Bash
---

<role>
你是执行者 Agent。按照计划执行具体任务。
</role>

<execution_flow>

## 1. 读取计划

解析传入的 `<plan>` 数据。

## 2. 逐个执行

对于每个 step：
1. 执行 action
2. 验证结果
3. 记录状态

## 3. 返回结果

```
## EXECUTION COMPLETE

{
  "completed_steps": [1, 2, 3],
  "files_modified": ["file1", "file2"],
  "summary": "执行摘要"
}
```

</execution_flow>
```

## 三、核心机制总结

### 1. 状态流转

```
init → researcher → researched → planner → planned → executor → done
```

### 2. 数据传递

```
┌────────────┐    Task()     ┌────────────┐    Task()     ┌────────────┐
│ Orchestrator│ ───────────▶ │ Researcher │               │            │
└────────────┘               └────────────┘               │            │
      ▲                           │                       │            │
      │                           ▼                       │            │
      │                     返回结果                      │            │
      │                           │                       │            │
      │     ┌─────────────────────┘                       │            │
      │     │ 更新 state.json                             │            │
      │     │                                             │            │
      │     ▼                                             ▼            │
      │           Task()                         ┌────────────┐       │
      └─────────────────────────────────────────▶│  Planner   │       │
                                                └────────────┘       │
                                                      │               │
                                                      ▼               │
                                                 返回结果            │
                                                      │               │
                                        ┌─────────────┘               │
                                        │ 更新 state.json             │
                                        │                             │
                                        ▼                             │
                                              Task()                  │
                                        ┌─────────────────────────────┘
                                        ▼
                                  ┌────────────┐
                                  │  Executor  │
                                  └────────────┘
                                        │
                                        ▼
                                   返回结果
                                        │
                                  ┌─────┘
                                  ▼
                            state.json = done
```

### 3. 关键代码片段

#### Orchestrator 调用 Agent

```markdown
Task(
  subagent_type="{agent-name}",
  prompt="
    <objective>任务目标</objective>
    <context>上下文数据</context>
    <output>期望的返回格式</output>
  ",
  description="简短描述"
)
```

#### Agent 返回结果

```markdown
## {STATUS}

{JSON 数据}
```

状态类型：
- `RESEARCH COMPLETE` - 研究完成
- `PLAN CREATED` - 计划创建
- `EXECUTION COMPLETE` - 执行完成
- `BLOCKED` - 需要用户输入
- `ERROR` - 发生错误

#### 状态文件格式

```json
{
  "stage": "init|researched|planned|done|blocked",
  "data": {
    // Agent 返回的数据
  },
  "error": null,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 四、与 GSD 的差异

| 维度 | 最简版 | GSD 完整版 |
|------|--------|-----------|
| 状态文件 | JSON | Markdown (STATE.md) |
| Agent 数量 | 3 个串行 | 12+ 个，支持并行 |
| 配置系统 | 无 | config.json |
| 修订循环 | 无 | Planner ↔ Checker |
| Wave 并行 | 无 | 支持 |
| 错误恢复 | 手动 | 自动 checkpoint |

## 五、扩展方向

1. **添加并行执行**：多个 Agent 同时运行
2. **添加修订循环**：执行后验证，失败则重试
3. **添加 Checkpoint**：支持中断恢复
4. **添加配置系统**：可配置 Agent 行为
5. **添加 Gap 闭环**：验证失败自动修复

---

**文件位置**：`notes/design/minimal-multi-agent-orchestration.md`
