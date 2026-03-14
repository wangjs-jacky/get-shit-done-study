<purpose>

将从已完成里程碑中累积的阶段目录归档到 `.planning/milestones/v{X.Y}-phases/`。识别哪些阶段属于每个已完成的里程碑，显示预运行摘要，并在确认后移动目录。

</purpose>

<required_reading>

1. `.planning/MILESTONES.md`
2. `.planning/milestones/` 目录列表
3. `.planning/phases/` 目录列表

</required_reading>

<process>

<step name="identify_completed_milestones">

读取 `.planning/MILESTONES.md` 以识别已完成的里程碑及其版本。

```bash
cat .planning/MILESTONES.md
```

提取每个里程碑版本（例如，v1.0、v1.1、v2.0）。

检查哪些里程碑归档目录已存在：

```bash
ls -d .planning/milestones/v*-phases 2>/dev/null
```

筛选到还没有 `-phases` 归档目录的里程碑。

如果所有里程碑都已经有了阶段归档目录：

```
所有已完成的里程碑都已经有了阶段目录归档。无需清理。
```

在此停止。

</step>

<step name="determine_phase_membership">

对于每个没有 `-phases` 归档的已完成里程碑，读取归档的 ROADMAP 快照以确定哪些阶段属于它：

```bash
cat .planning/milestones/v{X.Y}-ROADMAP.md
```

从归档的路线图中提取阶段编号和名称（例如，Phase 1: Foundation, Phase 2: Auth）。

检查哪些阶段目录仍存在于 `.planning/phases/` 中：

```bash
ls -d .planning/phases/*/ 2>/dev/null
```

将阶段目录与成员资格匹配。仅包含仍存在于 `.planning/phases/` 中的目录。

</step>

<step name="show_dry_run">

为每个里程碑显示预运行摘要：

```
## 清理摘要

### v{X.Y} — {里程碑名称}
这些阶段目录将被归档：
- 01-foundation/
- 02-auth/
- 03-core-features/

目标：.planning/milestones/v{X.Y}-phases/

### v{X.Z} — {里程碑名称}
这些阶段目录将被归档：
- 04-security/
- 05-hardening/

目标：.planning/milestones/v{X.Z}-phases/
```

如果没有剩余的阶段目录要归档（都已移动或删除）：

```
未找到要归档的阶段目录。阶段可能已被删除或之前已归档。
```

在此停止。

AskUserQuestion: "继续归档？" 选项： "Yes — 归档列出的阶段" | "取消"

如果"取消"：停止。

</step>

<step name="archive_phases">

对于每个里程碑，移动阶段目录：

```bash
mkdir -p .planning/milestones/v{X.Y}-phases
```

对于属于此里程碑的每个阶段目录：

```bash
mv .planning/phases/{dir} .planning/milestones/v{X.Y}-phases/
```

对清理集中的所有里程碑重复此操作。

</step>

<step name="commit">

提交更改：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: 归档来自已完成里程碑的阶段目录" --files .planning/milestones/ .planning/phases/
```

</step>

<step name="report">

```
已归档：
{对于每个里程碑}
- v{X.Y}: {N} 个阶段目录 → .planning/milestones/v{X.Y}-phases/

.planning/phases/ 已清理。
```

</step>

</process>

<success_criteria>

- [ ] 所有没有现有阶段归档的已完成里程碑已识别
- [ ] 从归档的 ROADMAP 快照中确定了阶段成员资格
- [ ] 已显示预运行摘要并获得用户确认
- [ ] 阶段目录已移动到 `.planning/milestones/v{X.Y}-phases/`
- [ ] 更改已提交

</success_criteria>