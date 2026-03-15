# Codebase Map 完整逻辑

> GSD 如何通过一次映射，为后续规划和执行提供代码上下文。

## 相关源码路径

| 组件 | 相对路径 | 完整路径 |
|------|----------|----------|
| Command 入口 | `commands/gsd/map-codebase.md` | `/Users/jiashengwang/jacky-github/get-shit-done-study/get-shit-done/commands/gsd/map-codebase.md` |
| Workflow 实现 | `get-shit-done/workflows/map-codebase.md` | `/Users/jiashengwang/jacky-github/get-shit-done-study/get-shit-done/get-shit-done/workflows/map-codebase.md` |
| Mapper Agent | `agents/gsd-codebase-mapper.md` | `/Users/jiashengwang/jacky-github/get-shit-done-study/get-shit-done/agents/gsd-codebase-mapper.md` |
| Planner Agent (读取方) | `agents/gsd-planner.md` | `/Users/jiashengwang/jacky-github/get-shit-done-study/get-shit-done/agents/gsd-planner.md` |

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Codebase Map 数据流                               │
└─────────────────────────────────────────────────────────────────────────┘

                    /gsd:map-codebase (用户触发)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Workflow: map-codebase.md (编排器)                                      │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Agent 1     │  │  Agent 2     │  │  Agent 3     │  │  Agent 4     │ │
│  │  tech focus  │  │  arch focus  │  │ quality focus│  │concerns focus│ │
│  │              │  │              │  │              │  │              │ │
│  │ STACK.md     │  │ARCHITECTURE  │  │CONVENTIONS   │  │ CONCERNS.md  │ │
│  │ INTEGRATIONS │  │ STRUCTURE    │  │ TESTING      │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                 │                 │         │
│         └─────────────────┴─────────────────┴─────────────────┘         │
│                                    │                                     │
│                                    ▼                                     │
│                    .planning/codebase/ (7 个文档)                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   /gsd:plan-phase     /gsd:execute-phase   /gsd:discuss-phase
   (规划时读取)          (执行时遵循)          (讨论时参考)
```

---

## 二、生成的 7 个文档

| 文件 | 聚焦领域 | 内容 |
|------|----------|------|
| **STACK.md** | tech | 语言、运行时、框架、依赖、配置 |
| **INTEGRATIONS.md** | tech | 外部 API、数据库、认证、Webhook |
| **ARCHITECTURE.md** | arch | 架构模式、层级、数据流、抽象 |
| **STRUCTURE.md** | arch | 目录布局、命名规范、新代码放哪里 |
| **CONVENTIONS.md** | quality | 编码风格、命名、错误处理、日志 |
| **TESTING.md** | quality | 测试框架、结构、Mock、覆盖率 |
| **CONCERNS.md** | concerns | 技术债务、已知问题、安全风险、性能瓶颈 |

---

## 三、映射流程详解

### 3.1 触发入口

```yaml
# commands/gsd/map-codebase.md
---
name: gsd:map-codebase
description: Analyze codebase with parallel mapper agents
allowed-tools:
  - Bash
  - Task
  - Read
  - Glob
  - Grep
  - Write
---
```

### 3.2 Workflow 编排步骤

```markdown
<!-- workflows/map-codebase.md -->
<step name="check_existing">
  检查 .planning/codebase/ 是否已存在
  - 存在：询问用户是刷新/更新/跳过
  - 不存在：继续创建
</step>

<step name="create_structure">
  mkdir -p .planning/codebase
</step>

<step name="spawn_agents">
  并行启动 4 个 gsd-codebase-mapper agent
  - 每个 agent 有独立上下文
  - 每个 agent 直接写入文件（不返回内容给编排器）
</step>

<step name="collect_confirmations">
  等待所有 agent 完成
  只收集文件路径和行数（不读取内容）
</step>

<step name="scan_for_secrets">
  安全检查：扫描是否有泄露的密钥
</step>

<step name="commit_codebase_map">
  git commit 提交生成的文档
</step>
</step>
```

### 3.3 Mapper Agent 行为

```markdown
<!-- agents/gsd-codebase-mapper.md -->

<role>
探索代码库的特定聚焦领域，直接写入分析文档到 .planning/codebase/
</role>

<process>
<step name="explore_codebase">
  根据聚焦领域执行不同的探索命令：

  # tech focus
  - 查 package.json, requirements.txt 等依赖文件
  - 查 SDK/API imports

  # arch focus
  - 查目录结构
  - 查入口文件
  - 查 import 模式

  # quality focus
  - 查 lint/format 配置
  - 查测试文件

  # concerns focus
  - 查 TODO/FIXME 注释
  - 查大文件（复杂度指标）
</step>

<step name="write_documents">
  使用 Write 工具直接写入文件（不用 Bash heredoc）
  遵循模板结构
  必须包含文件路径（用反引号）
</step>

<step name="return_confirmation">
  只返回确认信息（~10行），不返回文档内容
</step>
</process>
```

---

## 四、读取逻辑（按阶段类型选择）

### 4.1 Planner Agent 的读取策略

```markdown
<!-- agents/gsd-planner.md -->
<step name="load_codebase_context">
Check for codebase map:

```bash
ls .planning/codebase/*.md 2>/dev/null
```

If exists, load relevant documents by phase type:

| Phase Keywords | Load These |
|----------------|------------|
| UI, frontend, components | CONVENTIONS.md, STRUCTURE.md |
| API, backend, endpoints | ARCHITECTURE.md, CONVENTIONS.md |
| database, schema, models | ARCHITECTURE.md, STACK.md |
| testing, tests | TESTING.md, CONVENTIONS.md |
| integration, external API | INTEGRATIONS.md, STACK.md |
| refactor, cleanup | CONCERNS.md, ARCHITECTURE.md |
| setup, config | STACK.md, STRUCTURE.md |
| (default) | STACK.md, ARCHITECTURE.md |
</step>
```

### 4.2 读取时机

| 命令 | 是否读取 | 读取的文件 |
|------|----------|-----------|
| `/gsd:new-project` | ✅ | ARCHITECTURE.md, STACK.md |
| `/gsd:discuss-phase` | ✅ | 根据阶段类型选择 |
| `/gsd:plan-phase` | ✅ | 根据阶段类型选择 |
| `/gsd:execute-phase` | ✅ | 所有相关文档 |
| `/gsd:help` | ❌ | - |
| `/gsd:update` | ❌ | - |
| `/gsd:progress` | ❌ | - |

---

## 五、设计亮点

### 5.1 上下文隔离

```
问题：主会话上下文有限，一次性分析整个代码库会耗尽 token

解决：
  - 4 个 mapper agent 各自有独立上下文
  - 每个 agent 只关注一个领域
  - agent 直接写入文件，不把内容返回给编排器
  - 编排器只收集"确认+行数"，几乎不占用上下文
```

### 5.2 按需加载

```
问题：7 个文档全部读取会浪费 token

解决：
  - 根据阶段类型只读取 2 个相关文档
  - UI 阶段 → CONVENTIONS + STRUCTURE
  - API 阶段 → ARCHITECTURE + CONVENTIONS
```

### 5.3 一次映射，多次使用

```
问题：每次规划都重新分析代码库效率低

解决：
  - 映射结果持久化到 .planning/codebase/
  - 后续所有阶段都复用这些文档
  - 代码变化后可以单独更新某个文档
```

### 5.4 可增量更新

```bash
# 只更新 STRUCTURE.md（目录结构变了）
/gsd:map-codebase
# 选择 "Update" → 选择 STRUCTURE.md
```

---

## 六、调用链路完整示例

```
用户: /gsd:plan-phase 1
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Command: plan-phase.md                                      │
│   - agent: gsd-planner                                      │
│   - execution_context: @workflows/plan-phase.md             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Workflow: plan-phase.md                                     │
│   - 解析参数                                                 │
│   - 验证阶段                                                 │
│   - 启动 gsd-planner agent                                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Agent: gsd-planner.md                                       │
│                                                              │
│ <step name="load_codebase_context">                         │
│   1. ls .planning/codebase/*.md  # 检查是否存在              │
│   2. 读取阶段类型（如 "UI, frontend"）                        │
│   3. 根据表格选择: CONVENTIONS.md, STRUCTURE.md              │
│   4. Read 工具读取这两个文件                                  │
│ </step>                                                      │
│                                                              │
│ <step name="identify_phase">                                │
│   读取 ROADMAP.md，确认阶段 1 的目标                          │
│ </step>                                                      │
│                                                              │
│ ... 后续规划步骤 ...                                          │
│                                                              │
│ 最终生成: .planning/phases/1/PLAN.md                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、对 jacky-skills 的启示

### 可复用的设计模式

1. **并行子代理 + 直接写入**
   - 大任务拆分为多个子任务
   - 每个子代理独立上下文
   - 结果直接写入文件，不回传编排器

2. **按需加载策略表**
   - 用表格定义"什么场景读什么文件"
   - 避免 token 浪费

3. **持久化映射结果**
   - 一次分析，多次使用
   - 支持增量更新

### 潜在应用

```
jacky-skills/
├── skills/
│   ├── analyze-repo/
│   │   ├── SKILL.md           # 入口
│   │   └── scripts/
│   │       └── mapper.sh      # 映射脚本
│   └── ...
└── .planning/
    └── codebase/              # 映射结果存储
        ├── STACK.md
        ├── ARCHITECTURE.md
        └── ...
```

---

## 八、注意事项

### 安全检查

Mapper Agent 有 `<forbidden_files>` 列表，禁止读取：
- `.env`, `.env.*` - 环境变量
- `credentials.*`, `secrets.*` - 凭证文件
- `*.pem`, `*.key` - 证书和私钥
- 等等

### 提交前扫描

Workflow 在提交前会扫描生成的文档：
```bash
grep -E '(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|...)' .planning/codebase/*.md
```

发现可疑密钥会暂停，等待用户确认。

---

*整理时间: 2026-03-15*
