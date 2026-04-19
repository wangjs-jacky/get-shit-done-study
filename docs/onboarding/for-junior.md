# GSD 学习项目 - 初级开发者 Onboarding 指南

> 面向初级开发者：从零开始理解 GSD 框架和本学习项目。本文假设你具备基本的 Web 开发知识（HTML/CSS/JavaScript），但从未接触过 AI 辅助开发框架。

---

## 一、术语表

在开始之前，先把你会反复遇到的术语搞清楚。

### 1.1 核心概念

| 术语 | 英文 | 通俗解释 |
|------|------|----------|
| **GSD** | Get Shit Done | 一个帮你"把事做完"的 AI 开发工具。你告诉它想做什么，它帮你规划、编码、验证 |
| **Claude Code** | - | Anthropic 公司推出的 AI 编程助手，运行在终端里。GSD 就是给它用的"增强插件" |
| **上下文窗口** | Context Window | AI 一次能"看到"的文字总量，就像人的短期记忆。Claude 的窗口约 200k 个 token（大约 15 万字） |
| **上下文衰减** | Context Rot | 当对话越来越长，AI 开始"遗忘"前面的内容，输出质量下降。这是 GSD 要解决的核心问题 |

### 1.2 项目管理术语

| 术语 | 英文 | 通俗解释 |
|------|------|----------|
| **Roadmap** | Roadmap | 项目路线图。就像旅游行程单，列出要经过的每个"站点" |
| **Milestone** | Milestone | 里程碑。一个大版本，比如 "v1.0"，包含一组完整的功能 |
| **Phase** | Phase | 开发阶段。里程碑下的子任务，比如 "Phase 1: 搭建基础框架" |
| **Plan** | Plan | 执行计划。Phase 下的具体任务清单，每个任务可以在一次对话中完成 |
| **Wave** | Wave | 执行波次。同一波次内没有依赖关系的 Plan 会同时执行（并行），不同波次之间按顺序执行 |

### 1.3 技术术语

| 术语 | 英文 | 通俗解释 |
|------|------|----------|
| **Agent** | Agent（代理） | 一个"专职员工"。GSD 有 12 个不同的代理，每个擅长不同的事情（有人擅长研究，有人擅长写代码，有人擅长检查质量） |
| **Hook** | Hook（钩子） | 在特定时机自动触发的脚本。比如"每次写完代码后自动检查上下文剩余量"就是一个 Hook |
| **Workflow** | Workflow（工作流） | 编排多个代理协作的"流程手册"。Workflow 告诉系统"先做 A，再做 B，如果 C 出问题了就做 D" |
| **Command** | Command（命令） | 你在 Claude Code 中输入的斜杠命令，比如 `/gsd:help`。Command 是你触发 Workflow 的入口 |
| **XML 标签** | XML Tags | 一种结构化文本格式。GSD 用 `<role>`、`<step>`、`<verify>` 等标签来给 AI 下指令，让 AI 不会"跑偏" |
| **原子提交** | Atomic Commit | 每完成一个小任务就创建一个 Git 提交。好处是如果某个提交出了问题，可以精确回退到那一步 |

### 1.4 文件术语

| 术语 | 文件名 | 说明 |
|------|--------|------|
| **PROJECT.md** | 项目文件 | 记录项目的愿景、约束和目标，每次会话都会加载 |
| **REQUIREMENTS.md** | 需求文件 | 列出 v1（当前版本）、v2（下一版本）、超出范围的需求 |
| **STATE.md** | 状态文件 | 记录"当前在哪、做了什么决定、遇到了什么阻碍"，跨会话保持记忆 |
| **PLAN.md** | 计划文件 | 带有 XML 结构的任务清单，包含具体要做什么、验证什么、完成标准 |
| **SUMMARY.md** | 总结文件 | 执行完一个 Plan 后的成果总结 |
| **CONTEXT.md** | 上下文文件 | 记录你对某个 Phase 的实现偏好（"我想要卡片布局"而不是"列表布局"） |

---

## 二、先读这 5 个文件

按照这个顺序阅读，每一步都建立在上一步的理解之上。

### 第 1 个：项目 README（5 分钟）

**路径**：`get-shit-done/README.zh-CN.md`

**为什么先读它**：这是 GSD 框架的官方中文说明，包含设计哲学、安装方式、工作流概览和命令列表。读完你就知道 GSD 是什么、为什么存在、怎么用。

**重点关注**：
- "为什么我构建了这个" 一节 -- 理解设计动机
- "工作原理" 一节 -- 6 步工作流的全貌
- "命令" 一节 -- 浏览所有可用命令（不用全记住，知道有这些工具就行）

### 第 2 个：学习项目总览（5 分钟）

**路径**：`docs/ONBOARDING.md`

**为什么第二个读**：这是本项目自己的 Onboarding 文档，包含项目结构、技术栈、关键文件地图和学习路径。读完你就知道这个项目里都有什么。

**重点关注**：
- "架构概览" -- 目录结构图
- "关键文件地图" -- 哪些文件重要，为什么
- "本地设置" -- 怎么在本地跑起来

### 第 3 个：框架架构梳理（10 分钟）

**路径**：`notes/architecture/gsd-framework-overview.md`

**为什么第三个读**：这是你自己（或前人）整理的架构笔记，用中文写的，包含完整生命周期流程图和组件清单。比 README 更结构化、更直观。

**重点关注**：
- "完整生命周期流程图" -- 用图理解整个流程
- "组件清单" -- 每个 Command/Workflow/Agent 是干什么的
- "关键设计模式" -- 编排器模式、Wave 并行等核心设计

### 第 4 个：GSD 使用指南（15 分钟）

**路径**：`notes/gsd/GSD使用指南.md`

**为什么第四个读**：这是一份面向实践的使用指南，比 README 更详细，有完整的场景示例和最佳实践。

**重点关注**：
- "完整工作流" -- 每一步发生了什么
- "常见使用场景" -- 6 个典型场景的命令序列
- "配置说明" -- 模型配置、工作流开关

### 第 5 个：Demo 项目的路线图（5 分钟）

**路径**：`demo-by-gsd/.planning/ROADMAP.md`

**为什么第五个读**：看到 GSD 的实际产出。这是一个真实项目使用 GSD 后生成的规划文件，让你直观感受 GSD 的工作成果。

**重点关注**：
- Phase 是怎么划分的
- 每个 Phase 的 goal 和 success_criteria 是什么
- 文件结构和命名规范

---

## 三、渐进式学习路径（2 周计划）

### 第一周：理解框架是什么

#### Day 1-2：环境搭建 + 全局理解

| 任务 | 时间 | 说明 |
|------|------|------|
| 克隆项目并安装依赖 | 30 分钟 | 按照 `docs/ONBOARDING.md` 的"本地设置"操作 |
| 运行 Demo 项目 | 15 分钟 | `cd demo-by-gsd && pnpm install && pnpm dev`，看看产出 |
| 阅读上面"5 个文件" | 40 分钟 | 按顺序读完 |
| 浏览笔记目录 | 15 分钟 | `ls -R notes/`，看看都记录了什么 |

**检验标准**：你能用自己的话解释 GSD 是什么、解决什么问题、基本工作流是什么。

#### Day 3-4：理解 Agent 体系

| 任务 | 时间 | 说明 |
|------|------|------|
| 阅读 `notes/design/agents-design.md` | 20 分钟 | 12 个 Agent 的职责和协作关系 |
| 阅读 `get-shit-done/agents/gsd-executor.md` | 30 分钟 | 最核心的 Agent，理解"如何执行计划" |
| 浏览其他 Agent 文件的前 30 行 | 20 分钟 | 了解每个 Agent 的 frontmatter 结构 |

**检验标准**：你能说出"研究员、规划师、执行者、验证者"这四类 Agent 的职责边界。

#### Day 5-6：理解执行模型

| 任务 | 时间 | 说明 |
|------|------|------|
| 阅读 `notes/gsd-execution-model.md` | 20 分钟 | Phase 串行、Plan 并行的设计原因 |
| 阅读 `notes/gsd-interruption-guide.md` | 20 分钟 | 中断和恢复机制 |
| 阅读 `notes/gsd/Command与Workflow分层设计.md` | 20 分钟 | Command 和 Workflow 为什么要分开 |

**检验标准**：你能解释为什么 Phase 之间不能并行执行。

#### Day 7：周复习 + 笔记整理

- 回顾本周学到的内容
- 用自己的话写一篇"给完全不懂的人解释 GSD"的笔记
- 存放到 `notes/` 对应目录下

---

### 第二周：深入核心设计

#### Day 8-9：理解 Prompt 工程

| 任务 | 时间 | 说明 |
|------|------|------|
| 阅读 `notes/reusable-designs/XML标签结构化Prompt设计.md` | 20 分钟 | XML 标签如何约束 AI 行为 |
| 阅读 `get-shit-done/agents/gsd-planner.md` | 40 分钟 | 最复杂的 Agent（1309 行），理解 Prompt 如何指导 AI |
| 对比阅读一个 Workflow 文件 | 30 分钟 | `get-shit-done/get-shit-done/workflows/plan-phase.md` |

**检验标准**：你能设计一个简单的 XML 结构化 Prompt。

#### Day 10-11：理解状态管理和上下文工程

| 任务 | 时间 | 说明 |
|------|------|------|
| 阅读 `notes/reusable-designs/gsd-context-lifecycle-management.md` | 20 分钟 | 上下文生命周期管理 |
| 阅读 `notes/reusable-designs/init-variable-injection.md` | 15 分钟 | Init 变量注入模式 |
| 阅读 `get-shit-done/hooks/gsd-context-monitor.js` | 20 分钟 | 实际的上下文监控代码 |

**检验标准**：你能解释"Bridge File 模式"和"渐进式警告"的工作原理。

#### Day 12-13：实践验证

| 任务 | 时间 | 说明 |
|------|------|------|
| 用 GSD 创建一个小项目 | 60 分钟 | `/gsd:new-project`，体验完整流程 |
| 记录使用体验和发现 | 30 分钟 | 写到 `notes/` 中 |

**检验标准**：你成功用 GSD 完成了一个最小项目的初始化和第一阶段执行。

#### Day 14：总结 + 输出

- 整理两周学习笔记
- 列出"3 个最重要的设计模式"
- 列出"3 个可以应用到其他项目的技巧"
- 记录到 `notes/reusable-designs/`

---

## 四、概念详解（通俗版）

### 4.1 GSD 到底是什么？

想象你是一个创业者，有一个好点子但不会写代码。你雇了一个超级聪明的程序员（Claude），但这个程序员有个毛病：对话太长就会忘事。

**GSD 就是给这个程序员配的一个"项目管理系统"**：
- 它帮程序员记住所有重要决策（STATE.md）
- 它把大任务拆成小任务，每个小任务用全新的对话完成（避免忘事）
- 它安排不同的"专家"并行工作（Agent 编排）
- 它在每个关键步骤检查质量（验证器）

### 4.2 为什么需要 Agent（代理）？

就像一个公司不会让一个人同时做产品经理、设计师、程序员和测试工程师一样，GSD 把工作分给 12 个"专职员工"：

```
你（老板）
  │
  ├── 研究员（调查市场、技术栈）
  ├── 规划师（制定执行计划）
  ├── 检查员（检查计划质量）
  ├── 执行者（写代码、提交）
  ├── 验证者（检查目标是否达成）
  └── 调试员（排查问题）
```

每个"员工"在自己的独立对话中工作，互不干扰，不会因为上下文太多而变笨。

### 4.3 什么是"上下文工程"？

传统做法是把所有信息塞给 AI，让它自己理解。但 AI 的"短期记忆"有限，塞太多就会变笨。

**GSD 的做法**：
1. **按需加载** -- 只在需要的时候读取需要的文件
2. **分层存储** -- 重要信息存在 PROJECT.md（总是加载），细节存在各 Phase 目录（按需加载）
3. **新鲜上下文** -- 让子代理在新对话中工作，主对话保持清爽
4. **状态持久化** -- 通过 STATE.md 跨对话保持记忆

### 4.4 为什么要用 XML 标签？

自然语言写指令，AI 可能理解成不同的意思。XML 标签就像"填表"一样，强制 AI 按固定格式理解：

```xml
<!-- 不好的写法：AI 可能自由发挥 -->
帮我写一个登录功能，用 JWT。

<!-- GSD 的写法：AI 按步骤执行 -->
<task type="auto">
  <name>创建登录端点</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>使用 jose 进行 JWT。根据用户表验证凭据。</action>
  <verify>curl -X POST localhost:3000/api/auth/login 返回 200</verify>
  <done>有效凭据返回 cookie，无效返回 401</done>
</task>
```

---

## 五、外部学习资源

### 5.1 必读

| 资源 | 链接 | 说明 |
|------|------|------|
| GSD 官方仓库 | https://github.com/discreteprojects/get-shit-done | 源码和最新文档 |
| GSD 用户指南 | https://github.com/discreteprojects/get-shit-done/blob/main/docs/USER-GUIDE.md | 详细使用说明 |
| Claude Code 官方文档 | https://docs.anthropic.com/en/docs/claude-code | 理解 Claude Code 本身 |

### 5.2 推荐阅读

| 资源 | 说明 |
|------|------|
| [Prompt Engineering 指南](https://www.promptingguide.ai/zh) | 中文 Prompt 工程教程，理解 AI 指令设计的基础 |
| [XML Prompt 研究论文](https://arxiv.org/abs/2402.18664) | 为什么 XML 结构对 AI 指令有效 |
| [Agent 设计模式](https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/) | Andrew Ng 关于 AI Agent 设计模式的介绍 |

### 5.3 社区

| 渠道 | 链接 | 说明 |
|------|------|------|
| GSD Discord | https://discord.gg/gsd | 官方社区，可以提问和交流 |
| GSD Twitter | https://x.com/gsd_foundation | 最新动态 |

---

## 六、常见问题

**Q：我需要先学会 Claude Code 才能学 GSD 吗？**
A：不需要深入掌握，但建议先了解 Claude Code 的基本用法（怎么启动、怎么输入命令、怎么查看结果）。GSD 是 Claude Code 的"增强插件"，理解基础就够了。

**Q：12 个 Agent 都要全部搞懂吗？**
A：不需要。优先理解 4 个核心 Agent：`executor`（执行者）、`planner`（规划师）、`verifier`（验证者）、`project-researcher`（研究员）。其他 Agent 是辅助角色，用到时再看。

**Q：我应该在哪个目录下工作？**
A：
- 学习 GSD 源码：看 `get-shit-done/` 目录
- 实践 GSD 工作流：在 `demo-by-gsd/` 目录操作
- 记录笔记：写到 `notes/` 对应目录

**Q：笔记应该怎么写？**
A：参考项目根目录 `CLAUDE.md` 中的"对话知识实时归档"和"Obsidian 笔记写作规范"章节。核心原则：以分享的角度记录，让完全不懂的人也能看懂。

---

*文档生成时间: 2026-04-04*
*基于 GSD v1.22.4*
