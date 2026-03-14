---
name: gsd:health
description: 诊断规划目录健康状态，并可选择修复问题
argument-hint: [--repair]
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---

<objective>
验证 `.planning/` 目录的完整性并报告可操作的问题。检查缺失的文件、无效的配置、不一致的状态和孤立的计划。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/health.md
</execution_context>

<process>
从 @~/.claude/get-shit-done/workflows/health.md 端到端地执行 health 工作流。
从参数解析 --repair 标志并将其传递给工作流。
</process>