---
name: gsd:remove-phase
description: 从路线图中移除一个未来阶段并重新编号后续阶段
argument-hint: <阶段编号>
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---
<objective>
从路线图中移除一个未开始的未来阶段，并重新编号所有后续阶段以保持清洁的线性序列。

目的：清理您决定不再执行的工作，不会因取消/延迟标记而污染上下文。
输出：阶段已删除，所有后续阶段重新编号，git 提交作为历史记录。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/remove-phase.md
</execution_context>

<context>
Phase: $ARGUMENTS

路线图和状态在工作流中通过 `init phase-op` 和目标读取解析。
</context>

<process>
从头到尾执行来自 @~/.claude/get-shit-done/workflows/remove-phase.md 的 remove-phase 工作流。
保留所有验证门控（未来阶段检查、工作检查）、重新编号逻辑和提交。
</process>