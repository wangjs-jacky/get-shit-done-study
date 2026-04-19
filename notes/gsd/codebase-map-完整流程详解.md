---
article_id: OBA-kfx1u7h0
tags: [open-source, get-shit-done, gsd, ai-agent, ai, claude]
type: learning
updated_at: 2026-03-17
---

# Codebase Map 完整流程详解

> 从用户输入 `/gsd:map-codebase` 到生成 7 个文档的完整流程

## 相关源码路径

| 组件 | 路径 |
|------|------|
| Command 入口 | `commands/gsd/map-codebase.md` |
| Workflow 编排 | `get-shit-done/workflows/map-codebase.md` |
| Mapper Agent | `agents/gsd-codebase-mapper.md` |

---

## 一、完整流程图

```
用户输入: /gsd:map-codebase
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Command 加载（72 行）                                                │
│                                                                              │
│ 1. 读取 frontmatter                                                          │
│    ├── name: gsd:map-codebase                                               │
│    ├── description: "Analyze codebase..."                                   │
│    ├── allowed-tools: [Read, Bash, Glob, Grep, Write, Task]                 │
│    └── argument-hint: "[optional: specific area]"                           │
│                                                                              │
│ 2. 读取 <objective>                                                          │
│    "Analyze codebase using parallel agents, produce 7 documents"            │
│                                                                              │
│ 3. 读取 <execution_context>                                                  │
│    @~/.claude/get-shit-done/workflows/map-codebase.md                       │
│                                                                              │
│ 4. 读取 <when_to_use>                                                        │
│    什么时候用 / 什么时候不用                                                   │
│                                                                              │
│ 5. 读取 <process>（7 行概述）                                                 │
│    给 AI 看大图，理解整体流程                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
              │
              │ @ 引用加载 Workflow
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Workflow 编排（317 行）                                              │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 1: init_context                                                    │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   node gsd-tools.cjs init map-codebase                                  │ │
│ │                                                                         │ │
│ │ 提取配置:                                                                │ │
│ │   mapper_model = "haiku" 或 "sonnet"                                    │ │
│ │   commit_docs = true/false                                              │ │
│ │   has_maps = true/false                                                 │ │
│ │   codebase_dir_exists = true/false                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 2: check_existing                                                  │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   ls -la .planning/codebase/                                            │ │
│ │                                                                         │ │
│ │ 条件分支:                                                                │ │
│ │   if (已存在) → 询问用户 Refresh/Update/Skip                            │ │
│ │   if (不存在) → 继续 create_structure                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 3: create_structure                                                │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   mkdir -p .planning/codebase                                           │ │
│ │                                                                         │ │
│ │ 期望输出文件:                                                            │ │
│ │   STACK.md, INTEGRATIONS.md, ARCHITECTURE.md, STRUCTURE.md,             │ │
│ │   CONVENTIONS.md, TESTING.md, CONCERNS.md                               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 4: spawn_agents ⭐ 核心步骤                                         │ │
│ │                                                                         │ │
│ │ 并行启动 4 个 gsd-codebase-mapper agent                                  │ │
│ │ 每个 agent 有独立的上下文（token 隔离）                                   │ │
│ │ 每个 agent 直接写入文件（不返回内容给编排器）                              │ │
│ │                                                                         │ │
│ │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ │ │ Agent 1          │ │ Agent 2          │ │ Agent 3          │ │ Agent 4          │
│ │ │ focus: tech      │ │ focus: arch      │ │ focus: quality   │ │ focus: concerns  │
│ │ │                  │ │                  │ │                  │ │                  │
│ │ │ 输出:            │ │ 输出:            │ │ 输出:            │ │ 输出:            │
│ │ │ STACK.md         │ │ ARCHITECTURE.md  │ │ CONVENTIONS.md   │ │ CONCERNS.md      │
│ │ │ INTEGRATIONS.md  │ │ STRUCTURE.md     │ │ TESTING.md       │ │                  │
│ │ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
│ │         │                    │                    │                    │         │
│ │         └────────────────────┴────────────────────┴────────────────────┘         │
│ │                                    │                                             │
│ │                            并行执行，各自独立                                     │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 5: collect_confirmations                                           │ │
│ │                                                                         │ │
│ │ 等待所有 agent 完成                                                      │ │
│ │ 读取每个 agent 的输出文件（只读确认，不读文档内容）                          │ │
│ │                                                                         │ │
│ │ 收集格式:                                                                │ │
│ │   "STACK.md (150 lines)"                                                │ │
│ │   "ARCHITECTURE.md (200 lines)"                                         │ │
│ │   ...                                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 6: verify_output                                                   │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   ls -la .planning/codebase/                                            │ │
│ │   wc -l .planning/codebase/*.md                                         │ │
│ │                                                                         │ │
│ │ 验证:                                                                    │ │
│ │   - 7 个文档都存在                                                       │ │
│ │   - 每个文档 > 20 行                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 7: scan_for_secrets ⭐ 安全检查                                     │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   grep -E '(sk-|ghp_|AKIA|...)' .planning/codebase/*.md                 │ │
│ │                                                                         │ │
│ │ 条件分支:                                                                │ │
│ │   if (发现密钥) → 暂停，等待用户确认                                      │ │
│ │   if (未发现)   → 继续 commit                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 8: commit_codebase_map                                             │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   node gsd-tools.cjs commit "docs: map existing codebase"               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Step 9: offer_next                                                      │ │
│ │                                                                         │ │
│ │ 执行命令:                                                                │ │
│ │   wc -l .planning/codebase/*.md                                         │ │
│ │                                                                         │ │
│ │ 输出完成摘要:                                                            │ │
│ │   "Created .planning/codebase/:"                                        │ │
│ │   "- STACK.md (150 lines)"                                              │ │
│ │   "- ARCHITECTURE.md (200 lines)"                                       │ │
│ │   ...                                                                   │ │
│ │                                                                         │ │
│ │ 提示下一步:                                                              │ │
│ │   /gsd:new-project                                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、为什么要 4 个 Agents？

### 问题：为什么不直接一个 Agent 分析所有内容？

| 问题 | 说明 |
|------|------|
| **Token 限制** | 一个 agent 要分析技术栈、架构、规范、问题，上下文会爆炸 |
| **信息污染** | 分析技术栈的上下文会影响分析架构的判断 |
| **速度慢** | 串行分析 4 个领域，一个做完才能做下一个 |
| **无法并行** | 单 agent 只能串行执行 |

### 解决方案：4 个独立 Agent

```
┌─────────────────────────────────────────────────────────────────┐
│  问题：分析整个代码库需要大量 token                               │
│                                                                  │
│  解决：拆分为 4 个领域，每个 agent 有独立上下文                    │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  │ Agent 1     │  │ Agent 2     │  │ Agent 3     │  │ Agent 4     │
│  │ 独立上下文   │  │ 独立上下文   │  │ 独立上下文   │  │ 独立上下文   │
│  │ 只看技术栈   │  │ 只看架构     │  │ 只看规范     │  │ 只看问题     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
│        │                │                │                │       │
│        └────────────────┴────────────────┴────────────────┘       │
│                              │                                    │
│                      并行执行，互不干扰                             │
└─────────────────────────────────────────────────────────────────┘
```

### 关键设计：Agent 直接写入文件

```
❌ 错误做法（返回内容给编排器）：
   Agent → 返回文档内容 → 编排器（上下文爆炸）

✅ 正确做法（直接写入文件）：
   Agent → Write 工具直接写文件 → 只返回确认信息
   编排器只收到："STACK.md (150 lines)"
```

---

## 三、每个 Agent 具体做什么？

### Agent 1: Tech Focus（技术栈分析）

```
┌─────────────────────────────────────────────────────────────────┐
│  输入: focus = "tech"                                           │
│  输出: STACK.md, INTEGRATIONS.md                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  探索步骤:                                                        │
│                                                                  │
│  1. 查找包管理文件                                                │
│     ls package.json requirements.txt Cargo.toml go.mod          │
│     cat package.json | head -100                                │
│                                                                  │
│  2. 查找配置文件                                                  │
│     ls *.config.* tsconfig.json .nvmrc                          │
│     ls .env* (只记录存在，不读取内容)                             │
│                                                                  │
│  3. 查找 SDK/API 导入                                            │
│     grep -r "import.*stripe|import.*aws|import.*@" src/         │
│                                                                  │
│  4. 读取关键文件，提取版本信息                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 STACK.md 内容:                                              │
│                                                                  │
│  - Languages: TypeScript 5.0, Python 3.11                       │
│  - Runtime: Node.js 20.x                                        │
│  - Package Manager: pnpm 8.x                                    │
│  - Frameworks: React 18, Next.js 14, Tailwind 3                 │
│  - Key Dependencies: lodash, zod, react-query                   │
│  - Configuration: tsconfig.json, tailwind.config.js             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 INTEGRATIONS.md 内容:                                       │
│                                                                  │
│  - APIs: Stripe (支付), SendGrid (邮件)                          │
│  - Databases: PostgreSQL (Supabase)                             │
│  - Auth: Clerk                                                   │
│  - Monitoring: Sentry                                            │
│  - CI/CD: GitHub Actions                                         │
│  - Required env vars: STRIPE_KEY, DATABASE_URL, ...             │
└─────────────────────────────────────────────────────────────────┘
```

### Agent 2: Architecture Focus（架构分析）

```
┌─────────────────────────────────────────────────────────────────┐
│  输入: focus = "arch"                                           │
│  输出: ARCHITECTURE.md, STRUCTURE.md                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  探索步骤:                                                        │
│                                                                  │
│  1. 查找目录结构                                                  │
│     find . -type d -not -path '*/node_modules/*' | head -50     │
│                                                                  │
│  2. 查找入口文件                                                  │
│     ls src/index.* src/main.* src/app.* app/page.*              │
│                                                                  │
│  3. 分析 import 模式，理解层级关系                                │
│     grep -r "^import" src/ --include="*.ts" | head -100         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 ARCHITECTURE.md 内容:                                       │
│                                                                  │
│  - Pattern: Layered Architecture (Presentation → Service → Data)│
│  - Layers:                                                       │
│    • Presentation: src/components/, src/pages/                  │
│    • Business: src/services/, src/hooks/                        │
│    • Data: src/lib/db/, src/types/                              │
│  - Data Flow: User Action → Hook → Service → API → DB           │
│  - Entry Points: app/page.tsx, src/app/layout.tsx               │
│  - Error Handling: try-catch + toast notifications              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 STRUCTURE.md 内容:                                          │
│                                                                  │
│  Directory Layout:                                               │
│  src/                                                            │
│  ├── components/   # React 组件                                  │
│  ├── hooks/        # Custom hooks                                │
│  ├── services/     # API 调用                                    │
│  ├── lib/          # 工具函数                                    │
│  └── types/        # TypeScript 类型                             │
│                                                                  │
│  Where to Add New Code:                                          │
│  - New Feature: src/components/FeatureName/                     │
│  - New API: src/services/api/featureName.ts                     │
│  - New Hook: src/hooks/useFeatureName.ts                        │
└─────────────────────────────────────────────────────────────────┘
```

### Agent 3: Quality Focus（质量规范分析）

```
┌─────────────────────────────────────────────────────────────────┐
│  输入: focus = "quality"                                        │
│  输出: CONVENTIONS.md, TESTING.md                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  探索步骤:                                                        │
│                                                                  │
│  1. 查找 lint/format 配置                                        │
│     ls .eslintrc* .prettierrc* eslint.config.* biome.json       │
│     cat .prettierrc                                              │
│                                                                  │
│  2. 查找测试文件和配置                                            │
│     ls jest.config.* vitest.config.*                            │
│     find . -name "*.test.*" -o -name "*.spec.*" | head -30      │
│                                                                  │
│  3. 抽样读取源文件，分析编码规范                                   │
│     ls src/**/*.ts | head -10                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 CONVENTIONS.md 内容:                                        │
│                                                                  │
│  - Naming: camelCase for functions, PascalCase for components   │
│  - Formatting: Prettier (2 spaces, single quotes)               │
│  - Linting: ESLint + @typescript-eslint                         │
│  - Imports: External → Internal → Relative                      │
│  - Error Handling: Result<T, E> pattern                         │
│  - Comments: JSDoc for public APIs only                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 TESTING.md 内容:                                            │
│                                                                  │
│  - Framework: Vitest                                             │
│  - Test Location: Co-located (*.test.ts)                        │
│  - Run Commands:                                                 │
│    • pnpm test          # Run all tests                         │
│    • pnpm test:watch    # Watch mode                            │
│    • pnpm test:coverage # Coverage report                       │
│  - Mocking: vi.fn() + vi.mock()                                 │
│  - Patterns:                                                     │
│    describe('Feature', () => { it('should...', () => {...}) })  │
└─────────────────────────────────────────────────────────────────┘
```

### Agent 4: Concerns Focus（问题分析）

```
┌─────────────────────────────────────────────────────────────────┐
│  输入: focus = "concerns"                                       │
│  输出: CONCERNS.md                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  探索步骤:                                                        │
│                                                                  │
│  1. 查找 TODO/FIXME 注释                                         │
│     grep -rn "TODO|FIXME|HACK|XXX" src/ | head -50              │
│                                                                  │
│  2. 查找大文件（潜在复杂度）                                       │
│     find src/ -name "*.ts" | xargs wc -l | sort -rn | head -20  │
│                                                                  │
│  3. 查找空返回/桩代码                                             │
│     grep -rn "return null|return []|return {}" src/             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  输出 CONCERNS.md 内容:                                           │
│                                                                  │
│  Tech Debt:                                                      │
│  - src/services/api.ts (500 lines) - 太大，需要拆分              │
│  - src/utils/helpers.ts - 混合了不相关的工具函数                  │
│                                                                  │
│  Known Bugs:                                                     │
│  - TODO: Fix race condition in useWebSocket hook                │
│                                                                  │
│  Security:                                                       │
│  - No rate limiting on API routes                               │
│  - JWT secret hardcoded in development                          │
│                                                                  │
│  Performance:                                                    │
│  - No caching for repeated API calls                            │
│  - Large bundle size (500KB gzipped)                            │
│                                                                  │
│  Test Coverage Gaps:                                             │
│  - src/services/ - Only 40% coverage                            │
│  - No E2E tests                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、为什么不能只用 1 个 Agent？

### 对比

| 方案 | Token 消耗 | 速度 | 信息污染 |
|------|-----------|------|----------|
| 1 个 Agent 做所有 | 爆炸（所有上下文混在一起） | 慢（串行） | 严重 |
| 4 个 Agent 并行 | 可控（每个独立上下文） | 快（并行） | 无 |

### 具体问题

```
❌ 1 个 Agent 做所有:

Step 1: 分析技术栈 (读了 package.json, 100 个依赖)
Step 2: 分析架构 (读了 50 个文件，理解了目录结构)
Step 3: 分析规范 (读了 20 个测试文件)
Step 4: 分析问题 (读了 TODO 注释)

问题：
- Step 4 时，Step 1-3 的内容还在上下文里
- 上下文已经塞满了，AI 开始遗忘早期信息
- 不同领域的信息互相干扰

✅ 4 个 Agent 并行:

Agent 1: 只读技术栈相关 → 写 STACK.md → 返回确认
Agent 2: 只读架构相关 → 写 ARCHITECTURE.md → 返回确认
Agent 3: 只读规范相关 → 写 CONVENTIONS.md → 返回确认
Agent 4: 只读问题相关 → 写 CONCERNS.md → 返回确认

好处：
- 每个 Agent 上下文干净
- 并行执行，速度快
- 信息不互相污染
```

---

## 五、为什么是这 4 个领域？

| 领域 | 解决的问题 | 后续谁会读 |
|------|-----------|-----------|
| **tech** | 用了什么技术？版本是什么？ | plan-phase（知道用什么库） |
| **arch** | 代码怎么组织的？层级关系？ | plan-phase（知道代码放哪） |
| **quality** | 编码规范是什么？测试怎么写？ | execute-phase（按规范写代码） |
| **concerns** | 有什么问题？技术债务？ | plan-phase（决定修复优先级） |

### 读取策略表

```
当规划 UI 阶段时 → 读取 CONVENTIONS + STRUCTURE
当规划 API 阶段时 → 读取 ARCHITECTURE + CONVENTIONS
当规划测试阶段时 → 读取 TESTING + CONVENTIONS
当规划重构阶段时 → 读取 CONCERNS + ARCHITECTURE
```

---

## 六、总结

| 问题 | 答案 |
|------|------|
| 为什么要 4 个 Agent？ | Token 隔离 + 并行执行 + 信息不污染 |
| 为什么是这 4 个领域？ | 覆盖了后续规划/执行需要的所有上下文 |
| Agent 怎么返回结果？ | 直接写入文件，只返回确认（不返回内容） |
| 编排器做什么？ | 初始化 → 检查 → 创建目录 → 启动 Agent → 收集确认 → 验证 → 安全检查 → 提交 |

---

*整理时间: 2026-03-15*
