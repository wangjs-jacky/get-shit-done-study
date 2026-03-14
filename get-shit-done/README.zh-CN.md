<div align="center">

# GET SHIT DONE

**一个轻量级且强大的元提示词、上下文工程和规范驱动开发系统，支持 Claude Code、OpenCode、Gemini CLI 和 Codex。**

**解决上下文衰减问题 —— 当 Claude 填满其上下文窗口时发生质量下降的问题。**

[![npm version](https://img.shields.io/npm/v/get-shit-done-cc?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-cc)
[![npm downloads](https://img.shields.io/npm/dm/get-shit-done-cc?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-cc)
[![Tests](https://img.shields.io/github/actions/workflow/status/glittercowboy/get-shit-done/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/glittercowboy/get-shit-done/actions/workflows/test.yml)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/gsd)
[![X (Twitter)](https://img.shields.io/badge/X-@gsd__foundation-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/gsd_foundation)
[![$GSD Token](https://img.shields.io/badge/$GSD-Dexscreener-1C1C1C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzAwRkYwMCIvPjwvc3ZnPg==&logoColor=00FF00)](https://dexscreener.com/solana/dwudwjvan7bzkw9zwlbyv6kspdlvhwzrqy6ebk8xzxkv)
[![GitHub stars](https://img.shields.io/github/stars/glittercowboy/get-shit-done?style=for-the-badge&logo=github&color=181717)](https://github.com/glittercowboy/get-shit-done)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx get-shit-done-cc@latest
```

**支持 Mac、Windows 和 Linux。**

<br>

![GSD Install](assets/terminal.svg)

<br>

*"如果你清楚自己想要什么，这个 WILL 为你构建它。废话不多说。"*

*"我已经尝试了 SpecKit、OpenSpec 和 Taskmaster —— 这个为我产生了最好的结果。"*

*"远比我 Claude Code 中最强大的补充。没有任何过度工程化的东西。确实就是能把事情搞定。"*

<br>

**被 Amazon、Google、Shopify 和 Webflow 的工程师信任。**

[为什么我构建了这个](#为什么我构建了这个) · [工作原理](#工作原理) · [命令](#命令) · [为什么有效](#为什么有效) · [用户指南](docs/USER-GUIDE.md)

</div>

---

## 为什么我构建了这个

我是一名独立开发者。我不写代码 —— Claude Code 来写。

其他的规范驱动开发工具存在；BMAD、Speckit... 但它们似乎都把事情搞得比需要的复杂得多（冲刺仪式、故事点、利益相关者同步、回顾、Jira 工作流程），或者缺乏对你正在构建什么的真正宏观理解。我不是一个50人的软件公司。我不想扮演企业戏剧。我只是个创意人，试图构建既优秀又实用的东西。

所以我构建了 GSD。复杂性在系统中，而不是在你的工作流中。幕后：上下文工程、XML 提示词格式、子代理编排、状态管理。你看到的：几个就能工作的命令。

系统为 Claude 提供完成工作*并且*验证它所需的一切。我信任这个工作流。它只是做得很好。

这就是这个工具的本质。没有企业角色扮演的废话。只是一个使用 Claude Code 一致构建酷炫东西的极其有效的系统。

— **TÂCHES**

---

Vibecoding 名声不佳。你描述你想要什么，AI 生成代码，你得到的是不一致的垃圾，在规模上会崩溃。

GSD 修复了这个问题。它是让 Claude Code 可靠的上下文工程层。描述你的想法，让系统提取需要知道的一切，然后让 Claude Code 开始工作。

---

## 这适合谁

那些想要描述他们想要什么并让它被正确构建的人 —— 而不用假装他们正在运行一个50人的工程组织。

---

## 快速开始

```bash
npx get-shit-done-cc@latest
```

安装程序提示你选择：
1. **运行时** — Claude Code、OpenCode、Gemini、Codex 或全部
2. **位置** — 全局（所有项目）或本地（仅当前项目）

验证命令：
- Claude Code / Gemini: `/gsd:help`
- OpenCode: `/gsd-help`
- Codex: `$gsd-help`

> [!NOTE]
> Codex 安装使用 skills (`skills/gsd-*/SKILL.md`) 而不是自定义提示词。

### 保持更新

GSD 发展迅速。定期更新：

```bash
npx get-shit-done-cc@latest
```

<details>
<summary><strong>非交互式安装（Docker、CI、脚本）</strong></summary>

```bash
# Claude Code
npx get-shit-done-cc --claude --global   # 安装到 ~/.claude/
npx get-shit-done-cc --claude --local    # 安装到 ./.claude/

# OpenCode（开源，免费模型）
npx get-shit-done-cc --opencode --global # 安装到 ~/.config/opencode/

# Gemini CLI
npx get-shit-done-cc --gemini --global   # 安装到 ~/.gemini/

# Codex（优先 skills）
npx get-shit-done-cc --codex --global    # 安装到 ~/.codex/
npx get-shit-done-cc --codex --local     # 安装到 ./.codex/

# 所有运行时
npx get-shit-done-cc --all --global      # 安装到所有目录
```

使用 `--global` (`-g`) 或 `--local` (`-l`) 来跳过位置提示。
使用 `--claude`、`--opencode`、`--gemini`、`--codex` 或 `--all` 来跳过运行时提示。

</details>

<details>
<summary><strong>开发安装</strong></summary>

克隆仓库并在本地运行安装程序：

```bash
git clone https://github.com/glittercowboy/get-shit-done.git
cd get-shit-done
node bin/install.js --claude --local
```

安装到 `./.claude/` 用于在贡献前测试修改。

</details>

### 推荐：跳过权限模式

GSD 设计为无摩擦的自动化。使用以下命令运行 Claude Code：

```bash
claude --dangerously-skip-permissions
```

> [!TIP]
> 这是 GSD 的预期使用方式 —— 停下来批准 `date` 和 `git commit` 50 次违背了目的。

<details>
<summary><strong>替代：细粒度权限</strong></summary>

如果你不想使用该标志，请将以下内容添加到项目的 `.claude/settings.json`：

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
    ]
  }
}
```

</details>

---

## 工作原理

> **已经有代码？** 先运行 `/gsd:map-codebase`。它会启动并行代理分析你的栈、架构、约定和关注点。然后 `/gsd:new-project` 会了解你的代码库 —— 问题聚焦于你添加的内容，规划自动加载你的模式。

### 1. 初始化项目

```
/gsd:new-project
```

一个命令，一个流程。系统：

1. **提问** — 直到你完全理解你的想法（目标、约束、技术偏好、边缘情况）
2. **研究** — 启动并行代理调查领域（可选但推荐）
3. **需求** — 提取什么是 v1、v2 和超出范围的内容
4. **路线图** — 创建映射到需求的阶段

你批准路线图。现在你准备好构建了。

**创建：** `PROJECT.md`、`REQUIREMENTS.md`、`ROADMAP.md`、`STATE.md`、`.planning/research/`

---

### 2. 讨论阶段

```
/gsd:discuss-phase 1
```

**这是你塑造实现的地方。**

你的路线图每个阶段有一两句话。这不足以按照*你*想象的方式构建东西。这一步在任何研究或计划之前捕获你的偏好。

系统分析阶段并根据构建的内容识别灰色区域：

- **视觉功能** → 布局、密度、交互、空状态
- **API/CLI** → 响应格式、标志、错误处理、详细程度
- **内容系统** → 结构、语气、深度、流程
- **组织任务** → 分组标准、命名、重复、例外

对于你选择的每个区域，它会提问直到你满意。输出 —— `CONTEXT.md` —— 直接馈送到下一步：

1. **研究员阅读** — 知道要调查什么模式（"用户想要卡片布局" → 调查卡片组件库）
2. **规划师阅读** — 知道哪些决定已锁定（"无限滚动已决定" → 计划包括滚动处理）

你在这一步深入的程度，系统就越能构建你真正想要的东西。跳过它，你得到合理的默认值。使用它，你得到*你的*愿景。

**创建：** `{phase_num}-CONTEXT.md`

---

### 3. 规划阶段

```
/gsd:plan-phase 1
```

系统：

1. **研究** — 根据 CONTEXT.md 决策调查如何实现这个阶段
2. **计划** — 创建 2-3 个带 XML 结构的原子任务计划
3. **验证** — 对照需求检查计划，循环直到通过

每个计划足够小，可以在新的上下文窗口中执行。没有衰减，没有"我现在会更简洁"。

**创建：** `{phase_num}-RESEARCH.md`、`{phase_num}-{N}-PLAN.md`

---

### 4. 执行阶段

```
/gsd:execute-phase 1
```

系统：

1. **波浪式运行计划** — 可能的话并行，有依赖时顺序
2. **每个计划新鲜上下文** — 200k 令牌纯用于实现，零累积垃圾
3. **每个任务提交** — 每个任务都有自己的原子提交
4. **对照目标验证** — 检查代码库是否交付了阶段承诺

走开，回来查看具有干净 git 历史的已完成工作。

**波浪执行如何工作：**

计划根据依赖关系分组为"波浪"。在每个波浪内，计划并行运行。波浪顺序运行。

```
┌─────────────────────────────────────────────────────────────────────┐
│  阶段执行                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  波浪 1 (并行)        波浪 2 (并行)        波浪 3                  │
│  ┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐ │
│  │ 计划 01 │ │ 计划 02 │ →  │ 计划 03 │ │ 计划 04 │ →  │ 计划 05 │ │
│  │         │ │         │    │         │ │         │    │         │ │
│  │ 用户    │ │ 产品    │    │ 订单    │ │ 购物车  │    │ 结账    │ │
│  │ 模型    │ │ 模型    │    │ API     │ │ API     │    │ UI      │ │
│  └─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘ │
│       │           │              ↑           ↑              ↑       │
│       └───────────┴──────────────┴───────────┘              │       │
│              依赖关系：计划 03 需要计划 01                    │       │
│                          计划 04 需要计划 02                    │       │
│                          计划 05 需要计划 03 + 04              │       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**为什么波浪很重要：**
- 独立计划 → 同一波浪 → 并行运行
- 依赖计划 → 后一波浪 → 等待依赖
- 文件冲突 → 顺序计划或相同计划

这就是为什么"垂直切片"（计划 01：用户功能端到端）比"水平层"（计划 01：所有模型，计划 02：所有 API）更好地并行化。

**创建：** `{phase_num}-{N}-SUMMARY.md`、`{phase_num}-VERIFICATION.md`

---

### 5. 验证工作

```
/gsd:verify-work 1
```

**这是你确认它实际工作的地方。**

自动化验证检查代码是否存在和测试通过。但功能是否按你预期的方式工作？这是你使用它的机会。

系统：

1. **提取可测试的交付物** — 你现在应该能够做什么
2. **引导你逐一完成** — "你能用邮箱登录吗？" 是/否，或描述什么错了
3. **自动诊断故障** — 启动调试代理查找根本原因
4. **创建验证修复计划** — 准备立即重新执行

如果一切通过，你继续前进。如果有什么坏了，你不要手动调试 —— 只需运行 `/gsd:execute-phase` 再次使用它创建的修复计划。

**创建：** `{phase_num}-UAT.md`，如果发现问题则创建修复计划

---

### 6. 重复 → 完成 → 下一个里程碑

```
/gsd:discuss-phase 2
/gsd:plan-phase 2
/gsd:execute-phase 2
/gsd:verify-work 2
...
/gsd:complete-milestone
/gsd:new-milestone
```

循环**讨论 → 规划 → 执行 → 验证**直到里程碑完成。

如果你希望在讨论期间更快地输入，使用 `/gsd:discuss-phase <n> --batch` 一次回答一组小问题，而不是逐一回答。

每个阶段都有你的输入（讨论），适当的研究（规划），干净的执行（执行）和人工验证（验证）。上下文保持新鲜。质量保持高。

当所有阶段完成，`/gsd:complete-milestone` 存档里程碑并标记发布。

然后 `/gsd:new-milestone` 启动下一个版本 —— 与 `new-project` 相同的流程，但针对你现有的代码库。你描述接下来想要构建什么，系统研究领域，你划定范围，它创建新的路线图。每个里程碑都是一个干净的周期：定义 → 构建 → 发布。

---

### 快速模式

```
/gsd:quick
```

**对于不需要完整规划的任务。**

快速模式为你提供 GSD 保证（原子提交、状态跟踪）和更快的路径：

- **相同的代理** — 规划师 + 执行者，相同的质量
- **跳过可选步骤** — 无研究，无计划检查器，无验证器
- **单独跟踪** — 位于 `.planning/quick/`，不是阶段

用于：bug 修复、小功能、配置更改、一次性任务。

```
/gsd:quick
> 你想做什么？"为设置添加暗色模式切换"
```

**创建：** `.planning/quick/001-add-dark-mode-toggle/PLAN.md`、`SUMMARY.md`

---

## 为什么有效

### 上下文工程

如果你提供 Claude Code 所需的上下文，它非常强大。大多数人没有。

GSD 为你处理：

| 文件 | 作用 |
|------|------|
| `PROJECT.md` | 项目愿景，总是加载 |
| `research/` | 生态系统知识（栈、功能、架构、陷阱） |
| `REQUIREMENTS.md` | 划定范围的 v1/v2 需求，带有阶段可追溯性 |
| `ROADMAP.md` | 你要去的地方，已完成的内容 |
| `STATE.md` | 决策、阻塞、位置 — 跨会话的记忆 |
| `PLAN.md` | 带有 XML 结构的原子任务，验证步骤 |
| `SUMMARY.md` | 发生了什么，改变了什么，提交到历史 |
| `todos/` | 捕获想法和任务，供以后工作使用 |

大小限制基于 Claude 质量下降的地方。保持在以下，获得一致的卓越。

### XML 提示词格式

每个计划都是为 Claude 优化的结构化 XML：

```xml
<task type="auto">
  <name>创建登录端点</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    使用 jose 进行 JWT（不是 jsonwebtoken - CommonJS 问题）。
    根据用户表验证凭据。
    成功时返回 httpOnly cookie。
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login 返回 200 + Set-Cookie</verify>
  <done>有效凭据返回 cookie，无效返回 401</done>
</task>
```

精确的指令。无需猜测。内置验证。

### 多代理编排

每个阶段都使用相同的模式：一个薄薄的编排器启动专门的代理，收集结果，并路由到下一步。

| 阶段 | 编排器做什么 | 代理做什么 |
|-------|------------------|-----------|
| 研究 | 协调，展示发现 | 4 个并行研究员调查栈、功能、架构、陷阱 |
| 规划 | 验证，管理迭代 | 规划师创建计划，检查器验证，循环直到通过 |
| 执行 | 分组为波浪，跟踪进度 | 执行者并行实现，每个都有新鲜的 200k 上下文 |
| 验证 | 展示结果，路由下一步 | 验证器对照目标检查代码库，调试器诊断故障 |

编排器从不做繁重工作。它启动代理，等待，集成结果。

**结果：** 你可以运行整个阶段 — 深入研究，创建并验证多个计划，数千行代码在并行执行者中编写，对照目标的自动化验证 —— 而你的主上下文窗口保持在 30-40%。工作在新鲜的子代理上下文中发生。你的会话保持快速和响应。

### 原子 Git 提交

每个任务完成后立即获得自己的提交：

```bash
abc123f docs(08-02): 完成用户注册计划
def456g feat(08-02): 添加邮箱确认流程
hij789k feat(08-02): 实现密码哈希
lmn012o feat(08-02): 创建注册端点
```

> [!NOTE]
> **好处：** Git bisect 找到确切失败的任务。每个任务可独立回滚。未来会话中 Claude 的清晰历史。AI 自动化工作流中的更好可观察性。

每个提交都是精确的、可追溯的和有意义的。

### 模块化设计

- 向当前里程碑添加阶段
- 在阶段之间插入紧急工作
- 完成里程碑并重新开始
- 调整计划而不重建一切

你永远不会被锁定。系统适应。

---

## 命令

### 核心工作流

| 命令 | 作用 |
|---------|--------------|
| `/gsd:new-project [--auto]` | 完整初始化：问题 → 研究 → 需求 → 路线图 |
| `/gsd:discuss-phase [N] [--auto]` | 在规划前捕获实现决策 |
| `/gsd:plan-phase [N] [--auto]` | 阶段的研究 + 规划 + 验证 |
| `/gsd:execute-phase <N>` | 并行波浪执行所有计划，完成后验证 |
| `/gsd:verify-work [N]` | 人工用户验收测试 ¹ |
| `/gsd:audit-milestone` | 验证里程碑达到完成定义 |
| `/gsd:complete-milestone` | 存档里程碑，标记发布 |
| `/gsd:new-milestone [name]` | 启动下一个版本：问题 → 研究 → 需求 → 路线图 |

### 导航

| 命令 | 作用 |
|---------|--------------|
| `/gsd:progress` | 我在哪？下一步是什么？ |
| `/gsd:help` | 显示所有命令和使用指南 |
| `/gsd:update` | 更新 GSD 并显示更改日志预览 |
| `/gsd:join-discord` | 加入 GSD Discord 社区 |

### 棕地开发

| 命令 | 作用 |
|---------|--------------|
| `/gsd:map-codebase` | 在新项目前分析现有代码库 |

### 阶段管理

| 命令 | 作用 |
|---------|--------------|
| `/gsd:add-phase` | 向路线图附加阶段 |
| `/gsd:insert-phase [N]` | 在阶段之间插入紧急工作 |
| `/gsd:remove-phase [N]` | 移除未来阶段，重新编号 |
| `/gsd:list-phase-assumptions [N]` | 在规划前查看 Claude 的预期方法 |
| `/gsd:plan-milestone-gaps` | 创建阶段以关闭审计差距 |

### 会话

| 命令 | 作用 |
|---------|--------------|
| `/gsd:pause-work` | 在阶段中途停止时创建交接 |
| `/gsd:resume-work` | 从最后一个会话恢复 |

### 实用工具

| 命令 | 作用 |
|---------|--------------|
| `/gsd:settings` | 配置模型配置文件和工作流代理 |
| `/gsd:set-profile <profile>` | 切换模型配置文件（质量/平衡/预算） |
| `/gsd:add-todo [desc]` | 捕获想法供以后使用 |
| `/gsd:check-todos` | 列出待办事项 |
| `/gsd:debug [desc]` | 使用持久状态进行系统调试 |
| `/gsd:quick [--full] [--discuss]` | 执行临时任务并具有 GSD 保证（`--full` 添加计划检查和验证，`--discuss` 首先收集上下文） |
| `/gsd:health [--repair]` | 验证 `.planning/` 目录完整性，使用 `--repair` 自动修复 |

<sup>¹ 由 Reddit 用户 OracleGreyBeard 贡献</sup>

---

## 配置

GSD 在 `.planning/config.json` 中存储项目设置。在 `/gsd:new-project` 期间配置或稍后使用 `/gsd:settings` 更新。有关完整的配置模式、工作流切换、git 分支选项和每代理模型分解，请参阅 [用户指南](docs/USER-GUIDE.md#configuration-reference)。

### 核心设置

| 设置 | 选项 | 默认值 | 控制什么 |
|---------|---------|---------|------------------|
| `mode` | `yolo`, `interactive` | `interactive` | 自动批准 vs 每步确认 |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | 阶段粒度 — 范围如何细分为（阶段 × 计划） |

### 模型配置文件

控制每个代理使用哪个 Claude 模型。平衡质量与令牌消耗。

| 配置文件 | 规划 | 执行 | 验证 |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced`（默认） | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |

切换配置文件：
```
/gsd:set-profile budget
```

或通过 `/gsd:settings` 配置。

### 工作流代理

这些在规划/执行期间启动额外的代理。它们提高质量但增加令牌和时间。

| 设置 | 默认值 | 作用 |
|---------|---------|--------------|
| `workflow.research` | `true` | 在规划每个阶段前研究领域 |
| `workflow.plan_check` | `true` | 在执行前验证计划达到阶段目标 |
| `workflow.verifier` | `true` | 执行后确认必须交付的内容 |
| `workflow.auto_advance` | `false` | 自动链接讨论 → 规划 → 执行而不停止 |

使用 `/gsd:settings` 切换这些，或覆盖每次调用：
- `/gsd:plan-phase --skip-research`
- `/gsd:plan-phase --skip-verify`

### 执行

| 设置 | 默认值 | 控制什么 |
|---------|---------|------------------|
| `parallelization.enabled` | `true` | 同时运行独立计划 |
| `planning.commit_docs` | `true` | 在 git 中跟踪 `.planning/` |

### Git 分支

控制 GSD 在执行期间如何处理分支。

| 设置 | 选项 | 默认值 | 作用 |
|---------|---------|---------|--------------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | 分支创建策略 |
| `git.phase_branch_template` | 字符串 | `gsd/phase-{phase}-{slug}` | 阶段分支模板 |
| `git.milestone_branch_template` | 字符串 | `gsd/{milestone}-{slug}` | 里程碑分支模板 |

**策略：**
- **`none`** — 提交到当前分支（默认 GSD 行为）
- **`phase`** — 为每个阶段创建分支，阶段完成时合并
- **`milestone`** — 为整个里程碑创建一个分支，完成时合并

在里程碑完成时，GSD 提供 squash 合并（推荐）或带历史的合并。

---

## 安全

### 保护敏感文件

GSD 的代码库映射和分析命令读取文件以了解你的项目。**包含机密的文件**通过将它们添加到 Claude Code 的拒绝列表来保护：

1. 打开 Claude Code 设置（`.claude/settings.json` 或全局）
2. 将敏感文件模式添加到拒绝列表：

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

这会完全阻止 Claude 读取这些文件，无论你运行什么命令。

> [!IMPORTANT]
> GSD 包含防止提交机密的内置保护，但纵深防御是最佳实践。将敏感文件的读取访问权限拒绝作为第一道防线。

---

## 故障排除

**安装后命令未找到？**
- 重启你的运行时以重新加载命令/技能
- 验证文件存在于 `~/.claude/commands/gsd/`（全局）或 `./.claude/commands/gsd/`（本地）
- 对于 Codex，验证技能存在于 `~/.codex/skills/gsd-*/SKILL.md`（全局）或 `./.codex/skills/gsd-*/SKILL.md`（本地）

**命令未按预期工作？**
- 运行 `/gsd:help` 验证安装
- 重新运行 `npx get-shit-done-cc` 重新安装

**更新到最新版本？**
```bash
npx get-shit-done-cc@latest
```

**使用 Docker 或容器化环境？**

如果文件读取因波浪路径（`~/.claude/...`）而失败，请在安装前设置 `CLAUDE_CONFIG_DIR`：
```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx get-shit-done-cc --global
```
这确保使用绝对路径而不是在容器中可能无法正确展开的 `~`。

### 卸载

要完全移除 GSD：

```bash
# 全局安装
npx get-shit-done-cc --claude --global --uninstall
npx get-shit-done-cc --opencode --global --uninstall
npx get-shit-done-cc --codex --global --uninstall

# 本地安装（当前项目）
npx get-shit-done-cc --claude --local --uninstall
npx get-shit-done-cc --opencode --local --uninstall
npx get-shit-done-cc --codex --local --uninstall
```

这会移除所有 GSD 命令、代理、钩子和设置，同时保留你的其他配置。

---

## 社区端口

OpenCode、Gemini CLI 和 Codex 现在通过 `npx get-shit-done-cc` 原生支持。

这些社区端口开创了多运行时支持：

| 项目 | 平台 | 描述 |
|---------|----------|-------------|
| [gsd-opencode](https://github.com/rokicool/gsd-opencode) | OpenCode | 原始 OpenCode 适配 |
| gsd-gemini（已归档） | Gemini CLI | uberfuzzy 原始 Gemini 适配 |

---

## 星标历史

<a href="https://star-history.com/#glittercowboy/get-shit-done&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=glittercowboy/get-shit-done&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=glittercowboy/get-shit-done&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=glittercowboy/get-shit-done&type=Date" />
 </picture>
</a>

---

## 许可证

MIT 许可证。详细信息请参阅 [LICENSE](LICENSE)。

---

<div align="center">

**Claude Code 很强大。GSD 让它变得可靠。**

</div>