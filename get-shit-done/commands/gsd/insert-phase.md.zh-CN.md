---
name: gsd:insert-phase
description: 将紧急工作作为小数阶段插入（例如，72.1）在现有阶段之间
argument-hint: <在之后> <描述>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
插入一个小数阶段，用于里程碑中期发现的紧急工作，这些工作必须在现有的整数阶段之间完成。

使用十进制编号（72.1、72.2 等）来保留计划阶段的逻辑顺序，同时允许紧急插入。

目的：处理在执行过程中发现的紧急工作，而无需重新编号整个路线图。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/insert-phase.md
</execution_context>

<context>
参数：$ARGUMENTS（格式：<阶段号后> <描述>）

路线图和状态在工作流程内通过 `init phase-op` 和目标工具调用解析。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/insert-phase.md 端到端执行 insert-phase 工作流程。
保留所有验证门控（参数解析、阶段验证、十进制计算、路线图更新）。
</process>