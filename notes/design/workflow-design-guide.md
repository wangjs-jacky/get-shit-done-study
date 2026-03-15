# Workflow 设计指南

> 基于 GSD 框架学习，总结如何设计一个新的 Workflow

## 一、设计新 Workflow 需要考虑的核心点

### 1. 多 Agent 编排

GSD 的核心设计是将复杂任务拆分给多个专业化 Agent，通过 Workflow 编排协作。

```
┌─────────────────┐
│   Orchestrator  │  ← Workflow 文件（编排逻辑）
│   (轻量级)       │
└────────┬────────┘
         │ Task() tool 调用
    ┌────┴────┬─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│Agent 1│ │Agent 2│ │Agent 3│  ← 每个 Agent 独立上下文
└───────┘ └───────┘ └───────┘
```

**设计要点**：
- Orchestrator 只做协调，不执行具体任务
- 通过 `Task()` tool 调用子 Agent
- 传递路径而非文件内容（避免上下文膨胀）
- 每个 Agent 有独立的 200k 上下文窗口

**示例**（plan-phase.md）：
```markdown
Task(
  prompt="...",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Plan Phase {phase}"
)
```

### 2. 状态持久化（STATE.md）

GSD 通过 Markdown 文件实现跨会话状态持久化：

```
STATE.md 记录：
├── position（当前位置：哪个 phase、哪个 plan）
├── decisions（已做出的决策）
├── blockers（阻塞项）
├── last_updated（最后更新时间）
└── checkpoint（检查点信息）
```

**设计要点**：
- 状态文件使用 Markdown 格式，人类可读
- 每次关键操作后更新状态
- 支持中断后恢复（`/gsd:resume-work`）

**STATE.md 示例**：
```markdown
# Project State

**Last Updated:** 2024-01-15
**Current Phase:** 03-user-auth
**Current Plan:** 03-02

## Decisions
- Use JWT for authentication (2024-01-10)
- PostgreSQL as primary database (2024-01-12)

## Blockers
- Waiting for API keys from ops team

## Checkpoints
- Phase 2 complete (2024-01-14)
```

### 3. ROADMAP 中的文件类型区分

ROADMAP.md 不仅定义 Phase 顺序，还区分了不同类型的产物：

| 产物类型 | 文件 | 用途 |
|----------|------|------|
| **目标定义** | ROADMAP.md | Phase 的 goal 和 success_criteria |
| **需求映射** | REQUIREMENTS.md | REQ-ID → Phase 映射 |
| **用户决策** | CONTEXT.md | 用户的设计偏好和锁定决策 |
| **技术研究** | RESEARCH.md | 技术选型和实现建议 |
| **执行计划** | PLAN.md | 具体任务和验收标准 |
| **执行结果** | SUMMARY.md | 完成了什么、创建了什么文件 |
| **验证结果** | VERIFICATION.md | Phase Goal 是否达成 |

**设计要点**：
- 每种文件有明确的职责边界
- 文件命名规范：`{phase}-{type}.md`
- Agent 只读取需要的文件类型

### 4. Wave 分组与依赖管理

当有多个 Plan 需要执行时，通过 Wave 分组管理依赖：

```
Phase 有 6 个 Plans:
  Wave 1: Plan-01, Plan-02  ← 无依赖，可并行
  Wave 2: Plan-03           ← 依赖 Wave 1
  Wave 3: Plan-04, Plan-05, Plan-06  ← 依赖 Wave 2
```

**PLAN.md frontmatter 示例**：
```yaml
---
phase: 01
plan: 01-02
type: standard
wave: 2
depends_on:
  - 01-01
files_modified:
  - src/auth/login.ts
  - src/auth/middleware.ts
autonomous: true
---
```

**设计要点**：
- `wave` 字段标识执行顺序
- `depends_on` 字段标识依赖关系
- `autonomous` 字段标识是否需要用户交互

### 5. 修订循环（Revision Loop）

计划生成后，通过 Checker 验证质量，不通过则修订：

```
┌─────────┐     ┌─────────┐
│ Planner │────▶│ Checker │
└─────────┘     └────┬────┘
     ▲               │
     │ [ISSUES]      │ [PASSED]
     └───────────────┘
        (最多3次)
```

**设计要点**：
- 设置最大迭代次数（GSD 是 3 次）
- Checker 返回结构化问题列表
- 超过迭代次数后由用户决定

### 6. Gap 闭环机制

当 Verifier 发现差距时，触发 Gap 闭环：

```
Verifier 发现差距
    ↓
/gsd:plan-phase X --gaps
    ↓
生成 gap_closure 类型的 PLAN
    ↓
/gsd:execute-phase X --gaps-only
    ↓
Verifier 重新验证
```

**设计要点**：
- `--gaps` 标记触发差距分析模式
- Gap 计划有特殊的 `gap_closure: true` 标记
- `--gaps-only` 只执行 gap 修复计划

## 二、Workflow 文件结构模板

```markdown
<purpose>
一句话描述这个 Workflow 的目的
</purpose>

<required_reading>
执行前必须读取的文件列表
</required_reading>

<process>

## 1. Step Name

```bash
# 初始化命令
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init xxx)
```

Parse JSON for: `field1`, `field2`, ...

## 2. Next Step

...

</process>

<output>
这个 Workflow 产出的文件列表
</output>

<success_criteria>
- [ ] 检查项 1
- [ ] 检查项 2
</success_criteria>
```

## 三、Agent 文件结构模板

```markdown
---
name: gsd-xxx
description: Agent 的描述（用于被调用时匹配）
tools: Read, Write, Edit, Bash, Grep, Glob
color: yellow
skills:
  - related-skill
---

<role>
你是 GSD xxx Agent。
你的职责是...
被 xxx workflow 调用。
</role>

<execution_flow>

<step name="first_step">
1. 读取必要的文件
2. 执行任务
3. 返回结果
</step>

</execution_flow>

<output>
## TASK COMPLETE
或
## CHECKPOINT REACHED
或
## ISSUES FOUND
</output>
```

## 四、关键工具：gsd-tools.cjs

GSD 提供了一个 CLI 工具处理通用逻辑：

```bash
# 初始化上下文
node gsd-tools.cjs init <workflow-name>

# Roadmap 操作
node gsd-tools.cjs roadmap analyze
node gsd-tools.cjs roadmap get-phase <phase>

# 状态操作
node gsd-tools.cjs state-snapshot

# 配置操作
node gsd-tools.cjs config-get <key>
node gsd-tools.cjs config-set <key> <value>

# 进度条
node gsd-tools.cjs progress bar --raw
```

**设计要点**：
- 复杂的文件解析逻辑封装在 CLI 工具中
- Workflow 只调用 CLI 获取结构化数据
- 避免在 Workflow 中写复杂的 jq 解析

## 五、交互设计

### AskUserQuestion 使用场景

| 场景 | 示例 |
|------|------|
| 选择模式 | YOLO vs Interactive |
| 配置确认 | 是否启用 Research |
| 决策点 | 遇到多个可行方案 |
| Checkpoint | 需要用户确认才能继续 |

**示例**：
```markdown
Use AskUserQuestion:
- header: "Mode"
- question: "How do you want to work?"
- options:
  - "YOLO (Recommended)" — Auto-approve, just execute
  - "Interactive" — Confirm at each step
```

### 自由对话场景

当需要深度探索时，使用自由对话而非 AskUserQuestion：

```markdown
Ask inline (freeform, NOT AskUserQuestion):

"What do you want to build?"

Wait for their response. This gives you the context needed to ask intelligent follow-up questions.
```

## 六、可复用设计模式

### 1. 初始化模式

每个 Workflow 第一步都是初始化：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init <workflow-name>)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

### 2. 大文件避免读取模式

对于大文件，使用路径传递而非直接读取：

```markdown
<files_to_read>
- {state_path} (Project State)
- {roadmap_path} (Roadmap)
- {requirements_path} (Requirements)
</files_to_read>
```

### 3. 错误处理模式

```markdown
**If `xxx_exists` is false:**
Error — run `/gsd:yyy` first.
```

### 4. 自动推进模式

```markdown
**If `--auto` flag present OR `AUTO_CFG` is true:**
Display banner and launch next workflow automatically.
```

## 七、与 jacky-skills 融合建议

| GSD 设计 | 可借鉴到 jacky-skills |
|----------|----------------------|
| Orchestrator 模式 | 复杂 skill 可拆分为多个子 agent |
| STATE.md 持久化 | 长期任务需要状态文件 |
| Wave 并行 | 独立任务并行执行 |
| 修订循环 | 质量检查 → 修订 → 再检查 |
| Gap 闭环 | 验证失败 → 修复 → 重新验证 |

---

**下一步**：
- 研究 `gsd-tools.cjs` 的实现细节
- 分析具体 Workflow 的完整实现
- 尝试为 jacky-skills 设计类似的编排机制
