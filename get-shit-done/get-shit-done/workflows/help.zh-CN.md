<purpose>
显示完整的GSD命令参考。仅输出参考内容。不要添加项目特定的分析、git状态、下一步建议或任何超出参考范围的说明。
</purpose>

<reference>
# GSD 命令参考

**GSD**（Get Shit Done）创建层次化项目计划，专为使用Claude Code的独立智能体开发优化。

## 快速开始

1. `/gsd:new-project` - 初始化项目（包含研究、需求、路线图）
2. `/gsd:plan-phase 1` - 为第一个阶段创建详细计划
3. `/gsd:execute-phase 1` - 执行该阶段的计划

## 保持更新

GSD 发展迅速。定期更新：

```bash
npx get-shit-done-cc@latest
```

## 核心工作流

```
/gsd:new-project → /gsd:plan-phase → /gsd:execute-phase → 重复
```

### 项目初始化

**`/gsd:new-project`**
通过统一流程初始化新项目。

一个命令带你从想法到准备规划阶段：
- 深入提问以了解你要构建什么
- 可选的领域研究（生成4个并行研究器代理）
- 需求定义和v1/v2/范围外的范围划分
- 路线图创建和阶段拆分及成功标准

创建所有 `.planning/` 工件：
- `PROJECT.md` — 愿景和需求
- `config.json` — 工作流模式（交互式/YOLO）
- `research/` — 领域研究（如果选择）
- `REQUIREMENTS.md` — 带REQ-ID的范围需求
- `ROADMAP.md` — 需求映射到阶段
- `STATE.md` — 项目记忆

用法：`/gsd:new-project`

**`/gsd:map-codebase`**
映射现有代码库用于棕地项目。

- 使用并行Explore代理分析代码库
- 创建 `.planning/codebase/` 包含7个专注的文档
- 涵盖堆栈、架构、结构、约定、测试、集成、关注点
- 在现有代码库上使用 `/gsd:new-project` 之前使用

用法：`/gsd:map-codebase`

### 阶段规划

**`/gsd:discuss-phase <number>`**
帮助在规划之前清晰地阐述你对某个阶段的愿景。

- 捕获你想象这个阶段如何工作的想法
- 创建CONTEXT.md，包含你的愿景、要点和边界
- 当你对某些东西的外观/感觉有想法时使用
- 可选的 `--batch` 一次询问2-5个相关问题

用法：`/gsd:discuss-phase 2`
用法：`/gsd:discuss-phase 2 --batch`
用法：`/gsd:discuss-phase 2 --batch=3`

**`/gsd:research-phase <number>`**
针对利基/复杂领域的全面生态系统研究。

- 发现标准堆栈、架构模式、陷阱
- 创建包含"专家如何构建此知识"的RESEARCH.md
- 用于3D、游戏、音频、着色器、ML等专业化领域
- 超越"哪个库"到生态系统知识

用法：`/gsd:research-phase 3`

**`/gsd:list-phase-assumptions <number>`**
在Claude开始工作之前查看它的计划方法。

- 显示Claude对某个阶段的预期方法
- 如果Claude误解了你的愿景，你可以纠正
- 不创建文件 - 仅输出对话内容

用法：`/gsd:list-phase-assumptions 3`

**`/gsd:plan-phase <number>`**
为特定阶段创建详细执行计划。

- 生成 `.planning/phases/XX-phase-name/XX-YY-PLAN.md`
- 将阶段分解为具体的、可执行的任务
- 包含验证标准和成功度量
- 每个阶段支持多个计划（XX-01、XX-02等）

用法：`/gsd:plan-phase 1`
结果：创建 `.planning/phases/01-foundation/01-01-PLAN.md`

**PRD 快速路径：** 传入 `--prd path/to/requirements.md` 直接跳过discuss-phase。你的PRD成为CONTEXT.md中的锁定决策。当你已经有了清晰的验收标准时很有用。

### 执行

**`/gsd:execute-phase <phase-number>`**
执行阶段中的所有计划。

- 按波次分组，执行波次（来自frontmatter），在波次内并行执行
- 每个波次内的计划通过Task工具并行运行
- 所有计划完成后验证阶段目标
- 更新 REQUIREMENTS.md、ROADMAP.md、STATE.md

用法：`/gsd:execute-phase 5`

### 快速模式

**`/gsd:quick`**
使用GSD保证执行小型、临时任务，但跳过可选的代理。

快速模式使用相同的系统，但路径更短：
- 生成规划器 + 执行器（跳过研究器、检查器、验证器）
- 快速任务存放在 `.planning/quick/` 中，与规划阶段分离
- 更新STATE.md跟踪（非ROADMAP.md）

当你确切知道要做什么并且任务足够小，不需要研究或验证时使用。

用法：`/gsd:quick`
结果：创建 `.planning/quick/NNN-slug/PLAN.md`、`.planning/quick/NNN-slug/SUMMARY.md`

### 路线图管理

**`/gsd:add-phase <description>`**
向当前里程碑末尾添加新阶段。

- 附加到ROADMAP.md
- 使用下一个顺序编号
- 更新阶段目录结构

用法：`/gsd:add-phase "Add admin dashboard"`

**`/gsd:insert-phase <after> <description>`**
在现有阶段之间插入紧急工作作为十进制阶段。

- 创建中间阶段（例如，7和8之间的7.1）
- 用于在里程碑中途发现的需要进行的工作
- 保持阶段顺序

用法：`/gsd:insert-phase 7 "Fix critical auth bug"`
结果：创建阶段7.1

**`/gsd:remove-phase <number>`**
删除未来阶段并重新编号后续阶段。

- 删除阶段目录和所有引用
- 重新编号所有后续阶段以填补空隙
- 仅适用于未来（未开始）阶段
- Git提交保留历史记录

用法：`/gsd:remove-phase 17`
结果：删除阶段17，阶段18-20变为17-19

### 里程碑管理

**`/gsd:new-milestone <name>`**
通过统一流程开始新里程碑。

- 深入提问以了解你接下来要构建什么
- 可选的领域研究（生成4个并行研究器代理）
- 需求定义和范围划分
- 路线图创建和阶段拆分

模拟 `/gsd:new-project` 流程用于棕地项目（现有PROJECT.md）。

用法：`/gsd:new-milestone "v2.0 Features"`

**`/gsd:complete-milestone <version>`**
存档已完成的里程碑并为下一版本做准备。

- 创建带有统计信息的MILESTONES.md条目
- 将完整详细信息存档到milestones/目录
- 为版本创建git标签
- 为下一个版本准备工作区

用法：`/gsd:complete-milestone 1.0.0`

### 进度跟踪

**`/gsd:progress`**
检查项目状态并智能路由到下一个动作。

- 显示可视化进度条和完成百分比
- 从SUMMARY文件总结最近工作
- 显示当前位置和下一步
- 列出关键决策和未解决问题
- 提供执行下一个计划或创建缺失计划的选项
- 检测100%里程碑完成

用法：`/gsd:progress`

### 会话管理

**`/gsd:resume-work`**
从上一个会话恢复工作，完整恢复上下文。

- 读取STATE.md获取项目上下文
- 显示当前位置和最近进度
- 基于项目状态提供下一个动作选项

用法：`/gsd:resume-work`

**`/gsd:pause-work`**
在阶段中途暂停工作时创建上下文交接。

- 创建包含当前状态的.continue-here文件
- 更新STATE.md的会话连续性部分
- 捕捉正在进行的工作上下文

用法：`/gsd:pause-work`

### 调试

**`/gsd:debug [issue description]`**
系统化调试，在上下文重置间保持持久状态。

- 通过自适应提问收集症状
- 创建 `.planning/debug/[slug].md` 来跟踪调查
- 使用科学方法调查（证据→假设→测试）
- 在 `/clear` 后存活 — 运行 `/gsd:debug` 无参数以恢复
- 将已解决的问题存档到 `.planning/debug/resolved/`

用法：`/gsd:debug "login button doesn't work"`
用法：`/gsd:debug`（恢复活动会话）

### 待办事项管理

**`/gsd:add-todo [description]`**
从当前对话中将想法或任务捕获为待办事项。

- 从对话中提取上下文（或使用提供的描述）
- 在 `.planning/todos/pending/` 创建结构化的待办事项文件
- 从文件路径推断区域用于分组
- 创建前检查重复项
- 更新STATE.md的待办事项计数

用法：`/gsd:add-todo`（从对话中推断）
用法：`/gsd:add-todo Add auth token refresh`

**`/gsd:check-todos [area]`**
列出待办事项并选择一个进行工作。

- 显示所有待办事项，包含标题、区域、年龄
- 可选的区域过滤（如 `/gsd:check-todos api`）
- 为选中的待办事项加载完整上下文
- 路由到适当的动作（现在工作、添加到阶段、头脑风暴）
- 将待办事项移动到done/当工作开始时

用法：`/gsd:check-todos`
用法：`/gsd:check-todos api`

### 用户验收测试

**`/gsd:verify-work [phase]`**
通过对话式UAT验证构建的功能。

- 从SUMMARY.md文件中提取可测试的交付物
- 一次呈现一个测试（是/否响应）
- 自动诊断失败并创建修复计划
- 如果发现问题，准备重新执行

用法：`/gsd:verify-work 3`

### 里程碑审计

**`/gsd:audit-milestone [version]`**
根据原始意图审计里程碑完成情况。

- 读取所有阶段VERIFICATION.md文件
- 检查需求覆盖率
- 为跨阶段接线生成集成检查器
- 创建带有差距和技术债务的MILESTONE-AUDIT.md

用法：`/gsd:audit-milestone`

**`/gsd:plan-milestone-gaps`**
创建阶段来关闭审计发现的差距。

- 读取MILESTONE-AUDIT.md并将差距分组到阶段
- 按需求优先级（必须/应该/很好）进行优先级排序
- 将差距闭合阶段添加到ROADMAP.md
- 为 `/gsd:plan-phase` 在新阶段上准备

用法：`/gsd:plan-milestone-gaps`

### 配置

**`/gsd:settings`**
交互式配置工作流切换和模型配置文件。

- 切换研究器、计划检查器、验证器代理
- 选择模型配置文件（quality/balanced/budget）
- 更新 `.planning/config.json`

用法：`/gsd:settings`

**`/gsd:set-profile <profile>`**
快速切换GSD代理的模型配置文件。

- `quality` — 除验证外所有地方使用Opus
- `balanced` — 规划使用Opus，执行使用Sonnet（默认）
- `budget` — 写作使用Sonnet，研究和验证使用Haiku

用法：`/gsd:set-profile budget`

### 实用命令

**`/gsd:cleanup`**
存档来自已完成里程碑的累积阶段目录。

- 识别已完成里程碑但仍位于 `.planning/phases/` 中的阶段
- 在移动任何内容前显示dry-run摘要
- 将阶段目录移动到 `.planning/milestones/v{X.Y}-phases/`
- 在多个里程碑后使用以减少 `.planning/phases/` 的杂乱

用法：`/gsd:cleanup`

**`/gsd:help`**
显示此命令参考。

**`/gsd:update`**
更新GSD到最新版本，包含变更日志预览。

- 显示安装版本与最新版本比较
- 显示你错过的版本的变更日志条目
- 突出破坏性更改
- 确认后运行安装
- 比原始 `npx get-shit-done-cc` 更好

用法：`/gsd:update`

**`/gsd:join-discord`**
加入GSD Discord社区。

- 获取帮助、分享你在构建什么、保持更新
- 连接其他GSD用户

用法：`/gsd:join-discord`

## 文件与结构

```
.planning/
├── PROJECT.md            # 项目愿景
├── ROADMAP.md            # 当前阶段分解
├── STATE.md              # 项目记忆和上下文
├── RETROSPECTIVE.md      # 活动的回顾（每个里程碑更新）
├── config.json           # 工作流模式和关卡
├── todos/                # 捕获的想法和任务
│   ├── pending/          # 等待处理的待办事项
│   └── done/             # 已完成的待办事项
├── debug/                # 活动的调试会话
│   └── resolved/         # 存档的已解决问题
├── milestones/
│   ├── v1.0-ROADMAP.md       # 存档的路线图快照
│   ├── v1.0-REQUIREMENTS.md  # 存档的需求
│   └── v1.0-phases/          # 存档的阶段目录（通过 /gsd:cleanup 或 --archive-phases）
│       ├── 01-foundation/
│       └── 02-core-features/
├── codebase/             # 代码库映射（棕地项目）
│   ├── STACK.md          # 语言、框架、依赖
│   ├── ARCHITECTURE.md   # 模式、层级、数据流
│   ├── STRUCTURE.md      # 目录布局、关键文件
│   ├── CONVENTIONS.md    # 编码标准、命名
│   ├── TESTING.md        # 测试设置、模式
│   ├── INTEGRATIONS.md   # 外部服务、API
│   └── CONCERNS.md       # 技术债务、已知问题
└── phases/
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   └── 01-01-SUMMARY.md
    └── 02-core-features/
        ├── 02-01-PLAN.md
        └── 02-01-SUMMARY.md
```

## 工作模式

在 `/gsd:new-project` 中设置：

**交互模式**

- 在每个主要步骤进行确认
- 在检查点暂停以获得批准
- 在整个过程中提供更多指导

**YOLO模式**

- 自动批准大多数决策
- 执行计划无需确认
- 仅在关键检查点停止

随时通过编辑 `.planning/config.json` 进行更改

## 规划配置

在 `.planning/config.json` 中配置如何管理规划工件：

**`planning.commit_docs`**（默认：`true`）
- `true`: 规划工件提交到git（标准工作流）
- `false`: 规划工件仅本地保存，不提交

当 `commit_docs: false` 时：
- 将 `.planning/` 添加到你的 `.gitignore`
- 对于开源贡献、客户项目或保持规划私有有用
- 所有规划文件正常工作，只是不跟踪git

**`planning.search_gitignored`**（默认：`false`）
- `true`: 为广泛的ripgrep搜索添加 `--no-ignore`
- 仅在 `.planning/` 被gitignore并且你想让项目范围搜索包含它时才需要

示例配置：
```json
{
  "planning": {
    "commit_docs": false,
    "search_gitignored": true
  }
}
```

## 常见工作流

**开始新项目：**

```
/gsd:new-project        # 统一流程：提问 → 研究 → 需求 → 路线图
/clear
/gsd:plan-phase 1       # 为第一个阶段创建计划
/clear
/gsd:execute-phase 1    # 执行阶段中的所有计划
```

**休息后恢复工作：**

```
/gsd:progress  # 查看你停下的位置并继续
```

**添加紧急的里程碑中途工作：**

```
/gsd:insert-phase 5 "Critical security fix"
/gsd:plan-phase 5.1
/gsd:execute-phase 5.1
```

**完成里程碑：**

```
/gsd:complete-milestone 1.0.0
/clear
/gsd:new-milestone  # 开始下一个里程碑（提问 → 研究 → 需求 → 路线图）
```

**在工作期间捕获想法：**

```
/gsd:add-todo                    # 从对话中捕获
/gsd:add-todo Fix modal z-index  # 使用明确描述捕获
/gsd:check-todos                 # 查看并处理待办事项
/gsd:check-todos api             # 按区域过滤
```

**调试问题：**

```
/gsd:debug "form submission fails silently"  # 开始调试会话
# ... 调查发生，上下文填充 ...
/clear
/gsd:debug                                    # 从你停下的位置恢复
```

## 获取帮助

- 阅读 `.planning/PROJECT.md` 了解项目愿景
- 阅读 `.planning/STATE.md` 了解当前上下文
- 检查 `.planning/ROADMAP.md` 了解阶段状态
- 运行 `/gsd:progress` 检查你的进度
</reference>