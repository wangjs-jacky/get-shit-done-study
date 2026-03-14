---
name: gsd:research-phase
description: 研究如何实施一个阶段（独立命令 - 通常使用 /gsd:plan-phase 替代）
argument-hint: "[阶段]"
allowed-tools:
  - Read
  - Bash
  - Task
---

<objective>
研究如何实施一个阶段。启动 gsd-phase-researcher 智能体并提供阶段上下文。

**注意**：这是一个独立的研究命令。对于大多数工作流，请使用 `/gsd:plan-phase`，它会自动集成研究功能。

**在以下情况下使用此命令：**
- 您想进行研究但尚未计划
- 计划完成后想要重新研究
- 需要在决定阶段是否可行之前进行调查

**协调者角色**：解析阶段、验证路线图、检查现有研究、收集上下文、启动研究智能体、展示结果。

**为什么使用智能体**：研究会快速消耗上下文（WebSearch、Context7 查询、源代码验证）。为调查提供全新的 200k 上下文。主上下文保持精简以便用户交互。
</objective>

<context>
阶段编号: $ARGUMENTS（必需）

在第一步标准化阶段输入，然后再进行目录查找。
</context>

<process>

## 0. 初始化上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取：`phase_dir`、`phase_number`、`phase_name`、`phase_found`、`commit_docs`、`has_research`、`state_path`、`requirements_path`、`context_path`、`research_path`。

解析研究模型：
```bash
RESEARCHER_MODEL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-phase-researcher --raw)
```

## 1. 验证阶段

```bash
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${phase_number}")
```

**如果 `found` 为 false**：错误并退出。**如果 `found` 为 true**：从 JSON 中提取 `phase_number`、`phase_name`、`goal`。

## 2. 检查现有研究

```bash
ls .planning/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

**如果存在**：提供选择：1）更新研究，2）查看现有内容，3）跳过。等待响应。

**如果不存在**：继续。

## 3. 收集阶段上下文

使用 INIT 中的路径（不要在协调者上下文中内联文件内容）：
- `requirements_path`
- `context_path`
- `state_path`

提供带有阶段描述和研究者将加载的文件摘要。

## 4. 启动 gsd-phase-researcher 智能体

研究模式：ecosystem（默认）、feasibility、implementation、comparison。

```markdown
<research_type>
阶段研究 — 调查如何良好地实施特定阶段。
</research_type>

<key_insight>
问题不是"我应该使用哪个库？"

问题是："我不知道自己不知道什么？"

对于这个阶段，请发现：
- 什么是标准的架构模式？
- 哪些库构成标准技术栈？
- 人们通常会遇到什么问题？
- 什么是 SOTA（最先进的技术）与 Claude 训练认为的 SOTA？
- 什么不应该手写实现？
</key_insight>

<objective>
研究 {phase_number}: {phase_name} 阶段的实施方法
模式：ecosystem
</objective>

<files_to_read>
- {requirements_path}（需求）
- {context_path}（来自 discuss-phase 的阶段上下文，如果存在）
- {state_path}（之前的项目决策和障碍）
</files_to_read>

<additional_context>
**阶段描述：** {phase_description}
</additional_context>

<downstream_consumer>
您的 RESEARCH.md 将被 `/gsd:plan-phase` 加载，它使用特定部分：
- `## Standard Stack` → 计划使用这些库
- `## Architecture Patterns` → 任务结构遵循这些模式
- `## Don't Hand-Roll` → 任务永远不会为列出的问题构建自定义解决方案
- `## Common Pitfalls` → 验证步骤检查这些问题
- `## Code Examples` → 任务操作参考这些模式

要指导性，而非探索性。"使用 X" 而不是 "考虑 X 或 Y"。
</downstream_consumer>

<quality_gate>
在声明完成之前，验证：
- [ ] 所有领域都经过调查（而不是只调查一些）
- [ ] 否定性声明通过官方文档验证
- [ ] 关键声明有多个来源
- [ ] 置信级别诚实分配
- [ ] 节名称与 plan-phase 期望的相匹配
</quality_gate>

<output>
写入到：.planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}",
  description="Research Phase {phase}"
)
```

## 5. 处理智能体返回

**`## RESEARCH COMPLETE`**：显示摘要，提供选择：计划阶段、深入挖掘、完整审查、完成。

**`## CHECKPOINT REACHED`**：呈现给用户，获取响应，启动延续任务。

**`## RESEARCH INCONCLUSIVE`**：显示已尝试的内容，提供选择：添加上下文、尝试不同模式、手动处理。

## 6. 启动延续智能体

```markdown
<objective>
继续研究 {phase_number}: {phase_name} 阶段
</objective>

<prior_state>
<files_to_read>
- .planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md（现有研究）
</files_to_read>
</prior_state>

<checkpoint_response>
**类型：** {checkpoint_type}
**响应：** {user_response}
</checkpoint_response>
```

```
Task(
  prompt=continuation_prompt,
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}",
  description="Continue research Phase {phase}"
)
```

</process>

<success_criteria>
- [ ] 阶段通过路线图验证
- [ ] 现有研究已检查
- [ ] gsd-phase-researcher 带上下文启动
- [ ] 检查点正确处理
- [ ] 用户了解下一步骤
</success_criteria>