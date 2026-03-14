---
name: gsd:debug
description: 系统化调试，在上下文重置后保持持久状态
argument-hint: [问题描述]
allowed-tools:
  - Read
  - Bash
  - Task
  - AskUserQuestion
---

<objective>
使用科学方法和子代理隔离来调试问题。

**编排器角色：** 收集症状，生成 gsd-debugger 代理，处理检查点，生成继续。

**为什么使用子代理：** 调查会快速消耗上下文（读取文件、形成假设、测试）。每次调查都有 200k 的全新上下文。主上下文保持精简以便用户交互。
</objective>

<context>
用户的问题：$ARGUMENTS

检查活跃会话：
```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved | head -5
```
</context>

<process>

## 0. 初始化上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取 `commit_docs`。解析调试器模型：
```bash
debugger_model=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-debugger --raw)
```

## 1. 检查活跃会话

如果存在活跃会话且没有 $ARGUMENTS：
- 列出带状态、假设、下一步操作的会话
- 用户选择数字继续或描述新问题

如果提供了 $ARGUMENTS 或用户描述新问题：
- 继续收集症状

## 2. 收集症状（如果是新问题）

对每个使用 AskUserQuestion：

1. **预期行为** - 应该发生什么？
2. **实际行为** - 实际发生了什么？
3. **错误消息** - 有任何错误吗？（粘贴或描述）
4. **时间线** - 这是何时开始的？曾经工作过吗？
5. **复现** - 如何触发它？

收集完毕后，确认准备好进行调查。

## 3. 生成 gsd-debugger 代理

填充提示并生成：

```markdown
<objective>
调查问题：{slug}

**摘要：** {trigger}
</objective>

<symptoms>
expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: true
goal: find_and_fix
</mode>

<debug_file>
创建：.planning/debug/{slug}.md
</debug_file>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-debugger",
  model="{debugger_model}",
  description="Debug {slug}"
)
```

## 4. 处理代理返回

**如果找到 `## ROOT CAUSE`：**
- 显示根本原因和证据摘要
- 提供选项：
  - "现在修复" - 生成修复子代理
  - "计划修复" - 建议 /gsd:plan-phase --gaps
  - "手动修复" - 完成

**如果到达 `## CHECKPOINT REACHED`：**
- 向用户展示检查点详情
- 获取用户响应
- 如果检查点类型是 `human-verify`：
  - 如果用户确认已修复：继续让代理完成/解决/归档
  - 如果用户报告问题：继续让代理返回调查/修复
- 生成继续代理（见第 5 步）

**如果调查无结论 `## INVESTIGATION INCONCLUSIVE`：**
- 显示检查和排除的内容
- 提供选项：
  - "继续调查" - 生成带有额外上下文的新代理
  - "手动调查" - 完成
  - "添加更多上下文" - 收集更多症状，再次生成

## 5. 生成继续代理（在检查点后）

当用户响应检查点时，生成新代理：

```markdown
<objective>
继续调试 {slug}。证据在调试文件中。
</objective>

<prior_state>
<files_to_read>
- .planning/debug/{slug}.md（调试会话状态）
</files_to_read>
</prior_state>

<checkpoint_response>
**类型：** {checkpoint_type}
**响应：** {user_response}
</checkpoint_response>

<mode>
goal: find_and_fix
</mode>
```

```
Task(
  prompt=continuation_prompt,
  subagent_type="gsd-debugger",
  model="{debugger_model}",
  description="Continue debug {slug}"
)
```

</process>

<success_criteria>
- [ ] 检查活跃会话
- [ ] 收集症状（如果是新的）
- [ ] 使用上下文生成 gsd-debugger
- [ ] 正确处理检查点
- [ ] 修复前确认根本原因
</success_criteria>