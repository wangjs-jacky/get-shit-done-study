<purpose>
协调并行调试代理以研究 UAT 差距并找到根本原因。

在 UAT 发现差距后，为每个差距生成一个调试代理。每个代理独立调查，症状预填充自 UAT。收集根本原因，用诊断更新 UAT.md 差距，然后交由 plan-phase --gaps 处理实际诊断。

编排器保持精简：解析差距、生成代理、收集结果、更新 UAT。
</purpose>

<paths>
DEBUG_DIR=.planning/debug

调试文件使用 `.planning/debug/` 路径（带有点前缀的隐藏目录）。
</paths>

<core_principle>
**先诊断再规划修复。**

UAT 告诉我们什么损坏了（症状）。调试代理找到为什么（根本原因）。然后 plan-phase --gaps 基于实际原因创建有针对性的修复，而不是猜测。

没有诊断时："评论不刷新" → 猜测修复 → 可能错误
有诊断时："评论不刷新" → "useEffect 缺少依赖" → 精确修复
</core_principle>

<process>

<step name="parse_gaps">
**从 UAT.md 中提取差距：**

读取"差距"部分（YAML 格式）：
```yaml
- truth: "提交后评论立即出现"
  status: failed
  reason: "用户报告：工作正常但不显示，直到我刷新页面"
  severity: major
  test: 2
  artifacts: []
  missing: []
```

对于每个差距，也从"测试"部分读取相应的测试以获得完整上下文。

构建差距列表：
```
gaps = [
  {truth: "提交后评论立即出现...", severity: "major", test_num: 2, reason: "..."},
  {truth: "回复按钮位置正确...", severity: "minor", test_num: 5, reason: "..."},
  ...
]
```
</step>

<step name="report_plan">
**向用户报告诊断计划：**

```
## 正在诊断 {N} 个差距

生成并行调试代理以调查根本原因：

| 差距（真相） | 严重性 |
|-------------|----------|
| 提交后评论立即出现 | major |
| 回复按钮位置正确 | minor |
| 删除移除评论 | blocker |

每个代理将：
1. 用预填充的症状创建 DEBUG-{slug}.md
2. 独立调查（读取代码、形成假设、测试）
3. 返回根本原因

这并行运行 — 所有差距同时调查。
```
</step>

<step name="spawn_agents">
**并行生成调试代理：**

对于每个差距，填充 debug-subagent-prompt 模板并生成：

```
Task(
  prompt=filled_debug_subagent_prompt + "\n\n<files_to_read>\n- {phase_dir}/{phase_num}-UAT.md\n- .planning/STATE.md\n</files_to_read>",
  subagent_type="gsd-debugger",
  description="调试: {truth_short}"
)
```

**所有代理在单条消息中生成**（并行执行）。

模板占位符：
- `{truth}`：失败的预期行为
- `{expected}`：来自 UAT 测试
- `{actual}`：来自 reason 字段的用户描述逐字稿
- `{errors}`：来自 UAT 的任何错误消息（或"未报告"）
- `{reproduction}`："UAT 中的测试 {test_num}"
- `{timeline}`："在 UAT 期间发现"
- `{goal}`：`find_root_cause_only`（UAT 流程 — plan-phase --gaps 处理修复）
- `{slug}`：从 truth 生成
</step>

<step name="collect_results">
**从代理收集根本原因：**

每个代理返回：
```
## 发现根本原因

**调试会话：** ${DEBUG_DIR}/{slug}.md

**根本原因：** {带有证据的具体原因}

**证据摘要：**
- {关键发现 1}
- {关键发现 2}
- {关键发现 3}

**涉及的文件：**
- {file1}: {什么问题}
- {file2}: {相关问题}

**建议的修复方向：** {给 plan-phase --gaps 的简要提示}
```

解析每个返回以提取：
- root_cause：诊断的原因
- files：涉及的文件
- debug_path：调试会话文件路径
- suggested_fix：差距关闭计划的提示

如果代理返回 `## 调查结论不明`：
- root_cause："调查结论不明 — 需要人工审查"
- 记录哪个问题需要人工关注
- 包含代理返回的剩余可能性
</step>

<step name="update_uat">
**用诊断更新 UAT.md 差距：**

对于 Gaps 部分中的每个差距，添加 artifacts 和 missing 字段：

```yaml
- truth: "提交后评论立即出现"
  status: failed
  reason: "用户报告：工作正常但不显示，直到我刷新页面"
  severity: major
  test: 2
  root_cause: "CommentList.tsx 中的 useEffect 缺少 commentCount 依赖"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect 缺少依赖"
  missing:
    - "将 commentCount 添加到 useEffect 依赖数组"
    - "添加新评论时触发重新渲染"
  debug_session: .planning/debug/comment-not-refreshing.md
```

将 frontmatter 中的状态更新为"diagnosed"。

提交更新的 UAT.md：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({phase_num}): 添加来自诊断的根本原因" --files ".planning/phases/XX-name/{phase_num}-UAT.md"
```
</step>

<step name="report_results">
**报告诊断结果并移交：**

显示：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 诊断完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 差距（真相） | 根本原因 | 文件 |
|-------------|------------|-------|
| 提交后评论立即出现 | useEffect 缺少依赖 | CommentList.tsx |
| 回复按钮位置正确 | CSS flex 顺序不正确 | ReplyButton.tsx |
| 删除移除评论 | API 缺少身份验证头 | api/comments.ts |

调试会话：${DEBUG_DIR}/

继续规划修复...
```

返回 verify-work 编排器进行自动规划。
不要提供手动下一步 — verify-work 处理其余部分。
</step>

</process>

<context_efficiency>
代理从 UAT 预填充症状开始（无需收集症状）。
代理只诊断 — plan-phase --gaps 处理修复（不应用修复）。
</context_efficiency>

<failure_handling>
**代理无法找到根本原因：**
- 将差距标记为"需要人工审查"
- 继续处理其他差距
- 报告不完整的诊断

**代理超时：**
- 检查 DEBUG-{slug}.md 中的部分进度
- 可以使用 /gsd:debug 恢复

**所有代理都失败：**
- 存在系统性问题（权限、git 等）
- 报告供人工调查
- 回退到没有根本原因的 plan-phase --gaps（精度较低）
</failure_handling>

<success_criteria>
- [ ] 已从 UAT.md 解析差距
- [ ] 已并行生成调试代理
- [ ] 已从所有代理收集根本原因
- [ ] 已用 artifacts 和 missing 更新 UAT.md 差距
- [ ] 调试会话已保存到 ${DEBUG_DIR}/
- [ ] 已移交 verify-work 进行自动规划
</success_criteria>