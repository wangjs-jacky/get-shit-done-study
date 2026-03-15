# Command 与 Workflow 分层设计深度分析

> 为什么 Command 有 `<process>` 还要单独抽 Workflow？

## 相关源码路径

| 组件 | 路径 |
|------|------|
| Command 入口 | `commands/gsd/map-codebase.md` |
| Workflow 实现 | `get-shit-done/workflows/map-codebase.md` |

---

## 一、核心发现：两者 `<process>` 的区别

### Command 的 process（7 行概述）

```xml
<process>
1. Check if .planning/codebase/ already exists (offer to refresh or skip)
2. Create .planning/codebase/ directory structure
3. Spawn 4 parallel gsd-codebase-mapper agents:
   - Agent 1: tech focus → writes STACK.md, INTEGRATIONS.md
   - Agent 2: arch focus → writes ARCHITECTURE.md, STRUCTURE.md
   - Agent 3: quality focus → writes CONVENTIONS.md, TESTING.md
   - Agent 4: concerns focus → writes CONCERNS.md
4. Wait for agents to complete, collect confirmations (NOT document contents)
5. Verify all 7 documents exist with line counts
6. Commit codebase map
7. Offer next steps (typically: /gsd:new-project or /gsd:plan-phase)
</process>
```

### Workflow 的 process（317 行详细实现）

```xml
<process>

<step name="init_context" priority="first">
Load codebase mapping context:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init map-codebase)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract from init JSON: `mapper_model`, `commit_docs`, `codebase_dir`, `existing_maps`, `has_maps`, `codebase_dir_exists`.
</step>

<step name="check_existing">
Check if .planning/codebase/ already exists using `has_maps` from init context.

If `codebase_dir_exists` is true:
```bash
ls -la .planning/codebase/
```

**If exists:**
```
.planning/codebase/ already exists with these documents:
[List files found]

What's next?
1. Refresh - Delete existing and remap codebase
2. Update - Keep existing, only update specific documents
3. Skip - Use existing codebase map as-is
```
...
</step>

<!-- 还有更多 step... -->
</process>
```

---

## 二、分层设计解析

### 层级职责

```
┌─────────────────────────────────────────────────────────────────┐
│  Command 层（接口层）                                             │
│                                                                  │
│  职责：声明 + 概述                                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ frontmatter:                                                │ │
│  │   - name: 命令名称                                           │ │
│  │   - description: 触发条件                                    │ │
│  │   - allowed-tools: 工具权限（最小权限原则）                    │ │
│  │   - argument-hint: 参数提示                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ <objective>: 一句话目标                                       │ │
│  │ <execution_context>: @ 引用 workflow 文件                    │ │
│  │ <context>: 简短上下文                                         │ │
│  │ <when_to_use>: 使用场景                                       │ │
│  │ <process>: 7 行简化流程概述（给 AI 看大图）                    │ │
│  │ <success_criteria>: checklist 验证                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  大小：~70 行                                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ @ 引用
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Workflow 层（实现层）                                            │
│                                                                  │
│  职责：详细步骤 + 具体命令 + 条件逻辑                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ <purpose>: 详细目的说明                                       │ │
│  │ <philosophy>: 核心理念（指导 AI 思维）                         │ │
│  │ <process>:                                                   │ │
│  │   <step name="...">                                         │ │
│  │     具体的 bash 命令                                         │ │
│  │     条件分支 <if>                                            │ │
│  │     Agent 启动 prompt                                        │ │
│  │     输出格式定义                                              │ │
│  │   </step>                                                   │ │
│  │   ...更多 step                                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  大小：~300+ 行                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 对比表

| 维度 | Command | Workflow |
|------|---------|----------|
| **行数** | ~70 行 | ~300+ 行 |
| **process 内容** | 7 行概述 | 详细 step 定义 |
| **bash 命令** | ❌ 无 | ✅ 有完整命令 |
| **条件逻辑** | ❌ 无 | ✅ 有 `<if>` 分支 |
| **Agent prompt** | ❌ 无 | ✅ 有详细 prompt |
| **philosophy** | ❌ 无 | ✅ 有核心理念 |
| **修改频率** | 低（接口稳定） | 高（实现迭代） |

---

## 三、为什么要分层？

### 3.1 关注点分离

```
Command = "做什么" + "用什么工具"
Workflow = "怎么做" + "每一步细节"
```

### 3.2 修改隔离

| 场景 | 只改 Workflow | 只改 Command | 两者都改 |
|------|--------------|--------------|----------|
| 修改 bash 命令 | ✅ | - | - |
| 修改步骤顺序 | ✅ | - | - |
| 添加新的 allowed-tools | - | ✅ | - |
| 修改 description 触发词 | - | ✅ | - |
| 添加新功能 | - | - | ✅ |

### 3.3 复用性

一个 Workflow 可以被多个 Command 引用：

```
commands/
├── gsd/
│   ├── plan-phase.md      → @workflows/plan-phase.md
│   ├── plan-phase-auto.md → @workflows/plan-phase.md (同样的 workflow)
│   └── ...
```

### 3.4 上下文控制

```
Command 先加载（小）→ 决定是否需要加载 Workflow（大）

如果用户只是问 "/gsd:help"，不需要加载所有 Workflow
```

---

## 四、为什么 Command 也有 `<process>`？

### 不是重复，是不同粒度

| Command 的 process | Workflow 的 process |
|-------------------|---------------------|
| 给 AI 看"大图" | 给 AI 看"每一步" |
| 7 行概述 | 300 行详细 |
| 理解流程 | 执行流程 |
| 快速浏览 | 深度执行 |

### 类比

```
Command 的 process = 目录/大纲
Workflow 的 process = 正文/内容
```

### 实际效果

1. AI 先读 Command（70 行）
2. 理解整体流程（7 行概述）
3. 然后通过 `@` 引用加载 Workflow（300 行）
4. 按详细 step 执行

---

## 五、如果合并会怎样？

### 假设：直接在 Command 里写完整实现

```xml
<!-- 假设的合并版本 -->
---
name: gsd:map-codebase
description: ...
allowed-tools: ...
---

<process>
<step name="init_context" priority="first">
```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init map-codebase)
...
```
<!-- 300+ 行详细步骤 -->
</process>
```

### 问题

| 问题 | 说明 |
|------|------|
| **文件膨胀** | 每个 Command 都 300+ 行 |
| **修改风险** | 改一个小 bash 命令也要动 Command |
| **无法复用** | 每个 Command 都要重复写相同逻辑 |
| **权限混乱** | allowed-tools 和实现细节混在一起 |

---

## 六、对 jacky-skills 的启示

### 方案 A：简单 Skill（不需要分层）

```
skills/bilibili-to-obsidian/
└── SKILL.md    # 单文件，直接包含 process
```

适用于：
- 逻辑简单（< 50 行）
- 不需要复用
- 很少修改

### 方案 B：复杂 Skill（分层设计）

```
skills/gsd-map-codebase/
├── SKILL.md           # 接口层：name, description, process 概述
└── workflows/
    └── map-codebase.md  # 实现层：详细 step
```

适用于：
- 逻辑复杂（> 100 行）
- 需要复用
- 频繁迭代

### 推荐做法

**先用单文件，复杂了再拆分**：

```
1. 初始版本：单个 SKILL.md
2. 如果 process > 100 行 → 拆分 workflow
3. 如果多个 skill 共享逻辑 → 抽取共享 workflow
```

---

## 七、总结

| 问题 | 答案 |
|------|------|
| Command 和 Workflow 都有 process，重复吗？ | 不重复，粒度不同 |
| 为什么不直接在 Command 里写完整实现？ | 关注点分离、修改隔离、复用性 |
| Command 的 process 有什么用？ | 给 AI 看"大图"，理解流程 |
| Workflow 的 process 有什么用？ | 给 AI 执行"每一步"，详细命令 |
| 什么时候需要分层？ | 逻辑复杂（> 100 行）或需要复用时 |

---

*整理时间: 2026-03-15*
