---
article_id: OBA-5u6nkclb
tags: [open-source, get-shit-done, reusable-designs, ai-agent, ai, skill]
type: learning
updated_at: 2026-03-17
---

# XML 标签结构化 Prompt 设计

**来源**：get-shit-done / agents & workflows
**发现时间**：2026-03-15
**关键词**：#prompt-engineering #xml #结构化 #ai约束

## 核心思想

用 XML 标签结构化 prompt，强制 AI 按步骤执行，而不是依赖 AI 自由理解。

## 设计要点

### 1. 层级结构

```
role (角色定义)
  ↓
purpose (目的)
  ↓
process (流程容器)
  ↓
step (步骤) → sub (子步骤)
  ↓
success_criteria (验证)
```

### 2. 核心标签清单

| 类别 | 标签 | 用途 |
|------|------|------|
| **结构** | `<role>` | 定义 AI 角色 |
| | `<purpose>` | 说明目的 |
| | `<process>` | 流程容器 |
| | `<step name="...">` | 单个步骤 |
| | `<sub>` | 子步骤 |
| | `<task>` | 任务定义 |
| **上下文** | `<context>` | 背景信息 |
| | `<files_to_read>` | 必读文件 |
| | `<required_reading>` | 必读内容 |
| **控制** | `<if>` | 条件分支 |
| | `<done>` | 完成条件 |
| | `<automated>` | 自动执行部分 |
| **验证** | `<success_criteria>` | 成功标准 (checklist) |
| | `<verify>` | 验证步骤 |
| | `<quality_gate>` | 质量门禁 |
| **约束** | `<constraints>` | 约束条件 |
| | `<forbidden_files>` | 禁止访问的文件 |
| | `<critical_rules>` | 关键规则 |
| **哲学** | `<philosophy>` | 核心理念 |
| | `<why_this_matters>` | 为什么重要 |
| | `<anti_patterns>` | 应该避免什么 |

### 3. 步骤标签的属性

```xml
<step name="step_name" priority="first|high|low">
  <!-- 步骤内容 -->
</step>
```

### 4. Checklist 风格验证

```xml
<success_criteria>
- [ ] 检查项 1
- [ ] 检查项 2
- [ ] 检查项 3
</success_criteria>
```

## 代码示例

### 完整模板

```markdown
---
name: skill-name
description: 触发条件描述
---

<role>
你是一个 [角色描述]。
你的工作是 [核心职责]。
</role>

<purpose>
[这个 skill 解决什么问题]
</purpose>

<philosophy>
[核心理念，指导 AI 思维方式]
</philosophy>

<process>

<step name="init" priority="first">
  初始化步骤。

  ```bash
  # bash 命令
  ```
</step>

<step name="load_context">
  加载上下文。

  <files_to_read>
  - path/to/file1.md
  - path/to/file2.md
  </files_to_read>

  <context>
  [背景信息]
  </context>
</step>

<step name="main_logic">
  主要逻辑。

  <if condition="xxx">
    条件 A 成立时执行
  </if>

  <if condition="yyy">
    条件 B 成立时执行
  </if>
</step>

<step name="verify">
  验证结果。

  <verify>
  - 检查 X 是否完成
  - 检查 Y 是否正确
  </verify>
</step>

</process>

<success_criteria>
- [ ] 步骤 1 完成
- [ ] 步骤 2 完成
- [ ] 输出符合预期
</success_criteria>

<critical_rules>
- 规则 1：[必须遵守]
- 规则 2：[绝对禁止]
</critical_rules>
```

### 嵌套示例

```xml
<process>
  <step name="outer">
    <sub>子步骤 1</sub>
    <sub>子步骤 2</sub>

    <if condition="has_codebase_map">
      <sub>读取 codebase map</sub>
    </if>
  </step>
</process>
```

### 条件分支示例

```xml
<step name="handle_existing">
  <if condition="exists">
    文件已存在，询问用户：
    1. 覆盖
    2. 跳过
    3. 合并
  </if>

  <if condition="not_exists">
    直接创建新文件
  </if>
</step>
```

## 为什么这样设计？

| 问题 | XML 标签如何解决 |
|------|------------------|
| AI 容易遗漏步骤 | `<step>` 强制顺序执行 |
| AI 自由发挥 | `<process>` 容器约束 |
| 缺乏验证 | `<success_criteria>` 让 AI 自检 |
| 上下文混乱 | `<context>` 标签明确区分 |
| 条件逻辑 | `<if>` 实现分支 |
| 行为约束 | `<critical_rules>` `<constraints>` |

## 与 Markdown 的配合

XML 标签内可以嵌入 Markdown：

```xml
<step name="show_table">
  表格：

  | 列1 | 列2 |
  |-----|-----|
  | A   | B   |
</step>

<step name="run_command">
  执行命令：

  ```bash
  npm install
  ```
</step>
```

## 可能的复用场景

- [ ] jacky-skills：所有 SKILL.md 使用此结构
- [ ] Agent 定义：使用 `<role>` `<process>` `<success_criteria>`
- [ ] Workflow 定义：使用 `<step>` 嵌套
- [ ] 任何需要约束 AI 行为的 prompt

## 复用记录

- [ ] 在 jacky-skills 中应用此设计模式

---

## 相关源码路径

| 组件 | 路径 |
|------|------|
| Agent 示例 | `get-shit-done/agents/gsd-planner.md` |
| Workflow 示例 | `get-shit-done/get-shit-done/workflows/plan-phase.md` |
| Mapper Agent | `get-shit-done/agents/gsd-codebase-mapper.md` |
