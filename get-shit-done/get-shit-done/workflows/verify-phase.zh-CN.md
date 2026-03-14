<purpose>

通过目标逆向分析验证阶段目标实现情况。检查代码库是否实现了阶段承诺的内容，而不仅仅是任务完成。

由 execute-phase.md 启动的验证子 agent 执行。

</purpose>

<core_principle>
**任务完成 ≠ 目标实现**

任务 "创建聊天组件" 可以在组件是占位符时标记为完成。任务已完成 — 但目标"工作聊天界面"并未实现。

目标逆向验证：
1. 为了实现目标，必须满足什么条件？
2. 为了支持这些条件，必须存在什么？
3. 为了使这些工件正常工作，必须连接什么？

然后针对实际代码库验证每个层面。
</core_principle>

<required_reading>
@~/.claude/get-shit-done/references/verification-patterns.md
@~/.claude/get-shit-done/templates/verification-report.md
</required_reading>

<process>

<step name="load_context" priority="first">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取：`phase_dir`, `phase_number`, `phase_name`, `has_plans`, `plan_count`。

然后加载阶段详情并列出计划/摘要：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${phase_number}"
grep -E "^| ${phase_number}" .planning/REQUIREMENTS.md 2>/dev/null
ls "$phase_dir"/*-SUMMARY.md "$phase_dir"/*-PLAN.md 2>/dev/null
```

从 ROADMAP.md 中提取 **阶段目标**（要验证的结果，而不是任务）和 REQUIREMENTS.md 中的 **需求**（如果存在）。
</step>

<step name="establish_must_haves">
**选项 A：PLAN 前言中的必需项**

使用 gsd-tools 从每个 PLAN 中提取 must_haves：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  MUST_HAVES=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" frontmatter get "$plan" --field must_haves)
  echo "=== $plan ===" && echo "$MUST_HAVES"
done
```

返回 JSON：`{ truths: [...], artifacts: [...], key_links: [...] }`

汇总所有计划中该阶段的 must_haves。

**选项 B：使用 ROADMAP.md 中的成功标准**

如果前言中没有 must_haves（MUST_HAVES 返回错误或空），检查成功标准：

```bash
PHASE_DATA=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${phase_number}" --raw)
```

从 JSON 输出中解析 `success_criteria` 数组。如果非空：
1. 将每个成功标准直接用作 **truth**（它们已经被写为可观察、可测试的行为）
2. 派生 **artifacts**（每个真理的具体文件路径）
3. 派生 **key links**（隐藏存根的关键连接）
4. 在继续之前记录必需项

ROADMAP.md 中的成功标准是契约 — 当两者都存在时，它们覆盖 PLAN 级别的 must_haves。

**选项 C：从阶段目标派生（后备）**

如果前言中没有 must_haves 且 ROADMAP 中没有成功标准：
1. 说明 ROADMAP.md 中的目标
2. 派生 **truths**（3-7 个可观察行为，每个都可测试）
3. 派生 **artifacts**（每个真理的具体文件路径）
4. 派生 **key links**（隐藏存根的关键连接）
5. 在继续之前记录派生的必需项
</step>

<step name="verify_truths">
对于每个可观察的真理，确定代码库是否支持它。

**状态：** ✓ 已验证（所有支持工件通过） | ✗ 失败（工件缺失/存根/未连接） | ? 不确定（需要人工干预）

对于每个真理：识别支持工件 → 检查工件状态 → 检查连接 → 确定真理状态。

**示例：** 真理 "用户可以看到现有消息" 依赖于 Chat.tsx（渲染）、/api/chat GET（提供）、Message model（架构）。如果 Chat.tsx 是存根或 API 返回硬编码的 [] → 失败。如果所有都存在、实质性且已连接 → 已验证。
</step>

<step name="verify_artifacts">
使用 gsd-tools 针对每个 PLAN 中的 must_haves 进行工件验证：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  ARTIFACT_RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify artifacts "$plan")
  echo "=== $plan ===" && echo "$ARTIFACT_RESULT"
done
```

解析 JSON 结果：`{ all_passed, passed, total, artifacts: [{path, exists, issues, passed}] }`

**结果中的工件状态：**
- `exists=false` → 缺失
- `issues` 不为空 → 存根（检查问题中是否有 "Only N lines" 或 "Missing pattern"）
- `passed=true` → 已验证（级别 1-2 通过）

**级别 3 — 已连接（针对级别 1-2 通过的工件人工检查）：**
```bash
grep -r "import.*$artifact_name" src/ --include="*.ts" --include="*.tsx"  # 已导入
grep -r "$artifact_name" src/ --include="*.ts" --include="*.tsx" | grep -v "import"  # 已使用
```
已连接 = 已导入 AND 已使用。孤立 = 存在但未导入/使用。

| 存在 | 实质性 | 已连接 | 状态 |
|--------|-------------|-------|--------|
| ✓ | ✓ | ✓ | ✓ 已验证 |
| ✓ | ✓ | ✗ | ⚠️ 孤立 |
| ✓ | ✗ | - | ✗ 存根 |
| ✗ | - | - | ✗ 缺失 |
</step>

<step name="verify_wiring">
使用 gsd-tools 针对每个 PLAN 中的 must_haves 进行关键连接验证：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  LINKS_RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify key-links "$plan")
  echo "=== $plan ===" && echo "$LINKS_RESULT"
done
```

解析 JSON 结果：`{ all_verified, verified, total, links: [{from, to, via, verified, detail}] }`

**结果中的连接状态：**
- `verified=true` → 已连接
- `verified=false` 且 "not found" → 未连接
- `verified=false` 且 "Pattern not found" → 部分连接

**后备模式（如果 must_haves 中没有 key_links）：**

| 模式 | 检查 | 状态 |
|---------|-------|--------|
| 组件 → API | fetch/axios 调用 API 路径，响应被使用（await/.then/setState） | 已连接 / 部分连接（调用但未使用响应） / 未连接 |
| API → 数据库 | Prisma/DB 在模型上查询，通过 res.json() 返回结果 | 已连接 / 部分连接（查询但未返回） / 未连接 |
| 表单 → 处理器 | onSubmit 使用真实实现（fetch/axios/mutate/dispatch），不是 console.log/空 | 已连接 / 存根（仅日志/空） / 未连接 |
| 状态 → 渲染 | useState 变量出现在 JSX 中（`{stateVar}` 或 `{stateVar.property}`） | 已连接 / 未连接 |

为每个关键连接记录状态和证据。
</step>

<step name="verify_requirements">
如果 REQUIREMENTS.md 存在：
```bash
grep -E "Phase ${PHASE_NUM}" .planning/REQUIREMENTS.md 2>/dev/null
```

对于每个需求：解析描述 → 识别支持真理/工件 → 状态： ✓ 已满足 / ✗ 阻塞 / ? 需要人工干预。
</step>

<step name="scan_antipatterns">
从 SUMMARY.md 中提取此阶段修改的文件，扫描每个文件：

| 模式 | 搜索 | 严重性 |
|---------|--------|----------|
| TODO/FIXME/XXX/HACK | `grep -n -E "TODO\|FIXME\|XXX\|HACK"` | ⚠️ 警告 |
| 占位符内容 | `grep -n -iE "placeholder\|coming soon\|will be here"` | 🛑 阻塞 |
| 空返回 | `grep -n -E "return null\|return \{\}\|return \[\]\|=> \{\}"` | ⚠️ 警告 |
| 仅日志函数 | 仅包含 console.log 的函数 | ⚠️ 警告 |

分类：🛑 阻塞（防止目标实现）| ⚠️ 警告（不完整）| ℹ️ 信息（值得注意）。
</step>

<step name="identify_human_verification">
**总是需要人工干预：** 外观，用户流程完成，实时行为（WebSocket/SSE），外部服务集成，性能感受，错误消息清晰度。

**如果不确定需要人工干预：** 复杂连接 grep 无法追踪，动态状态相关行为，边缘情况。

每个都格式化为：测试名称 → 要做什么 → 预期结果 → 为什么无法编程验证。
</step>

<step name="determine_status">
**通过：** 所有真理已验证，所有工件通过级别 1-3，所有关键连接已连接，没有阻塞的反模式。

**发现差距：** 任何真理失败，工件缺失/存根，关键连接未连接，或发现阻塞项。

**需要人工：** 所有自动检查通过但人工验证项目仍然存在。

**分数：** `已验证真理数 / 总真理数`
</step>

<step name="generate_fix_plans">
如果发现差距：

1. **聚类相关差距：** API 存根 + 组件未连接 → "将前端连接到后端"。多个缺失 → "完成核心实现"。仅连接 → "连接现有组件"。

2. **为每个集群生成计划：** 目标，2-3 个任务（文件/操作/验证），重新验证步骤。保持专注：每个计划一个问题。

3. **按依赖顺序：** 修复缺失 → 修复存根 → 修复连接 → 验证。
</step>

<step name="create_report">
```bash
REPORT_PATH="$PHASE_DIR/${PHASE_NUM}-VERIFICATION.md"
```

填充模板部分：前言（阶段/时间戳/状态/分数），目标实现，工件表，连接表，需求覆盖，反模式，人工验证，差距摘要，修复计划（如果发现差距），元数据。

完整模板见 ~/.claude/get-shit-done/templates/verification-report.md。
</step>

<step name="return_to_orchestrator">
返回状态（`通过` | `发现差距` | `需要人工`），分数（N/M 必需项），报告路径。

如果发现差距：列出差距 + 建议的修复计划名称。
如果需要人工：列出需要人工测试的项目。

编排器路由：`通过` → 更新路线图 | `发现差距` → 创建/执行修复，重新验证 | `需要人工` → 呈现给用户。
</step>

</process>

<success_criteria>
- [ ] 必需项已建立（来自前言或派生）
- [ ] 所有真理已验证，带有状态和证据
- [ ] 所有工件已在所有三个级别检查
- [ ] 所有关键连接已验证
- [ ] 需求覆盖已评估（如果适用）
- [ ] 反模式已扫描并分类
- [ ] 人工验证项目已识别
- [ ] 总体状态已确定
- [ ] 已生成修复计划（如果发现差距）
- [ ] 已创建 VERIFICATION.md，包含完整报告
- [ ] 结果已返回给编排器
</success_criteria>