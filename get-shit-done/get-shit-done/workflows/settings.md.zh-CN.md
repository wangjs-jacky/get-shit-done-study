<purpose>
通过多问题提示交互式配置 GSD 工作流代理（研究、计划检查、验证器）和模型配置文件选择。将用户偏好更新到 .planning/config.json。可选择将设置保存为全局默认值（~/.gsd/defaults.json）供未来项目使用。
</purpose>

<required_reading>
在开始之前，读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="ensure_and_load_config">
确保配置存在并加载当前状态：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-ensure-section
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

如果缺失，使用默认值创建 `.planning/config.json` 并加载当前配置值。
</step>

<step name="read_current">
```bash
cat .planning/config.json
```

解析当前值（如果不存在则默认为 `true`）：
- `workflow.research` — 在 plan-phase 期间生成研究员
- `workflow.plan_check` — 在 plan-phase 期间生成计划检查器
- `workflow.verifier` — 在 execute-phase 期间生成验证器
- `workflow.nyquist_validation` — 在 plan-phase 期间进行验证架构研究（如果缺失则默认为 true）
- `model_profile` — 每个代理使用的模型（默认：`balanced`）
- `git.branching_strategy` — 分支策略（默认：`"none"`）
</step>

<step name="present_settings">
使用 AskUserQuestion 并预选当前值：

```
AskUserQuestion([
  {
    question: "代理使用哪个模型配置文件？",
    header: "模型",
    multiSelect: false,
    options: [
      { label: "质量", description: "Opus 到处使用，验证除外（最高成本）" },
      { label: "平衡（推荐）", description: "规划用 Opus，执行/验证用 Sonnet" },
      { label: "预算", description: "写作用 Sonnet，研究/验证用 Haiku（最低成本）" }
    ]
  },
  {
    question: "生成计划研究员吗？（在规划前研究领域）",
    header: "研究",
    multiSelect: false,
    options: [
      { label: "是", description: "在规划前研究阶段目标" },
      { label: "否", description: "跳过研究，直接规划" }
    ]
  },
  {
    question: "生成计划检查器吗？（在执行前验证计划）",
    header: "计划检查",
    multiSelect: false,
    options: [
      { label: "是", description: "验证计划是否符合阶段目标" },
      { label: "否", description: "跳过计划验证" }
    ]
  },
  {
    question: "生成执行验证器吗？（在执行后验证阶段完成）",
    header: "验证器",
    multiSelect: false,
    options: [
      { label: "是", description: "在执行后验证 must-haves" },
      { label: "否", description: "跳过执行后验证" }
    ]
  },
  {
    question: "自动推进管道？（讨论 → 计划 → 执行自动）",
    header: "自动",
    multiSelect: false,
    options: [
      { label: "否（推荐）", description: "手动 /clear + 在阶段间粘贴" },
      { label: "是", description: "通过 Task() 子代理链接阶段（相同隔离）" }
    ]
  },
  {
    question: "启用 Nyquist 验证吗？（在规划期间研究测试覆盖率）",
    header: "Nyquist",
    multiSelect: false,
    options: [
      { label: "是（推荐）", description: "在 plan-phase 期间研究自动化测试覆盖率。为计划添加验证要求。如果任务缺乏自动化验证则阻止批准。" },
      { label: "否", description: "跳过验证研究。适合快速原型或无测试阶段。" }
    ]
  },
  // 注意：Nyquist 验证依赖于研究输出。如果研究被禁用，
  // plan-phase 自动跳过 Nyquist 步骤（没有 RESEARCH.md 可提取）。
  {
    question: "Git 分支策略？",
    header: "分支",
    multiSelect: false,
    options: [
      { label: "无（推荐）", description: "直接提交到当前分支" },
      { label: "每个阶段", description: "为每个阶段创建分支（gsd/phase-{N}-{name}）" },
      { label: "每个里程碑", description: "为整个里程碑创建分支（gsd/{version}-{name}）" }
    ]
  }
])
```
</step>

<step name="update_config">
将新设置合并到现有 config.json：

```json
{
  ...existing_config,
  "model_profile": "quality" | "balanced" | "budget",
  "workflow": {
    "research": true/false,
    "plan_check": true/false,
    "verifier": true/false,
    "auto_advance": true/false,
    "nyquist_validation": true/false
  },
  "git": {
    "branching_strategy": "none" | "phase" | "milestone"
  }
}
```

将更新的配置写入 `.planning/config.json`。
</step>

<step name="save_as_defaults">
询问是否将这些设置保存为未来项目的全局默认值：

```
AskUserQuestion([
  {
    question: "将这些保存为新项目的默认设置吗？",
    header: "默认值",
    multiSelect: false,
    options: [
      { label: "是", description: "新项目以这些设置开始（保存到 ~/.gsd/defaults.json）" },
      { label: "否", description: "仅应用于此项目" }
    ]
  }
])
```

如果"是"：将相同的配置对象（减去项目特定字段如 `brave_search`）写入 `~/.gsd/defaults.json`：

```bash
mkdir -p ~/.gsd
```

将 `~/.gsd/defaults.json` 写入：
```json
{
  "mode": <current>,
  "granularity": <current>,
  "model_profile": <current>,
  "commit_docs": <current>,
  "parallelization": <current>,
  "branching_strategy": <current>,
  "workflow": {
    "research": <current>,
    "plan_check": <current>,
    "verifier": <current>,
    "auto_advance": <current>,
    "nyquist_validation": <current>
  }
}
```
</step>

<step name="confirm">
显示：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 设置已更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 设置             | 值 |
|------------------|-----|
| 模型配置文件     | {quality/balanced/budget} |
| 计划研究员       | {开/关} |
| 计划检查器       | {开/关} |
| 执行验证器       | {开/关} |
| 自动推进         | {开/关} |
| Nyquist 验证     | {开/关} |
| Git 分支         | {无/每个阶段/每个里程碑} |
| 保存为默认值     | {是/否} |

这些设置将应用于未来的 /gsd:plan-phase 和 /gsd:execute-phase 运行。

快速命令：
- /gsd:set-profile <配置文件> — 切换模型配置文件
- /gsd:plan-phase --research — 强制研究
- /gsd:plan-phase --skip-research — 跳过研究
- /gsd:plan-phase --skip-verify — 跳过计划检查
```
</step>

</process>

<success_criteria>
- [ ] 已读取当前配置
- [ ] 向用户呈现了 7 个设置（配置文件 + 5 个工作流开关 + git 分支）
- [ ] 配置已使用 model_profile、workflow 和 git 部分更新
- [ ] 用户提供了保存为全局默认值（~/.gsd/defaults.json）的选项
- [ ] 已向用户确认更改
</success_criteria>