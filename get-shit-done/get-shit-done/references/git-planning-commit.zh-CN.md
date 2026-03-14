# Git 计划提交

使用 gsd-tools CLI 提交规划工件，该工具自动检查 `commit_docs` 配置和 gitignore 状态。

## 通过 CLI 提交

始终对 `.planning/` 文件使用 `gsd-tools.cjs commit` — 它自动处理 `commit_docs` 和 gitignore 检查：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({范围}): {描述}" --files .planning/STATE.md .planning/ROADMAP.md
```

如果 `commit_docs` 为 `false` 或 `.planning/` 被 gitignore，CLI 将返回 `skipped`（带有原因）。不需要手动条件检查。

## 修改上一个提交

将 `.planning/` 文件更改合并到上一个提交中：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "" --files .planning/codebase/*.md --amend
```

## 提交消息模式

| 命令 | 范围 | 示例 |
|------|------|------|
| plan-phase | 阶段 | `docs(阶段-03): 创建认证计划` |
| execute-phase | 阶段 | `docs(阶段-03): 完成认证阶段` |
| new-milestone | 里程碑 | `docs: 开始里程碑 v1.1` |
| remove-phase | chore | `chore: 移除阶段 17（仪表板）` |
| insert-phase | 阶段 | `docs: 插入阶段 16.1（关键修复）` |
| add-phase | 阶段 | `docs: 添加阶段 07（设置页面）` |

## 何时跳过

- 配置中 `commit_docs: false`
- `.planning/` 被 gitignore
- 没有要提交的更改（使用 `git status --porcelain .planning/` 检查）