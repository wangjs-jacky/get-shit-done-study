---
name: gsd:pause-work
description: 在阶段中期暂停工作时创建上下文交接
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
创建 `.continue-here.md` 交接文件，以在会话间保存完整的工作状态。

路由到 pause-work 工作流，该工作流处理：
- 从最近文件检测当前阶段
- 完整的状态收集（位置、已完成工作、剩余工作、决策、障碍）
- 创建包含所有上下文部分的交接文件
- 作为 WIP 提交到 Git
- 恢复工作说明
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/pause-work.md
</execution_context>

<context>
状态和阶段进度在工作流内部通过目标读取进行收集。
</context>

<process>
**遵循 pause-work 工作流** 来自 `@~/.claude/get-shit-done/workflows/pause-work.md`。

该工作流处理所有逻辑，包括：
1. 阶段目录检测
2. 状态收集和用户澄清
3. 带时间戳的交接文件写入
4. Git 提交
5. 包含恢复说明的确认
</process>