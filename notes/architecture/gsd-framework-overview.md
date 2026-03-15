# GSD 框架完整架构梳理

> Get Shit Done 是一个为 Claude Code 设计的 AI 辅助开发框架，通过编排多个专业化 Agent 实现目标驱动的开发流程。

## 一、核心概念

| 概念 | 说明 |
|------|------|
| **Roadmap** | 项目路线图，包含 milestones 和 phases |
| **Milestone** | 里程碑，一个完整的功能集合（版本） |
| **Phase** | 开发阶段，milestone 的子任务单元 |
| **Agent** | 专业化子代理，执行特定类型任务 |
| **Workflow** | 编排逻辑，协调多个 Agent 协作 |
| **State** | 持久化状态，记录进度和决策 |

## 二、完整生命周期流程图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GSD 完整生命周期                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐                                                               │
│  │ /gsd:new-    │                                                               │
│  │   project    │──────────────────────────────────────┐                        │
│  └──────────────┘                                      │                        │
│        │                                               │                        │
│        ▼                                               │                        │
│  ┌──────────────┐     ┌──────────────┐                │                        │
│  │  Questioning │────▶│   PROJECT.md │                │                        │
│  │  (深挖需求)   │     │   创建项目    │                │                        │
│  └──────────────┘     └──────────────┘                │                        │
│        │                     │                        │                        │
│        ▼                     ▼                        │                        │
│  ┌──────────────┐     ┌──────────────┐                │                        │
│  │   Research   │────▶│ REQUIREMENTS │                │                        │
│  │  (领域研究)   │     │   需求定义    │                │                        │
│  └──────────────┘     └──────────────┘                │                        │
│        │                     │                        │                        │
│        ▼                     ▼                        │                        │
│  ┌──────────────┐     ┌──────────────┐                │                        │
│  │  4个并行      │────▶│   ROADMAP.md │                │                        │
│  │  Researcher  │     │   路线图      │                │                        │
│  └──────────────┘     └──────────────┘                │                        │
│                              │                        │                        │
│  ────────────────────────────┼────────────────────────┘                        │
│                              │                                                 │
│  ══════════════════════════════════════════════════════════════════════════    │
│                    Milestone 循环 (每个版本)                                     │
│  ══════════════════════════════════════════════════════════════════════════    │
│                              │                                                 │
│        ┌─────────────────────┴─────────────────────┐                           │
│        ▼                                           ▼                           │
│  ┌──────────────┐                          ┌──────────────┐                     │
│  │ /gsd:discuss │                          │ /gsd:plan-   │                     │
│  │   -phase     │─────────────────────────▶│   phase      │                     │
│  │  (收集上下文) │                          │  (生成计划)   │                     │
│  └──────────────┘                          └──────────────┘                     │
│        │                                           │                           │
│        ▼                                           ▼                           │
│  ┌──────────────┐                          ┌──────────────┐                     │
│  │  CONTEXT.md  │                          │   PLAN.md    │                     │
│  │  (用户决策)   │                          │   (执行计划)  │                     │
│  └──────────────┘                          └──────────────┘                     │
│                                                   │                           │
│                                                   ▼                           │
│                                           ┌──────────────┐                     │
│                                           │ /gsd:execute │                     │
│                                           │   -phase     │                     │
│                                           │  (执行计划)   │                     │
│                                           └──────────────┘                     │
│                                                   │                           │
│                                    ┌──────────────┼──────────────┐             │
│                                    ▼              ▼              ▼             │
│                              ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│                              │  Wave 1  │  │  Wave 2  │  │  Wave N  │          │
│                              │ (并行)    │  │ (并行)    │  │ (并行)    │          │
│                              └──────────┘  └──────────┘  └──────────┘          │
│                                    │              │              │             │
│                                    └──────────────┼──────────────┘             │
│                                                   ▼                           │
│                                           ┌──────────────┐                     │
│                                           │  Verifier    │                     │
│                                           │  (验证目标)   │                     │
│                                           └──────────────┘                     │
│                                                   │                           │
│                                        ┌──────────┴──────────┐                │
│                                        ▼                     ▼                │
│                                  ┌──────────┐         ┌──────────┐            │
│                                  │  Passed  │         │   Gaps   │            │
│                                  │  通过    │         │  发现差距  │            │
│                                  └──────────┘         └──────────┘            │
│                                        │                     │                │
│                                        ▼                     ▼                │
│                                  ┌──────────┐         ┌──────────┐            │
│                                  │ 下一阶段  │         │ Gap修复   │            │
│                                  └──────────┘         └──────────┘            │
│                                                                                 │
│  ══════════════════════════════════════════════════════════════════════════    │
│                              里程碑完成                                          │
│  ══════════════════════════════════════════════════════════════════════════    │
│                                                                                 │
│                              ┌──────────────┐                                   │
│                              │ /gsd:complete│                                   │
│                              │  -milestone  │                                   │
│                              └──────────────┘                                   │
│                                    │                                            │
│                                    ▼                                            │
│                              ┌──────────────┐                                   │
│                              │   归档       │                                   │
│                              │ /gsd:new-    │                                   │
│                              │   milestone  │                                   │
│                              └──────────────┘                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 三、组件清单

### 1. Commands（斜杠命令入口）

| 命令 | 用途 | 调用的 Workflow |
|------|------|----------------|
| `/gsd:new-project` | 初始化新项目 | `new-project.md` |
| `/gsd:new-milestone` | 开始新里程碑 | `new-milestone.md` |
| `/gsd:progress` | 查看进度+智能路由 | `progress.md` |
| `/gsd:discuss-phase` | 收集阶段上下文 | `discuss-phase.md` |
| `/gsd:plan-phase` | 生成执行计划 | `plan-phase.md` |
| `/gsd:execute-phase` | 执行阶段计划 | `execute-phase.md` |
| `/gsd:verify-work` | 验证工作成果 | `verify-work.md` |
| `/gsd:complete-milestone` | 完成里程碑 | `complete-milestone.md` |
| `/gsd:debug` | 系统化调试 | `debug.md` |
| `/gsd:map-codebase` | 映射代码库 | `map-codebase.md` |
| `/gsd:settings` | 配置工作流 | `settings.md` |
| `/gsd:quick` | 快速任务 | `quick.md` |

### 2. Workflows（编排逻辑）

| Workflow | 职责 |
|----------|------|
| `new-project.md` | 项目初始化编排（Questioning → Research → Requirements → Roadmap） |
| `new-milestone.md` | 里程碑初始化编排 |
| `progress.md` | 进度查看 + 智能路由到下一步 |
| `discuss-phase.md` | 阶段上下文收集（生成 CONTEXT.md） |
| `plan-phase.md` | 计划生成编排（Research → Planner → Checker 循环） |
| `execute-phase.md` | 执行编排（Wave 分组、并行调度、Checkpoint 处理） |
| `execute-plan.md` | 单个计划执行逻辑 |
| `verify-work.md` | 验证工作流 |
| `complete-milestone.md` | 里程碑完成流程 |
| `transition.md` | 阶段间转换 |

### 3. Agents（专业化子代理）

| Agent | 职责 | 被 Workflow 调用 |
|-------|------|------------------|
| `gsd-project-researcher` | 领域研究（Stack/Features/Architecture/Pitfalls） | `new-project.md` (4个并行) |
| `gsd-research-synthesizer` | 研究结果合成（生成 SUMMARY.md） | `new-project.md` |
| `gsd-roadmapper` | 路线图生成（生成 ROADMAP.md） | `new-project.md` |
| `gsd-codebase-mapper` | 代码库结构映射 | `map-codebase.md` |
| `gsd-phase-researcher` | 阶段技术研究 | `plan-phase.md` |
| `gsd-planner` | 计划生成（生成 PLAN.md） | `plan-phase.md` |
| `gsd-plan-checker` | 计划验证（检查 PLAN.md 质量） | `plan-phase.md` |
| `gsd-executor` | 计划执行（原子提交） | `execute-phase.md` |
| `gsd-verifier` | 目标验证（验证 Phase Goal） | `execute-phase.md` |
| `gsd-debugger` | 系统化调试 | `debug.md` |
| `gsd-nyquist-auditor` | Nyquist 验证审计 | `validate-phase.md` |
| `gsd-integration-checker` | 集成检查 | `execute-phase.md` |

## 四、关键设计模式

### 1. 编排器模式（Orchestrator Pattern）

```
┌─────────────────┐
│   Orchestrator  │  ← 轻量级，只做协调，~10-15% context
│   (Workflow)    │
└────────┬────────┘
         │ Task() tool
    ┌────┴────┬─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│Agent 1│ │Agent 2│ │Agent 3│  ← 每个 Agent 独立 200k context
└───────┘ └───────┘ └───────┘
```

**核心原则**：
- Orchestrator 只传递路径，不读取文件内容
- 每个 Agent 有独立的上下文窗口
- 避免上下文膨胀

### 2. Wave 并行执行

```
Phase 有 6 个 Plans:
  Wave 1: Plan-01, Plan-02 (无依赖，可并行)
  Wave 2: Plan-03 (依赖 Wave 1)
  Wave 3: Plan-04, Plan-05, Plan-06 (依赖 Wave 2)
```

### 3. 修订循环（Revision Loop）

```
Planner → Checker → [ISSUES FOUND]
                ↓
           Planner (revision) → Checker
                ↓ (最多3次迭代)
           [VERIFICATION PASSED] 或 [用户决定]
```

### 4. Gap 闭环（Gap Closure）

```
Verifier 发现差距
    ↓
/gsd:plan-phase X --gaps (生成修复计划)
    ↓
/gsd:execute-phase X --gaps-only (只执行 gap 计划)
    ↓
Verifier 重新验证
```

## 五、状态文件结构

```
.planning/
├── PROJECT.md          # 项目愿景、约束
├── REQUIREMENTS.md     # 需求列表 (v1/v2/out-of-scope)
├── ROADMAP.md          # 路线图（Phase 定义、依赖关系）
├── STATE.md            # 当前位置、决策、阻塞项
├── config.json         # 工作流配置（mode/granularity/parallelization）
├── research/           # 领域研究
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── PITFALLS.md
│   └── SUMMARY.md
└── phases/
    └── 01-phase-slug/
        ├── 01-CONTEXT.md      # 用户决策
        ├── 01-RESEARCH.md     # 技术研究
        ├── 01-VALIDATION.md   # 验证策略
        ├── 01-01-PLAN.md      # 执行计划
        ├── 01-01-SUMMARY.md   # 执行结果
        ├── 01-02-PLAN.md
        ├── 01-02-SUMMARY.md
        └── 01-VERIFICATION.md # 目标验证结果
```

## 六、ROADMAP 文件结构

ROADMAP.md 中定义了多个 Phase，每个 Phase 有以下属性：

| 属性 | 说明 |
|------|------|
| `phase` | 阶段编号 |
| `name` | 阶段名称 |
| `goal` | 阶段目标 |
| `requirements` | 关联的需求 ID |
| `success_criteria` | 成功标准 |
| `status` | 状态（planned/complete） |

**Phase 目录命名规范**：`{编号}-{slug}`，如 `01-authentication`

## 七、配置系统

### config.json 结构

```json
{
  "mode": "yolo|interactive",
  "granularity": "coarse|standard|fine",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false,
    "nyquist_validation": true|false,
    "auto_advance": true|false
  }
}
```

### 配置项说明

| 配置 | 说明 |
|------|------|
| `mode` | YOLO（自动批准）或 Interactive（每步确认） |
| `granularity` | Phase 粒度（coarse=3-5个, standard=5-8个, fine=8-12个） |
| `parallelization` | 是否并行执行独立计划 |
| `commit_docs` | 是否将 .planning/ 提交到 git |
| `model_profile` | 模型选择策略 |
| `workflow.research` | 是否在计划前做技术研究 |
| `workflow.plan_check` | 是否验证计划质量 |
| `workflow.verifier` | 是否在执行后验证目标 |

## 八、与 jacky-skills 的对比

| 维度 | GSD | jacky-skills |
|------|-----|--------------|
| **定位** | 完整项目管理框架 | 单点技能复用 |
| **粒度** | 项目级 → 里程碑 → 阶段 | 任务级 skill |
| **状态管理** | STATE.md + ROADMAP.md 持久化 | 无持久化 |
| **Agent 编排** | Workflow 编排多个 Agent | 单个 skill 执行 |
| **交互模式** | YOLO/Interactive 两种 | 按需交互 |
| **可借鉴** | Agent 编排、Wave 并行、修订循环 | 轻量、灵活 |

---

**参考资源**：
- [GitHub 仓库](https://github.com/discreteprojects/get-shit-done)
- 本地路径：`get-shit-done/`
