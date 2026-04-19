---
article_id: OBA-z46ff1zy
tags: [open-source, get-shit-done, commands, claude]
type: learning
updated_at: 2026-03-17
---

# GSD Update 命令流程分析

> 梳理 `/gsd:update` 命令的完整执行流程和涉及的文件

## 命令入口

```
/gsd:update
    │
    └── commands/gsd/update.md
        └── 引用: @~/.claude/get-shit-done/workflows/update.md
```

## 完整流程图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    用户输入: /gsd:update                                 │
│                                                                         │
│    📄 入口文件: commands/gsd/update.md                                   │
│       └── 引用: @~/.claude/get-shit-done/workflows/update.md            │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 1: get_installed_version                                          │
│  ─────────────────────────────                                          │
│                                                                         │
│    📄 检测文件 (按优先级):                                                │
│    ├── ./.claude/get-shit-done/VERSION          (本地)                   │
│    ├── ./.claude/get-shit-done/workflows/update.md (完整性校验)          │
│    ├── ~/.claude/get-shit-done/VERSION          (全局)                   │
│    └── ~/.claude/get-shit-done/workflows/update.md (完整性校验)          │
│                                                                         │
│    支持的运行时目录:                                                      │
│    .claude / .config/opencode / .opencode / .gemini                     │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 2: check_latest_version                                           │
│  ────────────────────────────                                           │
│                                                                         │
│    🌐 npm 查询:                                                          │
│    npm view get-shit-done-cc version                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 3: compare_versions                                               │
│  ──────────────────────────                                             │
│                                                                         │
│    版本比较 (无文件操作)                                                  │
│    • 相同 → 退出                                                         │
│    • 本地 > 最新 → 退出                                                  │
│    • 本地 < 最新 → 继续                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 4: show_changes_and_confirm                                       │
│  ──────────────────────────────────                                     │
│                                                                         │
│    🌐 获取 CHANGELOG:                                                    │
│    https://github.com/glittercowboy/get-shit-done/blob/main/CHANGELOG.md│
│    (raw URL 实际请求的是 raw.githubusercontent.com)                      │
│                                                                         │
│    📄 本地补丁检测 (更新前):                                              │
│    ~/.claude/gsd-file-manifest.json                                     │
│    └── 用于检测用户是否修改过 GSD 文件                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 5: run_update                                                     │
│  ───────────────────                                                    │
│                                                                         │
│    🌐 执行更新:                                                          │
│    npx -y get-shit-done-cc@latest --local   (本地安装)                   │
│    npx -y get-shit-done-cc@latest --global  (全局安装)                   │
│                                                                         │
│    📄 清除缓存文件:                                                       │
│    ├── ./.claude/cache/gsd-update-check.json                            │
│    ├── ~/.claude/cache/gsd-update-check.json                            │
│    ├── ~/.config/opencode/cache/gsd-update-check.json                   │
│    ├── ~/.opencode/cache/gsd-update-check.json                          │
│    └── ~/.gemini/cache/gsd-update-check.json                            │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 6: display_result                                                 │
│  ───────────────────────                                                │
│                                                                         │
│    显示完成消息 (无文件操作)                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 7: check_local_patches                                            │
│  ────────────────────────────                                           │
│                                                                         │
│    📄 检查备份:                                                          │
│    ~/.claude/gsd-local-patches/backup-meta.json                         │
│                                                                         │
│    如果存在 → 提示运行 /gsd:reapply-patches                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 辅助组件：SessionStart Hook

```
┌─────────────────────────────────────────────────────────────────────────┐
│  会话启动时自动执行                                                       │
│                                                                         │
│    📄 Hook 脚本: hooks/gsd-check-update.js                               │
│                                                                         │
│    📄 读取版本文件:                                                       │
│    ├── ./.claude/get-shit-done/VERSION          (优先)                   │
│    └── ~/.claude/get-shit-done/VERSION          (备选)                   │
│                                                                         │
│    🌐 查询最新版本:                                                       │
│    npm view get-shit-done-cc version                                    │
│                                                                         │
│    📄 写入缓存:                                                          │
│    ~/.claude/cache/gsd-update-check.json                                │
│    内容:                                                                 │
│    {                                                                    │
│      "update_available": true,                                          │
│      "installed": "1.5.10",                                             │
│      "latest": "1.5.15",                                                │
│      "checked": 1739520000                                              │
│    }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## 文件路径汇总表

| 用途 | 文件路径 | 读写 |
|------|----------|------|
| **命令入口** | `commands/gsd/update.md` | 读 |
| **流程定义** | `get-shit-done/workflows/update.md` | 读 |
| **本地版本** | `./.claude/get-shit-done/VERSION` | 读 |
| **全局版本** | `~/.claude/get-shit-done/VERSION` | 读 |
| **完整性校验** | `*/get-shit-done/workflows/update.md` | 读 (存在性检查) |
| **文件清单** | `~/.claude/gsd-file-manifest.json` | 读 |
| **更新缓存** | `~/.claude/cache/gsd-update-check.json` | 读写 |
| **本地补丁备份** | `~/.claude/gsd-local-patches/backup-meta.json` | 读 |
| **SessionStart Hook** | `hooks/gsd-check-update.js` | 执行 |
| **远程 CHANGELOG** | GitHub raw URL | 网络请求 |

## 源码位置（本仓库）

```
get-shit-done/
├── commands/
│   └── gsd/
│       └── update.md              # 命令入口
├── get-shit-done/
│   └── workflows/
│       └── update.md              # 核心流程逻辑
└── hooks/
    └── gsd-check-update.js        # SessionStart 钩子
```

## 关键设计点

| 设计点 | 说明 |
|--------|------|
| **多运行时支持** | 支持 `.claude` / `.config/opencode` / `.opencode` / `.gemini` 等多种配置目录 |
| **本地优先** | 先检测本地安装，再检测全局安装 |
| **变更预览** | 更新**前**展示 CHANGELOG，让用户知道即将获得什么 |
| **清洁安装警告** | 明确告知哪些目录会被覆盖，哪些文件会保留 |
| **本地修改保护** | 自动备份用户对 GSD 文件的修改到 `gsd-local-patches/` |
| **缓存清理** | 更新后清除状态栏的更新提示缓存 |

## 相关笔记

- [File Manifest 设计](./design/file-manifest-design.md) - 本地修改保护机制
