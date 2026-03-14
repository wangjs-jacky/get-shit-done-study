# 调试模板

用于 `.planning/debug/[slug].md` — 活跃的调试会话追踪模板。

---

## 文件模板

```markdown
---
status: gathering | investigating | fixing | verifying | awaiting_human_verify | resolved
trigger: "[verbatim 用户输入]"
created: [ISO 时间戳]
updated: [ISO 时间戳]
---

## 当前焦点
<!-- 每次更新时重写 - 始终反映当前状态 -->

hypothesis: [当前正在测试的理论]
test: [如何测试它]
expecting: [如果结果为真/假意味着什么]
next_action: [下一个直接步骤]

## 症状
<!-- 收集阶段编写，之后保持不变 -->

expected: [应该发生什么]
actual: [实际发生什么]
errors: [错误信息（如果有）]
reproduction: [如何触发]
started: [何时出现问题 / 一直存在问题]

## 已排除
<!-- 仅添加 - /clear 后避免重新调查 -->

- hypothesis: [被证明错误的理论]
  evidence: [什么否定了它]
  timestamp: [何时排除]

## 证据
<!-- 仅添加 - 调查过程中发现的事实 -->

- timestamp: [何时发现]
  checked: [检查了什么]
  found: [观察到什么]
  implication: [这意味着什么]

## 解决方案
<!-- 随理解演变而重写 -->

root_cause: [找到之前为空]
fix: [应用之前为空]
verification: [验证之前为空]
files_changed: []
```

---

## 区段规则

**Frontmatter (状态、触发器、时间戳)：**
- `status`: 重写 - 反映当前阶段
- `trigger`: 不可变 - 逐字记录的用户输入，永不改变
- `created`: 不可变 - 设置一次
- `updated`: 重写 - 每次更改时更新

**当前焦点：**
- 每次更新时完全重写
- 始终反映 Claude 此刻在做什么
- 如果 Claude 在 /clear 后读取此文件，它确切知道从哪里继续
- 字段：hypothesis, test, expecting, next_action

**症状：**
- 初始收集阶段编写
- 收集完成后不可变
- 我们尝试修复的参考点
- 字段：expected, actual, errors, reproduction, started

**已排除：**
- 仅添加 - 永不删除条目
- 避免在上下文重置后重新调查死胡同
- 每个条目：假设、否定它的证据、时间戳
- 对跨 /clear 边界的效率至关重要

**证据：**
- 仅添加 - 永不删除条目
- 调查过程中发现的事实
- 每个条目：时间戳、检查了什么、发现了什么、含义
- 为根本原因建立案例

**解决方案：**
- 随理解演变而重写
- 可能多次更新，尝试不同的修复
- 最终状态显示确认的根本原因和已验证的修复
- 字段：root_cause, fix, verification, files_changed

## 生命周期

**创建：** 调用 /gsd:debug 时立即
- 用用户输入触发器创建文件
- 设置状态为 "gathering"（收集）
- 当前焦点：next_action = "gather symptoms"（收集症状）
- 症状：为空，待填写

**症状收集期间：**
- 随着用户回答问题更新症状区段
- 每次更新时更新当前焦点
- 完成后：状态 → "investigating"（调查）

**调查期间：**
- 每次假设重写当前焦点
- 每次发现时添加到证据
- 假设被否定时添加到已排除
- 更新 frontmatter 中的时间戳

**修复期间：**
- 状态 → "fixing"（修复）
- 确认后更新 Resolution.root_cause
- 应用后更新 Resolution.fix
- 更新 Resolution.files_changed

**验证期间：**
- 状态 → "verifying"（验证）
- 更新 Resolution.verification 与结果
- 如果验证失败：状态 → "investigating"，再次尝试

**自验证通过后：**
- status → "awaiting_human_verify"（等待人工验证）
- 在检查点请求明确的用户确认
- 不要立即将文件移至已解决

**解决时：**
- 状态 → "resolved"（已解决）
- 移动文件到 .planning/debug/resolved/（仅在用户确认修复后）

## 恢复行为

当 Claude 在 /clear 后读取此文件时：

1. 解析 frontmatter → 知道状态
2. 读取当前焦点 → 确切知道发生了什么
3. 读取已排除 → 知道不要重试什么
4. 读取证据 → 知道已经学到什么
5. 从 next_action 继续

这个文件就是调试大脑。Claude 应该能够从任何中断点完美恢复。

## 大小限制

保持调试文件聚焦：
- 证据条目：每个 1-2 行，只需事实
- 已排除：简洁 - 假设 + 为什么失败
- 不要叙述性文字 - 仅结构化数据

如果证据变得非常大（10+ 条目），考虑是否在兜圈子。检查已排除部分，确保没有重复调查。