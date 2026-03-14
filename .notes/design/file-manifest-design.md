# File Manifest 设计

> 通过哈希清单实现"可更新 + 可定制"的包管理

## 问题

框架如何既支持版本更新，又允许用户本地定制？

## 答案

### 核心机制

安装时写入 `gsd-file-manifest.json`，记录所有文件的 SHA256 哈希：

```json
{
  "version": "1.22.4",
  "timestamp": "2026-03-14T17:46:19.753Z",
  "files": {
    "get-shit-done/VERSION": "fd47955abd531483c0ae18205d3d131ad7a3656bc7e0effd3e32dc8200af54ee",
    "get-shit-done/bin/gsd-tools.cjs": "eb502c04b24c2c4cd975eada6a45773df1f9cc8bc8c74d9a34587c2484bb5d10",
    "agents/gsd-planner.md": "..."
  }
}
```

### 更新时的工作流

```
用户运行 /gsd:update
        │
        ▼
┌─────────────────────────────────┐
│ 1. 读取 manifest 中的原始哈希    │
│ 2. 计算当前文件的哈希            │
│ 3. 比对差异                      │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ 有差异？                         │
│                                 │
│ YES → 备份到 gsd-local-patches/ │
│       提示运行 /gsd:reapply-patches │
│ NO  → 正常更新                   │
└─────────────────────────────────┘
```

### 源码实现

```javascript
// install.js
function saveLocalPatches(configDir) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const [relPath, originalHash] of Object.entries(manifest.files)) {
    const currentHash = fileHash(fullPath);
    if (currentHash !== originalHash) {
      // 文件被修改过，备份保护
      modified.push(relPath);
    }
  }

  // 备份到 gsd-local-patches/
  if (modified.length > 0) {
    fs.writeFileSync(path.join(patchesDir, 'backup-meta.json'), ...);
  }
}
```

## 设计亮点

| 场景 | 没有 manifest | 有 manifest |
|------|--------------|-------------|
| 用户修改被覆盖 | 静默丢失 | 检测并备份 |
| 更新冲突 | 无感知 | 明确提示 |
| 定制能力 | 不敢改 | 放心改 |

## 类比

- npm 的 `package-lock.json`
- Git 的对象哈希
- Homebrew 的 formula 校验

## 可复用场景

- [ ] jacky-skills：skills 更新时保护用户定制
- [ ] 任何需要"框架更新 + 用户定制"的场景
