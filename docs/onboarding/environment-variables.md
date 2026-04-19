# 环境变量参考手册

> 本文档梳理了 get-shit-done-study 项目中两个子项目所使用的全部环境变量，帮助开发者快速了解配置需求。

## 目录

- [概述](#概述)
- [get-shit-done（GSD 框架）](#get-shit-donegsd-框架)
  - [核心配置变量](#核心配置变量)
  - [Web 搜索变量](#web-搜索变量)
  - [运行时检测变量](#运行时检测变量)
  - [测试专用变量](#测试专用变量)
  - [系统隐式变量](#系统隐式变量)
- [demo-by-gsd（Astro 演示项目）](#demo-by-gsdastro-演示项目)
- [GitHub Actions 环境变量](#github-actions-环境变量)
- [.env 配置模板](#env-配置模板)
- [配置最佳实践](#配置最佳实践)

---

## 概述

| 子项目 | 环境变量数量 | 是否需要 .env 文件 |
|--------|-------------|-------------------|
| get-shit-done | 9 | 否（通过系统环境变量或配置文件管理） |
| demo-by-gsd | 0 | 不需要 |

---

## get-shit-done（GSD 框架）

GSD 框架是一个 CLI 工具，环境变量主要用于控制安装路径、运行时行为和可选功能。以下是完整的环境变量清单。

### 核心配置变量

这些变量用于指定 GSD 框架在不同 AI 编码工具中的配置目录位置。

| 变量名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `CLAUDE_CONFIG_DIR` | 路径字符串 | 可选 | `~/.claude` | Claude Code 的配置目录。GSD 的 hooks、agents 等文件安装到此目录下。在多账号场景下特别有用。 |
| `OPENCODE_CONFIG_DIR` | 路径字符串 | 可选 | `~/.config/opencode` | OpenCode 的全局配置目录（最高优先级）。 |
| `OPENCODE_CONFIG` | 文件路径 | 可选 | 无 | OpenCode 配置文件路径，GSD 取其 `dirname` 作为配置目录（第二优先级）。 |
| `XDG_CONFIG_HOME` | 路径字符串 | 可选 | `~/.config` | XDG 基础目录规范路径，OpenCode 模式下使用 `$XDG_CONFIG_HOME/opencode` 作为配置目录（第三优先级）。 |
| `GEMINI_CONFIG_DIR` | 路径字符串 | 可选 | `~/.gemini` | Google Gemini CLI 的配置目录。 |
| `CODEX_HOME` | 路径字符串 | 可选 | `~/.codex` | OpenAI Codex CLI 的配置目录。 |

**配置目录优先级规则**（以 Claude Code 为例）：

```
--config-dir 参数 > CLAUDE_CONFIG_DIR 环境变量 > ~/.claude 默认路径
```

**各运行时的目录解析逻辑**：

| 运行时 | 优先级顺序 |
|--------|-----------|
| Claude Code | `--config-dir` > `CLAUDE_CONFIG_DIR` > `~/.claude` |
| OpenCode | `--config-dir` > `OPENCODE_CONFIG_DIR` > `dirname(OPENCODE_CONFIG)` > `$XDG_CONFIG_HOME/opencode` > `~/.config/opencode` |
| Gemini | `--config-dir` > `GEMINI_CONFIG_DIR` > `~/.gemini` |
| Codex | `--config-dir` > `CODEX_HOME` > `~/.codex` |

### Web 搜索变量

| 变量名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `BRAVE_API_KEY` | 字符串 | 可选 | 无 | Brave Search API 密钥。设置后启用 GSD 内置的 Web 搜索功能（`gsd:research` 等命令）。未设置时自动回退到 Claude Code 内置的 WebSearch 工具。 |

**密钥检测方式**（双重检测）：

1. 环境变量 `BRAVE_API_KEY`
2. 文件 `~/.gsd/brave_api_key`（优先级低于环境变量）

两种方式任选其一即可，GSD 在初始化项目（`gsd:new-project`）和执行搜索时都会检测。

### 运行时检测变量

| 变量名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `GEMINI_API_KEY` | 字符串 | 可选 | 无 | Google Gemini API 密钥。GSD 的 `gsd-context-monitor` hook 会检测此变量来判断运行环境是否为 Gemini CLI，从而选择正确的 hook 事件名（`AfterTool` vs `PostToolUse`）。 |

### 测试专用变量

| 变量名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `GSD_TEST_MODE` | 字符串 | 可选 | 无 | 测试模式标志。设置为 `1` 时，`install.js` 不会执行主逻辑，而是导出内部函数供测试文件调用。仅用于单元测试，正常使用不需要设置。 |

**使用场景**：

```javascript
// tests/codex-config.test.cjs
process.env.GSD_TEST_MODE = '1';
require('../bin/install.js'); // 只加载模块，不执行安装
```

### 系统隐式变量

| 变量名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `HOME` | 路径字符串 | 系统自动 | 用户主目录 | GSD 使用 `os.homedir()` 作为主要方式获取主目录，`process.env.HOME` 仅作为回退方案（用于 `verify` 命令解析 `~/` 路径时）。 |

---

## demo-by-gsd（Astro 演示项目）

demo-by-gsd 是一个基于 Astro + React 的静态展示站点，**不使用任何自定义环境变量**。

### 原因说明

1. **纯静态站点**：`output: 'static'`，构建产物为纯 HTML/CSS/JS，不涉及服务端环境变量
2. **无 API 调用**：项目不连接任何后端服务或第三方 API
3. **路径硬编码**：站点地址通过 `astro.config.mjs` 中的 `site` 和 `base` 字段直接配置

### Astro 内置变量（仅供参考）

虽然项目没有自定义环境变量，但 Astro 框架提供了以下内置变量，可在代码中使用：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `import.meta.env.BASE_URL` | `/get-shit-done-study/` | 由 `astro.config.mjs` 中的 `base` 字段决定 |
| `import.meta.env.MODE` | `development` / `production` | 当前运行模式 |
| `import.meta.env.PROD` | `boolean` | 是否为生产环境 |
| `import.meta.env.DEV` | `boolean` | 是否为开发环境 |

当前项目源码中并未使用这些变量，仅在规划文档 `.planning/` 中有提及作为可选方案。

### astro.config.mjs 配置说明

```javascript
export default defineConfig({
  site: 'https://wangjs-jacky.github.io',  // GitHub Pages 域名
  base: '/get-shit-done-study',             // 仓库子路径
  output: 'static',                          // 静态输出
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

如果需要修改站点地址或部署路径，直接编辑此配置文件即可，无需设置环境变量。

---

## GitHub Actions 环境变量

项目的 CI/CD 工作流（`.github/workflows/deploy.yml`）**不依赖自定义环境变量**。

### 部署流程说明

| 步骤 | 说明 | 环境变量依赖 |
|------|------|-------------|
| Checkout | 拉取代码 | 无 |
| Install pnpm | 安装 pnpm 10 | 无 |
| Setup Node | 设置 Node 22 | 无 |
| Install dependencies | `pnpm install` | 无 |
| Build site | `pnpm build` | 无 |
| Deploy to gh-pages | 推送到 gh-pages 分支 | 使用 `GITHUB_TOKEN`（GitHub Actions 自动注入） |

`GITHUB_TOKEN` 由 GitHub Actions 运行时自动提供，无需手动配置。工作流通过 `permissions: contents: write` 授权写入仓库。

---

## .env 配置模板

### get-shit-done 推荐配置

在 shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）中添加：

```bash
# ========== GSD (Get Shit Done) 配置 ==========

# [可选] Brave Search API 密钥 — 启用增强 Web 搜索功能
# 获取地址: https://brave.com/search/api/
# 也可以将密钥保存到 ~/.gsd/brave_api_key 文件中（二选一）
export BRAVE_API_KEY="your-brave-api-key-here"

# [可选] Claude Code 配置目录 — 多账号或自定义路径时设置
# export CLAUDE_CONFIG_DIR="$HOME/.claude"

# [可选] OpenCode 配置目录
# export OPENCODE_CONFIG_DIR="$HOME/.config/opencode"

# [可选] Gemini CLI 配置目录
# export GEMINI_CONFIG_DIR="$HOME/.gemini"

# [可选] Codex CLI 配置目录
# export CODEX_HOME="$HOME/.codex"

# [可选] XDG 配置主目录（影响 OpenCode 路径解析）
# export XDG_CONFIG_HOME="$HOME/.config"
```

### get-shit-done 可选的文件配置方式

Brave API 密钥也可以通过文件方式提供：

```bash
# 方式一：环境变量
export BRAVE_API_KEY="your-key"

# 方式二：文件（优先级低于环境变量）
mkdir -p ~/.gsd
echo "your-key" > ~/.gsd/brave_api_key
```

### demo-by-gsd

无需任何环境变量配置，无需 `.env` 文件。

---

## 配置最佳实践

### 1. 优先使用默认路径

GSD 框架为每个支持的运行时都提供了合理的默认路径。除非有特殊需求（如多账号、自定义安装位置），否则不需要设置任何路径相关环境变量。

### 2. API 密钥管理

| 方式 | 安全性 | 适用场景 |
|------|--------|---------|
| `~/.gsd/brave_api_key` 文件 | 较好（不会出现在 shell 历史中） | 单机器使用，推荐方式 |
| 环境变量 `BRAVE_API_KEY` | 一般（可能泄露到进程列表、日志中） | CI/CD 环境或需要跨工具共享 |
| `.env` 文件 | 不推荐（GSD 不加载 .env 文件） | 不适用 |

### 3. 避免在 Git 仓库中存储密钥

- `.env` 文件应加入 `.gitignore`
- API 密钥应使用文件或系统级环境变量管理
- GitHub Actions 中使用 Secrets 管理敏感信息

### 4. 多运行时共存

GSD 支持同时为多个 AI 编码工具（Claude Code、OpenCode、Gemini、Codex）安装。安装时通过参数指定运行时：

```bash
# 安装到 Claude Code（默认）
npx get-shit-done install

# 安装到 OpenCode
npx get-shit-done install --runtime opencode

# 安装到 Gemini
npx get-shit-done install --runtime gemini

# 安装到 Codex
npx get-shit-done install --runtime codex
```

每个运行时会独立解析自己的配置目录，互不冲突。

### 5. 测试环境

运行 GSD 测试套件时，`GSD_TEST_MODE` 会自动被测试文件设置，无需手动操作：

```bash
cd get-shit-done
npm test
```

---

## 变量速查表

| 变量名 | 子项目 | 分类 | 必填 | 一句话说明 |
|--------|--------|------|------|-----------|
| `CLAUDE_CONFIG_DIR` | get-shit-done | 路径配置 | 否 | Claude Code 配置目录路径 |
| `OPENCODE_CONFIG_DIR` | get-shit-done | 路径配置 | 否 | OpenCode 全局配置目录路径 |
| `OPENCODE_CONFIG` | get-shit-done | 路径配置 | 否 | OpenCode 配置文件路径 |
| `XDG_CONFIG_HOME` | get-shit-done | 路径配置 | 否 | XDG 基础目录路径 |
| `GEMINI_CONFIG_DIR` | get-shit-done | 路径配置 | 否 | Gemini CLI 配置目录路径 |
| `CODEX_HOME` | get-shit-done | 路径配置 | 否 | Codex CLI 配置目录路径 |
| `BRAVE_API_KEY` | get-shit-done | API 密钥 | 否 | Brave Search API 密钥，启用增强搜索 |
| `GEMINI_API_KEY` | get-shit-done | 运行时检测 | 否 | Gemini API 密钥，自动检测运行环境 |
| `GSD_TEST_MODE` | get-shit-done | 测试标志 | 否 | 测试模式开关，正常使用不需要设置 |
| `HOME` | get-shit-done | 系统变量 | 自动 | 用户主目录，系统自动提供 |
