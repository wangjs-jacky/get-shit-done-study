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
通过多问题提示符交互式配置 GSD 工作流智能体和模型配置文件。

路由到 settings 工作流，它处理：
- 确保配置文件存在
- 读取和解析当前设置
- 交互式 5 个问题提示符（模型、研究、计划检查、验证器、分支）
- 配置合并和写入
- 显示带有快速命令引用的确认信息
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/settings.md
</execution_context>

<process>
**遵循 settings 工作流** 来自 `@~/.claude/get-shit-done/workflows/settings.md`。

该工作流处理所有逻辑，包括：
1. 如果缺失则用默认值创建配置文件
2. 读取当前配置
3. 使用预选择显示交互式设置
4. 答案解析和配置合并
5. 文件写入
6. 确认信息显示
</process>