# jacky-skills 安装方案设计

**来源**：get-shit-done / bin/install.js
**发现时间**：2026-03-15
**关键词**：#安装 #卸载 #前缀隔离 #manifest #多运行时

## 核心思想

借鉴 GSD 的安装机制，为 jacky-skills 实现一套"可安装 + 可更新 + 可卸载"的包管理方案。

## 问题背景

当前 jacky-skills 的痛点：
- 缺乏统一的安装/卸载机制
- 难以追踪哪些文件是框架安装的
- 更新时可能覆盖用户定制
- 不支持多运行时适配

## 设计要点

### 1. 前缀隔离

```
所有 jacky-skills 安装的文件使用 jacky- 前缀：
- commands/jacky-*.md
- agents/jacky-*.md
- hooks/jacky-*.js
- skills/jacky-*/
```

### 2. 文件清单 (Manifest)

```json
// jacky-manifest.json
{
  "version": "1.0.0",
  "timestamp": "2026-03-15T10:00:00.000Z",
  "skills": {
    "bilibili-to-obsidian": {
      "files": {
        "commands/jacky-bilibili.md": "sha256-hash",
        "agents/jacky-video-extractor.md": "sha256-hash"
      }
    }
  }
}
```

### 3. 清洁卸载

```bash
# 通过前缀匹配快速删除
rm -f commands/jacky-*.md
rm -f agents/jacky-*.md
rm -f hooks/jacky-*.js
rm -rf skills/jacky-*/
# 清理 settings.json 中的 jacky-* 配置
```

### 4. 本地修改保护

```
更新流程：
1. 读取 jacky-manifest.json
2. 对比当前文件哈希 vs manifest 哈希
3. 有差异 → 备份到 jacky-local-patches/
4. 覆盖安装
5. 提示用户运行 /jacky:reapply-patches
```

### 5. 多运行时适配

| 运行时 | Commands | Agents | Hooks 配置 |
|--------|----------|--------|------------|
| Claude Code | `commands/jacky/*.md` | `agents/jacky-*.md` | `settings.json` |
| OpenCode | `command/jacky-*.md` | `agents/jacky-*.md` | `opencode.json` |
| Gemini | `commands/jacky/*.md` | `agents/jacky-*.md` | `settings.json` |

## 代码示例

### 安装脚本核心逻辑

```javascript
// 安装单个 skill
function installSkill(skillName, targetDir, runtime) {
  const skillSrc = path.join(SKILLS_REPO, skillName);

  // 1. 复制 commands（带前缀）
  copyCommands(skillSrc, targetDir, 'jacky-' + skillName, runtime);

  // 2. 复制 agents（带前缀）
  copyAgents(skillSrc, targetDir, 'jacky-');

  // 3. 注册 hooks（如果有）
  registerHooks(skillSrc, targetDir, runtime);

  // 4. 更新 manifest
  updateManifest(targetDir, skillName, skillSrc);
}

// 卸载
function uninstall(targetDir) {
  // 1. 删除 commands/jacky-*
  removeFiles(targetDir, 'commands', 'jacky-*');

  // 2. 删除 agents/jacky-*
  removeFiles(targetDir, 'agents', 'jacky-*');

  // 3. 删除 hooks/jacky-*
  removeFiles(targetDir, 'hooks', 'jacky-*');

  // 4. 清理 settings.json
  cleanupSettings(targetDir, 'jacky-');
}
```

## 可能的复用场景

- [ ] jacky-skills：统一管理 skills 的安装/更新/卸载
- [ ] jacky-plugins：如果未来需要 plugin 体系
- [ ] 任何需要"框架安装 + 用户定制"的场景

## 与现有 j-skills CLI 的整合

现有 `j-skills` 命令：
- `j-skills link` - 软链接到全局
- `j-skills install` - 复制安装

新增命令：
- `j-skills install <skill> --global` - 全局安装（带 manifest）
- `j-skills update <skill>` - 更新单个 skill（保护本地修改）
- `j-skills uninstall <skill>` - 卸载单个 skill
- `j-skills list --installed` - 列出已安装的 skills

## 复用记录

- [ ] 待实现
