---
name: gsd:check-todos
description: 列出待处理的待办事项并选择一个进行处理
argument-hint: [区域过滤]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
列出所有待处理的待办事项，允许选择，加载选定待办事项的完整上下文，并路由到适当操作。

路由到 check-todos 工作流，该工作流处理：
- 待办事项计数和列表，带有区域过滤
- 带有完整上下文加载的交互式选择
- 路线图相关性检查
- 操作路由（现在工作、添加到阶段、头脑风暴、创建阶段）
- STATE.md 更新和 Git 提交
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/check-todos.md
</execution_context>

<context>
参数: $ARGUMENTS（可选区域过滤）

待办事项状态和路线图相关性在工作流内使用 `init todos` 和目标读取加载。
</context>

<process>
**遵循 check-todos 工作流**来自 `@~/.claude/get-shit-done/workflows/check-todos.md`。

工作流处理所有逻辑，包括：
1. 待办事项存在性检查
2. 区域过滤
3. 交互式列表和选择
4. 带有文件摘要的完整上下文加载
5. 路线图相关性检查
6. 操作提供和执行
7. STATE.md 更新
8. Git 提交
</process>