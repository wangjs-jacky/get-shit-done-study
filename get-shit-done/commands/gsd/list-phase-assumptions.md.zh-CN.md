---
name: gsd:list-phase-assumptions
description: 在规划之前展示 Claude 对阶段方法的假设
argument-hint: "[阶段]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
分析一个阶段并展示 Claude 对技术方法、实施顺序、范围边界、风险领域和依赖关系的假设。

目的：帮助用户在规划开始之前看到 Claude 的想法 —— 当假设错误时能够尽早调整方向。
输出：仅对话式输出（不创建文件）—— 以"你怎么看？"提示结束
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-phase-assumptions.md
</execution_context>

<context>
阶段号：$ARGUMENTS（必需）

项目状态和路线图在工作流程内通过目标读取加载。
</context>

<process>
1. 验证阶段号参数（如果缺失或无效则出错）
2. 检查阶段是否存在于路线图中
3. 遵循 list-phase-assumptions.md 工作流程：
   - 分析路线图描述
   - 展示关于：技术方法、实施顺序、范围、风险、依赖关系的假设
   - 清晰地呈现假设
   - 提示"你怎么看？"
4. 收集反馈并提供下一步
</process>

<success_criteria>

- 阶段与路线图验证通过
- 在五个领域展示假设
- 用户提示反馈
- 用户知道下一步（讨论上下文、规划阶段或纠正假设）
  </success_criteria>