# GSD 框架 API 与接口文档

> 本文档汇总了 Get Shit Done (GSD) 框架的所有 CLI 命令、安装器选项、Demo 项目路由、Agent frontmatter 字段，以及内部工具 API。

---

## 目录

1. [GSD CLI 命令索引](#1-gsd-cli-命令索引)
2. [GSD 安装器 CLI 选项](#2-gsd-安装器-cli-选项)
3. [Demo 项目页面路由表](#3-demo-项目页面路由表)
4. [Agent Frontmatter 字段参考](#4-agent-frontmatter-字段参考)
5. [内部工具 API 参考 (gsd-tools.cjs)](#5-内部工具-api-参考-gsd-toolscjs)
6. [配置系统参考](#6-配置系统参考)

---

## 1. GSD CLI 命令索引

GSD 框架通过 Claude Code / OpenCode / Gemini / Codex 的斜杠命令系统提供 30+ 个命令。所有命令以 `/gsd:` 为前缀。

### 1.1 项目初始化

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:new-project` | `[--auto]` | 初始化新项目，进行深度上下文收集。`--auto` 模式在配置问答后自动运行研究 -> 需求 -> 路线图流程 |
| `/gsd:new-milestone` | `[里程碑名称]` | 启动新里程碑周期，更新 PROJECT.md 并路由到需求收集 |
| `/gsd:map-codebase` | `[可选: 特定区域]` | 使用并行 mapper agent 分析代码库，生成 `.planning/codebase/` 文档 |

### 1.2 阶段规划

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:research-phase` | `[阶段编号]` | 独立研究阶段实现方案（通常由 plan-phase 自动集成） |
| `/gsd:discuss-phase` | `<阶段> [--auto]` | 通过自适应提问收集阶段上下文，在规划前明确需求 |
| `/gsd:plan-phase` | `[阶段] [--auto] [--research] [--skip-research] [--gaps] [--skip-verify] [--prd <file>]` | 创建详细的阶段计划 (PLAN.md)，包含验证循环 |
| `/gsd:list-phase-assumptions` | `[阶段]` | 在规划前列出 Claude 对阶段方案的假设 |
| `/gsd:validate-phase` | `[阶段编号]` | 对已完成阶段进行追溯审计，填补 Nyquist 验证空白 |

### 1.3 执行与验证

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:execute-phase` | `<阶段编号> [--gaps-only]` | 使用波浪式并行化执行阶段内所有计划。`--gaps-only` 仅执行间隙修复计划 |
| `/gsd:quick` | `[--full] [--discuss]` | 执行快速任务（跳过可选 agent）。`--full` 启用计划检查和验证；`--discuss` 启用轻量讨论阶段 |
| `/gsd:verify-work` | `[阶段编号]` | 通过对话式 UAT 验证已构建功能 |
| `/gsd:debug` | `[问题描述]` | 系统化调试，使用持久化状态跨上下文重置 |

### 1.4 阶段管理

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:add-phase` | `<描述>` | 在当前里程碑的路线图末尾添加新阶段 |
| `/gsd:insert-phase` | `<在哪个阶段后> <描述>` | 以十进制编号（如 72.1）在现有阶段之间插入紧急工作 |
| `/gsd:remove-phase` | `<阶段编号>` | 从路线图移除未开始的阶段并重新编号后续阶段 |
| `/gsd:add-tests` | `"<阶段> [附加说明]"` | 基于验收标准和实现为已完成阶段生成测试 |

### 1.5 里程碑管理

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:complete-milestone` | `<版本>` | 归档已完成里程碑，创建 MILESTONES.md，准备下一版本 |
| `/gsd:audit-milestone` | `[版本]` | 在归档前审计里程碑完成度与原始意图的匹配程度 |
| `/gsd:plan-milestone-gaps` | - | 创建阶段来填补里程碑审计发现的所有空白 |

### 1.6 会话管理

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:pause-work` | - | 创建上下文交接文档，暂停当前工作 |
| `/gsd:resume-work` | - | 从上一会话恢复，恢复完整上下文 |
| `/gsd:progress` | - | 检查项目进度，显示上下文，路由到下一步操作 |

### 1.7 任务管理

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:add-todo` | `[可选描述]` | 从当前对话上下文捕获想法或任务为待办事项 |
| `/gsd:check-todos` | `[区域过滤]` | 列出待处理任务并选择一个来执行 |

### 1.8 系统管理

| 命令 | 参数 | 功能描述 |
|------|------|----------|
| `/gsd:health` | `[--repair]` | 诊断 `.planning/` 目录健康状态，可选修复问题 |
| `/gsd:settings` | - | 配置 GSD 工作流开关和模型 profile |
| `/gsd:set-profile` | `<profile>` | 切换 GSD agent 的模型 profile（quality/balanced/budget） |
| `/gsd:cleanup` | - | 归档已完成里程碑的阶段目录 |
| `/gsd:reapply-patches` | - | GSD 更新后重新应用本地修改 |
| `/gsd:update` | - | 更新 GSD 到最新版本并显示变更日志 |
| `/gsd:help` | - | 显示可用的 GSD 命令和使用指南 |
| `/gsd:join-discord` | - | 显示 GSD Discord 社区邀请链接 |

---

## 2. GSD 安装器 CLI 选项

安装器通过 `node bin/install.js` 运行，支持以下命令行参数：

### 2.1 运行时选择

| 选项 | 简写 | 说明 |
|------|------|------|
| `--claude` | - | 安装到 Claude Code (`~/.claude/`) |
| `--opencode` | - | 安装到 OpenCode (`~/.config/opencode/`) |
| `--gemini` | - | 安装到 Gemini (`~/.gemini/`) |
| `--codex` | - | 安装到 Codex (`~/.codex/`) |
| `--both` | - | 同时安装到 Claude Code 和 OpenCode（遗留选项） |
| `--all` | - | 安装到所有支持的运行时 |

### 2.2 安装范围

| 选项 | 简写 | 说明 |
|------|------|------|
| `--global` | `-g` | 全局安装（用户级别） |
| `--local` | `-l` | 本地安装（项目级别） |

### 2.3 其他选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--config-dir <path>` | `-c` | 指定配置目录路径（覆盖默认路径） |
| `--uninstall` | `-u` | 卸载 GSD |

### 2.4 环境变量覆盖

每个运行时的全局配置目录可通过环境变量覆盖：

| 运行时 | 环境变量 | 默认路径 |
|--------|----------|----------|
| Claude Code | `CLAUDE_CONFIG_DIR` | `~/.claude` |
| OpenCode | `OPENCODE_CONFIG_DIR` > `OPENCODE_CONFIG`(dirname) > `XDG_CONFIG_HOME/opencode` | `~/.config/opencode` |
| Gemini | `GEMINI_CONFIG_DIR` | `~/.gemini` |
| Codex | `CODEX_HOME` | `~/.codex` |

### 2.5 Codex Agent 沙箱配置

安装器为每个 GSD agent 配置 Codex 沙箱权限：

| Agent | 沙箱模式 |
|-------|----------|
| gsd-executor | `workspace-write` |
| gsd-planner | `workspace-write` |
| gsd-phase-researcher | `workspace-write` |
| gsd-project-researcher | `workspace-write` |
| gsd-research-synthesizer | `workspace-write` |
| gsd-verifier | `workspace-write` |
| gsd-codebase-mapper | `workspace-write` |
| gsd-roadmapper | `workspace-write` |
| gsd-debugger | `workspace-write` |
| gsd-plan-checker | `read-only` |
| gsd-integration-checker | `read-only` |

---

## 3. Demo 项目页面路由表

Demo 项目 `demo-by-gsd` 基于 Astro 框架构建，使用静态输出模式。

### 3.1 Astro 配置

```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/get-shit-done-study',
  output: 'static',
  integrations: [react()],
});
```

- **部署站点**: `https://wangjs-jacky.github.io`
- **基础路径**: `/get-shit-done-study`
- **输出模式**: 静态站点（无 SSR）
- **集成**: React（用于交互组件）

### 3.2 页面路由

| URL 路径 | 文件 | 组件 | 说明 |
|----------|------|------|------|
| `/get-shit-done-study/` | `src/pages/index.astro` | `Layout` + `Gallery` | 首页 - 前端设计风格画廊 |

### 3.3 API 路由

Demo 项目**没有 API 路由**（`src/pages/api/` 目录不存在）。项目使用纯静态输出，所有数据来自 `src/data/styles.json` 静态文件。

### 3.4 关键组件

| 组件 | 类型 | 说明 |
|------|------|------|
| `Layout` | Astro 组件 | 页面布局模板 |
| `Gallery` | React 组件 (`client:load`) | 风格画廊交互组件 |

---

## 4. Agent Frontmatter 字段参考

所有 GSD agent 定义文件（`agents/*.md`）使用 YAML frontmatter 描述元数据和能力。

### 4.1 通用字段结构

```yaml
---
name: <agent-name>           # 必需，agent 唯一标识符
description: <描述>           # 必需，agent 功能描述
tools: <tool-list>           # 必需，允许使用的工具列表
color: <color>               # 可选，终端显示颜色标识
skills:                      # 可选，关联的 skill 列表
  - <skill-name>
hooks:                       # 可选，生命周期钩子（通常注释掉）
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "..."
---
```

### 4.2 字段详细说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | 是 | Agent 标识符，格式 `gsd-<name>` |
| `description` | string | 是 | Agent 角色的简短描述 |
| `tools` | string (逗号分隔) | 是 | Agent 可使用的工具白名单 |
| `color` | string | 否 | 终端颜色标识（yellow/green/cyan/purple/blue/orange） |
| `skills` | string[] | 否 | 关联的 GSD skill 列表 |
| `hooks` | object | 否 | 工具使用后的自动钩子 |

### 4.3 Agent 完整列表

| Agent | 颜色 | 工具 | 由谁调度 | 职责 |
|-------|------|------|----------|------|
| `gsd-executor` | yellow | Read, Write, Edit, Bash, Grep, Glob | execute-phase | 执行计划，创建原子提交 |
| `gsd-planner` | green | Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__* | plan-phase | 创建可执行的阶段计划 |
| `gsd-phase-researcher` | cyan | Read, Write, Bash, Grep, Glob, WebSearch, WebFetch, mcp__context7__* | plan-phase | 研究阶段实现方案，产出 RESEARCH.md |
| `gsd-project-researcher` | cyan | Read, Write, Bash, Grep, Glob, WebSearch, WebFetch, mcp__context7__* | new-project/new-milestone | 研究领域生态系统 |
| `gsd-research-synthesizer` | purple | Read, Write, Bash | new-project | 合并并行研究员的输出为 SUMMARY.md |
| `gsd-roadmapper` | purple | Read, Write, Bash, Glob, Grep | new-project | 创建项目路线图 |
| `gsd-verifier` | green | Read, Write, Bash, Grep, Glob | verify-work | 验证阶段目标达成 |
| `gsd-plan-checker` | green | Read, Bash, Glob, Grep | plan-phase | 在执行前验证计划质量 |
| `gsd-integration-checker` | blue | Read, Bash, Grep, Glob | verify-work | 验证跨阶段集成 |
| `gsd-codebase-mapper` | cyan | Read, Bash, Grep, Glob, Write | map-codebase | 探索代码库并编写结构化分析文档 |
| `gsd-debugger` | orange | Read, Write, Edit, Bash, Grep, Glob, WebSearch | debug | 使用科学方法调查 bug |
| `gsd-nyquist-auditor` | #8B5CF6 | (继承默认) | validate-phase | 填补 Nyquist 验证空白 |

### 4.4 模型 Profile 映射

每个 agent 根据当前 profile 设置选择不同模型：

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| gsd-planner | opus | opus | sonnet |
| gsd-roadmapper | opus | sonnet | sonnet |
| gsd-executor | opus | sonnet | sonnet |
| gsd-phase-researcher | opus | sonnet | haiku |
| gsd-project-researcher | opus | sonnet | haiku |
| gsd-research-synthesizer | sonnet | sonnet | haiku |
| gsd-debugger | opus | sonnet | sonnet |
| gsd-codebase-mapper | sonnet | haiku | haiku |
| gsd-verifier | sonnet | sonnet | haiku |
| gsd-plan-checker | sonnet | sonnet | haiku |
| gsd-integration-checker | sonnet | sonnet | haiku |
| gsd-nyquist-auditor | sonnet | sonnet | haiku |

---

## 5. 内部工具 API 参考 (gsd-tools.cjs)

`gsd-tools.cjs` 是 GSD 框架的核心 CLI 工具，提供原子化命令供命令文件、工作流和 agent 调用。

**调用方式**：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" <command> [args] [--raw] [--cwd=<path>]
```

**通用选项**：
- `--raw`: 输出纯文本而非 JSON（用于 bash 变量赋值）
- `--cwd=<path>`: 覆盖工作目录（沙箱子代理使用）

### 5.1 状态管理

#### `state load`

加载项目配置和状态。

```bash
node gsd-tools.cjs state load [--raw]
```

**返回**: 包含 `config`、`state_raw`、`state_exists`、`roadmap_exists`、`config_exists` 的对象。

#### `state json`

将 STATE.md frontmatter 输出为 JSON。

```bash
node gsd-tools.cjs state json [--raw]
```

#### `state get [section]`

获取 STATE.md 的内容或指定字段/章节。

```bash
node gsd-tools.cjs state get "Current Phase" --raw
```

#### `state update <field> <value>`

更新 STATE.md 中的单个字段。

```bash
node gsd-tools.cjs state update "Current Phase" "3" --raw
```

#### `state patch --field val ...`

批量更新 STATE.md 字段。

```bash
node gsd-tools.cjs state patch --field "Status=Ready" --field "Current Plan=1"
```

#### `state advance-plan`

递增当前计划计数器。

```bash
node gsd-tools.cjs state advance-plan --raw
```

**返回**: `{ advanced: true, previous_plan: N, current_plan: N+1, total_plans: M }`

#### `state record-metric`

记录执行指标。

```bash
node gsd-tools.cjs state record-metric --phase 1 --plan 2 --duration 15min --tasks 5 --files 8
```

#### `state update-progress`

重新计算进度条。

```bash
node gsd-tools.cjs state update-progress --raw
```

#### `state add-decision`

向 STATE.md 添加决策记录。

```bash
node gsd-tools.cjs state add-decision --summary "使用 SQLite" --phase 1 --rationale "性能考虑"
# 或从文件读取：
node gsd-tools.cjs state add-decision --summary-file /tmp/summary.txt --rationale-file /tmp/rationale.txt
```

#### `state add-blocker` / `state resolve-blocker`

添加/解决阻塞项。

```bash
node gsd-tools.cjs state add-blocker --text "API 密钥未配置"
node gsd-tools.cjs state resolve-blocker --text "API 密钥未配置"
```

#### `state record-session`

更新会话连续性信息。

```bash
node gsd-tools.cjs state record-session --stopped-at "完成了用户模块" --resume-file .planning/phases/3-xxx
```

#### `state-snapshot`

STATE.md 的结构化解析。

```bash
node gsd-tools.cjs state-snapshot
```

### 5.2 配置管理

#### `config-ensure-section`

初始化 `.planning/config.json`（如果不存在）。

```bash
node gsd-tools.cjs config-ensure-section
```

### 5.3 阶段操作

#### `find-phase <phase>`

通过编号查找阶段目录。

```bash
node gsd-tools.cjs find-phase 3 --raw
```

#### `phase next-decimal <phase>`

计算下一个十进制阶段编号。

```bash
node gsd-tools.cjs phase next-decimal 7
```

#### `phase add <description>`

向路线图追加新阶段。

```bash
node gsd-tools.cjs phase add "用户认证"
```

#### `phase insert <after> <description>`

在指定阶段后插入十进制阶段。

```bash
node gsd-tools.cjs phase insert 7 "紧急修复"
```

#### `phase remove <phase> [--force]`

移除阶段并重新编号。

```bash
node gsd-tools.cjs phase remove 5 --force
```

#### `phase complete <phase>`

标记阶段为完成。

```bash
node gsd-tools.cjs phase complete 3
```

#### `phase-plan-index <phase>`

索引阶段内的计划及其波浪和状态。

```bash
node gsd-tools.cjs phase-plan-index 3
```

### 5.4 路线图操作

#### `roadmap get-phase <phase>`

从 ROADMAP.md 提取指定阶段的内容。

```bash
node gsd-tools.cjs roadmap get-phase 3
```

#### `roadmap analyze`

完整路线图解析，包含磁盘状态。

```bash
node gsd-tools.cjs roadmap analyze
```

#### `roadmap update-plan-progress <N>`

根据磁盘上的 PLAN 与 SUMMARY 数量更新进度表。

```bash
node gsd-tools.cjs roadmap update-plan-progress 3
```

### 5.5 需求操作

#### `requirements mark-complete <ids>`

在 REQUIREMENTS.md 中标记需求为已完成。

```bash
node gsd-tools.cjs requirements mark-complete REQ-01,REQ-02
node gsd-tools.cjs requirements mark-complete "[REQ-01, REQ-02]"
```

### 5.6 里程碑操作

#### `milestone complete <version>`

归档里程碑。

```bash
node gsd-tools.cjs milestone complete v1.0 --name "MVP" --archive-phases
```

**选项**：
- `--name <name>`: 里程碑名称
- `--archive-phases`: 将阶段目录移至 `milestones/vX.Y-phases/`

### 5.7 Frontmatter CRUD

#### `frontmatter get <file> [--field k]`

提取文件 frontmatter 为 JSON。

```bash
node gsd-tools.cjs frontmatter get .planning/phases/1-xxx/PLAN.md --field wave
```

#### `frontmatter set <file> --field k --value jsonVal`

更新单个 frontmatter 字段。

```bash
node gsd-tools.cjs frontmatter set PLAN.md --field wave --value 2
```

#### `frontmatter merge <file> --data '{json}'`

合并 JSON 到 frontmatter。

```bash
node gsd-tools.cjs frontmatter merge PLAN.md --data '{"status":"complete","wave":3}'
```

#### `frontmatter validate <file> --schema <name>`

验证 frontmatter 必需字段。

```bash
node gsd-tools.cjs frontmatter validate PLAN.md --schema plan
```

**可用 schema**：
- `plan`: 必需字段包括 `phase`, `plan`, `type`, `wave`, `depends_on`, `files_modified`, `autonomous`, `must_haves`
- `summary`: 必需字段包括 `phase`, `plan`, `subsystem`, `tags`, `duration`, `completed`
- `verification`: 必需字段包括 `phase`, `verified`, `status`, `score`

### 5.8 验证套件

| 命令 | 说明 |
|------|------|
| `verify plan-structure <file>` | 检查 PLAN.md 结构和任务 |
| `verify phase-completeness <phase>` | 检查所有计划是否有摘要 |
| `verify references <file>` | 检查 @-引用和路径是否可解析 |
| `verify commits <h1> [h2] ...` | 批量验证提交哈希 |
| `verify artifacts <plan-file>` | 检查 must_haves.artifacts |
| `verify key-links <plan-file>` | 检查 must_haves.key_links |
| `validate consistency` | 检查阶段编号、磁盘/路线图同步 |
| `validate health [--repair]` | 检查 `.planning/` 完整性，可选修复 |

### 5.9 模板填充

```bash
# 创建预填充的 SUMMARY.md
node gsd-tools.cjs template fill summary --phase 1 --plan 2 --name "用户模块"

# 创建预填充的 PLAN.md
node gsd-tools.cjs template fill plan --phase 1 --plan 1 --type execute --wave 1

# 创建预填充的 VERIFICATION.md
node gsd-tools.cjs template fill verification --phase 1
```

### 5.10 实用命令

| 命令 | 说明 |
|------|------|
| `resolve-model <agent-type>` | 根据 profile 获取 agent 的模型 |
| `generate-slug <text>` | 将文本转为 URL 安全的 slug |
| `current-timestamp [format]` | 获取时间戳（`full`/`date`/`filename`） |
| `list-todos [area]` | 列出并计数待办任务 |
| `verify-path-exists <path>` | 检查文件/目录是否存在 |
| `history-digest` | 聚合所有 SUMMARY.md 数据 |
| `summary-extract <path> [--fields]` | 从 SUMMARY.md 提取结构化数据 |
| `commit <message> [--files f1 f2]` | 提交规划文档 |
| `websearch <query>` | 通过 Brave API 搜索（需配置 BRAVE_API_KEY） |
| `progress [json\|table\|bar]` | 以多种格式渲染进度 |
| `todo complete <filename>` | 将待办标记为完成 |
| `scaffold <type> --phase <N>` | 脚手架生成（`context`/`uat`/`verification`/`phase-dir`） |

### 5.11 复合初始化命令

这些命令为特定工作流预加载所有上下文：

| 命令 | 用于工作流 |
|------|-----------|
| `init execute-phase <phase>` | execute-phase |
| `init plan-phase <phase>` | plan-phase |
| `init new-project` | new-project |
| `init new-milestone` | new-milestone |
| `init quick <description>` | quick |
| `init resume` | resume-project |
| `init verify-work <phase>` | verify-work |
| `init phase-op <phase>` | 通用阶段操作 |
| `init todos [area]` | 待办任务工作流 |
| `init milestone-op` | 里程碑操作 |
| `init map-codebase` | map-codebase |
| `init progress` | progress |

### 5.12 输出格式

所有命令支持两种输出模式：

1. **JSON 模式**（默认）: 输出结构化 JSON。当 JSON 超过 50KB 时，自动写入临时文件并输出 `@file:<path>` 前缀。
2. **Raw 模式**（`--raw`）: 输出纯文本值，便于 bash 赋值（如 `PLAN=$(node gsd-tools.cjs find-phase 3 --raw)`）。

---

## 6. 配置系统参考

### 6.1 配置文件

配置文件位于 `.planning/config.json`，存储项目级工作流偏好。

### 6.2 有效配置键

| 键 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `model_profile` | string | `"balanced"` | 模型 profile（`quality`/`balanced`/`budget`） |
| `commit_docs` | boolean | `true` | 是否自动提交规划文档 |
| `search_gitignored` | boolean | `false` | 是否搜索 gitignored 文件 |
| `branching_strategy` | string | `"none"` | Git 分支策略 |
| `phase_branch_template` | string | `"gsd/phase-{phase}-{slug}"` | 阶段分支模板 |
| `milestone_branch_template` | string | `"gsd/{milestone}-{slug}"` | 里程碑分支模板 |
| `parallelization` | boolean | `true` | 是否启用并行执行 |
| `brave_search` | boolean | `false` | 是否启用 Brave 搜索 |
| `workflow.research` | boolean | `true` | 工作流中启用研究阶段 |
| `workflow.plan_check` | boolean | `true` | 工作流中启用计划检查 |
| `workflow.verifier` | boolean | `true` | 工作流中启用验证 |
| `workflow.nyquist_validation` | boolean | `true` | 工作流中启用 Nyquist 验证 |

### 6.3 全局默认值

用户级默认值可配置在 `~/.gsd/defaults.json`，安装时会自动合并到项目配置。支持将已废弃的 `depth` 键自动迁移为 `granularity`（`quick` -> `coarse`，`standard` -> `standard`，`comprehensive` -> `fine`）。

### 6.4 配置命令

```bash
# 读取配置值
node gsd-tools.cjs config-get model_profile

# 设置配置值
node gsd-tools.cjs config-set workflow.research false
node gsd-tools.cjs config-set model_profile quality
```

---

## 附录：文件约定

### 规划目录结构

```
.planning/
  PROJECT.md          # 项目上下文
  REQUIREMENTS.md     # 需求文档
  ROADMAP.md          # 路线图
  STATE.md            # 项目状态（含 YAML frontmatter）
  config.json         # 工作流配置
  research/           # 研究文档
  codebase/           # 代码库分析文档
  todos/
    pending/          # 待办任务
    completed/        # 已完成任务
  phases/
    1-xxx/            # 阶段目录
      1-PLAN.md       # 执行计划
      1-SUMMARY.md    # 执行摘要
      CONTEXT.md      # 阶段上下文
      UAT.md          # 用户验收测试
      VERIFICATION.md # 验证报告
  milestones/
    v1.0-phases/      # 已归档里程碑阶段
    MILESTONES.md     # 里程碑历史
  quick/              # 快速任务
  debug/              # 调试会话
```

### Frontmatter Schema 名称约定

PLAN.md 和 SUMMARY.md 的 frontmatter 使用 `{phase}-{type}` 命名模式（如 `1-PLAN.md`、`2-SUMMARY.md`），其中 phase 使用零填充编号（如 `01`、`02`）。
