# GSD 学习项目 - 外包人员 Onboarding 指南

> 面向外包/外部协作者：明确工作范围、禁止操作、提交规范和交付验证清单。请务必在开始工作前完整阅读本文档。

---

## 一、项目概述

这是一个**学习研究项目**，用于深入分析 [get-shit-done (GSD)](https://github.com/discreteprojects/get-shit-done) 框架的架构设计和实现模式。项目包含三部分：

| 部分 | 目录 | 说明 |
|------|------|------|
| GSD 框架源码 | `get-shit-done/` | 框架的完整源代码（只读参考，不要修改） |
| 演示项目 | `demo-by-gsd/` | 使用 GSD 工作流开发的前端展示应用 |
| 学习笔记 | `notes/` | 对 GSD 框架的研究笔记和设计模式记录 |

**在线演示**：https://wangjs-jacky.github.io/get-shit-done-study/

---

## 二、工作范围边界

### 2.1 允许修改的目录

你**只被允许**修改以下目录中的文件：

```
demo-by-gsd/
├── src/                    # 前端源代码（主要工作区域）
│   ├── components/         # React 组件
│   ├── pages/              # 页面
│   ├── styles/             # 样式文件
│   └── utils/              # 工具函数
├── public/                 # 静态资源
├── tests/                  # 测试文件（如有）
├── astro.config.mjs        # Astro 配置（需确认后修改）
└── tsconfig.json           # TypeScript 配置（需确认后修改）

notes/
├── gsd/                    # GSD 概念笔记
├── architecture/           # 架构笔记
├── design/                 # 设计模式笔记
├── gsd-analysis/           # 深度分析笔记
├── reusable-designs/       # 可复用设计
├── commands/               # 命令分析笔记
└── claude-code/            # Claude Code 相关笔记
```

### 2.2 只读目录（禁止修改）

以下目录**仅供阅读参考**，不得修改：

```
get-shit-done/              # GSD 框架源码 -- 完整只读
├── agents/                 # 12 个代理定义
├── commands/               # 40+ 命令定义
├── hooks/                  # 3 个钩子脚本
├── bin/                    # 安装器（88KB）
├── get-shit-done/          # 部署文件（workflows/templates/references）
├── tests/                  # 测试文件
└── scripts/                # 构建脚本
```

### 2.3 项目级配置文件（需确认后修改）

以下文件修改前**必须获得项目负责人确认**：

| 文件 | 说明 | 修改风险 |
|------|------|----------|
| `CLAUDE.md` | 项目指令和学习目标 | 高 -- 影响所有协作者 |
| `README.md` / `README_CN.md` | 项目说明 | 中 -- 影响项目形象 |
| `.github/workflows/` | CI/CD 配置 | 高 -- 影响自动部署 |
| `docs/ONBOARDING.md` | 项目 Onboarding | 中 -- 影响新成员 |
| `demo-by-gsd/package.json` | 依赖声明 | 中 -- 影响构建 |
| `demo-by-gsd/vitest.config.ts` | 测试配置 | 低 -- 只影响测试 |

---

## 三、禁止操作清单

### 3.1 Git 相关（绝对禁止）

| 编号 | 禁止操作 | 原因 |
|------|----------|------|
| G-01 | **禁止直接推送到 `main` 分支** | 所有改动必须通过 PR 合入 |
| G-02 | **禁止 `git push --force`** | 会覆盖他人的提交历史 |
| G-03 | **禁止修改 `get-shit-done/` 目录下的任何文件** | 这是上游框架的只读副本 |
| G-04 | **禁止修改 `.gitignore`** | 可能导致敏感文件被追踪 |
| G-05 | **禁止删除其他人的分支** | 可能导致工作丢失 |
| G-06 | **禁止使用 `git rebase` 修改已推送的提交** | 破坏协作历史 |

### 3.2 代码相关（绝对禁止）

| 编号 | 禁止操作 | 原因 |
|------|----------|------|
| C-01 | **禁止修改 GSD 框架源码** | `get-shit-done/` 目录完全只读 |
| C-02 | **禁止在代码/注释/文档中包含公司属性内容** | 参见 CLAUDE.md 中的"严禁公司属性内容"规则 |
| C-03 | **禁止提交 `.env`、密钥、凭证等敏感文件** | 安全红线 |
| C-04 | **禁止修改 `demo-by-gsd/.planning/` 下的规划文件** | 这些是 GSD 自动生成的，手动修改会导致状态不一致 |
| C-05 | **禁止安装未经确认的新依赖** | 需要安全审查 |

### 3.3 笔记相关（需遵守规范）

| 编号 | 规则 | 原因 |
|------|------|------|
| N-01 | 笔记必须放到 `notes/` 对应子目录下 | 保持笔记组织有序 |
| N-02 | 笔记文件名使用中文，简洁描述内容 | 与现有笔记风格一致 |
| N-03 | 笔记遵循项目定义的模板格式 | 参见 CLAUDE.md 中的"对话知识实时归档"章节 |
| N-04 | 可复用设计放到 `notes/reusable-designs/` | 与现有设计记录风格一致 |
| N-05 | 不要修改他人已有的笔记内容 | 如有补充，新增文件或在末尾追加 |

---

## 四、提交规范

### 4.1 Commit Message 格式

所有提交信息必须遵循以下格式：

```
<type>(<scope>): <subject>
```

**类型（type）**：

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(demo): add dark mode toggle` |
| `fix` | 修复 Bug | `fix(demo): resolve layout overflow on mobile` |
| `docs` | 文档/笔记 | `docs(notes): add GSD agent orchestration analysis` |
| `refactor` | 重构（不改功能） | `refactor(demo): extract shared button component` |
| `test` | 测试相关 | `test(demo): add unit tests for theme switcher` |
| `style` | 样式调整 | `style(demo): update card hover effect` |
| `ci` | CI/CD | `ci: update deployment workflow` |
| `chore` | 杂项 | `chore(demo): update dependencies` |

**范围（scope）**：

| 范围 | 说明 |
|------|------|
| `demo` | demo-by-gsd 项目的改动 |
| `notes` | 学习笔记的改动 |
| `docs` | 文档的改动（非笔记） |
| `ci` | CI/CD 相关 |

**示例**：

```bash
# 好的提交
git commit -m "feat(demo): add responsive navigation component"
git commit -m "docs(notes): analyze GSD wave parallelization pattern"
git commit -m "fix(demo): resolve Astro build error with dynamic imports"

# 不好的提交
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "wip"
```

### 4.2 分支命名规范

所有工作必须在独立分支上完成：

```
<type>/<scope>-<short-description>
```

| 类型 | 示例 |
|------|------|
| `feat/` | `feat/demo-responsive-nav` |
| `fix/` | `fix/demo-mobile-layout` |
| `docs/` | `docs/notes-agent-patterns` |
| `refactor/` | `refactor/demo-component-structure` |

### 4.3 PR 模板

提交 PR 时，使用以下模板：

```markdown
## 变更类型

- [ ] feat (新功能)
- [ ] fix (修复)
- [ ] docs (文档/笔记)
- [ ] refactor (重构)
- [ ] test (测试)
- [ ] style (样式)
- [ ] ci/chore (基础设施)

## 变更说明

<!-- 简要描述做了什么，为什么做 -->

## 改动范围

<!-- 列出修改的文件/目录 -->

## 测试

- [ ] `cd demo-by-gsd && pnpm build` 构建通过
- [ ] `cd demo-by-gsd && pnpm test` 测试通过（如有测试）
- [ ] 本地 `pnpm dev` 验证功能正常

## 截图（如涉及 UI 变更）

<!-- 前后对比截图 -->

## 检查清单

- [ ] 未修改 `get-shit-done/` 目录下的任何文件
- [ ] 未修改 `.planning/` 下的规划文件
- [ ] 未在代码中包含公司属性内容
- [ ] 未提交敏感文件（.env、密钥等）
- [ ] 未安装未经确认的新依赖
- [ ] Commit message 符合规范
- [ ] 笔记文件（如有）放到 `notes/` 对应目录
```

---

## 五、开发环境设置

### 5.1 前置条件

| 工具 | 版本要求 | 安装方式 |
|------|----------|----------|
| Node.js | >= 22.12.0 | `nvm install 22` |
| pnpm | 最新 | `corepack enable && corepack prepare pnpm@latest` |
| Git | 任意 | 系统自带 |

### 5.2 设置步骤

```bash
# 1. 克隆仓库
git clone https://github.com/wangjs-jacky/get-shit-done-study.git
cd get-shit-done-study

# 2. 创建工作分支
git checkout -b feat/your-task-name

# 3. 安装 Demo 项目依赖
cd demo-by-gsd
pnpm install

# 4. 启动开发服务器
pnpm dev
# 打开 http://localhost:4321 验证

# 5. 运行测试
pnpm test
```

### 5.3 常用命令

```bash
# 在 demo-by-gsd/ 目录下
pnpm dev           # 启动开发服务器
pnpm build         # 生产构建
pnpm preview       # 预览生产构建
pnpm test          # 运行测试
pnpm test:watch    # 监听模式运行测试
```

---

## 六、验证清单（交付前必须检查）

在提交 PR 之前，**逐项确认以下清单**。任何一项未通过都不应提交。

### 6.1 构建验证

| 编号 | 检查项 | 验证命令 | 预期结果 |
|------|--------|----------|----------|
| V-01 | Demo 项目构建通过 | `cd demo-by-gsd && pnpm build` | 无错误，输出 dist/ 目录 |
| V-02 | 测试通过 | `cd demo-by-gsd && pnpm test` | 所有测试通过 |
| V-03 | 无 TypeScript 错误 | `cd demo-by-gsd && npx tsc --noEmit` | 无错误输出 |
| V-04 | 开发服务器可启动 | `cd demo-by-gsd && pnpm dev` | http://localhost:4321 可访问 |

### 6.2 文件验证

| 编号 | 检查项 | 验证方式 | 预期结果 |
|------|--------|----------|----------|
| V-05 | 未修改 `get-shit-done/` | `git diff --name-only main` | 不包含 `get-shit-done/` 路径 |
| V-06 | 未修改 `.planning/` | `git diff --name-only main` | 不包含 `.planning/` 路径 |
| V-07 | 未包含敏感文件 | `git diff --staged --name-only` | 不包含 `.env`、`*.key`、`*.pem` |
| V-08 | 未包含公司属性内容 | 代码审查 | 无公司名称、内部工具名 |
| V-09 | 笔记在正确目录 | 文件检查 | 在 `notes/` 对应子目录下 |

### 6.3 Git 验证

| 编号 | 检查项 | 验证方式 | 预期结果 |
|------|--------|----------|----------|
| V-10 | 分支名正确 | `git branch --show-current` | 符合 `<type>/<scope>-<desc>` 格式 |
| V-11 | 基于 main 的最新状态 | `git log main..HEAD --oneline` | 不包含过时的提交 |
| V-12 | Commit message 规范 | `git log --oneline -10` | 符合 `<type>(<scope>): <subject>` 格式 |
| V-13 | 无合并冲突 | `git merge --no-commit --no-ff main` 然后 `git merge --abort` | 无冲突 |

### 6.4 功能验证（如涉及 UI）

| 编号 | 检查项 | 验证方式 |
|------|--------|----------|
| V-15 | 桌面端显示正常 | 浏览器 1280px+ 宽度 |
| V-16 | 移动端显示正常 | 浏览器 375px 宽度 |
| V-17 | 交互功能正常 | 点击、滚动、表单等 |
| V-18 | 无控制台错误 | 浏览器 DevTools Console 无红色错误 |

---

## 七、常见问题

**Q：我发现 `get-shit-done/` 目录下有 Bug 或可以改进的地方，该怎么办？**

A：不要在本项目中修改。GSD 是上游开源项目，请到 [GSD 官方仓库](https://github.com/discreteprojects/get-shit-done) 提 Issue 或 PR。在本项目中，你可以在 `notes/` 下记录你的发现。

**Q：`demo-by-gsd/.planning/` 下的文件看起来需要更新，我能修改吗？**

A：不能手动修改。这些文件是 GSD 工作流自动生成的。如果你认为需要更新，请联系项目负责人讨论。

**Q：我需要安装新的 npm 包来完成工作，怎么办？**

A：先在 PR 描述中说明需要安装什么包以及为什么。获得确认后再修改 `package.json` 并提交。优先使用项目已有的依赖：

| 需求 | 已有依赖 |
|------|----------|
| UI 组件 | React 19 |
| 样式 | Tailwind CSS 4 |
| 图标 | 使用 SVG 或 CSS |
| 动画 | CSS 动画或 `@tailwindcss/vite` 内置支持 |
| 测试 | Vitest + Testing Library |

**Q：笔记应该写中文还是英文？**

A：中文。项目所有笔记都使用中文编写，与 CLAUDE.md 中的语言要求一致。

**Q：我遇到了问题，应该联系谁？**

A：在 GitHub 上开 Issue，或者通过 PR 描述中的注释提出问题。

---

## 八、快速参考

### 项目结构速查

```
get-shit-done-study/
├── get-shit-done/          # [只读] GSD 框架源码
├── demo-by-gsd/            # [可修改] 演示项目
│   ├── src/                # 主要工作区域
│   ├── public/             # 静态资源
│   ├── .planning/          # [只读] GSD 规划文件
│   └── package.json        # [需确认] 依赖声明
├── notes/                  # [可修改] 学习笔记
├── docs/                   # [需确认] 项目文档
├── .github/workflows/      # [只读] CI/CD
├── CLAUDE.md               # [只读] 项目指令
└── README.md               # [需确认] 项目说明
```

### 关键命令速查

```bash
# 开发
cd demo-by-gsd && pnpm dev

# 构建
cd demo-by-gsd && pnpm build

# 测试
cd demo-by-gsd && pnpm test

# 类型检查
cd demo-by-gsd && npx tsc --noEmit

# 查看改动范围
git diff --name-only main

# 提交
git add <specific-files>
git commit -m "type(scope): subject"
git push origin <branch-name>
```

### 禁止操作速查

| 不要做 | 说明 |
|--------|------|
| `git push origin main` | 禁止推 main |
| `git push --force` | 禁止强制推送 |
| 修改 `get-shit-done/` | 只读目录 |
| 修改 `.planning/` | 自动生成文件 |
| 提交 `.env` / 密钥 | 安全红线 |
| 包含公司属性内容 | 隐私要求 |
| 未确认安装新依赖 | 安全审查 |

---

*文档生成时间: 2026-04-04*
*基于 GSD v1.22.4*
