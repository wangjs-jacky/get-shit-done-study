---
name: gsd:validate-phase
description: 对已完成阶段进行审计，填补 Nyquist 验证空白
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
审计已完成阶段的 Nyquist 验证覆盖率。有三种状态：
- (A) VALIDATION.md 存在 — 审计并填补空白
- (B) 没有 VALIDATION.md，但 SUMMARY.md 存在 — 从产物重建验证
- (C) 阶段未执行 — 退出并提供建议

输出：更新的 VALIDATION.md + 生成的测试文件。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/validate-phase.md
</execution_context>

<context>
Phase: $ARGUMENTS — 可选，默认为最后一个已完成阶段。
</context>

<process>
执行 @~/.claude/get-shit-done/workflows/validate-phase.md。
保留所有工作流门控。
</process>