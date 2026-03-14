<required_reading>

**立即阅读这些文件：**

1. `.planning/STATE.md`
2. `.planning/PROJECT.md`
3. `.planning/ROADMAP.md`
4. 当前阶段的计划文件（`*-PLAN.md`）
5. 当前阶段的摘要文件（`*-SUMMARY.md`）

</required_reading>

<purpose>

将当前阶段标记为完成并前进到下一阶段。这是进度跟踪和 PROJECT.md 演化的自然点。

"规划下一阶段" = "当前阶段已完成"
</purpose>

<process>

<step name="load_project_state" priority="first">

在过渡前，读取项目状态：

```bash
cat .planning/STATE.md 2>/dev/null
cat .planning/PROJECT.md 2>/dev/null
```

解析当前位置以验证我们在过渡正确的阶段。
注意可能需要在过渡后更新的累积上下文。

</step>

<step name="verify_completion">

检查当前阶段是否有所有计划摘要：

```bash
ls .planning/phases/XX-current/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-current/*-SUMMARY.md 2>/dev/null | sort
```

**验证逻辑：**

- 计划文件数量
- 摘要文件数量
- 如果数量匹配：所有计划完成
- 如果数量不匹配：不完整

<config-check>

```bash
cat .planning/config.json 2>/dev/null
```

</config-check>

**如果所有计划都完成：**

<if mode="yolo">

```
⚡ 自动批准：过渡阶段 [X] → 阶段 [X+1]
阶段 [X] 完成 — 所有 [Y] 个计划已完成。

继续标记完成并前进...
```

直接继续到 cleanup_handoff 步骤。

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

询问："阶段 [X] 完成 — 所有 [Y] 个计划已完成。准备标记完成并移动到阶段 [X+1] 吗？"

在继续前等待确认。

</if>

**如果计划不完整：**

**安全检查：always_confirm_destructive 在这里适用。**
跳过不完整的计划是破坏性操作 — 总是需要确认，无论模式如何。

展示：

```
阶段 [X] 有不完整的计划：
- {phase}-01-SUMMARY.md ✓ 完成
- {phase}-02-SUMMARY.md ✗ 缺失
- {phase}-03-SUMMARY.md ✗ 缺失

⚠️ 安全检查：跳过计划需要确认（破坏性操作）

选项：
1. 继续当前阶段（执行剩余计划）
2. 标记为完成 anyway（跳过剩余计划）
3. 查看剩余内容
```

等待用户决策。

</step>

<step name="cleanup_handoff">

检查是否有遗留的移交文件：

```bash
ls .planning/phases/XX-current/.continue-here*.md 2>/dev/null
```

如果找到，删除它们 — 阶段已完成，移交文件已过时。

</step>

<step name="update_roadmap_and_state">

**将 ROADMAP.md 和 STATE.md 更新委托给 gsd-tools：**

```bash
TRANSITION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase complete "${current_phase}")
```

CLI 处理：
- 将阶段复选框标记为 `[x]` 完成，日期为今天
- 将计划计数更新为最终数量（例如，"3/3 个计划完成"）
- 更新进度表（状态 → 完成，添加日期）
- 将 STATE.md 前进到下一阶段（当前阶段，状态 → 准备规划，当前计划 → 未开始）
- 检测这是否是里程碑中的最后一个阶段

从结果中提取：`completed_phase`, `plans_executed`, `next_phase`, `next_phase_name`, `is_last_phase`。

</step>

<step name="archive_prompts">

如果为阶段生成了提示，它们保持原位。
`create-meta-prompts` 中的 `completed/` 子文件夹模式处理归档。

</step>

<step name="evolve_project">

使 PROJECT.md 反映已完成阶段的成果。

**读取阶段摘要：**

```bash
cat .planning/phases/XX-current/*-SUMMARY.md
```

**评估需求变更：**

1. **需求是否验证？**
   - 任何活跃需求在本阶段交付了吗？
   - 移动到已验证并添加阶段引用：`- ✓ [需求] — 阶段 X`

2. **需求是否失效？**
   - 任何活跃需求被发现不必要或错误吗？
   - 移动到范围外并说明原因：`- [需求] — [失效原因]`

3. **需求是否出现？**
   - 在构建过程中发现了任何新需求吗？
   - 添加到活跃：`- [ ] [新需求]`

4. **要记录的决策？**
   - 从 SUMMARY.md 文件中提取决策
   - 带有结果（如果已知）添加到关键决策表

5. **"这是什么" 仍然准确吗？**
   - 如果产品有意义的更改，更新描述
   - 保持当前和准确

**更新 PROJECT.md：**

内联进行编辑。更新"最后更新"页脚：

```markdown
---
*最后更新：[日期] 阶段 [X] 后*
```

**示例演化：**

前：

```markdown
### 活跃

- [ ] JWT 认证
- [ ] 实时同步 < 500ms
- [ ] 离线模式

### 范围外

- OAuth2 — v1 不需要复杂性
```

后（阶段 2 交付了 JWT 认证，发现需要速率限制）：

```markdown
### 已验证

- ✓ JWT 认证 — 阶段 2

### 活跃

- [ ] 实时同步 < 500ms
- [ ] 离线模式
- [ ] 同步端点速率限制

### 范围外

- OAuth2 — v1 不需要复杂性
```

**步骤完成时：**

- [ ] 已审查阶段摘要以获取成果
- [ ] 已验证的需求从活跃移动
- [ ] 失效的需求已移至范围外并说明原因
- [ ] 出现的需求已添加到活跃
- [ ] 新决策已记录并说明理由
- [ ] "这是什么" 如果产品有更改则更新
- [ ] "最后更新" 页脚反映此过渡

</step>

<step name="update_current_position_after_transition">

**注意：** 基本位置更新（当前阶段、状态、当前计划、最后活动）已在 update_roadmap_and_state 步骤中由 `gsd-tools phase complete` 处理。

通过读取 STATE.md 验证更新是否正确。如果进度条需要更新，使用：

```bash
PROGRESS=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

使用结果更新 STATE.md 中的进度条行。

**步骤完成时：**

- [ ] 阶段编号已递增到下一阶段（由阶段完成完成）
- [ ] 计划状态重置为"未开始"（由阶段完成完成）
- [ ] 状态显示"准备规划"（由阶段完成完成）
- [ ] 进度条反映总完成计划数

</step>

<step name="update_project_reference">

更新 STATE.md 中的项目引用部分。

```markdown
## 项目参考

查看：.planning/PROJECT.md（更新于 [今天]）

**核心价值：** [来自 PROJECT.md 的当前核心价值]
**当前焦点：** [下一阶段名称]
```

更新日期和当前焦点以反映过渡。

</step>

<step name="review_accumulated_context">

审查和更新 STATE.md 中的累积上下文部分。

**决策：**

- 记录本阶段的近期决策（3-5 个最多）
- 完整日志存在于 PROJECT.md 的关键决策表中

**阻碍/关注点：**

- 审查已完成阶段的阻碍
- 如果在本阶段解决：从列表中移除
- 如果对未来仍相关：保留并添加"阶段 X"前缀
- 添加已完成阶段摘要中的任何新关注点

**示例：**

前：

```markdown
### 阻碍/关注点

- ⚠️ [阶段 1] 数据库模式未为常见查询建立索引
- ⚠️ [阶段 2] 在不稳定网络上的 WebSocket 重连行为未知
```

后（如果数据库索引在阶段 2 中解决）：

```markdown
### 阻碍/关注点

- ⚠️ [阶段 2] 在不稳定网络上的 WebSocket 重连行为未知
```

**步骤完成时：**

- [ ] 近期决策已记录（完整日志在 PROJECT.md 中）
- [ ] 已解决的阻碍已从列表中移除
- [ ] 未解决的阻碍保留阶段前缀
- [ ] 已添加已完成阶段的新关注点

</step>

<step name="update_session_continuity_after_transition">

更新 STATE.md 中的会话连续性部分以反映过渡完成。

**格式：**

```markdown
最后会话：[今天]
停止于：阶段 [X] 完成，准备规划阶段 [X+1]
移交文件：无
```

**步骤完成时：**

- [ ] 最后会话时间戳已更新为当前日期和时间
- [ ] 停止于描述阶段完成和下一阶段
- [ ] 移交文件确认为无（过渡不使用移交文件）

</step>

<step name="offer_next_phase">

**必须：在呈现下一步之前验证里程碑状态。**

**使用来自 `gsd-tools phase complete` 的过渡结果：**

来自阶段完成结果的 `is_last_phase` 字段直接告诉您：
- `is_last_phase: false` → 还有更多阶段 → 转到 **路线 A**
- `is_last_phase: true` → 里程碑完成 → 转到 **路线 B**

`next_phase` 和 `next_phase_name` 字段为您提供下一阶段详情。

如果您需要额外上下文，使用：
```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

这返回带有目标、磁盘状态和完成信息的所有阶段。

---

**路线 A：里程碑中仍有更多阶段**

读取 ROADMAP.md 获取下一阶段的名称和目标。

**检查下一阶段是否有 CONTEXT.md：**

```bash
ls .planning/phases/*[X+1]*/*-CONTEXT.md 2>/dev/null
```

**如果下一阶段存在：**

<if mode="yolo">

**如果 CONTEXT.md 存在：**

```
阶段 [X] 已标记为完成。

接下来：阶段 [X+1] — [名称]

⚡ 自动继续：详细规划阶段 [X+1]
```

退出技能并调用 SlashCommand("/gsd:plan-phase [X+1] --auto")

**如果 CONTEXT.md 不存在：**

```
阶段 [X] 已标记为完成。

接下来：阶段 [X+1] — [名称]

⚡ 自动继续：首先讨论阶段 [X+1]
```

退出技能并调用 SlashCommand("/gsd:discuss-phase [X+1] --auto")

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

**如果 CONTEXT.md 不存在：**

```
## ✓ 阶段 [X] 完成

---

## ▶ 接下来

**阶段 [X+1]: [名称]** — [来自 ROADMAP.md 的目标]

`/gsd:discuss-phase [X+1]` — 收集上下文并明确方法

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- `/gsd:plan-phase [X+1]` — 跳过讨论，直接规划
- `/gsd:research-phase [X+1]` — 调查未知数

---
```

**如果 CONTEXT.md 存在：**

```
## ✓ 阶段 [X] 完成

---

## ▶ 接下来

**阶段 [X+1]: [名称]** — [来自 ROADMAP.md 的目标]
<sub>✓ 上下文已收集，准备规划</sub>

`/gsd:plan-phase [X+1]`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- `/gsd:discuss-phase [X+1]` — 重新审视上下文
- `/gsd:research-phase [X+1]` — 调查未知数

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
阶段 {X} 已标记为完成。

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

## ▶ 接下来

**完成里程碑 {version}** — 归档并为下一个做准备

`/gsd:complete-milestone {version}`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- 归档前审查成果

---
```

</if>

</step>

</process>

<implicit_tracking>
进度跟踪是隐式的：规划阶段 N 意味着阶段 1-(N-1) 完成。没有单独的进度步骤 — 前进就是进度。
</implicit_tracking>

<partial_completion>

如果用户想继续但阶段未完全完成：

```
阶段 [X] 有不完整的计划：
- {phase}-02-PLAN.md（未执行）
- {phase}-03-PLAN.md（未执行）

选项：
1. 标记为完成 anyway（计划不需要）
2. 将工作推迟到后续阶段
3. 停留在当前阶段完成
```

尊重用户判断 — 他们知道工作是否重要。

**如果标记不完整计划为完成：**

- 更新 ROADMAP："2/3 个计划完成"（不是"3/3"）
- 在过渡消息中注明跳过了哪些计划

</partial_completion>

<success_criteria>

过渡完成时：

- [ ] 验证当前阶段计划摘要（全部存在或用户选择跳过）
- [ ] 任何过时的移交文件已删除
- [ ] ROADMAP.md 已更新完成状态和计划计数
- [ ] PROJECT.md 已演化（需求、决策、描述如需要）
- [ ] STATE.md 已更新（位置、项目引用、上下文、会话）
- [ ] 进度表已更新
- [ ] 用户知道下一步

</success_criteria>