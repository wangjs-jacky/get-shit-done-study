<purpose>
为路线图阶段创建可执行的阶段提示（PLAN.md 文件），包含集成的研究和验证。默认流程：研究（如需要）→ 计划 → 验证 → 完成。协调 gsd-phase-researcher、gsd-planner 和 gsd-plan-checker 代理，支持修订循环（最多 3 次）。
</purpose>

<required_reading>
在开始前，读取调用提示的 execution_context 引用的所有文件。

@~/.claude/get-shit-done/references/ui-brand.md
</required_reading>

<process>

## 1. 初始化

在一次调用中加载所有上下文（仅使用路径以最小化协调器上下文）：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init plan-phase "$PHASE")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析 JSON 以获取：`researcher_model`, `planner_model`, `checker_model`, `research_enabled`, `plan_checker_enabled`, `nyquist_validation_enabled`, `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `plan_count`, `planning_exists`, `roadmap_exists`, `phase_req_ids`。

**文件路径（用于 <files_to_read> 块）：** `state_path`, `roadmap_path`, `requirements_path`, `context_path`, `research_path`, `verification_path`, `uat_path`。如果文件不存在，这些为 null。

**如果 `planning_exists` 为 false：** 错误 — 先运行 `/gsd:new-project`。

## 2. 解析和标准化参数

从 $ARGUMENTS 提取：阶段编号（整数或小数如 `2.1`）、标志（`--research`, `--skip-research`, `--gaps`, `--skip-verify`, `--prd <filepath>`）。

从 $ARGUMENTS 提取 `--prd <filepath>`。如果存在，设置 PRD_FILE 为文件路径。

**如果没有阶段编号：** 从路线图中检测下一个未计划的阶段。

**如果 `phase_found` 为 false：** 验证阶段是否存在于 ROADMAP.md 中。如果有效，使用 init 中的 `phase_slug` 和 `padded_phase` 创建目录：
```bash
mkdir -p ".planning/phases/${padded_phase}-${phase_slug}"
```

**从 init 现有的工件：** `has_research`, `has_plans`, `plan_count`。

## 3. 验证阶段

```bash
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${PHASE}")
```

**如果 `found` 为 false：** 错误并提供可用阶段。**如果 `found` 为 true：** 从 JSON 提取 `phase_number`, `phase_name`, `goal`。

## 3.5. 处理 PRD 快速通道

**如果：** 参数中没有 `--prd` 标志。

**如果提供了 `--prd <filepath>`：**

1. 读取 PRD 文件：
```bash
PRD_CONTENT=$(cat "$PRD_FILE" 2>/dev/null)
if [ -z "$PRD_CONTENT" ]; then
  echo "Error: PRD file not found: $PRD_FILE"
  exit 1
fi
```

2. 显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PRD 快速通道
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用 PRD: {PRD_FILE}
从需求生成 CONTEXT.md...
```

3. 解析 PRD 内容并生成 CONTEXT.md。协调器应该：
   - 从 PRD 中提取所有需求、用户故事、验收标准和约束
   - 将每个映射到锁定决策（PRD 中的所有内容都视为锁定决策）
   - 识别 PRD 未涵盖的领域并标记为"Claude 自主决定"
   - **提取 ROADMAP.md 中此阶段的规范引用**，以及 PRD 中引用的任何规范/ADR — 扩展为完整文件路径（强制）
   - 在阶段目录中创建 CONTEXT.md

4. 写入 CONTEXT.md：
```markdown
# 阶段 [X]: [名称] - 上下文

**收集时间：** [日期]
**状态：** 准备计划中
**来源：** PRD 快速通道 ({PRD_FILE})

<domain>
## 阶段边界

[从 PRD 中提取 — 此阶段交付的内容]

</domain>

<decisions>
## 实现决策

{对于 PRD 中的每个需求/故事/标准：}
### [从内容派生的类别]
- [需求作为锁定决策]

### Claude 自主决定
[PRD 未涵盖的领域 — 实现细节、技术选择]

</decisions>

<canonical_refs>
## 规范引用

**下游代理在计划或实施前必须阅读这些文件。**

[强制。从 ROADMAP.md 和 PRD 中引用的文档提取。
使用完整相对路径。按主题领域分组。]

### [主题领域]
- `path/to/spec-or-adr.md` — [它决定/定义的内容]

[如果没有外部规范："没有外部规范 — 需求完全在上述决策中"]

</canonical_refs>

<specifics>
## 具体想法

[PRD 中的任何具体引用、示例或具体需求]

</specifics>

<deferred>
## 延期想法

[PRD 中明确标记为未来/v2/范围外的项目]
[如果没有："无 — PRD 涵盖阶段范围"]

</deferred>

---

*阶段：XX-名称*
*上下文收集：[日期] 通过 PRD 快速通道*
```

5. 提交：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(${padded_phase}): generate context from PRD" --files "${phase_dir}/${padded_phase}-CONTEXT.md"
```

6. 设置 `context_content` 为生成的 CONTEXT.md 内容并继续步骤 5（处理研究）。

**效果：** 这完全跳过了步骤 4（加载 CONTEXT.md），因为我们刚刚创建了它。工作流程的其余部分（研究、计划、验证）正常进行，使用从 PRD 派生的上下文。

## 4. 加载 CONTEXT.md

**如果：** 使用了 PRD 快速通道（CONTEXT.md 在步骤 3.5 中已创建）。

检查来自 init JSON 的 `context_path`。

如果 `context_path` 不为 null，显示：`使用阶段上下文：${context_path}`

**如果 `context_path` 为 null（不存在 CONTEXT.md）：**

使用 AskUserQuestion：
- header: "没有上下文"
- question: "未找到阶段 {X} 的 CONTEXT.md。计划将仅使用研究和需求 — 您的设计偏好将不会被包含。继续还是先捕获上下文？"
- options:
  - "无上下文继续" — 仅使用研究 + 计划
  - "先运行 discuss-phase" — 在计划前捕获设计决策

如果"无上下文继续"：继续步骤 5。
如果"先运行 discuss-phase"：显示 `/gsd:discuss-phase {X}` 并退出工作流程。

## 5. 处理研究

**如果：** `--gaps` 标志、`--skip-research` 标志，或 `research_enabled` 为 false（来自 init）且没有 `--research` 覆盖。

**如果 `has_research` 为 true（来自 init）且没有 `--research` 标志：** 使用现有研究，跳到步骤 6。

**如果 RESEARCH.md 缺失或 `--research` 标志：**

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在研究阶段 {X}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 正在生成研究员...
```

### 生成 gsd-phase-researcher

```bash
PHASE_DESC=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${PHASE}" | jq -r '.section')
```

研究提示：

```markdown
<objective>
研究如何实现阶段 {phase_number}: {phase_name}
回答："我需要知道什么才能很好地计划这个阶段？"
</objective>

<files_to_read>
- {context_path}（来自 /gsd:discuss-phase 的用户决策）
- {requirements_path}（项目需求）
- {state_path}（项目决策和历史）
</files_to_read>

<additional_context>
**阶段描述：** {phase_description}
**阶段需求 ID（必须处理）：** {phase_req_ids}

**项目说明：** 如果存在，读取 ./CLAUDE.md — 遵循项目特定指导原则
**项目技能：** 检查 .claude/skills/ 或 .agents/skills/ 目录（如果任一存在）— 读取 SKILL.md 文件，研究应考虑项目技能模式
</additional_context>

<output>
写入：{phase_dir}/{phase_num}-RESEARCH.md
</output>
```

```
Task(
  prompt=research_prompt,
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}",
  description="Research Phase {phase}"
)
```

### 处理研究员返回

- **`## RESEARCH COMPLETE`：** 显示确认，继续步骤 6
- **`## RESEARCH BLOCKED`：** 显示阻塞器，提供：1) 提供上下文，2) 跳过研究，3) 中止

## 5.5. 创建验证策略

如果 `nyquist_validation_enabled` 为 false 或 `research_enabled` 为 false，则跳过。

如果 `research_enabled` 为 false 且 `nyquist_validation_enabled` 为 true：警告"Nyquist 验证已启用但研究被禁用 — 没有 RESEARCH.md 无法创建 VALIDATION.md。计划将缺乏验证要求（维度 8）。"。继续步骤 6。

```bash
grep -l "## Validation Architecture" "${PHASE_DIR}"/*-RESEARCH.md 2>/dev/null
```

**如果找到：**
1. 读取模板：`~/.claude/get-shit-done/templates/VALIDATION.md`
2. 写入到 `${PHASE_DIR}/${PADDED_PHASE}-VALIDATION.md`（使用 Write 工具）
3. 填充前置信息：`{N}` → 阶段编号，`{phase-slug}` → slug，`{date}` → 当前日期
4. 验证：
```bash
test -f "${PHASE_DIR}/${PADDED_PHASE}-VALIDATION.md" && echo "VALIDATION_CREATED=true" || echo "VALIDATION_CREATED=false"
```
5. 如果 `VALIDATION_CREATED=false`：停止 — 不要继续步骤 6
6. 如果 `commit_docs`：`commit-docs "docs(phase-${PHASE}): add validation strategy"`

**如果没有找到：** 警告并继续 — 计划可能失败维度 8。

## 6. 检查现有计划

```bash
ls "${PHASE_DIR}"/*-PLAN.md 2>/dev/null
```

**如果存在：** 提供：1) 添加更多计划，2) 查看现有计划，3) 重新从头开始计划。

## 7. 使用 INIT 中的上下文路径

从 INIT JSON 提取：

```bash
STATE_PATH=$(printf '%s\n' "$INIT" | jq -r '.state_path // empty')
ROADMAP_PATH=$(printf '%s\n' "$INIT" | jq -r '.roadmap_path // empty')
REQUIREMENTS_PATH=$(printf '%s\n' "$INIT" | jq -r '.requirements_path // empty')
RESEARCH_PATH=$(printf '%s\n' "$INIT" | jq -r '.research_path // empty')
VERIFICATION_PATH=$(printf '%s\n' "$INIT" | jq -r '.verification_path // empty')
UAT_PATH=$(printf '%s\n' "$INIT" | jq -r '.uat_path // empty')
CONTEXT_PATH=$(printf '%s\n' "$INIT" | jq -r '.context_path // empty')
```

## 7.5. 验证 Nyquist 工件

如果 `nyquist_validation_enabled` 为 false 或 `research_enabled` 为 false，则跳过。

```bash
VALIDATION_EXISTS=$(ls "${PHASE_DIR}"/*-VALIDATION.md 2>/dev/null | head -1)
```

如果缺失且 Nyquist 已启用 — 询问用户：
1. 重新运行研究：`/gsd:plan-phase {PHASE} --research`
2. 禁用 Nyquist：`node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow.nyquist_validation false`
3. 继续执行（计划失败维度 8）

仅在用户选择 2 或 3 时继续步骤 8。

## 8. 生成 gsd-planner 代理

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在计划阶段 {X}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 正在生成规划器...
```

规划器提示：

```markdown
<planning_context>
**阶段：** {phase_number}
**模式：** {standard | gap_closure}

<files_to_read>
- {state_path}（项目状态）
- {roadmap_path}（路线图）
- {requirements_path}（需求）
- {context_path}（来自 /gsd:discuss-phase 的用户决策）
- {research_path}（技术研究）
- {verification_path}（验证差距 — 如果 --gaps）
- {uat_path}（UAT 差距 — 如果 --gaps）
</files_to_read>

**阶段需求 ID（每个 ID 必须出现在计划的 `requirements` 字段中）：** {phase_req_ids}

**项目说明：** 如果存在，读取 ./CLAUDE.md — 遵循项目特定指导原则
**项目技能：** 检查 .claude/skills/ 或 .agents/skills/ 目录（如果任一存在）— 读取 SKILL.md 文件，计划应考虑项目技能规则
</planning_context>

<downstream_consumer>
输出被 /gsd:execute-phase 消耗。计划需要：
- 前置信息（wave、depends_on、files_modified、autonomous）
- XML 格式的任务，包含 read_first 和 acceptance_criteria 字段（每个任务强制）
- 验证标准
- 用于目标回溯验证的 must_haves
</downstream_consumer>

<deep_work_rules>
## 防止浅层执行规则（强制）

每个任务必须包含这些字段 — 它们不是可选的：

1. **`<read_first>`** — 执行者必须在处理任何内容前阅读的文件。始终包括：
   - 正在修改的文件（这样执行者看到当前状态，而不是假设）
   - CONTEXT.md 中引用的任何"真相来源"文件（参考实现、现有模式、配置文件、模式）
   - 任何必须复制或遵循的文件、签名、类型或约定

2. **`<acceptance_criteria>`** — 证明任务正确完成的可验证条件。规则：
   - 每个标准必须能通过 grep、文件读取、测试命令或 CLI 输出检查
   - 永远不要使用主观语言（"看起来正确"、"配置正确"、"与...一致"）
   - 始终包含必须存在的确切字符串、模式、值或命令输出
   - 示例：
     - 代码：`auth.py 包含 def verify_token(` / `test_auth.py 退出码为 0`
     - 配置：`.env.example 包含 DATABASE_URL=` / `Dockerfile 包含 HEALTHCHECK`
     - 文档：`README.md 包含 '## Installation'` / `API.md 列出所有端点`
     - 基础设施：`deploy.yml 有回滚步骤` / `docker-compose.yml 有数据库健康检查`

3. **`<action>`** — 必须包含具体值，而不是引用。规则：
   - 永远不要说"将 X 与 Y 对齐"、"将 X 匹配到 Y"、"更新为与...一致"，而不指定确切的目标状态
   - 始终包含实际值：配置键、函数签名、SQL 语句、类名、导入路径、环境变量等
   - 如果 CONTEXT.md 有比较表或预期值，将它们逐字复制到动作中
   - 执行者应该能够从动作文本单独完成任务，而不需要阅读 CONTEXT.md 或参考文件（read_first 用于验证，不是发现）

**为什么这很重要：** 执行者代理从计划文本工作。像"更新配置以匹配生产"这样的模糊指令会产生浅层的单行更改。像"添加 DATABASE_URL=postgresql://...，设置 POOL_SIZE=20，添加 REDIS_URL=redis://..."这样的具体指令会产生完整的工作。详细计划的成本远低于重新做浅层执行的成本。
</deep_work_rules>

<quality_gate>
- [ ] 阶段目录中创建了 PLAN.md 文件
- [ ] 每个计划都有有效的前置信息
- [ ] 任务具体且可操作
- [ ] 每个任务都有 `<read_first>` 且至少包含正在修改的文件
- [ ] 每个任务都有 `<acceptance_criteria>` 且包含可 grep 验证的条件
- [ ] 每个 `<action>` 包含具体值（没有不指定具体内容的"将 X 与 Y 对齐"）
- [ ] 依赖关系正确识别
- [ ] 波正确分配用于并行执行
- [ ] must_haves 从阶段目标派生
</quality_gate>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Plan Phase {phase}"
)
```

## 9. 处理规划器返回

- **`## PLANNING COMPLETE`：** 显示计划数量。如果 `--skip-verify` 或 `plan_checker_enabled` 为 false（来自 init）：跳到步骤 13。否则：步骤 10。
- **`## CHECKPOINT REACHED`：** 向用户展示，获取响应，生成继续（步骤 12）
- **`## PLANNING INCONCLUSIVE`：** 显示尝试，提供：添加上下文 / 重试 / 手动

## 10. 生成 gsd-plan-checker 代理

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在验证计划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 正在生成计划检查器...
```

检查器提示：

```markdown
<verification_context>
**阶段：** {phase_number}
**阶段目标：** {来自 ROADMAP 的 goal}

<files_to_read>
- {PHASE_DIR}/*-PLAN.md（要验证的计划）
- {roadmap_path}（路线图）
- {requirements_path}（需求）
- {context_path}（来自 /gsd:discuss-phase 的用户决策）
- {research_path}（技术研究 — 包含验证架构）
</files_to_read>

**阶段需求 ID（必须全部涵盖）：** {phase_req_ids}

**项目说明：** 如果存在，读取 ./CLAUDE.md — 验证计划遵守项目指导原则
**项目技能：** 检查 .claude/skills/ 或 .agents/skills/ 目录（如果任一存在）— 验证计划考虑项目技能规则
</verification_context>

<expected_output>
- ## 验证通过 — 所有检查通过
- ## 发现问题 — 结构化问题列表
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="Verify Phase {phase} plans"
)
```

## 11. 处理检查器返回

- **`## VERIFICATION PASSED`：** 显示确认，继续步骤 13。
- **`## ISSUES FOUND`：** 显示问题，检查迭代次数，继续步骤 12。

## 12. 修订循环（最多 3 次迭代）

跟踪 `iteration_count`（初始计划 + 检查后从 1 开始）。

**如果 iteration_count < 3：**

显示：`发送回规划器进行修订...（迭代 {N}/3）`

修订提示：

```markdown
<revision_context>
**阶段：** {phase_number}
**模式：** 修订

<files_to_read>
- {PHASE_DIR}/*-PLAN.md（现有计划）
- {context_path}（来自 /gsd:discuss-phase 的用户决策）
</files_to_read>

**检查器问题：** {来自检查器的结构化问题}
</revision_context>

<instructions>
针对检查器问题进行有针对性的更新。
除非问题是根本性的，否则不要从头重新计划。
返回已更改的内容。
</instructions>
```

```
Task(
  prompt=revision_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Revise Phase {phase} plans"
)
```

规划器返回后 → 再次生成检查器（步骤 10），递增 iteration_count。

**如果 iteration_count >= 3：**

显示：`达到最大迭代次数。仍剩 {N} 个问题：` + 问题列表

提供：1) 强制继续，2) 提供指导并重试，3) 放弃

## 13. 显示最终状态

根据标志/配置路由到 `<offer_next>` 或 `auto_advance`。

## 14. 自动推进检查

检查自动推进触发器：

1. 从 $ARGUMENTS 解析 `--auto` 标志
2. **将链标志与意图同步** — 如果用户手动调用（没有 `--auto`），清除来自任何先前中断的 `--auto` 链的临时链标志。这不会影响 `workflow.auto_advance`（用户的持久设置偏好）：
   ```bash
   if [[ ! "$ARGUMENTS" =~ --auto ]]; then
     node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false 2>/dev/null
   fi
   ```
3. 读取链标志和用户偏好：
   ```bash
   AUTO_CHAIN=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow._auto_chain_active 2>/dev/null || echo "false")
   AUTO_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.auto_advance 2>/dev/null || echo "false")
   ```

**如果存在 `--auto` 标志 OR `AUTO_CHAIN` 为 true OR `AUTO_CFG` 为 true：**

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 自动推进到执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

计划准备就绪。正在启动 execute-phase...
```

使用 Skill 工具启动 execute-phase 以避免嵌套的 Task 会话（由于深度代理嵌套导致运行时冻结）：
```
Skill(skill="gsd:execute-phase", args="${PHASE} --auto --no-transition")
```

`--no-transition` 标志告诉 execute-phase 在验证后返回状态而不是进一步链接。这使自动推进链扁平化 — 每个阶段在同一嵌套级别运行，而不是生成更深的 Task 代理。

**处理 execute-phase 返回：**
- **阶段完成** → 显示最终摘要：
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GSD ► 阶段 ${PHASE} 完成 ✓
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  自动推进流水线已完成。

  下一个：/gsd:discuss-phase ${NEXT_PHASE} --auto
  ```
- **发现差距 / 验证失败** → 显示结果，停止链：
  ```
  自动推进停止：执行需要审查。

  审查上面的输出并手动继续：
  /gsd:execute-phase ${PHASE}
  ```

**如果既不是 `--auto` 也不启用配置：**
路由到 `<offer_next>`（现有行为）。

</process>

<offer_next>
直接输出此 markdown（不是代码块）：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 阶段 {X} 已计划 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**阶段 {X}: {名称}** — {N} 个计划，分 {M} 个波执行

| 波 | 计划 | 构建内容 |
|------|-------|----------------|
| 1    | 01, 02 | [目标] |
| 2    | 03     | [目标]  |

研究：{已完成 | 使用现有 | 跳过}
验证：{通过 | 通过覆盖 | 跳过}

───────────────────────────────────────────────────────────────

## ▶ 下一步

**执行阶段 {X}** — 运行所有 {N} 个计划

/gsd:execute-phase {X}

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**还可用：**
- cat .planning/phases/{phase-dir}/*-PLAN.md — 审查计划
- /gsd:plan-phase {X} --research — 先重新研究

───────────────────────────────────────────────────────────────
</offer_next>

<success_criteria>
- [ ] .planning/ 目录已验证
- [ ] 阶段已在路线图中验证
- [ ] 如果需要已创建阶段目录
- [ ] 早期加载 CONTEXT.md（步骤 4）并传递给所有代理
- [] 研究完成（除非 --skip-research 或 --gaps 或存在）
- [ ] gsd-phase-researcher 已生成并使用 CONTEXT.md
- [ ] 现有计划已检查
- [ ] gsd-planner 已生成并使用 CONTEXT.md + RESEARCH.md
- [ ] 计划已创建（PLANNING COMPLETE 或 CHECKPOINT 已处理）
- [ ] gsd-plan-checker 已生成并使用 CONTEXT.md
- [ ] 验证通过 OR 用户覆盖 OR 最大迭代次数与用户决策
- [ ] 用户在代理生成之间看到状态
- [ ] 用户知道下一步
</success_criteria>
