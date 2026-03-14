---
name: gsd:new-milestone
description: 启动新的里程碑周期 — 更新 PROJECT.md 并路由到需求分析
argument-hint: "[里程碑名称，例如 'v1.1 通知功能']"
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
启动新的里程碑：提问 → 研究（可选）→ 需求分析 → 路线图。

new-project 的棕地开发版本。项目已存在，PROJECT.md 有历史记录。收集"下一步做什么"，更新 PROJECT.md，然后运行需求分析 → 路线图周期。

**创建/更新：**
- `.planning/PROJECT.md` — 用新的里程碑目标更新
- `.planning/research/` — 领域研究（可选，仅限新功能）
- `.planning/REQUIREMENTS.md` — 本次里程碑的范围需求
- `.planning/ROADMAP.md` — 阶段结构（继续编号）
- `.planning/STATE.md` — 重置为新的里程碑状态

**之后：** `/gsd:plan-phase [N]` 开始执行。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/new-milestone.md
@~/.claude/get-shit-done/references/questioning.md
@~/.claude/get-shit-done/references/ui-brand.md
@~/.claude/get-shit-done/templates/project.md
@~/.claude/get-shit-done/templates/requirements.md
</execution_context>

<context>
里程碑名称：$ARGUMENTS（可选 - 未提供时会提示）

项目和里程碑上下文文件在工作流（`init new-milestone`）内部解析，并通过 `<files_to_read>` 块委托给子代理，子代理使用时通过这些块传递。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/new-milestone.md 端到端执行 new-milestone 工作流。
保留所有工作流关卡（验证、提问、研究、需求、路线图批准、提交）。
</process>