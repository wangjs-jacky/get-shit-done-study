---
name: gsd:health
description: 诊断规划目录健康状况并可选地修复问题
argument-hint: [--修复]
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---

<objective>
验证 `.planning/` 目录完整性并报告可操作的问题。检查缺失文件、无效配置、不一致状态和孤立计划。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/health.md
</execution_context>

<process>
从 @~/.claude/get-shit-done/workflows/health.md 端到端执行健康工作流程。
从参数解析 --repair 标志并传递给工作流程。
</process>