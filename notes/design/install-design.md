---
article_id: OBA-ur117gbl
tags: [open-source, get-shit-done, design, ai-agent, hooks, claude]
type: learning
updated_at: 2026-03-17
---

# GSD Install 阶段设计

> 一套优雅的"可安装 + 可更新 + 可卸载"的包管理方案

## 核心设计理念

| 理念 | 实现方式 |
|------|----------|
| **前缀隔离** | 所有文件使用 `gsd-` 前缀，避免与用户文件冲突 |
| **清洁卸载** | 通过前缀匹配快速删除，不残留 |
| **本地修改保护** | 更新前检测哈希差异，自动备份 |
| **多运行时适配** | 一套源码，自动转换为不同运行时格式 |

---

## 安装的文件类型

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GSD 源码结构                                                            │
│                                                                         │
│  get-shit-done/                                                         │
│  ├── commands/gsd/          # 斜杠命令                                   │
│  ├── agents/                # 子代理                                     │
│  ├── get-shit-done/         # 工作流、模板、工具                          │
│  ├── hooks/                 # 钩子脚本                                   │
│  ├── CHANGELOG.md           # 变更日志                                   │
│  └── package.json           # npm 包配置                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  安装后目录结构（以 Claude Code 为例）                                    │
│                                                                         │
│  ~/.claude/                                                             │
│  ├── commands/                                                          │
│  │   └── gsd/               # 斜杠命令（嵌套结构）                        │
│  │       ├── help.md                                                    │
│  │       ├── update.md                                                  │
│  │       └── ...                                                        │
│  ├── agents/                                                            │
│  │   ├── gsd-planner.md     # 子代理（gsd- 前缀）                        │
│  │   ├── gsd-executor.md                                                │
│  │   └── ...                                                            │
│  ├── get-shit-done/         # 核心工作流和模板                           │
│  │   ├── workflows/                                                     │
│  │   ├── templates/                                                     │
│  │   ├── bin/                                                           │
│  │   ├── VERSION            # 版本号                                     │
│  │   └── CHANGELOG.md       # 变更日志                                   │
│  ├── hooks/                                                             │
│  │   ├── gsd-statusline.js   # 状态栏钩子                                │
│  │   ├── gsd-check-update.js # 更新检查钩子                              │
│  │   └── gsd-context-monitor.js # 上下文监控钩子                         │
│  ├── settings.json          # 自动注册 hooks                            │
│  ├── gsd-file-manifest.json # 文件哈希清单                               │
│  └── package.json           # CommonJS 模式标记                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 多运行时适配

不同运行时的目录结构差异：

| 运行时 | Commands 结构 | Agents 结构 | Hooks 配置 |
|--------|---------------|-------------|------------|
| **Claude Code** | `commands/gsd/*.md`（嵌套） | `agents/gsd-*.md` | `settings.json` |
| **OpenCode** | `command/gsd-*.md`（扁平） | `agents/gsd-*.md` | `opencode.json` |
| **Gemini** | `commands/gsd/*.md`（嵌套） | `agents/gsd-*.md` | `settings.json` |
| **Codex** | `skills/gsd-*/SKILL.md` | `agents/gsd-*.toml` | `config.toml` |

### 扁平化转换（OpenCode）

```
源码: commands/gsd/debug/start.md
        │
        ▼
安装: command/gsd-debug-start.md
```

### Skill 目录转换（Codex）

```
源码: commands/gsd/help.md
        │
        ▼
安装: skills/gsd-help/SKILL.md
```

---

## 前缀隔离机制

**核心思想**：所有 GSD 文件使用 `gsd-` 前缀，实现：

1. **避免冲突**：不会与用户自己的文件混淆
2. **快速识别**：通过前缀匹配找到所有 GSD 文件
3. **清洁卸载**：删除时只删 `gsd-*` 文件，保留用户文件

### 前缀规则

| 文件类型 | 前缀模式 | 示例 |
|----------|----------|------|
| Commands | `gsd-*` | `gsd-help.md`, `gsd-update.md` |
| Agents | `gsd-*.md` | `gsd-planner.md`, `gsd-executor.md` |
| Hooks | `gsd-*.js` | `gsd-statusline.js`, `gsd-check-update.js` |
| Skills (Codex) | `gsd-*/` | `skills/gsd-help/` |

---

## Hooks 复用机制

### 安装时自动注册

```javascript
// settings.json 中自动添加
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "node ~/.claude/hooks/gsd-check-update.js" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          { "type": "command", "command": "node ~/.claude/hooks/gsd-context-monitor.js" }
        ]
      }
    ]
  },
  "statusLine": {
    "command": "node ~/.claude/hooks/gsd-statusline.js"
  }
}
```

### 卸载时自动清理

卸载时检测并移除：
- `settings.json` 中所有 `gsd-*` 相关配置
- `opencode.json` 中的权限配置
- `config.toml` 中的 agent 配置

---

## 卸载流程

```
用户执行: npx get-shit-done-cc --uninstall --global
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 1: 删除 Commands/Skills                                           │
│  ─────────────────────────────                                          │
│  • OpenCode: command/gsd-*.md                                           │
│  • Codex: skills/gsd-*/                                                 │
│  • Claude/Gemini: commands/gsd/                                         │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 2: 删除 get-shit-done/ 目录                                       │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 3: 删除 Agents（gsd-*.md）                                        │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 4: 删除 Hooks（gsd-*.js）                                         │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 5: 删除 package.json（如果是 GSD 的 CommonJS 标记）                │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 6: 清理 settings.json                                             │
│  ──────────────────────────                                             │
│  • 移除 SessionStart 中的 gsd-check-update hook                         │
│  • 移除 PostToolUse 中的 gsd-context-monitor hook                       │
│  • 移除 statusLine 配置（如果是 gsd-statusline）                         │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 7: 清理运行时特定配置                                              │
│  ──────────────────────────                                             │
│  • OpenCode: opencode.json 中的权限配置                                 │
│  • Codex: config.toml 中的 [agents.gsd-*] 配置                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 本地修改保护机制

### 安装时写入 Manifest

```json
// gsd-file-manifest.json
{
  "version": "1.22.4",
  "timestamp": "2026-03-14T17:46:19.753Z",
  "files": {
    "commands/gsd/help.md": "sha256-hash-1",
    "agents/gsd-planner.md": "sha256-hash-2",
    "hooks/gsd-statusline.js": "sha256-hash-3"
  }
}
```

### 更新时检测差异

```
更新前:
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  遍历 manifest 中的所有文件                                              │
│                                                                         │
│  for (file in manifest.files) {                                        │
│    currentHash = sha256(file)                                          │
│    if (currentHash !== manifest.files[file]) {                         │
│      // 用户修改过这个文件！                                             │
│      backup(file) → gsd-local-patches/                                 │
│    }                                                                    │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  备份结构                                                               │
│                                                                         │
│  gsd-local-patches/                                                     │
│  ├── backup-meta.json       # 备份元数据                                │
│  ├── commands/gsd/help.md   # 被修改的文件                              │
│  └── agents/gsd-planner.md                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 更新后提示恢复

```
Local patches detected (from v1.5.10):
  - commands/gsd/help.md
  - agents/gsd-planner.md

Run /gsd:reapply-patches to merge your modifications.
```

---

## 设计亮点总结

| 设计点 | 解决的问题 | 实现方式 |
|--------|-----------|----------|
| **前缀隔离** | 避免与用户文件冲突 | 所有文件使用 `gsd-` 前缀 |
| **清洁卸载** | 卸载不残留 | 前缀匹配 + 配置清理 |
| **多运行时** | 一套源码多处使用 | 安装时自动转换格式 |
| **本地修改保护** | 更新不丢失定制 | Manifest 哈希对比 + 自动备份 |
| **Hooks 自动注册** | 开箱即用 | 安装时写入 settings.json |

---

## 可复用到 jacky-skills 的设计

### 1. 前缀隔离

```
skills/
├── jacky-skill-1/
├── jacky-skill-2/
└── user-skill-xxx/     # 用户自己的 skills
```

### 2. 清洁卸载

```bash
# 卸载时只删除 jacky-* 前缀的文件
rm -rf skills/jacky-*
```

### 3. Manifest 机制

```json
{
  "version": "1.0.0",
  "skills": {
    "jacky-skill-1": "sha256-hash",
    "jacky-skill-2": "sha256-hash"
  }
}
```

### 4. 多项目复用

- 全局安装：`~/.claude/commands/jacky-*/`
- 本地安装：`./.claude/commands/jacky-*/`

---

## 相关笔记

- [Update 命令流程](../commands/update-flow.md)
- [File Manifest 设计](./file-manifest-design.md)
