---
name: gsd:settings
description: 配置 GSD 工作流开关和模型配置文件
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
通过多问题提示对话式配置 GSD 工作流智能体和模型配置文件。

路由到设置工作流，该工作流处理：
- 配置文件存在性确保
- 当前设置读取和解析
- 交互式 5 问题提示（模型、研究、计划检查、验证器、分支）
- 配置合并和写入
- 带有快速命令引用的确认显示
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/settings.md
</execution_context>

<process>
**遵循来自 `@~/.claude/get-shit-done/workflows/settings.md` 的设置工作流**。

该工作流处理所有逻辑，包括：
1. 如果缺失则创建带有默认值的配置文件
2. 读取当前配置
3. 带有预选的交互式设置展示
4. 解析答案和配置合并
5. 文件写入
6. 显示确认信息
</process>