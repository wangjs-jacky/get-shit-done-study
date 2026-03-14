<required_reading>

**立即阅读这些文件：**

1. `.planning/STATE.md`
2. `.planning/PROJECT.md`
3. `.planning/ROADMAP.md`
4. 当前阶段的计划文件（`*-PLAN.md`）
5. 当前阶段的摘要文件（`*-SUMMARY.md`）

</required_reading>

<purpose>

标记当前阶段完成并推进到下一个阶段。这是进度跟踪和 PROJECT.md 演变的自然节点。

"规划下一阶段" = "当前阶段已完成"

</purpose>

<process>

<step name="load_project_state" priority="first">

过渡前读取项目状态：

```bash
cat .planning/STATE.md 2>/dev/null
cat .planning/PROJECT.md 2>/dev/null
```

解析当前位置以验证我们正在转换正确的阶段。
记录可能需要在过渡后更新的累积上下文。

</step>

<step name="verify_completion">

检查当前阶段是否有所有计划摘要：

```bash
ls .planning/phases/XX-current/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-current/*-SUMMARY.md 2>/dev/null | sort
```

**验证逻辑：**

- 计算 PLAN 文件数量
- 计算 SUMMARY 文件数量
- 如果数量匹配：所有计划完成
- 如果数量不匹配：不完整

<config-check>

```bash
cat .planning/config.json 2>/dev/null
```

</config-check>

**如果所有计划完成：**

<if mode="yolo">

```
⚡ 自动批准：阶段 [X] → 阶段 [X+1]
阶段 [X] 完成 — 所有 [Y] 个计划已完成。

继续标记完成并推进...
```

直接进入 cleanup_handoff 步骤。

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

询问："阶段 [X] 完成 — 所有 [Y] 个计划已完成。准备标记完成并移动到阶段 [X+1] 吗？"

等待确认后再继续。

</if>

**如果计划不完整：**

**安全防护：always_confirm_destructive 在此适用。**
跳过不完整的计划是破坏性操作 — 始终提示，无论模式如何。

显示：

```
阶段 [X] 有不完整的计划：
- {phase}-01-SUMMARY.md ✓ 完成
- {phase}-02-SUMMARY.md ✗ 缺失
- {phase}-03-SUMMARY.md ✗ 缺失

⚠️ 安全防护：跳过计划需要确认（破坏性操作）

选项：
1. 继续当前阶段（执行剩余计划）
2. 标记完成 anyway（跳过剩余计划）
3. 查看剩余内容
```

等待用户决定。

</step>

<step name="cleanup_handoff">

检查是否有悬而未决的交接点：

```bash
ls .planning/phases/XX-current/.continue-here*.md 2>/dev/null
```

如果找到，删除它们 — 阶段已完成，交接点已过时。

</step>

<step name="update_roadmap_and_state>

**将 ROADMAP.md 和 STATE.md 的更新委托给 gsd-tools：**

```bash
TRANSITION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase complete "${current_phase}")
```

CLI 处理：
- 将阶段复选框标记为 `[x]` 完成并添加今天日期
- 更新计划计数为最终数量（例如，"3/3 个计划完成"）
- 更新进度表（状态 → Complete，添加日期）
- 将 STATE.md 推进到下一个阶段（Current Phase，Status → Ready to plan，Current Plan → Not started）
- 检测这是否是里程碑的最后一个阶段

从结果中提取：`completed_phase`，`plans_executed`，`next_phase`，`next_phase_name`，`is_last_phase`。

</step>

<step name="archive_prompts>

如果为阶段生成了提示，它们将保留在原位。
create-meta-prompts 中的 `completed/` 子文件夹模式处理归档。

</step>

<step name="evolve_project>

让 PROJECT.md 反映已完成阶段的经验教训。

**读取阶段摘要：**

```bash
cat .planning/phases/XX-current/*-SUMMARY.md
```

**评估需求变更：**

1. **需求已验证？**
   - 本阶段是否发布了任何 Active 需求？
   - 移动到 Validated 并引用阶段：`- ✓ [需求] — 阶段 X`

2. **需求已失效？**
   - 发现任何 Active 需求不必要或错误？
   - 移动到 Out of Scope 并说明原因：`- [需求] — [失效原因]`

3. **需求出现了？**
   - 在构建过程中发现任何新需求？
   - 添加到 Active：`- [ ] [新需求]`

4. **需要记录的决策？**
   - 从 SUMMARY.md 文件中提取决策
   - 添加到 Key Decisions 表，如果已知结果

5. **"这是什么" 仍然准确？**
   - 如果产品有重大变化，更新描述
   - 保持其当前和准确

**更新 PROJECT.md：**

进行内联编辑。更新 "Last updated" 页脚：

```markdown
---
*最后更新：[日期] 阶段 [X] 之后*
```

**演变示例：**

之前：

```markdown
### Active

- [ ] JWT 认证
- [ ] 实时同步 < 500ms
- [ ] 离线模式

### Out of Scope

- OAuth2 — v1 不需要复杂性
```

之后（阶段 2 发布了 JWT 认证，发现需要速率限制）：

```markdown
### Validated

- ✓ JWT 认证 — 阶段 2

### Active

- [ ] 实时同步 < 500ms
- [ ] 离线模式
- [ ] 同步端点速率限制

### Out of Scope

- OAuth2 — v1 不需要复杂性
```

**步骤完成时：**

- [ ] 查阅阶段摘要获取经验教训
- [ ] 已验证的需求从 Active 移动
- [ ] 失效的需求移至 Out of Scope 并说明原因
- [ ] 出现的需求添加到 Active
- [ ] 新的决策记录了理由
- [ ] 如果产品发生变化，更新 "这是什么"
- [ ] "Last updated" 页脚反映此次过渡

</step>

<step name="update_current_position_after_transition>

**注意：** 基本位置更新（Current Phase, Status, Current Plan, Last Activity）已通过 `gsd-tools phase complete` 在 update_roadmap_and_state 步骤中处理。

通过读取 STATE.md 验证更新是否正确。如果进度条需要更新，使用：

```bash
PROGRESS=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

使用结果更新 STATE.md 中的进度条行。

**步骤完成时：**

- [ ] 阶段编号增加到下一个阶段（由 phase complete 完成）
- [ ] 计划状态重置为 "Not started"（由 phase complete 完成）
- [ ] 状态显示 "Ready to plan"（由 phase complete 完成）
- [ ] 进度条反映已完成的计划总数

</step>

<step name="update_project_reference>

更新 STATE.md 中的 Project Reference 部分。

```markdown
## Project Reference

See: .planning/PROJECT.md (updated [today])

**Core value:** [来自 PROJECT.md 的当前核心价值]
**Current focus:** [下一阶段名称]
```

更新日期和当前焦点以反映过渡。

</step>

<step name="review_accumulated_context>

审查并更新 STATE.md 中的 Accumulated Context 部分。

**决策：**

- 记录本阶段的近期决策（最多 3-5 个）
- 完整日志在 PROJECT.md Key Decisions 表中

**阻塞器/问题：**

- 查看已完成阶段的阻塞器
- 如果在此阶段解决：从列表中移除
- 如果对未来仍然相关：保留并添加 "Phase X" 前缀
- 添加来自已完成阶段摘要的任何新问题

**示例：**

之前：

```markdown
### Blockers/Concerns

- ⚠️ [阶段 1] 数据库架构未为常见查询建立索引
- ⚠️ [阶段 2] 不稳定网络上的 WebSocket 重连行为未知
```

之后（如果在阶段 2 中解决了数据库索引）：

```markdown
### Blockers/Concerns

- ⚠️ [阶段 2] 不稳定网络上的 WebSocket 重连行为未知
```

**步骤完成时：**

- [ ] 记录近期决策（完整日志在 PROJECT.md 中）
- [ ] 已解决的阻塞器从列表中移除
- [ ] 未解决的阻塞器保留阶段前缀
- [ ] 添加来自已完成阶段的新问题

</step>

<step name="update_session_continuity_after_transition>

更新 STATE.md 中的 Session Continuity 部分以反映过渡完成。

**格式：**

```markdown
Last session: [today]
Stopped at: Phase [X] complete, ready to plan Phase [X+1]
Resume file: None
```

**步骤完成时：**

- [ ] Last session 时间戳更新为当前日期和时间
- [ ] Stopped at 描述阶段完成和下一阶段
- [ ] Resume file 确认为 None（过渡不使用恢复文件）

</step>

<step name="offer_next_phase>

**必须：在呈现下一步之前验证里程碑状态。**

**使用 `gsd-tools phase complete` 的过渡结果：**
`phase complete` 结果中的 `is_last_phase` 字段直接告诉您：
- `is_last_phase: false` → 还有更多阶段 → 转到 **路线 A**
- `is_last_phase: true` → 里程碑完成 → 转到 **路线 B**

`next_phase` 和 `next_phase_name` 字段提供下一阶段详细信息。

如果需要额外上下文，使用：
```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

这返回所有阶段及其目标、磁盘状态和完成信息。

---

**路线 A：里程碑中还有更多阶段**

读取 ROADMAP.md 获取下一阶段的名称和目标。

**检查下一阶段是否有 CONTEXT.md：**

```bash
ls .planning/phases/*[X+1]*/*-CONTEXT.md 2>/dev/null
```

**如果下一阶段存在：**

<if mode="yolo">

**如果 CONTEXT.md 存在：**

```
阶段 [X] 已标记完成。

下一步：阶段 [X+1] — [名称]

⚡ 自动继续：详细规划阶段 [X+1]
```

退出技能并调用 SlashCommand("/gsd:plan-phase [X+1] --auto")

**如果 CONTEXT.md 不存在：**

```
阶段 [X] 已标记完成。

下一步：阶段 [X+1] — [名称]

⚡ 自动继续：先讨论阶段 [X+1]
```

退出技能并调用 SlashCommand("/gsd:discuss-phase [X+1] --auto")

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

**如果 CONTEXT.md 不存在：**

```
## ✓ 阶段 [X] 完成

---

## ▶ 下一步

**阶段 [X+1]: [名称]** — [来自 ROADMAP.md 的目标]

`/gsd:discuss-phase [X+1]` — 收集上下文并明确方法

<sub>`/clear` first → fresh context window</sub>

---

**也可用：**
- `/gsd:plan-phase [X+1]` — 跳过讨论，直接规划
- `/gsd:research-phase [X+1]` — 调查未知因素

---
```

**如果 CONTEXT.md 存在：**

```
## ✓ 阶段 [X] 完成

---

## ▶ 下一步

**阶段 [X+1]: [名称]** — [来自 ROADMAP.md 的目标]
<sub>✓ 上下文已收集，准备规划</sub>

`/gsd:plan-phase [X+1]`

<sub>`/clear` first → fresh context window</sub>

---

**也可用：**
- `/gsd:discuss-phase [X+1]` — 重新查看上下文
- `/gsd:research-phase [X+1]` — 调查未知因素

---
```

</if>

---

**路线 B：里程碑完成（所有阶段完成）**

**清除自动推进链标志** — 里程碑边界是自然的停止点：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false
```

<if mode="yolo">

```
阶段 {X} 已标记完成。

🎉 里程碑 {version} 100% 完成 — 所有 {N} 个阶段已完成！

⚡ 自动继续：完成里程碑并归档
```

退出技能并调用 SlashCommand("/gsd:complete-milestone {version}")

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

```
## ✓ 阶段 {X}: {阶段名称} 完成

🎉 里程碑 {version} 100% 完成 — 所有 {N} 个阶段已完成！

---

## ▶ 下一步

**完成里程碑 {version}** — 归档并准备下一个阶段

`/gsd:complete-milestone {version}`

<sub>`/clear` first → fresh context window</sub>

---

**也可用：**
- 归档前查看成就

---
```

</if>

</step>

</process>

<implicit_tracking>

进度跟踪是隐式的：规划阶段 N 意味着阶段 1-(N-1) 已完成。没有单独的进度步骤 — 前进就是进度。
</implicit_tracking>

<partial_completion>

如果用户想继续但阶段没有完全完成：

```
阶段 [X] 有不完整的计划：
- {phase}-02-PLAN.md（未执行）
- {phase}-03-PLAN.md（未执行）

选项：
1. 标记完成 anyway（计划不需要）
2. 推迟工作到后续阶段
3. 留在当前阶段完成
```

尊重用户判断 — 他们知道工作是否重要。

**如果标记完成且计划不完整：**

- 更新 ROADMAP："2/3 个计划完成"（不是 "3/3"）
- 在过渡消息中记录跳过了哪些计划

</partial_completion>

<success_criteria>

过渡完成时：

- [ ] 当前阶段计划摘要已验证（全部存在或用户选择跳过）
- [ ] 任何过期的交接点已删除
- [ ] ROADMAP.md 已更新完成状态和计划计数
- [ ] PROJECT.md 已演变（需求、决策、描述如需要）
- [ ] STATE.md 已更新（位置、项目引用、上下文、会话）
- [ ] 进度表已更新
- [ ] 用户知道下一步

</success_criteria>