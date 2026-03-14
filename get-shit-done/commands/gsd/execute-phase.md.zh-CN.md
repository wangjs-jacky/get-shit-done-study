---
name: gsd:execute-phase
description: 使用基于波的并行化执行阶段中的所有计划
argument-hint: "<阶段号> [--仅缺隙]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---

<objective>
使用基于波的并行执行执行阶段中的所有计划。

协调器保持精简：发现计划、分析依赖、分组到波次、生成子代理、收集结果。每个子代理加载完整的执行计划上下文并处理自己的计划。

上下文预算：~15% 协调器，每个子代理 100% 新鲜。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
阶段：$ARGUMENTS

**标志：**
- `--gaps-only` —— 仅执行缺隙封闭计划（frontmatter 中有 `gap_closure: true` 的计划）。在 verify-work 创建修复计划后使用。

上下文文件在工作流程内通过 `gsd-tools init execute-phase` 和每个子代理的 `<files_to_read>` 块解析。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/execute-phase.md 端到端执行 execute-phase 工作流程。
保留所有工作流程门控（波次执行、检查点处理、验证、状态更新、路由）。
</process>