<purpose>
通过 npm 检查 GSD 更新，显示已安装版本和最新版本之间的变更日志，获取用户确认，并执行带缓存清理的干净安装。
</purpose>

<required_reading>
开始前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="get_installed_version">
通过检查两个位置并验证安装完整性来检测 GSD 是本地安装还是全局安装：

```bash
# 先检查本地（仅在有效时优先）
# 检测运行时配置目录（支持 Claude、OpenCode、Gemini）
LOCAL_VERSION_FILE="" LOCAL_MARKER_FILE="" LOCAL_DIR=""
for dir in .claude .config/opencode .opencode .gemini; do
  if [ -f "./$dir/get-shit-done/VERSION" ]; then
    LOCAL_VERSION_FILE="./$dir/get-shit-done/VERSION"
    LOCAL_MARKER_FILE="./$dir/get-shit-done/workflows/update.md"
    LOCAL_DIR="$(cd "./$dir" 2>/dev/null && pwd)"
    break
  fi
done
GLOBAL_VERSION_FILE="" GLOBAL_MARKER_FILE="" GLOBAL_DIR=""
for dir in .claude .config/opencode .opencode .gemini; do
  if [ -f "$HOME/$dir/get-shit-done/VERSION" ]; then
    GLOBAL_VERSION_FILE="$HOME/$dir/get-shit-done/VERSION"
    GLOBAL_MARKER_FILE="$HOME/$dir/get-shit-done/workflows/update.md"
    GLOBAL_DIR="$(cd "$HOME/$dir" 2>/dev/null && pwd)"
    break
  fi
done

# 只有在解析路径不同时才视为本地安装（防止 CWD=$HOME 时的误检测）
IS_LOCAL=false
if [ -n "$LOCAL_VERSION_FILE" ] && [ -f "$LOCAL_VERSION_FILE" ] && [ -f "$LOCAL_MARKER_FILE" ] && grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+' "$LOCAL_VERSION_FILE"; then
  if [ -z "$GLOBAL_DIR" ] || [ "$LOCAL_DIR" != "$GLOBAL_DIR" ]; then
    IS_LOCAL=true
  fi
fi

if [ "$IS_LOCAL" = true ]; then
  cat "$LOCAL_VERSION_FILE"
  echo "LOCAL"
elif [ -n "$GLOBAL_VERSION_FILE" ] && [ -f "$GLOBAL_VERSION_FILE" ] && [ -f "$GLOBAL_MARKER_FILE" ] && grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+' "$GLOBAL_VERSION_FILE"; then
  cat "$GLOBAL_VERSION_FILE"
  echo "GLOBAL"
else
  echo "UNKNOWN"
fi
```

解析输出：
- 如果最后一行是 "LOCAL"：本地安装有效；已安装版本为第一行；使用 `--local`
- 如果最后一行是 "GLOBAL"：本地缺少/无效，全局安装有效；已安装版本为第一行；使用 `--global`
- 如果是 "UNKNOWN"：继续到安装步骤（视为版本 0.0.0）

**如果 VERSION 文件缺失：**
```
## GSD 更新

**已安装版本:** 未知

您的安装不包含版本跟踪。

运行全新安装...
```

继续到安装步骤（视为版本 0.0.0 进行比较）。
</step>

<step name="check_latest_version">
检查 npm 上的最新版本：

```bash
npm view get-shit-done-cc version 2>/dev/null
```

**如果 npm 检查失败：**
```
无法检查更新（离线或 npm 不可用）。

手动更新：`npx get-shit-done-cc --global`
```

退出。
</step>

<step name="compare_versions">
比较已安装版本和最新版本：

**如果已安装 == 最新：**
```
## GSD 更新

**已安装:** X.Y.Z
**最新:** X.Y.Z

您已经是最新版本。
```

退出。

**如果已安装 > 最新：**
```
## GSD 更新

**已安装:** X.Y.Z
**最新:** A.B.C

您领先于最新发布版本（开发版本？）。
```

退出。
</step>

<step name="show_changes_and_confirm">
**如果有更新可用**，在更新之前获取并显示更新内容：

1. 从 GitHub raw URL 获取变更日志
2. 提取已安装版本和最新版本之间的条目
3. 显示预览并请求确认：

```
## GSD 更新可用

**已安装:** 1.5.10
**最新:** 1.5.15

### 更新内容
────────────────────────────────────────────────────────────

## [1.5.15] - 2026-01-20

### 新增功能
- 功能 X

## [1.5.14] - 2026-01-18

### 修复
- 修复 Bug Y

────────────────────────────────────────────────────────────

⚠️ **注意：** 安装程序会执行 GSD 文件夹的干净安装：
- `commands/gsd/` 将被清空并替换
- `get-shit-done/` 将被清空并替换
- `agents/gsd-*` 文件将被替换

（路径相对于您的安装位置：全局为 `~/.claude/`，本地为 `./.claude/`）

您在其他位置的自定义文件将保留：
- 不在 `commands/gsd/` 中的自定义命令 ✓
- 不以 `gsd-` 开头自定义代理 ✓
- 自定义钩子 ✓
- 您的 CLAUDE.md 文件 ✓

如果您直接修改了任何 GSD 文件，它们将自动备份到 `gsd-local-patches/`，更新后可使用 `/gsd:reapply-patches` 重新应用。
```

使用 AskUserQuestion：
- 问题："继续更新？"
- 选项：
  - "是的，立即更新"
  - "不，取消"

**如果用户取消：** 退出。
</step>

<step name="run_update">
使用在步骤 1 中检测到的安装类型运行更新：

**如果为本地安装：**
```bash
npx -y get-shit-done-cc@latest --local
```

**如果为全局安装（或未知）：**
```bash
npx -y get-shit-done-cc@latest --global
```

捕获输出。如果安装失败，显示错误并退出。

清理更新缓存，使状态栏指示器消失：

```bash
# 清理所有运行时目录的更新缓存
for dir in .claude .config/opencode .opencode .gemini; do
  rm -f "./$dir/cache/gsd-update-check.json"
  rm -f "$HOME/$dir/cache/gsd-update-check.json"
done
```

SessionStart 钩子（`gsd-check-update.js`）会写入检测到的运行时的缓存目录，因此必须清除所有路径以防止过期的更新指示器。
</step>

<step name="display_result">
格式化完成消息（变更日志已在确认步骤中显示）：

```
╔════════════════════════════════════════════════════════════╗
║  GSD 已更新: v1.5.10 → v1.5.15                           ║
╚═══════════════════════════════════════════════════════════╝

⚠️  重启 Claude Code 以获取新的命令。

[查看完整变更日志](https://github.com/glittercowboy/get-shit-done/blob/main/CHANGELOG.md)
```
</step>

<step name="check_local_patches">
更新完成后，检查安装程序是否检测并备份了任何本地修改的文件：

在配置目录中检查 gsd-local-patches/backup-meta.json。

**如果发现补丁：**

```
本地补丁在更新前已备份。
运行 /gsd:reapply-patches 将您的修改合并到新版本中。
```

**如果没有补丁：** 正常继续。
</step>
</process>

<success_criteria>
- [ ] 已安装版本正确读取
- [ ] 通过 npm 检查最新版本
- [ ] 如果已是最新版本则跳过更新
- [ ] 在更新前获取并显示变更日志
- [ ] 显示干净安装警告
- [ ] 获取用户确认
- [ ] 成功执行更新
- [ ] 显示重启提醒
</success_criteria>