---
name: gsd:audit-milestone
description: 在归档前审核里程碑完成情况以对照原始意图
argument-hint: "[版本]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Task
  - Write
---
<objective>
验证里程碑达到其完成标准。检查需求覆盖、跨阶段集成和端到端流程。

**此命令即是编排器。** 读取现有的 VERIFICATION.md 文件（阶段已在 execute-phase 期间验证），聚合技术债务和延迟的差距，然后为跨阶段接线生成集成检查器。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/audit-milestone.md
</execution_context>

<context>
版本: $ARGUMENTS（可选 — 默认为当前里程碑）

核心规划文件在工作流内解析（`init milestone-op`）并按需加载。

**已完成的工作：**
Glob: .planning/phases/*/*-SUMMARY.md
Glob: .planning/phases/*/*-VERIFICATION.md
</context>

<process>
从 @~/.claude/get-shit-done/workflows/audit-milestone.md 执行 audit-milestone 工作流端到端。
保留所有工作流门控（范围确定、验证读取、集成检查、需求覆盖、路由）。
</process>