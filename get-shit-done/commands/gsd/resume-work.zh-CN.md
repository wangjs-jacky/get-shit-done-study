---
name: gsd:resume-work
description: 从上一会话恢复工作，完整上下文恢复
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
  - SlashCommand
---

<objective>
恢复完整项目上下文，无缝地从上一会话恢复工作。

路由到 resume-project 工作流，该工作流处理：

- STATE.md 加载（如果缺失则重建）
- 检查点检测（.continue-here 文件）
- 未完成工作检测（PLAN 没有 SUMMARY）
- 状态展示
- 上下文感知的下一步操作路由
  </objective>

<execution_context>
@~/.claude/get-shit-done/workflows/resume-project.md
</execution_context>

<process>
**遵循来自 `@~/.claude/get-shit-done/workflows/resume-project.md` 的 resume-project 工作流**。

该工作流处理所有恢复逻辑，包括：

1. 项目存在性验证
2. STATE.md 加载或重建
3. 检查点和未完成工作检测
4. 视觉状态展示
5. 上下文感知的选项提供（在建议规划 vs 讨论前检查 CONTEXT.md）
6. 路由到适当的下一个命令
7. 会话连续性更新
   </process>