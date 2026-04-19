---
article_id: OBA-1w0sh48t
tags: [open-source, get-shit-done, gsd, ai]
type: learning
updated_at: 2026-03-17
---

# GSD XML 标签阅读顺序与语义

> GSD 框架使用层次化的 XML 标签管理文件引用，不同标签有不同的读取时机和强制程度。

## 问题

用户想了解 GSD 框架中环境标签的阅读顺序、可读性（是否强制读取）以及每个标签的读取时机。特别是 `<files_to_read>` 和 `<read_first>` 的区别容易混淆。

## 答案

### 标签阅读顺序（从外到内）

```
┌─────────────────────────────────────────────────────────────┐
│  第1层：<required_reading>                                   │
│  ├── 时机：任何操作之前（最先读取）                          │
│  ├── 强制：是（强制性指令）                                  │
│  └── 语义：明确告诉 AI "必须先读这些"                        │
├─────────────────────────────────────────────────────────────┤
│  第2层：<execution_context>                                  │
│  ├── 时机：执行计划前                                        │
│  ├── 强制：是（由 required_reading 指令触发）               │
│  └── 语义：定义"如何执行"（工作流、模板、模式）              │
├─────────────────────────────────────────────────────────────┤
│  第3层：<context>                                            │
│  ├── 时机：理解背景时                                        │
│  ├── 强制：否（按需读取）                                    │
│  └── 语义：定义"做什么"（项目目标、路线图、状态）            │
├─────────────────────────────────────────────────────────────┤
│  第4层：<files_to_read>                                      │
│  ├── 时机：使用 Read 工具时                                  │
│  ├── 强制：是（明确的工具指令）                              │
│  └── 语义：具体的文件路径列表                                │
├─────────────────────────────────────────────────────────────┤
│  第5层：<read_first>                                         │
│  ├── 时机：任务执行前                                        │
│  ├── 强制：是（任务级依赖）                                  │
│  └── 语义：当前任务需要的参考文件                            │
└─────────────────────────────────────────────────────────────┘
```

### 标签语义对照表

| 标签 | 读取时机 | 是否强制 | 用途 | 典型内容 |
|------|----------|----------|------|----------|
| `<required_reading>` | **任何操作前** | **强制** | 最高级指令 | "阅读 execution_context 引用的所有文件" |
| `<execution_context>` | 计划执行前 | 强制 | 定义如何执行 | 工作流、模板、检查点模式 |
| `<context>` | 理解背景时 | 按需 | 定义做什么 | PROJECT.md、ROADMAP.md、STATE.md |
| `<files_to_read>` | 工具调用时 | 强制 | 明确文件列表 | 具体文件路径 |
| `<read_first>` | 任务执行前 | 强制 | 任务级依赖 | 当前任务需要的参考文件 |

### @ 符号的语义

`@` 只是文件引用语法，真正的语义由包裹它的标签决定：

| 标签包裹 | @ 引用的含义 |
|----------|--------------|
| `<execution_context>` | 这些文件定义了执行规范 |
| `<context>` | 这些文件定义了项目背景 |
| `<read_first>` | 这些文件是当前任务的依赖 |

### 双重约束设计

GSD 使用**结构定义 + 指令约束**确保 AI 正确读取：

```xml
<!-- 1. 结构定义 -->
<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<!-- 2. 指令约束 -->
<required_reading>
在开始之前，阅读 execution_context 引用的所有文件
</required_reading>
```

## 核心区别：files_to_read vs read_first

| 特性 | `<files_to_read>` | `<read_first>` |
|------|-------------------|----------------|
| **层级** | Agent/工作流级别 | 任务级别 |
| **使用位置** | Agent prompt、工作流开头 | PLAN.md 中的具体任务 |
| **触发方式** | 由 orchestrator 动态注入 | 由 planner 静态写入计划 |
| **读取时机** | **Agent 启动时**（最先读） | **任务执行前**（按需读） |
| **内容来源** | 由 `gsd-tools init` 动态生成 | 由 planner 根据任务需求指定 |

### 类比理解

以电商网站开发为例：

**`<files_to_read>` = 入职资料包**
```
项目经理 spawn 后端工程师时给：
<files_to_read>
- STATE.md          ← 项目当前状态
- ROADMAP.md        ← 整体规划
- 03-order/03-01-PLAN.md  ← 后端 API 的具体计划
</files_to_read>
```

**`<read_first>` = 任务前的检查清单**
```xml
<task type="auto">
  <name>Task 1: 创建订单表结构</name>
  <read_first>prisma/schema.prisma, docs/database-conventions.md</read_first>
  <action>添加 Order 模型...</action>
</task>
```

### 两个维度的总结

| 维度 | `files_to_read` | `read_first` |
|------|-----------------|--------------|
| **范围** | 项目全局 | 具体任务 |
| **内容** | STATE.md、ROADMAP.md（每个 Agent 都要读） | 任务相关的具体文件（每个任务不同） |
| **时机** | Agent 启动时（一次） | 每个任务执行前（多次） |
| **目的** | 了解"我在哪、要做什么" | 了解"这个任务依赖什么" |

## 代码示例

### 典型的 PLAN.md 结构

```markdown
---
phase: 03-order
plan: 01
type: execute
---

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>
<task type="auto">
  <name>Task 1: 创建订单表</name>
  <files>prisma/schema.prisma</files>
  <read_first>prisma/schema.prisma, docs/database-conventions.md</read_first>
  <action>添加 Order 模型...</action>
  <verify>prisma db push 成功</verify>
  <done>Order 表创建完成</done>
</task>
</tasks>
```

## 关键洞察

1. **层次分明**：`execution_context` > `context` > `read_first`
2. **语义清晰**：标签名称传达读取时机和目的
3. **双重约束**：结构定义 + 指令约束
4. **按需引用**：避免无意义的链式引用

---

*归档时间: 2026-03-15*
*对话主题: GSD XML 标签体系*
