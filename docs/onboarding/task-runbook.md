# GSD 项目开发 Runbook

> 常见开发操作手册，覆盖 Agent 开发、命令扩展、工作流调试、项目初始化、主题添加和测试编写六大场景。

---

## Runbook 1: 如何为 GSD 添加新的 Agent

### 前置条件

- 已克隆 get-shit-done 源码到本地
- 了解 Agent 的职责定位（不与现有 Agent 职责重叠）
- 熟悉 Markdown frontmatter 语法

### 现有 Agent 分析

GSD 当前包含以下 Agent（`get-shit-done/agents/` 目录）：

| Agent | 职责 | 颜色标识 |
|-------|------|----------|
| `gsd-executor` | 执行 PLAN.md，原子提交，偏差处理 | yellow |
| `gsd-planner` | 创建可执行阶段计划，任务拆分 | green |
| `gsd-debugger` | 科学方法调查 Bug，管理调试会话 | orange |
| `gsd-codebase-mapper` | 代码库结构映射 | - |
| `gsd-integration-checker` | 集成检查 | - |
| `gsd-nyquist-auditor` | Nyquist 审计 | - |
| `gsd-phase-researcher` | 阶段研究 | - |
| `gsd-plan-checker` | 计划校验 | - |
| `gsd-project-researcher` | 项目研究 | - |
| `gsd-research-synthesizer` | 研究综合 | - |
| `gsd-roadmapper` | 路线图生成 | - |
| `gsd-verifier` | 验证工作 | - |

### Frontmatter 结构

Agent 文件使用 YAML frontmatter + Markdown 正文结构。以 `gsd-executor.md` 为例：

```yaml
---
name: gsd-executor                          # Agent 唯一标识
description: 一句话描述 Agent 的职责        # 在 Skill 列表中显示
tools: Read, Write, Edit, Bash, Grep, Glob  # 允许使用的工具列表
color: yellow                               # 终端颜色标识
skills:                                     # 关联的 skill 名称
  - gsd-executor-workflow
# hooks:                                    # 可选的钩子配置
#   PostToolUse:
#     - matcher: "Write|Edit"
#       hooks:
#         - type: command
#           command: "npx eslint --fix $FILE 2>/dev/null || true"
---
```

正文部分使用 XML 标签组织内容：

```markdown
<role>
角色定义：你是谁，由谁触发，核心职责是什么。
</role>

<project_context>
项目上下文发现逻辑：读 CLAUDE.md、检查 skills 目录。
</project_context>

<execution_flow>
执行流程：按步骤组织，使用 <step name="xxx" priority="first"> 标签。
</execution_flow>

<deviation_rules>
偏差规则：自动处理策略（Rule 1-4）。
</deviation_rules>

<success_criteria>
成功标准：检查清单。
</success_criteria>
```

### 详细步骤

**步骤 1：确定 Agent 定位**

在创建前确认：
- 新 Agent 不与现有 Agent 职责重叠
- 有明确的触发场景（被哪个 Command 或 Workflow 调用）
- 需要独立的上下文空间（上下文消耗大，需要子代理隔离）

**步骤 2：创建 Agent 文件**

```bash
# 在 agents 目录下创建新文件
touch get-shit-done/agents/gsd-my-agent.md

# 如果需要中文版
touch get-shit-done/agents/gsd-my-agent.zh-CN.md
```

**步骤 3：编写 Frontmatter**

```yaml
---
name: gsd-my-agent
description: 一句话描述职责，例如 "Analyzes performance bottlenecks and generates optimization suggestions"
tools: Read, Bash, Grep, Glob              # 按需选择最小工具集
color: cyan                                 # 选择一个不重复的颜色
skills:
  - gsd-my-agent-workflow                   # 对应的 workflow skill
---
```

可用的 `tools` 包括：`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`, `Task`, `WebFetch`, `WebSearch`, `mcp__context7__*`, `AskUserQuestion`, `TodoWrite` 等。

可选 `color`：`yellow`, `green`, `orange`, `cyan`, `blue`, `red`, `magenta` 等。

**步骤 4：编写正文内容**

按照以下模板组织：

```markdown
<role>
你是一个 [职责描述] 的 Agent。
由 [触发方] 触发。
你的核心工作：[主要产出]。

**CRITICAL: Mandatory Initial Read**
如果 prompt 包含 `<files_to_read>` 块，必须先用 Read 工具加载所有列出的文件。
</role>

<execution_flow>

<step name="load_project_state" priority="first">
加载上下文：
\```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init my-workflow "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
\```
</step>

<step name="do_work">
执行核心逻辑...
</step>

<step name="return_results">
返回结构化结果...
</step>

</execution_flow>

<success_criteria>
- [ ] 条件 1
- [ ] 条件 2
</success_criteria>
```

**步骤 5：在 Command 中引用新 Agent**

在命令文件（如 `get-shit-done/commands/gsd/my-command.md`）的 frontmatter 中通过 `agent` 字段引用：

```yaml
---
name: gsd:my-command
description: 使用新 Agent 执行某任务
agent: gsd-my-agent           # 引用 Agent 的 name 字段
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
---
```

在命令的 `<process>` 部分，通过 `Task()` 子代理方式启动：

```markdown
<process>
## 1. Spawn Agent

\```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-my-agent",
  model="{model_name}",
  description="执行某任务"
)
\```

## 2. Handle Agent Return
（处理返回结果）
</process>
```

### 验证方法

1. **文件结构验证**：确认 frontmatter 格式正确
   ```bash
   head -20 get-shit-done/agents/gsd-my-agent.md
   ```

2. **命名验证**：确认 `name` 字段与文件名一致（去掉 `gsd-` 前缀后与文件名匹配）

3. **功能验证**：在 Claude Code 中通过引用该 Agent 的命令触发，观察是否能正常加载和执行

4. **参考对照**：与现有 Agent（如 `gsd-debugger.md`）对比，确保结构完整

---

## Runbook 2: 如何为 GSD 添加新的斜杠命令

### 前置条件

- 了解 GSD 命令的调用方式（`/gsd:command-name`）
- 了解命令如何与 Workflow、Agent 协作
- 熟悉 YAML frontmatter 语法

### 现有命令分析

命令文件位于 `get-shit-done/commands/gsd/`，每个命令对应一个 Markdown 文件。完整命令清单：

| 类别 | 命令 | 说明 |
|------|------|------|
| **项目初始化** | `new-project` | 初始化新项目 |
| **里程碑** | `new-milestone`, `complete-milestone`, `audit-milestone` | 里程碑管理 |
| **阶段规划** | `plan-phase`, `discuss-phase`, `research-phase` | 阶段规划和研究 |
| **阶段执行** | `execute-phase`, `add-phase`, `insert-phase`, `remove-phase` | 执行和阶段管理 |
| **验证** | `verify-work`, `validate-phase` | 工作验证 |
| **调试** | `debug`, `health` | 调试和健康检查 |
| **进度** | `progress`, `check-todos`, `add-todo` | 进度跟踪 |
| **暂停/恢复** | `pause-work`, `resume-work` | 工作暂停恢复 |
| **工具** | `map-codebase`, `add-tests`, `cleanup` | 辅助工具 |
| **设置** | `set-profile`, `settings`, `update` | 配置管理 |
| **其他** | `quick`, `help`, `join-discord` | 快捷操作和帮助 |

### Frontmatter 结构

以 `execute-phase.md` 为例：

```yaml
---
name: gsd:execute-phase                              # 命令名（含 gsd: 前缀）
description: Execute all plans in a phase with wave-based parallelization  # 一句话描述
argument-hint: "<phase-number> [--gaps-only]"        # 参数提示
allowed-tools:                                       # 允许使用的工具
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---
```

部分命令（如 `plan-phase`）有额外的 `agent` 字段：

```yaml
---
name: gsd:plan-phase
description: Create detailed phase plan (PLAN.md) with verification loop
argument-hint: "[phase] [--auto] [--research] [--skip-research] [--gaps] [--skip-verify] [--prd <file>]"
agent: gsd-planner                # 指定使用的 Agent
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---
```

### 正文结构

命令正文使用以下 XML 标签组织：

```markdown
<objective>
命令的目标：做什么、产出什么。
</objective>

<execution_context>
引用的 Workflow 和 Template 文件（使用 @~/.claude/get-shit-done/ 路径前缀）。
</execution_context>

<context>
参数说明和 Flags 定义。
Phase: $ARGUMENTS
</context>

<process>
执行流程：引用 Workflow 并传递控制权。
</process>
```

### 详细步骤

**步骤 1：创建命令文件**

```bash
# 创建英文版
touch get-shit-done/commands/gsd/my-feature.md

# 创建中文版
touch get-shit-done/commands/gsd/my-feature.zh-CN.md
```

**步骤 2：编写 Frontmatter**

```yaml
---
name: gsd:my-feature
description: 一句话描述命令功能
argument-hint: "[required-arg] [--optional-flag]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
---
```

如果命令需要委托给特定 Agent，添加：

```yaml
agent: gsd-my-agent
```

**步骤 3：编写命令正文**

最简单的命令（直接委托给 Workflow）：

```markdown
---
name: gsd:my-feature
description: My feature description
argument-hint: "<required-arg>"
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
命令目标描述。

**Creates:**
- `.planning/output-file.md` — 输出文件说明

**After this command:** Run `/gsd:next-command` 继续流程。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/my-feature.md
@~/.claude/get-shit-done/templates/my-template.md
</execution_context>

<context>
Phase: $ARGUMENTS

**Flags:**
- `--auto` — 自动模式说明
</context>

<process>
Execute the my-feature workflow from @~/.claude/get-shit-done/workflows/my-feature.md end-to-end.
Preserve all workflow gates.
</process>
```

**步骤 4：创建对应的 Workflow 文件**

命令通常委托给 Workflow 执行，需同时创建：

```bash
touch get-shit-done/get-shit-done/workflows/my-feature.md
```

Workflow 文件包含详细的执行步骤（参考 `workflows/execute-phase.md` 的结构）：

```markdown
<purpose>
一句话说明 Workflow 的目的。
</purpose>

<core_principle>
核心原则。
</core_principle>

<required_reading>
必须先读取的文件。
</required_reading>

<process>

<step name="initialize" priority="first">
加载上下文...
</step>

<step name="main_work">
核心逻辑...
</step>

</process>
```

**步骤 5：如需 Template，同步创建**

```bash
touch get-shit-done/get-shit-done/templates/my-template.md
```

### 命令如何引用 Workflow

关键引用方式是使用 `@` 路径前缀：

```markdown
<execution_context>
@~/.claude/get-shit-done/workflows/my-feature.md
@~/.claude/get-shit-done/references/some-reference.md
@~/.claude/get-shit-done/templates/my-template.md
</execution_context>
```

`~/.claude/get-shit-done/` 是 GSD 安装后的实际路径（通过 `gsd-tools.cjs` 安装到用户目录）。

### 验证方法

1. **文件位置验证**：
   ```bash
   ls -la get-shit-done/commands/gsd/my-feature.md
   ```

2. **Frontmatter 验证**：确认 `name` 字段格式为 `gsd:command-name`
   ```bash
   head -15 get-shit-done/commands/gsd/my-feature.md
   ```

3. **功能验证**：在 Claude Code 中输入 `/gsd:my-feature` 测试是否出现在命令列表中

4. **Workflow 引用验证**：确认 `@~/.claude/get-shit-done/workflows/my-feature.md` 路径对应的文件存在于 `get-shit-done/get-shit-done/workflows/` 目录

---

## Runbook 3: 如何调试 GSD 工作流

### 前置条件

- 项目已通过 `/gsd:new-project` 初始化（存在 `.planning/` 目录）
- 了解 GSD 的状态管理机制（STATE.md / ROADMAP.md）

### 方法一：使用 /gsd:debug 命令

**步骤 1：启动调试**

在 Claude Code 中输入：

```
/gsd:debug [问题描述]
```

示例：
```
/gsd:debug execute-phase 在 Phase 2 执行时报错找不到 PLAN.md
```

**步骤 2：症状收集**

`/gsd:debug` 会自动收集以下信息（通过 AskUserQuestion）：

1. **Expected behavior** - 期望发生什么？
2. **Actual behavior** - 实际发生了什么？
3. **Error messages** - 错误信息？
4. **Timeline** - 何时开始的？
5. **Reproduction** - 如何复现？

如果不带参数运行，会先检查是否有活跃的调试会话：

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved | head -5
```

**步骤 3：自动调查**

`/gsd:debug` 会 spawn `gsd-debugger` 子代理进行独立调查。子代理使用科学方法：

- 读取相关文件
- 形成假设
- 测试假设
- 记录证据

调试状态保存在 `.planning/debug/{slug}.md` 中，支持跨上下文恢复。

**步骤 4：处理结果**

调试器可能返回三种结果：

| 返回类型 | 含义 | 操作 |
|----------|------|------|
| `## ROOT CAUSE FOUND` | 找到根因 | 选择：Fix now / Plan fix / Manual fix |
| `## CHECKPOINT REACHED` | 需要用户确认 | 回应 checkpoint 后继续 |
| `## INVESTIGATION INCONCLUSIVE` | 调查未果 | 选择：继续调查 / 手动排查 / 补充信息 |

### 方法二：手动检查状态文件

**检查 STATE.md（项目状态）**

```bash
cat .planning/STATE.md
```

关注以下字段：

| 字段 | 含义 | 常见问题 |
|------|------|----------|
| `Current Position > Status` | 当前状态 | 如果卡在 "In progress" 但实际未运行，可能需要手动更新 |
| `Current Position > Plan` | 当前计划编号 | 与实际完成的计划编号不匹配 |
| `Blockers/Concerns` | 阻塞项 | 检查是否有未解决的阻塞 |
| `Session Continuity > Stopped at` | 上次停止位置 | 用于恢复工作时的定位 |

**检查 ROADMAP.md（项目路线图）**

```bash
cat .planning/ROADMAP.md
```

关注：
- 各 Phase 的 `Plans:` 计划数量是否正确
- 计划列表中的 `[x]` / `[ ]` 状态是否与实际一致
- Phase 状态（`Ready to plan` / `In progress` / `Complete`）

**检查 Phase 目录**

```bash
# 列出所有 Phase 目录
ls .planning/phases/

# 检查特定 Phase 的文件
ls .planning/phases/01-foundation/

# 查看计划文件
cat .planning/phases/01-foundation/01-01-PLAN.md

# 查看已完成计划是否有 SUMMARY
ls .planning/phases/01-foundation/*-SUMMARY.md

# 查看是否有验证报告
ls .planning/phases/01-foundation/*-VERIFICATION.md

# 查看是否有 UAT 报告
ls .planning/phases/01-foundation/*-UAT.md
```

### 方法三：使用 gsd-tools CLI

```bash
# 加载项目状态
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
echo "$INIT" | python3 -m json.tool

# 验证计划文件的 frontmatter
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" frontmatter validate \
  .planning/phases/01-foundation/01-01-PLAN.md --schema plan

# 检查计划结构
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify plan-structure \
  .planning/phases/01-foundation/01-01-PLAN.md

# 列出 Phase 计划索引
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase-plan-index 1
```

### 常见错误和排查方法

#### 错误 1: "project not initialized"

**现象**：运行 GSD 命令时提示 `.planning/` 目录不存在

**排查**：
```bash
ls -la .planning/
```

**解决**：在项目根目录运行 `/gsd:new-project` 初始化

#### 错误 2: "no plans found in phase"

**现象**：`/gsd:execute-phase` 找不到计划

**排查**：
```bash
# 检查 Phase 目录是否存在
ls .planning/phases/

# 检查是否有 PLAN.md 文件
ls .planning/phases/*/01-*-PLAN.md
```

**解决**：先运行 `/gsd:plan-phase 1` 生成计划

#### 错误 3: STATE.md 状态与实际不符

**现象**：STATE.md 显示 "In progress" 但实际已完成

**排查**：
```bash
cat .planning/STATE.md | grep -A 5 "Current Position"
```

**解决**：手动编辑 STATE.md，或通过 gsd-tools 更新：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state update-progress
```

#### 错误 4: 上下文耗尽导致执行中断

**现象**：执行过程中 Claude 响应变慢或停止

**排查**：检查 SUMMARY.md 是否已创建：
```bash
ls .planning/phases/*/*-SUMMARY.md
```

**解决**：使用 `/gsd:resume-work` 恢复，或在新上下文中运行 `/gsd:execute-phase`

#### 错误 5: 计划验证失败

**现象**：`/gsd:plan-phase` 完成后验证不通过

**排查**：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" frontmatter validate \
  .planning/phases/01-foundation/01-01-PLAN.md --schema plan
```

**解决**：根据返回的 `missing` 字段补充缺失的 frontmatter 字段

### 验证方法

- `/gsd:health` 运行健康检查，确认项目状态正常
- `/gsd:progress` 查看整体进度，确认各 Phase 状态正确

---

## Runbook 4: 如何用 GSD 初始化新项目（完整生命周期）

### 前置条件

- 已安装 GSD 框架（`npm install -g get-shit-done-cc` 或通过 Claude Code 加载）
- 有一个项目目录（可以是空目录或已有代码的仓库）
- 对项目有基本想法（要做什么、目标用户是谁）

### 完整流程概览

```
/gsd:new-project
    |
    v
/gsd:plan-phase 1
    |
    v
/gsd:execute-phase 1
    |
    v
/gsd:verify-work 1
    |
    v
(如有问题) /gsd:plan-phase 1 --gaps -> /gsd:execute-phase 1 --gaps-only
    |
    v
/gsd:complete-milestone (可选)
```

### 阶段一：项目初始化

**步骤 1：进入项目目录**

```bash
cd /path/to/my-project
```

**步骤 2：运行 new-project**

在 Claude Code 中输入：

```
/gsd:new-project
```

可选参数：
- `/gsd:new-project --auto` — 自动模式，跳过交互式提问，需要提供想法文档

**步骤 3：回答项目问题**

GSD 会通过 AskUserQuestion 收集以下信息：
- 项目核心价值（一句话）
- 目标用户
- 主要功能
- 技术偏好
- 非功能性需求

**步骤 4：确认生成物**

初始化完成后，检查以下文件是否生成：

```bash
ls -la .planning/
```

预期产出：

| 文件 | 说明 |
|------|------|
| `.planning/PROJECT.md` | 项目上下文（核心价值、约束、技术栈） |
| `.planning/config.json` | 工作流偏好配置 |
| `.planning/REQUIREMENTS.md` | 需求文档（含可追踪的需求 ID） |
| `.planning/ROADMAP.md` | 路线图（Phase 结构、计划概览） |
| `.planning/STATE.md` | 项目状态（当前进度、决策历史） |
| `.planning/research/` | 领域研究（可选） |

### 阶段二：规划第一个 Phase

**步骤 5：规划 Phase**

```
/gsd:plan-phase 1
```

可选参数：
- `--auto` — 自动模式
- `--research` — 强制重新研究
- `--skip-research` — 跳过研究
- `--prd <file>` — 使用 PRD 文件替代 discuss-phase

**步骤 6：确认计划**

规划完成后会生成 PLAN.md 文件：

```bash
ls .planning/phases/01-*/*-PLAN.md
```

查看生成的计划：

```bash
cat .planning/phases/01-*/*-PLAN.md
```

关注：
- 每个计划的 `wave` 编号（同 wave 可并行执行）
- `depends_on` 依赖关系
- `tasks` 中的具体任务描述

### 阶段三：执行 Phase

**步骤 7：执行 Phase**

建议先清空上下文再执行（避免上下文溢出）：

```
/clear
```

然后执行：

```
/gsd:execute-phase 1
```

可选参数：
- `--auto` — 自动链式执行（跳过 checkpoint 确认）
- `--gaps-only` — 仅执行 gap closure 计划

**步骤 8：处理 Checkpoint**

执行过程中可能遇到 checkpoint（暂停等待用户操作）：

| Checkpoint 类型 | 频率 | 操作 |
|-----------------|------|------|
| `human-verify` | 90% | 访问 URL / 运行命令，确认功能正确 |
| `decision` | 9% | 在选项中选择一个方案 |
| `human-action` | 1% | 执行 Claude 无法自动化的操作（如 2FA） |

**步骤 9：检查执行结果**

```bash
# 查看生成的 SUMMARY
ls .planning/phases/01-*/*-SUMMARY.md

# 查看 STATE 更新
cat .planning/STATE.md | grep -A 3 "Current Position"
```

### 阶段四：验证工作

**步骤 10：运行验证**

```
/gsd:verify-work 1
```

这会启动对话式 UAT（用户验收测试），逐项验证功能。

**步骤 11：处理验证结果**

如果发现问题，GSD 会自动生成修复计划：

```
# 查看验证报告
cat .planning/phases/01-*/*-UAT.md

# 如果有诊断出的问题，生成修复计划
/gsd:plan-phase 1 --gaps

# 执行修复
/gsd:execute-phase 1 --gaps-only
```

### 阶段五：继续后续 Phase

**步骤 12：规划并执行下一个 Phase**

```bash
# 规划
/gsd:plan-phase 2

# 执行
/clear
/gsd:execute-phase 2

# 验证
/gsd:verify-work 2
```

**步骤 13：查看整体进度**

```
/gsd:progress
```

### 常用辅助命令

| 命令 | 用途 |
|------|------|
| `/gsd:pause-work` | 暂停当前工作，保存状态 |
| `/gsd:resume-work` | 恢复之前暂停的工作 |
| `/gsd:check-todos` | 检查待办事项 |
| `/gsd:add-todo` | 添加待办事项 |
| `/gsd:health` | 项目健康检查 |
| `/gsd:progress` | 查看进度 |
| `/gsd:help` | 帮助信息 |

### 验证方法

1. **初始化验证**：`.planning/` 目录包含 PROJECT.md、ROADMAP.md、STATE.md、REQUIREMENTS.md
2. **规划验证**：Phase 目录下有 PLAN.md 文件，frontmatter 包含必需字段
3. **执行验证**：Phase 目录下有 SUMMARY.md 文件，git log 中有对应的 commit
4. **进度验证**：`/gsd:progress` 显示正确的完成百分比

---

## Runbook 5: 如何在 demo-by-gsd 中添加新的前端设计主题

### 前置条件

- 了解 demo-by-gsd 项目的技术栈（Astro + React + Tailwind CSS）
- 熟悉 CSS 自定义属性（CSS Variables）
- 有新主题的配色方案和设计理念

### 现有主题分析

主题数据定义在 `demo-by-gsd/src/data/styles.json` 中。当前包含 9 个主题：

| 主题 ID | 名称 | 风格 |
|---------|------|------|
| `terminal-noir` | Terminal Noir | 深色终端 + 霓虹绿 |
| `soft-pastel` | Soft Pastel | 柔和粉彩 |
| `brutalist-raw` | Brutalist Raw | 粗野主义 |
| `ocean-deep` | Ocean Deep | 深海蓝 |
| `forest-moss` | Forest Moss | 森林苔藓 |
| `sunset-warm` | Sunset Warm | 日落暖色 |
| `glassmorphism-frost` | Glassmorphism Frost | 磨砂玻璃 |
| `cyberpunk-pulse` | Cyberpunk Pulse | 赛博朋克 |
| `minimal-light` | Minimal Light | 极简明亮 |

每个主题结构包含：

```json
{
  "id": "theme-id",
  "name": "Theme Display Name",
  "description": "主题描述（中文）",
  "cssVariables": {
    "--color-bg": "#hex",
    "--color-bg-elevated": "#hex",
    "--color-text": "#hex",
    "--color-text-muted": "#hex",
    "--color-border": "rgba(...)",
    "--color-primary": "#hex",
    "--color-primary-dim": "rgba(...)",
    "--color-amber": "#hex",
    "--color-red": "#hex",
    "--color-blue": "#hex",
    "--color-bg": "rgba(...)",
    "--glass-border": "rgba(...)"
  },
  "promptText": "## 前端设计偏好 - Theme Name\n\n> **核心理念**：...\n\n### 配色方案\n\n```css\n...\n```\n\n### 设计要点\n\n- ..."
}
```

### 详细步骤

**步骤 1：设计配色方案**

准备 10 个 CSS 变量值：

| 变量 | 用途 | 设计建议 |
|------|------|----------|
| `--color-bg` | 页面主背景 | 主题基调色 |
| `--color-bg-elevated` | 卡片/面板背景 | 比主背景浅一层 |
| `--color-text` | 主文字颜色 | 与背景对比度 >= 4.5:1 |
| `--color-text-muted` | 次要文字 | 比主文字浅 |
| `--color-border` | 边框 | 微妙的分隔 |
| `--color-primary` | 强调色/CTA | 主题代表色 |
| `--color-primary-dim` | 强调色低透明度 | hover/focus 态 |
| `--color-amber` | 警告/注意 | 黄/橙色系 |
| `--color-red` | 错误/危险 | 红色系 |
| `--color-blue` | 信息/辅助 | 蓝色系 |
| `--glass-bg` | 玻璃效果背景 | 半透明 |
| `--glass-border` | 玻璃效果边框 | 半透明 |

**步骤 2：编辑 styles.json**

打开 `demo-by-gsd/src/data/styles.json`，在 `styles` 数组末尾添加新主题：

```json
{
  "id": "my-theme",
  "name": "My Theme Name",
  "description": "主题的中文描述，说明风格特点和适用场景。",
  "cssVariables": {
    "--color-bg": "#1a1a2e",
    "--color-bg-elevated": "#16213e",
    "--color-text": "#eaeaea",
    "--color-text-muted": "#8a8a9a",
    "--color-border": "rgba(255, 255, 255, 0.08)",
    "--color-primary": "#e94560",
    "--color-primary-dim": "rgba(233, 69, 96, 0.15)",
    "--color-amber": "#ffc947",
    "--color-red": "#e94560",
    "--color-blue": "#0f3460",
    "--glass-bg": "rgba(22, 33, 62, 0.8)",
    "--glass-border": "rgba(233, 69, 96, 0.2)"
  },
  "promptText": "## 前端设计偏好 - My Theme Name\n\n> **核心理念**：描述设计理念。\n\n### 配色方案\n\n```css\n--color-bg: #1a1a2e;\n--color-bg-elevated: #16213e;\n...（完整列出所有变量）\n```\n\n### 设计要点\n\n- **要点1**：说明\n- **要点2**：说明\n- **要点3**：说明"
}
```

**步骤 3：检查是否需要创建新组件**

通常不需要。Gallery 组件（`demo-by-gsd/src/components/Gallery.tsx`）会自动：
- 从 `styles.json` 读取所有主题
- 渲染主题列表
- 点击主题时动态注入 CSS Variables

```tsx
// Gallery.tsx 中已有的逻辑
const handleStyleSelect = (styleId: string) => {
  setSelectedId(styleId);
  const selected = styles.find(s => s.id === styleId);
  if (selected) {
    setCurrentStyle(selected);
    // 动态注入 CSS 变量
    const root = document.documentElement;
    Object.entries(selected.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
};
```

但如果新主题需要特殊组件（如独特的预览效果），则在 `demo-by-gsd/src/components/` 下创建新组件。

**步骤 4：本地测试**

```bash
cd demo-by-gsd

# 安装依赖（首次）
pnpm install

# 启动开发服务器
pnpm dev
```

在浏览器中访问 `http://localhost:4321`，检查：
- 新主题是否出现在左侧列表中
- 点击后右侧预览是否正确应用配色
- 文字对比度是否足够
- 整体视觉效果是否符合预期

### 验证方法

1. **JSON 格式验证**：
   ```bash
   python3 -c "import json; json.load(open('demo-by-gsd/src/data/styles.json'))"
   ```

2. **变量完整性验证**：确认 `cssVariables` 包含所有 12 个必需变量
   ```bash
   cat demo-by-gsd/src/data/styles.json | python3 -c "
   import json, sys
   data = json.load(sys.stdin)
   for style in data['styles']:
     vars = set(style['cssVariables'].keys())
     missing = set([
       '--color-bg', '--color-bg-elevated', '--color-text',
       '--color-text-muted', '--color-border', '--color-primary',
       '--color-primary-dim', '--color-amber', '--color-red',
       '--color-blue', '--glass-bg', '--glass-border'
     ]) - vars
     if missing:
       print(f'{style[\"id\"]}: missing {missing}')
   print('Validation complete')
   "
   ```

3. **运行测试**：
   ```bash
   cd demo-by-gsd && pnpm test
   ```

4. **构建验证**：
   ```bash
   cd demo-by-gsd && pnpm build
   ```

---

## Runbook 6: 如何运行和编写测试

### 前置条件

- Node.js >= 22.12.0
- 安装了项目依赖

### GSD 框架测试

GSD 框架本身是一个 npm 包，主要通过 `gsd-tools.cjs` CLI 工具和 Markdown 文件运作。

**查看 GSD 包信息**：

```bash
cd /path/to/get-shit-done-study/get-shit-done
cat package.json | grep -A 5 '"scripts"'
```

GSD 的核心测试方式是功能验证（而非传统单元测试）：

```bash
# 验证 frontmatter 格式
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" frontmatter validate \
  <file-path> --schema plan

# 验证计划结构
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify plan-structure \
  <plan-path>

# 查看可用命令
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" --help
```

### Demo 项目测试

Demo 项目使用 Vitest + Testing Library 作为测试框架。

**运行所有测试**：

```bash
cd /path/to/get-shit-done-study/demo-by-gsd

# 运行测试
pnpm test

# 监听模式（开发时推荐）
pnpm test:watch
```

**查看测试文件**：

```bash
# 组件测试
ls demo-by-gsd/src/components/__tests__/
# 输出:
# CopyButton.test.tsx
# Gallery.test.tsx
# PhoneFrame.test.tsx
# PomodoroTimer.test.tsx
# PreviewPane.test.tsx
# StyleCard.test.ts
# StyleList.test.ts
# Toast.test.tsx

# 性能测试
ls demo-by-gsd/src/test/
# 输出:
# performance.test.tsx
# setup.ts
```

**测试配置**：

测试配置在 `demo-by-gsd/vitest.config.ts` 中（或 `package.json` 的 vitest 字段）。测试环境使用 jsdom，设置文件为 `src/test/setup.ts`。

### 如何添加新测试

**步骤 1：确定测试类型**

| 测试类型 | 文件位置 | 适用场景 |
|----------|----------|----------|
| 组件测试 | `src/components/__tests__/ComponentName.test.tsx` | React 组件渲染和交互 |
| 工具函数测试 | `src/components/__tests__/utilName.test.ts` | 纯函数、工具类 |
| 性能测试 | `src/test/performance.test.tsx` | 性能基准 |
| 集成测试 | `src/test/integration.test.tsx` | 多组件协作 |

**步骤 2：创建测试文件**

以组件测试为例：

```bash
touch demo-by-gsd/src/components/__tests__/MyComponent.test.tsx
```

**步骤 3：编写测试**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click event', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    await fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

**步骤 4：针对 styles.json 数据的测试**

如果为新添加的主题编写测试：

```typescript
import { describe, it, expect } from 'vitest';
import stylesData from '../../data/styles.json';

describe('Styles Data', () => {
  const requiredVars = [
    '--color-bg', '--color-bg-elevated', '--color-text',
    '--color-text-muted', '--color-border', '--color-primary',
    '--color-primary-dim', '--color-amber', '--color-red',
    '--color-blue', '--glass-bg', '--glass-border'
  ];

  it('every style should have all required CSS variables', () => {
    for (const style of stylesData.styles) {
      for (const varName of requiredVars) {
        expect(style.cssVariables).toHaveProperty(varName);
      }
    }
  });

  it('every style should have unique id', () => {
    const ids = stylesData.styles.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('new theme should be present', () => {
    expect(stylesData.styles.find(s => s.id === 'my-theme')).toBeDefined();
  });
});
```

**步骤 5：运行测试**

```bash
# 运行单个测试文件
cd demo-by-gsd && pnpm vitest run src/components/__tests__/MyComponent.test.tsx

# 运行所有测试
cd demo-by-gsd && pnpm test

# 运行并查看覆盖率
cd demo-by-gsd && pnpm vitest run --coverage
```

### 验证方法

1. **所有测试通过**：
   ```bash
   cd demo-by-gsd && pnpm test
   # 期望输出：Tests  X passed | Y failed
   ```

2. **构建成功**（验证测试不影响构建）：
   ```bash
   cd demo-by-gsd && pnpm build
   ```

3. **Lint 检查**（如已配置）：
   ```bash
   cd demo-by-gsd && pnpm lint
   ```

---

> 本文档基于 GSD v1.22.4 版本源码分析生成。如需查看框架最新变更，参考 `get-shit-done/` 目录下的源码和 `CHANGELOG.zh-CN.md`。
