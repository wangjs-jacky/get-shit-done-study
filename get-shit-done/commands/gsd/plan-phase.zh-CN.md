---
name: gsd:plan-phase
description: 创建详细的阶段计划（PLAN.md）并集成验证循环
argument-hint: "[阶段] [--auto] [--research] [--skip-research] [--gaps] [--skip-verify] [--prd <文件>]"
agent: gsd-planner
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---
<objective>
为路线图阶段创建可执行阶段提示（PLAN.md 文件），集成研究和验证功能。

**默认流程：** 研究（如需要）→ 计划 → 验证 → 完成

**协调器角色：** 解析参数、验证阶段、研究领域（除非跳过）、生成 gsd-planner、用 gsd-plan-checker 验证、迭代直到通过或达到最大迭代次数、呈现结果。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-phase.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
阶段编号：$ARGUMENTS（可选 — 如果省略则自动检测下一个未规划的阶段）

**标志：**
- `--research` — 即使 RESEARCH.md 存在也强制重新研究
- `--skip-research` — 跳过研究，直接进入计划阶段
- `--gaps` — 差距关闭模式（读取 VERIFICATION.md，跳过研究）
- `--skip-verify` — 跳过验证循环
- `--prd <文件>` — 使用 PRD/验收标准文件替代 discuss-phase。自动将需求解析到 CONTEXT.md。完全跳过 discuss-phase。

在执行任何目录查找之前，在第 2 步中规范化阶段输入。
</context>

<process>
从 @~/.claude/get-shit-done/workflows/plan-phase.md 端到端执行 plan-phase 工作流。
保留所有工作流关卡（验证、研究、计划、验证循环、路由）。
</process>