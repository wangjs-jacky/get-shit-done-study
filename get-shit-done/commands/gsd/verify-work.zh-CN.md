---
name: gsd:verify-work
description: 通过对话式用户验收测试验证构建的功能
argument-hint: "[phase number, e.g., '4']"
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
通过具有持久状态的对话式测试验证构建的功能。

目的：从用户角度确认 Claude 构建的确实有效。一次测试一个，纯文本响应，不需要审问。当发现问题时，自动诊断、计划修复，并准备执行。

输出：{phase_num}-UAT.md 跟踪所有测试结果。如果发现问题：已诊断的间隙，已验证的修复计划，准备好供 /gsd:execute-phase 使用。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/verify-work.md
@~/.claude/get-shit-done/templates/UAT.md
</execution_context>

<context>
阶段: $ARGUMENTS（可选）
- 如果提供：测试特定阶段（例如 "4"）
- 如果不提供：检查活动会话或提示输入阶段

上下文文件在工作流内部（`init verify-work`）解析并通过 `<files_to_read>` 块委托。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/verify-work.md 端到端地执行 verify-work 工作流。
保留所有工作流门（会话管理、测试展示、诊断、修复计划、路由）。
</process>