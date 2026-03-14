---
name: gsd:help
description: 显示可用的 GSD 命令和使用指南
---
<objective>
显示完整的 GSD 命令参考。

仅输出下面的参考内容。不要添加：
- 项目特定的分析
- Git 状态或文件上下文
- 下一步建议
- 参考内容之外的任何注释
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/help.md
</execution_context>

<process>
从 @~/.claude/get-shit-done/workflows/help.md 输出完整的 GSD 命令参考。
直接显示参考内容 - 无添加或修改。
</process>