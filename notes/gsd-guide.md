---
article_id: OBA-gsdguide01
tags: [open-source, gsd, claude-code, ai-framework, guide]
type: tutorial
updated_at: 2026-04-19
---

# Get Shit Done (GSD) 使用指南

> 一个让 Claude Code 稳定、可靠地产出代码的 AI 辅助开发框架，解决"上下文窗口满了之后 AI 开始胡说八道"的问题。

## 这个工具解决什么问题

你有没有遇到过这种情况：用 Claude Code 写代码，刚开始质量很高，但聊着聊着 AI 就开始忘事、重复、甚至写出矛盾的东西？这就是**上下文衰减**——当对话太长，AI 的"短期记忆"装不下了。

GSD 解决的就是这个问题。它不让你和 AI 无止境地聊天，而是把项目拆成**小任务**，每个任务交给一个**全新的 AI 上下文**去执行。主对话只负责协调，不做重活，所以记忆永远不会溢出。

**一句话总结**：复杂的项目管理交给文件系统，重活交给子代理，主对话永远保持清醒。

## 快速上手

### 第 1 步：安装

```bash
npx get-shit-done-cc@latest
```

安装时选择运行时（Claude Code）和位置（全局或本地项目）。

### 第 2 步：验证安装

在 Claude Code 中输入：

```
/gsd:help
```

看到命令列表说明安装成功。

### 第 3 步：初始化项目

```
/gsd:new-project
```

系统会问你：想做什么、技术栈、约束条件。然后自动生成项目愿景、需求文档和开发路线图。

### 第 4 步：开始开发

```
/gsd:plan-phase 1     # 规划第一个阶段
/gsd:execute-phase 1  # 执行第一个阶段
/gsd:verify-work 1    # 验证结果
```

每完成一个阶段重复上述流程，直到所有阶段完成。

## 核心概念

| 概念 | 一句话解释 |
|------|-----------|
| **Roadmap** | 项目地图，列出所有要做的阶段 |
| **Phase** | 一个独立的开发阶段，比如"用户注册" |
| **Plan** | Phase 下面的原子任务，一次能干完的那种 |
| **Agent** | 专业化的 AI 子代理，比如研究员、规划师、执行者 |
| **STATE.md** | 项目的"记忆文件"，跨会话保存进度 |

核心设计思路用一张图表示：

```
你 → /gsd:execute-phase 1 → 编排器（主对话，保持清醒）
                               ├── Plan 01 → 子代理 A（全新上下文，专注干活）
                               ├── Plan 02 → 子代理 B（全新上下文，并行执行）
                               └── Plan 03 → 子代理 C（等前两个完成再执行）
```

## 🏗️ 系统架构图

GSD 由两大子系统组成：**运行时框架**（agents/commands/hooks/scripts）和 **项目知识库**（`.planning/`）。

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户（Claude Code）                        │
│                          ↓ /gsd:* 命令                           │
├─────────────────────────────────────────────────────────────────┤
│                      commands/gsd/*.md                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │new-project│ │plan-phase│ │execute-  │ │ verify-work      │   │
│  │           │ │          │ │ phase    │ │ debug pause-work │   │
│  └─────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘   │
│        ↓            ↓            ↓                 ↓             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              薄编排层（主对话，~15% 上下文）               │    │
│  │     分析依赖 → 分波（wave） → 派发子代理 → 收集结果       │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         ↓ Task 工具派发                          │
├─────────────────────────────────────────────────────────────────┤
│                      agents/*.md（子代理，100% 全新上下文）        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐      │
│  │Planner │ │Executor│ │Verifier│ │Debugger│ │Researcher│ ...  │
│  │1309 行  │ │ 489 行  │ │ 581 行  │ │1257 行  │ │ 631 行   │      │
│  └───┬─────┘ └───┬─────┘ └───┬─────┘ └───┬─────┘ └────┬─────┘      │
│      ↓           ↓           ↓           ↓           ↓            │
├─────────────────────────────────────────────────────────────────┤
│                         项目知识库 .planning/                     │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────────┐  │
│  │ PROJECT.md   │ │ REQUIREMENTS │ │ STATE.md（跨会话记忆）    │  │
│  │ ROADMAP.md   │ │ research/    │ │ phases/（计划+总结+验证） │  │
│  └──────────────┘ └──────────────┘ └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      hooks/（自动化守护）                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐  │
│  │ gsd-statusline   │ │ gsd-context-     │ │ gsd-check-      │  │
│  │ 实时状态栏显示    │ │ monitor 上下文监控│ │ update 版本检测  │  │
│  └──────────────────┘ └──────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      scripts/（构建辅助）                         │
│         build-hooks.js          run-tests.cjs                   │
└─────────────────────────────────────────────────────────────────┘

数据流向：
  用户命令 → Command（编排） → 子代理（执行） → .planning/（持久化）
                ↑                                      ↓
              hooks（监控上下文 + 状态栏反馈）←──────────┘
```

**关键协作关系**：

| 组件 | 职责 | 与谁交互 |
|------|------|----------|
| **commands/** | 接收用户指令，编排子代理 | → agents/、.planning/ |
| **agents/** | 在独立上下文中执行具体任务 | → .planning/、项目代码 |
| **hooks/** | 被动监控，注入上下文警告 | ← Claude Code 事件 |
| **scripts/** | 构建和测试辅助 | ← 开发者手动调用 |
| **.planning/** | 项目知识持久化 | ← agents 写入，→ commands 读取 |

## 🗺️ 关键文件地图

按阅读优先级排序。**从上往下读，逐步深入。**

### 第一梯队：理解整体设计（入门必读）

| 文件 | 行数 | 阅读时机 | 核心收获 |
|------|------|----------|----------|
| `commands/gsd/execute-phase.md` | 41 行 | 第一个读的文件 | 理解编排器的核心循环：发现 Plan → 分波 → 派发子代理 → 收集结果 |
| `commands/gsd/plan-phase.md` | 45 行 | 紧接着读 | 理解 Phase 如何拆解为 Plan |
| `agents/gsd-executor.md` | 489 行 | 第一个深入读的 Agent | 最核心的子代理，理解原子执行、偏差处理、检查点机制 |
| `agents/gsd-planner.md` | 1309 行 | 最复杂的 Agent | Plan 生成的完整逻辑，XML 结构化 Prompt 的最佳范例 |

### 第二梯队：理解质量保障（进阶阅读）

| 文件 | 行数 | 阅读时机 | 核心收获 |
|------|------|----------|----------|
| `agents/gsd-verifier.md` | 581 行 | 想理解验证机制时 | Plan 执行后的质量检查 |
| `agents/gsd-debugger.md` | 1257 行 | 遇到执行失败时 | 最复杂的调试 Agent，自动诊断+修复 |
| `agents/gsd-codebase-mapper.md` | 772 行 | 想理解代码感知时 | 项目结构分析和上下文注入 |
| `commands/gsd/research-phase.md` | 190 行 | 想理解研究流程时 | 最长的 Command，Phase 前的技术调研 |

### 第三梯队：理解自动化与辅助（按需阅读）

| 文件 | 行数 | 阅读时机 | 核心收获 |
|------|------|----------|----------|
| `hooks/gsd-context-monitor.js` | ~80 行 | 想理解上下文监控时 | Bridge File 模式的实现，阈值注入机制 |
| `hooks/gsd-statusline.js` | ~60 行 | 想自定义状态栏时 | 实时状态显示 |
| `agents/gsd-plan-checker.md` | 708 行 | 想理解 Plan 质量检查时 | 执行前的 Plan 校验 |
| `agents/gsd-roadmapper.md` | 652 行 | 想理解路线图生成时 | Roadmap 的结构化生成 |
| `agents/gsd-research-synthesizer.md` | 249 行 | 想理解研究整合时 | 多份研究报告的汇总 |

### 第四梯队：辅助组件（用到再看）

| 文件 | 说明 |
|------|------|
| `agents/gsd-project-researcher.md` (631 行) | 项目级技术调研 |
| `agents/gsd-phase-researcher.md` (555 行) | Phase 级技术调研 |
| `agents/gsd-integration-checker.md` (445 行) | 集成测试检查 |
| `agents/gsd-nyquist-auditor.md` (178 行) | 代码质量审计 |
| `scripts/run-tests.cjs` | 测试运行器 |
| `scripts/build-hooks.js` | Hook 构建脚本 |

## ⚠️ 高风险文件

这些文件如果误改，会导致整个框架工作异常：

| 文件 | 风险等级 | 原因 |
|------|----------|------|
| `agents/gsd-planner.md` | 🔴 高 | 1309 行，Plan 生成的核心逻辑。XML 标签结构一旦破坏，AI 将无法正确生成 Plan |
| `agents/gsd-executor.md` | 🔴 高 | 执行器是唯一实际写代码的 Agent。偏差处理和检查点逻辑非常精密 |
| `agents/gsd-debugger.md` | 🔴 高 | 1257 行，自动修复逻辑复杂。误改可能导致修复引入新 bug |
| `commands/gsd/execute-phase.md` | 🟡 中 | 编排器是所有执行的入口。分波逻辑错误会导致并行执行顺序混乱 |
| `hooks/gsd-context-monitor.js` | 🟡 中 | 上下文阈值直接决定 Agent 何时停止。阈值设错会导致过早停止或内存溢出 |
| `.planning/STATE.md` | 🟡 中 | 跨会话记忆文件。格式错误会导致状态恢复失败 |
| `commands/gsd/new-project.md` | 🟢 低 | 只在初始化时运行一次，影响范围有限 |

**修改建议**：
- 修改任何 Agent 的 XML 标签结构后，必须用 `/gsd:debug` 跑一轮完整测试
- 修改 hooks 后，检查 `/tmp/claude-ctx-*.json` 是否正常生成
- 修改 STATE.md 格式后，用 `/gsd:health` 验证状态可正常读取

## 💡 核心设计决策

以下是从源码中提炼的关键设计决策，每个决策都解决了特定的工程问题：

| # | 问题 | 方案 | 原因 |
|---|------|------|------|
| 1 | 上下文窗口有限，长对话质量下降 | **子代理隔离执行**：每个 Plan 分配独立上下文（100%），编排器只占 ~15% | 与其在有限窗口内塞入更多内容，不如给每个任务完整的窗口。编排器几乎不消耗上下文 |
| 2 | AI 不知道自己快"忘"了 | **Bridge File 上下文监控**：Statusline Hook 写入 `/tmp/claude-ctx-{session}.json`，PostToolUse Hook 读取并注入警告 | 通过临时文件跨进程通信，让 AI 在 remaining ≤ 35% 时主动收尾，≤ 25% 时立即停止 |
| 3 | Prompt 太长，AI 容易偏离 | **XML 标签结构化**：用 `<role>` `<process>` `<step>` `<success_criteria>` 等标签强制 AI 按步骤执行 | XML 标签比 Markdown 列表有更强的约束力，AI 更不容易跳过步骤或自由发挥 |
| 4 | 每次加载上下文都要读多个文件 | **INIT 变量注入**：CLI 工具一次性生成所有上下文 JSON，workflow 通过 `@file:` 协议按需加载 | 避免多次 Read 工具调用，减少上下文消耗。大数据时 CLI 写入临时文件，workflow 只读一个变量 |
| 5 | Plan 之间有依赖，不能全并行 | **Wave-based 并行**：分析 Plan 依赖关系，无依赖的同一波并行，有依赖的排到后面的波 | 兼顾速度和正确性。典型场景：Plan 01（数据库）→ Plan 02（API + 前端并行） |
| 6 | 跨会话需要记住项目进度 | **STATE.md 分层持久化**：项目级（愿景不变）、Phase 级（计划+总结）、全局级（STATE.md） | 比把所有信息塞入 CLAUDE.md 更精细。主对话只需读 STATE.md，详细数据按需从 phases/ 加载 |
| 7 | 子代理执行偏离计划怎么办 | **偏差处理 + 检查点**：Executor 内置 deviation 检测，minor 自动修正，major 暂停并报告 | 不是所有偏差都需要人工介入。minor（换了个变量名）自动处理，major（删了整个模块）暂停等确认 |
| 8 | 验证和执行应该分离 | **独立 Verifier Agent**：执行完成后，由全新上下文的 Verifier 检查结果 | 如果执行和验证用同一个上下文，AI 容易"自我感觉良好"。独立上下文确保客观 |

## 🐛 调试指南

### 常见问题排查流程

```
问题发生
  ↓
/gsd:health ──→ 通过？──→ 检查 .planning/ 文件完整性
  ↓ 否                          ↓
检查 hooks 是否正常加载      检查 STATE.md 格式
  ↓                              ↓
/tmp/claude-ctx-*.json 存在？  phases/*/PLAN.md 存在？
```

### 问题速查表

| 症状 | 可能原因 | 排查步骤 |
|------|----------|----------|
| 子代理不执行 Plan | PLAN.md 格式错误 | 检查 frontmatter 是否完整，特别是 `depends_on` 字段 |
| 上下文警告不停弹出 | context-monitor 阈值太高或 bridge file 损坏 | 删除 `/tmp/claude-ctx-*.json`，检查 hooks/gsd-context-monitor.js 的阈值配置 |
| `/gsd:execute-phase` 中途停止 | 某个子代理遇到 major deviation | 查看 `.planning/phases/*/SUMMARY.md`，寻找 `[DEVIATION]` 标记 |
| STATE.md 信息丢失 | 格式被意外修改 | 用 `/gsd:health` 重建，或手动从 git 历史恢复 |
| 验证报告全是失败 | Plan 实现不完整或 verify-work 的检查标准太严 | 先用 `/gsd:debug` 让 Debugger Agent 自动修复，不行再手动调整 |
| 安装后命令不识别 | hooks 未正确加载 | 运行 `/gsd:settings` 检查配置，确认 `.claude/settings.json` 中已注册 |

### 关键调试命令

```
/gsd:health          # 检查 .planning/ 完整性和 hooks 状态
/gsd:debug           # 自动诊断并修复当前 Phase 的问题
/gsd:progress        # 查看项目整体进度
/gsd:check-todos     # 检查未完成的 TODO 项
/gsd:pause-work      # 手动暂停当前工作（会保存状态）
/gsd:resume-work     # 从暂停点恢复
```

### 日志和中间文件位置

| 文件 | 说明 |
|------|------|
| `/tmp/claude-ctx-{session}.json` | 上下文监控的 Bridge File，包含 remaining_percentage |
| `.planning/STATE.md` | 跨会话状态，包含决策记录和阻塞项 |
| `.planning/phases/*/SUMMARY.md` | 每个 Plan 的执行总结，包含 deviation 记录 |
| `.planning/phases/*/VERIFICATION.md` | 验证报告 |

## 架构一览

GSD 在项目根目录创建 `.planning/` 文件夹，所有项目知识以文件形式持久化：

```
.planning/
├── PROJECT.md        # 项目愿景（每次都加载）
├── REQUIREMENTS.md   # 需求文档（v1/v2 范围划分）
├── ROADMAP.md        # 开发路线图
├── STATE.md          # 跨会话记忆（决策、进度、阻塞项）
├── research/         # 领域研究（技术栈、架构、陷阱）
└── phases/           # 每个阶段的计划、执行总结、验证报告
```

框架由四个核心目录组成：

| 目录 | 职责 |
|------|------|
| `agents/` | 定义各种专业子代理（研究员、规划师、执行者、验证器等） |
| `commands/` | 所有 `/gsd:*` 斜杠命令 |
| `hooks/` | Git 和 Claude 的钩子脚本 |
| `scripts/` | 构建和测试辅助脚本 |

## 适合谁用

| 适合 | 不适合 |
|------|--------|
| 独立开发者，想用 AI 高效交付项目 | 只是想让 AI 写几行代码的轻量用户 |
| 有明确想法但不想自己写代码的人 | 想要完整企业级项目管理流程的团队 |
| 用 Claude Code 做长期项目，经常遇到上下文溢出 | 还没用过 Claude Code 的新手 |

**典型用户画像**：你有产品想法，清楚自己想要什么，想让 AI 帮你把事情做出来——而不是扮演一个 50 人的工程团队走冲刺流程。

## 进阶阅读

以下笔记按主题分类，帮助你深入理解 GSD 的设计精髓：

**框架核心**
- [GSD 使用指南](gsd/GSD使用指南.md) — 完整的命令速查和工作流说明
- [框架完整架构梳理](architecture/gsd-framework-overview.md) — 组件协作全景
- [执行模型分析](gsd-execution-model.md) — Phase/Plan 的执行机制

**设计模式**
- [最简多 Agent 编排设计](design/minimal-multi-agent-orchestration.md) — 子代理编排的核心模式
- [Agent 设计](design/agents-design.md) — 各 Agent 的职责边界
- [XML 标签结构化 Prompt 设计](reusable-designs/XML标签结构化Prompt设计.md) — GSD 的 Prompt 工程技巧

**可复用技巧**
- [上下文生命周期管理](reusable-designs/gsd-context-lifecycle-management.md) — 如何管理 AI 的"记忆"
- [Hooks 跨进程通信模式](reusable-designs/Hooks跨进程通信模式.md) — Bridge File 的实现原理
- [INIT 变量注入模式](reusable-designs/init-variable-injection.md) — 一次性加载上下文的技巧
- [Skills vs Commands 选择分析](reusable-designs/skills-vs-commands.md) — 两种扩展方式的对比
- [工作流中断与恢复指南](gsd-interruption-guide.md) — 断点续传机制

**Claude Code 基础**
- [Hooks 使用指南](claude-code/Hooks使用指南.md) — Claude Code 钩子系统入门
- [Settings 层级与合并行为](claude-config/settings层级与合并行为.md) — 配置管理机制
