<purpose>

将已发布的版本（v1.0、v1.1、v2.0）标记为完成。在 MILESTONES.md 中创建历史记录，执行完整的 PROJECT.md 进化审查，重新组织带有里程碑分组的 ROADMAP.md，并在 git 中标记发布。

</purpose>

<required_reading>

1. templates/milestone.md
2. templates/milestone-archive.md
3. `.planning/ROADMAP.md`
4. `.planning/REQUIREMENTS.md`
5. `.planning/PROJECT.md`

</required_reading>

<archival_behavior>

当里程碑完成时：

1. 提取完整的里程碑详情到 `.planning/milestones/v[X.Y]-ROADMAP.md`
2. 将需求归档到 `.planning/milestones/v[X.Y]-REQUIREMENTS.md`
3. 更新 ROADMAP.md — 将里程碑详情替换为单行摘要
4. 删除 REQUIREMENTS.md（下一个里程碑的全新版本）
5. 执行完整的 PROJECT.md 进化审查
6. 提议创建下一个里程碑

**上下文效率：** 归档保持 ROADMAP.md 恒定大小且 REQUIREMENTS.md 里程碑范围限定。

**ROADMAP 归档** 使用 `templates/milestone-archive.md` — 包含里程碑标题（状态、阶段、日期）、完整阶段详情、里程碑摘要（决策、问题、技术债务）。

**REQUIREMENTS 归档** 包含所有标记为完成的需求及其结果、带有最终状态的可追溯性表、更改需求说明。

</archival_behavior>

<process>

<step name="verify_readiness">

**使用 `roadmap analyze` 进行全面的就绪性检查：**

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

这返回带有计划/摘要计数和磁盘状态的所有阶段。使用它来验证：
- 哪些阶段属于此里程碑？
- 所有阶段完成（所有计划都有摘要）？对每个阶段检查 `disk_status === 'complete'`。
- `progress_percent` 应为 100%。

**需求完成检查（在展示前必需）：**

解析 REQUIREMENTS.md 可追溯性表：
- 计算总 v1 需求与已勾选（`[x]`）需求的数量
- 识别可追溯性表中的任何非 Complete 行

展示：

```
里程碑：[名称，例如 "v1.0 MVP"]

包括：
- 阶段 1：Foundation（2/2 计划完成）
- 阶段 2：Authentication（2/2 计划完成）
- 阶段 3：Core Features（3/3 计划完成）
- 阶段 4：Polish（1/1 计划完成）

总计：{phase_count} 个阶段，{total_plans} 个计划，全部完成
需求：{N}/{M} 个 v1 需求已勾选
```

**如果需求不完整**（N < M）：

```
⚠ 未勾选的需求：

- [ ] {REQ-ID}: {描述}（阶段 {X}）
- [ ] {REQ-ID}: {描述}（阶段 {Y}）
```

必须提供 3 个选项：
1. **继续进行** — 标记里程碑完成，带有已知差距
2. **先运行审计** — `/gsd:audit-milestone` 评估差距严重性
3. **中止** — 返回开发

如果用户选择"继续进行"：在 MILESTONES.md 的 `### Known Gaps` 下记录不完整的需求，带有 REQ-ID 和描述。

<config-check>

```bash
cat .planning/config.json 2>/dev/null
```

</config-check>

<if mode="yolo">

```
⚡ 自动批准：里程碑范围验证
[在不提示的情况下显示分解摘要]
继续收集统计数据...
```

继续到 gather_stats。

</if>

<if mode="interactive" OR="custom with gates.confirm_milestone_scope true">

```
准备好将此里程碑标记为已发布吗？
（是 / 等待 / 调整范围）
```

等待确认。
- "调整范围"：询问包含哪些阶段。
- "等待"：停止，用户准备好时返回。

</if>

</step>

<step name="gather_stats">

计算里程碑统计数据：

```bash
git log --oneline --grep="feat(" | head -20
git diff --stat FIRST_COMMIT..LAST_COMMIT | tail -1
find . -name "*.swift" -o -name "*.ts" -o -name "*.py" | xargs wc -l 2>/dev/null
git log --format="%ai" FIRST_COMMIT | tail -1
git log --format="%ai" LAST_COMMIT | head -1
```

展示：

```
里程碑统计：
- 阶段：[X-Y]
- 计划：[Z] 总计
- 任务：[N] 总计（来自阶段摘要）
- 文件修改：[M]
- 代码行数：[LOC] [语言]
- 时间线：[Days] 天（[Start] → [End]）
- Git 范围：feat(XX-XX) → feat(YY-YY)
```

</step>

<step name="extract_accomplishments">

使用 summary-extract 从 SUMMARY.md 文件中提取单行描述：

```bash
# 对于里程碑中的每个阶段，提取单行描述
for summary in .planning/phases/*-*/*-SUMMARY.md; do
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract "$summary" --fields one_liner | jq -r '.one_liner'
done
```

提取 4-6 个关键成就。展示：

```
此里程碑的关键成就：
1. [阶段 1 的成就]
2. [阶段 2 的成就]
3. [阶段 3 的成就]
4. [阶段 4 的成就]
5. [阶段 5 的成就]
```

</step>

<step name="create_milestone_entry">

**注意：** MILESTONES.md 条目现在由 `gsd-tools milestone complete` 在归档里程碑步骤中自动创建。该条目包括版本、日期、阶段/计划/任务计数，以及从 SUMMARY.md 文件中提取的成就。

如果需要额外详细信息（例如，用户提供的"已交付"摘要、git 范围、LOC 统计），在 CLI 创建基本条目后手动添加。

</step>

<step name="evolve_project_full_review">

在里程碑完成时进行完整的 PROJECT.md 进化审查。

读取所有阶段摘要：

```bash
cat .planning/phases/*-*/*-SUMMARY.md
```

**完整审查清单：**

1. **"这是什么"的准确性：**
   - 将当前描述与构建的内容进行比较
   - 如果产品有意义的更改，则更新

2. **核心价值检查：**
   - 仍然是正确的优先级？发布是否揭示不同的核心价值？
   - 如果 ONE 事情已改变，则更新

3. **需求审计：**

   **已验证部分：**
   - 所有在此里程碑发布的活动需求 → 移动到已验证
   - 格式：`- ✓ [需求] — v[X.Y]`

   **活动部分：**
   - 移动到已验证的需求
   - 为下一个里程碑添加新需求
   - 保留未解决的需求

   **范围外审计：**
   - 审查每个项目 — 推理仍然有效？
   - 删除不相关的项目
   - 添加在里程碑期间失效的需求

4. **上下文更新：**
   - 当前代码库状态（LOC、技术栈）
   - 用户反馈主题（如果有）
   - 已知问题或技术债务

5. **关键决策审计：**
   - 从里程碑阶段摘要中提取所有决策
   - 添加到关键决策表，带有结果
   - 标记 ✓ 良好、⚠️ 需要重新审视，或 — 待处理

6. **约束检查：**
   - 开发期间有任何约束更改？根据需要更新

内联更新 PROJECT.md。更新"最后更新"页脚：

```markdown
---
*最后更新：[date] 在 v[X.Y] 里程碑后*
```

**完整进化的示例（v1.0 → v1.1 准备）：**

之前：

```markdown
## 这是什么

面向远程团队的实时协作用白板。

## 核心价值

感觉即时的实时同步。

## 需求

### 已验证

（还没有 — 发布以验证）

### 活动

- [ ] 画布绘图工具
- [ ] 实时同步 < 500ms
- [ ] 用户身份验证
- [ ] 导出为 PNG

### 范围外

- 移动应用 — 优先网络方法
- 视频聊天 — 使用外部工具
```

v1.0 之后：

```markdown
## 这是什么

面向远程团队的实时协作用白板，具有即时同步和绘图工具。

## 核心价值

感觉即时的实时同步。

## 需求

### 已验证

- ✓ 画布绘图工具 — v1.0
- ✓ 实时同步 < 500ms — v1.0（实现 200ms 平均）
- ✓ 用户身份验证 — v1.0

### 活动

- [ ] 导出为 PNG
- [ ] 撤销/重做历史
- [ ] 形状工具（矩形、圆形）

### 范围外

- 移动应用 — 优先网络方法，PWA 运行良好
- 视频聊天 — 使用外部工具
- 离线模式 — 实时是核心价值

## 上下文

使用 2,400 LOC TypeScript 发布 v1.0。
技术栈：Next.js、Supabase、Canvas API。
初步用户测试显示对形状工具的需求。
```

**步骤完成当：**

- [ ] "这是什么"已审查并在需要时更新
- [ ] 核心价值已验证为仍然正确
- [ ] 所有发布的需求已移动到已验证
- [ ] 新需求已添加到下一个里程碑的活动部分
- [ ] 范围外推理已审计
- [ ] 上下文已更新当前状态
- [ ] 所有里程碑决策已添加到关键决策
- [ ] "最后更新"页脚反映里程碑完成

</step>

<step name="reorganize_roadmap">

更新 `.planning/ROADMAP.md` — 对已完成里程碑的阶段进行分组：

```markdown
# Roadmap: [项目名称]

## 里程碑

- ✅ **v1.0 MVP** — 阶段 1-4（发布 YYYY-MM-DD）
- 🚧 **v1.1 Security** — 阶段 5-6（进行中）
- 📋 **v2.0 Redesign** — 阶段 7-10（已规划）

## 阶段

<details>
<summary>✅ v1.0 MVP（阶段 1-4）— 发布 YYYY-MM-DD</summary>

- [x] 阶段 1：Foundation（2/2 计划）— 完成 YYYY-MM-DD
- [x] 阶段 2：Authentication（2/2 计划）— 完成 YYYY-MM-DD
- [x] 阶段 3：Core Features（3/3 计划）— 完成 YYYY-MM-DD
- [x] 阶段 4：Polish（1/1 计划）— 完成 YYYY-MM-DD

</details>

### 🚧 v[下一个] [名称]（进行中 / 已规划）

- [ ] 阶段 5：[名称]（[N] 计划）
- [ ] 阶段 6：[名称]（[N] 计划）

## 进度

| 阶段 | 里程碑 | 计划完成 | 状态 | 完成日期 |
| ----------------- | --------- | -------------- | ----------- | ---------- |
| 1. Foundation | v1.0 | 2/2 | 完成 | YYYY-MM-DD |
| 2. Authentication | v1.0 | 2/2 | 完成 | YYYY-MM-DD |
| 3. Core Features | v1.0 | 3/3 | 完成 | YYYY-MM-DD |
| 4. Polish | v1.0 | 1/1 | 完成 | YYYY-MM-DD |
| 5. Security Audit | v1.1 | 0/1 | 未开始 | - |
| 6. Hardening | v1.1 | 0/2 | 未开始 | - |
```

</step>

<step name="archive_milestone">

**将归档委托给 gsd-tools：**

```bash
ARCHIVE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" milestone complete "v[X.Y]" --name "[里程碑名称]")
```

CLI 处理：
- 创建 `.planning/milestones/` 目录
- 将 ROADMAP.md 归档到 `milestones/v[X.Y]-ROADMAP.md`
- 将 REQUIREMENTS.md 归档到 `milestones/v[X.Y]-REQUIREMENTS.md`，带有归档标题
- 如果存在，将审计文件移动到里程碑
- 创建/追加 MILESTONES.md 条目，带有从 SUMMARY.md 文件中提取的成就
- 更新 STATE.md（状态、最后活动）

从结果中提取：`version`、`date`、`phases`、`plans`、`tasks`、`accomplishments`、`archived`。

验证：`✅ 里程碑已归档到 .planning/milestones/`

**阶段归档（可选）：** 归档完成后，询问用户：

AskUserQuestion(header="归档阶段", question="将阶段目录归档到里程碑？", options: "Yes — 移动到 milestones/v[X.Y]-phases/" | "Skip — 将阶段保留在原处")

如果"Yes"：将阶段目录移动到里程碑归档：
```bash
mkdir -p .planning/milestones/v[X.Y]-phases
# 对于 .planning/phases/ 中的每个阶段目录：
mv .planning/phases/{phase-dir} .planning/milestones/v[X.Y]-phases/
```
验证：`✅ 阶段目录已归档到 .planning/milestones/v[X.Y]-phases/`

如果"Skip"：阶段目录保留在 `.planning/phases/` 中作为原始执行历史。稍后使用 `/gsd:cleanup` 进行归档。

归档后，AI 仍然处理：
- 重新组织带有里程碑分组的 ROADMAP.md（需要判断）
- 完整的 PROJECT.md 进化审查（需要理解）
- 删除原始 ROADMAP.md 和 REQUIREMENTS.md
- 这些不是完全委托的，因为它们需要对内容的 AI 解释

</step>

<step name="reorganize_roadmap_and_delete_originals">

在 `milestone complete` 归档后，重新组织带有里程碑分组的 ROADMAP.md，然后删除原始文件：

**重新组织 ROADMAP.md** — 对已完成里程碑的阶段进行分组：

```markdown
# Roadmap: [项目名称]

## 里程碑

- ✅ **v1.0 MVP** — 阶段 1-4（发布 YYYY-MM-DD）
- 🚧 **v1.1 Security** — 阶段 5-6（进行中）

## 阶段

<details>
<summary>✅ v1.0 MVP（阶段 1-4）— 发布 YYYY-MM-DD</summary>

- [x] 阶段 1：Foundation（2/2 计划）— 完成 YYYY-MM-DD
- [x] 阶段 2：Authentication（2/2 计划）— 完成 YYYY-MM-DD

</details>
```

**然后删除原始文件：**

```bash
rm .planning/ROADMAP.md
rm .planning/REQUIREMENTS.md
```

</step>

<step name="write_retrospective">

**追加到持续回顾中：**

检查现有的回顾：
```bash
ls .planning/RETROSPECTIVE.md 2>/dev/null
```

**如果存在：** 读取文件，在 "## Cross-Milestone Trends" 部分之前追加新的里程碑部分。

**如果不存在：** 从 `~/.claude/get-shit-done/templates/retrospective.md` 中的模板创建。

**收集回顾数据：**

1. 从 SUMMARY.md 文件：提取关键交付物、单行描述、技术决策
2. 从 VERIFICATION.md 文件：提取验证分数、发现的差距
3. 从 UAT.md 文件：提取测试结果、发现的问题
4. 从 git 日志：计算提交数、计算时间线
5. 从里程碑工作：反思什么有效，什么无效

**写里程碑部分：**

```markdown
## 里程碑：v{version} — {name}

**发布：** {date}
**阶段：** {phase_count} | **计划：** {plan_count}

### 构建了什么
{从 SUMMARY.md 单行描述中提取}

### 有效的做法
{导致顺利执行的模式}

### 低效的地方
{错过的机会、返工、瓶颈}

### 建立的模式
{在此里程碑期间发现的新约定}

### 关键经验
{具体的、可操作的教训}

### 成本观察
- 模型混合：{X}% opus，{Y}% sonnet，{Z}% haiku
- 会话：{count}
- 值得注意的：{效率观察}
```

**更新跨里程碑趋势：**

如果 "## Cross-Milestone Trends" 部分存在，使用此里程碑的新数据更新表格。

**提交：**
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: 更新 v${VERSION} 的回顾" --files .planning/RETROSPECTIVE.md
```

</step>

<step name="update_state">

大多数 STATE.md 更新由 `milestone complete` 处理，但验证并更新剩余字段：

**项目参考：**

```markdown
## 项目参考

参见：.planning/PROJECT.md（更新于 [今天]）

**核心价值：** [来自 PROJECT.md 的当前核心价值]
**当前重点：** [下一个里程碑或"规划下一个里程碑"]
```

**累积上下文：**
- 清晰的决策摘要（完整日志在 PROJECT.md 中）
- 清晰的已解决阻塞器
- 为下一个里程碑保留开放阻塞器

</step>

<step name="handle_branches">

检查分支策略并提供合并选项。

使用 `init milestone-op` 获取上下文，或直接加载配置：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "1")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取 `branching_strategy`、`phase_branch_template`、`milestone_branch_template` 和 `commit_docs`。

**如果为"none"：** 跳转到 git_tag。

**对于"phase"策略：**

```bash
BRANCH_PREFIX=$(echo "$PHASE_BRANCH_TEMPLATE" | sed 's/{.*//')
PHASE_BRANCHES=$(git branch --list "${BRANCH_PREFIX}*" 2>/dev/null | sed 's/^\*//' | tr -d ' ')
```

**对于"milestone"策略：**

```bash
BRANCH_PREFIX=$(echo "$MILESTONE_BRANCH_TEMPLATE" | sed 's/{.*//')
MILESTONE_BRANCH=$(git branch --list "${BRANCH_PREFIX}*" 2>/dev/null | sed 's/^\*//' | tr -d ' ' | head -1)
```

**如果没有找到分支：** 跳转到 git_tag。

**如果分支存在：**

```
## 检测到 Git 分支

分支策略：{phase/milestone}
分支：{list}

选项：
1. **合并到 main** — 将分支合并到 main
2. **不合并删除** — 已合并或不需要
3. **保留分支** — 留给手动处理
```

使用选项提供 AskUserQuestion：压缩合并（推荐）、保留历史合并、不合并删除、保留分支。

**压缩合并：**

```bash
CURRENT_BRANCH=$(git branch --show-current)
git checkout main

if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git merge --squash "$branch"
    # 如果 commit_docs 为 false，从暂存中移除 .planning/
    if [ "$COMMIT_DOCS" = "false" ]; then
      git reset HEAD .planning/ 2>/dev/null || true
    fi
    git commit -m "feat: $branch for v[X.Y]"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git merge --squash "$MILESTONE_BRANCH"
  # 如果 commit_docs 为 false，从暂存中移除 .planning/
  if [ "$COMMIT_DOCS" = "false" ]; then
    git reset HEAD .planning/ 2>/dev/null || true
  fi
  git commit -m "feat: $MILESTONE_BRANCH for v[X.Y]"
fi

git checkout "$CURRENT_BRANCH"
```

**保留历史合并：**

```bash
CURRENT_BRANCH=$(git branch --show-current)
git checkout main

if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git merge --no-ff --no-commit "$branch"
    # 如果 commit_docs 为 false，从暂存中移除 .planning/
    if [ "$COMMIT_DOCS" = "false" ]; then
      git reset HEAD .planning/ 2>/dev/null || true
    fi
    git commit -m "Merge branch '$branch' for v[X.Y]"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git merge --no-ff --no-commit "$MILESTONE_BRANCH"
  # 如果 commit_docs 为 false，从暂存中移除 .planning/
  if [ "$COMMIT_DOCS" = "false" ]; then
    git reset HEAD .planning/ 2>/dev/null || true
  fi
  git commit -m "Merge branch '$MILESTONE_BRANCH' for v[X.Y]"
fi

git checkout "$CURRENT_BRANCH"
```

**不合并删除：**

```bash
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git branch -d "$branch" 2>/dev/null || git branch -D "$branch"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git branch -d "$MILESTONE_BRANCH" 2>/dev/null || git branch -D "$MILESTONE_BRANCH"
fi
```

**保留分支：** 报告"分支保留供手动处理"

</step>

<step name="git_tag">

创建 git 标签：

```bash
git tag -a v[X.Y] -m "v[X.Y] [名称]

交付：[一句话]

关键成就：
- [项目 1]
- [项目 2]
- [项目 3]

完整详情见 .planning/MILESTONES.md。"
```

确认："已标记：v[X.Y]"

询问："将标签推送到远程？(y/n)"

如果是：
```bash
git push origin v[X.Y]
```

</step>

<step name="git_commit_milestone">

提交里程碑完成。

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: 完成 v[X.Y] 里程碑" --files .planning/milestones/v[X.Y]-ROADMAP.md .planning/milestones/v[X.Y]-REQUIREMENTS.md .planning/milestones/v[X.Y]-MILESTONE-AUDIT.md .planning/MILESTONES.md .planning/PROJECT.md .planning/STATE.md
```
```

确认："已提交：chore: 完成 v[X.Y] 里程碑"

</step>

<step name="offer_next">

```
✅ 里程碑 v[X.Y] [名称] 完成

已发布：
- [N] 个阶段（[M] 个计划，[P] 个任务）
- [一句话说明发布的内容]

已归档：
- milestones/v[X.Y]-ROADMAP.md
- milestones/v[X.Y]-REQUIREMENTS.md

摘要：.planning/MILESTONES.md
标签：v[X.Y]

---

## ▶ 接下来做什么

**开始下一个里程碑** — 质疑 → 研究 → 需求 → 路线图

`/gsd:new-milestone`

<sub>先使用 /clear → 获取新的上下文窗口</sub>

---
```

</step>

</process>

<milestone_naming>

**版本约定：**
- **v1.0** — 初始 MVP
- **v1.1, v1.2** — 次要更新、新功能、修复
- **v2.0, v3.0** — 主要重写、破坏性更改、新方向

**名称：** 简短的 1-2 个单词（v1.0 MVP、v1.1 Security、v1.2 Performance、v2.0 Redesign）。

</milestone_naming>

<what_qualifies>

**为以下内容创建里程碑：** 初始发布、公共发布、发布的主要功能集、在归档规划前。

**不要为以下内容创建里程碑：** 每个阶段完成（过于细致）、进行中的工作、内部开发迭代（除非真正发布）。

启发式方法："这是否已部署/可用/发布？" 如果是 → 里程碑。如果不是 → 继续工作。

</what_qualifies>

<success_criteria>

里程碑成功完成时：

- [ ] 已创建 MILESTONES.md 条目，带有统计和成就
- [ ] 已完成 PROJECT.md 完整进化审查
- [ ] 所有发布的需求已移动到 PROJECT.md 中的已验证
- [ ] 关键决策已更新结果
- [ ] ROADMAP.md 已重新组织，带有里程碑分组
- [ ] 已创建路线图归档（milestones/v[X.Y]-ROADMAP.md）
- [ ] 已创建需求归档（milestones/v[X.Y]-REQUIREMENTS.md）
- [ ] REQUIREMENTS.md 已删除（为下一个里程碑准备的全新版本）
- [ ] STATE.md 已更新新鲜的项目参考
- [ ] 已创建 Git 标签（v[X.Y]）
- [ ] 已提交里程碑（包括归档文件和删除）
- [ ] 已检查需求完成情况，对照 REQUIREMENTS.md 可追溯性表
- [ ] 不完整的需求已展示，带有继续/审计/中止选项
- [ ] 如果用户使用不完整的需求继续进行，已知差距已记录在 MILESTONES.md 中
- [ ] RETROSPECTIVE.md 已更新里程碑部分
- [ ] 跨里程碑趋势已更新
- [ ] 用户了解下一步（/gsd:new-milestone）

</success_criteria>