<purpose>
列出所有待办的待办事项，允许选择，为选定的待办事项加载完整上下文，并路由到适当的操作。
</purpose>

<required_reading>
开始之前，请阅读调用提示词的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="init_context">
加载待办事项上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init todos)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取：`todo_count`、`todos`、`pending_dir`。

如果 `todo_count` 为 0：
```
没有待处理的待办事项。

待办事项是在工作会话中使用 /gsd:add-todo 捕获的。

---

您希望：

1. 继续当前阶段 (/gsd:progress)
2. 现在添加待办事项 (/gsd:add-todo)
```

退出。
</step>

<step name="parse_filter">
检查参数中的区域过滤器：
- `/gsd:check-todos` → 显示全部
- `/gsd:check-todos api` → 仅过滤到区域：api
</step>

<step name="list_todos">
使用初始化上下文中的 `todos` 数组（如果指定，已按区域过滤）。

解析并显示为编号列表：

```
待处理的待办事项：

1. 添加身份验证令牌刷新 (api, 2天前)
2. 修复模态 z-index 问题 (ui, 1天前)
3. 重构数据库连接池 (database, 5小时前)

---

回复编号查看详情，或：
- `/gsd:check-todos [区域]` 按区域过滤
- `q` 退出
```

将年龄显示为从创建时间戳算起的相对时间。
</step>

<step name="handle_selection">
等待用户回复编号。

如果有效：加载选定的待办事项，继续。
如果无效："无效选择。回复编号（1-[N]）或 `q` 退出。"
</step>

<step name="load_context">
完整读取待办事项文件。显示：

```
## [标题]

**区域：** [区域]
**创建：** [日期]（[相对时间]前）
**文件：** [列表或"无"]

### 问题
[问题部分内容]

### 解决方案
[解决方案部分内容]
```

如果 `files` 字段有条目，读取并简要总结每个。
</step>

<step name="check_roadmap">
检查路线图（可以使用初始化进度或直接检查文件存在）：

如果 `.planning/ROADMAP.md` 存在：
1. 检查待办事项的区域是否匹配即将到来的阶段
2. 检查待办事项的文件是否与阶段的范围重叠
3. 记录任何匹配以供操作选项使用
</step>

<step name="offer_actions">
**如果待办事项映射到路线图阶段：**

使用 AskUserQuestion：
- header: "操作"
- question: "此待办事项关系到阶段 [N]: [名称]。您想要做什么？"
- options:
  - "现在处理它" — 移动到完成，开始工作
  - "添加到阶段计划" — 在规划阶段 [N] 时包含
  - " brainstorm 方法" — 在决定前思考
  - "放回去" — 返回列表

**如果没有路线图匹配：**

使用 AskUserQuestion：
- header: "操作"
- question: "您想要对此待办事项做什么？"
- options:
  - "现在处理它" — 移动到完成，开始工作
  - "创建一个阶段" — /gsd:add-phase 使用此范围
  - "brainstorm 方法" — 在决定前思考
  - "放回去" — 返回列表
</step>

<step name="execute_action">
**现在处理它：**
```bash
mv ".planning/todos/pending/[filename]" ".planning/todos/done/"
```
更新 STATE.md 待办事项计数。展示问题/解决方案上下文。开始工作或询问如何继续。

**添加到阶段计划：**
在阶段规划笔记中记录待办事项引用。保持待处理状态。返回列表或退出。

**创建一个阶段：**
显示：`/gsd:add-phase [来自待办事项的描述]`
保持待处理状态。用户在新的上下文中运行命令。

**brainstorm 方法：**
保持待处理状态。开始讨论问题和方法的讨论。

**放回去：**
返回 list_todos 步骤。
</step>

<step name="update_state">
在任何改变待办事项计数的操作后：

重新运行 `init todos` 以获取更新的计数，然后如果存在则更新 STATE.md 的 "### Pending Todos" 部分。
</step>

<step name="git_commit">
如果待办事项已移动到 done/，提交更改：

```bash
git rm --cached .planning/todos/pending/[filename] 2>/dev/null || true
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: 开始处理待办事项 - [title]" --files .planning/todos/done/[filename] .planning/STATE.md
```

工具自动尊重 `commit_docs` 配置和 gitignore。

确认："已提交：docs: 开始处理待办事项 - [title]"
</step>

</process>

<success_criteria>
- [ ] 所有待处理的待办事项已列出，包含标题、区域、年龄
- [ ] 如果指定，应用区域过滤器
- [ ] 选定的待办事项的完整上下文已加载
- [ ] 已检查路线图上下文以匹配阶段
- [ ] 已提供适当的操作选项
- [ ] 已执行选定的操作
- [ ] 如果待办事项计数更改，STATE.md 已更新
- [ ] 更改已提交到 git（如果待办事项已移动到 done/）
</success_criteria>