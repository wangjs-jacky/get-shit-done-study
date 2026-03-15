# Learn Repo Skill 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个 `/learn-repo` skill，通过一条命令完成 GitHub 仓库学习项目的初始化，包括克隆、翻译文档、智能分析、生成定制化 CLAUDE.md。

**Architecture:** 采用 Skill + 辅助脚本的模式。Shell 脚本负责文件系统操作（克隆、删除 .git、初始化），SKILL.md 负责智能分析和内容生成。

**Tech Stack:** Shell (bash)、Claude Code Skill 系统、parallel-translation skill

---

## 文件结构

```
jacky-skills/
└── plugins/
    └── learning-tools/           # 新建：学习工具分类
        └── learn-repo/
            ├── SKILL.md          # 主 skill 文件
            └── init-study-repo.sh # 辅助脚本
```

---

## Chunk 1: 辅助脚本实现

### Task 1: 创建 init-study-repo.sh 脚本

**Files:**
- Create: `/Users/jiashengwang/jacky-github/jacky-skills/plugins/learning-tools/learn-repo/init-study-repo.sh`

- [ ] **Step 1: 创建 learning-tools 目录结构**

```bash
mkdir -p /Users/jiashengwang/jacky-github/jacky-skills/plugins/learning-tools/learn-repo
```

- [ ] **Step 2: 编写 init-study-repo.sh 脚本**

```bash
#!/bin/bash
# init-study-repo.sh - 初始化学习仓库的辅助脚本
# 用法: ./init-study-repo.sh <repo_url> <target_dir>

set -e

REPO_URL="$1"
TARGET_DIR="$2"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 参数检查
if [ -z "$REPO_URL" ] || [ -z "$TARGET_DIR" ]; then
    error "用法: $0 <repo_url> <target_dir>"
fi

# 提取仓库名
extract_repo_name() {
    local url="$1"
    # 处理多种格式:
    # https://github.com/owner/repo.git -> repo
    # https://github.com/owner/repo -> repo
    # owner/repo -> repo
    local name
    if [[ "$url" =~ ^https?:// ]]; then
        name=$(echo "$url" | sed 's/\.git$//' | sed 's/.*\///')
    else
        name=$(echo "$url" | sed 's/.*\///')
    fi
    echo "$name"
}

REPO_NAME=$(extract_repo_name "$REPO_URL")

info "仓库名: $REPO_NAME"
info "目标目录: $TARGET_DIR"

# 检查目标目录是否存在
if [ -d "$TARGET_DIR" ]; then
    error "目标目录已存在: $TARGET_DIR"
fi

# 克隆仓库
info "克隆仓库..."
if ! git clone "$REPO_URL" "$TARGET_DIR"; then
    error "克隆失败，请检查 URL 或网络连接"
fi

# 进入目标目录
cd "$TARGET_DIR"

# 删除 .git 目录
info "删除 .git 目录..."
rm -rf .git

# 创建 .notes 目录
info "创建 .notes 目录..."
mkdir -p .notes

# 创建初始 .gitignore
info "创建 .gitignore..."
cat > .gitignore << 'EOF'
# macOS
.DS_Store

# 编辑器
.idea/
.vscode/
*.swp
*.swo

# 依赖目录
node_modules/

# 构建产物
dist/
build/

# 日志
*.log
EOF

# 初始化新 Git 仓库
info "初始化新 Git 仓库..."
git init
git add .
git commit -m "Initial commit: setup study project for $REPO_NAME"

info "完成！学习项目已初始化: $TARGET_DIR"
echo "$TARGET_DIR"
```

- [ ] **Step 3: 设置脚本执行权限**

```bash
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/learning-tools/learn-repo/init-study-repo.sh
```

- [ ] **Step 4: 测试脚本基本功能**

```bash
# 创建临时测试目录
TEST_DIR=$(mktemp -d)
cd "$TEST_DIR"

# 测试 URL 解析
echo "测试 URL 解析..."
# 手动测试解析逻辑（不实际克隆）

# 清理
rm -rf "$TEST_DIR"
```

Expected: 脚本创建成功，有执行权限

- [ ] **Step 5: 提交辅助脚本**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/learning-tools/learn-repo/init-study-repo.sh
git commit -m "feat(learn-repo): add init-study-repo.sh helper script"
```

---

## Chunk 2: SKILL.md 主文件实现

### Task 2: 创建 SKILL.md

**Files:**
- Create: `/Users/jiashengwang/jacky-github/jacky-skills/plugins/learning-tools/learn-repo/SKILL.md`

- [ ] **Step 1: 编写 SKILL.md 完整内容**

```markdown
---
name: learn-repo
description: "初始化 GitHub 仓库学习项目：克隆仓库、翻译文档、生成定制化 CLAUDE.md。触发词：学习仓库、learn repo、初始化学习项目"
---

# Learn Repo - 仓库学习项目初始化器

## 概述

**一键初始化 GitHub 仓库学习项目，自动完成克隆、翻译、分析、生成学习笔记结构。**

```
用户输入: /learn-repo https://github.com/owner/repo
         ↓
1. 解析 URL → 提取仓库名
2. 确定目标目录 → {GITHUB_PROJECTS_DIR}/{name}-study
3. 调用辅助脚本 → 克隆 + 删除 .git + 初始化
4. 翻译文档 → 调用 parallel-translation
5. 分析内容 → 文档 + 代码扫描
6. 生成 CLAUDE.md → 定制化学习指南
         ↓
学习项目就绪！
```

## 触发条件

- 用户说 "学习这个仓库" / "learn repo" / "初始化学习项目"
- 用户提供 GitHub URL 并表达学习意图
- 用户输入 `/learn-repo <url>`

---

## 执行步骤

### 第一步：解析输入

从用户输入中提取仓库 URL 或短格式：

| 输入格式 | 示例 |
|---------|------|
| 完整 URL | `https://github.com/ruvnet/ruflo` |
| Git URL | `https://github.com/ruvnet/ruflo.git` |
| 短格式 | `ruvnet/ruflo` |

**URL 规范化逻辑：**
```
如果是短格式 (owner/repo):
    URL = "https://github.com/" + 输入
否则:
    URL = 输入 (去除 .git 后缀)
```

**提取仓库名：**
```bash
# 从 URL 中提取最后一段，去除 .git 后缀
repo_name = basename(url) - ".git"
```

### 第二步：确定目标目录

**优先级顺序：**

1. 读取全局配置 `GITHUB_PROJECTS_DIR`
2. 如果未配置，使用 AskUserQuestion 询问用户

**目标目录命名规则：**
```
{GITHUB_PROJECTS_DIR}/{repo_name}-study
```

**示例：**
- 仓库: `ruvnet/ruflo`
- 目标: `~/jacky-github/ruflo-study`

### 第三步：检查目标目录

使用 Bash 工具检查目录是否存在：

```bash
if [ -d "{TARGET_DIR}" ]; then
    echo "EXISTS"
else
    echo "NOT_EXISTS"
fi
```

**如果目录已存在：**
- 使用 AskUserQuestion 询问是否覆盖
- 选项：覆盖 / 取消

### 第四步：调用辅助脚本

**脚本路径：** `{SKILL_DIR}/init-study-repo.sh`

使用 Bash 工具执行：

```bash
/Users/jiashengwang/jacky-github/jacky-skills/plugins/learning-tools/learn-repo/init-study-repo.sh "{REPO_URL}" "{TARGET_DIR}"
```

**脚本输出：**
- 成功：目标目录路径
- 失败：错误信息

**进度提示：**
```
✓ 克隆仓库到 {TARGET_DIR}
✓ 删除 .git 目录
✓ 创建 .notes/ 目录
✓ 初始化 Git 仓库
```

### 第五步：翻译文档

**调用 parallel-translation skill：**

使用 Skill 工具：

```
skill: "parallel-translation"
args: "{TARGET_DIR}"
```

**翻译范围：**
- `README.md` → `README.zh-CN.md`
- `docs/**/*.md` → `docs/**/*.zh-CN.md`
- 其他 `.md` 文件

**进度提示：**
```
✓ 翻译文档（使用 parallel-translation）
```

### 第六步：分析仓库内容

#### 6.1 读取文档（优先中文版）

使用 Read 和 Glob 工具：

```
1. 优先读取 README.zh-CN.md（如存在）
2. 否则读取 README.md
3. 扫描 docs/ 目录下的 .md 文件
4. 查找 CONTRIBUTING.md、ARCHITECTURE.md 等
```

#### 6.2 扫描目录结构

使用 Bash 工具：

```bash
cd "{TARGET_DIR}"
ls -la
find . -maxdepth 2 -type d | head -30
```

**识别关键目录模式：**
- `agents/` → Agent 定义
- `commands/` → 命令/工具
- `tools/` → 工具函数
- `hooks/` → 钩子
- `skills/` → Skills 定义
- `plugins/` → 插件
- `src/` → 源代码

#### 6.3 扫描配置文件

```bash
# 检查关键配置文件
for file in package.json Cargo.toml pyproject.toml go.mod; do
    if [ -f "$file" ]; then
        echo "Found: $file"
    fi
done
```

#### 6.4 智能推断分类

基于扫描结果，自动推断学习问题分类：

| 发现的模式 | 推断分类 |
|-----------|---------|
| `agents/` | Agent 架构、Agent 通信 |
| `commands/` | 命令系统、CLI 设计 |
| `hooks/` | 生命周期、事件处理 |
| `tools/` | 工具链、辅助函数 |
| `skills/` | Skill 设计、Prompt 工程 |
| `plugins/` | 插件机制、扩展性 |
| 配置文件 | 依赖管理、构建系统 |

### 第七步：生成 CLAUDE.md

**模板：**

```markdown
# CLAUDE.md - {仓库名} 学习项目

## 项目定位

本项目用于**深入学习 {仓库描述}**。

原始仓库：{原始 URL}

## 学习目标

{自动生成的分类和问题}

## 学习方法

1. **问题先行**：阅读源码前先列出想解决的问题
2. **阅读源码**：带着问题去代码目录寻找答案
3. **笔记记录**：将每个问题的答案记录到 `.notes/` 目录

## 参考资源

- [GitHub 仓库]({原始URL})
- [中文文档](./README.zh-CN.md)（如有）

---

## 对话知识实时归档

**核心理念：对话即知识，有价值的内容应当被自动捕获和沉淀。**

用户以问题为导向持续提问，不会主动要求记录。AI 需要：
1. **自主判断**是否值得归档
2. **自主决定**归档到哪个分类
3. **自动执行**归档，无需询问确认

### 判断标准

**值得归档**：技术原理、操作指南、概念解释、问题排查、最佳实践、工具对比

**不需要归档**：简单事实查询、一次性任务、纯代码修改无知识增量

### 归档规则

- **存储路径**：`.notes/{主题分类}/{问题关键词}.md`
- **分类方式**：根据问题主题自动创建分类目录
- **执行时机**：每次回答结束后，如果判断有价值，立即写入文件
- **内容原则**：提炼知识点，非逐字抄录

### 文件模板

```markdown
# {问题关键词}

> 一句话总结

## 问题

{用户的问题}

## 答案

{提炼后的知识点}

## 代码示例（如有）

```

> **重要**：整个过程完全自动化，不打断用户节奏。
```

**写入文件：**

使用 Write 工具将内容写入 `{TARGET_DIR}/CLAUDE.md`

### 第八步：输出完成提示

```
学习项目已准备就绪！

📁 位置: {TARGET_DIR}
📝 CLAUDE.md: 已生成定制化学习指南
📚 文档翻译: 已翻译为中文

运行以下命令开始学习：
cd {TARGET_DIR}
```

---

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| URL 格式无效 | 提示正确格式示例 |
| 仓库不存在 | 提示检查 URL，确认仓库是公开的 |
| 目标目录已存在 | 询问是否覆盖 |
| Git 克隆失败 | 提示网络问题，建议配置代理 |
| 配置变量未定义 | 询问用户输入路径 |

---

## 配置变量

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `GITHUB_PROJECTS_DIR` | GitHub 项目存放目录 | `/Users/xxx/jacky-github` |

---

## 使用示例

### 示例 1：完整 URL

```
用户: /learn-repo https://github.com/ruvnet/ruflo

AI: 正在初始化 ruflo 学习项目...
    ✓ 克隆仓库到 ~/jacky-github/ruflo-study
    ✓ 删除 .git 目录
    ✓ 创建 .notes/ 目录
    ✓ 初始化 Git 仓库
    ✓ 翻译文档（使用 parallel-translation）
    ✓ 分析仓库内容
    ✓ 生成 CLAUDE.md

    学习项目已准备就绪！
    运行 `cd ~/jacky-github/ruflo-study` 开始学习。
```

### 示例 2：短格式

```
用户: /learn-repo discreteprojects/get-shit-done

AI: 正在初始化 get-shit-done 学习项目...
    (同上流程)
```

---

## 快速参考卡

```
┌─────────────────────────────────────────────────────┐
│              /learn-repo 使用指南                    │
├─────────────────────────────────────────────────────┤
│ 输入格式:                                            │
│   /learn-repo https://github.com/owner/repo        │
│   /learn-repo owner/repo                           │
│                                                     │
│ 输出:                                               │
│   {GITHUB_PROJECTS_DIR}/{repo}-study/              │
│   ├── CLAUDE.md       # 定制化学习指南              │
│   ├── .notes/         # 学习笔记目录                │
│   └── {源码}          # 仓库代码                    │
└─────────────────────────────────────────────────────┘
```
```

- [ ] **Step 2: 提交 SKILL.md**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/learning-tools/learn-repo/SKILL.md
git commit -m "feat(learn-repo): add SKILL.md with complete workflow"
```

---

## Chunk 3: 链接和测试

### Task 3: 链接 Skill 并测试

**Files:**
- None (操作现有文件)

- [ ] **Step 1: 使用 j-skills 链接 skill**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
j-skills link plugins/learning-tools/learn-repo
```

Expected: Skill 链接成功

- [ ] **Step 2: 验证 skill 可用**

```bash
j-skills list -g | grep learn-repo
```

Expected: 输出包含 `learn-repo`

- [ ] **Step 3: 提交最终更改**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add -A
git commit -m "feat(learn-repo): complete skill implementation"
git push
```

---

## 验收标准

- [ ] `/learn-repo <url>` 命令可正常执行
- [ ] 辅助脚本正确处理克隆、删除 .git、初始化流程
- [ ] 文档翻译调用 parallel-translation 成功
- [ ] CLAUDE.md 内容根据仓库特点自动生成
- [ ] 问题分类和问题内容与仓库特点相关
