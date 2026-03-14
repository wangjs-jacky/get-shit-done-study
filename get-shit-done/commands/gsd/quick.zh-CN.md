---
name: gsd:quick
description: 执行快速任务，提供 GSD 保证（原子提交、状态跟踪），但跳过可选代理
argument-hint: "[--full] [--discuss]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
执行小型、临时任务，提供 GSD 保证（原子提交、STATE.md 跟踪）。

快速模式是相同系统的简化路径：
- 生成 gsd-planner（快速模式）+ gsd-executor(s)
- 快速任务独立存在于 `.planning/quick/` 中，与规划阶段分离
- 更新 STATE.md"已完成的快速任务"表格（而非 ROADMAP.md）

**默认：** 跳过研究、讨论、计划检查器、验证器。当您确切知道要做什么时使用。

**`--discuss` 标志：** 在计划前进行轻量级讨论阶段。突出显示假设，明确模糊领域，在 CONTEXT.md 中记录决策。当任务有值得预先解决的模糊性时使用。

**`--full` 标志：** 启用计划检查（最多 2 次迭代）和执行后验证。当您想要质量保证但不需要完整的里程碑仪式时使用。

标志可组合：`--discuss --full` 提供讨论 + 计划检查 + 验证。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/quick.md
</execution_context>

<context>
$ARGUMENTS

上下文文件在工作流（`init quick`）内部解析，并通过 `<files_to_read>` 块委托。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/quick.md 端到端执行 quick 工作流。
保留所有工作流关卡（验证、任务描述、计划、执行、状态更新、提交）。
</process>