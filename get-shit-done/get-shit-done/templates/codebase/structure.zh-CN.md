# 结构模板

用于 `.planning/codebase/STRUCTURE.md` 的模板 - 记录物理文件组织。

**目的:** 记录代码库中事物的物理位置。回答"我把 X 放在什么地方？"

---

## 文件模板

```markdown
# 代码库结构

**分析日期:** [YYYY-MM-DD]

## 目录布局

[使用 ├── └── │ 字符进行 ASCII 框图树形结构的顶级目录及用途]

```
[项目根目录]/
├── [目录]/          # [用途]
├── [目录]/          # [用途]
├── [目录]/          # [用途]
└── [文件]          # [用途]
```

## 目录用途

**[目录名称]:**
- 用途: [这里存放什么]
- 包含: [文件类型: 例如，"*.ts 源文件"、"组件目录"]
- 关键文件: [此目录中的重要文件]
- 子目录: [如果嵌套，描述结构]

**[目录名称]:**
- 用途: [这里存放什么]
- 包含: [文件类型]
- 关键文件: [重要文件]
- 子目录: [结构]

## 关键文件位置

**入口点:**
- [路径]: [用途: 例如，"CLI 入口点"]
- [路径]: [用途: 例如，"服务器启动"]

**配置:**
- [路径]: [用途: 例如，"TypeScript 配置"]
- [路径]: [用途: 例如，"构建配置"]
- [路径]: [用途: 例如，"环境变量"]

**核心逻辑:**
- [路径]: [用途: 例如，"业务服务"]
- [路径]: [用途: 例如，"数据库模型"]
- [路径]: [用途: 例如，"API 路由"]

**测试:**
- [路径]: [用途: 例如，"单元测试"]
- [路径]: [用途: 例如，"测试装置"]

**文档:**
- [路径]: [用途: 例如，"面向用户的文档"]
- [路径]: [用途: 例如，"开发者指南"]

## 命名约定

**文件:**
- [模式]: [示例: 例如，"kebab-case.ts 用于模块"]
- [模式]: [示例: 例如，"PascalCase.tsx 用于 React 组件"]
- [模式]: [示例: 例如，"*.test.ts 用于测试文件"]

**目录:**
- [模式]: [示例: 例如，"功能目录使用 kebab-case"]
- [模式]: [示例: 例如，"集合使用复数名称"]

**特殊模式:**
- [模式]: [示例: 例如，"index.ts 用于目录导出"]
- [模式]: [示例: 例如，"__tests__ 用于测试目录"]

## 在哪里添加新代码

**新功能:**
- 主要代码: [目录路径]
- 测试: [目录路径]
- 如需配置: [目录路径]

**新组件/模块:**
- 实现: [目录路径]
- 类型: [目录路径]
- 测试: [目录路径]

**新路由/命令:**
- 定义: [目录路径]
- 处理器: [目录路径]
- 测试: [目录路径]

**工具:**
- 共享助手: [目录路径]
- 类型定义: [目录路径]

## 特殊目录

[具有特殊意义或生成的任何目录]

**[目录]:**
- 用途: [例如，"生成的代码"、"构建输出"]
- 来源: [例如，"由 X 自动生成"、"构建工件"]
- 已提交: [是/否 - 在 .gitignore 中？]

---

*结构分析: [日期]*
*在目录结构变更时更新*
```

<good_examples>
```markdown
# 代码库结构

**分析日期:** 2025-01-20

## 目录布局

```
get-shit-done/
├── bin/                # 可执行入口点
├── commands/           # 斜杠命令定义
│   └── gsd/           # GSD 特定命令
├── get-shit-done/     # 技能资源
│   ├── references/    # 原则文档
│   ├── templates/     # 文件模板
│   └── workflows/     # 多步骤流程
├── src/               # 源代码（如适用）
├── tests/             # 测试文件
├── package.json       # 项目清单
└── README.md          # 用户文档
```

## 目录用途

**bin/**
- 用途: CLI 入口点
- 包含: install.js（安装脚本）
- 关键文件: install.js - 处理 npx 安装
- 子目录: 无

**commands/gsd/**
- 用途: Claude Code 的斜杠命令定义
- 包含: *.md 文件（每个命令一个）
- 关键文件: new-project.md、plan-phase.md、execute-plan.md
- 子目录: 无（平面结构）

**get-shit-done/references/**
- 用途: 核心原则和指导文档
- 包含: principles.md、questioning.md、plan-format.md
- 关键文件: principles.md - 系统原则
- 子目录: 无

**get-shit-done/templates/**
- 用途: .planning/ 文件的文档模板
- 包含: 带有 frontmatter 的模板定义
- 关键文件: project.md、roadmap.md、plan.md、summary.md
- 子目录: codebase/（新的 - 用于 stack/architecture/structure 模板）

**get-shit-done/workflows/**
- 用途: 可重用的多步骤流程
- 包含: 命令调用的流程定义
- 关键文件: execute-plan.md、research-phase.md
- 子目录: 无

## 关键文件位置

**入口点:**
- `bin/install.js` - 安装脚本（npx 入口）

**配置:**
- `package.json` - 项目元数据、依赖、bin 入口
- `.gitignore` - 排除的文件

**核心逻辑:**
- `bin/install.js` - 所有安装逻辑（文件复制、路径替换）

**测试:**
- `tests/` - 测试文件（如存在）

**文档:**
- `README.md` - 面向用户的安装和使用指南
- `CLAUDE.md` - Claude Code 在此仓库中工作时的指令

## 命名约定

**文件:**
- kebab-case.md: Markdown 文档
- kebab-case.js: JavaScript 源文件
- UPPERCASE.md: 重要项目文件（README、CLAUDE、CHANGELOG）

**目录:**
- kebab-case: 所有目录
- 集合使用复数：templates/、commands/、workflows/

**特殊模式:**
- {command-name}.md: 斜杠命令定义
- *-template.md：可以使用但优先使用 templates/ 目录

## 在哪里添加新代码

**新斜杠命令:**
- 主要代码: `commands/gsd/{command-name}.md`
- 测试: `tests/commands/{command-name}.test.js`（如实现测试）
- 文档: 更新 `README.md` 以包含新命令

**新模板:**
- 实现: `get-shit-done/templates/{name}.md`
- 文档: 模板是自文档化的（包含指导）

**新流程:**
- 实现: `get-shit-done/workflows/{name}.md`
- 用法: 从命令中引用 `@~/.claude/get-shit-done/workflows/{name}.md`

**新参考文档:**
- 实现: `get-shit-done/references/{name}.md`
- 用法: 根据需要从命令/流程中引用

**工具:**
- 目前没有工具（`install.js` 是单体）
- 如果提取: `src/utils/`

## 特殊目录

**get-shit-done/**
- 用途: 安装到 ~/.claude/ 的资源
- 来源: 由 bin/install.js 在安装期间复制
- 已提交: 是（事实来源）

**commands/**
- 用途: 安装到 ~/.claude/commands/ 的斜杠命令
- 来源: 由 bin/install.js 在安装期间复制
- 已提交: 是（事实来源）

---

*结构分析: 2025-01-20*
*在目录结构变更时更新*
```
</good_examples>

<guidelines>
**STRUCTURE.md 应包含的内容:**
- 目录布局（ASCII 框图树形结构用于结构可视化）
- 每个目录的用途
- 关键文件位置（入口点、配置、核心逻辑）
- 命名约定
- 在哪里添加新代码（按类型）
- 特殊/生成的目录

**这里不应包含的内容:**
- 概念架构（那是 ARCHITECTURE.md）
- 技术栈（那是 STACK.md）
- 代码实现细节（ defer to code reading）
- 每个文件（专注于目录和关键文件）

**填写此模板时:**
- 使用 `tree -L 2` 或类似工具来可视化结构
- 识别顶级目录及其用途
- 通过观察现有文件注意命名模式
- 定位入口点、配置和主要逻辑区域
- 保持目录树简洁（最多 2-3 层）

**树格式（ASCII 框图字符仅用于结构）:**
```
root/
├── dir1/           # 用途
│   ├── subdir/    # 用途
│   └── file.ts    # 用途
├── dir2/          # 用途
└── file.ts        # 用途
```

**在阶段规划中用途:**
- 添加新功能（文件应该放在哪里？）
- 理解项目组织
- 找到特定逻辑的位置
- 遵循现有约定
</guidelines>
