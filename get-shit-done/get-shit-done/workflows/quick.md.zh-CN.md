<purpose>
使用 GSD 保证执行小的临时任务（原子提交、STATE.md 跟踪）。快速模式生成 gsd-planner（快速模式）+ gsd-executor(s)，在 `.planning/quick/` 中跟踪任务，并更新 STATE.md 的"快速任务完成"表格。

使用 `--discuss` 标志：在规划前进行轻量级讨论阶段。揭示假设、阐明灰色区域，在 CONTEXT.md 中捕获决策，以便规划器将它们视为已锁定。

使用 `--full` 标志：启用计划检查（最多 2 次迭代）和执行后验证，无需完整的里程碑仪式。

标志可组合：`--discuss --full` 提供讨论 + 计划检查 + 验证。
</purpose>

<required_reading>
在开始之前，读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>
**步骤 1：解析参数并获取任务描述**

从 $ARGUMENTS 中解析：
- `--full` 标志 → 存储为 `$FULL_MODE` (true/false)
- `--discuss` 标志 → 存储为 `$DISCUSS_MODE` (true/false)
- 剩余文本 → 如果非空则用作 `$DESCRIPTION`

如果 `$DESCRIPTION` 在解析后为空，则交互式提示用户：

```
AskUserQuestion(
  header: "快速任务",
  question: "您想做什么？",
  followUp: null
)
```

将响应存储为 `$DESCRIPTION`。

如果仍然为空，重新提示："请提供任务描述。"

根据活动标志显示横幅：

如果 `$DISCUSS_MODE` 和 `$FULL_MODE`：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 快速任务 (讨论 + 完整模式)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 讨论 + 计划检查 + 验证已启用
```

如果仅 `$DISCUSS_MODE`：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 快速任务 (讨论模式)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 讨论阶段已启用 — 在规划前揭示灰色区域
```

如果仅 `$FULL_MODE`：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 快速任务 (完整模式)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 计划检查 + 验证已启用
```

---

**步骤 2：初始化**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init quick "$DESCRIPTION")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 JSON 中解析：`planner_model`, `executor_model`, `checker_model`, `verifier_model`, `commit_docs`, `quick_id`, `slug`, `date`, `timestamp`, `quick_dir`, `task_dir`, `roadmap_exists`, `planning_exists`.

**如果 `roadmap_exists` 为 false：** 错误 — 快速模式需要存在 ROADMAP.md 的活跃项目。先运行 `/gsd:new-project`。

快速任务可以在阶段中途运行 - 验证仅检查 ROADMAP.md 存在，不检查阶段状态。

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
目录: ${QUICK_DIR}
```

将 `$QUICK_DIR` 存储用于编排。

---

**步骤 4.5：讨论阶段（仅当 `$DISCUSS_MODE`）**

如果 NOT `$DISCUSS_MODE`，则完全跳过此步骤。

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 讨论快速任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 为：${DESCRIPTION} 揭示灰色区域
```

**4.5a. 识别灰色区域**

分析 `$DESCRIPTION` 以识别 2-4 个灰色区域 — 实现决策，这些决策会影响结果，用户应该权衡。

使用领域感知启发式方法生成阶段特定的（非通用的）灰色区域：
- 用户**看到**的内容 → 布局、密度、交互、状态
- 用户**调用**的内容 → 响应、错误、认证、版本控制
- 用户**运行**的内容 → 输出格式、标志、模式、错误处理
- 用户**阅读**的内容 → 结构、语气、深度、流程
- 被**组织**的内容 → 标准、分组、命名、例外

每个灰色区域应该是具体的决策点，而不是模糊的类别。例如："加载行为"而不是"UX"。

**4.5b. 展示灰色区域**

```
AskUserQuestion(
  header: "灰色区域",
  question: "哪些区域需要在规划前明确？",
  options: [
    { label: "${area_1}", description: "${why_it_matters_1}" },
    { label: "${area_2}", description: "${why_it_matters_2}" },
    { label: "${area_3}", description: "${why_it_matters_3}" },
    { label: "都明确", description: "跳过讨论 — 我知道我想要什么" }
  ],
  multiSelect: true
)
```

如果用户选择"都明确" → 跳转到步骤 5（不写入 CONTEXT.md）。

**4.5c. 讨论选定的区域**

对于每个选定的区域，通过 AskUserQuestion 提出 1-2 个聚焦问题：

```
AskUserQuestion(
  header: "${area_name}",
  question: "${specific_question_about_this_area}",
  options: [
    { label: "${concrete_choice_1}", description: "${what_this_means}" },
    { label: "${concrete_choice_2}", description: "${what_this_means}" },
    { label: "${concrete_choice_3}", description: "${what_this_means}" },
    { label: "您决定", description: "Claude 的判断" }
  ],
  multiSelect: false
)
```

规则：
- 选项必须是具体的选择，而不是抽象的类别
- 在您有明确观点的地方突出推荐选择
- 如果用户使用自由文本选择"其他"，切换到普通文本后续问题（根据 questioning.md 自由格式规则）
- 如果用户选择"您决定"，在 CONTEXT.md 中记录为 Claude 的判断
- 每个区域最多 2 个问题 — 这是轻量级的，不是深入研究

将所有决策收集到 `$DECISIONS` 中。

**4.5d. 写入 CONTEXT.md**

使用标准上下文模板结构写入 `${QUICK_DIR}/${quick_id}-CONTEXT.md`：

```markdown
# 快速任务 ${quick_id}: ${DESCRIPTION} - 上下文

**收集：** ${date}
**状态：** 准备规划

<domain>
## 任务边界

${DESCRIPTION}

</domain>

<decisions>
## 实现决策

### ${area_1_name}
- ${来自讨论的决策}

### ${area_2_name}
- ${来自讨论的决策}

### Claude 的判断
${用户说您决定或未讨论的区域}

</decisions>

<specifics>
## 具体想法

${来自讨论的任何具体参考或示例}

[如果无："无具体要求 — 开放给标准方法"]

</specifics>

<canonical_refs>
## 规范参考

${在讨论中引用的任何规范、ADR 或文档}

[如果无："无外部规范 — 需求完全在上述决策中捕获"]

</canonical_refs>
```

注意：快速任务 CONTEXT.md 省略 `<code_context>` 和 `<deferred>` 部分（无代码库侦察，无阶段范围可以推迟）。保持精简。当外部文档被引用时包含 `<canonical_refs>` 部分 — 仅当没有外部文档适用时才省略。

报告：`上下文已捕获：${QUICK_DIR}/${quick_id}-CONTEXT.md`

---

**步骤 5：生成规划器（快速模式）**

**如果 `$FULL_MODE`：** 使用更严格约束的 `quick-full` 模式。

**如果 NOT `$FULL_MODE`：** 使用标准 `quick` 模式。

```
Task(
  prompt="
<planning_context>

**模式：** ${FULL_MODE ? 'quick-full' : 'quick'}
**目录：** ${QUICK_DIR}
**描述：** ${DESCRIPTION}

<files_to_read>
- .planning/STATE.md (项目状态)
- ./CLAUDE.md（如果存在 — 遵循项目特定指南）
${DISCUSS_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md（用户决策 — 已锁定，不要重新访问）' : ''}
</files_to_read>

**项目技能：** 检查 .claude/skills/ 或 .agents/skills/ 目录（如果任一存在）— 读取 SKILL.md 文件，计划应考虑项目技能规则

</planning_context>

<constraints>
- 创建一个包含 1-3 个聚焦任务的单个计划
- 快速任务应该是原子和自包含的
- 无研究阶段
${FULL_MODE ? '- 目标 ~40% 上下文使用（结构化用于验证）' : '- 目标 ~30% 上下文使用（简单、聚焦）'}
${FULL_MODE ? '- 必须在计划前置信息中生成 `must_haves`（truths、artifacts、key_links）' : ''}
${FULL_MODE ? '- 每个任务必须有 `files`、`action`、`verify`、`done` 字段' : ''}
</constraints>

<output>
将计划写入：${QUICK_DIR}/${quick_id}-PLAN.md
返回：## PLANNING COMPLETE 并返回计划路径
</output>",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="快速计划：${DESCRIPTION}"
)
```

规划器返回后：
1. 验证计划存在于 `${QUICK_DIR}/${quick_id}-PLAN.md`
2. 提取计划数量（通常快速任务为 1）
3. 报告："计划已创建：${QUICK_DIR}/${quick_id}-PLAN.md"

如果未找到计划，错误："规划器未能创建 ${quick_id}-PLAN.md"

---

**步骤 5.5：计划检查器循环（仅当 `$FULL_MODE`）**

如果 NOT `$FULL_MODE`，则完全跳过此步骤。

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
**模式：** quick-full
**任务描述：** ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md（要验证的计划）
</files_to_read>

**范围：** 这是一个快速任务，不是完整阶段。跳过需要 ROADMAP 阶段目标的检查。
</verification_context>

<check_dimensions>
- 需求覆盖：计划是否解决了任务描述？
- 任务完整性：任务是否有 files、action、verify、done 字段？
- 关键链接：引用的文件是否真实？
- 范围合理性：这对于快速任务是否合适大小（1-3 个任务）？
- must_haves 推导：must_haves 是否可追溯到任务描述？

跳过：跨计划依赖（单个计划）、ROADMAP 对齐
${DISCUSS_MODE ? '- 上下文合规性：计划是否遵守来自 CONTEXT.md 的已锁定决策？' : '- 跳过：上下文合规性（无 CONTEXT.md）'}
</check_dimensions>

<expected_output>
- ## VERIFICATION PASSED — 所有检查通过
- ## ISSUES FOUND — 结构化问题列表
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="检查快速计划：${DESCRIPTION}"
)
```

**处理检查器返回：**

- **`## VERIFICATION PASSED`:** 显示确认，继续步骤 6。
- **`## ISSUES FOUND`:** 显示问题，检查迭代次数，进入修订循环。

**修订循环（最多 2 次迭代）：**

跟踪 `iteration_count`（初始计划 + 检查后从 1 开始）。

**如果 iteration_count < 2：**

显示：`发送回规划器进行修订... (迭代 ${N}/2)`

修订提示：

```markdown
<revision_context>
**模式：** quick-full（修订）

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md（现有计划）
</files_to_read>

**检查器问题：** ${来自检查器的结构化问题}

</revision_context>

<instructions>
进行针对性更新以解决检查器问题。
除非问题是根本性的，否则不要从头重新规划。
返回更改的内容。
</instructions>
```

```
Task(
  prompt=revision_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="修订快速计划：${DESCRIPTION}"
)
```

规划器返回后 → 再次生成检查器，增加 iteration_count。

**如果 iteration_count >= 2：**

显示：`达到最大迭代次数。仍有 ${N} 个问题：` + 问题列表

提供：1) 强制继续，2) 中止

---

**步骤 6：生成执行器**

生成带有计划引用的 gsd-executor：

```
Task(
  prompt="
执行快速任务 ${quick_id}。

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md（计划）
- .planning/STATE.md（项目状态）
- ./CLAUDE.md（项目说明，如果存在）
- .claude/skills/ 或 .agents/skills/（项目技能，如果任一存在 — 列出技能，为每个读取 SKILL.md，在实现期间遵循相关规则）
</files_to_read>

<constraints>
- 执行计划中的所有任务
- 为每个任务创建原子提交
- 在以下位置创建摘要：${QUICK_DIR}/${quick_id}-SUMMARY.md
- 不要更新 ROADMAP.md（快速任务与规划的阶段分离）
</constraints>",
  subagent_type="gsd-executor",
  model="{executor_model}",
  description="执行：${DESCRIPTION}"
)
```

执行器返回后：
1. 验证摘要存在于 `${QUICK_DIR}/${quick_id}-SUMMARY.md`
2. 从执行器输出中提取提交哈希
3. 报告完成状态

**已知的 Claude Code 错误（classifyHandoffIfNeeded）：** 如果执行器报告"failed"并出现错误 `classifyHandoffIfNeeded is not defined`，这是 Claude Code 运行时错误 — 不是真正的失败。检查摘要文件是否存在以及 git 日志是否显示提交。如果是，则视为成功。

如果未找到摘要，错误："执行器未能创建 ${quick_id}-SUMMARY.md"

注意：对于生成多个计划（罕见）的快速任务，按照 execute-phase 模式并行波次生成执行器。

---

**步骤 6.5：验证（仅当 `$FULL_MODE`）**

如果 NOT `$FULL_MODE`，则完全跳过此步骤。

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 验证结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成验证器...
```

```
Task(
  prompt="验证快速任务目标达成。
任务目录：${QUICK_DIR}
任务目标：${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md（计划）
</files_to_read>

检查 must_haves 是否与实际代码库匹配。在 ${QUICK_DIR}/${quick_id}-VERIFICATION.md 创建 VERIFICATION.md。",
  subagent_type="gsd-verifier",
  model="{verifier_model}",
  description="验证：${DESCRIPTION}"
)
```

读取验证状态：
```bash
grep "^status:" "${QUICK_DIR}/${quick_id}-VERIFICATION.md" | cut -d: -f2 | tr -d ' '
```

存储为 `$VERIFICATION_STATUS`。

| 状态 | 动作 |
|------|------|
| `passed` | 存储 `$VERIFICATION_STATUS = "已验证"`，继续步骤 7 |
| `human_needed` | 显示需要手动检查的项目，存储 `$VERIFICATION_STATUS = "需要审查"`，继续 |
| `gaps_found` | 显示缺口摘要，提供：1) 重新运行执行器修复缺口，2) 按现状接受。存储 `$VERIFICATION_STATUS = "缺口"` |

---

**步骤 7：更新 STATE.md**

使用快速任务完成记录更新 STATE.md。

**7a. 检查"快速任务完成"部分是否存在：**

读取 STATE.md 并检查是否存在 `### 快速任务完成` 部分。

**7b. 如果部分不存在，创建它：**

在 `### 阻碍/关注点` 部分后插入：

**如果 `$FULL_MODE`：**
```markdown
### 快速任务完成

| # | 描述 | 日期 | 提交 | 状态 | 目录 |
|---|-------------|------|--------|--------|-----------|
```

**如果 NOT `$FULL_MODE`：**
```markdown
### 快速任务完成

| # | 描述 | 日期 | 提交 | 目录 |
|---|-------------|------|--------|-----------|
```

**注意：** 如果表已存在，匹配其现有列格式。如果向已经没有状态列的快速任务添加 `--full`，向标题和分隔行添加状态列，并为前一行的状态留空。

**7c. 向表中追加新行：**

使用来自 init 的 `date`：

**如果 `$FULL_MODE`（或表有状态列）：**
```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | ${VERIFICATION_STATUS} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**如果 NOT `$FULL_MODE`（且表无状态列）：**
```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**7d. 更新"最后活动"行：**

使用来自 init 的 `date`：
```
最后活动：${date} - 完成快速任务 ${quick_id}: ${DESCRIPTION}
```

使用 Edit 工具进行这些原子更改

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

GSD > 快速任务完成 (完整模式)

快速任务 ${quick_id}: ${DESCRIPTION}

摘要：${QUICK_DIR}/${quick_id}-SUMMARY.md
验证：${QUICK_DIR}/${quick_id}-VERIFICATION.md (${VERIFICATION_STATUS})
提交：${commit_hash}

---

准备好下一个任务：/gsd:quick
```

**如果 NOT `$FULL_MODE`：**
```
---

GSD > 快速任务完成

快速任务 ${quick_id}: ${DESCRIPTION}

摘要：${QUICK_DIR}/${quick_id}-SUMMARY.md
提交：${commit_hash}

---

准备好下一个任务：/gsd:quick
```

</process>

<success_criteria>
- [ ] ROADMAP.md 验证通过
- [ ] 用户提供任务描述
- [ ] `--full` 和 `--discuss` 标志从参数中解析（存在时）
- [ ] 生成 slug（小写、连字符、最多 40 个字符）
- [ ] 生成快速 ID（YYMMDD-xxx 格式，2s Base36 精度）
- [ ] 在 `.planning/quick/YYMMDD-xxx-slug/` 创建目录
- [ ] （--discuss）识别并展示灰色区域，决策捕获在 `${quick_id}-CONTEXT.md` 中
- [ ] `${quick_id}-PLAN.md` 由规划器创建（当 --discuss 时遵守 CONTEXT.md 决策）
- [ ] （--full）计划检查器验证计划，修订循环限制在 2 次
- [ ] `${quick_id}-SUMMARY.md` 由执行器创建
- [ ] （--full）`${quick_id}-VERIFICATION.md` 由验证器创建
- [ ] STATE.md 使用快速任务行更新（当 --full 时有状态列）
- [ ] 工件已提交
</success_criteria>