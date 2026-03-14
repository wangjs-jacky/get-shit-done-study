<purpose>
执行阶段提示（PLAN.md）并创建结果摘要（SUMMARY.md）。
</purpose>

<required_reading>
任何操作前先读取 STATE.md 加载项目上下文。
读取 config.json 获取规划行为设置。

@~/.claude/get-shit-done/references/git-integration.md
</required_reading>

<process>

<step name="init_context" priority="first">
加载执行上下文（仅路径以最小化协调器上下文）：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`executor_model`, `commit_docs`, `phase_dir`, `phase_number`, `plans`, `summaries`, `incomplete_plans`, `state_path`, `config_path`。

如果 `.planning/` 缺失：错误。
</step>

<step name="identify_plan">
```bash
# 使用 INIT JSON 中的 plans/summaries，或列出文件
ls .planning/phases/XX-name/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-name/*-SUMMARY.md 2>/dev/null | sort
```

找到第一个没有对应 SUMMARY 的 PLAN。支持十进制阶段（`01.1-hotfix/`）：

```bash
PHASE=$(echo "$PLAN_PATH" | grep -oE '[0-9]+(\.[0-9]+)?-[0-9]+')
# 可通过 gsd-tools config-get 获取配置设置
```

<if mode="yolo">
自动批准：`⚡ 执行 {phase}-{plan}-PLAN.md [计划 Z 的第 X 个计划，第 Y 个阶段]` → parse_segments。
</if>

<if mode="interactive" OR="custom with gates.execute_next_plan true">
显示计划识别，等待确认。
</if>
</step>

<step name="record_start_time">
```bash
PLAN_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PLAN_START_EPOCH=$(date +%s)
```
</step>

<step name="parse_segments">
```bash
grep -n "type=\"checkpoint" .planning/phases/XX-name/{phase}-{plan}-PLAN.md
```

**按检查点类型路由：**

| 检查点 | 模式 | 执行 |
|--------|------|------|
| 无 | A（自主） | 单个子代理：完整计划 + SUMMARY + 提交 |
| 仅验证 | B（分段） | 检查点之间的分段。无后/人工验证 → SUBAGENT。决策后/人工操作 → MAIN |
| 决策 | C（主） | 在主上下文中完全执行 |

**模式 A：** init_agent_tracking → spawn Task(subagent_type="gsd-executor", model=executor_model) 提示：在 [路径] 执行计划，自主，所有任务 + SUMMARY + 提交，遵循偏差/授权规则，报告：计划名称、任务、SUMMARY 路径、提交哈希 → track agent_id → 等待 → 更新跟踪 → 报告。

**模式 B：** 分段执行。自主分段： spawn 子代理仅执行分配的任务（无 SUMMARY/提交）。检查点：主上下文。所有分段后：聚合，创建 SUMMARY，提交。参见 segment_execution。

**模式 C：** 使用标准流程在主上下文中执行（步骤名称="execute"）。

每个子代理的新鲜上下文保持峰值质量。主上下文保持简洁。
</step>

<step name="init_agent_tracking">
```bash
if [ ! -f .planning/agent-history.json ]; then
  echo '{"version":"1.0","max_entries":50,"entries":[]}' > .planning/agent-history.json
fi
rm -f .planning/current-agent-id.txt
if [ -f .planning/current-agent-id.txt ]; then
  INTERRUPTED_ID=$(cat .planning/current-agent-id.txt)
  echo "找到中断的代理: $INTERRUPTED_ID"
fi
```

如果中断：询问用户恢复（Task `resume` 参数）或重新开始。

**跟踪协议：** 生成时：将 agent_id 写入 `current-agent-id.txt`，附加到 agent-history.json：`{"agent_id":"[id]","task_description":"[desc]","phase":"[phase]","plan":"[plan]","segment":[num|null],"timestamp":"[ISO]","status":"spawned","completion_timestamp":null}`。完成时：status → "completed"，设置 completion_timestamp，删除 current-agent-id.txt。修剪：如果条目 > max_entries，移除最旧的 "completed"（从不移除 "spawned"）。

模式 A/B 生成前运行。模式 C：跳过。
</step>

<step name="segment_execution">
仅模式 B（仅验证检查点）。A/C 跳过。

1. 解析分段映射：检查点位置和类型
2. 每个分段：
   - 子代理路由：为仅分配的任务生成 gsd-executor。提示：任务范围，计划路径，读取完整计划用于上下文，执行分配的任务，跟踪偏差，无 SUMMARY/提交。通过代理协议跟踪。
   - 主路由：使用标准流程执行任务（步骤名称="execute"）
3. 所有分段后：聚合文件/偏差/决策 → 创建 SUMMARY.md → 提交 → 自检：
   - 使用 `[ -f ]` 验证 key-files.created 在磁盘上存在
   - 检查 `git log --oneline --all --grep="{phase}-{plan}"` 返回 ≥1 个提交
   - 将 `## 自检：通过` 或 `## 自检：失败` 附加到 SUMMARY

   **已知的 Claude Code 错误（classifyHandoffIfNeeded）：** 如果任何分段代理报告 "failed" 并显示 `classifyHandoffIfNeeded is not defined`，这是 Claude Code 运行时错误 — 不是真正的失败。运行抽查；如果通过，视为成功。




</step>

<step name="load_prompt">
```bash
cat .planning/phases/XX-name/{phase}-{plan}-PLAN.md
```
这就是执行指令。严格按照指示执行。如果计划引用 CONTEXT.md：在整个过程中尊重用户的愿景。

**如果计划包含 `<interfaces>` 块：** 这些是预先提取的类型定义和契约。直接使用它们 — 不要重新读取源文件来发现类型。规划器已经提取了您需要的内容。
</step>

<step name="previous_phase_check">
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phases list --type summaries --raw
# 从 JSON 结果中提取倒数第二个摘要
```
如果先前的 SUMMARY 有未解决的"遇到的问题"或"下一阶段准备"阻塞器：AskUserQuestion(header="先前问题", options: "继续执行" | "先解决" | "查看先前")。
</step>

<step name="execute">
偏差是正常的 — 按以下规则处理。

1. 从提示中读取 @context 文件
2. 每个任务：
   - **强制性的 read_first 门：** 如果任务有 `<read_first>` 字段，您必须在任何编辑之前读取列出的所有文件。这不是可选的。不要因为您"已经知道"文件内容而跳过文件 — 读取它们。read_first 文件建立了任务的真实基础。
   - `type="auto"`：如果 `tdd="true"` → TDD 执行。使用偏差规则 + 授权门。验证完成标准。提交（参见 task_commit）。跟踪哈希用于摘要。
   - `type="checkpoint:*"`：STOP → checkpoint_protocol → 等待用户 → 仅在确认后继续。
   - **强制性的 acceptance_criteria 检查：** 完成每个任务后，如果它有 `<acceptance_criteria>`，移动到下一个任务前验证每个标准。使用 grep、文件读取或 CLI 命令确认每个标准。如果有任何标准失败，在继续之前修复实现。不要跳过标准或将它们标记为"稍后验证"。
3. 运行 `<verification>` 检查
4. 确认 `<success_criteria>` 已满足
5. 在摘要中记录偏差
</step>

<authentication_gates>

## 授权门

执行期间的授权错误不是失败 — 它们是预期的交互点。

**指标：** "Not authenticated", "Unauthorized", 401/403, "Please run {tool} login", "Set {ENV_VAR}"

**协议：**
1. 识别授权门（不是错误）
2. 停止任务执行
3. 创建动态检查点：human-action 并包含精确的授权步骤
4. 等待用户授权
5. 验证凭据有效
6. 重试原始任务
7. 正常继续

**示例：** `vercel --yes` → "Not authenticated" → 要求用户 `vercel login` 的检查点 → 用 `vercel whoami` 验证 → 重试部署 → 继续

**在摘要中：** 作为正常流程记录在"## 授权门"下，而不是作为偏差。

</authentication_gates>

<deviation_rules>

## 偏差规则

您将发现未计划的工作。自动应用，全部跟踪用于摘要。

| 规则 | 触发器 | 操作 | 权限 |
|------|--------|------|------|
| **1：错误修复** | 损坏的行为、错误、错误的查询、类型错误、安全漏洞、竞争条件、泄漏 | 修复 → 测试 → 验证 → 跟踪 `[规则 1 - 错误修复]` | 自动 |
| **2：缺少关键内容** | 缺少必需品：错误处理、验证、授权、CSRF/CORS、速率限制、索引、日志记录 | 添加 → 测试 → 验证 → 跟踪 `[规则 2 - 缺少关键内容]` | 自动 |
| **3：阻塞问题** | 阻止完成：缺少依赖、错误的类型、损坏的导入、缺少 env/config/文件、循环依赖 | 修复阻塞器 → 验证继续 → 跟踪 `[规则 3 - 阻塞问题]` | 自动 |
| **4：架构变更** | 结构变更：新的数据库表、架构变更、新服务、切换库、破坏 API、新基础设施 | STOP → 提出决策（下文）→ 跟踪 `[规则 4 - 架构变更]` | 询问用户 |

**规则 4 格式：**
```
⚠️ 需要架构决策

当前任务：[任务名称]
发现：[触发此发现的原因]
建议变更：[修改]
为什么需要：[理由]
影响：[这会影响什么]
替代方案：[其他方法]

继续进行建议的变更吗？（是 / 不同方法 / 推迟）
```

**优先级：** 规则 4（停止）> 规则 1-3（自动）> 不确定 → 规则 4
**边缘情况：** 缺少验证 → R2 | null 崩溃 → R1 | 新表 → R4 | 新列 → R1/2
**启发式：** 影响正确性/安全/完成度？→ R1-3。可能？→ R4。

</deviation_rules>

<deviation_documentation>

## 记录偏差

摘要必须包含偏差部分。如果没有？→ `## 偏离计划\n\n无 - 计划完全按照编写执行。`

每个偏差：**[规则 N - 类别] 标题** — 发现于：任务 X | 问题 | 修复 | 修改的文件 | 验证 | 提交哈希

结束：**总偏差数：** N 个自动修复（分解）。**影响：** 评估。

</deviation_documentation>

<tdd_plan_execution>
## TDD 执行

对于 `type: tdd` 计划 — RED-GREEN-REFACTOR：

1. **基础设施**（仅第一个 TDD 计划）：检测项目，安装框架，配置，验证空套件
2. **RED：** 读取 `<behavior>` → 失败的测试 → 运行（必须失败）→ 提交：`test({phase}-{plan}): 为 [功能] 添加失败测试`
3. **GREEN：** 读取 `<implementation>` → 最小代码 → 运行（必须通过）→ 提交：`feat({phase}-{plan}): 实现 [功能]`
4. **REFACTOR：** 清理 → 测试必须通过 → 提交：`refactor({phase}-{plan}): 清理 [功能]`

错误：RED 不失败 → 调查测试/现有功能。GREEN 不通过 → 调试，迭代。REFACTOR 破坏 → 撤销。

结构参见 `~/.claude/get-shit-done/references/tdd.md`。
</tdd_plan_execution>

<precommit_failure_handling>
## 预提交钩子失败处理

您的提交可能触发预提交钩子。自动修复钩子透明地处理自己 — 文件自动被修复并重新暂存。

如果提交被钩子阻塞：

1. `git commit` 命令因钩子错误而失败
2. 读取错误 — 它精确地告诉您哪个钩子和什么失败
3. 修复问题（类型错误、lint 违规、秘密泄漏等）
4. `git add` 修复的文件
5. 重试提交
6. 不要使用 `--no-verify`

这是正常的和预期的。每个预算 1-2 个重试周期。
</precommit_failure_handling>

<task_commit>
## 任务提交协议

每个任务后（验证通过，完成标准满足），立即提交。

**1. 检查：** `git status --short`

**2. 单独暂存**（绝不要 `git add .` 或 `git add -A`）：
```bash
git add src/api/auth.ts
git add src/types/user.ts
```

**3. 提交类型：**

| 类型 | 何时 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat(08-02): 创建用户注册端点 |
| `fix` | 错误修复 | fix(08-02): 修正电子邮件验证正则表达式 |
| `test` | 仅测试（TDD RED） | test(08-02): 为密码哈希添加失败测试 |
| `refactor` | 无行为变更（TDD REFACTOR） | refactor(08-02): 将验证提取到辅助函数 |
| `perf` | 性能 | perf(08-02): 添加数据库索引 |
| `docs` | 文档 | docs(08-02): 添加 API 文档 |
| `style` | 格式化 | style(08-02): 格式化身份验证模块 |
| `chore` | 配置/依赖 | chore(08-02): 添加 bcrypt 依赖 |

**4. 格式：** `{type}({phase}-{plan}): {description}` 并带有关键更改的要点。

**5. 记录哈希：**
```bash
TASK_COMMIT=$(git rev-parse --short HEAD)
TASK_COMMITS+=("任务 ${TASK_NUM}: ${TASK_COMMIT}")
```

</task_commit>

<step name="checkpoint_protocol">
在 `type="checkpoint:*"`：尽可能自动化一切。检查点仅用于验证/决策。

显示：`检查点：[类型]` 框 → 进度 {X}/{Y} → 任务名称 → 类型特定内容 → `您的操作：[信号]`

| 类型 | 内容 | 恢复信号 |
|------|------|----------|
| human-verify (90%) | 已构建的内容 + 验证步骤（命令/URL） | "approved" 或描述问题 |
| decision (9%) | 需要的决策 + 上下文 + 带优缺点的选项 | "选择: option-id" |
| human-action (1%) | 已自动化的内容 + 一个手动步骤 + 验证计划 | "done" |

响应后：如指定则验证。通过 → 继续。失败 → 通知，等待。等待用户 — 不要编造完成。

详细信息参见 ~/.claude/get-shit-done/references/checkpoints.md。
</step>

<step name="checkpoint_return_for_orchestrator">
当通过 Task 生成并遇到检查点时：返回结构化状态（无法直接与用户交互）。

**必需返回：** 1) 已完成任务表（哈希 + 文件）2) 当前任务（阻塞的内容）3) 检查点详情（面向用户的内容）4) 等待（需要用户提供的内容）

协调器解析 → 呈现给用户 → 生成具有您已完成任务状态的新延续。您不会被恢复。在主上下文中：使用上述的 checkpoint_protocol。
</step>

<step name="verification_failure_gate">
如果验证失败：

**检查是否启用节点修复**（默认：开启）：
```bash
NODE_REPAIR=$(node "./.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.node_repair 2>/dev/null || echo "true")
```

如果 `NODE_REPAIR` 为 `true`：调用 `@./.claude/get-shit-done/workflows/node-repair.md` 并提供：
- FAILED_TASK: 任务编号、名称、完成标准
- ERROR: 预期与实际结果
- PLAN_CONTEXT: 相邻任务名称 + 阶段目标
- REPAIR_BUDGET: 来自配置的 `workflow.node_repair_budget`（默认：2）

节点修复将尝试 RETRY、DECOMPOSE 或 PRUNE 自主。仅当修复预算耗尽时才会再次到达此门（ESCALATE）。

如果 `NODE_REPAIR` 为 `false` 或修复返回 ESCALATE：STOP。显示："任务 [X] 验证失败：[名称]。预期：[标准]。实际：[结果]。尝试修复：[尝试内容的摘要]。选项：重试 | 跳过（标记未完成）| 停止（调查）。如果跳过 → 摘要"遇到的问题"。
</step>

<step name="record_completion_time">
```bash
PLAN_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PLAN_END_EPOCH=$(date +%s)

DURATION_SEC=$(( PLAN_END_EPOCH - PLAN_START_EPOCH ))
DURATION_MIN=$(( DURATION_SEC / 60 ))

if [[ $DURATION_MIN -ge 60 ]]; then
  HRS=$(( DURATION_MIN / 60 ))
  MIN=$(( DURATION_MIN % 60 ))
  DURATION="${HRS}h ${MIN}m"
else
  DURATION="${DURATION_MIN} min"
fi
```
</step>

<step name="generate_user_setup">
```bash
grep -A 50 "^user_setup:" .planning/phases/XX-name/{phase}-{plan}-PLAN.md | head -50
```

如果存在 user_setup：使用模板 `~/.claude/get-shit-done/templates/user-setup.md` 创建 `{phase}-USER-SETUP.md}`。每个服务：env 表格、账户设置清单、仪表板配置、本地开发说明、验证命令。状态"未完成"。设置 `USER_SETUP_CREATED=true`。如果为空/缺失：跳过。
</step>

<step name="create_summary">
在 `.planning/phases/XX-name/` 创建 `{phase}-{plan}-SUMMARY.md}`。使用 `~/.claude/get-shit-done/templates/summary.md`。

**Frontmatter：** phase, plan, subsystem, tags | requires/provides/affects | tech-stack.added/patterns | key-files.created/modified | key-decisions | requirements-completed （**必须** 从 PLAN.md frontverbatim 复制 `requirements` 数组）| duration ($DURATION), completed ($PLAN_END_TIME date)。

标题：`# 阶段 [X] 计划 [Y]: [名称] 摘要`

一行说明要充实："使用 jose 库的 JWT 身份验证与刷新轮换" 而不是"身份验证已实现"

包括：持续时间、开始/结束时间、任务数、文件数。

下一步：更多计划 → "准备 {next-plan}" | 最后一个 →"阶段完成，准备转换"。
</step>

<step name="update_current_position">
使用 gsd-tools 更新 STATE.md：

```bash
# 推进计划计数器（处理最后一个计划的边缘情况）
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state advance-plan

# 从磁盘状态重新计算进度条
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state update-progress

# 记录执行指标
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state record-metric \
  --phase "${PHASE}" --plan "${PLAN}" --duration "${DURATION}" \
  --tasks "${TASK_COUNT}" --files "${FILE_COUNT}"
```
</step>

<step name="extract_decisions_and_issues">
从 SUMMARY 中提取决策并添加到 STATE.md：

```bash
# 从 SUMMARY key-decisions 中添加每个决策
# 优先使用文件输入用于 shell 安全文本（精确保留 `$`, `*` 等）
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state add-decision \
  --phase "${PHASE}" --summary-file "${DECISION_TEXT_FILE}" --rationale-file "${RATIONALE_FILE}"

# 如果发现任何阻塞器则添加
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state add-blocker --text-file "${BLOCKER_TEXT_FILE}"
```
</step>

<step name="update_session_continuity">
使用 gsd-tools 更新会话信息：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state record-session \
  --stopped-at "Completed ${PHASE}-${PLAN}-PLAN.md" \
  --resume-file "None"
```

保持 STATE.md 在 150 行以内。
</step>

<step name="issues_review_gate">
如果 SUMMARY "遇到的问题" ≠ "无"：yolo → 记录并继续。交互式 → 显示问题，等待确认。
</step>

<step name="update_roadmap">
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap update-plan-progress "${PHASE}"
```
在磁盘上计算 PLAN vs SUMMARY 文件数。使用正确计数和状态（"进行中" 或 "已完成" 及日期）更新进度表行。
</step>

<step name="update_requirements">
从 PLAN.md frontmatter `requirements:` 字段标记已完成的条件：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" requirements mark-complete ${REQ_IDS}
```

从计划的 frontmatter 中提取条件 ID（例如 `requirements: [AUTH-01, AUTH-02]`）。如果没有 requirements 字段，跳过。
</step>

<step name="git_commit_metadata">
任务代码已按任务提交。提交计划元数据：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({phase}-{plan}): 完成 [计划名称] 计划" --files .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md .planning/REQUIREMENTS.md
```
</step>

<step name="update_codebase_map">
如果 .planning/codebase/ 不存在：跳过。

```bash
FIRST_TASK=$(git log --oneline --grep="feat({phase}-{plan}):" --grep="fix({phase}-{plan}):" --grep="test({phase}-{plan}):" --reverse | head -1 | cut -d' ' -f1)
git diff --name-only ${FIRST_TASK}^..HEAD 2>/dev/null
```

仅更新结构变更：新的 src/ 目录 → STRUCTURE.md | 依赖 → STACK.md | 文件模式 → CONVENTIONS.md | API 客户端 → INTEGRATIONS.md | 配置 → STACK.md | 重命名 → 更新路径。跳过仅代码/错误修复/内容变更。

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "" --files .planning/codebase/*.md --amend
```
</step>

<step name="offer_next">
如果 `USER_SETUP_CREATED=true`：在顶部显示 `⚠️ 需要用户设置` 及路径 + env/config 任务。

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
```

| 条件 | 路由 | 操作 |
|------|------|------|
| summary < plans | **A: 更多计划** | 找到下一个没有 SUMMARY 的 PLAN。Yolo：自动继续。交互式：显示下一个计划，建议 `/gsd:execute-phase {phase}` + `/gsd:verify-work`。在此 STOP。 |
| summary = plans, current < highest phase | **B: 阶段完成** | 显示完成情况，建议 `/gsd:plan-phase {Z+1}` + `/gsd:verify-work {Z}` + `/gsd:discuss-phase {Z+1}` |
| summary = plans, current = highest phase | **C: 里程碑完成** | 显示横幅，建议 `/gsd:complete-milestone` + `/gsd:verify-work` + `/gsd:add-phase` |

所有路由：首先 `/clear` 用于新鲜上下文。
</step>

</process>

<success_criteria>

- PLAN.md 中的所有任务已完成
- 所有验证通过
- 如果 frontmatter 中有 user_setup，则生成 USER-SETUP.md
- SUMMARY.md 已创建并具有实质性内容
- STATE.md 已更新（位置、决策、问题、会话）
- ROADMAP.md 已更新
- 如果代码库映射存在：映射已使用执行变更更新（如果没有显著变更则跳过）
- 如果生成了 USER-SETUP.md：在完成输出中突出显示
</success_criteria>