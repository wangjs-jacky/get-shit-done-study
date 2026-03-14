---
name: gsd:insert-phase
description: 将紧急工作插入为十进制阶段（例如 72.1），位于现有阶段之间
argument-hint: <after> <description>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
在里程碑执行期间发现的紧急工作插入一个十进制阶段，这些工作必须在现有的整数阶段之间完成。

使用十进制编号（72.1、72.2 等）来保留计划阶段的逻辑顺序，同时适应紧急插入的需求。

目的：处理在执行期间发现的紧急工作，而无需重新编号整个路线图。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/insert-phase.md
</execution_context>

<context>
参数: $ARGUMENTS（格式：<after-phase-number> <description>）

路线图和状态通过 `init phase-op` 和目标工具调用在工作流内部解析。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/insert-phase.md 端到端地执行 insert-phase 工作流。
保留所有验证门（参数解析、阶段验证、十进制计算、路线图更新）。
</process>