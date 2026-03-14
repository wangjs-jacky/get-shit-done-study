---
name: gsd:discuss-phase
description: 在规划之前通过自适应提问收集阶段上下文
argument-hint: "<阶段> [--自动]"
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
提取下游代理（研究员和规划师）所需的实现决策 —— 研究员和规划师将使用 CONTEXT.md 来了解需要调查什么以及哪些选择已锁定。

**工作原理：**
1. 加载之前的上下文（PROJECT.md、REQUIREMENTS.md、STATE.md、之前的 CONTEXT.md 文件）
2. 侦察代码库以寻找可重用的资产和模式
3. 分析阶段 —— 跳过之前阶段已决定的不确定领域
4. 呈现剩余的不确定领域 —— 用户选择要讨论的内容
5. 深入探讨每个选定的领域直到满意
6. 创建指导研究和规划的决策 CONTEXT.md

**输出：** `{阶段号}-CONTEXT.md` —— 决策足够清晰，下游代理可以再次不询问用户的情况下行动
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
@~/.claude/get-shit-done/templates/context.md
</execution_context>

<context>
阶段号：$ARGUMENTS（必需）

上下文文件在工作流程中使用 `init phase-op` 和路线图/状态工具调用进行解析。
</context>

<process>
1. 验证阶段号（如果缺失或不在路线图中则出错）
2. 检查 CONTEXT.md 是否存在（如果存在则提供更新/查看/跳过选项）
3. **加载之前的上下文** —— 读取 PROJECT.md、REQUIREMENTS.md、STATE.md 和所有之前的 CONTEXT.md 文件
4. **侦察代码库** —— 寻找可重用的资产、模式和集成点
5. **分析阶段** —— 检查之前的决策，跳过已决定的领域，生成剩余的不确定领域
6. **呈现不确定领域** —— 多选：讨论哪些？用之前的决策 + 代码上下文进行标注
7. **深入探讨每个领域** —— 每个领域 4 个问题，基于代码的选项，Context7 用于库选择
8. **写入 CONTEXT.md** —— 部分与讨论的领域 + 代码上下文部分匹配
9. 提供下一步（研究或规划）

**关键：范围护栏**
- 来自 ROADMAP.md 的阶段边界是固定的
- 讨论澄清如何实现，而不是是否添加更多功能
- 如果用户建议新功能："那是一个独立的阶段。我会在后续记录它。"
- 捕获延迟的想法 —— 不要丢失它们，也不要对它们采取行动

**领域特定的不确定领域：**
不确定领域取决于正在构建的内容。分析阶段目标：
- 用户看到的内容 → 布局、密度、交互、状态
- 用户调用的内容 → 响应、错误、认证、版本控制
- 用户运行的内容 → 输出格式、标志、模式、错误处理
- 用户阅读的内容 → 结构、语调、深度、流程
- 正在组织的内容 → 标准、分组、命名、例外

生成 3-4 个**阶段特定的**不确定领域，而不是通用类别。

**深入探索深度：**
- 每个领域在检查前询问 4 个问题
- "对 [领域] 有更多问题，还是进入下一个？"
- 如果更多 → 再问 4 个问题，再次检查
- 所有领域完成后："准备好创建上下文吗？"

**不要询问这些（Claude 处理这些）：**
- 技术实现
- 架构选择
- 性能考虑
- 范围扩展
</process>

<success_criteria>
- 加载并应用之前的上下文（不再询问已决定的问题）
- 通过智能分析识别不确定领域
- 用户选择讨论哪些领域
- 每个选定的领域探索到满意为止
- 范围 creep 被重新定向为延迟想法
- CONTEXT.md 捕获决策，而不是模糊的愿景
- 用户知道下一步
</success_criteria>