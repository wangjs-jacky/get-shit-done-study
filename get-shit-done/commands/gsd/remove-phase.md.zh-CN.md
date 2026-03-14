---
name: gsd:remove-phase
description: 从路线图移除未来阶段并重新编号后续阶段
argument-hint: <阶段编号>
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---
<objective>
从路线图中移除未开始的后阶段，并重新编号所有后续阶段以保持清晰的线性序列。

目的：清理已决定不做的工作，避免用已取消/推迟的标记污染上下文。
输出：阶段已删除，所有后续阶段重新编号，git 提交作为历史记录。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/remove-phase.md
</execution_context>

<context>
阶段: $ARGUMENTS

路线图和状态通过 `init phase-op` 和定向读取在工作流内解析。
</context>

<process>
执行 @~/.claude/get-shit-done/workflows/remove-phase.md 工作流的完整流程。
保留所有验证门（未来阶段检查、工作检查）、重新编号逻辑和提交。
</process>