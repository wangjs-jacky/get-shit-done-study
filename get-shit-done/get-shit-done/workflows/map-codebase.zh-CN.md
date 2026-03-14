<purpose>

为现有项目启动新的里程碑周期。加载项目上下文，收集里程碑目标（来自 MILESTONE-CONTEXT.md 或对话），更新 PROJECT.md 和 STATE.md，可选运行并行研究，使用 REQ-IDs 定义范围要求，启动路由映射器创建分阶段执行计划，并提交所有工件。new-project 的 brownfield 等效版本。

</purpose>

<required_reading>

在开始之前，阅读调用提示的 execution_context 引用的所有文件。

</required_reading>

<process>

## 1. 加载上下文

- 读取 PROJECT.md（现有项目，已验证需求，决策）
- 读取 MILESTONES.md（之前发布了什么）
- 读取 STATE.md（待办事项，阻碍因素）
- 检查是否存在 MILESTONE-CONTEXT.md（来自 /gsd:discuss-milestone）

## 2. 收集里程碑目标

**如果 MILESTONE-CONTEXT.md 存在：**
- 使用 discuss-milestone 的功能和范围
- 呈现摘要供确认

**如果没有上下文文件：**
- 呈现上一个里程碑发布的内容
- 内联询问（自由格式，NOT AskUserQuestion）："你想接下来构建什么？"
- 等待他们的响应，然后使用 AskUserQuestion 探索具体内容
- 如果用户在任何时候选择 "Other" 来提供自由格式输入，直接询问后续问题 — 不再使用 AskUserQuestion

## 3. 确定里程碑版本

- 从 MILESTONES.md 解析最后一个版本
- 建议下一个版本（v1.0 → v1.1，或 v2.0 用于重大版本）
- 与用户确认

## 4. 更新 PROJECT.md

添加/更新：

```markdown
## 当前里程碑：v[X.Y] [名称]

**目标：** [一句话描述里程碑重点]

**目标功能：**
- [功能 1]
- [功能 2]
- [功能 3]
```

更新活动需求部分和 "最后更新" 页脚。

## 5. 更新 STATE.md

```markdown
## 当前位置

阶段：未开始（定义需求）
计划：—
状态：定义需求
最后活动：[今天] — 里程碑 v[X.Y] 已启动
```

保留上一个里程碑的累积上下文部分。

## 6. 清理和提交

如果存在，删除 MILESTONE-CONTEXT.md（已被消耗）。

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: start milestone v[X.Y] [Name]" --files .planning/PROJECT.md .planning/STATE.md
```

## 7. 加载上下文和解析模型

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-milestone)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取：`researcher_model`, `synthesizer_model`, `roadmapper_model`, `commit_docs`, `research_enabled`, `current_milestone`, `project_exists`, `roadmap_exists`。

## 8. 研究决策

AskUserQuestion: "在定义需求之前研究新功能领域的生态系统？"
- "先研究（推荐）" — 发现新模式、功能、架构用于 NEW 能力
- "跳过研究" — 直接进入需求

**将选择持久化到配置**（以便未来的 `/gsd:plan-phase` 遵守它）：

```bash
# 如果 "先研究"：持久化 true
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow.research true

# 如果 "跳过研究"：持久化 false
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow.research false
```

**如果 "先研究"：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在研究
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 并行启动 4 个研究人员...
  → 栈、功能、架构、陷阱
```

```bash
mkdir -p .planning/research
```

启动 4 个并行的 gsd-project-researcher agent。每个都使用这个带有特定维度字段的模板：

**所有 4 个研究人员的共同结构：**
```
Task(prompt="
<research_type>项目研究 — {DIMENSION} 用于 [新功能]。</research_type>

<milestone_context>
后续里程碑 — 向现有应用程序添加 [目标功能]。
{EXISTING_CONTEXT}
仅专注于新功能所需的内容。
</milestone_context>

<question>{QUESTION}</question>

<files_to_read>
- .planning/PROJECT.md（项目上下文）
</files_to_read>

<downstream_consumer>{CONSUMER}</downstream_consumer>

<quality_gate>{GATES}</quality_gate>

<output>
写入到: .planning/research/{FILE}
使用模板: ~/.claude/get-shit-done/templates/research-project/{FILE}
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="{DIMENSION} 研究")
```

**特定维度的字段：**

| 字段 | 栈 | 功能 | 架构 | 陷阱 |
|-------|-------|----------|-------------|----------|
| EXISTING_CONTEXT | 现有已验证的能力（请勿重新研究）：[来自 PROJECT.md] | 现有功能（已构建）：[来自 PROJECT.md] | 现有架构：[来自 PROJECT.md 或代码库映射] | 专注于向现有系统添加这些功能时的常见错误 |
| QUESTION | [新功能] 需要哪些栈的添加/更改？ | [目标功能] 通常如何工作？预期行为？ | [目标功能] 如何与现有架构集成？ | 向 [领域] 添加 [目标功能] 时的常见错误 |
| CONSUMER | 用于 NEW 能力的特定库版本，集成点，不要添加的内容 | 基准功能与差异化功能，已标注复杂性，对现有功能的依赖 | 集成点，新组件，数据流变化，建议的构建顺序 | 警告标志，预防策略，哪个阶段应该处理它 |
| GATES | 版本当前（用 Context7 验证），理由解释了为什么，考虑了集成 | 类别清晰，复杂性已标注，依赖关系已识别 | 集成点已识别，新与修改明确，构建顺序考虑依赖 | 集成这些功能时的具体陷阱，集成陷阱已涵盖，预防可操作 |
| FILE | STACK.md | FEATURES.md | ARCHITECTURE.md | PITFALLS.md |

所有 4 个完成后，启动合成器：

```
Task(prompt="
将研究成果合成为 SUMMARY.md。

<files_to_read>
- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
</files_to_read>

写入到: .planning/research/SUMMARY.md
使用模板: ~/.claude/get-shit-done/templates/research-project/SUMMARY.md
写完后提交。
", subagent_type="gsd-research-synthesizer", model="{synthesizer_model}", description="合成研究成果")
```

从 SUMMARY.md 显示关键发现：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究完成 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**栈添加：** [来自 SUMMARY.md]
**基准功能：** [来自 SUMMARY.md]
**注意事项：** [来自 SUMMARY.md]
```

**如果 "跳过研究"：** 继续步骤 9。

## 9. 定义需求

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在定义需求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

读取 PROJECT.md：核心价值，当前里程碑目标，已验证需求（已存在的内容）。

**如果存在研究：** 读取 FEATURES.md，提取功能类别。

按类别呈现功能：
```
## [类别 1]
**基准功能：** 功能 A，功能 B
**差异化功能：** 功能 C，功能 D
**研究笔记：** [相关笔记]
```

**如果没有研究：** 通过对话收集需求。询问："用户使用 [新功能] 需要做什么？" 明确，探索相关能力，分组到类别中。

**通过 AskUserQuestion 按类别划分范围**（multiSelect: true, header 最大 12 个字符）：
- "[功能 1]" — [简要描述]
- "[功能 2]" — [简要描述]
- "本里程碑无" — 延迟整个类别

跟踪：选中 → 本里程碑。未选中的基准功能 → 未来。未选中的差异化功能 → 范围外。

**通过 AskUserQuestion 识别差距**：
- "不，研究已涵盖" — 继续
- "是的，让我添加一些" — 捕获添加内容

**生成 REQUIREMENTS.md：**
- v1 需求按类别分组（带复选框，REQ-IDs）
- 未来需求（延迟的）
- 范围外（带理由的明确排除）
- 可追溯性部分（空，由路线图填写）

**REQ-ID 格式：** `[CATEGORY]-[NUMBER]`（AUTH-01，NOTIF-02）。从现有内容继续编号。

**需求质量标准：**

好的需求是：
- **具体和可测试的：** "用户可以通过电子邮件链接重置密码"（不是"处理密码重置"）
- **以用户为中心：** "用户可以 X"（不是"系统做 Y"）
- **原子的：** 每个需求一个能力（不是"用户可以登录并管理个人资料"）
- **独立的：** 对其他需求的最小依赖

呈现完整需求列表供确认：

```
## 里程碑 v[X.Y] 需求

### [类别 1]
- [ ] **CAT1-01**: 用户可以做 X
- [ ] **CAT1-02**: 用户可以做 Y

### [类别 2]
- [ ] **CAT2-01**: 用户可以做 Z

这能捕捉你正在构建的内容吗？（是 / 调整）
```

如果 "调整"：返回范围划分。

**提交需求：**
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: define milestone v[X.Y] requirements" --files .planning/REQUIREMENTS.md
```

## 10. 创建路线图

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在创建路线图
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 启动路由映射器...
```

**起始阶段编号：** 从 MILESTONES.md 读取最后一个阶段编号。从那里继续（v1.0 结束于阶段 5 → v1.1 从阶段 6 开始）。

```
Task(prompt="
<planning_context>
<files_to_read>
- .planning/PROJECT.md
- .planning/REQUIREMENTS.md
- .planning/research/SUMMARY.md（如果存在）
- .planning/config.json
- .planning/MILESTONES.md
</files_to_read>
</planning_context>

<instructions>
为里程碑 v[X.Y] 创建路线图：
1. 从 [N] 开始阶段编号
2. 仅从本里程碑的需求派生阶段
3. 将每个需求映射到一个阶段
4. 每个阶段派生 2-5 个成功标准（可观察的用户行为）
5. 验证 100% 覆盖率
6. 立即写入文件（ROADMAP.md, STATE.md，更新 REQUIREMENTS.md 可追溯性）
7. 返回 ROADMAP CREATED 和摘要

先写入文件，然后返回。
</instructions>
", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="创建路线图")
```

**处理返回：**

**如果 `## ROADMAP BLOCKED`：** 呈现阻碍因素，与用户合作，重新启动。

**如果 `## ROADMAP CREATED`：** 读取 ROADMAP.md，内联呈现：

```
## 建议的路线图

**[N] 个阶段** | **[X] 个需求已映射** | 全部覆盖 ✓

| # | 阶段 | 目标 | 需求 | 成功标准 |
|---|-------|------|--------------|------------------|
| [N] | [名称] | [目标] | [REQ-IDs] | [数量] |

### 阶段详情

**阶段 [N]: [名称]**
目标: [目标]
需求: [REQ-IDs]
成功标准:
1. [标准]
2. [标准]
```

**通过 AskUserQuestion 请求批准**：
- "批准" — 提交并继续
- "调整阶段" — 告诉我需要更改什么
- "查看完整文件" — 显示原始 ROADMAP.md

**如果 "调整"：** 获取备注，使用修订上下文重新启动路由映射器，直到批准为止。
**如果 "审查"：** 显示原始 ROADMAP.md，重新询问。

**提交路线图**（批准后）：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: create milestone v[X.Y] roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
```

## 11. 完成

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 里程碑初始化完成 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**里程碑 v[X.Y]: [名称]**

| 工件 | 位置 |
|----------------|-----------------------------|
| 项目 | `.planning/PROJECT.md` |
| 研究 | `.planning/research/` |
| 需求 | `.planning/REQUIREMENTS.md` |
| 路线图 | `.planning/ROADMAP.md` |

**[N] 个阶段** | **[X] 个需求** | 准备构建 ✓

## ▶ 下一步

**阶段 [N]: [阶段名称]** — [目标]

`/gsd:discuss-phase [N]` — 收集上下文并明确方法

<sub>`/clear` first → fresh context window</sub>

Also: `/gsd:plan-phase [N]` — 跳过讨论，直接计划

</process>

<success_criteria>
- [ ] PROJECT.md 已更新当前里程碑部分
- [ ] STATE.md 为新里程碑重置
- [ ] MILESTONE-CONTEXT.md 已消耗并删除（如果存在）
- [ ] 研究完成（如果已选择）— 4 个并行 agent，里程碑感知
- [ ] 需求已按类别收集和划分
- [ ] REQUIREMENTS.md 已创建，带有 REQ-IDs
- [ ] gsd-roadmapper 已启动，带有阶段编号上下文
- [ ] 路线图文件立即写入（不是草稿）
- [ ] 用户反馈已采纳（如果有）
- [ ] ROADMAP.md 阶段从上一个里程碑继续
- [ ] 所有提交已完成（如果规划文档已提交）
- [ ] 用户知道下一步：`/gsd:discuss-phase [N]`

**原子提交：** 每个阶段立即提交其工件。
</success_criteria>