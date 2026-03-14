---
name: gsd:list-phase-assumptions
description: 在规划前展示 Claude 对阶段方法论的假设
argument-hint: "[阶段]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
分析一个阶段并呈现 Claude 关于技术方法、实施顺序、范围边界、风险区域和依赖关系的假设。

目的：在规划开始前帮助用户了解 Claude 的想法 - 当假设错误时能够及早调整方向。
输出：仅对话式输出（不创建文件）- 以"What do you think?"提示结束
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-phase-assumptions.md
</execution_context>

<context>
Phase number: $ARGUMENTS (必需)

项目状态和路线图在工作流中使用目标读取加载。
</context>

<process>
1. 验证阶段编号参数（如果缺失或无效则报错）
2. 检查阶段是否存在于路线图中
3. 遵循 list-phase-assumptions.md 工作流：
   - 分析路线图描述
   - 展示以下方面的假设：技术方法、实施顺序、范围、风险、依赖关系
   - 清晰地呈现假设
   - 提示"What do you think?"
4. 收集反馈并提供下一步建议
</process>

<success_criteria>

- 阶段与路线图验证通过
- 在五个领域展示了假设
- 用户被要求提供反馈
- 用户知道下一步（讨论上下文、规划阶段或纠正假设）
  </success_criteria>