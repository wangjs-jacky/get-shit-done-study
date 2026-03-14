<purpose>

使用基于波段的并行执行执行阶段中的所有计划。编排器保持精简 — 将计划执行委托给子 agent。

</purpose>

<core_principle>
编排器协调，不执行。每个子 agent 加载完整的执行计划上下文。编排器：发现计划 → 分析依赖 → 分组波段 → 启动 agent → 处理检查点 → 收集结果。
</core_principle>

<required_reading>

在开始任何操作前读取 STATE.md 以加载项目上下文。
</required_reading>

<process>

<step name="initialize" priority="first">
在一次调用中加载所有上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 JSON 中解析：`executor_model`, `verifier_model`, `commit_docs`, `parallelization`, `branching_strategy`, `branch_name`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `plans`, `incomplete_plans`, `plan_count`, `incomplete_count`, `state_exists`, `roadmap_exists`, `phase_req_ids`。

**如果 `phase_found` 为 false：** 错误 — 未找到阶段目录。
**如果 `plan_count` 为 0：** 错误 — 阶段中未找到计划。
**如果 `state_exists` 为 false 但 `.planning/` 存在：** 提供重建或继续。

当 `parallelization` 为 false 时，波段内的计划按顺序执行。

**同步链标志与意图** — 如果用户手动调用（没有 `--auto`），清除来自任何先前中断的 `--auto` 链的临时链标志。这不会触及 `workflow.auto_advance`（用户的首选持久设置）。必须在任何配置读取之前发生（检查点处理也读取自动前进标志）：
```bash
if [[ ! "$ARGUMENTS" =~ --auto ]]; then
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false 2>/dev/null
fi
```
</step>

<step name="handle_branching">
检查来自初始化的 `branching_strategy`：

**"none":** 跳过，继续在当前分支上。

**"phase" 或 "milestone":** 使用初始化中预计算的 `branch_name`：
```bash
git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
```

所有后续提交都转到此分支。用户处理合并。
</step>

<step name="validate_phase">
从初始化 JSON：`phase_dir`, `plan_count`, `incomplete_count`。

报告："在 {phase_dir} 中找到 {plan_count} 个计划（{incomplete_count} 个未完成）"
</step>

<step name="discover_and_group_plans">
在一次调用中加载带有波段分组的计划清单：

```bash
PLAN_INDEX=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase-plan-index "${PHASE_NUMBER}")
```

从 JSON 中解析：`phase`, `plans[]`（每个有 `id`, `wave`, `autonomous`, `objective`, `files_modified`, `task_count`, `has_summary`）, `waves`（波段号 → 计划 ID 的映射）, `incomplete`, `has_checkpoints`。

**过滤：** 跳过 `has_summary: true` 的计划。如果 `--gaps-only`：也跳过非 gap_closure 计划。如果所有过滤：没有匹配的未完成计划 → 退出。

报告：
```
## 执行计划

**阶段 {X}: {Name}** — {total_plans} 个计划跨越 {wave_count} 个波段

| 波段 | 计划 | 构建什么 |
|------|-------|----------------|
| 1 | 01-01, 01-02 | [来自计划目标，3-8 个词] |
| 2 | 01-03 | ... |
```
</step>

<step name="execute_waves">
顺序执行每个波段。波段内：如果 `PARALLELIZATION=true` 并行，如果 `false` 顺序。

**对于每个波段：**

1. **描述正在构建的内容（启动前）：**

   读取每个计划的 `<objective>`。提取构建内容和原因。

   ```
   ---
   ## 波段 {N}

   **{计划 ID}: {计划名称}**
   {2-3 句话：这构建什么，技术方法，为什么重要}

   启动 {count} 个 agent(s)...
   ---
   ```

   - 不好："执行地形生成计划"
   - 好："使用 Perlin 噪声的程序化地形生成器 — 创建高度图、生物群落区域和碰撞网格。车辆物理与地面交互前必需。"

2. **启动 executor agent：**

   仅传递路径 — executor 使用他们新鲜的 200k 上下文自己读取文件。
   这保持编排器上下文精简（~10-15%）。

   ```
   Task(
     subagent_type="gsd-executor",
     model="{executor_model}",
     prompt="
       <objective>
       执行阶段 {phase_number}-{phase_name} 的计划 {plan_number}。
       每个任务原子提交。创建 SUMMARY.md。更新 STATE.md 和 ROADMAP.md。
       </objective>

       <execution_context>
       @~/.claude/get-shit-done/workflows/execute-plan.md
       @~/.claude/get-shit-done/templates/summary.md
       @~/.claude/get-shit-done/references/checkpoints.md
       @~/.claude/get-shit-done/references/tdd.md
       </execution_context>

       <files_to_read>
       使用 Read 工具在执行开始时读取这些文件：
       - {phase_dir}/{plan_file}（计划）
       - .planning/STATE.md（状态）
       - .planning/config.json（配置，如果存在）
       - ./CLAUDE.md（项目指令，如果存在 — 遵循项目特定指南和编码约定）
       - .claude/skills/ 或 .agents/skills/（项目技能，如果任一存在 — 列出技能，为每个读取 SKILL.md，在实现期间遵循相关规则）
       </files_to_read>

       <success_criteria>
       - [ ] 所有任务已执行
       - [ ] 每个任务单独提交
       - [ ] 在计划目录中创建 SUMMARY.md
       - [ ] STATE.md 已更新位置和决策
       - [ ] ROADMAP.md 已更新计划进度（通过 `roadmap update-plan-progress`）
       </success_criteria>
     "
   )
   ```

3. **等待波段中所有 agent 完成。**

4. **报告完成 — 首先现场声明：**

   对于每个 SUMMARY.md：
   - 验证 `key-files.created` 中的前 2 个文件是否存在于磁盘上
   - 检查 `git log --oneline --all --grep="{phase}-{plan}"` 返回 ≥1 个提交
   - 检查是否存在 `## Self-Check: FAILED` 标记

   如果任何现场检查失败：报告哪个计划失败，路由到故障处理程序 — 询问"重试计划？" 或"继续剩余波段？"

   如果通过：
   ```
   ---
   ## 波段 {N} 完成

   **{计划 ID}: {计划名称}**
   {已构建的内容 — 来自 SUMMARY.md}
   {任何显著偏差，如果有}

   {如果还有更多波段：这为下一波段启用什么}
   ---
   ```

   - 不好："波段 2 完成。继续波段 3。"
   - 好："地形系统完成 — 3 个生物群落类型、基于高度图的纹理、物理碰撞网格。车辆物理（波段 3）现在可以引用地面表面。"

5. **处理故障：**

   **已知的 Claude Code 错误（classifyHandoffIfNeeded）：** 如果 agent 报告 "failed" 且错误包含 `classifyHandoffIfNeeded is not defined`，这是 Claude Code 运行时错误 — 不是 GSD 或 agent 错误。错误在所有工具调用完成后在完成处理程序中触发。在这种情况下：运行与步骤 4 相同的现场检查（SUMMARY.md 存在，git 提交存在，无 Self-Check: FAILED）。如果现场检查通过 → 视为**成功**。如果现场检查失败 → 视为真正的失败。

   对于真正的失败：报告哪个计划失败 → 询问"继续？" 或"停止？" → 如果继续，依赖计划也可能失败。如果停止，部分完成报告。

6. **波段间执行检查点计划** — 见 `<checkpoint_handling>`。

7. **继续下一个波段。**
</step>

<step name="checkpoint_handling">
具有 `autonomous: false` 的计划需要用户交互。

**自动模式检查点处理：**

读取自动前进配置（链标志 + 用户偏好）：
```bash
AUTO_CHAIN=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow._auto_chain_active 2>/dev/null || echo "false")
AUTO_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.auto_advance 2>/dev/null || echo "false")
```

当 executor 返回检查点 AND（`AUTO_CHAIN` 为 `"true"` OR `AUTO_CFG` 为 `"true"`）：
- **人工验证** → 使用 `{user_response} = "approved"` 自动启动继续 agent。记录 `⚡ Auto-approved checkpoint`。
- **决策** → 使用 `{user_response} = 来自检查点细节的第一个选项` 自动启动继续 agent。记录 `⚡ Auto-selected: [option]`。
- **人工操作** → 呈现给用户（现有行为）。身份验证门不能自动化。

**标准流程（不是自动模式，或人工操作类型）：**

1. 为检查点计划启动 agent
2. Agent 运行直到检查点任务或身份验证门 → 返回结构化状态
3. Agent 返回包括：已完成任务表，当前任务 + 阻碍因素，检查点类型/详情，等待的内容
4. **呈现给用户：**
   ```
   ## 检查点: [类型]

   **计划:** 03-03 Dashboard Layout
   **进度:** 2/3 个任务完成

   [来自 agent 返回的检查点详情]
   [来自 agent 返回的等待部分]
   ```
5. 用户响应："approved"/"done" | 问题描述 | 决策选择
6. **使用检查点提示模板启动继续 agent（NOT resume）**：
   - `{completed_tasks_table}`：来自检查点返回
   - `{resume_task_number}` + `{resume_task_name}`：当前任务
   - `{user_response}`：用户提供的内容
   - `{resume_instructions}`：基于检查点类型
7. 继续 agent 验证之前的提交，从恢复点继续
8. 重复直到计划完成或用户停止

**为什么使用新 agent，而不是 resume：** Resume 依赖内部序列化，在并行工具调用时会中断。带有明确状态的新 agent 更可靠。

**并行波段中的检查点：** Agent 暂停并返回，同时其他并行 agent 可能完成。呈现检查点，启动继续，等待所有完成后再进行下一个波段。
</step>

<step name="aggregate_results">
所有波段后：

```markdown
## 阶段 {X}: {Name} 执行完成

**波段:** {N} | **计划:** {M}/{total} 已完成

| 波段 | 计划 | 状态 |
|------|-------|--------|
| 1 | plan-01, plan-02 | ✓ 完成 |
| CP | plan-03 | ✓ 已验证 |
| 2 | plan-04 | ✓ 完成 |

### 计划详情
1. **03-01**: [来自 SUMMARY.md 的一句话]
2. **03-02**: [来自 SUMMARY.md 的一句话]

### 遇到的问题
[从 SUMMARYs 汇总，或 "无"]
```
</step>

<step name="close_parent_artifacts">
**仅用于小数/优化阶段（X.Y 模式）：** 通过解决父级 UAT 和调试工件来关闭反馈循环。

**如果阶段号没有小数（例如 `3`、`04`）则跳过** — 仅适用于像 `4.1`、`03.1` 这样的间隙闭合阶段。

**1. 检测小数阶段并派生父级：**
```bash
# 检查 phase_number 是否包含小数
if [[ "$PHASE_NUMBER" == *.* ]]; then
  PARENT_PHASE="${PHASE_NUMBER%%.*}"
fi
```

**2. 找到父级 UAT 文件：**
```bash
PARENT_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" find-phase "${PARENT_PHASE}" --raw)
# 从 PARENT_INFO JSON 中提取目录，然后在该目录中查找 UAT 文件
```

**如果未找到父级 UAT：** 跳过此步骤（间隙闭合可能由 VERIFICATION.md 触发）。

**3. 更新 UAT 间隙状态：**

读取父级 UAT 文件的 `## Gaps` 部分。对于每个带有 `status: failed` 的间隙条目：
- 更新为 `status: resolved`

**4. 更新 UAT 前言：**

如果所有间隙现在都有 `status: resolved`：
- 更新前言 `status: diagnosed` → `status: resolved`
- 更新前言 `updated:` 时间戳

**5. 解决引用的调试会话：**

对于每个带有 `debug_session:` 字段的间隙：
- 读取调试会话文件
- 更新前言 `status:` → `resolved`
- 更新前言 `updated:` 时间戳
- 移动到已解决目录：
```bash
mkdir -p .planning/debug/resolved
mv .planning/debug/{slug}.md .planning/debug/resolved/
```

**6. 提交更新的工件：**
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(phase-${PARENT_PHASE}): resolve UAT gaps and debug sessions after ${PHASE_NUMBER} gap closure" --files .planning/phases/*${PARENT_PHASE}*/*-UAT.md .planning/debug/resolved/*.md
```
</step>

<step name="verify_phase_goal">
验证阶段是否实现了其目标，而不仅仅是完成任务。

```
Task(
  prompt="验证阶段 {phase_number} 目标实现。
阶段目录: {phase_dir}
阶段目标: {来自 ROADMAP.md}
阶段需求 ID: {phase_req_ids}
检查 must_haves 与实际代码库。
对照 REQUIREMENTS.md 中的需求 ID 检查 PLAN 前言中的每个 ID — 必须全部说明。
创建 VERIFICATION.md。",
  subagent_type="gsd-verifier",
  model="{verifier_model}"
)
```

读取状态：
```bash
grep "^status:" "$PHASE_DIR"/*-VERIFICATION.md | cut -d: -f2 | tr -d ' '
```

| 状态 | 操作 |
|--------|--------|
| `passed` | → 更新路线图 |
| `human_needed` | 呈现人工测试项目，获得批准或反馈 |
| `gaps_found` | 呈现差距摘要，提供 `/gsd:plan-phase {phase} --gaps` |

**如果需要人工：**
```
## ✓ 阶段 {X}: {Name} — 需要人工验证

所有自动检查通过。{N} 个项目需要人工测试：

{来自 VERIFICATION.md 的 human_verification 部分}

"approved" → 继续 | 报告问题 → 间隙闭合
```

**如果发现差距：**
```
## ⚠ 阶段 {X}: {Name} — 发现差距

**分数:** {N}/{M} 必需项已验证
**报告:** {phase_dir}/{phase_num}-VERIFICATION.md

### 缺少什么
{来自 VERIFICATION.md 的差距摘要}

---
## ▶ 下一步

`/gsd:plan-phase {X} --gaps`

<sub>`/clear` first → fresh context window</sub>

Also: `cat {phase_dir}/{phase_num}-VERIFICATION.md` — 完整报告
Also: `/gsd:verify-work {X}` — 先手动测试
```

间隙闭合周期：`/gsd:plan-phase {X} --gaps` 读取 VERIFICATION.md → 创建带有 `gap_closure: true` 的间隙计划 → 用户运行 `/gsd:execute-phase {X} --gaps-only` → 验证器重新运行。
</step>

<step name="update_roadmap">
**标记阶段完成并更新所有跟踪文件：**

```bash
COMPLETION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase complete "${PHASE_NUMBER}")
```

CLI 处理：
- 标记阶段复选框 `[x]` 及完成日期
- 更新进度表（状态 → 完成，日期）
- 更新计划计数为最终
- 推进 STATE.md 到下一个阶段
- 更新 REQUIREMENTS.md 可追溯性

从结果中提取：`next_phase`, `next_phase_name`, `is_last_phase`。

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(phase-{X}): complete phase execution" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md {phase_dir}/*-VERIFICATION.md
```
</step>

<step name="offer_next">

**例外：** 如果 `gaps_found`，`verify_phase_goal` 步骤已经呈现间隙闭合路径（`/gsd:plan-phase {X} --gaps`）。不需要额外路由 — 跳过自动前进。

**无转换检查（由自动前进链启动）：**

从 $ARGUMENTS 解析 `--no-transition` 标志。

**如果存在 `--no-transition` 标志：**

execute-phase 由 plan-phase 的自动前进启动。不要运行 transition.md。
验证通过且路线图更新后，将完成状态返回给父级：

```
## PHASE COMPLETE

阶段: ${PHASE_NUMBER} - ${PHASE_NAME}
计划: ${completed_count}/${total_count}
验证: {通过 | 发现差距}

[包括 aggregate_results 输出]
```

停止。不要继续自动前进或转换。

**如果不存在 `--no-transition` 标志：**

**自动前进检测：**

1. 从 $ARGUMENTS 解析 `--auto` 标志
2. 读取链标志和用户偏好（链标志已在初始化步骤同步）：
   ```bash
   AUTO_CHAIN=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow._auto_chain_active 2>/dev/null || echo "false")
   AUTO_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.auto_advance 2>/dev/null || echo "false")
   ```

**如果存在 `--auto` 标志 OR `AUTO_CHAIN` 为 true OR `AUTO_CFG` 为 true（AND 验证通过且无差距）：**

```
╔══════════════════════════════════════════╗
║  自动前进 → 转换                         ║
║  阶段 {X} 已验证，继续链                 ║
╚══════════════════════════════════════════╝
```

行内执行转换工作流（不要使用 Task — 编排器上下文约 10-15%，转换需要阶段完成数据已在上下文中）：

读取并遵循 `~/.claude/get-shit-done/workflows/transition.md`，传递 `--auto` 标志以便它传播到下一个阶段调用。

**如果既没有 `--auto` 也没有 `AUTO_CFG`：**

工作流程结束。用户运行 `/gsd:progress` 或手动调用转换工作流。
</step>

</process>

<context_efficiency>
编排器：~10-15% 上下文。子 agent：每个 200k 新鲜。无轮询（Task 阻塞）。无上下文泄露。
</context_efficiency>

<failure_handling>
- **classifyHandoffIfNeeded false 故障：** Agent 报告 "failed" 但错误是 `classifyHandoffIfNeeded is not defined` → Claude Code 错误，不是 GSD。现场检查（SUMMARY 存在，提交存在）→ 如果通过，视为成功
- **Agent 在计划中失败：** 缺少 SUMMARY.md → 报告，询问用户如何继续
- **依赖链中断：** 波段 1 失败 → 波段 2 依赖可能失败 → 用户选择尝试或跳过
- **波段中所有 agent 失败：** 系统性问题 → 停止，报告调查
- **检查点无法解决：** "跳过这个计划？" 或 "中止阶段执行？" → 在 STATE.md 中记录部分进度
</failure_handling>

<resumption>
重新运行 `/gsd:execute-phase {phase}` → discover_plans 找到已完成的 SUMMARYs → 跳过它们 → 从第一个未完成计划继续 → 继续波段执行。

STATE.md 跟踪：最后完成的计划，当前波段，待处理检查点。
</resumption>