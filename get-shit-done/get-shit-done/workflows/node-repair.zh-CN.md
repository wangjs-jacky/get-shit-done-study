<purpose>
失败任务验证的自主修复操作符。由 execute-plan 在任务完成其完成条件时调用。在升级到用户之前提出并尝试结构化修复。
</purpose>

<inputs>
- FAILED_TASK: 计划中的任务编号、名称和完成条件
- ERROR: 验证产生的内容 — 实际结果与预期
- PLAN_CONTEXT: 相邻任务和阶段目标（用于约束感知）
- REPAIR_BUDGET: 最大修复尝试剩余次数（默认：2）
</inputs>

<repair_directive>
分析失败并选择一种修复策略：

**RETRY** — 方法正确但执行失败。进行具体调整后重试。
- 使用场景：命令错误、缺少依赖、错误路径、环境问题、瞬时故障
- 输出：`RETRY: [重试前要做的具体调整]`

**DECOMPOSE** — 任务太粗粒度。将其分解为更小的可验证子步骤。
- 使用场景：完成条件涵盖多个关注点，实现差距是结构性的
- 输出：`DECOMPOSE: [子任务 1] | [子任务 2] | ...`（最多 3 个子任务）
- 子任务必须每个都有单一可验证的结果

**PRUNE** — 当前约束下任务不可行。跳过并提供理由。
- 使用场景：先决条件缺失且无法在此处修复、超出范围、与之前决策矛盾
- 输出：`PRUNE: [单句理由]`

**ESCALATE** — 修复预算耗尽，或这是架构决策（规则 4）。
- 使用场景：RETRY 已用不同方法尝试多次失败，或修复需要结构更改
- 输出：`ESCALATE: [尝试了什么] | [需要什么决策]`
</repair_directive>

<process>

<step name="diagnose>
仔细阅读错误和完成条件。询问：
1. 这是瞬时/环境问题吗？→ RETRY
2. 任务可验证地太宽泛吗？→ DECOMPOSE
3. 先决条件确实缺失且无法在范围内修复吗？→ PRUNE
4. RETRY 已对该任务尝试过吗？检查 REPAIR_BUDGET。如果为 0 → ESCALATE
</step>

<step name="execute_retry>
如果 RETRY：
1. 应用指令中说明的具体调整
2. 重新运行任务实现
3. 重新运行验证
4. 如果通过 → 正常继续，记录 `[Node Repair - RETRY] Task [X]: [adjustment made]`
5. 如果再次失败 → 减少 REPAIR_BUDGET，使用更新上下文重新调用 node-repair
</step>

<step name="execute_decompose>
如果 DECOMPOSE：
1. 将失败的任务内联替换为子任务（不要修改磁盘上的 PLAN.md）
2. 顺序执行子任务，每个都有其自己的验证
3. 如果所有子任务通过 → 将原始任务视为成功，记录 `[Node Repair - DECOMPOSE] Task [X] → [N] sub-tasks`
4. 如果子任务失败 → 为该子任务重新调用 node-repair（REPAIR_BUDGET 每个子任务应用）
</step>

<step name="execute_prune>
如果 PRUNE：
1. 将任务标记为跳过并提供理由
2. 在 SUMMARY 的 "Issues Encountered" 下记录：`[Node Repair - PRUNE] Task [X]: [justification]`
3. 继续下一个任务
</step>

<step name="execute_escalate>
如果 ESCALATE：
1. 通过 verification_failure_gate 向用户展示完整修复历史
2. 呈现：尝试了什么（每个 RETRY/DECOMPOSE 尝试）、阻塞器是什么、可用选项
3. 等待用户指示后再继续
</step>

</process>

<logging>
所有修复操作必须出现在 SUMMARY.md 的 "## Deviations from Plan" 下：

| 类型 | 格式 |
|------|--------|
| RETRY 成功 | `[Node Repair - RETRY] Task X: [adjustment] — resolved` |
| RETRY 失败 → ESCALATE | `[Node Repair - RETRY] Task X: [N] attempts exhausted — escalated to user` |
| DECOMPOSE | `[Node Repair - DECOMPOSE] Task X split into [N] sub-tasks — all passed` |
| PRUNE | `[Node Repair - PRUNE] Task X skipped: [justification]` |
</logging>

<constraints>
- REPAIR_BUDGET 默认为每个任务 2 次。可通过 config.json `workflow.node_repair_budget` 配置。
- 永远不要修改磁盘上的 PLAN.md — 分解的子任务仅在内存中。
- DECOMPOSE 子任务必须比原始任务更具体，而不是同义词重写。
- 如果 config.json `workflow.node_repair` 为 `false`，直接跳到 verification_failure_gate（用户保留原始行为）。
</constraints>