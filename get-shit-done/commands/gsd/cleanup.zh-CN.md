---
name: gsd:cleanup
description: 归档已完成里程碑累积的阶段目录
---
<objective>
将已完成里程碑的阶段目录归档到 `.planning/milestones/v{X.Y}-phases/`。

当 `.planning/phases/` 已累积过去里程碑的目录时使用。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/cleanup.md
</execution_context>

<process>
遵循 @~/.claude/get-shit-done/workflows/cleanup.md 的清理工作流。
识别已完成的里程碑，显示预运行摘要，并在确认后归档。
</process>