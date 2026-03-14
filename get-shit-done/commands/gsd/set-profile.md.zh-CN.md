---
name: gsd:set-profile
description: 切换 GSD 智能体的模型配置文件（quality/balanced/budget）
argument-hint: <配置文件>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
切换 GSD 智能体使用的模型配置文件。控制每个智能体使用哪个 Claude 模型，平衡质量与 token 消耗。

路由到 set-profile 工作流，它处理：
- 参数验证（quality/balanced/budget）
- 如果缺失则创建配置文件
- 在 config.json 中更新配置文件
- 显示带模型表格的确认信息
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/set-profile.md
</execution_context>

<process>
**遵循 set-profile 工作流** 来自 `@~/.claude/get-shit-done/workflows/set-profile.md`。

该工作流处理所有逻辑，包括：
1. 配置文件参数验证
2. 确保配置文件存在
3. 配置文件读取和更新
4. 从 MODEL_PROFILES 生成模型表格
5. 确认信息显示
</process>