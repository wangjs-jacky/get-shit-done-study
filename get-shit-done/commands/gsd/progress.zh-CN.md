---
name: gsd:progress
description: 检查项目进度，显示上下文，并路由到下一个操作（执行或计划）
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - SlashCommand
---
<objective>
检查项目进度，总结近期工作和未来计划，然后智能路由到下一个操作 — 要么执行现有计划，要么创建下一个计划。

在继续工作前提供情况感知能力。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/progress.md
</execution_context>

<process>
从 @~/.claude/get-shit-done/workflows/progress.md 端到端执行 progress 工作流。
保留所有路由逻辑（路由 A 到 F）和边缘情况处理。
</process>