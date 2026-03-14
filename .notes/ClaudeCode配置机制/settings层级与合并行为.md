# Claude Code Settings 层级与合并行为

> 理解配置文件的优先级和合并逻辑，避免配置丢失

## 官方定义的配置层级

| 层级 | 位置 | 影响范围 | 是否共享 | 用途 |
|------|------|----------|----------|------|
| **Managed** | 系统级 `managed-settings.json` | 机器上所有用户 | IT 部署 | 企业安全策略、合规要求 |
| **User** | `~/.claude/settings.json` | 你所有项目 | ❌ 不共享 | 个人偏好、API keys |
| **Project** | `.claude/settings.json` | 当前项目 | ✅ 提交到 git | 团队共享配置 |
| **Local** | `.claude/settings.local.json` | 仅你在此项目 | ❌ gitignored | 个人项目级配置 |

## 配置文件类型

| 文件 | 用途 | 是否提交 |
|------|------|----------|
| `settings.json` | 共享配置 | ✅ 提交 |
| `settings.local.json` | 本地配置（敏感信息、个人偏好） | ❌ gitignore |

## 当前行为（存在 Bug！）

### 问题描述

项目级 `settings.local.json` 会**完全覆盖**全局 `settings.local.json`，而不是深度合并。

### Bug Issue

- [Issue #19487](https://github.com/anthropics/claude-code/issues/19487) - Project settings.local.json overwrites global settings instead of deep merging

### 复现步骤

```bash
# 1. 全局配置 ~/.claude/settings.local.json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  },
  "env": {
    "ENABLE_TOOL_SEARCH": "auto"
  }
}

# 2. 项目配置 .claude/settings.local.json
{
  "permissions": {
    "allow": ["Bash(git init:*)"]
  }
}

# 3. 实际生效的配置（Bug 行为）
{
  "permissions": {
    "allow": ["Bash(git init:*)"]
  }
  // statusLine 和 env 丢失！全局配置被完全覆盖
}
```

### 预期行为

```json
// 应该深度合并
{
  "statusLine": { ... },        // 来自全局
  "env": { ... },               // 来自全局
  "permissions": { "allow": [...] }  // 来自项目
}
```

## 当前 Workaround

由于 bug 还没修好，目前只能在项目配置中**重复定义全局配置**：

```json
// 项目级 .claude/settings.local.json
{
  // 必须重复全局的配置
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  },
  // 项目特有的配置
  "permissions": {
    "allow": ["Bash(git init:*)"]
  }
}
```

## 对框架开发的影响

### GSD 的场景

GSD 安装时修改全局 `~/.claude/settings.json`：

```
~/.claude/
└── settings.json      ← GSD 修改这个文件
    ├── hooks: { ... }
    └── statusLine: { ... }
```

### 风险场景

| 场景 | 风险 | 解决方案 |
|------|------|----------|
| 项目有 `.claude/settings.json` | 可能覆盖全局 hooks | 检查并合并 |
| 项目有 `.claude/settings.local.json` | 可能覆盖全局配置 | 重复定义全局配置 |
| 多个框架修改同一配置 | 配置冲突 | 命名前缀隔离 |

### 最佳实践

```javascript
// 安装脚本应该：
// 1. 检查项目级配置是否存在
const projectSettingsPath = path.join(projectDir, '.claude', 'settings.json');
const localSettingsPath = path.join(projectDir, '.claude', 'settings.local.json');

// 2. 如果存在，警告用户
if (fs.existsSync(localSettingsPath)) {
  console.log('⚠️  检测到项目级 settings.local.json');
  console.log('   全局配置可能被覆盖，请手动合并以下配置：');
  console.log(JSON.stringify(globalHooks, null, 2));
}

// 3. 或者直接修改项目级配置
function mergeToProjectConfig(projectPath, hooks) {
  const settings = readSettings(projectPath);
  // 深度合并 hooks
  settings.hooks = { ...settings.hooks, ...hooks };
  writeSettings(projectPath, settings);
}
```

## 配置合并原则（待官方实现）

根据社区讨论，期望的合并行为：

1. **对象深度合并**：`{ a: 1 }` + `{ b: 2 }` = `{ a: 1, b: 2 }`
2. **数组可选合并或替换**：`[1, 2]` + `[3, 4]` = `[1, 2, 3, 4]` 或 `[3, 4]`
3. **项目值优先**：同名字段，项目配置覆盖全局
4. **未定义字段继承**：项目未定义的字段，使用全局值

## 来源

- **官方文档**：https://code.claude.com/docs/en/settings
- **Bug Issue**：https://github.com/anthropics/claude-code/issues/19487
- **Feature Request**：https://github.com/anthropics/claude-code/issues/23931
- **发现时间**：2026-03-15
