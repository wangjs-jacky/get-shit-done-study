<purpose>

通过统一流程初始化新项目：提问、研究（可选）、需求、路线图。这是任何项目中最具杠杆作用的时刻 — 这里的深度提问意味着更好的计划、更好的执行、更好的结果。一个工作流程带你从想法到规划就绪状态。

</purpose>

<required_reading>

在开始之前，阅读调用提示的 execution_context 引用的所有文件。

</required_reading>

<auto_mode>
## 自动模式检测

检查 $ARGUMENTS 中是否存在 `--auto` 标志。

**如果自动模式：**
- 跳过 brownfield 映射提议（假设绿色字段）
- 跳过深度提问（从提供的文档中提取上下文）
- 配置：YOLO 模式是隐式的（跳过该问题），但首先询问粒度/git/agents（步骤 2a）
- 配置后：使用智能默认值自动运行步骤 6-9：
  - 研究：总是是
  - 需求：包括来自提供的文档的所有基准功能 + 功能
  - 需求批准：自动批准
  - 路线图批准：自动批准

**文档要求：**
自动模式需要一个想法文档 — 要么是：
- 文件引用：`/gsd:new-project --auto @prd.md`
- 在提示中粘贴/写入的文本

如果没有提供文档内容，错误：

```
Error: --auto requires an idea document.

Usage:
  /gsd:new-project --auto @your-idea.md
  /gsd:new-project --auto [paste or write your idea here]

The document should describe what you want to build.
```
</auto_mode>

<process>

## 1. 设置

**强制第一步 — 在任何用户交互之前执行这些检查：**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 JSON 中解析：`researcher_model`, `synthesizer_model`, `roadmapper_model`, `commit_docs`, `project_exists`, `has_codebase_map`, `planning_exists`, `has_existing_code`, `has_package_file`, `is_brownfield`, `needs_codebase_map`, `has_git`, `project_path`。

**如果 `project_exists` 为 true：** 错误 — 项目已初始化。使用 `/gsd:progress`。

**如果 `has_git` 为 false：** 初始化 git：
```bash
git init
```

## 2. Brownfield 提议

**如果自动模式：** 跳到步骤 4（假设绿色字段，从提供的文档合成 PROJECT.md）。

**如果 `needs_codebase_map` 为 true**（来自初始化 — 检测到现有代码但没有代码库映射）：

使用 AskUserQuestion：
- header: "Codebase"
- question: "我检测到此目录中存在现有代码。您想要先映射代码库吗？"
- options:
  - "先映射代码库" — 运行 /gsd:map-codebase 了解现有架构（推荐）
  - "跳过映射" — 继续项目初始化

**如果 "先映射代码库"：**
```
先运行 `/gsd:map-codebase`，然后返回 `/gsd:new-project`
```
退出命令。

**如果 "跳过映射" 或 `needs_codebase_map` 为 false：** 继续步骤 3。

## 2a. 自动模式配置（仅自动模式）

**如果自动模式：** 在处理想法文档之前首先收集配置设置。

YOLO 模式是隐式的（auto = YOLO）。询问其余配置问题：

**第 1 轮 — 核心设置（3 个问题，无模式问题）：**

```
AskUserQuestion([
  {
    header: "Granularity",
    question: "范围应如何精细地切分为阶段？",
    multiSelect: false,
    options: [
      { label: "Coarse (Recommended)", description: "更少、更宽泛的阶段（3-5 个阶段，每个 1-3 个计划）" },
      { label: "Standard", description: "平衡的阶段大小（5-8 个阶段，每个 3-5 个计划）" },
      { label: "Fine", description: "许多专注的阶段（8-12 个阶段，每个 5-10 个计划）" }
    ]
  },
  {
    header: "Execution",
    question: "并行运行计划？",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "独立计划同时运行" },
      { label: "Sequential", description: "一次一个计划" }
    ]
  },
  {
    header: "Git Tracking",
    question: "将规划文档提交到 git？",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "规划文档在版本控制中跟踪" },
      { label: "No", description: "保持 .planning/ 本地（添加到 .gitignore）" }
    ]
  }
])
```

**第 2 轮 — 工作流 agent（与步骤 5 相同）：**

```
AskUserQuestion([
  {
    header: "Research",
    question: "在每个阶段规划前进行研究？（增加 token/时间）",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "调查领域，发现模式，发现陷阱" },
      { label: "No", description: "直接从需求规划" }
    ]
  },
  {
    header: "Plan Check",
    question: "验证计划将实现其目标？（增加 token/时间）",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "在执行开始前捕获差距" },
      { label: "No", description: "不经验证执行计划" }
    ]
  },
  {
    header: "Verifier",
    question: "在每个阶段执行后验证工作满足需求？（增加 token/时间）",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "确认交付物与阶段目标匹配" },
      { label: "No", description: "信任执行，跳过验证" }
    ]
  },
  {
    header: "AI Models",
    question: "规划 agent 使用哪个 AI 模型？",
    multiSelect: false,
    options: [
      { label: "Balanced (Recommended)", description: "Sonnet 用于大多数 agent — 质量/成本比良好" },
      { label: "Quality", description: "Opus 用于研究/路线图 — 更高成本，更深入分析" },
      { label: "Budget", description: "Haiku 在可能的地方 — 最快，最低成本" }
    ]
  }
])
```

使用选定的值创建 `.planning/config.json`，模式设置为 "yolo"：

```json
{
  "mode": "yolo",
  "granularity": "[selected]",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": depth !== "quick",
    "auto_advance": true
  }
}
```

**如果 commit_docs = No：** 将 `.planning/` 添加到 `.gitignore`。

**提交 config.json：**

```bash
mkdir -p .planning
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: add project config" --files .planning/config.json
```

**将自动前进链标志持久化到配置（在上下文压缩后仍然存在）：**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active true
```

继续步骤 4（跳过步骤 3 和 5）。

## 3. 深度提问

**如果自动模式：** 跳过（已在步骤 2a 处理）。从提供的文档提取项目上下文并继续步骤 4。

**显示阶段横幅：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 提问
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**开启对话：**

内联询问（自由格式，NOT AskUserQuestion）：

"你想构建什么？"

等待他们的回应。这给你提问智能后续问题的上下文。

**跟随线索：**

基于他们所说的，询问跟进问题，深入探讨他们的回应。使用 AskUserQuestion 带有选项来探究他们提到的内容 — 解释、澄清、具体例子。

继续跟随线索。每个回答都打开新的线索来探索。询问：
- 什么让他们兴奋
- 什么问题激发了这一点
- 他们对模糊术语的意思
- 它实际上会是什么样子
- 什么已经决定了

查阅 `questioning.md` 技巧：
- 挑战模糊性
- 使抽象具体化
- 揭示假设
- 找到边缘
- 揭示动机

**检查上下文（后台，不公开）：**

随着进行，在心里检查 `questioning.md` 的上下文检查清单。如果仍有差距，自然地编织问题。不要突然切换到清单模式。

**决策门：**

当你可以写出清晰的 PROJECT.md 时，使用 AskUserQuestion：

- header: "Ready?"
- question: "我想我理解了你想要的东西。准备好创建 PROJECT.md 吗？"
- options:
  - "创建 PROJECT.md" — 让我们继续前进
  - "继续探索" — 我想分享更多 / 向我多问一些

如果 "继续探索" — 询问他们想添加什么，或识别差距并自然探究。

循环直到选择 "创建 PROJECT.md"。

## 4. 编写 PROJECT.md

**如果自动模式：** 从提供的文档合成。没有显示 "Ready?" 门 — 直接继续提交。

使用 `templates/project.md` 的模板将所有上下文合成为 `.planning/PROJECT.md`。

**对于绿色字段项目：**

将需求初始化为假设：

```markdown
## Requirements

### Validated

(还没有 — 发货以验证)

### Active

- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Out of Scope

- [Exclusion 1] — [why]
- [Exclusion 2] — [why]
```

所有活动需求都是假设，直到发货和验证。

**对于 brownfield 项目（代码库映射存在）：**

从现有代码推断已验证的需求：

1. 读取 `.planning/codebase/ARCHITECTURE.md` 和 `STACK.md`
2. 识别代码库已经做了什么
3. 这些成为初始的 Validated 集合

```markdown
## Requirements

### Validated

- ✓ [Existing capability 1] — existing
- ✓ [Existing capability 2] — existing
- ✓ [Existing capability 3] — existing

### Active

- [ ] [New requirement 1]
- [ ] [New requirement 2]

### Out of Scope

- [Exclusion 1] — [why]
```

**关键决策：**

初始化在提问期间做出的任何决策：

```markdown
## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Choice from questioning] | [Why] | — Pending |
```

**最后更新页脚：**

```markdown
---
*Last updated: [date] after initialization*
```

不要压缩。捕获收集的所有内容。

**提交 PROJECT.md：**

```bash
mkdir -p .planning
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: initialize project" --files .planning/PROJECT.md
```

## 5. 工作流偏好

**如果自动模式：** 跳过 — 配置已在步骤 2a 收集。继续步骤 5.5。

**检查全局默认值** 在 `~/.gsd/defaults.json`。如果文件存在，提议使用保存的默认值：

```
AskUserQuestion([
  {
    question: "Use your saved default settings? (from ~/.gsd/defaults.json)",
    header: "Defaults",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Use saved defaults, skip settings questions" },
      { label: "No", description: "Configure settings manually" }
    ]
  }
])
```

如果 "Yes"：读取 `~/.gsd/defaults.json`，将这些值用于 config.json，并直接跳到**下面的提交 config.json**。

如果 "No" 或 `~/.gsd/defaults.json` 不存在：继续以下问题。

**第 1 轮 — 核心工作流设置（4 个问题）：**

```
questions: [
  {
    header: "Mode",
    question: "您想如何工作？",
    multiSelect: false,
    options: [
      { label: "YOLO (Recommended)", description: "自动批准，只执行" },
      { label: "Interactive", description: "在每一步确认" }
    ]
  },
  {
    header: "Granularity",
    question: "范围应如何精细地切分为阶段？",
    multiSelect: false,
    options: [
      { label: "Coarse", description: "更少、更宽泛的阶段（3-5 个阶段，每个 1-3 个计划）" },
      { label: "Standard", description: "平衡的阶段大小（5-8 个阶段，每个 3-5 个计划）" },
      { label: "Fine", description: "许多专注的阶段（8-12 个阶段，每个 5-10 个计划）" }
    ]
  },
  {
    header: "Execution",
    question: "并行运行计划？",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "独立计划同时运行" },
      { label: "Sequential", description: "一次一个计划" }
    ]
  },
  {
    header: "Git Tracking",
    question: "将规划文档提交到 git？",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "规划文档在版本控制中跟踪" },
      { label: "No", description: "保持 .planning/ 本地（添加到 .gitignore）" }
    ]
  }
]
```

**第 2 轮 — 工作流 agent：**

这些在规划/执行期间启动额外的 agent。它们增加 token 和时间但提高质量。

| Agent | 何时运行 | 它做什么 |
|-------|--------------|--------------|
| **Researcher** | 在每个阶段规划前 | 调查领域，发现模式，发现陷阱 |
| **Plan Checker** | 计划创建后 | 验证计划是否实际实现阶段目标 |
| **Verifier** | 阶段执行后 | 确认交付物满足需求 |

对于重要项目都推荐。快速实验跳过。

```
questions: [
  {
    header: "Research",
    question: "在每个阶段规划前进行研究？（增加 token/时间）",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "调查领域，发现模式，发现陷阱" },
      { label: "No", description: "直接从需求规划" }
    ]
  },
  {
    header: "Plan Check",
    question: "验证计划将实现其目标？（增加 token/时间）",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "在执行开始前捕获差距" },
      { label: "No", description: "不经验证执行计划" }
    ]
  },
  {
    header: "Verifier",
    question: "在每个阶段执行后验证工作满足需求？（增加 token/时间）",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "确认交付物与阶段目标匹配" },
      { label: "No", description: "信任执行，跳过验证" }
    ]
  },
  {
    header: "AI Models",
    question: "规划 agent 使用哪个 AI 模型？",
    multiSelect: false,
    options: [
      { label: "Balanced (Recommended)", description: "Sonnet 用于大多数 agent — 质量/成本比良好" },
      { label: "Quality", description: "Opus 用于研究/路线图 — 更高成本，更深入分析" },
      { label: "Budget", description: "Haiku 在可能的地方 — 最快，最低成本" }
    ]
  }
]
```

使用所有设置创建 `.planning/config.json`：

```json
{
  "mode": "yolo|interactive",
  "granularity": "coarse|standard|fine",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": depth !== "quick"
  }
}
```

**如果 commit_docs = No：**
- 在 config.json 中设置 `commit_docs: false`
- 将 `.planning/` 添加到 `.gitignore`（如果需要则创建）

**如果 commit_docs = Yes：**
- 不需要额外的 gitignore 条目

**提交 config.json：**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: add project config" --files .planning/config.json
```

**注意：** 随时运行 `/gsd:settings` 更新这些偏好。

## 5.5. 解析模型配置

使用初始化中的模型：`researcher_model`, `synthesizer_model`, `roadmapper_model`。

## 6. 研究决策

**如果自动模式：** 默认为 "先研究" 而不询问。

使用 AskUserQuestion：
- header: "Research"
- question: "在定义需求之前研究领域生态系统？"
- options:
  - "先研究（推荐）" — 发现标准栈、预期功能、架构模式
  - "跳过研究" — 我很了解这个领域，直接进入需求

**如果 "先研究"：**

显示阶段横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在研究
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

研究 [领域] 生态系统...
```

创建研究目录：
```bash
mkdir -p .planning/research
```

**确定里程碑上下文：**

检查这是绿色字段还是后续里程碑：
- 如果 PROJECT.md 中没有 "Validated" 需求 → 绿色字段（从头开始构建）
- 如果存在 "Validated" 需求 → 后续里程碑（向现有应用程序添加）

显示启动指示器：
```
◆ 并行启动 4 个研究人员...
  → 栈研究
  → 功能研究
  → 架构研究
  → 陷阱研究
```

启动 4 个并行的 gsd-project-researcher agent，带有路径引用：

```
Task(prompt="<research_type>
项目研究 — [领域] 的栈维度。
</research_type>

<milestone_context>
[greenfield OR subsequent]

绿色字段：从头开始构建 [领域] 的标准栈。
后续：向现有 [领域] 应用程序添加 [目标功能] 所需内容。不要重新研究现有系统。
</milestone_context>

<question>
[领域] 的标准 2025 栈是什么？
</question>

<files_to_read>
- {project_path}（项目上下文和目标）
</files_to_read>

<downstream_consumer>
您的 STACK.md 将影响路线图创建。要具体：
- 特定库版本
- 每个选择的明确理由
- 不要使用什么及原因
</downstream_consumer>

<quality_gate>
- [ ] 版本当前（用 Context7/官方文档验证，不是训练数据）
- [ ] 理由解释了为什么，不只是什么
- [ ] 为每个建议分配了置信度级别
</quality_gate>

<output>
写入到: .planning/research/STACK.md
使用模板: ~/.claude/get-shit-done/templates/research-project/STACK.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Stack 研究")

Task(prompt="<research_type>
项目研究 — [领域] 的功能维度。
</research_type>

<milestone_context>
[greenfield OR subsequent]

绿色字段：[领域] 产品有哪些功能？什么是基准功能vs差异化功能？
后续：[目标功能] 通常如何工作？预期行为是什么？
</milestone_context>

<question>
[领域] 产品有哪些功能？什么是基准功能vs差异化功能？
</question>

<files_to_read>
- {project_path}（项目上下文）
</files_to_read>

<downstream_consumer>
您的 FEATURES.md 将影响需求定义。清晰分类：
- 基准功能（必须有或用户离开）
- 差异化功能（竞争优势）
- 反功能（故意不要构建的东西）
</downstream_consumer>

<quality_gate>
- [ ] 类别清晰（基准功能vs差异化功能vs反功能）
- [ ] 每个功能标注了复杂性
- [ ] 识别了功能间的依赖关系
</quality_gate>

<output>
写入到: .planning/research/FEATURES.md
使用模板: ~/.claude/get-shit-done/templates/research-project/FEATURES.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Features 研究")

Task(prompt="<research_type>
项目研究 — [领域] 的架构维度。
</research_type>

<milestone_context>
[greenfield OR subsequent]

绿色字段：[领域] 系统通常如何结构化？主要组件是什么？
后续：[目标功能] 如何与现有 [领域] 架构集成？
</milestone_context>

<question>
[领域] 系统通常如何结构化？主要组件是什么？
</question>

<files_to_read>
- {project_path}（项目上下文）
</files_to_read>

<downstream_consumer>
您的 ARCHITECTURE.md 影响路线图中的阶段结构。包括：
- 组件边界（什么与什么通信）
- 数据流（信息如何移动）
- 建议构建顺序（组件间的依赖）
</downstream_consumer>

<quality_gate>
- [ ] 组件边界清晰定义
- [ ] 数据流方向明确
- [ ] 标注了构建顺序影响
</quality_gate>

<output>
写入到: .planning/research/ARCHITECTURE.md
使用模板: ~/.claude/get-shit-done/templates/research-project/ARCHITECTURE.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Architecture 研究")

Task(prompt="<research_type>
项目研究 — [领域] 的陷阱维度。
</research_type>

<milestone_context>
[greenfield OR subsequent]

绿色字段：[领域] 项目常犯什么错误？关键错误？
后续：向 [领域] 添加 [目标功能] 时的常见错误？
</milestone_context>

<question>
[领域] 项目常犯什么错误？关键错误？
</question>

<files_to_read>
- {project_path}（项目上下文）
</files_to_read>

<downstream_consumer>
您的 PITFALLS.md 防止路线图/规划中的错误。对于每个陷阱：
- 警告标志（如何早期检测）
- 预防策略（如何避免）
- 应该在哪个阶段处理
</downstream_consumer>

<quality_gate>
- [ ] 陷阱特定于该领域（不是通用建议）
- [ ] 预防策略可操作
- [ ] 包含相关阶段的映射
</quality_gate>

<output>
写入到: .planning/research/PITFALLS.md
使用模板: ~/.claude/get-shit-done/templates/research-project/PITFALLS.md
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="Pitfalls 研究")
```

所有 4 个 agent 完成后，启动合成器创建 SUMMARY.md：

```
Task(prompt="
<task>
将研究成果合成为 SUMMARY.md。
</task>

<files_to_read>
- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
</files_to_read>

<output>
写入到: .planning/research/SUMMARY.md
使用模板: ~/.claude/get-shit-done/templates/research-project/SUMMARY.md
写完后提交。
</output>
", subagent_type="gsd-research-synthesizer", model="{synthesizer_model}", description="合成研究成果")
```

显示研究完成横幅和关键发现：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究完成 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 关键发现

**栈：** [来自 SUMMARY.md]
**基准功能：** [来自 SUMMARY.md]
**注意事项：** [来自 SUMMARY.md]

文件：`.planning/research/`
```

**如果 "跳过研究"：** 继续步骤 7。

## 7. 定义需求

显示阶段横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在定义需求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**加载上下文：**

读取 PROJECT.md 并提取：
- 核心价值（必须工作的 ONE 事情）
- 明确的约束（预算、时间线、技术限制）
- 任何明确的范围边界

**如果存在研究：** 读取研究/FEATURES.md 并提取功能类别。

**如果自动模式：**
- 自动包含所有基准功能（用户期望这些）
- 包含文档中明确提到的功能
- 自动延迟文档中未提及的差异化功能
- 跳过每个类别的 AskUserQuestion 循环
- 跳过 "是否有添加？" 问题
- 跳过需求批准门
- 生成 REQUIREMENTS.md 并直接提交

**按类别呈现功能（仅交互模式）：**

```
[领域] 的功能如下：

## 身份验证
**基准功能：**
- 邮箱/密码注册
- 邮箱验证
- 密码重置
- 会话管理

**差异化功能：**
- 魔法链接登录
- OAuth（Google、GitHub）
- 2FA

**研究笔记：** [相关笔记]

---

## [下一个类别]
...
```

**如果没有研究：** 通过对话收集需求。

询问："用户需要能够做的主要事情是什么？"

对于提到的每个能力：
- 提问澄清使其具体
- 探索相关能力
- 分组到类别

**按类别划分范围：**

对于每个类别，使用 AskUserQuestion：

- header: "[类别]"（最大 12 个字符）
- question: "v1 包含哪些 [类别] 功能？"
- multiSelect: true
- options:
  - "[功能 1]" — [简要描述]
  - "[功能 2]" — [简要描述]
  - "[功能 3]" — [简要描述]
  - "v1 无" — 延迟整个类别

跟踪响应：
- 选中的功能 → v1 需求
- 未选中的基准功能 → v2（用户期望这些）
- 未选中的差异化功能 → 范围外

**识别差距：**

使用 AskUserQuestion：
- header: "Additions"
- question: "任何需求研究遗漏了？（特定于您愿景的功能）"
- options:
  - "不，研究已涵盖" — 继续
  - "是的，让我添加一些" — 捕获添加内容

**验证核心价值：**

对照 PROJECT.md 中的核心价值检查需求。如果发现差距，将其呈现出来。

**生成 REQUIREMENTS.md：**

创建 `.planning/REQUIREMENTS.md` 包含：
- v1 需求按类别分组（带复选框，REQ-IDs）
- v2 需求（延迟的）
- 范围外（带理由的明确排除）
- 可追溯性部分（空，由路线图填写）

**REQ-ID 格式：** `[CATEGORY]-[NUMBER]`（AUTH-01，CONTENT-02）

**需求质量标准：**

好的需求是：
- **具体和可测试的：** "用户可以通过电子邮件链接重置密码"（不是"处理密码重置"）
- **以用户为中心：** "用户可以 X"（不是"系统做 Y"）
- **原子的：** 每个需求一个能力（不是"用户可以登录并管理个人资料"）
- **独立的：** 对其他需求的最小依赖

拒绝模糊需求。追求具体性：
- "处理身份验证" → "用户可以使用邮箱/密码登录并跨会话保持登录"
- "支持分享" → "用户可以通过链接分享帖子，链接在收件人浏览器中打开"

**呈现完整需求列表（仅交互模式）：**

显示每个需求（不是计数）供用户确认：

```
## v1 需求

### 身份验证
- [ ] **AUTH-01**: 用户可以使用邮箱/密码创建账户
- [ ] **AUTH-02**: 用户可以登录并跨会话保持登录
- [ ] **AUTH-03**: 用户可以从任何页面登出

### 内容
- [ ] **CONT-01**: 用户可以创建文本帖子
- [ ] **CONT-02**: 用户可以编辑自己的帖子

[... 完整列表 ...]

---

这能捕捉你正在构建的内容吗？（是 / 调整）
```

如果 "调整"：返回范围划分。

**提交需求：**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md
```

## 8. 创建路线图

显示阶段横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 正在创建路线图
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 启动路由映射器...
```

启动带有路径引用的 gsd-roadmapper agent：

```
Task(prompt="
<planning_context>

<files_to_read>
- .planning/PROJECT.md（项目上下文）
- .planning/REQUIREMENTS.md（v1 需求）
- .planning/research/SUMMARY.md（研究成果 - 如果存在）
- .planning/config.json（粒度和模式设置）
</files_to_read>

</planning_context>

<instructions>
创建路线图：
1. 从需求派生阶段（不要强加结构）
2. 将每个 v1 需求映射到一个阶段
3. 每个阶段派生 2-5 个成功标准（可观察的用户行为）
4. 验证 100% 覆盖率
5. 立即写入文件（ROADMAP.md, STATE.md，更新 REQUIREMENTS.md 可追溯性）
6. 返回 ROADMAP CREATED 和摘要

先写入文件，然后返回。这确保工件持久存在，即使上下文丢失。
</instructions>
", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="创建路线图")
```

**处理路由映射器返回：**

**如果 `## ROADMAP BLOCKED`：**
- 呈现阻碍因素信息
- 与用户合作解决
- 解决后重新启动

**如果 `## ROADMAP CREATED`：**

读取创建的 ROADMAP.md 并在行内漂亮地呈现：

```
---

## 建议的路线图

**[N] 个阶段** | **[X] 个需求已映射** | 所有 v1 需求覆盖 ✓

| # | 阶段 | 目标 | 需求 | 成功标准 |
|---|-------|------|--------------|------------------|
| 1 | [名称] | [目标] | [REQ-IDs] | [数量] |
| 2 | [名称] | [目标] | [REQ-IDs] | [数量] |
| 3 | [名称] | [目标] | [REQ-IDs] | [数量] |
...

### 阶段详情

**阶段 1: [名称]**
目标: [目标]
需求: [REQ-IDs]
成功标准:
1. [标准]
2. [标准]
3. [标准]

**阶段 2: [名称]**
目标: [目标]
需求: [REQ-IDs]
成功标准:
1. [标准]
2. [标准]

[... 为所有阶段继续 ...]

---
```

**如果自动模式：** 跳过批准门 — 自动批准并直接提交。

**关键：在提交前请求批准（仅交互模式）：**

使用 AskUserQuestion：
- header: "Roadmap"
- question: "这个路线图结构对你有用吗？"
- options:
  - "Approve" — 提交并继续
  - "Adjust phases" — 告诉我需要更改什么
  - "Review full file" — 显示原始 ROADMAP.md

**如果 "Approve"：** 继续提交。

**如果 "Adjust phases"：**
- 获取用户的调整备注
- 使用修订上下文重新启动路由映射器：
  ```
  Task(prompt="
  <revision>
  用户对路线图的反馈：
  [用户的备注]

  <files_to_read>
  - .planning/ROADMAP.md（当前要修订的路线图）
  </files_to_read>

  根据反馈更新路线图。就地编辑文件。
  返回 ROADMAP REVISED 和已做的更改。
  </revision>
  ", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="修订路线图")
  ```
- 呈现修订后的路线图
- 循环直到用户批准

**如果 "Review full file"：** 显示原始 `cat .planning/ROADMAP.md`，然后重新询问。

**提交路线图**（批准后或自动模式）：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: create roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
```

## 9. 完成

呈现完成摘要：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 项目初始化完成 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[项目名称]**

| 工件 | 位置 |
|----------------|-----------------------------|
| 项目 | `.planning/PROJECT.md` |
| 配置 | `.planning/config.json` |
| 研究 | `.planning/research/` |
| 需求 | `.planning/REQUIREMENTS.md` |
| 路线图 | `.planning/ROADMAP.md` |

**[N] 个阶段** | **[X] 个需求** | 准备构建 ✓
```

**如果自动模式：**

```
╔══════════════════════════════════════════╗
║  自动前进 → 讨论阶段 1                    ║
╚══════════════════════════════════════════╝
```

退出 skill 并调用 SlashCommand("/gsd:discuss-phase 1 --auto")

**如果交互模式：**

```
───────────────────────────────────────────────────────────────

## ▶ 下一步

**阶段 1: [阶段名称]** — [来自 ROADMAP.md 的目标]

/gsd:discuss-phase 1 — 收集上下文并明确方法

<sub>/clear first → fresh context window</sub>

---

**Also available:**
- /gsd:plan-phase 1 — 跳过讨论，直接计划

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.planning/PROJECT.md`
- `.planning/config.json`
- `.planning/research/`（如果选择了研究）
  - `STACK.md`
  - `FEATURES.md`
  - `ARCHITECTURE.md`
  - `PITFALLS.md`
  - `SUMMARY.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

</output>

<success_criteria>

- [ ] .planning/ 目录已创建
- [ ] Git 仓库已初始化
- [ ] Brownfield 检测已完成
- [ ] 深度提问已完成（线索被跟随，不匆忙）
- [ ] PROJECT.md 捕获完整上下文 → **已提交**
- [ ] config.json 有工作流模式、粒度、并行化 → **已提交**
- [ ] 研究完成（如果已选择）— 4 个并行 agent 已启动 → **已提交**
- [ ] 需求已收集（来自研究或对话）
- [ ] 用户按类别划分了范围（v1/v2/范围外）
- [ ] REQUIREMENTS.md 已创建，带有 REQ-IDs → **已提交**
- [ ] gsd-roadmapper 已启动，带有上下文
- [ ] 路线图文件立即写入（不是草稿）
- [ ] 用户反馈已采纳（如果有）
- [ ] ROADMAP.md 已创建，带有阶段、需求映射、成功标准
- [ ] STATE.md 已初始化
- [ ] REQUIREMENTS.md 可追溯性已更新
- [ ] 用户知道下一步是 `/gsd:discuss-phase 1`

**原子提交：** 每个阶段立即提交其工件。如果上下文丢失，工件仍然存在。

</success_criteria>