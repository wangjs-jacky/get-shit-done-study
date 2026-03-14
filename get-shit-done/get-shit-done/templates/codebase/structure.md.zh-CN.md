# 结构模板

用于 `.planning/codebase/STRUCTURE.md` - 捕获物理文件组织。

**目的：** 记录代码库中事物的物理位置。回答"我把X放在哪里？"

---

## 文件模板

```markdown
# 代码库结构

**分析日期：** [YYYY-MM-DD]

## 目录布局

[ASCII盒形绘制的顶级目录结构，使用├── └── │字符仅用于树结构]

```
[项目根]/
├── [目录]/          # [用途]
├── [目录]/          # [用途]
├── [目录]/          # [用途]
└── [文件]          # [用途]
```

## 目录用途

**[目录名称]:**
- 用途：[这里有什么]
- 包含：[文件类型：如"*.ts源文件", "组件目录"]
- 关键文件：[此目录中的重要文件]
- 子目录：[如果嵌套，描述结构]

**[目录名称]:**
- 用途：[这里有什么]
- 包含：[文件类型]
- 关键文件：[重要文件]
- 子目录：[结构]

## 关键文件位置

**入口点：**
- [路径]: [用途：如"CLI入口点"]
- [路径]: [用途：如"服务器启动"]

**配置：**
- [路径]: [用途：如"TypeScript配置"]
- [路径]: [用途：如"构建配置"]
- [路径]: [用途：如"环境变量"]

**核心逻辑：**
- [路径]: [用途：如"业务服务"]
- [路径]: [用途：如"数据库模型"]
- [路径]: [用途：如"API路由"]

**测试：**
- [路径]: [用途：如"单元测试"]
- [路径]: [用途：如"测试夹具"]

**文档：**
- [路径]: [用途：如"面向用户的文档"]
- [路径]: [用途：如"开发者指南"]

## 命名约定

**文件：**
- [模式]: [示例：如"模块使用kebab-case.ts"]
- [模式]: [示例：如"React组件使用PascalCase.tsx"]
- [模式]: [示例：如"*.test.ts用于测试文件"]

**目录：**
- [模式]: [示例：如"功能目录使用kebab-case"]
- [模式]: [示例：如"集合使用复数名称"]

**特殊模式：**
- [模式]: [示例：如"index.ts用于目录导出"]
- [模式]: [示例：如"__tests__用于测试目录"]

## 添加新代码的位置

**新功能：**
- 主要代码：[目录路径]
- 测试：[目录路径]
- 如需要配置：[目录路径]

**新组件/模块：**
- 实现：[目录路径]
- 类型：[目录路径]
- 测试：[目录路径]

**新路由/命令：**
- 定义：[目录路径]
- 处理器：[目录路径]
- 测试：[目录路径]

**工具：**
- 共享辅助程序：[目录路径]
- 类型定义：[目录路径]

## 特殊目录

[任何有特殊含义或生成的目录]

**[目录]:**
- 用途：[如"生成的代码", "构建输出"]
- 来源：[如"由X自动生成", "构建工件"]
- 已提交：[是/否 - 在.gitignore中？]

---

*结构分析：[日期]*
*目录结构变化时更新*
```

<good_examples>
```markdown
# 代码库结构

**分析日期：** 2025-01-20

## 目录布局

```
get-shit-done/
├── bin/                # 可执行入口点
├── commands/           # 斜杠命令定义
│   └── gsd/           # GSD特定命令
├── get-shit-done/     # 技能资源
│   ├── references/    # 原则文档
│   ├── templates/     # 文件模板
│   └── workflows/     # 多步骤程序
├── src/               # 源代码（如适用）
├── tests/             # 测试文件
├── package.json       # 项目清单
└── README.md          # 用户文档
```

## 目录用途

**bin/**
- 用途：CLI入口点
- 包含：install.js（安装脚本）
- 关键文件：install.js - 处理npx安装
- 子目录：无

**commands/gsd/**
- 用途：Claude Code的斜杠命令定义
- 包含：*.md文件（每个命令一个）
- 关键文件：new-project.md, plan-phase.md, execute-plan.md
- 子目录：无（平面结构）

**get-shit-done/references/**
- 用途：核心原则和指导文档
- 包含：principles.md, questioning.md, plan-format.md
- 关键文件：principles.md - 系统理念
- 子目录：无

**get-shit-done/templates/**
- 用途：.planning/文件的文档模板
- 包含：带frontmatter的模板定义
- 关键文件：project.md, roadmap.md, plan.md, summary.md
- 子目录：codebase/（新的 - 用于栈/架构/结构模板）

**get-shit-done/workflows/**
- 用途：可重用的多步骤程序
- 包含：命令调用的工作流定义
- 关键文件：execute-plan.md, research-phase.md
- 子目录：无

## 关键文件位置

**入口点：**
- `bin/install.js` - 安装脚本（npx入口）

**配置：**
- `package.json` - 项目元数据、依赖、bin入口
- `.gitignore` - 排除的文件

**核心逻辑：**
- `bin/install.js` - 所有安装逻辑（文件复制、路径替换）

**测试：**
- `tests/` - 测试文件（如存在）

**文档：**
- `README.md` - 面向用户的安装和使用指南
- `CLAUDE.md` - 在此仓库中工作时Claude Code的指令

## 命名约定

**文件：**
- kebab-case.md：Markdown文档
- kebab-case.js：JavaScript源文件
- UPPERCASE.md：重要项目文件（README、CLAUDE、CHANGELOG）

**目录：**
- kebab-case：所有目录
- 集合使用复数：templates/、commands/、workflows/

**特殊模式：**
- {command-name}.md：斜杠命令定义
- *-template.md：可以使用但优先templates/目录

## 添加新代码的位置

**新斜杠命令：**
- 主要代码：`commands/gsd/{command-name}.md`
- 测试：`tests/commands/{command-name}.test.js`（如实现测试）
- 文档：在`README.md`中更新新命令

**新模板：**
- 实现：`get-shit-done/templates/{name}.md`
- 文档：模板自文档化（包含指南）

**新工作流：**
- 实现：`get-shit-done/workflows/{name}.md`
- 用法：从命令引用`@~/.claude/get-shit-done/workflows/{name}.md`

**新参考文档：**
- 实现：`get-shit-done/references/{name}.md`
- 用法：根据需要从命令/工作流引用

**工具：**
- 当前无工具（`install.js`是单体的）
- 如提取：`src/utils/`

## 特殊目录

**get-shit-done/**
- 用途：安装到~/.claude/的资源
- 来源：安装期间由bin/install.js复制
- 已提交：是（事实来源）

**commands/**
- 用途：安装到~/.claude/commands/的斜杠命令
- 来源：安装期间由bin/install.js复制
- 已提交：是（事实来源）

---

*结构分析：2025-01-20*
*目录结构变化时更新*
```
</good_examples>

<guidelines>
**STRUCTURE.md中应包含的内容：**
- 目录布局（ASCII盒形绘制的树形结构用于结构可视化）
- 每个目录的用途
- 关键文件位置（入口点、配置、核心逻辑）
- 命名约定
- 添加新代码的位置（按类型）
- 特殊/生成的目录

**这里不应包含的内容：**
- 概念架构（那是ARCHITECTURE.md）
- 技术栈（那是STACK.md）
- 代码实现细节（ defer到代码读取）
- 每个单个文件（专注于目录和关键文件）

**填写此模板时：**
- 使用`tree -L 2`或类似工具可视化结构
- 识别顶级目录及其用途
- 通过观察现有文件注意命名模式
- 定位入口点、配置和主要逻辑区域
- 保持目录树简洁（最多2-3级）

**树格式（ASCII盒形字符仅用于结构）：**
```
根/
├── dir1/           # 用途
│   ├── subdir/    # 用途
│   └── file.ts    # 用途
├── dir2/          # 用途
└── file.ts        # 用途
```

**阶段规划时有用：**
- 添加新功能（文件应该去哪里？）
- 理解项目组织
- 找到特定逻辑的位置
- 遵循现有约定
</guidelines>