# GSD XML 标签体系

> GSD 使用 XML 标签结构化 prompt，让大模型按步骤执行，而不是自由发挥。

## 相关源码路径

| 目录 | 路径 |
|------|------|
| Agent 定义 | `get-shit-done/agents/` |
| Workflow 定义 | `get-shit-done/get-shit-done/workflows/` |

---

## 一、标签使用统计（Top 50）

| 标签 | 出现次数 | 用途 |
|------|----------|------|
| `step` | 592 | 步骤定义（核心） |
| `success_criteria` | 94 | 成功标准 |
| `files_to_read` | 90 | 必读文件列表 |
| `sub` | 75 | 子步骤 |
| `purpose` | 75 | 目的说明 |
| `process` | 73 | 流程定义 |
| `required_reading` | 55 | 必读内容 |
| `if` | 34 | 条件判断 |
| `current` | 33 | 当前状态 |
| `output` | 29 | 输出格式 |
| `role` | 25 | 角色定义 |
| `task` | 23 | 任务定义 |
| `objective` | 15 | 目标 |

---

## 二、标签分类体系

### 2.1 结构类（定义 prompt 骨架）

| 标签 | 用途 | 示例 |
|------|------|------|
| `<role>` | 定义 Agent 角色 | "You are a GSD planner..." |
| `<purpose>` | 说明这个 workflow 的目的 | "Orchestrate parallel mapper agents..." |
| `<objective>` | 目标描述 | "Check for GSD updates..." |
| `<process>` | 包含所有步骤的容器 | `<process>...</process>` |
| `<step>` | 单个步骤 | `<step name="load_context">` |
| `<sub>` | 子步骤 | `<sub>详细说明</sub>` |
| `<task>` | 任务定义 | `<task type="auto" tdd="true">` |

### 2.2 上下文类（提供背景信息）

| 标签 | 用途 | 示例 |
|------|------|------|
| `<project_context>` | 项目上下文 | 现有架构、技术栈 |
| `<planning_context>` | 规划上下文 | ROADMAP、已完成的阶段 |
| `<milestone_context>` | 里程碑上下文 | 当前 milestone 目标 |
| `<phase_requirements>` | 阶段需求 | 这个阶段要完成什么 |
| `<context>` | 通用上下文 | 任意背景信息 |
| `<code_context>` | 代码上下文 | 相关代码片段 |
| `<files_to_read>` | 必读文件列表 | 优先读取的文件 |
| `<required_reading>` | 必读内容 | 必须先读取的内容 |

### 2.3 哲学/原则类（指导思维）

| 标签 | 用途 | 示例 |
|------|------|------|
| `<philosophy>` | 核心理念 | "Document quality over brevity" |
| `<core_principle>` | 核心原则 | "Goal-backward planning" |
| `<why_this_matters>` | 为什么重要 | 解释这个步骤的意义 |
| `<behavior>` | 行为准则 | 应该如何行动 |
| `<anti_patterns>` | 反模式 | 应该避免什么 |

### 2.4 流程控制类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<if>` | 条件分支 | `<if condition="...">` |
| `<current>` | 当前状态检查 | 检查当前处于什么状态 |
| `<done>` | 完成条件 | 什么时候算完成 |
| `<deferred>` | 延迟处理 | 稍后处理的内容 |
| `<after>` | 后置操作 | 步骤完成后做什么 |
| `<automated>` | 自动化部分 | 自动执行的逻辑 |

### 2.5 验证/质量类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<success_criteria>` | 成功标准 | Checklist 形式 |
| `<verify>` | 验证步骤 | 如何验证结果 |
| `<quality_gate>` | 质量门禁 | 必须通过的检查点 |
| `<acceptance_criteria>` | 验收标准 | 用户验收条件 |
| `<self_check>` | 自检 | Agent 自我检查 |
| `<verification>` | 验证过程 | 验证流程 |

### 2.6 输出类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<output>` | 输出定义 | 期望的输出格式 |
| `<output_format>` | 输出格式 | 具体格式要求 |
| `<structured_returns>` | 结构化返回 | 返回的数据结构 |
| `<expected_output>` | 预期输出 | 应该产出什么 |
| `<interfaces>` | 接口定义 | 类型、接口代码 |

### 2.7 约束类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<constraints>` | 约束条件 | 限制条件 |
| `<user_constraints>` | 用户约束 | 用户指定的限制 |
| `<forbidden_files>` | 禁止读取的文件 | 敏感文件列表 |
| `<critical_rules>` | 关键规则 | 必须遵守的规则 |
| `<scope_guardrail>` | 范围护栏 | 防止范围蔓延 |

### 2.8 决策类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<decisions>` | 决策点 | 需要做出的决策 |
| `<decision>` | 单个决策 | 具体决策内容 |
| `<prior_decisions>` | 之前的决策 | 历史决策记录 |
| `<options>` | 选项列表 | 可选方案 |
| `<option>` | 单个选项 | `<option pros="..." cons="...">` |
| `<pros>` | 优点 | 选项的优点 |
| `<cons>` | 缺点 | 选项的缺点 |

### 2.9 恢复/中断类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<checkpoint_protocol>` | 检查点协议 | 如何保存状态 |
| `<resumption>` | 恢复逻辑 | 如何恢复工作 |
| `<continuation_handling>` | 继续处理 | 中断后如何继续 |
| `<partial_completion>` | 部分完成 | 未完成部分的处理 |
| `<remaining_work>` | 剩余工作 | 还要做什么 |

### 2.10 错误处理类

| 标签 | 用途 | 示例 |
|------|------|------|
| `<failure_handling>` | 失败处理 | 出错怎么办 |
| `<error_codes>` | 错误码定义 | 错误类型 |
| `<repair_actions>` | 修复动作 | 如何修复问题 |
| `<repair_directive>` | 修复指令 | 具体修复步骤 |
| `<blockers>` | 阻塞项 | 阻塞进度的问题 |

---

## 三、标签属性

### 3.1 `<step>` 标签的属性

```xml
<step name="load_codebase_context" priority="first">
```

| 属性 | 用途 | 示例值 |
|------|------|--------|
| `name` | 步骤名称 | "load_codebase_context" |
| `priority` | 优先级 | "first", "high", "low" |

### 3.2 `<task>` 标签的属性

```xml
<task type="auto" tdd="true">
```

| 属性 | 用途 | 示例值 |
|------|------|--------|
| `type` | 任务类型 | "auto", "manual" |
| `tdd` | 是否 TDD | "true", "false" |

### 3.3 `<if>` 标签的属性

```xml
<if condition="phase_type == 'UI'">
```

---

## 四、设计模式

### 4.1 嵌套结构

```xml
<process>
  <step name="init_context" priority="first">
    <sub>Load initial context</sub>
    ```bash
    # bash 命令
    ```
  </step>

  <step name="check_existing">
    <if condition="exists">
      <!-- 条件内容 -->
    </if>
  </step>
</process>
```

### 4.2 Checklist 风格的 success_criteria

```xml
<success_criteria>
- [ ] Installed version read correctly
- [ ] Latest version checked via npm
- [ ] User confirmation obtained
</success_criteria>
```

### 4.3 表格嵌入

```xml
<step name="load_codebase_context">
| Phase Keywords | Load These |
|----------------|------------|
| UI, frontend   | CONVENTIONS.md, STRUCTURE.md |
| API, backend   | ARCHITECTURE.md, CONVENTIONS.md |
</step>
```

---

## 五、为什么用 XML 标签？

### 5.1 对比纯文本 prompt

| 方式 | 优点 | 缺点 |
|------|------|------|
| 纯文本 | 简单 | AI 容易遗漏或自由发挥 |
| XML 标签 | 结构化、可嵌套 | 写起来更复杂 |

### 5.2 核心好处

1. **强制结构** - AI 必须按 `<step>` 顺序执行
2. **可嵌套** - `<process>` → `<step>` → `<sub>` 形成层级
3. **条件逻辑** - `<if>` 实现分支
4. **验证标准** - `<success_criteria>` 让 AI 自检
5. **上下文隔离** - `<context>` 等标签明确区分背景和指令

### 5.3 与 Markdown 的配合

GSD 会在 XML 标签内嵌入 Markdown：
- 表格
- 代码块 \`\`\`bash
- 列表 - [ ]

这样既利用了 XML 的结构化，又保留了 Markdown 的可读性。

---

## 六、对 jacky-skills 的启示

### 可复用的标签设计

```markdown
<!-- SKILL.md 模板 -->
---
name: skill-name
description: ...
---

<role>
你是什么角色
</role>

<purpose>
这个 skill 解决什么问题
</purpose>

<process>
<step name="step1" priority="first">
  第一步做什么
</step>

<step name="step2">
  第二步做什么
  <if condition="xxx">
    条件分支
  </if>
</step>
</process>

<success_criteria>
- [ ] 检查项1
- [ ] 检查项2
</success_criteria>
```

---

## 七、完整标签清单

### 高频标签（出现 50+ 次）
`step`, `success_criteria`, `files_to_read`, `sub`, `purpose`, `process`, `required_reading`

### 中频标签（出现 10-50 次）
`if`, `current`, `output`, `role`, `task`, `objective`, `verify`, `structured_returns`, `philosophy`, `execution_flow`, `automated`, `description`, `core_principle`, `action`, `instructions`

### 低频但重要的标签
- 约束：`constraints`, `forbidden_files`, `critical_rules`
- 恢复：`checkpoint_protocol`, `resumption`
- 验证：`quality_gate`, `acceptance_criteria`
- 决策：`decisions`, `options`, `pros`, `cons`

---

*整理时间: 2026-03-15*
