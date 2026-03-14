<目的>
通过多问题提示交互式配置 GSD 工作流代理（research、plan_check、verifier）和模型配置文件选择。用用户偏好更新 .planning/config.json。可选择将设置保存为全局默认值（~/.gsd/defaults.json）供将来项目使用。
</目的>

<必读资料>
在开始前读取调用提示的 execution_context 引用的所有文件。
</必读资料>

<流程>

<step name="ensure_and_load_config">
确保配置文件存在并加载当前状态：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-ensure-section
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

如果缺失，这会创建带有默认值的 `.planning/config.json` 并加载当前配置值。
</step>

<step name="read_current">
```bash
cat .planning/config.json
```

解析当前值（如果不存在默认为 `true`）：
- `workflow.research` — 在计划阶段期间生成研究代理
- `workflow.plan_check` — 在计划阶段期间生成计划检查器
- `workflow.verifier` — 在执行阶段期间生成验证器
- `workflow.nyquist_validation` — 在计划期间验证架构研究（如果不存在默认为 true）
- `model_profile` — 每个代理使用哪个模型（默认：`balanced`）
- `git.branching_strategy` — 分支方法（默认：`"none"`）
</step>

<step name="present_settings">
使用 AskUserQuestion，预选当前值：

```
AskUserQuestion([
  {
    question: "Which model profile for agents?",
    header: "Model",
    multiSelect: false,
    options: [
      { label: "Quality", description: "Opus everywhere except verification (highest cost)" },
      { label: "Balanced (Recommended)", description: "Opus for planning, Sonnet for execution/verification" },
      { label: "Budget", description: "Sonnet for writing, Haiku for research/verification (lowest cost)" }
    ]
  },
  {
    question: "Spawn Plan Researcher? (researches domain before planning)",
    header: "Research",
    multiSelect: false,
    options: [
      { label: "Yes", description: "Research phase goals before planning" },
      { label: "No", description: "Skip research, plan directly" }
    ]
  },
  {
    question: "Spawn Plan Checker? (verifies plans before execution)",
    header: "Plan Check",
    multiSelect: false,
    options: [
      { label: "Yes", description: "Verify plans meet phase goals" },
      { label: "No", description: "Skip plan verification" }
    ]
  },
  {
    question: "Spawn Execution Verifier? (verifies phase completion)",
    header: "Verifier",
    multiSelect: false,
    options: [
      { label: "Yes", description: "Verify must-haves after execution" },
      { label: "No", description: "Skip post-execution verification" }
    ]
  },
  {
    question: "Auto-advance pipeline? (discuss → plan → execute automatically)",
    header: "Auto",
    multiSelect: false,
    options: [
      { label: "No (Recommended)", description: "Manual /clear + paste between stages" },
      { label: "Yes", description: "Chain stages via Task() subagents (same isolation)" }
    ]
  },
  {
    question: "Enable Nyquist Validation? (researches test coverage during planning)",
    header: "Nyquist",
    multiSelect: false,
    options: [
      { label: "Yes (Recommended)", description: "Research automated test coverage during plan-phase. Adds validation requirements to plans. Blocks approval if tasks lack automated verify." },
      { label: "No", description: "Skip validation research. Good for rapid prototyping or no-test phases." }
    ]
  },
  // 注意：Nyquist 验证取决于研究输出。如果研究被禁用，
  // 计划阶段自动跳过 Nyquist 步骤（没有 RESEARCH.md 可提取）。
  {
    question: "Git branching strategy?",
    header: "Branching",
    multiSelect: false,
    options: [
      { label: "None (Recommended)", description: "Commit directly to current branch" },
      { label: "Per Phase", description: "Create branch for each phase (gsd/phase-{N}-{name})" },
      { label: "Per Milestone", description: "Create branch for entire milestone (gsd/{version}-{name})" }
    ]
  }
])
```
</step>

<step name="update_config">
将新设置合并到现有 config.json 中：

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
询问是否将这些设置保存为将来项目的全局默认值：

```
AskUserQuestion([
  {
    question: "Save these as default settings for all new projects?",
    header: "Defaults",
    multiSelect: false,
    options: [
      { label: "Yes", description: "New projects start with these settings (saved to ~/.gsd/defaults.json)" },
      { label: "No", description: "Only apply to this project" }
    ]
  }
])
```

如果"Yes"：将相同的配置对象（减去项目特定字段如 `brave_search`）写入 `~/.gsd/defaults.json`：

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
 GSD ► SETTINGS UPDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 设置                   | 值 |
|----------------------|-------|
| Model Profile        | {quality/balanced/budget} |
| Plan Researcher      | {On/Off} |
| Plan Checker         | {On/Off} |
| Execution Verifier   | {On/Off} |
| Auto-Advance         | {On/Off} |
| Nyquist Validation   | {On/Off} |
| Git Branching        | {None/Per Phase/Per Milestone} |
| Saved as Defaults    | {Yes/No} |

这些设置适用于将来的 /gsd:plan-phase 和 /gsd:execute-phase 运行。

快速命令：
- /gsd:set-profile <profile> — 切换模型配置文件
- /gsd:plan-phase --research — 强制研究
- /gsd:plan-phase --skip-research — 跳过研究
- /gsd:plan-phase --skip-verify — 跳过计划检查
```
</step>

</process>

<成功标准>
- [ ] 当前配置已读取
- [ ] 向用户提供了 7 个设置（配置文件 + 5 个工作流切换 + git 分支）
- [ ] 配置已使用 model_profile、workflow 和 git 部分更新
- [ ] 用户被提议保存为全局默认值（~/.gsd/defaults.json）
- [ ] 更改已确认给用户
</成功标准>