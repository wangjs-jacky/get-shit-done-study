---
name: gsd:resume-work
description: 从上一个会话恢复工作并完全恢复上下文
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
  - SlashCommand
---

<objective>
完全恢复项目上下文并从上一个会话无缝地恢复工作。

路由到 resume-project 工作流，它处理：

- STATE.md 加载（如果缺失则重建）
- 检查点检测（.continue-here 文件）
- 未完成工作检测（PLAN 没有 SUMMARY）
- 状态展示
- 上下文感知的下一步路由
  </objective>

<execution_context>
@~/.claude/get-shit-done/workflows/resume-project.md
</execution_context>

<process>
**遵循 resume-project 工作流** 来自 `@~/.claude/get-shit-done/workflows/resume-project.md`。

该工作流处理所有恢复逻辑，包括：

1. 项目存在性验证
2. STATE.md 加载或重建
3. 检查点和未完成工作检测
4. 可视化状态展示
5. 上下文感知选项提供（在建议计划 vs 讨论之前检查 CONTEXT.md）
6. 路由到适当的下一个命令
7. 会话连续性更新
   </process>