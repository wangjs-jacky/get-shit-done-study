# GSD 用户指南

工作流程、故障排除和配置的详细参考。快速入门设置请参阅 [README](../README.md)。

---

## 目录

- [工作流程图](#工作流程图)
- [命令参考](#命令参考)
- [配置参考](#配置参考)
- [使用示例](#使用示例)
- [故障排除](#故障排除)
- [恢复快速参考](#恢复快速参考)

---

## 工作流程图

### 完整项目生命周期

```
  ┌──────────────────────────────────────────────────┐
  │                   新项目                        │
  │  /gsd:new-project                                │
  │  问题 -> 研究 -> 需求 -> 路线图                   │
  └─────────────────────────┬────────────────────────┘
                            │
             ┌──────────────▼─────────────┐
             │      每个阶段执行：       │
             │                            │
             │  ┌────────────────────┐    │
             │  │ /gsd:discuss-phase │    │  <- 锁定偏好设置
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:plan-phase    │    │  <- 研究 + 计划 + 验证
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:execute-phase │    │  <- 并行执行
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd:verify-work   │    │  <- 手动 UAT
             │  └──────────┬─────────┘    │
             │             │              │
             │     进入下一阶段?────────────┘
             │             │ No
             └─────────────┼──────────────┘
                            │
            ┌───────────────▼──────────────┐
            │  /gsd:audit-milestone        │
            │  /gsd:complete-milestone     │
            └───────────────┬──────────────┘
                            │
                   另一个里程碑?
                       │          │
                      Yes         No -> 完成！
                       │
               ┌───────▼──────────────┐
               │  /gsd:new-milestone  │
               └──────────────────────┘
```

### 规划代理协调

```
  /gsd:plan-phase N
         │
         ├── 阶段研究员 (x4 并行)
         │     ├── 技术栈研究员
         │     ├── 功能研究员
         │     ├── 架构研究员
         │     └── 风险研究员
         │           │
         │     ┌──────▼──────┐
         │     │ RESEARCH.md │
         │     └──────┬──────┘
         │            │
         │     ┌──────▼──────┐
         │     │   规划师    │  <- 读取 PROJECT.md, REQUIREMENTS.md,
         │     │             │     CONTEXT.md, RESEARCH.md
         │     └──────┬──────┘
         │            │
         │     ┌──────▼───────────┐     ┌────────┐
         │     │   计划检查器    │────>│ 通过？  │
         │     └──────────────────┘     └───┬────┘
         │                                  │
         │                             Yes  │  No
         │                              │   │   │
         │                              │   └───┘  (循环，最多 3 次)
         │                              │
         │                        ┌─────▼──────┐
         │                        │ PLAN 文件  │
         │                        └────────────┘
         └── 完成
```

### 验证架构（奈奎斯特层）

在阶段规划研究期间，GSD 现在在编写任何代码之前将自动化测试覆盖率映射到每个阶段需求。这确保当 Claude 执行器提交任务时，已经存在反馈机制可以在几秒钟内验证它。

研究员检测您现有的测试基础设施，将每个需求映射到特定的测试命令，并识别任何必须在实施开始前创建的测试脚手架（第 0 波任务）。

计划检查器将其作为第 8 个验证维度强制执行：缺乏自动化验证命令的任务的计划将不会被批准。

**输出：** `{phase}-VALIDATION.md` -- 该阶段的反馈契约。

**禁用：** 在测试基础设施不是焦点的快速原型阶段，在 `/gsd:settings` 中设置 `workflow.nyquist_validation: false`。

### 追溯验证 (`/gsd:validate-phase`)

对于在奈奎斯特验证存在之前执行的阶段，或者只有传统测试套件现有代码库，追溯审核并填补覆盖率缺口：

```
  /gsd:validate-phase N
         |
         +-- 检测状态 (VALIDATION.md 存在？SUMMARY.md 存在？)
         |
         +-- 发现：扫描实现，映射需求到测试
         |
         +-- 分析缺口：哪些需求缺乏自动化验证？
         |
         +-- 提交缺口计划供批准
         |
         +-- 生成审核器：生成测试、运行、调试（最多 3 次尝试）
         |
         +-- 更新 VALIDATION.md
               |
               +-- 合规 -> 所有需求都有自动化检查
               +-- 部分合规 -> 一些缺口升级为仅手动检查
```

审核器永远不会修改实现代码 — 只修改测试文件和 VALIDATION.md。如果测试揭示实现错误，它会被标记为需要您处理的升级。

**何时使用：** 在执行在启用奈奎斯特之前计划的任务之后，或者在 `/gsd:audit-milestone` 发现奈奎斯特合规缺口之后。

### 执行波协调

```
  /gsd:execute-phase N
         │
         ├── 分析计划依赖关系
         │
         ├── 第 1 波（独立计划）：
         │     ├── 执行器 A（全新 200K 上下文）-> 提交
         │     └── 执行器 B（全新 200K 上下文）-> 提交
         │
         ├── 第 2 波（依赖第 1 波）：
         │     └── 执行器 C（全新 200K 上下文）-> 提交
         │
         └── 验证器
               └── 对照阶段目标检查代码库
                     │
                     ├── 通过 -> VERIFICATION.md（成功）
                     └── 失败 -> 记录问题供 /gsd:verify-work 处理
```

### 棕地工作流（现有代码库）

```
  /gsd:map-codebase
         │
         ├── 技术栈映射器     -> codebase/STACK.md
         ├── 架构映射器      -> codebase/ARCHITECTURE.md
         ├── 约定映射器 -> codebase/CONVENTIONS.md
         └── 关切映射器   -> codebase/CONCERNS.md
                │
        ┌───────▼──────────┐
        │ /gsd:new-project │  <- 问题集中在您要添加的内容上
        └──────────────────┘
```

---

## 命令参考

### 核心工作流

| 命令 | 用途 | 使用时机 |
|------|------|----------|
| `/gsd:new-project` | 完整项目初始化：问题、研究、需求、路线图 | 新项目开始 |
| `/gsd:new-project --auto @idea.md` | 从文档自动初始化 | 已准备好 PRD 或想法文档 |
| `/gsd:discuss-phase [N]` | 捕获实施决策 | 规划之前，确定如何构建 |
| `/gsd:plan-phase [N]` | 研究 + 计划 + 验证 | 执行阶段之前 |
| `/gsd:execute-phase <N>` | 并行波次执行所有计划 | 规划完成后 |
| `/gsd:verify-work [N]` | 手动 UAT 与自动诊断 | 执行完成后 |
| `/gsd:audit-milestone` | 验证里程碑达到其完成标准 | 完成里程碑之前 |
| `/gsd:complete-milestone` | 存档里程碑，标记发布 | 所有阶段验证通过 |
| `/gsd:new-milestone [name]` | 开始下一个版本周期 | 完成里程碑后 |

### 导航

| 命令 | 用途 | 使用时机 |
|------|------|----------|
| `/gsd:progress` | 显示状态和下一步 | 任何时候 -- "我在哪里？" |
| `/gsd:resume-work` | 从上次会话恢复完整上下文 | 开始新会话 |
| `/gsd:pause-work` | 保存上下文交接 | 在阶段中途停止 |
| `/gsd:help` | 显示所有命令 | 快速参考 |
| `/gsd:update` | 更新 GSD 并显示变更日志预览 | 检查新版本 |
| `/gsd:join-discord` | 打开 Discord 社区邀请 | 问题或社区交流 |

### 阶段管理

| 命令 | 用途 | 使用时机 |
|------|------|----------|
| `/gsd:add-phase` | 向路线图追加新阶段 | 初始规划后范围扩大 |
| `/gsd:insert-phase [N]` | 插入紧急工作（小数编号） | 里程碑中途紧急修复 |
| `/gsd:remove-phase [N]` | 删除未来阶段并重新编号 | 缩减功能范围 |
| `/gsd:list-phase-assumptions [N]` | 预览 Claude 的预期方法 | 规划之前，验证方向 |
| `/gsd:plan-milestone-gaps` | 为审核缺口创建阶段 | 审核发现缺失项后 |
| `/gsd:research-phase [N]` | 仅进行深度生态系统研究 | 复杂或不熟悉的领域 |

### 棕地 & 工具

| 命令 | 用途 | 使用时机 |
|------|------|----------|
| `/gsd:map-codebase` | 分析现有代码库 | 在现有代码上运行 `/gsd:new-project` 之前 |
| `/gsd:quick` | 带有 GSD 保证的临时任务 | 错误修复、小功能、配置更改 |
| `/gsd:debug [desc]` | 具有持久状态的系统调试 | 当某事物出故障时 |
| `/gsd:add-todo [desc]` | 捕获稍后的想法 | 在会话期间想到某事 |
| `/gsd:check-todos` | 列出待办事项 | 审查捕获的想法 |
| `/gsd:settings` | 配置工作流开关和模型配置文件 | 更改模型，切换代理 |
| `/gsd:set-profile <profile>` | 快速配置文件切换 | 更改成本/质量权衡 |
| `/gsd:reapply-patches` | 更新后恢复本地修改 | 如果您有本地编辑，在 `/gsd:update` 后 |

---

## 配置参考

GSD 在 `.planning/config.json` 中存储项目设置。在 `/gsd:new-project` 期间配置或稍后使用 `/gsd:settings` 更新。

### 完整的 config.json 架构

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true
  },
  "git": {
    "branching_strategy": "none",
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}"
  }
}
```

### 核心设置

| 设置 | 选项 | 默认值 | 控制内容 |
|------|------|--------|----------|
| `mode` | `interactive`, `yolo` | `interactive` | `yolo` 自动批准决策；`interactive` 在每个步骤确认 |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | 阶段粒度：范围如何细分（3-5、5-8 或 8-12 个阶段） |
| `model_profile` | `quality`, `balanced`, `budget` | `balanced` | 每个代理的模型层级（见下表） |

### 规划设置

| 设置 | 选项 | 默认值 | 控制内容 |
|------|------|--------|----------|
| `planning.commit_docs` | `true`, `false` | `true` | `.planning/` 文件是否提交到 git |
| `planning.search_gitignored` | `true`, `false` | `false` | 在广泛搜索中添加 `--no-ignore` 以包含 `.planning/` |

> **注意：** 如果 `.planning/` 在 `.gitignore` 中，则无论配置值如何，`commit_docs` 都自动为 `false`。

### 工作流开关

| 设置 | 选项 | 默认值 | 控制内容 |
|------|------|--------|----------|
| `workflow.research` | `true`, `false` | `true` | 规划前的领域调查 |
| `workflow.plan_check` | `true`, `false` | `true` | 计划验证循环（最多 3 次迭代） |
| `workflow.verifier` | `true`, `false` | `true` | 对照阶段目标的后执行验证 |
| `workflow.nyquist_validation` | `true`, `false` | `true` | 规划阶段的验证架构研究；计划检查的第 8 个维度 |

在熟悉领域或节省 token 时禁用这些。

### Git 分支

| 设置 | 选项 | 默认值 | 控制内容 |
|------|------|--------|----------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | 创建分支的时间和方式 |
| `git.phase_branch_template` | 模板字符串 | `gsd/phase-{phase}-{slug}` | 阶段策略的分支名称 |
| `git.milestone_branch_template` | 模板字符串 | `gsd/{milestone}-{slug}` | 里程碑策略的分支名称 |

**分支策略说明：**

| 策略 | 创建分支 | 范围 | 最适用于 |
|------|----------|------|----------|
| `none` | 从不 | N/A | 单人开发、简单项目 |
| `phase` | 每个 `execute-phase` 时 | 每个分支一个阶段 | 每个阶段的代码审查、细粒度回滚 |
| `milestone` | 第一个 `execute-phase` 时 | 所有阶段共享一个分支 | 发布分支、每版本的 PR |

**模板变量：** `{phase}` = 前导零填充的数字（如 "03"），`{slug}` = 小写连字符名称，`{milestone}` = 版本（如 "v1.0"）。

### 模型配置文件（按代理细分）

| 代理 | `quality` | `balanced` | `budget` |
|------|-----------|------------|----------|
| gsd-planner | Opus | Opus | Sonnet |
| gsd-roadmapper | Opus | Sonnet | Sonnet |
| gsd-executor | Opus | Sonnet | Sonnet |
| gsd-phase-researcher | Opus | Sonnet | Haiku |
| gsd-project-researcher | Opus | Sonnet | Haiku |
| gsd-research-synthesizer | Sonnet | Sonnet | Haiku |
| gsd-debugger | Opus | Sonnet | Sonnet |
| gsd-codebase-mapper | Sonnet | Haiku | Haiku |
| gsd-verifier | Sonnet | Sonnet | Haiku |
| gsd-plan-checker | Sonnet | Sonnet | Haiku |
| gsd-integration-checker | Sonnet | Sonnet | Haiku |

**配置文件理念：**
- **quality** -- 所有决策代理使用 Opus，只读验证使用 Sonnet。在配额可用且工作关键时使用。
- **balanced** -- 仅规划使用 Opus（架构决策发生的地方），其他使用 Sonnet。这是有充分理由的默认设置。
- **budget** -- 编码使用 Sonnet，研究和验证使用 Haiku。用于高工作量或不重要阶段。

---

## 使用示例

### 新项目（完整周期）

```bash
claude --dangerously-skip-permissions
/gsd:new-project            # 回答问题、配置、批准路线图
/clear
/gsd:discuss-phase 1        # 锁定您的偏好设置
/gsd:plan-phase 1           # 研究 + 计划 + 验证
/gsd:execute-phase 1        # 并行执行
/gsd:verify-work 1          # 手动 UAT
/clear
/gsd:discuss-phase 2        # 对每个阶段重复
...
/gsd:audit-milestone        # 检查一切已发货
/gsd:complete-milestone     # 存档、标记、完成
```

### 从现有文档创建新项目

```bash
/gsd:new-project --auto @prd.md   # 从您的文档自动运行研究/需求/路线图
/clear
/gsd:discuss-phase 1               # 从这里正常流程
```

### 现有代码库

```bash
/gsd:map-codebase           # 分析现有内容（并行代理）
/gsd:new-project            # 问题集中在您要添加的内容上
#（从这里开始的正常阶段工作流）
```

### 快速错误修复

```bash
/gsd:quick
> "修复在移动 Safari 上无响应的登录按钮"
```

### 中断后恢复

```bash
/gsd:progress               # 查看您离开的地方和下一步
# 或
/gsd:resume-work            # 从上次会话完全恢复上下文
```

### 准备发布

```bash
/gsd:audit-milestone        # 检查需求覆盖率，检测存根
/gsd:plan-milestone-gaps    # 如果审核发现缺口，创建阶段来关闭它们
/gsd:complete-milestone     # 存档、标记、完成
```

### 速度与质量预设

| 场景 | 模式 | 粒度 | 配置文件 | 研究 | 计划检查 | 验证器 |
|------|------|------|----------|------|----------|--------|
| 原型制作 | `yolo` | `coarse` | `budget` | 关闭 | 关闭 | 关闭 |
| 正常开发 | `interactive` | `standard` | `balanced` | 开启 | 开启 | 开启 |
| 生产环境 | `interactive` | `fine` | `quality` | 开启 | 开启 | 开启 |

### 里程碑中途范围更改

```bash
/gsd:add-phase              # 向路线图追加新阶段
# 或
/gsd:insert-phase 3         # 在阶段 3 和 4 之间插入紧急工作
# 或
/gsd:remove-phase 7         # 缩减阶段 7 并重新编号
```

---

## 故障排除

### "项目已初始化"

您运行了 `/gsd:new-project` 但 `.planning/PROJECT.md` 已存在。这是一个安全检查。如果想要重新开始，请先删除 `.planning/` 目录。

### 长会话期间的上下文降级

在主要命令之间清除上下文窗口：在 Claude Code 中使用 `/clear`。GSD 围绕新鲜上下文设计 —— 每个子代理都获得干净的 200K 窗口。如果主会话质量下降，清除并使用 `/gsd:resume-work` 或 `/gsd:progress` 恢复状态。

### 计划似乎错误或不一致

在规划之前运行 `/gsd:discuss-phase [N]`。大多数计划质量问题来自 Claude 的假设，这些假设是 `CONTEXT.md` 本可以防止的。您也可以运行 `/gsd:list-phase-assumptions [N]` 来在承诺计划之前查看 Claude 的意图。

### 执行失败或生成存根

检查计划是否过于雄心勃勃。计划应该最多有 2-3 个任务。如果任务太大，它们将超出单个上下文窗口能够可靠生成的范围。用较小范围重新规划。

### 迷失方向

运行 `/gsd:progress`。它读取所有状态文件并准确告诉您您在哪里以及下一步该做什么。

### 执行后需要更改某些内容

不要重新运行 `/gsd:execute-phase`。使用 `/gsd:quick` 进行针对性修复，或使用 `/gsd:verify-work` 通过 UAT 系统识别和修复问题。

### 模型成本过高

切换到预算配置文件：`/gsd:set-profile budget`。如果领域对您（或 Claude）熟悉，通过 `/gsd:settings` 禁用研究和计划检查代理。

### 在敏感/私有项目上工作

在 `/gsd:new-project` 期间设置 `commit_docs: false` 或通过 `/gsd:settings` 设置。将 `.planning/` 添加到您的 `.gitignore`。规划工件保持本地且不接触 git。

### GSD 更新覆盖了我的本地更改

从 v1.17 开始，安装程序将本地修改的文件备份到 `gsd-local-patches/`。运行 `/gsd:reapply-patches` 将您的更改合并回来。

### 子代理似乎失败但工作已完成

已知的 Claude Code 分类错误解决方法。GSD 的编排器（execute-phase、quick）在报告失败前检查实际输出。如果您看到失败消息但已提交检查 `git log` —— 工作可能已成功。

---

## 恢复快速参考

| 问题 | 解决方案 |
|------|----------|
| 丢失上下文 / 新会话 | `/gsd:resume-work` 或 `/gsd:progress` |
| 阶段出错 | `git revert` 阶段提交，然后重新规划 |
| 需要更改范围 | `/gsd:add-phase`、`/gsd:insert-phase` 或 `/gsd:remove-phase` |
| 里程碑审核发现缺口 | `/gsd:plan-milestone-gaps` |
| 某事物出故障 | `/gsd:debug "description"` |
| 快速针对性修复 | `/gsd:quick` |
| 计划与您的愿景不符 | `/gsd:discuss-phase [N]` 然后重新规划 |
| 成本过高 | `/gsd:set-profile budget` 和 `/gsd:settings` 关闭代理 |
| 更新覆盖本地更改 | `/gsd:reapply-patches` |

---

## 项目文件结构

作为参考，这是 GSD 在您的项目中创建的内容：

```
.planning/
  PROJECT.md              # 项目愿景和上下文（始终加载）
  REQUIREMENTS.md         # 带 ID 的范围 v1/v2 需求
  ROADMAP.md              # 阶段分解与状态跟踪
  STATE.md                # 决策、阻塞器、会话记忆
  config.json             # 工作流配置
  MILESTONES.md           # 已完成里程碑存档
  research/               # 来自 /gsd:new-project 的领域研究
  todos/
    pending/              # 等待工作的捕获想法
    done/                 # 已完成的待办事项
  debug/                  # 活跃的调试会话
    resolved/             # 已存档的调试会话
  codebase/               # 棕地代码库映射（来自 /gsd:map-codebase）
  phases/
    XX-phase-name/
      XX-YY-PLAN.md       # 原子执行计划
      XX-YY-SUMMARY.md    # 执行结果和决策
      CONTEXT.md          # 您的实施偏好
      RESEARCH.md         # 生态系统研究结果
      VERIFICATION.md     # 后执行验证结果
```