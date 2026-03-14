# UAT 模板

用于 `.planning/phases/XX-name/{phase_num}-UAT.md` — 持续的 UAT（用户验收测试）会话追踪模板。

---

## 文件模板

```markdown
---
status: testing | complete | diagnosed
phase: XX-name
source: [测试的 SUMMARY.md 文件列表]
started: [ISO 时间戳]
updated: [ISO 时间戳]
---

## 当前测试
<!-- 每次测试时重写 - 显示我们所在的位置 -->

number: [N]
name: [测试名称]
expected: |
  [用户应该观察到什么]
awaiting: 用户响应

## 测试

### 1. [测试名称]
expected: [可观察行为 - 用户应该看到什么]
result: [待定]

### 2. [测试名称]
expected: [可观察行为]
result: 通过

### 3. [测试名称]
expected: [可观察行为]
result: 问题
reported: "[逐字记录的用户响应]"
severity: 主要

### 4. [测试名称]
expected: [可观察行为]
result: 跳过
reason: [跳过原因]

...

## 总结

total: [N]
passed: [N]
issues: [N]
pending: [N]
skipped: [N]

## 缺陷

<!-- YAML 格式供 plan-phase --gaps 消费 -->
- truth: "[测试中的预期行为]"
  status: failed
  reason: "用户报告: [逐字响应]"
  severity: blocker | major | minor | cosmetic
  test: [N]
  root_cause: ""     # 诊断后填写
  artifacts: []      # 诊断后填写
  missing: []        # 诊断后填写
  debug_session: ""  # 诊断后填写
```

---

## 区段规则

**Frontmatter：**
- `status`: 重写 - "testing" 或 "complete"
- `phase`: 不可变 - 创建时设置
- `source`: 不可变 - 正在测试的 SUMMARY 文件
- `started`: 不可变 - 创建时设置
- `updated`: 重写 - 每次更改时更新

**当前测试：**
- 每次测试转换时完全重写
- 显示哪个测试处于活跃状态以及等待什么
- 完成后："[testing complete]"

**测试：**
- 每个测试：用户响应时重写 result 字段
- `result` 值：[pending], pass, issue, skipped
- 如果有问题：添加 `reported`（逐字记录）和 `severity`（推断）
- 如果跳过：添加提供的 `reason`

**总结：**
- 每次响应后重写计数
- 跟踪：总计、通过、问题、待定、跳过

**缺陷：**
- 仅当发现问题时添加（YAML 格式）
- 诊断后填写：`root_cause`, `artifacts`, `missing`, `debug_session`
- 此部分直接提供给 /gsd:plan-phase --gaps

## 诊断生命周期

**测试完成后（status: complete），如果存在缺陷：**

1. 用户运行诊断（从 verify-work 提供或手动）
2. diagnose-issues 工作流生成并行调试代理
3. 每个代理调查一个缺陷，返回根本原因
4. UAT.md 缺陷部分更新诊断：
   - 每个缺陷填写 `root_cause`, `artifacts`, `missing`, `debug_session`
5. status → "diagnosed"
6. 为 /gsd:plan-phase --gaps 准备好根本原因

**诊断后：**
```yaml
## 缺陷

- truth: "提交后评论立即显示"
  status: failed
  reason: "用户报告：可以工作但不显示，直到我刷新页面"
  severity: major
  test: 2
  root_cause: "CommentList.tsx 中的 useEffect 缺少 commentCount 依赖"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect 缺少依赖"
  missing:
    - "将 commentCount 添加到 useEffect 依赖数组"
  debug_session: ".planning/debug/comment-not-refreshing.md"
```

## 生命周期

**创建：** 当 /gsd:verify-work 启动新会话时
- 从 SUMMARY.md 文件提取测试
- 设置状态为 "testing"
- 当前测试指向测试 1
- 所有测试都有 result: [pending]

**测试期间：**
- 显示当前测试区段的测试
- 用户通过确认通过或问题描述进行响应
- 更新测试结果（通过/问题/跳过）
- 更新总结计数
- 如果有问题：添加到缺陷区段（YAML 格式），推断严重性
- 将当前测试移动到下一个待定测试

**完成时：**
- status → "complete"
- Current Test → "[testing complete]"
- 提交文件
- 提供总结和后续步骤

**/clear 后恢复：**
1. 读取 frontmatter → 知道阶段和状态
2. 读取当前测试 → 知道我们在哪里
3. 找到第一个 [pending] 结果 → 从那里继续
4. 总结显示到目前为止的进度

## 严重性指南

严重性从用户自然语言推断，从不询问。

| 用户描述 | 推断 |
|----------|------|
| 崩溃、错误、异常、完全失败、无法使用 | blocker |
| 不工作、无反应、错误行为、缺少 | major |
| 可以工作但是...、慢、奇怪、次要、小问题 | minor |
| 颜色、字体、间距、对齐、视觉、看起来不对 | cosmetic |

默认：**major**（安全默认值，如果错误用户可以澄清）

## 示例
```markdown
---
status: diagnosed
phase: 04-comments
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md
started: 2025-01-15T10:30:00Z
updated: 2025-01-15T10:45:00Z
---

## 当前测试

[testing complete]

## 测试

### 1. 查看帖子评论
expected: 评论部分展开，显示计数和评论列表
result: 通过

### 2. 创建顶级评论
expected: 通过富文本编辑器提交评论，在列表中显示作者信息
result: 问题
reported: "可以工作但不显示，直到我刷新页面"
severity: major

### 3. 回复评论
expected: 点击回复，内联编辑器出现，提交显示嵌套回复
result: 通过

### 4. 视觉嵌套
expected: 3+ 级线程显示缩进、左边框，在合理深度限制
result: 通过

### 5. 删除自己的评论
expected: 点击自己评论上的删除，被删除或如果有回复显示 [deleted]
result: 通过

### 6. 评论计数
expected: 帖子显示准确计数，添加评论时递增
result: 通过

## 总结

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0

## 缺陷

- truth: "评论提交后立即在列表中显示"
  status: failed
  reason: "用户报告：可以工作但不显示，直到我刷新页面"
  severity: major
  test: 2
  root_cause: "CommentList.tsx 中的 useEffect 缺少 commentCount 依赖"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect 缺少依赖"
  missing:
    - "将 commentCount 添加到 useEffect 依赖数组"
  debug_session: ".planning/debug/comment-not-refreshing.md"
```