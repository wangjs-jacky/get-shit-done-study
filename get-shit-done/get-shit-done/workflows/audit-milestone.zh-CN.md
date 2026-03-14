<purpose>
通过聚合阶段验证、检查跨阶段集成和评估需求覆盖率，验证里程碑是否达到了其定义的完成标准。读取现有的 VERIFICATION.md 文件（在 execute-phase 期间已验证的阶段），聚合技术债务和延迟的差距，然后启动集成检查器进行跨阶段接线检查。
</purpose>

<required_reading>
开始之前，请阅读调用提示词的 execution_context 引用的所有文件。
</required_reading>

<process>

## 0. 初始化里程碑上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init milestone-op)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取：`milestone_version`、`milestone_name`、`phase_count`、`completed_phases`、`commit_docs`。

解析集成检查器模型：
```bash
integration_checker_model=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-integration-checker --raw)
```

## 1. 确定里程碑范围

```bash
# 获取里程碑中的阶段（按数字排序，处理小数）
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phases list
```

- 从参数解析版本或从 ROADMAP.md 检测当前版本
- 识别范围内的所有阶段目录
- 从 ROADMAP.md 提取里程碑的完成定义
- 从 REQUIREMENTS.md 提取映射到此里程碑的需求

## 2. 读取所有阶段验证

对于每个阶段目录，读取 VERIFICATION.md：

```bash
# 对于每个阶段，使用 find-phase 解析目录（处理归档阶段）
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" find-phase 01 --raw)
# 从 JSON 提取目录，然后从该目录读取 VERIFICATION.md
# 对 ROADMAP.md 中的每个阶段编号重复
```

从每个 VERIFICATION.md 中提取：
- **状态：** passed | gaps_found
- **关键差距：**（如果有 — 这些是阻塞器）
- **非关键差距：** 技术债务、延迟项、警告
- **发现的反模式：** TODO、存根、占位符
- **需求覆盖率：** 满足/阻塞哪些需求

如果某个阶段缺少 VERIFICATION.md，将其标记为"未验证的阶段" — 这是一个阻塞器。

## 3. 启动集成检查器

收集阶段上下文后：

从 REQUIREMENTS.md 可追溯性表中提取 `MILESTONE_REQ_IDS` — 分配给此里程碑中所有阶段的所有 REQ-ID。

```
Task(
  prompt="检查跨阶段集成和端到端流程。

阶段: {phase_dirs}
阶段导出: {从 SUMMARYs}
API 路由: {创建的路由}

里程碑需求:
{MILESTONE_REQ_IDS — 列出每个 REQ-ID 及其描述和分配的阶段}

必须将每个集成发现映射到受影响的需求 ID（如果适用）。

验证跨阶段接线和端到端用户流程。",
  subagent_type="gsd-integration-checker",
  model="{integration_checker_model}"
)
```

## 4. 收集结果

结合：
- 阶段级别的差距和技术债务（来自步骤 2）
- 集成检查器的报告（接线差距、损坏的流程）

## 5. 检查需求覆盖率（三源交叉引用）

必须对每个需求交叉引用三个独立来源：

### 5a. 解析 REQUIREMENTS.md 可追溯性表

从可追溯性表中提取映射到里程碑阶段的所有 REQ-ID：
- 需求 ID、描述、分配的阶段、当前状态、勾选状态（`[x]` vs `[ ]`）

### 5b. 解析阶段 VERIFICATION.md 需求表

对于每个阶段的 VERIFICATION.md，提取扩展的需求表：
- 需求 | 源计划 | 描述 | 状态 | 证据
- 将每个条目映射回其 REQ-ID

### 5c. 提取 SUMMARY.md Frontmatter 交叉检查

对于每个阶段的 SUMMARY.md，从 YAML frontmatter 中提取 `requirements-completed`：
```bash
for summary in .planning/phases/*-*/*-SUMMARY.md; do
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract "$summary" --fields requirements_completed | jq -r '.requirements_completed'
done
```

### 5d. 状态确定矩阵

对于每个 REQ-ID，使用所有三个来源确定状态：

| VERIFICATION.md 状态 | SUMMARY Frontmatter | REQUIREMENTS.md | → 最终状态 |
|------------------------|---------------------|-----------------|----------------|
| passed | 列出 | `[x]` | **满足** |
| passed | 列出 | `[ ]` | **满足**（更新复选框） |
| passed | 缺失 | 任何 | **部分**（手动验证） |
| gaps_found | 任何 | 任何 | **不满足** |
| 缺失 | 列出 | 任何 | **部分**（验证差距） |
| 缺失 | 缺失 | 任何 | **不满足** |

### 5e. FAIL 门限和孤儿检测

**必需：** 任何 `unsatisfied` 需求必须强制里程碑审计的 `gaps_found` 状态。

**孤儿检测：** 出现在 REQUIREMENTS.md 可追溯性表中但在所有阶段 VERIFICATION.md 文件中缺席的需求必须被标记为孤儿。孤儿需求被视为 `unsatisfied` — 它们被分配但从未被任何阶段验证。

## 5.5. Nyquist 合规性发现

如果 `workflow.nyquist_validation` 显式为 `false`，则跳过（缺失 = 启用）。

```bash
NYQUIST_CONFIG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config get workflow.nyquist_validation --raw 2>/dev/null)
```

如果为 `false`：完全跳过。

对于每个阶段目录，检查 `*-VALIDATION.md`。如果存在，解析 frontmatter（`nyquist_compliant`、`wave_0_complete`）。

按阶段分类：

| 状态 | 条件 |
|--------|-----------|
| COMPLIANT | `nyquist_compliant: true` 且所有任务为绿色 |
| PARTIAL | VALIDATION.md 存在，`nyquist_compliant: false` 或红色/待处理 |
| 缺失 | 没有 VALIDATION.md |

添加到审计 YAML：`nyquist: { compliant_phases, partial_phases, missing_phases, overall }`

仅发现 — 从不自动调用 `/gsd:validate-phase`。

## 6. 聚合到 v{version}-MILESTONE-AUDIT.md

创建 `.planning/v{version}-v{version}-MILESTONE-AUDIT.md`，包含：

```yaml
---
milestone: {version}
audited: {timestamp}
status: passed | gaps_found | tech_debt
scores:
  requirements: N/M
  phases: N/M
  integration: N/M
  flows: N/M
gaps:  # 关键阻塞器
  requirements:
    - id: "{REQ-ID}"
      status: "unsatisfied | partial | orphaned"
      phase: "{分配的阶段}"
      claimed_by_plans: ["{引用此需求的计划文件}"]
      completed_by_plans: ["{其 SUMMARY 标记为完成的计划文件}"]
      verification_status: "passed | gaps_found | missing | orphaned"
      evidence: "{特定证据或缺乏证据}"
  integration: [...]
  flows: [...]
tech_debt:  # 非关键，延迟
  - phase: 01-auth
    items:
      - "TODO: 添加速率限制"
      - "警告：没有密码强度验证"
  - phase: 03-dashboard
    items:
      - "延迟：移动响应式布局"
---
```

加上带有需求、阶段、集成、技术债务表格的完整 markdown 报告。

**状态值：**
- `passed` — 所有需求满足，无关键差距，最小技术债务
- `gaps_found` — 存在关键阻塞器
- `tech_debt` — 无阻塞器但累积的延迟项需要审查

## 7. 展示结果

按状态路由（参见 `<offer_next>`）。

</process>

<offer_next>
直接输出此 markdown（不是代码块）。根据状态路由：

---

**如果通过：**

## ✓ 里程碑 {version} — 审计通过

**评分：** {N}/{M} 个需求满足
**报告：** .planning/v{version}-MILESTONE-AUDIT.md

所有需求已覆盖。跨阶段集成已验证。端到端流程完成。

───────────────────────────────────────────────────────────────

## ▶ 接下来做什么

**完成里程碑** — 归档并标记

/gsd:complete-milestone {version}

<sub>先使用 /clear → 获取新的上下文窗口</sub>

───────────────────────────────────────────────────────────────

---

**如果发现差距：**

## ⚠ 里程碑 {version} — 发现差距

**评分：** {N}/{M} 个需求满足
**报告：** .planning/v{version}-MILESTONE-AUDIT.md

### 不满足的需求

{对于每个不满足的需求：}
- **{REQ-ID}: {描述}**（阶段 {X}）
  - {原因}

### 跨阶段问题

{对于每个集成差距：}
- **{from} → {to}:** {问题}

### 损坏的流程

{对于每个流程差距：}
- **{流程名称}:** 在 {step} 处中断

### Nyquist 覆盖率

| 阶段 | VALIDATION.md | 合规 | 操作 |
|-------|---------------|-----------|--------|
| {阶段} | 存在/缺失 | true/false/partial | `/gsd:validate-phase {N}` |

需要验证的阶段：为每个标记的阶段运行 `/gsd:validate-phase {N}`。

───────────────────────────────────────────────────────────────

## ▶ 接下来做什么

**规划差距关闭** — 创建阶段以完成里程碑

/gsd:plan-milestone-gaps

<sub>先使用 /clear → 获取新的上下文窗口</sub>

───────────────────────────────────────────────────────────────

**其他可用选项：**
- cat .planning/v{version}-MILESTONE-AUDIT.md — 查看完整报告
- /gsd:complete-milestone {version} — 继续进行（接受技术债务）

───────────────────────────────────────────────────────────────

---

**如果技术债务（无阻塞器但累积债务）：**

## ⚡ 里程碑 {version} — 技术债务审查

**评分：** {N}/{M} 个需求满足
**报告：** .planning/v{version}-MILESTONE-AUDIT.md

所有需求已满足。无关键阻塞器。累积的技术债务需要审查。

### 按阶段的技术债务

{对于每个有债务的阶段：}
**阶段 {X}: {名称}**
- {项目 1}
- {项目 2}

### 总计：{M} 个阶段中的 {N} 个项目

───────────────────────────────────────────────────────────────

## ▶ 选项

**A. 完成里程碑** — 接受债务，在待办事项中跟踪

/gsd:complete-milestone {version}

**B. 规划清理阶段** — 在完成前处理债务

/gsd:plan-milestone-gaps

<sub>先使用 /clear → 获取新的上下文窗口</sub>

───────────────────────────────────────────────────────────────
</offer_next>

<success_criteria>
- [ ] 里程碑范围已识别
- [ ] 所有阶段 VERIFICATION.md 文件已读取
- [ ] 每个阶段的 SUMMARY.md `requirements-completed` frontmatter 已提取
- [ ] REQUIREMENTS.md 可追溯性表已解析所有里程碑 REQ-ID
- [ ] 三源交叉引用已完成（VERIFICATION + SUMMARY + 可追溯性）
- [ ] 孤儿需求已检测（在可追溯性中但在所有 VERIFICATION 中缺失）
- [ ] 技术债务和延迟差距已聚合
- [ ] 集成检查器已启动，带有里程碑需求 ID
- [ ] v{version}-MILESTONE-AUDIT.md 已创建，包含结构化的需求差距对象
- [ ] FAIL 门限已执行 — 任何不满足的需求强制 gaps_found 状态
- [ ] Nyquist 合规性已扫描所有里程碑阶段（如果启用）
- [ ] 缺少 VALIDATION.md 的阶段已标记，带有 validate-phase 建议
- [ ] 结果已展示，包含可操作的下一步
</success_criteria>