# Codebase Map 完整流程（从架构视角）

> 从三个核心问题理解 GSD 的 Command/Workflow/Agent/Task 关系

---

## 一、核心概念关系图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GSD 架构四层模型                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  用户输入: /gsd:map-codebase                                                 │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Layer 1: Command（命令入口）                                           │  │
│  │                                                                         │  │
│  │  作用：声明"有什么命令" + "用什么工具"                                    │  │
│  │                                                                         │  │
│  │  包含：                                                                 │  │
│  │  • frontmatter (name, description, allowed-tools)  ← 权限声明           │  │
│  │  • <objective>         ← 一句话目标                                     │  │
│  │  • <execution_context> ← 引用哪个 Workflow                              │  │
│  │  • <process>           ← 7 行概述（给 AI 看大图）                        │  │
│  │                                                                         │  │
│  │  文件：commands/gsd/map-codebase.md（72 行）                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      │ @ 引用                                 │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Layer 2: Workflow（流程编排）                                          │  │
│  │                                                                         │  │
│  │  作用：定义"怎么做"的步骤，但不自己执行具体工作                            │  │
│  │                                                                         │  │
│  │  包含：                                                                 │  │
│  │  • <purpose>           ← 详细目的                                      │  │
│  │  • <philosophy>        ← 核心理念                                      │  │
│  │  • <process>           ← 详细步骤（9 个 step）                          │  │
│  │    - init_context      ← 调用 gsd-tools 初始化                          │  │
│  │    - check_existing    ← 检查目录是否存在                               │  │
│  │    - spawn_agents      ← 启动子代理（编排者的核心工作）                   │  │
│  │    - collect_confirmations                                             │  │
│  │    - verify_output                                                    │  │
│  │    - commit                                                           │  │
│  │                                                                         │  │
│  │  文件：get-shit-done/workflows/map-codebase.md（317 行）                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      │ Task 工具启动 Agent                   │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Layer 3: Agent（子代理）                                               │  │
│  │                                                                         │  │
│  │  作用：执行具体工作，有独立上下文                                          │  │
│  │                                                                         │  │
│  │  包含：                                                                 │  │
│  │  • frontmatter (name, description, tools)  ← 可用工具                  │  │
│  │  • <role>              ← 角色定义                                      │  │
│  │  • <process>           ← 执行步骤（探索 + 写文件）                       │  │
│  │  • <templates>         ← 输出模板                                      │  │
│  │                                                                         │  │
│  │  文件：agents/gsd-codebase-mapper.md（773 行）                          │  │
│  │                                                                         │  │
│  │  启动方式：Workflow 通过 Task 工具启动，可并行                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      │ Write 工具直接写入                     │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Layer 4: 产物（输出文件）                                              │  │
│  │                                                                         │  │
│  │  .planning/codebase/                                                   │  │
│  │  ├── STACK.md                                                          │  │
│  │  ├── ARCHITECTURE.md                                                   │  │
│  │  ├── STRUCTURE.md                                                      │  │
│  │  ├── CONVENTIONS.md                                                    │  │
│  │  ├── TESTING.md                                                        │  │
│  │  ├── INTEGRATIONS.md                                                   │  │
│  │  └── CONCERNS.md                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、问题 1：Command 和 Workflow 的结构区别

### 对比表

| 维度 | Command | Workflow |
|------|---------|----------|
| **文件位置** | `commands/gsd/xxx.md` | `get-shit-done/workflows/xxx.md` |
| **行数** | ~70 行 | ~300 行 |
| **核心职责** | 声明"有什么命令" | 定义"怎么做" |
| **frontmatter** | ✅ name, description, allowed-tools | ❌ 无 |
| **objective/purpose** | `<objective>` 一句话 | `<purpose>` 详细说明 |
| **philosophy** | ❌ 无 | ✅ 核心理念 |
| **process 内容** | 7 行概述 | 详细 step + bash 命令 |
| **bash 命令** | ❌ 无 | ✅ 有 |
| **Task 调用** | ❌ 无 | ✅ 启动 Agent |
| **修改频率** | 低（接口稳定） | 高（实现迭代） |

### Command 的结构

```yaml
---
name: gsd:map-codebase                    # 命令名称
description: Analyze codebase...          # 触发条件
allowed-tools:                            # 权限声明
  - Read
  - Bash
  - Task
  - ...
---

<objective>一句话目标</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/map-codebase.md   # 引用实现
</execution_context>

<context>简短上下文</context>

<when_to_use>使用场景</when_to_use>

<process>
1. Check if exists          # 只是概述，没有具体命令
2. Create directory
3. Spawn 4 agents
...
</process>

<success_criteria>
- [ ] checklist
</success_criteria>
```

### Workflow 的结构

```markdown
<purpose>详细目的说明</purpose>

<philosophy>
核心理念，指导 AI 思维方式
</philosophy>

<process>

<step name="init_context" priority="first">
执行命令：
```bash
node gsd-tools.cjs init map-codebase
```
提取配置：mapper_model, has_maps, ...
</step>

<step name="spawn_agents">
启动 Agent（核心！）：

Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  prompt="Focus: tech..."
)
</step>

...更多 step...

</process>

<success_criteria>
详细验证标准
</success_criteria>
```

---

## 三、问题 2：Task 是什么？

### Task 是 Claude Code 的内置工具

**Task 是 Claude Code 提供的工具，用于启动子代理（subagent）。**

```
┌─────────────────────────────────────────────────────────────────┐
│  Task 工具的作用                                                 │
│                                                                  │
│  主会话（Workflow）                                              │
│       │                                                          │
│       │ Task(subagent_type="xxx", prompt="...")                 │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  子代理（Agent）                                         │   │
│  │                                                          │   │
│  │  • 有独立的上下文窗口（不污染主会话）                      │   │
│  │  • 可以有自己的 allowed-tools                            │   │
│  │  • 执行完毕后返回结果给主会话                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Task 工具的参数

```javascript
Task(
  subagent_type="gsd-codebase-mapper",  // Agent 类型（对应 agents/xxx.md）
  model="haiku",                         // 使用的模型
  run_in_background=true,                // 是否并行执行
  description="Map codebase tech stack", // 描述
  prompt="Focus: tech\n\nAnalyze..."     // 传给 Agent 的指令
)
```

### 为什么用 Task？

| 问题 | Task 如何解决 |
|------|--------------|
| 主会话上下文有限 | 每个 Agent 有独立上下文 |
| 需要并行执行 | `run_in_background=true` |
| 不同任务需要不同权限 | 每个 Agent 有自己的 `tools` |
| 大任务需要拆分 | 启动多个 Agent 各自负责一部分 |

### map-codebase 中的 Task 调用

```javascript
// Workflow 启动 4 个并行 Agent

// Agent 1: 分析技术栈
Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  prompt="Focus: tech\n\nWrite STACK.md, INTEGRATIONS.md"
)

// Agent 2: 分析架构
Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  prompt="Focus: arch\n\nWrite ARCHITECTURE.md, STRUCTURE.md"
)

// Agent 3: 分析规范
Task(
  subagent_type="gsd-codebase-mapper",
  ...
  prompt="Focus: quality\n\nWrite CONVENTIONS.md, TESTING.md"
)

// Agent 4: 分析问题
Task(
  subagent_type="gsd-codebase-mapper",
  ...
  prompt="Focus: concerns\n\nWrite CONCERNS.md"
)
```

---

## 四、问题 3：Agent 与 Command/Workflow 的关系

### 三者关系

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Command（入口）                                                 │
│     │                                                            │
│     │ "声明有这个命令，引用 Workflow"                             │
│     │                                                            │
│     ▼                                                            │
│  Workflow（编排者）                                              │
│     │                                                            │
│     │ "定义步骤，通过 Task 启动 Agent"                            │
│     │                                                            │
│     ├──Task──▶ Agent 1（执行者）                                 │
│     ├──Task──▶ Agent 2（执行者）                                 │
│     ├──Task──▶ Agent 3（执行者）                                 │
│     └──Task──▶ Agent 4（执行者）                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 角色分工

| 角色 | 职责 | 类比 |
|------|------|------|
| **Command** | 声明入口 + 权限 | API Route |
| **Workflow** | 编排步骤 + 启动 Agent | Controller/Orchestrator |
| **Agent** | 执行具体工作 | Worker/Service |

### Agent 的结构

```yaml
---
name: gsd-codebase-mapper
description: Explores codebase and writes documents...
tools: Read, Bash, Grep, Glob, Write    # 这个 Agent 可用的工具
color: cyan
---

<role>
你是什么角色，负责什么
</role>

<why_this_matters>
为什么这些文档重要，后续谁会读
</why_this_matters>

<philosophy>
核心理念
</philosophy>

<process>
<step name="parse_focus">解析 focus 类型</step>
<step name="explore_codebase">探索代码库</step>
<step name="write_documents">写入文档</step>
<step name="return_confirmation">返回确认</step>
</process>

<templates>
输出文档的模板
</templates>

<forbidden_files>
禁止读取的文件
</forbidden_files>

<critical_rules>
关键规则
</critical_rules>
```

### Agent 与 Workflow 的关键区别

| 维度 | Workflow | Agent |
|------|----------|-------|
| **是否可被 Task 启动** | ❌ 否 | ✅ 是 |
| **是否有独立上下文** | ❌ 共享主会话 | ✅ 独立上下文 |
| **tools 声明** | ❌ 无（继承 Command） | ✅ 有自己的 tools |
| **职责** | 编排 + 启动 Agent | 执行具体工作 |
| **返回内容** | 收集 Agent 结果 | 只返回确认信息 |

---

## 五、完整流程图（简化版）

```
/gsd:map-codebase
        │
        ▼
┌─────────────────────────────────────────┐
│ Command: map-codebase.md                 │
│                                          │
│ • name: gsd:map-codebase                │
│ • allowed-tools: [Read, Bash, Task...]  │
│ • @workflows/map-codebase.md            │
└─────────────────────────────────────────┘
        │
        │ @ 引用
        ▼
┌─────────────────────────────────────────┐
│ Workflow: map-codebase.md                │
│                                          │
│ Step 1: init_context                     │
│   → node gsd-tools.cjs init ...         │
│                                          │
│ Step 2: check_existing                   │
│   → ls .planning/codebase/              │
│                                          │
│ Step 3: spawn_agents ⭐                   │
│   → Task(Agent 1, focus=tech)           │
│   → Task(Agent 2, focus=arch)           │
│   → Task(Agent 3, focus=quality)        │
│   → Task(Agent 4, focus=concerns)       │
│                                          │
│ Step 4: collect_confirmations            │
│ Step 5: verify_output                    │
│ Step 6: commit                           │
└─────────────────────────────────────────┘
        │
        │ Task 启动（并行）
        ▼
┌─────────────────────────────────────────┐
│ Agent: gsd-codebase-mapper.md            │
│                                          │
│ • tools: [Read, Bash, Grep, Glob, Write]│
│ • 有独立上下文                           │
│ • 直接写入文件，只返回确认               │
│                                          │
│ Step 1: parse_focus                      │
│ Step 2: explore_codebase                 │
│   → grep, find, cat ...                 │
│ Step 3: write_documents                  │
│   → Write STACK.md                      │
│ Step 4: return_confirmation              │
└─────────────────────────────────────────┘
        │
        │ Write 工具
        ▼
┌─────────────────────────────────────────┐
│ 产物: .planning/codebase/                │
│   ├── STACK.md                          │
│   ├── ARCHITECTURE.md                   │
│   ├── STRUCTURE.md                      │
│   ├── CONVENTIONS.md                    │
│   ├── TESTING.md                        │
│   ├── INTEGRATIONS.md                   │
│   └── CONCERNS.md                       │
└─────────────────────────────────────────┘
```

---

## 六、总结

### 三个问题的答案

| 问题 | 答案 |
|------|------|
| **Command vs Workflow 区别** | Command 声明入口+权限，Workflow 定义步骤+逻辑 |
| **Task 是什么** | Claude Code 内置工具，用于启动有独立上下文的子代理 |
| **Agent 与 Command/Workflow 关系** | Command 声明 → Workflow 编排 → Agent 执行 |

### 四层架构

```
Command（声明层）→ Workflow（编排层）→ Agent（执行层）→ 产物（输出层）
```

### 关键设计

1. **Task 是桥梁** - Workflow 通过 Task 启动 Agent
2. **Agent 有独立上下文** - 不污染主会话
3. **Agent 直接写入文件** - 不返回内容给编排者
4. **Workflow 是编排者** - 不执行具体分析工作

---

*整理时间: 2026-03-15*
