# GSD 执行模型分析

> 深入理解 GSD 的 Phase/Plan 执行机制与批量操作限制

## 核心问题

**Q: 能否一次性规划所有 Plan 然后一次性执行？**

**A: 不支持。GSD 采用 Phase 级别串行执行模型。**

---

## 执行模型概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GSD 执行流程（串行 Phase）                             │
└─────────────────────────────────────────────────────────────────────────────┘

Milestone v1.0
    │
    ├─▶ Phase 1: Foundation
    │     │
    │     ├─ /gsd:plan-phase 1      → 生成 01-01, 01-02, 01-03 PLAN.md
    │     │
    │     ├─ /gsd:execute-phase 1   → Wave 1: [01-01, 01-02] 并行
    │     │                         → Wave 2: [01-03] 执行
    │     │                         → Checkpoint 处理
    │     │                         → SUMMARY.md 生成
    │     │
    │     └─ /gsd:transition        → 更新 ROADMAP, STATE, PROJECT.md
    │                                 → 进入下一 Phase
    │
    ├─▶ Phase 2: Core Features
    │     │
    │     ├─ /gsd:plan-phase 2
    │     ├─ /gsd:execute-phase 2
    │     └─ /gsd:transition
    │
    └─▶ Phase 3: Polish
          │
          ├─ /gsd:plan-phase 3
          ├─ /gsd:execute-phase 3
          └─ /gsd:transition → Milestone 完成
```

---

## 为什么不支持跨 Phase 批量执行？

### 1. 依赖关系

```
Phase 1 的产物 = Phase 2 的输入

Phase 1: Foundation
  └─ 产出: 类型定义、数据结构、基础设施

Phase 2: Core Features
  └─ 依赖: Phase 1 的类型定义
  └─ 如果 Phase 1 没执行完，Phase 2 无法规划
```

**例子**：
- Phase 1 定义 `Style` 接口
- Phase 2 的 PLAN.md 需要引用这个接口
- 如果 Phase 1 没执行，接口不存在，Phase 2 无法正确规划

### 2. Context 限制

```
一次性规划所有 Phase:
  ├─ Phase 1 ROADMAP section
  ├─ Phase 2 ROADMAP section
  ├─ Phase 3 ROADMAP section
  ├─ 所有 REQUIREMENTS
  ├─ 完整 PROJECT.md
  └─ → 超出 LLM context 限制
```

**GSD 的解决方案**：每次只处理一个 Phase，保持 context 精简。

### 3. 迭代学习

```
Phase 1 执行过程中的发现 → 影响 Phase 2 的规划

执行 Phase 1 时:
  ├─ 发现: 某个 API 限制
  ├─ 决定: 改用不同方案
  └─ 影响: Phase 2 需要调整

如果提前规划 Phase 2 → 可能基于错误假设
```

### 4. Checkpoint 机制

```
每个 Phase 完成后:
  ├─ VERIFICATION.md 验证
  ├─ 用户确认 transition
  └─ PROJECT.md 更新（需求变化、决策记录）

如果批量执行 → 无法在 Phase 间插入人工确认
```

---

## Phase 内部的并行执行

虽然 Phase 间是串行的，但 **同一 Phase 内的 Plans 可以并行**。

### Wave-Based Parallelization

```
Phase 1: Foundation
  │
  ├─ Wave 1 (并行):
  │     ├─ 01-01: Setup project structure    (autonomous: true)
  │     └─ 01-02: Configure build system     (autonomous: true)
  │
  ├─ Checkpoint (等待用户确认)
  │
  └─ Wave 2:
        └─ 01-03: Build layout components    (autonomous: false)
```

### 并行控制

**配置文件**: `.planning/config.json`

```json
{
  "parallelization": true   // true = 同一 wave 内并行执行
}
```

**PLAN.md frontmatter**:

```yaml
---
wave: 1
autonomous: true    # true = 可并行，false = 需要 checkpoint
depends_on: []      # 依赖其他 plans
---
```

---

## 最接近"批量执行"的方式

### Auto-Advance Chain

```bash
# 1. 启用 auto-advance 配置
/gsd:settings
# → 设置 workflow.auto_advance = true

# 2. 使用 --auto 标志执行
/gsd:execute-phase 1 --auto

# 执行流程:
# Phase 1 执行完成
#   → 自动 transition
#   → 自动 plan-phase 2
#   → 自动 execute-phase 2
#   → ... (直到 milestone 完成或遇到 checkpoint)
```

### --no-transition 标志

```bash
# 在被 auto-advance chain 调用时，使用 --no-transition 防止无限循环
/gsd:execute-phase 1 --auto --no-transition
# → 执行完 Phase 1 后停止，返回完成状态
```

### Auto-Mode 的 Checkpoint 处理

| Checkpoint 类型 | Auto-Mode 行为 |
|----------------|---------------|
| `human-verify` | 自动批准 "approved" |
| `decision` | 自动选择第一个选项 |
| `human-action` | **仍然暂停**（auth gate 不能自动化） |

---

## 命令参考

### Phase 级别命令

| 命令 | 作用 |
|------|------|
| `/gsd:plan-phase <n>` | 为 Phase n 生成 PLAN.md |
| `/gsd:execute-phase <n>` | 执行 Phase n 的所有 plans |
| `/gsd:transition` | 完成 Phase，进入下一 Phase |

### 批量操作命令

| 命令 | 作用 |
|------|------|
| `/gsd:execute-phase <n> --auto` | 自动执行，遇 checkpoint 按规则处理 |
| `/gsd:execute-phase <n> --gaps-only` | 只执行 gap-closure plans |
| `/gsd:complete-milestone` | 完成整个 milestone |

### 辅助命令

| 命令 | 作用 |
|------|------|
| `/gsd:progress` | 查看项目进度 |
| `/gsd:settings` | 配置 auto-advance 等选项 |
| `/gsd:health` | 检查 .planning 目录健康状态 |

---

## 设计哲学

```
GSD 的核心理念：

┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 是最小的独立规划单元                                                   │
│                                                                             │
│  • 必须完成一个 Phase 才能进入下一个                                          │
│  • 确保依赖关系正确                                                          │
│  • 允许迭代学习影响后续规划                                                   │
│  • 在 Phase 边界插入人工确认                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 总结表

| 问题 | 答案 | 原因 |
|------|------|------|
| 一次性规划所有 Phase 的 PLAN.md？ | ❌ 不支持 | 依赖关系、Context 限制、迭代学习 |
| 一次性执行所有 Phase？ | ❌ 不支持 | Phase 间串行依赖 |
| 同一 Phase 内并行执行多个 Plans？ | ✅ 支持 | Wave-based parallelization |
| 减少手动操作？ | ✅ 部分支持 | `--auto` + auto-advance |
| 跳过 checkpoint 确认？ | ✅ 部分支持 | human-verify/decision 可自动，human-action 不能 |

---

## 相关文档

- [GSD Checkpoint 机制](./gsd-interruption-guide.md)
- [INIT 变量注入模式](./reusable-designs/init-variable-injection.md)
- [execute-phase workflow 分析](./gsd-init-execute-phase.md)

---

## 源码参考

| 文件 | 路径 |
|------|------|
| execute-phase workflow | `~/.claude/get-shit-done/workflows/execute-phase.md` |
| execute-plan workflow | `~/.claude/get-shit-done/workflows/execute-plan.md` |
| transition workflow | `~/.claude/get-shit-done/workflows/transition.md` |
| checkpoints 参考 | `~/.claude/get-shit-done/references/checkpoints.md` |
