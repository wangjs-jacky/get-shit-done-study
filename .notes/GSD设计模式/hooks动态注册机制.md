# 命名前缀标识法 - 实现配置的快速添加与卸载

> 通过统一的命名前缀标识框架添加的内容，实现"遍历过滤"式的精准卸载

## 核心思想

**问题**：框架向用户的配置文件（settings.json）添加了内容，卸载时如何精确识别并移除这些内容，而不影响用户自己的配置？

**方案**：所有框架添加的内容都使用统一的**命名前缀**（如 `gsd-`），卸载时只需遍历数组，过滤掉包含该前缀的项。

```
安装时：添加 gsd-xxx → 数组
卸载时：遍历数组 → 过滤掉包含 gsd- 的项 → 写回
```

## GSD 的实现

### 命名约定

所有 GSD 添加的文件和配置都使用 `gsd-` 前缀：

```
~/.claude/
├── hooks/
│   ├── gsd-statusline.js       ← 前缀标识
│   ├── gsd-check-update.js     ← 前缀标识
│   └── gsd-context-monitor.js  ← 前缀标识
├── agents/
│   ├── gsd-executor.md         ← 前缀标识
│   ├── gsd-planner.md          ← 前缀标识
│   └── ...
└── commands/
    ├── gsd-new-project.md      ← 前缀标识
    ├── gsd-execute-phase.md    ← 前缀标识
    └── ...
```

### 安装逻辑

```javascript
// 安装时：添加带前缀标识的 hook
const statuslineCommand = 'node ~/.claude/hooks/gsd-statusline.js';
//                                         ^^^ 前缀

settings.hooks.SessionStart.push({
  hooks: [{ type: 'command', command: statuslineCommand }]
});
```

### 卸载逻辑

```javascript
// 卸载时：遍历数组，过滤掉包含前缀的项
settings.hooks.SessionStart = settings.hooks.SessionStart.filter(entry => {
  if (entry.hooks && Array.isArray(entry.hooks)) {
    // 检查是否包含 GSD 的前缀
    const hasGsdHook = entry.hooks.some(h =>
      h.command && h.command.includes('gsd-')  // ← 关键：匹配前缀
    );
    return !hasGsdHook;  // 不包含前缀的保留，包含的删除
  }
  return true;  // 没有 hooks 字段的保留
});
```

### 删除文件时同样用前缀匹配

```javascript
// 删除 hooks 目录下的 GSD 文件
const hooksDir = path.join(targetDir, 'hooks');
const gsdHooks = ['gsd-statusline.js', 'gsd-check-update.js', 'gsd-context-monitor.js'];

for (const hook of gsdHooks) {
  const hookPath = path.join(hooksDir, hook);
  if (fs.existsSync(hookPath)) {
    fs.unlinkSync(hookPath);
  }
}

// 删除 agents 目录下的 GSD 文件
const agentsDir = path.join(targetDir, 'agents');
for (const file of fs.readdirSync(agentsDir)) {
  if (file.startsWith('gsd-') && file.endsWith('.md')) {
    fs.unlinkSync(path.join(agentsDir, file));
  }
}
```

---

## 设计要点

### 1. 命名前缀的选型

| 前缀 | 示例 | 适用场景 |
|------|------|----------|
| `gsd-` | `gsd-statusline.js` | GSD 框架 |
| `my-plugin-` | `my-plugin-hook.js` | 自定义插件 |
| `@scope/` | `@myorg/component` | npm 包风格 |

**选择原则**：
- 简短好记
- 不易与用户命名冲突
- 有明确的项目归属感

### 2. 双向可逆

```
安装 (npx get-shit-done)
    │
    ├─→ 复制文件到 ~/.claude/
    │     ├── hooks/gsd-*.js
    │     ├── agents/gsd-*.md
    │     └── commands/gsd-*.md
    │
    └─→ 修改 settings.json
          - 添加 hooks 配置（引用 gsd-* 文件）
          - 配置 statusLine

卸载 (npx get-shit-done --uninstall)
    │
    ├─→ 删除 ~/.claude/ 下的 gsd-* 文件
    │
    └─→ 清理 settings.json
          - 过滤掉包含 gsd- 的 hooks
          - 移除 gsd-statusline 的 statusLine
          - 保留用户的其它配置
```

### 3. 幂等性

```javascript
// 安装前检查是否已存在，避免重复添加
const hasGsdHook = settings.hooks.SessionStart.some(entry =>
  entry.hooks && entry.hooks.some(h =>
    h.command && h.command.includes('gsd-check-update')
  )
);

if (!hasGsdHook) {
  settings.hooks.SessionStart.push({ ... });
}
```

### 3. 保留现有配置

```javascript
// 读取现有配置，而不是覆盖
const settings = readSettings(settingsPath);

// 只修改需要的字段
settings.hooks.SessionStart = [...];

// 写回（保留用户的其它配置）
writeSettings(settingsPath, settings);
```

### 4. 清理废弃配置

```javascript
// 删除旧版本遗留的、已废弃的 hook
function cleanupOrphanedHooks(settings) {
  const orphanedPatterns = [
    'gsd-notify.sh',        // v1.6.x 移除
    'hooks/statusline.js',  // v1.9.0 重命名
    'gsd-intel-*.js',       // v1.9.2 移除
  ];
  // ... 过滤掉匹配的 hook
}
```

## 代码示例

### 安装时注册 hook

```javascript
function installHooks(configDir, runtime) {
  const settingsPath = path.join(configDir, 'settings.json');
  const settings = readSettings(settingsPath);

  // 确保 hooks 对象存在
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];

  // 添加 hook（幂等）
  const hookCommand = `node ${configDir}/hooks/my-hook.js`;
  if (!hasHook(settings, hookCommand)) {
    settings.hooks.SessionStart.push({
      hooks: [{ type: 'command', command: hookCommand }]
    });
  }

  writeSettings(settingsPath, settings);
}
```

### 卸载时清理 hook

```javascript
function uninstallHooks(configDir) {
  const settingsPath = path.join(configDir, 'settings.json');
  const settings = readSettings(settingsPath);

  // 过滤掉框架的 hook
  if (settings.hooks?.SessionStart) {
    settings.hooks.SessionStart = settings.hooks.SessionStart.filter(entry => {
      return !entry.hooks?.some(h =>
        h.command?.includes('my-framework')
      );
    });
  }

  writeSettings(settingsPath, settings);
}
```

## 可能的复用场景

- [ ] jacky-skills：安装 skill 时自动注册相关的 hooks
- [ ] 插件系统：插件安装时自动配置 settings.json
- [ ] 环境初始化脚本：一键配置开发环境

## 关键启示

1. **配置即代码**：配置文件的修改应该脚本化，而非手动
2. **可逆性优先**：任何"添加"操作都要有对应的"移除"操作
3. **尊重用户配置**：merge 而非 overwrite，保留用户已有的配置
4. **版本升级友好**：自动清理废弃配置，避免配置膨胀

---

## 优缺点对比

### 命名前缀法的优点

| 优点 | 说明 |
|------|------|
| **实现简单** | 只需 `includes('prefix-')` 或 `startsWith('prefix-')` |
| **不污染结构** | 不需要额外的元数据字段 |
| **配置文件干净** | 用户查看配置时不会看到奇怪的标记字段 |
| **易于理解** | 一眼就能看出哪些是框架添加的 |

### 命名前缀法的缺点

| 缺点 | 说明 |
|------|------|
| **依赖命名约定** | 如果用户手动改名，卸载时找不到 |
| **可能误删** | 用户自己创建的 `gsd-` 开头的文件/hook 会被误删 |
| **升级风险** | 如果前缀变更，旧版本的配置无法被清理 |

### 替代方案：元数据标记法

```javascript
// 安装时添加元数据
settings.hooks.SessionStart.push({
  hooks: [{ type: 'command', command: '...' }],
  _managedBy: 'get-shit-done',  // 标记来源
  _version: '1.9.0'
});

// 卸载时精确匹配
settings.hooks.SessionStart = settings.hooks.SessionStart.filter(entry => {
  return entry._managedBy !== 'get-shit-done';
});
```

**对比**：

| 维度 | 命名前缀法 | 元数据标记法 |
|------|------------|--------------|
| 实现复杂度 | 低 | 中 |
| 精确度 | 依赖命名 | 100% 精确 |
| 配置文件美观 | ✅ 干净 | ❌ 有额外字段 |
| 用户改名后 | ❌ 找不到 | ✅ 仍能找到 |
| GSD 的选择 | ✅ 采用 | ❌ 未采用 |

**GSD 选择命名前缀法的原因**：
1. 框架定位是"开发工具"，用户不太会手动改名
2. 保持配置文件的简洁性
3. 降低实现复杂度

---

## 来源

- **项目**：get-shit-done
- **文件**：`bin/install.js`
- **发现时间**：2026-03-15
