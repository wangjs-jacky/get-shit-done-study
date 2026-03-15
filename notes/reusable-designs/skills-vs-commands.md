# Skills vs Commands 选择分析

**来源**：get-shit-done-study / 学习分析
**发现时间**：2026-03-15
**关键词**：#skills #commands #claude-code #架构选择

## 相关源码路径

| 组件 | 路径 |
|------|------|
| Command 入口 | `get-shit-done/commands/gsd/plan-phase.md` |
| Workflow 实现 | `get-shit-done/get-shit-done/workflows/plan-phase.md` |
| Planner Agent | `get-shit-done/agents/gsd-planner.md` |
| Codebase Mapper Agent | `get-shit-done/agents/gsd-codebase-mapper.md` |

## 核心结论

**Skills 完全可以取代 Commands**，而且功能更强。

## 技术对比

### 文件结构

```
Commands（单文件）:
~/.claude/commands/gsd/help.md

Skills（目录结构）:
~/.claude/skills/brainstorming/
├── SKILL.md              # 入口文件
├── scripts/              # 额外资源
├── templates/
└── companion-files.md
```

### 调用方式

| 方式 | Commands | Skills |
|------|----------|--------|
| 斜杠调用 | `/gsd:help` | `/brainstorming` |
| 自动触发 | ❌ | ✅ AI 识别 description |

**两者都支持斜杠调用，用户体验一致！**

### 功能对比

| 特性 | Commands | Skills |
|------|----------|--------|
| 斜杠调用 | ✅ | ✅ |
| 自动触发（description 匹配） | ❌ | ✅ |
| 单文件 | ✅ | ✅ |
| 目录结构（多文件） | ❌ | ✅ |
| 包含 scripts/templates | ❌ | ✅ |
| 渐进式披露 | ❌ | ✅ |

## GSD 为什么选择 Commands？

### 可能的原因

1. **历史原因**
   - GSD 开发时 Skills 机制可能还不成熟
   - Claude Code 的 Skills 是后来才引入的

2. **简单性优先**
   - Commands 是单文件，更容易管理
   - GSD 的每个 command 逻辑相对独立，不需要额外资源

3. **迁移成本**
   - 已有 80+ commands
   - 重构成 skills 需要大量工作

4. **显式控制哲学**
   - GSD 设计哲学是"用户主动控制"
   - 不需要 AI "猜测"何时调用
   - 但这个理由不成立，因为 Skills 也可以通过斜杠显式调用

### 如果今天重新设计

应该直接用 Skills：

```
skills/gsd/
├── help/
│   └── SKILL.md
├── update/
│   ├── SKILL.md
│   └── scripts/
│       └── check-version.js
├── new-project/
│   ├── SKILL.md
│   └── templates/
│       └── PROJECT.md.template
└── ...
```

## 对 jacky-skills 的启示

### 推荐方案

**全部使用 Skills，不用 Commands**

```
jacky-skills/
├── skills/
│   ├── bilibili-to-obsidian/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── extract-subtitle.sh
│   ├── video-to-text/
│   │   ├── SKILL.md
│   │   └── templates/
│   │       └── output-template.md
│   └── ...
```

### 理由

1. **Skills 是 Commands 的超集**
   - 所有 Commands 能做的，Skills 都能做
   - Skills 还能做更多（自动触发、多文件）

2. **未来兼容性**
   - Claude Code 官方更倾向于 Skills
   - 新特性会优先支持 Skills

3. **更好的组织**
   - 复杂功能可以有配套的 scripts/templates
   - 目录结构更清晰

## 复用记录

- [ ] jacky-skills：迁移现有 commands 到 skills 结构
- [ ] 新功能开发：全部使用 skills 目录结构
