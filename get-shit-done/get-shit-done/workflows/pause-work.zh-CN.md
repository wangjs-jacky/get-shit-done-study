<目的>
创建 `.continue-here.md` 交接文件以在会话之间保存完整的工作状态。支持无缝恢复和完整上下文还原。
</目的>

<必读资料>
在开始前读取调用提示的 execution_context 引用的所有文件。
</必读资料>

<流程>

<step name="detect">
从最近修改的文件中查找当前阶段目录：

```bash
# 查找有工作的最近阶段目录
ls -lt .planning/phases/*/PLAN.md 2>/dev/null | head -1 | grep -oP 'phases/\K[^/]+'
```

如果未检测到活动阶段，询问用户他们在哪个阶段暂停工作。
</step>

<step name="gather">
**为交接收集完整状态：**

1. **当前位置**：哪个阶段，哪个计划，哪个任务
2. **已完成工作**：这次会议完成了什么
3. **剩余工作**：当前计划/阶段还剩下什么
4. **已做决定**：关键决定和理由
5. **阻碍/问题**：任何卡住的地方
6. **心理上下文**：方法、下一步、"氛围"
7. **修改的文件**：已更改但未提交的内容

如需要，通过对话问题向用户询问澄清。
</step>

<step name="write">
**将交接写入 `.planning/phases/XX-name/.continue-here.md`：**

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: [来自 current-timestamp 的时间戳]
---

<current_state>
[我们目前的确切位置？即时期待上下文]
</current_state>

<completed_work>

- 任务 1: [名称] - 已完成
- 任务 2: [名称] - 已完成
- 任务 3: [名称] - 进行中，[已完成的部分]
</completed_work>

<remaining_work>

- 任务 3: [剩余部分]
- 任务 4: 未开始
- 任务 5: 未开始
</remaining_work>

<decisions_made>

- 决定使用 [X] 因为 [理由]
- 选择 [方法] 而不是 [替代方案] 因为 [理由]
</decisions_made>

<blockers>
- [阻碍 1]: [状态/变通方法]
</blockers>

<context>
[心理状态，你在想什么，计划]
</context>

<next_action>
从 [恢复时的具体第一个动作] 开始
</next_action>
```

要具体到让新的 Claude 能立即理解。

对 last_updated 字段使用 `current-timestamp`。你可以使用 init todos（提供时间戳）或直接调用：
```bash
timestamp=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" current-timestamp full --raw)
```
</step>

<step name="commit">
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "wip: [phase-name] paused at task [X]/[Y]" --files .planning/phases/*/.continue-here.md
```
</step>

<step name="confirm">
```
✓ 交接已创建：.planning/phases/[XX-name]/.continue-here.md

当前状态：

- 阶段：[XX-name]
- 任务：[X] of [Y]
- 状态：[in_progress/blocked]
- 提交为 WIP

要恢复：/gsd:resume-work

```
</step>

</process>

<成功标准>
- [ ] .continue-here.md 在正确的阶段目录中创建
- [ ] 所有部分都填充了具体内容
- [ ] 提交为 WIP
- [ ] 用户知道位置和如何恢复
</成功标准>