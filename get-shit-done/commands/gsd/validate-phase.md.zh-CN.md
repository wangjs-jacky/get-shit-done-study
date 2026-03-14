---
name: gsd:validate-phase
description: 对已完成阶段进行 Nyquist 验证审计并填补验证差距
argument-hint: "[阶段编号]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
对已完成阶段的 Nyquist 验证覆盖范围进行审计。三种状态：
- (A) VALIDATION.md 存在 — 审计并填补差距
- (B) 没有 VALIDATION.md，但有 SUMMARY.md — 从工件重建
- (C) 阶段未执行 — 指导下退出

输出：更新的 VALIDATION.md + 生成的测试文件。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/validate-phase.md
</execution_context>

<context>
阶段: $ARGUMENTS — 可选，默认为最近完成的阶段。
</context>

<process>
执行 @~/.claude/get-shit-done/workflows/validate-phase.md。
保留所有工作流门。
</process>