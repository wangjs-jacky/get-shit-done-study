<purpose>
检查项目进度，总结最近的工作和接下来的任务，然后智能地路由到下一个动作 — 执行现有计划或创建下一个计划。在继续工作前提供情况感知。
</purpose>

<required_reading>
在开始之前，读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="init_context">
**加载进度上下文（仅路径）：**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init progress)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`project_exists`, `roadmap_exists`, `state_exists`, `phases`, `current_phase`, `next_phase`, `milestone_version`, `completed_count`, `phase_count`, `paused_at`, `state_path`, `roadmap_path`, `project_path`, `config_path`。

如果 `project_exists` 为 false（没有 `.planning/` 目录）：

```
未找到规划结构。

运行 /gsd:new-project 开始新项目。
```

退出。

如果缺少 STATE.md：建议 `/gsd:new-project`。

**如果 ROADMAP.md 缺失但 PROJECT.md 存在：**

这意味着里程碑已完成并已归档。转到 **路线 F**（里程碑之间）。

如果同时缺失 ROADMAP.md 和 PROJECT.md：建议 `/gsd:new-project`。
</step>

<step name="load">
**使用结构化提取工具：**

不要读取完整文件，使用目标工具仅获取报告所需的数据：
- `ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)`
- `STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state-snapshot)`

这可以最小化编排器上下文的使用。
</step>

<step name="analyze_roadmap">
**获取全面的路线图分析（替换手动解析）：**

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

这返回结构化的 JSON，包含：
- 所有阶段及其磁盘状态（完成/部分/已规划/空/无目录）
- 每个阶段的目标和依赖关系
- 每个阶段的计划和摘要计数
- 聚合统计：总计划数、摘要数、进度百分比
- 当前和下一阶段标识

使用此结果替代手动读取/解析 ROADMAP.md。
</step>

<step name="recent">
**收集近期工作上下文：**

- 查找最近 2-3 个 SUMMARY.md 文件
- 使用 `summary-extract` 进行高效解析：
  ```bash
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract <path> --fields one_liner
  ```
- 这显示"我们一直在做什么"
  </step>

<step name="position">
**从 init 上下文和路线图分析解析当前位置：**

- 使用 `$ROADMAP` 中的 `current_phase` 和 `next_phase`
- 注意 `paused_at`（如果工作被暂停，来自 `$STATE`）
- 计待办事项：使用 `init todos` 或 `list-todos`
- 检查活跃的调试会话：`ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l`
  </step>

<step name="report">
**从 gsd-tools 生成进度条，然后展示丰富的状态报告：**

```bash
# 获取格式化的进度条
PROGRESS_BAR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

展示：

```
# [项目名称]

**进度：** {PROGRESS_BAR}
**配置：** [quality/balanced/budget]

## 近期工作
- [阶段 X，计划 Y]: [完成的内容 - 摘要提取的一行]
- [阶段 X，计划 Z]: [完成的内容 - 摘要提取的一行]

## 当前位置
阶段 [N] 总共 [总数]: [阶段名称]
计划 [M] 阶段总数 [总数]: [状态]
CONTEXT: [✓ 如果有上下文 | - 如果没有]

## 关键决策
- [从 $STATE.decisions[] 中提取]
- [例如从 state-snapshot 使用 jq -r '.decisions[].decision']

## 阻碍/关注点
- [从 $STATE.blockers[] 中提取]
- [例如从 state-snapshot 使用 jq -r '.blockers[].text']

## 待办事项
- [计数] 待处理 — /gsd:check-todos 查看

## 活跃的调试会话
- [计数] 活跃 — /gsd:debug 继续
(仅当计数 > 0 时显示此部分)

## 接下来
[来自路线图分析的下一阶段/计划目标]
```

</step>

<step name="route">
**根据验证的数量确定下一个动作。**

**步骤 1：计算当前阶段的计划、摘要和问题数量**

列出当前阶段目录中的文件：

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

状态："这个阶段有 {X} 个计划，{Y} 个摘要。"

**步骤 1.5：检查未处理的 UAT 缺口**

查找状态为 "diagnosed"（有需要修复的缺口）的 UAT.md 文件。

```bash
# 检查诊断出的 UAT 缺口
grep -l "status: diagnosed" .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null
```

跟踪：
- `uat_with_gaps`: 状态为 "diagnosed" 的 UAT.md 文件（缺口需要修复）

**步骤 2：根据数量路由**

| 条件 | 含义 | 动作 |
|------|------|------|
| uat_with_gaps > 0 | UAT 缺口需要修复计划 | 转到 **路线 E** |
| summaries < plans | 存在未执行的计划 | 转到 **路线 A** |
| summaries = plans AND plans > 0 | 阶段完成 | 转到步骤 3 |
| plans = 0 | 阶段尚未规划 | 转到 **路线 B** |

---

**路线 A：存在未执行的计划**

查找第一个没有对应 SUMMARY.md 的 PLAN.md。
读取其 `<objective>` 部分。

```
---

## ▶ 接下来

**{phase}-{plan}: [计划名称]** — [来自 PLAN.md 的目标摘要]

`/gsd:execute-phase {phase}`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

---

**路线 B：阶段需要规划**

检查 `{phase_num}-CONTEXT.md` 是否存在于阶段目录中。

**如果 CONTEXT.md 存在：**

```
---

## ▶ 接下来

**阶段 {N}: {名称}** — 来自 ROADMAP.md 的目标
<sub>✓ 上下文已收集，准备规划</sub>

`/gsd:plan-phase {phase-number}`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

```

**如果 CONTEXT.md 不存在：**

```
---

## ▶ 接下来

**阶段 {N}: {名称}** — 来自 ROADMAP.md 的目标

`/gsd:discuss-phase {phase}` — 收集上下文并明确方法

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- `/gsd:plan-phase {phase}` — 跳过讨论，直接规划
- `/gsd:list-phase-assumptions {phase}` — 查看 Claude 的假设

---

---

**路线 E：UAT 缺口需要修复计划**

UAT.md 存在缺口（诊断出的问题）。用户需要规划修复。

```
---

## ⚠ 发现 UAT 缺口

**{phase_num}-UAT.md** 有 {N} 个缺口需要修复。

`/gsd:plan-phase {phase} --gaps`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- `/gsd:execute-phase {phase}` — 执行阶段计划
- `/gsd:verify-work {phase}` — 运行更多 UAT 测试

---

---

**步骤 3：检查里程碑状态（仅在阶段完成时）**

读取 ROADMAP.md 并识别：
1. 当前阶段编号
2. 当前里程碑部分中的所有阶段编号

计算总阶段数并确定最高阶段编号。

状态："当前阶段是 {X}。里程碑有 {N} 个阶段（最高：{Y}）。"

**根据里程碑状态路由：**

| 条件 | 含义 | 动作 |
|------|------|------|
| current phase < highest phase | 还有更多阶段 | 转到 **路线 C** |
| current phase = highest phase | 里程碑完成 | 转到 **路线 D** |

---

**路线 C：阶段完成，还有更多阶段**

读取 ROADMAP.md 获取下一阶段的名称和目标。

```
---

## ✓ 阶段 {Z} 完成

## ▶ 接下来

**阶段 {Z+1}: {名称}** — 来自 ROADMAP.md 的目标

`/gsd:discuss-phase {Z+1}` — 收集上下文并明确方法

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- `/gsd:plan-phase {Z+1}` — 跳过讨论，直接规划
- `/gsd:verify-work {Z}` — 在继续前进行用户验收测试

---

---

**路线 D：里程碑完成**

```
---

## 🎉 里程碑完成

所有 {N} 个阶段都已完成！

## ▶ 接下来

**完成里程碑** — 归档并为下一个做准备

`/gsd:complete-milestone`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

**也可用：**
- `/gsd:verify-work` — 在完成里程碑前进行用户验收测试

---

---

**路线 F：里程碑之间（ROADMAP.md 缺失，PROJECT.md 存在）**

里程碑已完成并已归档。准备好开始下一个里程碑周期。

读取 MILESTONES.md 查找最后完成的里程碑版本。

```
---

## ✓ 里程碑 v{X.Y} 完成

准备规划下一个里程碑。

## ▶ 接下来

**开始下一个里程碑** → 质疑 → 研究 → 需求 → 路线图

`/gsd:new-milestone`

<sub>首先使用 `/clear` → 清新的上下文窗口</sub>

---

```

</step>

<step name="edge_cases">
**处理边缘情况：**

- 阶段完成但下一阶段未规划 → 提供 `/gsd:plan-phase [next]`
- 所有工作完成 → 提供里程碑完成
- 存在阻碍 → 在继续前突出显示
- 存在移交文件 → 提及它，提供 `/gsd:resume-work`
  </step>

</process>

<success_criteria>

- [ ] 提供丰富的上下文（近期工作、决策、问题）
- [ ] 当前位置清晰，带有视觉进度
- [ ] 接下来的任务明确说明
- [ ] 智能路由：如果有计划则 /gsd:execute-phase，如果没有则 /gsd:plan-phase
- [ ] 用户在采取任何操作前确认
- [ ] 无缝移交到适当的 gsd 命令
      </success_criteria>