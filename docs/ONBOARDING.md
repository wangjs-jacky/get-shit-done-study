# Get Shit Done Study - 项目 Onboarding 指南

> 一份帮助新成员（或未来的你）快速理解本项目的完整指南。

## 项目定位

本项目用于**深入学习 [get-shit-done (GSD)](https://github.com/discreteprojects/get-shit-done) 框架**——一个为 Claude Code / OpenCode / Gemini CLI / Codex 设计的 AI 辅助开发框架。GSD 的核心理念是**解决上下文腐化问题**（context rot），即随着 AI 对话上下文窗口填满，输出质量逐渐下降。

项目不是简单的源码克隆，而是一个**学习实验室**：
1. 阅读源码 → 提取设计模式 → 记录笔记
2. 通过 demo 项目验证对框架的理解
3. 将可复用的技巧应用到其他项目

---

## 架构概览

```
get-shit-done-study/
│
├── get-shit-done/          # GSD 框架源码（npm 包 get-shit-done-cc）
│   ├── agents/             # 12 个专业化子代理（核心）
│   ├── commands/gsd/       # 40+ 斜杠命令定义
│   ├── hooks/              # 3 个 JS 钩子（上下文监控、状态栏、更新检查）
│   ├── bin/install.js      # 安装器（88KB，核心安装逻辑）
│   ├── get-shit-done/      # 安装后部署到 ~/.claude/ 的文件
│   │   ├── bin/lib/        # gsd-tools.cjs 运行时工具
│   │   ├── workflows/      # 编排工作流（new-project, plan-phase 等）
│   │   ├── references/     # 参考文档（questioning, ui-brand 等）
│   │   └── templates/      # 模板（project.md, requirements.md 等）
│   ├── tests/              # 17 个测试文件
│   └── scripts/            # 构建 & 测试脚本
│
├── demo-by-gsd/            # 用 GSD 工作流开发的演示项目
│   ├── src/                # Astro + React 19 + Tailwind 4
│   ├── .planning/          # GSD 生成的规划文件
│   │   ├── ROADMAP.md      # 项目路线图
│   │   ├── REQUIREMENTS.md # 需求文档
│   │   ├── STATE.md        # 项目状态
│   │   └── phases/         # 各阶段计划
│   └── .opencode/          # OpenCode 配置
│
├── notes/                  # 学习笔记（你的主要输出）
│   ├── gsd/                # GSD 核心概念
│   ├── architecture/       # 架构设计
│   ├── design/             # 设计模式收集
│   ├── gsd-analysis/       # 深度分析
│   ├── reusable-designs/   # 可复用设计模式
│   └── claude-code/        # Claude Code 相关知识
│
├── docs/                   # 文档
└── .github/workflows/      # CI/CD（部署 demo 到 GitHub Pages）
```

### 系统流程图

```
用户 → /gsd:new-project
         │
         ├── gsd-project-researcher (4个并行) → 研究领域生态
         │         │
         │   gsd-research-synthesizer → 汇总研究
         │         │
         ├── gsd-roadmapper → 生成 ROADMAP.md
         │         │
         └── .planning/ 目录就绪
                   │
用户 → /gsd:plan-phase 1
         │
         ├── gsd-phase-researcher → 研究实现方案
         │         │
         ├── gsd-plan-checker → 验证计划质量
         │         │
         └── PLAN.md 就绪
                   │
用户 → /gsd:execute-phase 1
         │
         └── gsd-executor → 原子提交执行
                   │
         ┌───────┴────────┐
         │ (可选并行)       │
         gsd-nyquist-auditor  gsd-integration-checker
                   │
         gsd-verifier → 目标反向验证
                   │
         ROADMAP.md + STATE.md 更新
```

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| GSD 框架 | Node.js, esbuild | npm 包打包和安装 |
| GSD 安装器 | bin/install.js (88KB) | 部署 agents/commands/hooks 到目标运行时 |
| Demo 前端 | Astro 6 + React 19 | 静态站点生成 |
| Demo 样式 | Tailwind CSS 4 | CSS 框架 |
| Demo 测试 | Vitest + Testing Library | 单元/组件测试 |
| Demo 部署 | GitHub Actions → GitHub Pages | CI/CD 自动部署 |
| 学习笔记 | Markdown (Obsidian) | 知识归档 |

---

## 关键文件地图

### 优先阅读（第一天）

| 优先级 | 路径 | 说明 | 为什么重要 |
|--------|------|------|-----------|
| 1 | `get-shit-done/README.zh-CN.md` | 中文 README | 理解框架的设计哲学和全局功能 |
| 2 | `get-shit-done/agents/gsd-executor.md` | 执行器代理 | GSD 最核心的代理，理解"如何执行计划" |
| 3 | `get-shit-done/agents/gsd-planner.md` | 计划器代理 | 理解"如何拆解任务"（1309行，最复杂的代理） |
| 4 | `demo-by-gsd/.planning/ROADMAP.md` | 演示项目路线图 | 看到实际使用 GSD 的产出 |
| 5 | `CLAUDE.md` | 项目指令 | 学习目标和知识归档规则 |

### 深入理解（第一周）

| 路径 | 说明 | 为什么重要 |
|------|------|-----------|
| `get-shit-done/agents/gsd-roadmapper.md` | 路线图生成器 | 理解需求如何变成阶段 |
| `get-shit-done/agents/gsd-verifier.md` | 验证器 | 理解"目标反向验证"模式 |
| `get-shit-done/agents/gsd-debugger.md` | 调试器 | 理解科学调试法（1257行） |
| `get-shit-done/agents/gsd-phase-researcher.md` | 阶段研究员 | 理解执行前的调研机制 |
| `get-shit-done/hooks/gsd-context-monitor.js` | 上下文监控 | GSD 解决 context rot 的核心机制 |
| `get-shit-done/get-shit-done/workflows/` | 工作流文件 | 编排逻辑的真正实现地 |
| `get-shit-done/get-shit-done/templates/` | 模板文件 | 各种文档模板 |
| `get-shit-done/get-shit-done/references/` | 参考文档 | 提问技巧、UI 品牌等参考 |

### 危险文件（修改前需谨慎）

| 路径 | 风险 | 原因 |
|------|------|------|
| `get-shit-done/bin/install.js` | 高 | 安装器逻辑，修改可能导致所有用户安装失败 |
| `get-shit-done/get-shit-done/bin/lib/gsd-tools.cjs` | 高 | 运行时工具，多个代理依赖它 |
| `get-shit-done/hooks/gsd-context-monitor.js` | 中 | 上下文阈值调整会影响所有使用者的体验 |

---

## 本地设置（目标：< 5 分钟）

### 前置条件

| 工具 | 版本 | 安装命令 |
|------|------|---------|
| Node.js | >= 22.12 | `nvm install 22` |
| pnpm | 最新 | `corepack enable && corepack prepare pnpm@latest` |
| Git | 任意 | 系统自带 |
| Obsidian | 最新 | 可选，用于阅读笔记 |

### 步骤

**1. 克隆仓库**（30 秒）
```bash
cd ~/jacky-github
git clone https://github.com/wangjs-jacky/get-shit-done-study.git
cd get-shit-done-study
```

**2. 阅读框架 README**（2 分钟）
```bash
# 中文版
cat get-shit-done/README.zh-CN.md | head -100
```

**3. 查看演示项目**（1 分钟）
```bash
cd demo-by-gsd
pnpm install
pnpm dev
# 打开 http://localhost:4321
```

**4. 查看学习笔记**（1 分钟）
```bash
# 用 Obsidian 打开整个项目目录
ls notes/
```

### 验证清单

- [ ] `pnpm dev` 在 demo-by-gsd 目录下正常启动
- [ ] http://localhost:4321 可以看到前端设计展示
- [ ] `notes/` 目录下有已存在的学习笔记
- [ ] 线上 demo 可访问：https://wangjs-jacky.github.io/get-shit-done-study/

---

## 核心概念速查

### GSD 三层规划结构

| 概念 | 文件 | 说明 |
|------|------|------|
| **Roadmap** | `.planning/ROADMAP.md` | 项目路线图，包含所有 Phase |
| **Phase** | `.planning/phases/XX-YY-PLAN.md` | 一个开发阶段，含多个 Task |
| **Plan** | 每个 PLAN.md 里的 task 列表 | 可由 executor 原子执行的任务 |

### GSD 12 个代理

| 代理 | 职责 | 何时触发 |
|------|------|---------|
| `gsd-project-researcher` | 研究领域生态 | `/gsd:new-project` |
| `gsd-research-synthesizer` | 汇总并行研究结果 | `/gsd:new-project` |
| `gsd-roadmapper` | 生成路线图 | `/gsd:new-project` |
| `gsd-phase-researcher` | 研究单个 Phase 的实现方案 | `/gsd:research-phase` |
| `gsd-planner` | 创建可执行计划 | `/gsd:plan-phase` |
| `gsd-plan-checker` | 验证计划质量 | `/gsd:plan-phase` |
| `gsd-executor` | 原子执行计划 | `/gsd:execute-phase` |
| `gsd-verifier` | 目标反向验证 | `/gsd:verify-work` |
| `gsd-debugger` | 科学方法调试 | `/gsd:debug` |
| `gsd-codebase-mapper` | 扫描并分析代码库 | `/gsd:map-codebase` |
| `gsd-nyquist-auditor` | 测试覆盖验证 | Phase 执行后 |
| `gsd-integration-checker` | 跨 Phase 集成检查 | 多 Phase 间 |

### GSD 常用命令

| 命令 | 用途 |
|------|------|
| `/gsd:new-project` | 初始化新项目（提问→研究→需求→路线图） |
| `/gsd:plan-phase N` | 为第 N 阶段创建执行计划 |
| `/gsd:execute-phase N` | 执行第 N 阶段 |
| `/gsd:progress` | 查看项目进度 |
| `/gsd:debug` | 科学调试 |
| `/gsd:verify-work` | 验证工作完成度 |
| `/gsd:quick` | 快速模式（跳过研究直接执行） |
| `/gsd:help` | 查看所有命令 |

---

## 学习路径

### 第一阶段：理解整体（1-2 天）

1. 阅读 `get-shit-done/README.zh-CN.md`
2. 浏览 `get-shit-done/agents/` 所有文件的前 50 行（了解 frontmatter 结构）
3. 阅读 `notes/architecture/gsd-framework-overview.md`
4. 查看 `demo-by-gsd/.planning/` 目录，理解实际产出

### 第二阶段：深入核心（3-5 天）

1. 精读 `gsd-executor.md`（489 行）—— 执行模型
2. 精读 `gsd-planner.md`（1309 行）—— 最复杂的代理
3. 精读 `gsd-debugger.md`（1257 行）—— 科学调试法
4. 阅读 `get-shit-done/get-shit-done/workflows/` —— 编排逻辑
5. 阅读 `hooks/gsd-context-monitor.js` —— 上下文管理

### 第三阶段：实践验证（持续）

1. 在 demo-by-gsd 中完成未完成的 Phase 4（部署）
2. 用 GSD 工作流创建自己的小项目
3. 将学到的设计模式记录到 `notes/reusable-designs/`

---

## 学习笔记已有内容

| 笔记 | 核心内容 |
|------|---------|
| `notes/gsd/Command与Workflow分层设计.md` | 命令层与工作流层的职责分离 |
| `notes/gsd/xml标签体系.md` | GSD 的 XML 结构化 Prompt 设计 |
| `notes/architecture/gsd-framework-overview.md` | 框架整体架构 |
| `notes/architecture/command-workflow-separation.md` | 命令-工作流分离机制 |
| `notes/gsd-analysis/yolo-mode-design.md` | YOLO 模式（自动化级别）设计 |
| `notes/gsd-analysis/context-lifecycle-timeline.md` | 上下文生命周期管理 |
| `notes/design/minimal-multi-agent-orchestration.md` | 极简多代理编排模式 |
| `notes/reusable-designs/XML标签结构化Prompt设计.md` | 可复用的 Prompt 设计 |
| `notes/reusable-designs/Hooks跨进程通信模式.md` | Hooks 进程间通信 |
| `notes/reusable-designs/init-variable-injection.md` | Init 变量注入模式 |

---

## 调试指南

### 常见问题

**`pnpm install` 失败**
```
原因: Node.js 版本不匹配
修复: nvm install 22 && nvm use 22
验证: node --version (应显示 v22+)
```

**`pnpm dev` 端口被占用**
```
原因: 4321 端口已有进程
修复: lsof -i :4321 找到进程并 kill，或等待自动切换端口
```

**GSD 命令无法识别**
```
原因: GSD 未安装到当前环境
修复: cd get-shit-done && npx get-shit-done-cc@latest
验证: 在 Claude Code 中输入 /gsd:help
```

### 有用的诊断命令

```bash
# 检查 demo 项目依赖状态
cd demo-by-gsd && pnpm ls --depth=0

# 运行 demo 测试
cd demo-by-gsd && pnpm test

# 查看 GSD 安装状态
ls ~/.claude/get-shit-done/ 2>/dev/null

# 查看项目 git 历史（按功能分类）
git log --oneline --grep="feat\|fix\|docs\|ci" | head -20
```

---

## 贡献指南

### 学习笔记规范

1. **存储路径**：`notes/{分类}/{主题}.md`
2. **命名规则**：使用中文，简洁描述内容
3. **格式模板**：
```markdown
# {主题}
> 一句话总结

## 问题
{想解决的问题}

## 答案
{提炼后的知识点}

## 代码示例（如有）
```

### 可复用设计记录

当发现好的设计模式时，记录到 `notes/reusable-designs/{设计名称}.md`，格式：
```markdown
# {设计名称}
**来源**：{项目名} / {具体文件}
**发现时间**：{日期}
**关键词**：{标签}

## 核心思想
{一句话}

## 设计要点
- 要点 1

## 代码示例
{核心代码}

## 可能的复用场景
- [ ] {项目}：{如何复用}
```

### Git 提交规范

查看 `git log --oneline` 了解已有风格：
- `feat: ...` — 新功能
- `fix: ...` — 修复
- `docs: ...` — 文档/笔记
- `ci: ...` — CI/CD
- `test: ...` — 测试

---

## 项目现状

| 部分 | 状态 | 说明 |
|------|------|------|
| GSD 源码 | 已克隆 (v1.22.4) | 完整框架代码，含中文翻译 |
| Demo 项目 | 90% 完成 | Phase 1-3 已完成，Phase 4（部署）进行中 |
| 学习笔记 | 进行中 | 约 20 篇笔记已写，CLAUDE.md 中的问题清单部分已回答 |
| 可复用设计 | 进行中 | 6 个设计已记录 |

---

*文档生成时间: 2026-04-04*
*基于 GSD v1.22.4*
