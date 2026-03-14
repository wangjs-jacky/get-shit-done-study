<purpose>
显示完整的 GSD 命令参考。仅输出参考内容。不要添加项目特定的分析、git 状态、后续步骤建议或任何超出参考范围的评论。
</purpose>

<reference>
# GSD 命令参考

**GSD** (Get Shit Done) 为使用 Claude Code 的独立代理开发创建分层项目计划。

## 快速开始

1. `/gsd:new-project` - 初始化项目（包括研究、需求、路线图）
2. `/gsd:plan-phase 1` - 为第一阶段创建详细计划
3. `/gsd:execute-phase 1` - 执行该阶段

## 保持更新

GSD 快速发展。定期更新：

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

一个命令带你从创意到准备规划阶段：
- 深入提问以了解你正在构建什么
- 可选的领域研究（生成 4 个并行研究员代理）
- 使用 v1/v2/范围外定义需求
- 创建包含阶段分解和成功标准的路线图

创建所有 `.planning/` 工件：
- `PROJECT.md` — 愿景和需求
- `config.json` — 工作模式（交互式/YOLO）
- `research/` — 领域研究（如果选择）
- `REQUIREMENTS.md` — 带有 REQ-ID 的范围需求
- `ROADMAP.md` — 映射到需求的阶段
- `STATE.md` — 项目记忆

用法：`/gsd:new-project`

**`/gsd:map-codebase`**
为现有项目映射代码库。

- 使用并行 Explore 代理分析代码库
- 创建包含 7 个重点文档的 `.planning/codebase/`
- 涵盖栈、架构、结构、约定、测试、集成、关注点
- 在现有代码库上使用 `/gsd:new-project` 之前使用

用法：`/gsd:map-codebase`

### 阶段规划

**`/gsd:discuss-phase <number>`**
帮助阐明你对某个阶段的愿景。

- 捕获你设想这个阶段如何工作
- 创建包含你的愿景、要点和边界的 CONTEXT.md
- 当你对某些事情的样貌/感觉有想法时使用
- 可选 `--batch` 一次询问 2-5 个相关问题，而不是一个一个

用法：`/gsd:discuss-phase 2`
用法：`/gsd:discuss-phase 2 --batch`
用法：`/gsd:discuss-phase 2 --batch=3`

**`/gsd:research-phase <number>`**
针对利基/复杂领域的全面生态系统研究。

- 发现标准栈、架构模式、陷阱
- 创建包含"专家如何构建"知识的 RESEARCH.md
- 用于 3D、游戏、音频、着色器、ML 等专业领域
- 超越"哪个库"到生态系统知识

用法：`/gsd:research-phase 3`

**`/gsd:list-phase-assumptions <number>`**
查看 Claude 开始前的计划内容。

- 显示 Claude 对阶段的预期方法
- 如果 Claude 误解了你的愿景，让你进行课程纠正
- 不创建文件 — 仅对话输出

用法：`/gsd:list-phase-assumptions 3`

**`/gsd:plan-phase <number>`**
为特定阶段创建详细执行计划。

- 生成 `.planning/phases/XX-phase-name/XX-YY-PLAN.md`
- 将阶段分解为具体、可操作的任务
- 包括验证标准和成功度量
- 支持每个阶段多个计划（XX-01、XX-02 等）

用法：`/gsd:plan-phase 1`
结果：创建 `.planning/phases/01-foundation/01-01-PLAN.md`

**PRD 快速路径：** 传递 `--prd path/to/requirements.md` 来完全跳过 discuss-phase。你的 PRD 成为 CONTEXT.md 中的锁定决策。当你已有明确的验收标准时很有用。

### 执行

**`/gsd:execute-phase <phase-number>`**
执行阶段中的所有计划。

- 按波次（来自 frontmatter）分组计划，按顺序执行波次
- 每个波次中的计划通过 Task 工具并行运行
- 所有计划完成后验证阶段目标
- 更新 REQUIREMENTS.md、ROADMAP.md、STATE.md

用法：`/gsd:execute-phase 5`

### 快速模式

**`/gsd:quick`**
执行小型、临时任务，具有 GSD 保证但跳过可选代理。

快速模式使用相同系统但有更短路径：
- 生成规划器 + 执行器（跳过研究员、检查器、验证器）
- 快速任务位于 `.planning/quick/` 中，与计划阶段分开
- 更新 STATE.md 跟踪（而不是 ROADMAP.md）

当你确切知道要做什么并且任务足够小，不需要研究或验证时使用。

用法：`/gsd:quick`
结果：创建 `.planning/quick/NNN-slug/PLAN.md`、`.planning/quick/NNN-slug/SUMMARY.md`

### 路线图管理

**`/gsd:add-phase <description>`**
向当前里程碑末尾添加新阶段。

- 追加到 ROADMAP.md
- 使用下一个顺序号
- 更新阶段目录结构

用法：`/gsd:add-phase "Add admin dashboard"`

**`/gsd:insert-phase <after> <description>`**
作为现有阶段之间的小数阶段插入紧急工作。

- 创建中间阶段（例如，7 和 8 之间的 7.1）
- 用于必须在里程碑中期发现的工作
- 保持阶段顺序

用法：`/gsd:insert-phase 7 "Fix critical auth bug"`
结果：创建阶段 7.1

**`/gsd:remove-phase <number>`**
删除未来阶段并重新编号后续阶段。

- 删除阶段目录和所有引用
- 重新编号所有后续阶段以填补空白
- 仅适用于未来（未开始）阶段
- Git 提交保留历史记录

用法：`/gsd:remove-phase 17`
结果：阶段 17 被删除，阶段 18-20 变为 17-19

### 里程碑管理

**`/gsd:new-milestone <name>`**
通过统一流程启动新里程碑。

- 深入提问以了解你接下来要构建什么
- 可选的领域研究（生成 4 个并行研究员代理）
- 需求定义和范围划分
- 创建带有阶段分解的路线图

为现有项目（现有 PROJECT.md）模仿 `/gsd:new-project` 流程。

用法：`/gsd:new-milestone "v2.0 Features"`

**`/gsd:complete-milestone <version>`**
归档已完成的里程碑并为下一个版本做准备。

- 创建带有统计信息的 MILESTONES.md 条目
- 将完整详细信息归档到 milestones/ 目录
- 为版本创建 git 标签
- 为下一个版本准备工作空间

用法：`/gsd:complete-milestone 1.0.0`

### 进度跟踪

**`/gsd:progress`**
检查项目状态并智能路由到下一个行动。

- 显示可视化进度条和完成百分比
- 从 SUMMARY 文件总结最近的工作
- 显示当前位置和下一步
- 列出关键决策和未解决的问题
- 提供执行下一个计划或在缺失时创建它的选项
- 检测 100% 里程碑完成

用法：`/gsd:progress`

### 会话管理

**`/gsd:resume-work`**
从上一个会话恢复工作，完全恢复上下文。

- 读取 STATE.md 获取项目上下文
- 显示当前位置和最近进度
- 根据项目状态提供下一个行动

用法：`/gsd:resume-work`

**`/gsd:pause-work`**
在阶段中途暂停工作时创建上下文交接。

- 创建包含当前状态的 .continue-here 文件
- 更新 STATE.md 会话连续性部分
- 捕捉进行中的工作上下文

用法：`/gsd:pause-work`

### 调试

**`/gsd:debug [issue description]`**
使用上下文重置后的持久状态进行系统调试。

- 通过自适应提问收集症状
- 创建 `.planning/debug/[slug].md` 来跟踪调查
- 使用科学方法调查（证据 → 假设 → 测试）
- 在 `/clear` 后继续运行 — 无参数运行 `/gsd:debug` 以恢复
- 将已解决的问题归档到 `.planning/debug/resolved/`

用法：`/gsd:debug "login button doesn't work"`
用法：`/gsd:debug`（恢复活动会话）

### 待办事项管理

**`/gsd:add-todo [description]`**
从当前对话将想法或任务捕获为待办事项。

- 从对话中提取上下文（或使用提供的描述）
- 在 `.planning/todos/pending/` 中创建结构化的待办事项文件
- 从文件路径推断区域进行分组
- 创建前检查重复项
- 更新 STATE.md 待办事项计数

用法：`/gsd:add-todo`（从对话推断）
用法：`/gsd:add-todo Add auth token refresh`

**`/gsd:check-todos [area]`**
列出待处理的待办事项并选择一个进行工作。

- 列出所有待处理的待办事项，包含标题、区域、年龄
- 可选的区域过滤（例如，`/gsd:check-todos api`）
- 为选定的待办事项加载完整上下文
- 路由到适当的行动（现在工作、添加到阶段、头脑风暴）
- 将待办事项移至 done/

用法：`/gsd:check-todos`
用法：`/gsd:check-todos api`

### 用户验收测试

**`/gsd:verify-work [phase]`**
通过对话测试验证构建的功能。

- 从 SUMMARY.md 文件中提取可交付测试项
- 一次呈现一个测试（是/否 响应）
- 自动诊断失败并创建修复计划
- 如果发现问题，准备重新执行

用法：`/gsd:verify-work 3`

### 里程碑审计

**`/gsd:audit-milestone [version]`**
根据原始意图审计里程碑完成情况。

- 读取所有阶段 VERIFICATION.md 文件
- 检查需求覆盖范围
- 为跨阶段接线生成集成检查器
- 创建带有差距和技术债务的 MILESTONE-AUDIT.md

用法：`/gsd:audit-milestone`

**`/gsd:plan-milestone-gaps`**
创建阶段以关闭审计发现的差距。

- 读取 MILESTONE-AUDIT.md 并将差距分组为阶段
- 按需求优先级（必须/应该/很好）排序
- 将差距关闭阶段添加到 ROADMAP.md
- 为新阶段准备 `/gsd:plan-phase`

用法：`/gsd:plan-milestone-gaps`

### 配置

**`/gsd:settings`**
交互式配置工作流开关和模型配置文件。

- 切换研究员、计划检查器、验证器代理
- 选择模型配置文件（质量/平衡/预算）
- 更新 `.planning/config.json`

用法：`/gsd:settings`

**`/gsd:set-profile <profile>`**
快速切换 GSD 代理的模型配置文件。

- `quality` — 除验证外所有地方使用 Opus
- `balanced` — 规划使用 Opus，执行使用 Sonnet（默认）
- `budget` — 写作使用 Sonnet，研究/验证使用 Haiku

用法：`/gsd:set-profile budget`

### 实用命令

**`/gsd:cleanup`**
归档已完成里程碑的累积阶段目录。

- 识别已完成里程碑但仍位于 `.planning/phases/` 中的阶段
- 在移动任何内容前显示干运行摘要
- 将阶段目录移动到 `.planning/milestones/v{X.Y}-phases/`
- 在多个里程碑后使用以减少 `.planning/phases/` 杂乱

用法：`/gsd:cleanup`

**`/gsd:help`**
显示此命令参考。

**`/gsd:update`**
使用更新日志预览更新 GSD 到最新版本。

- 显示已安装 vs 最新版本比较
- 显示你错过的版本的更新日志条目
- 突出显示破坏性更改
- 在运行安装前确认
- 比原始的 `npx get-shit-done-cc` 更好

用法：`/gsd:update`

**`/gsd:join-discord`**
加入 GSD Discord 社区。

- 获取帮助，分享你正在构建的内容，保持最新
- 连接其他 GSD 用户

用法：`/gsd:join-discord`

## 文件与结构

```
.planning/
├── PROJECT.md            # 项目愿景
├── ROADMAP.md            # 当前阶段分解
├── STATE.md              # 项目记忆与上下文
├── RETROSPECTIVE.md      # 活动的回顾（每个里程碑更新）
├── config.json           # 工作模式与关卡
├── todos/                # 捕获的想法和任务
│   ├── pending/          # 等待工作的待办事项
│   └── done/             # 已完成的待办事项
├── debug/                # 活动调试会话
│   └── resolved/         # 归档的已解决问题
├── milestones/
│   ├── v1.0-ROADMAP.md       # 归档路线图快照
│   ├── v1.0-REQUIREMENTS.md  # 归档需求
│   └── v1.0-phases/          # 归档阶段目录（通过 /gsd:cleanup 或 --archive-phases）
│       ├── 01-foundation/
│       └── 02-core-features/
├── codebase/             # 代码库映射（现有项目）
│   ├── STACK.md          # 语言、框架、依赖项
│   ├── ARCHITECTURE.md   # 模式、层次、数据流
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

在 `/gsd:new-project` 期间设置：

**交互模式**

- 确认每个主要决策
- 在检查点暂停以获得批准
- 全程提供更多指导

**YOLO 模式**

- 自动批准大多数决策
- 无确认执行计划
- 仅在关键检查点停止

通过编辑 `.planning/config.json` 随时更改

## 规划配置

在 `.planning/config.json` 中配置如何规划工件：

**`planning.commit_docs`**（默认：`true`）
- `true`：规划工件提交到 git（标准工作流）
- `false`：规划工件仅本地保存，不提交

当 `commit_docs: false` 时：
- 将 `.planning/` 添加到你的 `.gitignore`
- 对于开源贡献、客户项目或保持规划私密很有用
- 所有规划文件仍正常工作，只是不跟踪在 git 中

**`planning.search_gitignored`**（默认：`false`）
- `true`：向广泛的 ripgrep 搜索添加 `--no-ignore`
- 仅在 `.planning/` 被忽略且你希望项目范围搜索包含它时需要

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

**启动新项目：**

```
/gsd:new-project        # 统一流程：提问 → 研究 → 需求 → 路线图
/clear
/gsd:plan-phase 1       # 为第一阶段创建计划
/clear
/gsd:execute-phase 1    # 执行阶段中的所有计划
```

**恢复工作后：**

```
/gsd:progress  # 查看你停在哪里并继续
```

**添加紧急里程碑中期工作：**

```
/gsd:insert-phase 5 "Critical security fix"
/gsd:plan-phase 5.1
/gsd:execute-phase 5.1
```

**完成里程碑：**

```
/gsd:complete-milestone 1.0.0
/clear
/gsd:new-milestone  # 启动下一个里程碑（提问 → 研究 → 需求 → 路线图）
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
/gsd:debug "form submission fails silently"  # 启动调试会话
# ... 调查发生，上下文填满 ...
/clear
/gsd:debug                                    # 从你停下的地方恢复
```

## 获取帮助

- 阅读 `.planning/PROJECT.md` 了解项目愿景
- 阅读 `.planning/STATE.md` 了解当前上下文
- 检查 `.planning/ROADMAP.md` 了解阶段状态
- 运行 `/gsd:progress` 检查你的进展
</reference>
