<purpose>
从项目路线图中移除未开始的未来阶段，删除其目录，重新编号所有后续阶段以保持清晰的线性序列，并提交更改。git 提交作为移除的历史记录。
</purpose>

<required_reading>
在开始之前，读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 参数是要移除的阶段编号（整数或小数）
- 示例：`/gsd:remove-phase 17` → phase = 17
- 示例：`/gsd:remove-phase 16.1` → phase = 16.1

如果没有提供参数：

```
ERROR: 需要阶段编号
用法: /gsd:remove-phase <阶段编号>
示例: /gsd:remove-phase 17
```

退出。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${target}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

提取：`phase_found`, `phase_dir`, `phase_number`, `commit_docs`, `roadmap_exists`。

同时读取 STATE.md 和 ROADMAP.md 内容以解析当前位置。
</step>

<step name="validate_future_phase">
验证该阶段是未来阶段（未开始）：

1. 将目标阶段与 STATE.md 中的当前阶段进行比较
2. 目标必须 > 当前阶段编号

如果目标 <= 当前阶段：

```
ERROR: 无法移除阶段 {target}

只能移除未来阶段：
- 当前阶段：{current}
- 阶段 {target} 是当前或已完成

要放弃当前工作，请使用 /gsd:pause-work。
```

退出。
</step>

<step name="confirm_removal">
展示移除摘要并确认：

```
移除阶段 {target}: {Name}

这将：
- 删除：.planning/phases/{target}-{slug}/
- 重新编号所有后续阶段
- 更新：ROADMAP.md, STATE.md

继续？(y/n)
```

等待确认。
</step>

<step name="execute_removal">
**将整个移除操作委托给 gsd-tools：**

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase remove "${target}")
```

如果该阶段有已执行的计划（SUMMARY.md 文件），gsd-tools 将报错。仅在用户确认时使用 `--force`：

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase remove "${target}" --force)
```

CLI 处理：
- 删除阶段目录
- 以逆序重新编号所有目录（避免冲突）
- 重命名重新编号目录内的所有文件（PLAN.md、SUMMARY.md 等）
- 更新 ROADMAP.md（移除部分，重新编号所有阶段引用，更新依赖）
- 更新 STATE.md（减少阶段计数）

从结果中提取：`removed`, `directory_deleted`, `renamed_directories`, `renamed_files`, `roadmap_updated`, `state_updated`。
</step>

<step name="commit">
暂存并提交移除：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: 移除阶段 {target} ({original-phase-name})" --files .planning/
```

提交消息保留了被移除内容的历史记录。
</step>

<step name="completion">
展示完成摘要：

```
阶段 {target} ({original-name}) 已移除。

更改：
- 已删除：.planning/phases/{target}-{slug}/
- 重新编号：{N} 个目录和 {M} 个文件
- 已更新：ROADMAP.md, STATE.md
- 已提交：chore: 移除阶段 {target} ({original-name})

---

## 接下来

您想要：
- `/gsd:progress` — 查看更新的路线图状态
- 继续当前阶段
- 审查路线图

---
```
</step>

</process>

<anti_patterns>

- 不要在没有 --force 的情况下移除已完成阶段（有 SUMMARY.md 文件）
- 不要移除当前或过去的阶段
- 不要手动重新编号 — 使用 `gsd-tools phase remove` 处理所有重新编号
- 不要在 STATE.md 中添加"已移除阶段"注释 — git 提交是记录
- 不要修改已完成的阶段目录
</anti_patterns>

<success_criteria>
阶段移除完成时：

- [ ] 目标阶段验证为未来/未开始
- [ ] `gsd-tools phase remove` 成功执行
- [ ] 使用描述性消息提交更改
- [ ] 用户获知更改
</success_criteria>