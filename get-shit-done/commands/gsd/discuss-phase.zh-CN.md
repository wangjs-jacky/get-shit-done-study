---
name: gsd:discuss-phase
description: 在规划前通过自适应提问收集阶段上下文
argument-hint: "<phase> [--auto]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
---

<objective>
提取下游代理所需的实施决策 — 研究人员和规划者将使用 CONTEXT.md 来了解需要调查什么以及哪些选择已被锁定。

**工作方式：**
1. 加载先前上下文（PROJECT.md、REQUIREMENTS.md、STATE.md、先前的 CONTEXT.md 文件）
2. 侦察代码库以寻找可重用资产和模式
3. 分析阶段 — 跳过先前阶段已决定的灰色领域
4. 呈现剩余的灰色领域 — 用户选择要讨论的领域
5. 深入每个选定的领域直到满意
6. 创建 CONTEXT.md，包含指导研究和规划的决策

**输出：** `{phase_num}-CONTEXT.md` — 决策足够清晰，下游代理无需再次询问用户即可行动
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
@~/.claude/get-shit-done/templates/context.md
</execution_context>

<context>
阶段号: $ARGUMENTS（必需）

上下文文件通过工作流中的 `init phase-op` 和路线图/状态工具调用解析。
</context>

<process>
1. 验证阶段号（如果缺失或不在路线图中则报错）
2. 检查 CONTEXT.md 是否存在（如果存在则提供更新/查看/跳过选项）
3. **加载先前上下文** — 读取 PROJECT.md、REQUIREMENTS.md、STATE.md 和所有先前的 CONTEXT.md 文件
4. **侦察代码库** — 寻找可重用资产、模式和集成点
5. **分析阶段** — 检查先前决策，跳过已决定的领域，生成剩余的灰色领域
6. **呈现灰色领域** — 多选：讨论哪些领域？用先前决策 + 代码上下文进行注释
7. **深入每个领域** — 每个领域4个问题，基于代码的选项，Context7 用于库选择
8. **编写 CONTEXT.md** — 章节对应讨论的领域 + code_context 部分
9. 提供下一步（研究或规划）

**关键：范围护栏**
- 来自 ROADMAP.md 的阶段边界是固定的
- 讨论澄清如何实施，而不是是否添加更多
- 如果用户建议新功能："那是它自己的阶段。我稍后会记录。"
- 捕获延迟的想法 — 不要丢失它们，也不要执行它们

**领域感知的灰色领域：**
灰色领域取决于正在构建的内容。分析阶段目标：
- 用户能看到的东西 → 布局、密度、交互、状态
- 用户调用的东西 → 响应、错误、认证、版本控制
- 用户运行的东西 → 输出格式、标志、模式、错误处理
- 用户阅读的东西 → 结构、语气、深度、流程
- 正在组织的东西 → 标准、分组、命名、异常

生成 3-4 个**特定于阶段**的灰色领域，而不是通用类别。

**探测深度：**
- 检查前每个领域询问4个问题
- "对[领域]还有更多问题，还是进入下一个？"
- 如果更多 → 再问4个，再次检查
- 所有领域完成后："准备好创建上下文吗？"

**不要询问（Claude 处理这些）：**
- 技术实施
- 架构选择
- 性能问题
- 范围扩展
</process>

<success_criteria>
- 先前上下文已加载和应用（不再询问已决定的问题）
- 通过智能分析识别灰色领域
- 用户选择要讨论的领域
- 每个选定的领域探索直到满意
- 范围 creep 被重定向到延迟的想法
- CONTEXT.md 捕获决策，而不是模糊的愿景
- 用户知道下一步
</success_criteria>