<purpose>
使用 GSD 保证执行小型、临时任务（原子提交、STATE.md 跟踪）。快速模式生成 gsd-planner（快速模式）+ gsd-executor(s)，在 `.planning/quick/` 中跟踪任务，并更新 STATE.md 的 "Quick Tasks Completed" 表。

使用 `--discuss` 标志：在规划前进行轻量级讨论阶段。揭示假设、明确灰色区域、在 CONTEXT.md 中捕获决策，以便规划器将其视为锁定。

使用 `--full` 标志：启用计划检查（最多 2 次迭代）和执行后验证，提供质量保证而无需完整的里程碑仪式。

标志可组合：`--discuss --full` 提供讨论 + 计划检查 + 验证。
</purpose>

<required_reading>
开始前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>
**步骤 1：解析参数并获取任务描述**

解析 `$ARGUMENTS`：
- `--full` 标志 → 存储为 `$FULL_MODE`（true/false）
- `--discuss` 标志 → 存储为 `$DISCUSS_MODE`（true/false）
- 剩余文本 → 如果非空则用作 `$DESCRIPTION`

如果解析后 `$DESCRIPTION` 为空，与用户交互式提示：

```
AskUserQuestion(
  header: "Quick Task",
  question: "您想要做什么？",
  followUp: null
)
```

将响应存储为 `$DESCRIPTION`。

如果仍然为空，重新提示："请提供任务描述。"

根据活动标志显示横幅：

如果 `$DISCUSS_MODE` 和 `$FULL_MODE`：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 快速任务（讨论 + 完整模式）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 讨论 + 计划检查 + 验证已启用
```

如果仅为 `$DISCUSS_MODE`：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 快速任务（讨论模式）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 讨论阶段已启用 — 规划前揭示灰色区域
```

如果仅为 `$FULL_MODE`：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 快速任务（完整模式）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 计划检查 + 验证已启用
```

---

**步骤 2：初始化**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init quick "$DESCRIPTION")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析 JSON 为：`planner_model`，`executor_model`，`checker_model`，`verifier_model`，`commit_docs`，`quick_id`，`slug`，`date`，`timestamp`，`quick_dir`，`task_dir`，`roadmap_exists`，`planning_exists`。

**如果 `roadmap_exists` 为 false：** 错误 — 快速模式需要具有 ROADMAP.md 的活跃项目。先运行 `/gsd:new-project`。

快速任务可以在阶段中间运行 — 验证仅检查 ROADMAP.md 存在，不检查阶段状态。

---

**步骤 3：创建任务目录**

```bash
mkdir -p "${task_dir}"
```

---

**步骤 4：创建快速任务目录**

为此快速任务创建目录：

```bash
QUICK_DIR=".planning/quick/${quick_id}-${slug}"
mkdir -p "$QUICK_DIR"
```

向用户报告：
```
创建快速任务 ${quick_id}: ${DESCRIPTION}
目录：${QUICK_DIR}
```

存储 `$QUICK_DIR` 用于编排。

---

**步骤 4.5：讨论阶段（仅当 `$DISCUSS_MODE` 时）**

如果 NOT `$DISCUSS_MODE`，完全跳过此步骤。

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 讨论快速任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 为 ${DESCRIPTION} 揭示灰色区域
```

**4.5a. 识别灰色区域**

分析 `$DESCRIPTION` 以识别 2-4 个灰色区域 — 实施决策会影响结果，用户应该权衡的决策。

使用领域感知启发式生成阶段特定的（非通用）灰色区域：
- 用户 **SEE** 的东西 → 布局、密度、交互、状态
- 用户 **CALL** 的东西 → 响应、错误、认证、版本控制
- 用户 **RUN** 的东西 → 输出格式、标志、模式、错误处理
- 用户 **READ** 的东西 → 结构、语调、深度、流程
- 正在 **组织** 的东西 → 标准、分组、命名、例外

每个灰色区域应该是具体的决策点，而不是模糊的类别。示例："加载行为" 而不是 "UX"。

**4.5b. 呈现灰色区域**

```
AskUserQuestion(
  header: "Gray Areas",
  question: "哪些区域需要在规划前澄清？",
  options: [
    { label: "${area_1}", description: "${why_it_matters_1}" },
    { label: "${area_2}", description: "${why_it_matters_2}" },
    { label: "${area_3}", description: "${why_it_matters_3}" },
    { label: "All clear", description: "跳过讨论 — 我知道我想要什么" }
  ],
  multiSelect: true
)
```

如果用户选择 "All clear" → 跳到步骤 5（不写入 CONTEXT.md）。

**4.5c. 讨论选定的区域**

对每个选定的区域，通过 AskUserQuestion 询问 1-2 个专注问题：

```
AskUserQuestion(
  header: "${area_name}",
  question: "${specific_question_about_this_area}",
  options: [
    { label: "${concrete_choice_1}", description: "${what_this_means}" },
    { label: "${concrete_choice_2}", description: "${what_this_means}" },
    { label: "${concrete_choice_3}", description: "${what_this_means}" },
    { label: "You decide", description: "Claude's discretion" }
  ],
  multiSelect: false
)
```

规则：
- 选项必须是具体的选择，而不是抽象类别
- 在您有明确意见时突出推荐选择
- 如果用户选择自由文本的 "Other"，切换到纯文本后续问题（遵循 questioning.md 自由格式规则）
- 如果用户选择 "You decide"，在 CONTEXT.md 中捕获为 Claude's Discretion
- 每个区域最多 2 个问题 — 这是轻量级，不是深度挖掘

将所有决策收集到 `$DECISIONS` 中。

**4.5d. 写入 CONTEXT.md**

使用标准的上下文模板结构编写 `${QUICK_DIR}/${quick_id}-CONTEXT.md`：

```markdown
# 快速任务 ${quick_id}: ${DESCRIPTION} - 上下文

**收集:** ${date}
**状态:** 准备规划

<domain>
## 任务边界

${DESCRIPTION}

</domain>

<decisions>
## 实施决策

### ${area_1_name}
- ${decision_from_discussion}

### ${area_2_name}
- ${decision_from_discussion}

### Claude's Discretion
${areas_where_user_said_you_decide_or_areas_not_discussed}

</decisions>

<specifics>
## 具体想法

${any_specific_references_or_examples_from_discussion}

[如果没有："无具体需求 — 对标准方法持开放态度"]

</specifics>

<canonical_refs>
## 规范引用

${any_specs_adrs_or_docs_referenced_during_discussion}

[如果没有："无外部规范 — 需求完全在上面的决策中捕获"]

</canonical_refs>
```

注意：快速任务 CONTEXT.md 省略 `<code_context>` 和 `<deferred>` 部分（无代码库侦察，无阶段范围可推迟）。保持精简。当外部文档在讨论中被引用时包含 `<canonical_refs>` 部分 — 仅当没有外部文档适用时才省略。

报告：`Context captured: ${QUICK_DIR}/${quick_id}-CONTEXT.md`

---

**步骤 5：生成规划器（快速模式）**

**如果 `$FULL_MODE`：** 使用 `quick-full` 模式和更严格的约束。

**如果 NOT `$FULL_MODE`：** 使用标准 `quick` 模式。

```
Task(
  prompt="
<planning_context>

**Mode:** ${FULL_MODE ? 'quick-full' : 'quick'}
**Directory:** ${QUICK_DIR}
**Description:** ${DESCRIPTION}

<files_to_read>
- .planning/STATE.md (Project State)
- ./CLAUDE.md (if exists — follow project-specific guidelines)
${DISCUSS_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md (User decisions — locked, do not revisit)' : ''}
</files_to_read>

**Project skills:** Check .claude/skills/ or .agents/skills/ directory (if either exists) — read SKILL.md files, plans should account for project skill rules

</planning_context>

<constraints>
- Create a SINGLE plan with 1-3 focused tasks
- Quick tasks should be atomic and self-contained
- No research phase
${FULL_MODE ? '- Target ~40% context usage (structured for verification)' : '- Target ~30% context usage (simple, focused)'}
${FULL_MODE ? '- MUST generate `must_haves` in plan frontmatter (truths, artifacts, key_links)' : ''}
${FULL_MODE ? '- Each task MUST have `files`, `action`, `verify`, `done` fields' : ''}
</constraints>

<output>
Write plan to: ${QUICK_DIR}/${quick_id}-PLAN.md
Return: ## PLANNING COMPLETE with plan path
</output>
",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Quick plan: ${DESCRIPTION}"
)
```

规划器返回后：
1. 验证计划存在于 `${QUICK_DIR}/${quick_id}-PLAN.md`
2. 提取计划计数（快速任务通常为 1）
3. 报告："Plan created: ${QUICK_DIR}/${quick_id}-PLAN.md"

如果找不到计划，错误："Planner failed to create ${quick_id}-PLAN.md"

---

**步骤 5.5：计划检查器循环（仅当 `$FULL_MODE` 时）**

如果 NOT `$FULL_MODE`，完全跳过此步骤。

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 检查计划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成计划检查器...
```

检查器提示：

```markdown
<verification_context>
**Mode:** quick-full
**Task Description:** ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan to verify)
</files_to_read>

**Scope:** This is a quick task, not a full phase. Skip checks that require a ROADMAP phase goal.
</verification_context>

<check_dimensions>
- Requirement coverage: Does the plan address the task description?
- Task completeness: Do tasks have files, action, verify, done fields?
- Key links: Are referenced files real?
- Scope sanity: Is this appropriately sized for a quick task (1-3 tasks)?
- must_haves derivation: Are must_haves traceable to the task description?

Skip: cross-plan deps (single plan), ROADMAP alignment
${DISCUSS_MODE ? '- Context compliance: Does the plan honor locked decisions from CONTEXT.md?' : '- Skip: context compliance (no CONTEXT.md)'}
</check_dimensions>

<expected_output>
- ## VERIFICATION PASSED — all checks pass
- ## ISSUES FOUND — structured issue list
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="Check quick plan: ${DESCRIPTION}"
)
```

**处理检查器返回：**

- **`## VERIFICATION PASSED`：** 显示确认，继续步骤 6。
- **`## ISSUES FOUND`：** 显示问题，检查迭代计数，进入修订循环。

**修订循环（最多 2 次迭代）：**

跟踪 `iteration_count`（初始计划 + 检查后从 1 开始）。

**如果 iteration_count < 2：**

显示：`Sending back to planner for revision... (iteration ${N}/2)`

修订提示：

```markdown
<revision_context>
**Mode:** quick-full (revision)

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Existing plan)
</files_to_read>

**Checker issues:** ${structured_issues_from_checker}

</revision_context>

<instructions>
Make targeted updates to address checker issues.
Do NOT replan from scratch unless issues are fundamental.
Return what changed.
</instructions>
```

```
Task(
  prompt=revision_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Revise quick plan: ${DESCRIPTION}"
)
```

规划器返回 → 再次生成检查器，增加 iteration_count。

**如果 iteration_count >= 2：**

显示：`Max iterations reached. ${N} issues remain:` + 问题列表

提供：1) 强制继续，2) 中止

---

**步骤 6：生成执行器**

使用计划引用生成 gsd-executor：

```
Task(
  prompt="
Execute quick task ${quick_id}.

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan)
- .planning/STATE.md (Project state)
- ./CLAUDE.md (Project instructions, if exists)
- .claude/skills/ or .agents/skills/ (Project skills, if either exists — list skills, read SKILL.md for each, follow relevant rules during implementation)
</files_to_read>

<constraints>
- Execute all tasks in the plan
- Commit each task atomically
- Create summary at: ${QUICK_DIR}/${quick_id}-SUMMARY.md
- Do NOT update ROADMAP.md (quick tasks are separate from planned phases)
</constraints>
",
  subagent_type="gsd-executor",
  model="{executor_model}",
  description="Execute: ${DESCRIPTION}"
)
```

执行器返回后：
1. 验证摘要存在于 `${QUICK_DIR}/${quick_id}-SUMMARY.md`
2. 从执行器输出中提取提交哈希
3. 报告完成状态

**已知的 Claude Code 错误（classifyHandoffIfNeeded）：** 如果执行器报告 "failed" 并显示错误 `classifyHandoffIfNeeded is not defined`，这是 Claude Code 运行时错误 — 不是真正的失败。检查摘要文件是否存在以及 git log 是否显示提交。如果是，则视为成功。

如果找不到摘要，错误："Executor failed to create ${quick_id}-SUMMARY.md"

注意：对于产生多个计划的快速任务（罕见），按照 execute-phase 模式每波并行生成执行器。

---

**步骤 6.5：验证（仅当 `$FULL_MODE` 时）**

如果 NOT `$FULL_MODE`，完全跳过此步骤。

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 验证结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━═════════

◆ 生成验证器...
```

```
Task(
  prompt="Verify quick task goal achievement.
Task directory: ${QUICK_DIR}
Task goal: ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan)
</files_to_read>

Check must_haves against actual codebase. Create VERIFICATION.md at ${QUICK_DIR}/${quick_id}-VERIFICATION.md.",
  subagent_type="gsd-verifier",
  model="{verifier_model}",
  description="Verify: ${DESCRIPTION}"
)
```

读取验证状态：
```bash
grep "^status:" "${QUICK_DIR}/${quick_id}-VERIFICATION.md" | cut -d: -f2 | tr -d ' '
```

存储为 `$VERIFICATION_STATUS`。

| 状态 | 操作 |
|------|------|
| `passed` | 存储 `$VERIFICATION_STATUS = "Verified"`，继续到步骤 7 |
| `human_needed` | 显示需要手动检查的项目，存储 `$VERIFICATION_STATUS = "Needs Review"`，继续 |
| `gaps_found` | 显示差距摘要，提供：1) 重新运行执行器修复差距，2) 按接受原样处理。存储 `$VERIFICATION_STATUS = "Gaps"` |

---

**步骤 7：更新 STATE.md**

用快速任务完成记录更新 STATE.md。

**7a. 检查是否存在 "Quick Tasks Completed" 部分：**

读取 STATE.md 并检查是否有 `### Quick Tasks Completed` 部分。

**7b. 如果部分不存在，创建它：**

在 `### Blockers/Concerns` 部分后插入：

**如果 `$FULL_MODE`：**
```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
```

**如果 NOT `$FULL_MODE`：**
```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
```

**注意：** 如果表已存在，匹配其现有列格式。如果向已有快速任务但没有 Status 列的项目添加 `--full`，向标题和分隔行添加 Status 列，并为上一行的状态留空。

**7c. 向表中添加新行：**

使用 init 中的 `date`：

**如果 `$FULL_MODE`（或表有 Status 列）：**
```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | ${VERIFICATION_STATUS} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**如果 NOT `$FULL_MODE`（且表没有 Status 列）：**
```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**7d. 更新 "Last activity" 行：**

使用 init 中的 `date`：
```
Last activity: ${date} - Completed quick task ${quick_id}: ${DESCRIPTION}
```

使用 Edit 工具进行原子更改

---

**步骤 8：最终提交和完成**

暂存并提交快速任务工件：

构建文件列表：
- `${QUICK_DIR}/${quick_id}-PLAN.md`
- `${QUICK_DIR}/${quick_id}-SUMMARY.md`
- `.planning/STATE.md`
- 如果 `$DISCUSS_MODE` 且上下文文件存在：`${QUICK_DIR}/${quick_id}-CONTEXT.md`
- 如果 `$FULL_MODE` 且验证文件存在：`${QUICK_DIR}/${quick_id}-VERIFICATION.md`

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(quick-${quick_id}): ${DESCRIPTION}" --files ${file_list}
```

获取最终提交哈希：
```bash
commit_hash=$(git rev-parse --short HEAD)
```

显示完成输出：

**如果 `$FULL_MODE`：**
```
---

GSD > 快速任务完成（完整模式）

快速任务 ${quick_id}: ${DESCRIPTION}

摘要：${QUICK_DIR}/${quick_id}-SUMMARY.md
验证：${QUICK_DIR}/${quick_id}-VERIFICATION.md (${VERIFICATION_STATUS})
提交：${commit_hash}

---

准备下一个任务：/gsd:quick
```

**如果 NOT `$FULL_MODE`：**
```
---

GSD > 快速任务完成

快速任务 ${quick_id}: ${DESCRIPTION}

摘要：${QUICK_DIR}/${quick_id}-SUMMARY.md
提交：${commit_hash}

---

准备下一个任务：/gsd:quick
```

</process>

<success_criteria>
- [ ] ROADMAP.md 验证通过
- [ ] 用户提供任务描述
- [ ] `--full` 和 `--discuss` 标志从参数中正确解析（当存在时）
- [ ] 生成 slug（小写，连字符，最多 40 个字符）
- [ ] 生成快速 ID（YYMMDD-xxx 格式，2s Base36 精度）
- [ ] 在 `.planning/quick/YYMMDD-xxx-slug/` 创建目录
- [ ] （--discuss）灰色区域已识别并呈现，决策记录在 `${quick_id}-CONTEXT.md` 中
- [ ] `${quick_id}-PLAN.md` 由规划器创建（当 --discuss 时遵守 CONTEXT.md 决策）
- [ ] （--full）计划检查器验证计划，修订循环限制在 2 次内
- [ ] `${quick_id}-SUMMARY.md` 由执行器创建
- [ ] （--full）`${quick_id}-VERIFICATION.md` 由验证器创建
- [ ] STATE.md 已更新快速任务行（当 --full 时含 Status 列）
- [ ] 工件已提交
</success_criteria>