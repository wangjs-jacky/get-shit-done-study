<purpose>

在现有整数阶段之间插入小数阶段用于里程碑期间发现的紧急工作。使用小数编号（72.1、72.2 等）来保留计划阶段的逻辑序列，同时在不重新编号整个路线图的情况下容纳紧急插入。

</purpose>

<required_reading>

在开始之前，阅读调用提示的 execution_context 引用的所有文件。

</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 第一个参数：要插入的整数阶段编号
- 剩余参数：阶段描述

示例：`/gsd:insert-phase 72 Fix critical auth bug`
-> after = 72
-> description = "Fix critical auth bug"

如果参数缺失：

```
ERROR: Both phase number and description required
Usage: /gsd:insert-phase <after> <description>
Example: /gsd:insert-phase 72 Fix critical auth bug
```

退出。

验证第一个参数是整数。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${after_phase}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中检查 `roadmap_exists`。如果为 false：
```
ERROR: No roadmap found (.planning/ROADMAP.md)
```
退出。
</step>

<step name="insert_phase">
**将阶段插入委托给 gsd-tools：**

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase insert "${after_phase}" "${description}")
```

CLI 处理：
- 验证目标阶段在 ROADMAP.md 中存在
- 计算下一个小数阶段编号（检查磁盘上现有小数）
- 从描述生成 slug
- 创建阶段目录（`.planning/phases/{N.M}-{slug}/`）
- 在 ROADMAP.md 中目标阶段后插入阶段条目，带有 (INSERTED) 标记

从结果中提取：`phase_number`, `after_phase`, `name`, `slug`, `directory`。
</step>

<step name="update_project_state">
更新 STATE.md 以反映插入的阶段：

1. 读取 `.planning/STATE.md`
2. 在 "## Accumulated Context" → "### Roadmap Evolution" 下添加条目：
   ```
   - Phase {decimal_phase} inserted after Phase {after_phase}: {description} (URGENT)
   ```

如果 "Roadmap Evolution" 部分不存在，创建它。
</step>

<step name="completion">
呈现完成摘要：

```
Phase {decimal_phase} inserted after Phase {after_phase}:
- Description: {description}
- Directory: .planning/phases/{decimal-phase}-{slug}/
- Status: Not planned yet
- Marker: (INSERTED) - indicates urgent work

Roadmap updated: .planning/ROADMAP.md
Project state updated: .planning/STATE.md

---

## Next Up

**Phase {decimal_phase}: {description}** -- urgent insertion

`/gsd:plan-phase {decimal_phase}`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- Review insertion impact: Check if Phase {next_integer} dependencies still make sense
- Review roadmap

---
```
</step>

</process>

<anti_patterns>

- 不要将此用于里程碑末端的计划工作（使用 /gsd:add-phase）
- 不要在阶段 1 前插入（小数 0.1 没有意义）
- 不要重新编号现有阶段
- 不要修改目标阶段内容
- 不要创建计划（那是 /gsd:plan-phase）
- 不要提交更改（用户决定何时提交）
</anti_patterns>

<success_criteria>
当以下条件满足时，阶段插入完成：

- [ ] `gsd-tools phase insert` 执行成功
- [ ] 阶段目录已创建
- [ ] 路线图已更新新阶段条目（包含 "(INSERTED)" 标记）
- [ ] STATE.md 已更新路线图演化说明
- [ ] 用户被告知后续步骤和依赖关系影响
</success_criteria>