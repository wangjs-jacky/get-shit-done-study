---
article_id: OBA-pbvmlt4a
tags: [open-source, get-shit-done, gsd-interruption-guide.md, ai, git]
type: tutorial
updated_at: 2026-03-17
---

# GSD 工作流中断与恢复指南

> 当 context 溢出或临时需要中断 GSD 工作流时，如何正确保存状态并恢复

## 目录

- [一、什么时候需要中断](#一什么时候需要中断)
- [二、暂停工作流程](#二暂停工作流程)
- [三、恢复工作流程](#三恢复工作流程)
- [四、自动创建的文件](#四自动创建的文件)
- [五、最佳实践](#五最佳实践)

---

## 一、什么时候需要中断

| 场景 | 描述 |
|------|------|
| **Context 溢出** | 对话历史过长，AI 提示 "context exceeded" 或响应变慢 |
| **临时有事** | 需要离开电脑，无法继续当前任务 |
| **切换任务** | 需要暂时处理其他紧急事项 |
| **需要清理上下文** | 当前会话信息过多，需要 "清空大脑" 重新开始 |

---

## 二、暂停工作流程

### 2.1 主动暂停

当需要主动暂停时，执行：

```
/gsd:pause-work
```

### 2.2 暂停时发生了什么

AI 会自动完成以下操作：

```
1. 检测当前阶段
   └── 查找最近修改的 PLAN.md 文件

2. 收集完整状态
   ├── 当前位置：哪个阶段、哪个任务
   ├── 已完成工作
   ├── 剩余工作
   ├── 已做决定
   ├── 阻碍/问题
   └── 心理上下文（下一步计划）

3. 创建交接文件
   └── .planning/phases/XX-name/.continue-here.md

4. Git 提交
   └── 作为 WIP（Work In Progress）提交
```

### 2.3 暂停成功提示

```
✓ 交接已创建：.planning/phases/[XX-name]/.continue-here.md

当前状态：
┌───────────┬───────────────┐
│   Field   │     Value     │
├───────────┼───────────────┤
│ Phase     │ XX-name       │
│ Task      │ X of Y        │
│ Status    │ in_progress   │
│ Committed │ ✓ WIP         │
└───────────┴───────────────┘

要恢复：/gsd:resume-work
```

---

## 三、恢复工作流程

### 3.1 标准恢复步骤

```bash
# 第一步：清空当前会话（释放 context）
/clear

# 第二步：恢复工作
/gsd:resume-work
```

### 3.2 恢复时发生了什么

```
1. 加载项目状态
   ├── 读取 .planning/STATE.md
   └── 读取 .planning/PROJECT.md

2. 检测未完成工作
   ├── 检查 .continue-here.md 文件
   ├── 检查没有 SUMMARY 的 PLAN
   └── 检查中断的代理

3. 展示项目状态
   ┌──────────────────────────────────────────────────────────┐
   │  项目状态                                                  │
   ├──────────────────────────────────────────────────────────┤
   │  构建中：[项目描述]                                        │
   │  阶段：[X] of [Y] - [阶段名称]                            │
   │  计划：[A] of [B] - [状态]                                │
   │  进度：[██████░░░░] XX%                                    │
   │  最近活动：[日期] - [发生了什么]                           │
   └──────────────────────────────────────────────────────────┘

4. 提供下一步选项
   1. 继续执行当前计划
   2. 审查当前阶段状态
   3. 检查待办事项
   4. 其他操作
```

### 3.3 快速恢复

如果你只说 "继续" 或 "走"，AI 会：

1. 静默加载状态
2. 确定主要动作
3. 立即执行而不显示选项

---

## 四、自动创建的文件

### 4.1 交接文件 (.continue-here.md)

位置：`.planning/phases/XX-name/.continue-here.md`

结构：

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: 2024-01-15T10:30:00Z
---

<current_state>
[当前具体位置和即时上下文]
</current_state>

<completed_work>
- 任务 1: [名称] - 已完成
- 任务 2: [名称] - 已完成
- 任务 3: [名称] - 进行中，[已完成的部分]
</completed_work>

<remaining_work>
- 任务 3: [剩余部分]
- 任务 4: 未开始
</remaining_work>

<decisions_made>
- 决定使用 [X] 因为 [理由]
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

### 4.2 状态文件 (STATE.md)

位置：`.planning/STATE.md`

包含：
- 项目参考
- 当前位置
- 进度条
- 最近决定
- 待办事项
- 阻碍/担忧
- 会话连续性

---

## 五、最佳实践

### 5.1 何时使用暂停

| 使用 `/gsd:pause-work` | 不需要暂停 |
|------------------------|-----------|
| Context 即将溢出 | 简单的问答 |
| 需要离开超过 30 分钟 | 快速查看信息 |
| 切换到其他项目 | 临时测试代码 |
| 完成一个阶段后想休息 | 短暂的休息（< 10 分钟）|

### 5.2 中断前的好习惯

1. **让 AI 完成当前任务**：不要在代码写一半时中断
2. **明确告诉 AI 你要暂停**：说 "我需要暂停，帮我保存状态"
3. **检查 Git 状态**：确保所有改动都被追踪

### 5.3 恢复后的好习惯

1. **先看状态报告**：了解上次停在哪里
2. **检查未完成工作**：看看有没有中断的代理
3. **更新心理上下文**：如果有新的想法，告诉 AI

### 5.4 常见问题

**Q: Context 已经溢出了，无法执行 `/gsd:pause-work` 怎么办？**

A: 直接执行 `/clear`，然后 `/gsd:resume-work`。GSD 会从 `.continue-here.md` 或未完成的 PLAN 自动检测你的工作状态。

**Q: 忘记暂停就关闭了会话怎么办？**

A: 下次打开时执行 `/gsd:resume-work`，GSD 会：
- 检查没有 SUMMARY 的 PLAN（未完成的执行）
- 从 ROADMAP 和已完成的 SUMMARY 重建状态

**Q: 多个阶段都有 `.continue-here.md` 怎么办？**

A: GSD 会选择最近修改的那个，但你也可以手动删除旧的。

---

## 六、速查表

| 场景 | 命令 |
|------|------|
| 主动暂停 | `/gsd:pause-work` |
| 恢复工作 | `/clear` → `/gsd:resume-work` |
| 快速恢复 | "继续" 或 "走" |
| 检查进度 | `/gsd:progress` |
| 查看待办 | `/gsd:check-todos` |

---

## 七、工作流示意图

```
正常工作流程
    │
    ▼
需要中断？
    │
    ├── 是 → /gsd:pause-work
    │              │
    │              ▼
    │         创建 .continue-here.md
    │              │
    │              ▼
    │         Git WIP 提交
    │              │
    │              ▼
    │         会话结束
    │              │
    │              ▼
    │         /clear
    │              │
    │              ▼
    │         /gsd:resume-work
    │              │
    │              ▼
    │         加载状态 → 继续工作
    │
    └── 否 → 继续工作
```

---

## 参考资料

- [pause-work 工作流源码](../get-shit-done/get-shit-done/workflows/pause-work.zh-CN.md)
- [resume-project 工作流源码](../get-shit-done/get-shit-done/workflows/resume-project.zh-CN.md)
