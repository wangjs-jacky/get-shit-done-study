# GSD Agents 设计分析

> 12 个专业化子代理，通过编排器协调工作

## Agent 清单

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GSD Agent 体系                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  【研究层】                                                              │
│  ├── gsd-project-researcher    # 项目级领域研究                          │
│  ├── gsd-phase-researcher      # 阶段级技术研究                          │
│  └── gsd-research-synthesizer  # 综合多个研究结果                        │
│                                                                         │
│  【规划层】                                                              │
│  ├── gsd-roadmapper            # 创建项目路线图                          │
│  └── gsd-planner               # 创建阶段执行计划                        │
│                                                                         │
│  【执行层】                                                              │
│  └── gsd-executor              # 执行计划，提交代码                      │
│                                                                         │
│  【验证层】                                                              │
│  ├── gsd-verifier              # 验证目标是否达成                        │
│  ├── gsd-plan-checker          # 验证计划质量                            │
│  ├── gsd-integration-checker   # 验证跨阶段集成                          │
│  └── gsd-nyquist-auditor       # 验证测试覆盖率                          │
│                                                                         │
│  【辅助层】                                                              │
│  ├── gsd-codebase-mapper       # 代码库结构分析                          │
│  └── gsd-debugger              # 调试和问题排查                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent 文件结构

### Frontmatter 定义

```yaml
---
name: gsd-planner                    # 唯一标识（gsd- 前缀）
description: Creates executable...   # 描述（用于自动识别）
tools: Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__*  # 可用工具
color: green                         # 状态栏颜色标识
skills:                              # 关联的 skills
  - gsd-planner-workflow
# hooks:                              # 可选的钩子（当前注释掉）
#   PostToolUse:
#     - matcher: "Write|Edit"
#       hooks:
#         - type: command
#           command: "npx eslint --fix $FILE 2>/dev/null || true"
---
```

### 内容结构

```markdown
<role>
你是谁，被谁调用，核心职责
</role>

<project_context>
如何发现项目上下文（CLAUDE.md、skills）
</project_context>

<philosophy>
设计哲学和原则
</philosophy>

<execution_flow>
<step name="step1">...</step>
<step name="step2">...</step>
</execution_flow>

<deviation_rules>
处理偏差的规则
</deviation_rules>

<output_spec>
输出格式规范
</output_spec>
```

---

## 核心设计模式

### 1. 强制初始读取

**每个 agent 都必须先读取上下文文件**：

```xml
<role>
...
**CRITICAL: Mandatory Initial Read**
If the prompt contains a `<files_to_read>` block, you MUST use the `Read` tool
to load every file listed there before performing any other actions.
</role>
```

**原因**：确保 agent 有足够的上下文，避免盲目执行。

### 2. 项目上下文发现

**每个 agent 都有统一的项目发现流程**：

```xml
<project_context>
Before [planning/executing/verifying], discover project context:

**Project instructions:** Read `./CLAUDE.md` if it exists.

**Project skills:** Check `.claude/skills/` or `.agents/skills/`:
1. List available skills (subdirectories)
2. Read `SKILL.md` for each skill (~130 lines)
3. Load specific `rules/*.md` as needed
4. Do NOT load full `AGENTS.md` (100KB+ context cost)
</project_context>
```

**关键设计**：轻量级索引 + 按需加载，避免上下文爆炸。

### 3. 下游消费者声明

**每个 agent 明确声明谁会消费它的输出**：

```xml
<downstream_consumer>
Your SUMMARY.md is consumed by gsd-roadmapper:

| Section | How Roadmapper Uses It |
|---------|------------------------|
| Executive Summary | Quick understanding |
| Key Findings | Tech decisions |
| Implications | Phase structure |
</downstream_consumer>
```

**原因**：确保输出格式符合下游需求。

### 4. 偏差处理规则

**Executor 有明确的偏差处理规则**：

```xml
<deviation_rules>
**RULE 1: Auto-fix bugs** (no permission needed)
**RULE 2: Auto-add missing critical functionality** (no permission needed)
**RULE 3: Auto-fix blocking issues** (no permission needed)
**RULE 4: Ask about architectural changes** (requires permission)
**RULE 5: Ask about new features** (requires permission)
</deviation_rules>
```

**设计哲学**：小问题自动修复，大问题必须询问。

### 5. 目标向后验证

**Verifier 不检查"任务是否完成"，而是检查"目标是否达成"**：

```xml
<core_principle>
**Task completion ≠ Goal achievement**

A task "create chat component" can be marked complete when the component
is a placeholder. The task was done, but the goal "working chat interface"
was not achieved.

Goal-backward verification:
1. What must be TRUE for the goal?
2. What must EXIST for those truths?
3. What must be WIRED for those artifacts?
</core_principle>
```

---

## Agent 协作流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│  /gsd:new-project（编排器）                                              │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐                            │
│  │ gsd-project-     │  │ gsd-project-     │                            │
│  │ researcher       │  │ researcher       │  (4个并行)                  │
│  │ (STACK)          │  │ (FEATURES)       │                            │
│  └────────┬─────────┘  └────────┬─────────┘                            │
│           │                     │                                       │
│           └──────────┬──────────┘                                       │
│                      ▼                                                  │
│           ┌──────────────────┐                                          │
│           │ gsd-research-    │                                          │
│           │ synthesizer      │                                          │
│           └────────┬─────────┘                                          │
│                    ▼                                                    │
│           ┌──────────────────┐                                          │
│           │ gsd-roadmapper   │                                          │
│           └────────┬─────────┘                                          │
│                    ▼                                                    │
│           ROADMAP.md                                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  /gsd:plan-phase（编排器）                                               │
│                                                                         │
│  ┌──────────────────┐                                                  │
│  │ gsd-phase-       │  (可选)                                           │
│  │ researcher       │                                                  │
│  └────────┬─────────┘                                                  │
│           ▼                                                             │
│  ┌──────────────────┐                                                  │
│  │ gsd-planner      │                                                  │
│  └────────┬─────────┘                                                  │
│           ▼                                                             │
│  ┌──────────────────┐                                                  │
│  │ gsd-plan-checker │  (验证计划质量)                                   │
│  └────────┬─────────┘                                                  │
│           ▼                                                             │
│           PLAN.md                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  /gsd:execute-phase（编排器）                                            │
│                                                                         │
│  ┌──────────────────┐                                                  │
│  │ gsd-executor     │                                                  │
│  └────────┬─────────┘                                                  │
│           ▼                                                             │
│  ┌──────────────────┐                                                  │
│  │ gsd-verifier     │  (验证目标达成)                                   │
│  └────────┬─────────┘                                                  │
│           ▼                                                             │
│  ┌──────────────────┐                                                  │
│  │ gsd-integration- │  (验证跨阶段集成)                                 │
│  │ checker          │                                                  │
│  └────────┬─────────┘                                                  │
│           ▼                                                             │
│  ┌──────────────────┐                                                  │
│  │ gsd-nyquist-     │  (验证测试覆盖率)                                 │
│  │ auditor          │                                                  │
│  └────────┬─────────┘                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 工具权限设计

| Agent | 工具权限 | 原因 |
|-------|----------|------|
| **planner** | Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__* | 需要研究和写入计划 |
| **executor** | Read, Write, Edit, Bash, Grep, Glob | 需要修改代码和执行命令 |
| **verifier** | Read, Write, Bash, Grep, Glob | 只读验证 + 写报告 |
| **researcher** | Read, Write, Bash, Grep, Glob, WebSearch, WebFetch, mcp__context7__* | 需要网络搜索 |

**设计原则**：最小权限原则，只给必要的工具。

---

## 设计亮点总结

| 设计点 | 说明 |
|--------|------|
| **前缀隔离** | 所有 agent 使用 `gsd-` 前缀 |
| **强制初始读取** | 确保有足够上下文 |
| **下游消费者声明** | 明确输出给谁用 |
| **偏差处理规则** | 小问题自动修复，大问题询问 |
| **目标向后验证** | 检查目标达成，而非任务完成 |
| **最小权限** | 只给必要的工具 |
| **轻量级索引** | 避免上下文爆炸 |

---

## 可复用到 jacky-skills 的设计

### Agent 模板

```markdown
---
name: jacky-{功能名}
description: {一句话描述}
tools: Read, Write, Edit, Bash
color: cyan
skills:
  - jacky-{功能名}-workflow
---

<role>
你是 jacky-{功能名} agent。被 /jacky:{命令} 调用。
核心职责：{职责描述}

**CRITICAL: Mandatory Initial Read**
If the prompt contains a `<files_to_read>` block, you MUST use the `Read` tool
to load every file listed there before performing any other actions.
</role>

<project_context>
Before {执行}, discover project context:
**Project instructions:** Read `./CLAUDE.md` if it exists.
</project_context>

<execution_flow>
<step name="step1">...</step>
</execution_flow>

<output_spec>
{输出格式}
</output_spec>
```

---

## 相关笔记

- [Install 设计](./install-design.md)
- [Skills vs Commands](../reusable-designs/skills-vs-commands.md)
