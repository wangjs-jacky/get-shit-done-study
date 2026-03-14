# 规划者子代理提示模板

用于生成 gsd-planner 代理的模板。该代理包含所有规划专业知识 - 此模板仅提供规划上下文。

---

## 模板

```markdown
<planning_context>

**阶段:** {phase_number}
**模式:** {standard | gap_closure}

**项目状态:**
@.planning/STATE.md

**路线图:**
@.planning/ROADMAP.md

**需求（如果存在）:**
@.planning/REQUIREMENTS.md

**阶段上下文（如果存在）:**
@.planning/phases/{phase_dir}/{phase_num}-CONTEXT.md

**研究（如果存在）:**
@.planning/phases/{phase_dir}/{phase_num}-RESEARCH.md

**差距关闭（如果使用 --gaps 模式）:**
@.planning/phases/{phase_dir}/{phase_num}-VERIFICATION.md
@.planning/phases/{phase_dir}/{phase_num}-UAT.md

</planning_context>

<downstream_consumer>
输出被 /gsd:execute-phase 消费
计划必须是可执行的提示，包含：
- Frontmatter（wave、depends_on、files_modified、autonomous）
- XML 格式的任务
- 验证标准
- 用于目标反向验证的 must_haves
</downstream_consumer>

<quality_gate>
在返回 PLANNING COMPLETE 之前：
- [ ] 在阶段目录中创建了 PLAN.md 文件
- [ ] 每个计划都有有效的 frontmatter
- [ ] 任务具体且可执行
- [ ] 依赖项正确识别
- [ ] 为并行执行分配了 wave
- [ ] must_haves 派生自阶段目标
</quality_gate>
```

---

## 占位符

| 占位符 | 来源 | 示例 |
|--------|------|------|
| `{phase_number}` | 来自路线图/参数 | `5` 或 `2.1` |
| `{phase_dir}` | 阶段目录名 | `05-user-profiles` |
| `{phase}` | 阶段前缀 | `05` |
| `{standard \| gap_closure}` | 模式标志 | `standard` |

---

## 使用方法

**从 /gsd:plan-phase（标准模式）:**
```python
Task(
  prompt=filled_template,
  subagent_type="gsd-planner",
  description="Plan Phase {phase}"
)
```

**从 /gsd:plan-phase --gaps（差距关闭模式）:**
```python
Task(
  prompt=filled_template,  # 使用 mode: gap_closure
  subagent_type="gsd-planner",
  description="Plan gaps for Phase {phase}"
)
```

---

## 继续

对于检查点，使用以下方式生成新代理：

```markdown
<objective>
继续规划阶段 {phase_number}: {phase_name}
</objective>

<prior_state>
阶段目录: @.planning/phases/{phase_dir}/
现有计划: @.planning/phases/{phase_dir}/*-PLAN.md
</prior_state>

<checkpoint_response>
**类型:** {checkpoint_type}
**响应:** {user_response}
</checkpoint_response>

<mode>
继续: {standard | gap_closure}
</mode>
```

---

**注意：** 规划方法论、任务分解、依赖分析、wave 分配、TDD 检测和目标反向推导都内置在 gsd-planner 代理中。此模板仅传递上下文。