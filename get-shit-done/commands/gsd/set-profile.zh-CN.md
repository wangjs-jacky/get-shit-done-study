---
name: gsd:set-profile
description: 切换 GSD 智能体的模型配置文件（质量/平衡/预算）
argument-hint: <profile>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
切换 GSD 智能体使用的模型配置文件。控制每个智能体使用哪个 Claude 模型，平衡质量与代币消耗。

路由到 set-profile 工作流，该工作流处理：
- 参数验证（质量/平衡/预算）
- 如果缺失则创建配置文件
- 在 config.json 中更新配置文件
- 带有模型表格显示的确认
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/set-profile.md
</execution_context>

<process>
**遵循来自 `@~/.claude/get-shit-done/workflows/set-profile.md` 的 set-profile 工作流**。

该工作流处理所有逻辑，包括：
1. 配置文件参数验证
2. 确保配置文件存在
3. 读取和更新配置
4. 从 MODEL_PROFILES 生成模型表格
5. 显示确认信息
</process>