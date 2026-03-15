# XML 标签引用机制

> GSD 使用 `@` 符号和层次化标签实现文件引用，这是其 prompt 工程的核心技巧之一。

## 一、核心发现

**XML 标签不是随意命名的，它们形成了层次化的文件引用体系。**

关键证据：在 `required_reading` 中会明确告诉 AI：

> "在开始之前，阅读 `execution_context` 引用的所有文件"

这表明：
1. `@` 符号是**文件引用语法**
2. 标签名称定义了**引用的语义**（何时读、为什么读）
3. AI 会根据标签语义决定**读取时机**

---

## 二、`@` 符号的语义

`@` 告诉 AI "这是一个需要读取的文件路径"：

| 语法 | 含义 | 示例 |
|------|------|------|
| `@~/.claude/...` | 用户主目录 | `@~/.claude/get-shit-done/workflows/execute-plan.md` |
| `@./.claude/...` | 项目目录 | `@./.claude/get-shit-done/templates/summary.md` |
| `@.planning/...` | 规划目录 | `@.planning/PROJECT.md` |
| `@src/...` | 源码目录 | `@src/path/to/relevant.ts` |

---

## 三、标签的层次化关联

```
┌─────────────────────────────────────────────────────────────┐
│  <execution_context>                                         │
│  ├── @~/.claude/.../execute-plan.md   ← 执行规范            │
│  ├── @~/.claude/.../summary.md        ← 输出模板            │
│  └── @~/.claude/.../checkpoints.md    ← 检查点模式          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 语义：执行计划前必须读取                                  ││
│  │ 职责：定义"如何执行"                                     ││
│  │ 时机：计划级                                             ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  <context>                                                   │
│  ├── @.planning/PROJECT.md            ← 项目目标            │
│  ├── @.planning/ROADMAP.md            ← 路线图              │
│  ├── @.planning/STATE.md              ← 当前状态            │
│  └── @src/path/to/relevant.ts         ← 相关源码            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 语义：理解计划背景                                        ││
│  │ 职责：定义"做什么"                                       ││
│  │ 时机：计划级                                             ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  <task>                                                      │
│    <read_first>                                             │
│      path/to/reference.ext, path/to/source-of-truth.ext    │
│    </read_first>                                            │
│    <action>具体实现</action>                                 │
│  </task>                                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 语义：执行任务前优先读取                                  ││
│  │ 职责：任务级依赖                                         ││
│  │ 时机：任务级                                             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 四、标签语义对照表

| 标签 | 语义 | 读取时机 | 用途 | 典型内容 |
|------|------|----------|------|----------|
| `<execution_context>` | 执行上下文 | 计划执行**前** | 定义如何执行 | 工作流、模板、检查点模式 |
| `<context>` | 项目上下文 | 理解背景时 | 定义做什么 | PROJECT.md、ROADMAP.md、STATE.md |
| `<files_to_read>` | 必读文件列表 | 用 Read 工具 | 明确列出路径 | 具体文件路径列表 |
| `<read_first>` | 优先读取 | 任务执行**前** | 任务依赖 | 当前任务需要的参考文件 |
| `<required_reading>` | 必读内容 | 任何操作**前** | 强制指令 | 带语义说明的读取要求 |

---

## 五、双重约束机制

GSD 使用**双重约束**确保 AI 正确读取文件：

```xml
<!-- 1. 结构定义：用标签和 @ 符号定义引用 -->
<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<!-- 2. 指令约束：明确告诉 AI 去读取 -->
<required_reading>
在开始之前，阅读 execution_context 引用的所有文件
</required_reading>
```

**为什么需要双重约束？**

1. **结构定义**（标签 + `@`）→ 机器可解析，语义明确
2. **指令约束**（required_reading）→ 强化 AI 行为，防止遗漏

---

## 六、引用的语义约束

GSD 对引用有**严格的语义约束**，不是所有引用都是等价的：

### 6.1 必须引用 vs 按需引用

```markdown
# 必须引用（每个计划都需要）
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# 按需引用（仅当真正需要时）
# - 此计划使用先前的计划类型/导出
# - 先前计划做出的决策影响此计划
@.planning/phases/03-features/03-01-SUMMARY.md
```

### 6.2 反模式警告

```markdown
# 不要反射式链式引用：
# 计划 02 引用 01，计划 03 引用 02...
# 独立的计划不需要先前的 SUMMARY 引用
```

---

## 七、与 `<files_to_read>` 的区别

| 特性 | `@` 引用 | `<files_to_read>` |
|------|----------|-------------------|
| **语法** | 内联在标签内容中 | 独立标签包裹 |
| **语义** | 由父标签定义 | 明确"必读" |
| **典型用途** | 上下文引用 | 工具级读取指令 |

```xml
<!-- @ 引用方式 -->
<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<!-- files_to_read 方式 -->
<files_to_read>
Read these files at execution start using the Read tool:
- .planning/STATE.md
- .planning/ROADMAP.md
</files_to_read>
```

---

## 八、源码位置

| 文件 | 内容 |
|------|------|
| `get-shit-done/templates/phase-prompt.md` | PLAN.md 模板，展示完整的引用结构 |
| `get-shit-done/agents/gsd-planner.md` | Planner Agent 定义，包含引用规范 |
| `get-shit-done/workflows/execute-phase.md` | 执行工作流，展示如何使用 `execution_context` |

---

## 九、对 jacky-skills 的启示

### 可复用的设计模式

```markdown
<!-- SKILL.md 模板 -->

<execution_context>
@~/.claude/skills/{skill-name}/references/implementation-guide.md
</execution_context>

<context>
@./CLAUDE.md
@./docs/architecture.md
</context>

<process>
<step name="load_context">
  <files_to_read>
  - ./config/settings.json
  - ./src/types.ts
  </files_to_read>
</step>

<step name="execute">
  <read_first>src/config.ts, src/utils.ts</read_first>
  <action>实现具体功能</action>
</step>
</process>
```

### 关键原则

1. **层次分明**：`execution_context` > `context` > `read_first`
2. **语义清晰**：标签名称传达读取时机和目的
3. **双重约束**：结构定义 + 指令约束
4. **按需引用**：避免无意义的链式引用

---

*整理时间: 2026-03-15*
*来源: get-shit-done 框架分析*
