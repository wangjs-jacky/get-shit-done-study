<purpose>
检查项目进度，总结最近工作和未来计划，然后智能路由到下一个动作 — 执行现有计划或创建新计划。在继续工作前提供情况感知。
</purpose>

<required_reading>
在开始前，读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="init_context">
**加载进度上下文（仅使用路径）：**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init progress)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 提取：`project_exists`, `roadmap_exists`, `state_exists`, `phases`, `current_phase`, `next_phase`, `milestone_version`, `completed_count`, `phase_count`, `paused_at`, `state_path`, `roadmap_path`, `project_path`, `config_path`。

如果 `project_exists` 为 false（没有 `.planning/` 目录）：

```
未找到规划结构。

运行 /gsd:new-project 开始新项目。
```

退出。

如果缺少 STATE.md：建议 `/gsd:new-project`。

**如果 ROADMAP.md 缺失但 PROJECT.md 存在：**

这意味着里程碑已完成并已归档。前往**路线 F**（里程碑之间）。

如果同时缺少 ROADMAP.md 和 PROJECT.md：建议 `/gsd:new-project`。
</step>

<step name="load">
**使用 gsd-tools 的结构化提取：**

不是读取完整文件，而是使用目标工具仅获取报告所需的数据：
- `ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)`
- `STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state-snapshot)`

这最小化了协调器上下文使用。
</step>

<step name="analyze_roadmap">
**获取全面的路线图分析（替代手动解析）：**

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

这返回结构化的 JSON，包含：
- 所有阶段及磁盘状态（完成/部分/计划中/空/无目录）
- 每个阶段的目标和依赖
- 每个阶段的计划和摘要计数
- 聚合统计：总计划数、总摘要数、进度百分比
- 当前和下一阶段识别

使用这替代手动读取/解析 ROADMAP.md。
</step>

<step name="recent">
**收集最近工作上下文：**

- 找出 2-3 个最新的 SUMMARY.md 文件
- 使用 `summary-extract` 进行高效解析：
  ```bash
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract <path> --fields one_liner
  ```
- 这显示"我们一直在做什么"
</step>

<step name="position">
**从 init 上下文和路线图分析解析当前位置：**

- 使用 `$ROADMAP` 中的 `current_phase` 和 `next_phase`
- 如果工作被暂停，注意 `paused_at`（来自 `$STATE`）
- 计算待办事项：使用 `init todos` 或 `list-todos`
- 检查活动的调试会话：`ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l`
</step>

<step name="report">
**从 gsd-tools 生成进度条，然后呈现丰富的状态报告：**

```bash
# 获取格式化的进度条
PROGRESS_BAR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

呈现：

```
# [项目名称]

**进度：** {PROGRESS_BAR}
**配置：** [quality/balanced/budget]

## 最近工作
- [阶段 X, 计划 Y]: [完成内容 - 来自 summary-extract 的一行]
- [阶段 X, 计划 Z]: [完成内容 - 来自 summary-extract 的一行]

## 当前位置
阶段 [总数] 中的 [N]: [阶段名称]
阶段 [阶段总数] 中的计划 [M]: [状态]
上下文: [✓ 如果有 | 如果没有则 -]

## 关键决策
- [从 $STATE.decisions[] 提取]
- [例如来自 state-snapshot 的 jq -r '.decisions[].decision']

## 阻塞器/关注点
- [从 $STATE.blockers[] 提取]
- [例如来自 state-snapshot 的 jq -r '.blockers[].text']

## 待办事项
- [计数] 个待办 — /gsd:check-todos 查看

## 活动调试会话
- [计数] 个活动 — /gsd:debug 继续
（仅当计数 > 0 时显示此部分）

## 下一步
[来自路线图分析的下个阶段/计划目标]
```

</step>

<step name="route">
**根据验证的数量确定下一个动作。**

**步骤 1：计算当前阶段的计划、摘要和问题数量**

列出当前阶段的文件：

```bash
ls -1 .planning/phases/[当前阶段目录]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[当前阶段目录]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[当前阶段目录]/*-UAT.md 2>/dev/null | wc -l
```

状态："此阶段有 {X} 个计划，{Y} 个摘要。"

**步骤 1.5：检查未处理的 UAT 差距**

检查状态为"diagnosed"（有需要修复的差距）的 UAT.md 文件。

```bash
# 检查有差距的诊断 UAT
grep -l "status: diagnosed" .planning/phases/[当前阶段目录]/*-UAT.md 2>/dev/null
```

跟踪：
- `uat_with_gaps`：状态为"diagnosed"（差距需要修复）的 UAT.md 文件

**步骤 2：根据数量路由**

| 条件 | 含义 | 动作 |
|-----------|---------|--------|
| uat_with_gaps > 0 | UAT 差距需要修复计划 | 前往**路线 E** |
| summaries < plans | 存在未执行的计划 | 前往**路线 A** |
| summaries = plans 且 plans > 0 | 阶段完成 | 前往步骤 3 |
| plans = 0 | 阶段尚未计划 | 前往**路线 B** |

---

**路线 A：存在未执行的计划**

找到第一个没有对应 SUMMARY.md 的 PLAN.md。
读取其 `<objective>` 部分。

```
---

## ▶ 下一步

**{阶段}-{计划}: [计划名称]** — [来自 PLAN.md 的目标摘要]

`/gsd:execute-phase {阶段}`

<sub>`/clear` first → fresh context window</sub>

---
```

---

**路线 B：阶段需要计划**

检查阶段目录中是否存在 `{阶段编号}-CONTEXT.md`。

**如果 CONTEXT.md 存在：**

```
---

## ▶ 下一步

**阶段 {N}: {名称}** — {来自 ROADMAP.md 的目标}
<sub>✓ 上下文已收集，准备计划</sub>

`/gsd:plan-phase {阶段编号}`

<sub>`/clear` first → fresh context window</sub>

---
```

**如果 CONTEXT.md 不存在：**

```
---

## ▶ 下一步

**阶段 {N}: {名称}** — {来自 ROADMAP.md 的目标}

`/gsd:discuss-phase {阶段}` — 收集上下文并阐明方法

<sub>`/clear` first → fresh context window</sub>

---

**还可用：**
- `/gsd:plan-phase {阶段}` — 跳过讨论，直接计划
- `/gsd:list-phase-assumptions {阶段}` — 查看 Claude 的假设

---
```

---

**路线 E：UAT 差距需要修复计划**

存在 UAT.md 且有差距（诊断的问题）。用户需要计划修复。

```
---

## ⚠ 发现 UAT 差距

**{阶段编号}-UAT.md** 有 {N} 个需要修复的差距。

`/gsd:plan-phase {阶段} --gaps`

<sub>`/clear` first → fresh context window</sub>

---

**还可用：**
- `/gsd:execute-phase {阶段}` — 执行阶段计划
- `/gsd:verify-work {阶段}` — 运行更多 UAT 测试

---
```

---

**步骤 3：检查里程碑状态（仅在阶段完成时）**

读取 ROADMAP.md 并识别：
1. 当前阶段编号
2. 当前里程碑部分中的所有阶段编号

计算总阶段数并识别最高阶段编号。

状态："当前阶段是 {X}。里程碑有 {N} 个阶段（最高：{Y}）。"

**根据里程碑状态路由：**

| 条件 | 含义 | 动作 |
|-----------|---------|--------|
| 当前阶段 < 最高阶段 | 还有更多阶段 | 前往**路线 C** |
| 当前阶段 = 最高阶段 | 里程碑完成 | 前往**路线 D** |

---

**路线 C：阶段完成，还有更多阶段**

读取 ROADMAP.md 以获取下一阶段的名称和目标。

```
---

## ✓ 阶段 {Z} 完成

## ▶ 下一步

**阶段 {Z+1}: {名称}** — {来自 ROADMAP.md 的目标}

`/gsd:discuss-phase {Z+1}` — 收集上下文并阐明方法

<sub>`/clear` first → fresh context window</sub>

---

**还可用：**
- `/gsd:plan-phase {Z+1}` — 跳过讨论，直接计划
- `/gsd:verify-work {Z}` — 继续前进行用户验收测试

---
```

---

**路线 D：里程碑完成**

```
---

## 🎉 里程碑完成

所有 {N} 个阶段完成！

## ▶ 下一步

**完成里程碑** — 归档并准备下一个

`/gsd:complete-milestone`

<sub>`/clear` first → fresh context window</sub>

---

**还可用：**
- `/gsd:verify-work` — 完成里程碑前进行用户验收测试

---
```

---

**路线 F：里程碑之间（ROADMAP.md 缺失，PROJECT.md 存在）**

里程碑已完成并已归档。准备开始下一个里程碑周期。

读取 MILESTONES.md 以找到最后一个完成的里程碑版本。

```
---

## ✓ 里程碑 v{X.Y} 完成

准备计划下一个里程碑。

## ▶ 下一步

**开始下一个里程碑** — 问题 → 研究 → 需求 → 路线图

`/gsd:new-milestone`

<sub>`/clear` first → fresh context window</sub>

---
```

</step>

<step name="edge_cases">
**处理边缘情况：**

- 阶段完成但下一阶段未计划 → 提供 `/gsd:plan-phase [下一个]`
- 所有工作完成 → 提供里程碑完成
- 存在阻塞器 → 在继续前突出显示
- 存在手递文件 → 提及它，提供 `/gsd:resume-work`
</step>

</process>

<success_criteria>

- [ ] 提供丰富的上下文（最近工作、决策、问题）
- [ ] 当前位置清晰，带有可视化进度
- [ ] 下一步清晰解释
- [ ] 智能路由：如果计划存在则 /gsd:execute-phase，否则 /gsd:plan-phase
- [ ] 用户确认任何动作前
- [ ] 无缝交接到适当的 gsd 命令
      </success_criteria>