---
article_id: OBA-14xidhtb
tags: [open-source, get-shit-done, gsd, ai, claude]
type: learning
updated_at: 2026-03-17
---

# 为什么 GSD 使用 XML 标签语法

> 分析 GSD 框架中大量使用 XML 标签的设计考量

## 一、核心原因概览

| 原因 | 说明 |
|------|------|
| **结构化解析** | XML 标签提供清晰的语义边界，便于 Claude 解析 |
| **减少歧义** | 明确的标签名减少内容混淆的可能性 |
| **Anthropic 官方推荐** | 这是 Prompt Engineering 的最佳实践 |
| **支持嵌套** | 可以表达复杂的层次结构 |
| **程序化处理** | 便于脚本和工具解析处理 |

---

## 二、结构化解析优势

### 2.1 对比：纯文本 vs XML 标签

**纯文本（容易混淆）：**
```
The objective is to implement user authentication.
Purpose: Allow users to log in securely.
Output: Auth module with JWT tokens.

Task 1: Create User model
Files: src/models/user.ts
Action: Define the user schema with email and password fields.
```

**问题**：
- 哪些是"指令"，哪些是"内容"？
- "Purpose:" 是标签还是文本的一部分？
- Claude 可能将整个段落视为普通文本

**XML 标签（清晰明确）：**
```xml
<objective>
Implement user authentication.
Purpose: Allow users to log in securely.
Output: Auth module with JWT tokens.
</objective>

<task type="auto">
  <name>Create User model</name>
  <files>src/models/user.ts</files>
  <action>Define the user schema with email and password fields.</action>
</task>
```

**优势**：
- `<objective>` 明确标记了目标部分
- `<task>` 明确标记了任务边界
- 子标签 `<name>`, `<files>`, `<action>` 提供结构化字段

### 2.2 实际应用：gsd-executor.md

```xml
<deviation_rules>
**While executing, you WILL discover work not in the plan.**

**RULE 1: Auto-fix bugs**
**Trigger:** Code doesn't work as intended
**Examples:** Wrong queries, logic errors, type errors...

**RULE 4: Ask about architectural changes**
**Trigger:** Fix requires significant structural modification
...
</deviation_rules>
```

**解析效果**：
- Claude 知道 `<deviation_rules>` 内的内容是"偏差处理规则"
- 可以精确提取特定规则，而不是在整个文档中搜索

---

## 三、语义化标签的作用

### 3.1 标签即文档

```xml
<authentication_gates>
**Auth errors during execution are gates, not failures.**
...
</authentication_gates>

<checkpoint_protocol>
**CRITICAL: Automation before verification**
...
</checkpoint_protocol>

<task_commit_protocol>
After each task completes, commit immediately.
...
</task_commit_protocol>
```

**标签名本身就传达了语义**：
- `<authentication_gates>` → 认证关卡处理
- `<checkpoint_protocol>` → 检查点协议
- `<task_commit_protocol>` → 任务提交协议

### 3.2 便于 Claude 理解上下文

当 Claude 看到：

```xml
<role>
You are a GSD plan executor. You execute PLAN.md files atomically...
</role>
```

它知道：
1. 这是角色定义
2. 应该在执行开始时就遵循
3. 这是"我是谁"而不是"我要做什么"

---

## 四、嵌套结构表达复杂关系

### 4.1 任务嵌套

```xml
<tasks>

<task type="auto">
  <name>Task 1: Create User model</name>
  <files>src/models/user.ts</files>
  <action>Define User type with id, email, name, createdAt.</action>
  <verify>tsc --noEmit passes</verify>
  <acceptance_criteria>
    - User type exported and usable
    - TypeScript compiles without errors
  </acceptance_criteria>
  <done>User type exported and usable</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Dashboard - server at http://localhost:3000</what-built>
  <how-to-verify>Visit localhost:3000/dashboard...</how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>
```

**嵌套优势**：
- `<tasks>` 容器明确包含所有任务
- 每个 `<task>` 是独立的单元
- 子标签 `<name>`, `<action>`, `<verify>` 是任务属性
- 支持不同 `type` 的任务（auto vs checkpoint）

### 4.2 选项嵌套

```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>Choose authentication approach</decision>
  <context>Security vs simplicity tradeoff</context>
  <options>
    <option id="jwt">
      <name>JWT Tokens</name>
      <pros>Stateless, scalable</pros>
      <cons>Token revocation complex</cons>
    </option>
    <option id="session">
      <name>Session-based</name>
      <pros>Easy revocation, simple</pros>
      <cons>Requires server state</cons>
    </option>
  </options>
  <resume-signal>Select: jwt or session</resume-signal>
</task>
```

---

## 五、减少歧义和混淆

### 5.1 边界清晰

**问题场景**：在长文档中，如何区分"规则描述"和"规则示例"？

```xml
<deviation_rules>

**RULE 1: Auto-fix bugs**
**Trigger:** Code doesn't work as intended

</deviation_rules>

<analysis_paralysis_guard>
**During task execution, if you make 5+ consecutive Read calls...**
</analysis_paralysis_guard>
```

**效果**：
- `<deviation_rules>` 内的内容是"偏差规则"
- `<analysis_paralysis_guard>` 内的内容是"分析瘫痪保护"
- 边界清晰，不会混淆

### 5.2 引用明确

```xml
<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>
```

**效果**：
- `<execution_context>` 是"执行时需要的上下文文件"
- `<context>` 是"当前计划的项目上下文"
- Claude 知道何时加载这些文件

---

## 六、Anthropic 官方推荐

### 6.1 Prompt Engineering 最佳实践

Anthropic 官方文档推荐使用 XML 标签来结构化 prompt：

> "Using XML tags can help Claude better understand the structure of your prompt and extract specific sections accurately."

**推荐模式**：

```xml
<instructions>
[核心指令]
</instructions>

<context>
[背景信息]
</context>

<examples>
[示例]
</examples>

<output_format>
[输出格式要求]
</output_format>
```

### 6.2 GSD 的应用

GSD 将这一实践系统化，定义了自己的标签体系：

| 标签 | 用途 |
|------|------|
| `<role>` | Agent 角色定义 |
| `<objective>` | 目标说明 |
| `<context>` | 上下文引用 |
| `<tasks>` | 任务容器 |
| `<task>` | 单个任务 |
| `<action>` | 具体行动 |
| `<verify>` | 验证方式 |
| `<deviation_rules>` | 偏差处理规则 |
| `<checkpoint_protocol>` | 检查点协议 |
| `<success_criteria>` | 成功标准 |
| `<output>` | 输出要求 |

---

## 七、程序化处理友好

### 7.1 便于脚本解析

```xml
<task type="auto">
  <name>Task 1: Create User model</name>
  <files>src/models/user.ts</files>
</task>
```

**可以用简单的正则或解析器提取**：

```bash
# 提取所有任务名称
grep -oP '<name>\K[^<]+' plan.md

# 提取任务类型
grep -oP 'type="\K[^"]+' plan.md

# 提取文件列表
grep -oP '<files>\K[^<]+' plan.md
```

### 7.2 支持验证

可以验证 PLAN.md 是否包含必需的字段：

```bash
# 检查是否有 verify 标签
grep -q "<verify>" plan.md || echo "Missing verify section"

# 检查是否有 success_criteria
grep -q "<success_criteria>" plan.md || echo "Missing success criteria"
```

---

## 八、实际效果对比

### 8.1 无结构 Prompt

```
You are a plan executor. Execute the following tasks:
1. Create user model in src/models/user.ts
2. Create user API in src/api/users.ts

For each task, commit when done. If you encounter bugs, fix them.
If you need to make architectural changes, ask the user.
```

**问题**：
- 任务边界不清晰
- 规则散落在文本中
- 难以提取特定信息

### 8.2 结构化 Prompt（GSD 风格）

```xml
<role>
You are a GSD plan executor.
</role>

<deviation_rules>
**RULE 1:** Auto-fix bugs
**RULE 4:** Ask about architectural changes
</deviation_rules>

<tasks>
<task type="auto">
  <name>Create user model</name>
  <files>src/models/user.ts</files>
  <action>Define User type with id, email, name.</action>
  <verify>tsc --noEmit passes</verify>
</task>

<task type="auto">
  <name>Create user API</name>
  <files>src/api/users.ts</files>
  <action>Implement GET /users and POST /users endpoints.</action>
  <verify>curl tests pass</verify>
</task>
</tasks>

<task_commit_protocol>
After each task, commit immediately.
</task_commit_protocol>
```

**优势**：
- 角色定义清晰
- 规则集中在一个区块
- 每个任务有明确的结构
- 验证标准明确

---

## 九、总结

| 维度 | XML 标签的优势 |
|------|---------------|
| **可读性** | 语义清晰，人类和 AI 都容易理解 |
| **可解析性** | 便于程序化处理和验证 |
| **可维护性** | 结构化内容更容易修改和扩展 |
| **减少歧义** | 明确的边界减少混淆 |
| **官方推荐** | Anthropic 认可的最佳实践 |
| **嵌套支持** | 表达复杂的层次关系 |

**核心思想**：XML 标签不是"装饰"，而是 **Prompt Engineering 的核心工具**，用于构建结构化、可解析、低歧义的 AI 指令。

---

## 十、可借鉴的模式

在编写自己的 Skills 或 Agent 定义时，可以参考 GSD 的标签体系：

### 10.1 Agent 定义模板

```xml
<role>
[Agent 角色描述]
</role>

<objective>
[目标说明]
</objective>

<context>
[上下文引用]
</context>

<process>
[执行流程]
</process>

<rules>
[规则列表]
</rules>

<success_criteria>
[成功标准]
</success_criteria>
```

### 10.2 任务定义模板

```xml
<task type="auto|checkpoint">
  <name>[任务名称]</name>
  <files>[涉及的文件]</files>
  <action>[具体行动]</action>
  <verify>[验证方式]</verify>
  <done>[完成标准]</done>
</task>
```

### 10.3 规则定义模板

```xml
<rules>

**RULE 1: [规则名称]**
**Trigger:** [触发条件]
**Action:** [执行动作]

**RULE 2: [规则名称]**
**Trigger:** [触发条件]
**Action:** [执行动作]

</rules>
```
