---
name: gsd:verify-work
description: 通过对话式用户验收测试验证构建的功能
argument-hint: "[阶段编号，例如 '4']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Edit
  - Write
  - Task
---

<objective>
通过对话式测试验证构建的功能，保持持久状态。

目的：从用户角度确认 Claude 构建的功能确实有效。一次一个测试，纯文本响应，不进行审问。发现问题时自动诊断、计划修复，并为执行做准备。

输出：{phase_num}-UAT.md 追踪所有测试结果。如果发现问题：诊断差距，为 /gsd:execute-phase 准备已验证的修复计划。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/verify-work.md
@~/.claude/get-shit-done/templates/UAT.md
</execution_context>

<context>
阶段: $ARGUMENTS（可选）
- 如果提供：测试特定阶段（例如 "4"）
- 如果不提供：检查活动会话或提示输入阶段

上下文文件在工作流内部解析（`init verify-work`）并通过 `<files_to_read>` 块委托。
</context>

<process>
执行 @~/.claude/get-shit-done/workflows/verify-work.md 工作流的完整流程。
保留所有工作流门（会话管理、测试展示、诊断、修复计划、路由）。
</process>