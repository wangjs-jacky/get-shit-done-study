<trigger>
在以下情况下使用此工作流：
- 在现有项目上开始新会话
- 用户说"继续"、"接下来是什么"、"我们在哪"、"恢复"
- 任何当 .planning/ 已存在时的规划操作
- 用户在离开项目后返回
</trigger>

<目的>
即时恢复完整项目上下文，使"我们在哪？"有立即、完整的答案。
</目的>

<必读资料>
@~/.claude/get-shit-done/references/continuation-format.md
</必读资料>

<流程>

<step name="initialize">
一次调用加载所有上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init resume)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析 JSON 以获取：`state_exists`, `roadmap_exists`, `project_exists`, `planning_exists`, `has_interrupted_agent`, `interrupted_agent_id`, `commit_docs`。

**如果 `state_exists` 为 true：** 继续 load_state
**如果 `state_exists` 为 false 但 `roadmap_exists` 或 `project_exists` 为 true：** 提议重建 STATE.md
**如果 `planning_exists` 为 false：** 这是新项目 → 路由到 /gsd:new-project
</step>

<step name="load_state">

读取并解析 STATE.md，然后是 PROJECT.md：

```bash
cat .planning/STATE.md
cat .planning/PROJECT.md
```

**从 STATE.md 中提取：**

- **项目参考**：核心价值和当前重点
- **当前位置**：阶段 X of Y，计划 A of B，状态
- **进度**：可视化进度条
- **最近决定**：影响当前工作的关键决定
- **待办事项**：会议期间捕获的想法
- **阻碍/担忧**：向前携带的问题
- **会话连续性**：我们停在哪里，任何恢复文件

**从 PROJECT.md 中提取：**

- **这是什么**：当前准确描述
- **需求**：已验证、活跃、超出范围
- **关键决定**：带有结果的完整决定日志
- **约束**：实施的硬性限制

</step>

<step name="check_incomplete_work">
寻找需要关注的不完整工作：

```bash
# 检查 continue-here 文件（计划中途恢复点）
ls .planning/phases/*/.continue-here*.md 2>/dev/null

# 检查没有摘要的计划（不完整执行）
for plan in .planning/phases/*/*-PLAN.md; do
  summary="${plan/PLAN/SUMMARY}"
  [ ! -f "$summary" ] && echo "Incomplete: $plan"
done 2>/dev/null

# 检查中断的代理（使用 init 中的 has_interrupted_agent 和 interrupted_agent_id）
if [ "$has_interrupted_agent" = "true" ]; then
  echo "Interrupted agent: $interrupted_agent_id"
fi
```

**如果 .continue-here 文件存在：**

- 这是计划中途的恢复点
- 为特定恢复上下文读取文件
- 标志："找到计划中途检查点"

**如果存在没有 SUMMARY 的 PLAN：**

- 执行已开始但未完成
- 标志："找到不完整的计划执行"

**如果找到中断的代理：**

- 子代理已生成但会话在完成前结束
- 从 agent-history.json 读取任务详情
- 标志："找到中断的代理"
  </step>

<step name="present_status">
向用户显示完整的项目状态：

```
╔══════════════════════════════════════════════════════════════╗
║  项目状态                                                       ║
╠══════════════════════════════════════════════════════════════╣
║  构建中：[来自 PROJECT.md "这是什么"的单行描述]                  ║
║                                                               ║
║  阶段：[X] of [Y] - [阶段名称]                               ║
║  计划：[A] of [B] - [状态]                                   ║
║  进度：[██████░░░░] XX%                                       ║
║                                                               ║
║  最近活动：[日期] - [发生了什么]                              ║
╚══════════════════════════════════════════════════════════════╝

[如果发现不完整工作:]
⚠️  检测到不完整工作：
    - [.continue-here 文件或不完整计划]

[如果找到中断的代理:]
⚠️  检测到中断的代理：
    代理 ID: [id]
    任务：[来自 agent-history.json 的任务描述]
    中断：[时间戳]

    使用以下方式恢复：Task 工具（resume 参数带代理 ID）

[如果有待办事项:]
📋 [N] 个待办事项 — /gsd:check-todos 查看

[如果存在阻碍:]
⚠️  携带的问题：
    - [阻碍 1]
    - [阻碍 2]

[如果对齐不是 ✓:]
⚠️  简要对齐：[状态] - [评估]
```

</step>

<step name="determine_next_action">
基于项目状态，确定最合乎逻辑的下一个动作：

**如果存在中断的代理：**
→ 主要：恢复中断的代理（Task 工具带 resume 参数）
→ 选项：重新开始（放弃代理工作）

**如果 .continue-here 文件存在：**
→ 主要：从检查点恢复
→ 选项：在当前计划上重新开始

**如果不完整的计划（PLAN 没有 SUMMARY）：**
→ 主要：完成不完整的计划
→ 选项：放弃并继续

**如果阶段进行中，所有计划完成：**
→ 主要：转换到下一阶段
→ 选项：审查已完成的工作

**如果阶段准备好计划：**
检查此阶段是否存在 CONTEXT.md：

- 如果 CONTEXT.md 缺失：
  → 主要：讨论阶段愿景（用户想象它如何工作）
  → 次要：直接计划（跳过上下文收集）
- 如果 CONTEXT.md 存在：
  → 主要：计划阶段
  → 选项：审查路线图

**如果阶段准备好执行：**
→ 主要：执行下一个计划
→ 选项：先审查计划
</step>

<step name="offer_options">
基于项目状态提供上下文选项：

```
您想要做什么？

[基于状态的主要动作 - 例如：]
1. 恢复中断的代理 [如果找到中断的代理]
   或者
1. 执行阶段 (/gsd:execute-phase {phase})
   或者
1. 讨论阶段 3 上下文 (/gsd:discuss-phase 3) [如果 CONTEXT.md 缺失]
   或者
1. 计划阶段 3 (/gsd:plan-phase 3) [如果 CONTEXT.md 存在或讨论选项被拒绝]

[次要选项：]
2. 审查当前阶段状态
3. 检查待办事项 ([N] 个待办)
4. 审查简要对齐
5. 其他事情
```

**注意：** 提供阶段规划时，首先检查 CONTEXT.md 是否存在：

```bash
ls .planning/phases/XX-name/*-CONTEXT.md 2>/dev/null
```

如果缺失，建议在计划前讨论阶段。如果存在，直接提供计划。

等待用户选择。
</step>

<step name="route_to_workflow">
基于用户选择，路由到适当的工作流：

- **执行计划** → 显示用户在清除后运行的命令：
  ```
  ---

  ## ▶ 接下来做什么

  **{phase}-{plan}: [计划名称]** — [来自 PLAN.md 的目标]

  `/gsd:execute-phase {phase}`

  <sub>`/clear` 首先 → 新鲜的上下文窗口</sub>

  ---
  ```
- **计划阶段** → 显示用户在清除后运行的命令：
  ```
  ---

  ## ▶ 接下来做什么

  **阶段 [N]: [名称]** — [来自 ROADMAP.md 的目标]

  `/gsd:plan-phase [phase-number]`

  <sub>`/clear` 首先 → 新鲜的上下文窗口</sub>

  ---

  **也可用：**
  - `/gsd:discuss-phase [N]` — 首先收集上下文
  - `/gsd:research-phase [N]` — 调查未知因素

  ---
  ```
- **转换** → ./transition.md
- **检查待办事项** → 读取 .planning/todos/pending/，显示摘要
- **审查对齐** → 读取 PROJECT.md，与当前状态比较
- **其他事情** → 询问他们需要什么
</step>

<step name="update_session">
在路由到工作流之前，更新会话连续性：

更新 STATE.md：

```markdown
## 会话连续性

上一个会话：[现在]
停在了：会话已恢复，继续到 [动作]
恢复文件：[如适用，已更新]
```

这确保如果会话意外结束，下一次恢复知道状态。
</step>

</process>

<reconstruction>
如果 STATE.md 缺失但其他工件存在：

"STATE.md 缺失。从工件重建..."

1. 读取 PROJECT.md → 提取 "这是什么" 和核心价值
2. 读取 ROADMAP.md → 确定阶段，找到当前位置
3. 扫描 \*-SUMMARY.md 文件 → 提取决定、担忧
4. 计算 .planning/todos/pending/ 中的待办事项数量
5. 检查 .continue-here 文件 → 会话连续性

重建并写入 STATE.md，然后正常继续。

这处理以下情况：

- 项目在 STATE.md 引入之前就存在
- 文件被意外删除
- 克隆仓库时没有完整的 .planning/ 状态
  </reconstruction>

<quick_resume>
如果用户说"继续"或"走"：
- 静默加载状态
- 确定主要动作
- 立即执行而不显示选项

"从 [状态] 继续... [动作]"
</quick_resume>

<success_criteria>
当满足以下条件时，恢复完成：

- [ ] STATE.md 已加载（或重建）
- [ ] 已检测到不完整工作并标记
- [ ] 已向用户显示清晰的状态
- [ ] 已提供上下文的下一步动作
- [ ] 用户确切知道项目所在位置
- [ ] 会话连续性已更新
      </success_criteria>