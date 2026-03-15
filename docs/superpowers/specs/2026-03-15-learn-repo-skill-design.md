# Learn Repo Skill 设计文档

**创建时间**: 2026-03-15
**状态**: Draft
**目标**: 创建一个 skill 用于初始化 GitHub 仓库学习项目

## 1. 概述

### 1.1 问题陈述

学习新的 GitHub 仓库时，需要重复执行以下步骤：
1. 创建学习项目目录
2. 克隆目标仓库
3. 删除 .git 目录（使其成为学习项目而非 fork）
4. 创建学习笔记结构
5. 编写定制化的 CLAUDE.md

### 1.2 解决方案

创建 `/learn-repo` skill，通过一条命令完成所有初始化工作，并根据仓库内容**智能生成**学习问题和分类。

### 1.3 核心价值

- **零交互**：执行一次完成所有步骤
- **智能分析**：文档优先 + 代码扫描，自动生成定制化学习问题
- **可复用**：标准化学习项目结构，便于知识沉淀

## 2. 功能需求

### 2.1 输入格式

支持多种 URL 格式，智能提取仓库名：

| 输入格式 | 提取结果 |
|----------|----------|
| `https://github.com/ruvnet/ruflo.git` | `ruflo` |
| `https://github.com/ruvnet/ruflo` | `ruflo` |
| `ruvnet/ruflo` | `ruflo` |

### 2.2 执行流程

```
输入: /learn-repo <url>

1. 解析 URL，提取仓库名
2. 确定目标目录：{GITHUB_PROJECTS_DIR}/{name}-study
3. 调用辅助脚本：
   - 克隆仓库
   - 删除 .git 目录
   - 创建 .notes/ 空目录
   - 初始化新 Git 仓库
4. 分析仓库内容：
   - 读取文档（README、docs/、Wiki）
   - 扫描核心代码目录
   - 识别关键模式和概念
5. 生成 CLAUDE.md：
   - 项目定位
   - 学习目标（自动推断分类）
   - 问题驱动学习（自动生成问题）
   - 对话知识归档规则
6. 输出完成提示
```

### 2.3 配置依赖

| 配置变量 | 说明 | 来源 |
|----------|------|------|
| `GITHUB_PROJECTS_DIR` | GitHub 项目存放目录 | 全局 CLAUDE.md 或用户输入 |

## 3. 技术设计

### 3.1 文件结构

```
jacky-skills/
└── learn-repo/
    ├── SKILL.md           # 主 skill 文件
    └── init-study-repo.sh # 辅助脚本
```

### 3.2 职责划分

#### init-study-repo.sh

**职责**：文件系统操作

- 解析 Git URL，提取仓库名
- 克隆仓库到指定目录
- 删除 .git 目录
- 创建 .notes/ 目录
- 初始化新 Git 仓库
- 创建初始 .gitignore

**输入参数**：
```bash
./init-study-repo.sh <repo_url> <target_dir>
```

**输出**：
- 成功：目标目录路径
- 失败：错误信息

#### SKILL.md

**职责**：智能分析和内容生成

1. 解析用户输入的 URL
2. 读取配置或提示用户
3. 调用辅助脚本
4. 分析仓库内容
5. 生成定制化 CLAUDE.md

### 3.3 仓库分析策略

#### 文档优先

1. 读取 README.md（如有中文版优先）
2. 扫描 docs/ 目录
3. 查找 CONTRIBUTING.md、ARCHITECTURE.md 等

#### 代码扫描

1. 分析目录结构，识别核心组件
2. 扫描 package.json / Cargo.toml 等依赖文件
3. 识别关键模式：
   - Agent 定义（agents/ 目录）
   - 命令/工具（commands/、tools/）
   - Hooks（hooks/）
   - 配置文件模式

### 3.4 CLAUDE.md 生成模板

```markdown
# CLAUDE.md - {仓库名} 学习项目

## 项目定位

本项目用于**深入学习 {仓库描述}**。

## 学习目标

### 1. {自动推断分类1}

- {自动生成的问题1}
- {自动生成的问题2}

### 2. {自动推断分类2}

- {自动生成的问题3}
- {自动生成的问题4}

...

## 学习方法

1. **问题先行**：阅读源码前先列出想解决的问题
2. **阅读源码**：带着问题去代码目录寻找答案
3. **笔记记录**：将每个问题的答案记录到 `.notes/` 目录

## 参考资源

- [GitHub 仓库]({原始URL})

---

## 对话知识实时归档

{标准归档规则}
```

### 3.5 错误处理

| 场景 | 处理方式 |
|------|----------|
| URL 格式无效 | 提示正确格式 |
| 仓库不存在 | 提示检查 URL |
| 目标目录已存在 | 询问是否覆盖 |
| Git 克隆失败 | 提示网络问题，建议配置代理 |
| 配置变量未定义 | 提示用户配置或输入路径 |

## 4. 使用示例

### 基本使用

```
用户: /learn-repo https://github.com/ruvnet/ruflo

AI: 正在初始化 ruflo 学习项目...
    ✓ 克隆仓库到 ~/jacky-github/ruflo-study
    ✓ 删除 .git 目录
    ✓ 创建 .notes/ 目录
    ✓ 初始化 Git 仓库
    ✓ 分析仓库内容
    ✓ 生成 CLAUDE.md

    学习项目已准备就绪！
    运行 `cd ~/jacky-github/ruflo-study` 开始学习。
```

### 短格式

```
用户: /learn-repo ruvnet/ruflo
```

## 5. 后续扩展

- [ ] 支持私有仓库（通过 GitHub Token）
- [ ] 支持指定分支
- [ ] 支持增量更新（重新分析并更新 CLAUDE.md）
- [ ] 生成学习路线图

## 6. 参考实现

当前 get-shit-done-study 仓库的结构作为模板参考：
- `.notes/` 目录结构
- CLAUDE.md 中的归档规则
- 问题驱动学习的分类方式
