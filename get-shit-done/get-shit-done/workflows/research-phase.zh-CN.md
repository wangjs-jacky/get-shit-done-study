<目的>
研究如何实现一个阶段。使用阶段上下文生成 gsd-phase-researcher。

独立研究命令。对于大多数工作流，使用 `/gsd:plan-phase` 自动集成研究。
</目的>

<流程>

## 步骤 0：解析模型配置文件

@~/.claude/get-shit-done/references/model-profile-resolution.md

为以下内容解析模型：
- `gsd-phase-researcher`

## 步骤 1：标准化和验证阶段

@~/.claude/get-shit-done/references/phase-argument-parsing.md

```bash
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${PHASE}")
```

如果 `found` 为 false：错误并退出。

## 步骤 2：检查现有研究

```bash
ls .planning/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

如果存在：提供更新/查看/跳过选项。

## 步骤 3：收集阶段上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
# 提取: phase_dir, padded_phase, phase_number, state_path, requirements_path, context_path
```

## 步骤 4：生成研究代理

```
Task(
  prompt="<objective>
研究阶段 {phase}: {name} 的实现方法
</objective>

<files_to_read>
- {context_path} (来自 /gsd:discuss-phase 的用户决定)
- {requirements_path} (项目需求)
- {state_path} (项目决定和历史)
</files_to_read>

<additional_context>
阶段描述: {description}
</additional_context>

<output>
写入: .planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>",
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}"
)
```

## 步骤 5：处理返回

- `## RESEARCH COMPLETE` — 显示摘要，提供：计划/深入挖掘/查看/完成
- `## CHECKPOINT REACHED` — 呈现给用户，生成继续
- `## RESEARCH INCONCLUSIVE` — 显示尝试，提供：添加上下文/尝试不同模式/手动

</流程>