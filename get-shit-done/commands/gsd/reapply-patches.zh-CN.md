---
description: 在 GSD 更新后重新应用本地修改
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

<purpose>
GSD 更新擦除并重新安装文件后，此命令将用户之前保存的本地修改合并回新版本。使用智能比较来处理上游文件也发生变化的情况。
</purpose>

<process>

## 第 1 步：检测已备份的补丁

检查本地补丁目录：

```bash
# 全局安装 — 检测运行时配置目录
if [ -d "$HOME/.config/opencode/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.config/opencode/gsd-local-patches"
elif [ -d "$HOME/.opencode/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.opencode/gsd-local-patches"
elif [ -d "$HOME/.gemini/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.gemini/gsd-local-patches"
else
  PATCHES_DIR="$HOME/.claude/gsd-local-patches"
fi
# 本地安装回退 — 检查所有运行时目录
if [ ! -d "$PATCHES_DIR" ]; then
  for dir in .config/opencode .opencode .gemini .claude; do
    if [ -d "./$dir/gsd-local-patches" ]; then
      PATCHES_DIR="./$dir/gsd-local-patches"
      break
    fi
  done
fi
```

从补丁目录读取 `backup-meta.json`。

**如果未找到补丁：**
```
未找到本地补丁。无需重新应用。

当您在修改任何 GSD 工作流、命令或代理文件后运行 /gsd:update 时，会自动保存本地补丁。
```
退出。

## 第 2 步：显示补丁摘要

```
## 要重新应用的本地补丁

**备份自：** v{from_version}
**当前版本：** {读取 VERSION 文件}
**修改的文件：** {count}

| # | 文件 | 状态 |
|---|------|--------|
| 1 | {file_path} | 待处理 |
| 2 | {file_path} | 待处理 |
```

## 第 3 步：合并每个文件

对于 `backup-meta.json` 中的每个文件：

1. **读取备份版本**（用户在 `gsd-local-patches/` 中修改的副本）
2. **读取新安装的版本**（更新后的当前文件）
3. **比较和合并：**

   - 如果新文件与备份文件相同：跳过（修改已包含在上游）
   - 如果新文件不同：识别用户的修改并将其应用到新版本

   **合并策略：**
   - 完整读取两个版本
   - 识别用户添加或修改的部分（查找新增内容，不仅仅是路径替换的差异）
   - 将用户的添加/修改应用到新版本
   - 如果用户修改的部分也已在上游发生变化：标记为冲突，显示两个版本，询问用户保留哪个

4. **写入合并结果**到安装位置
5. **报告状态：**
   - `已合并` — 用户修改已干净应用
   - `已跳过` — 修改已在上游
   - `冲突` — 用户选择了解决方案

## 第 4 步：更新清单

重新应用后，重新生成文件清单，以便未来的更新能正确检测这些为用户修改：

```bash
# 下次运行 /gsd:update 时将重新生成清单
# 目前只记录哪些文件被修改
```

## 第 5 步：清理选项

询问用户：
- "保留补丁备份用于参考？" → 保留 `gsd-local-patches/`
- "清理补丁备份？" → 删除 `gsd-local-patches/` 目录

## 第 6 步：报告

```
## 补丁已重新应用

| # | 文件 | 状态 |
|---|------|--------|
| 1 | {file_path} | ✓ 已合并 |
| 2 | {file_path} | ○ 已跳过（已在上游） |
| 3 | {file_path} | ⚠ 冲突已解决 |

{count} 个文件已更新。您的本地修改已重新激活。
```

</process>

<success_criteria>
- [ ] 所有已备份补丁已处理
- [ ] 用户修改已合并到新版本
- [ ] 冲突已通过用户输入解决
- [ ] 每个文件的状态已报告
</success_criteria>