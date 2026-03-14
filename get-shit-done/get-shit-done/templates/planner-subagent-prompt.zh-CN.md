# 规划子代理提示模板

用于生成 gsd-planner 代理的模板。代理包含所有规划专业知识 - 此模板仅提供规划上下文。

---

## 模板

```markdown
<planning_context>

**阶段:** {阶段编号}
**模式:** {标准 | 缺口闭合}

**项目状态:**
@.planning/STATE.md

**路线图:**
@.planning/ROADMAP.md

**需求（如果存在）:**
@.planning/REQUIREMENTS.md

**阶段上下文（如果存在）:**
@.planning/phases/{阶段目录}/{阶段编号}-CONTEXT.md

**研究（如果存在）:**
@.planning/phases/{阶段目录}/{阶段编号}-RESEARCH.md

**缺口闭合（如果 --gaps 模式）:**
@.planning/phases/{阶段目录}/{阶段编号}-VERIFICATION.md
@.planning/phases/{阶段目录}/{阶段编号}-UAT.md

</planning_context>

<downstream_consumer>
输出被 /gsd:execute-phase 消费
计划必须是可执行的提示，包含：
- 前言（wave, depends_on, files_modified, autonomous）
- XML 格式的任务
- 验证标准
- 用于目标反向验证的 must_haves
</downstream_consumer>

<quality_gate>
返回 PLANNING COMPLETE 前：
- [ ] 阶段目录中创建 PLAN.md 文件
- [ ] 每个计划都有有效的前言
- [ ] 任务具体且可操作
- [ ] 正确识别依赖关系
- [ ] 为并行执行分配波次
- [ ] must_haves 从阶段目标派生
</quality_gate>
```

---

## 占位符

| 占位符 | 来源 | 示例 |
|-------------|--------|---------|
| `{阶段编号}` | 来自路线图/参数 | `5` 或 `2.1` |
| `{阶段目录}` | 阶段目录名 | `05-user-profiles` |
| `{阶段}` | 阶段前缀 | `05` |
| `{标准 \| 缺口闭合}` | 模式标志 | `标准` |

---

## 使用

**从 /gsd:plan-phase（标准模式）:**
```python
Task(
  prompt=填充的模板,
  subagent_type="gsd-planner",
  description="规划阶段 {阶段}"
)
```

**从 /gsd:plan-phase --gaps（缺口闭合模式）:**
```python
Task(
  prompt=填充的模板,  # 使用 mode: gap_closure
  subagent_type="gsd-planner",
  description="规划阶段 {阶段} 的缺口"
)
```

---

## 继续

对于检查点，使用以下内容生成新的代理：

```markdown
<objective>
继续规划阶段 {阶段编号}: {阶段名称}
</objective>

<prior_state>
阶段目录: @.planning/phases/{阶段目录}/
现有计划: @.planning/phases/{阶段目录}/*-PLAN.md
</prior_state>

<checkpoint_response>
**类型:** {检查点类型}
**响应:** {用户响应}
</checkpoint_response>

<mode>
继续: {标准 | 缺口闭合}
</mode>
```

---

**注意:** 规划方法、任务分解、依赖分析、波次分配、TDD 检测和目标反向派生都内置在 gsd-planner 代理中。此模板仅传递上下文。