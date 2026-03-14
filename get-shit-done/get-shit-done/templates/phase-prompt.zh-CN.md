# 阶段提示模板

> **注意：** 规划方法论在 `agents/gsd-planner.md` 中。
> 此模板定义代理生成的 PLAN.md 输出格式。

用于 `.planning/phases/XX-name/{phase}-{plan}-PLAN.md` — 优化为并行执行的可执行阶段计划。

**命名：** 使用 `{phase}-{plan}-PLAN.md` 格式（例如，`01-02-PLAN.md` 表示阶段 1，计划 2）

---

## 文件模板

```markdown
---
phase: XX-name
plan: NN
type: execute
wave: N                     # 执行波（1、2、3...）。在规划时预计算。
depends_on: []              # 此计划所需的计划 ID（例如，["01-01"]）。
files_modified: []          # 此计划修改的文件。
autonomous: true            # 如果计划包含需要用户交互的检查点则为 false
requirements: []            # **必需** — 来自 ROADMAP 的需求 ID。不能为空。
user_setup: []              # 人类需要的设置，Claude 无法自动化（见下文）

# 目标向后验证（规划时推导，执行后验证）
must_haves:
  truths: []                # 必须为真才能实现目标的可观察行为
  artifacts: []             # 必须存在的文件和实际实现
  key_links: []             # 工件之间的关键连接
---

<objective>
[此计划完成的内容]

目的：[为什么这对项目很重要]
输出：[将创建什么工件]
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
[如果计划包含检查点任务（type="checkpoint:*"），添加：]
@~/.claude/get-shit-done/references/checkpoints.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# 仅当真正需要时才引用先前的计划 SUMMARY：
# - 此计划使用先前的计划类型/导出
# - 先前计划做出的决策影响此计划
# 不要反射式链式引用：计划 02 引用 01，计划 03 引用 02...

[相关源文件：]
@src/path/to/relevant.ts
</context>

<tasks>

<task type="auto">
  <name>任务 1：[行动导向的名称]</name>
  <files>path/to/file.ext, another/file.ext</files>
  <read_first>path/to/reference.ext, path/to/source-of-truth.ext</read_first>
  <action>[具体实现 - 要做什么，如何做，要避免什么以及为什么。包括具体值：确切标识符、参数、预期输出、文件路径、命令参数。永远不要说"将 X 与 Y 对齐"而不指定确切的目标状态。]</action>
  <verify>[证明它工作的命令或检查]</verify>
  <acceptance_criteria>
    - [Grep 可验证条件："file.ext 包含 '确切字符串'"]
    - [可测量条件："output.ext 使用 '预期值'，而不是 '错误值'"]
  </acceptance_criteria>
  <done>[可接受的验收标准]</done>
</task>

<task type="auto">
  <name>任务 2：[行动导向的名称]</name>
  <files>path/to/file.ext</files>
  <read_first>path/to/reference.ext</read_first>
  <action>[具体值的实现]</action>
  <verify>[命令或检查]</verify>
  <acceptance_criteria>
    - [Grep 可验证条件]
  </acceptance_criteria>
  <done>[验收标准]</done>
</task>

<!-- 有关检查点任务示例和模式，请参阅 @~/.claude/get-shit-done/references/checkpoints.md -->

<task type="checkpoint:decision" gate="blocking">
  <decision>[需要决策的内容]</decision>
  <context>[为什么这个决策重要]</context>
  <options>
    <option id="option-a"><name>[名称]</name><pros>[优势]</pros><cons>[权衡]</cons></option>
    <option id="option-b"><name>[名称]</name><pros>[优势]</pros><cons>[权衡]</cons></option>
  </options>
  <resume-signal>选择：option-a 或 option-b</resume-signal>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Claude 构建的内容] - [URL] 上的服务器运行中</what-built>
  <how-to-verify>访问 [URL] 并验证：[仅视觉检查，无 CLI 命令]</how-to-verify>
  <resume-signal>键入"approved"或描述问题</resume-signal>
</task>

</tasks>

<verification>
在声明计划完成前：
- [ ] [具体测试命令]
- [ ] [构建/类型检查通过]
- [ ] [行为验证]
</verification>

<success_criteria>

- 所有任务完成
- 所有验证检查通过
- 没有引入错误或警告
- [计划特定的标准]
</success_criteria>

<output>
完成后，创建 `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`
</output>
```

---

## Frontmatter 字段

| 字段 | 必需 | 用途 |
|------|------|------|
| `phase` | 是 | 阶段标识符（例如，`01-foundation`） |
| `plan` | 是 | 阶段内的计划编号（例如，`01`、`02`） |
| `type` | 是 | 标准 plan 始终为 `execute`，TDD plan 为 `tdd` |
| `wave` | 是 | 执行波编号（1、2、3...）。在 `/gsd:plan-phase` 时预计算。 |
| `depends_on` | 是 | 此计划所需的计划 ID 数组。 |
| `files_modified` | 是 | 此计划触及的文件。 |
| `autonomous` | 是 | 如果没有检查点为 `true`，如果有检查点为 `false` |
| `requirements` | 是 | **必须** 列出来自 ROADMAP 的需求 ID。每个 roadmap 需求必须至少出现在一个计划中。 |
| `user_setup` | 否 | 人类所需设置项（外部服务）的数组 |
| `must_haves` | 是 | 目标向后验证标准（见下文） |

**波是预计算的：** 波编号在 `/gsd:plan-phase` 期间分配。执行阶段直接从 frontmatter 读取 `wave` 并按波编号分组计划。无需运行时依赖分析。

**Must-haves 启用验证：** `must_haves` 字段将目标向后要求从规划传递到执行。所有计划完成后，执行阶段生成验证子代理，检查这些标准与实际代码库的匹配情况。

---

## 并行 vs 顺序

<parallel_examples>

**波 1 候选（并行）：**

```yaml
# 计划 01 - 用户功能
wave: 1
depends_on: []
files_modified: [src/models/user.ts, src/api/users.ts]
autonomous: true

# 计划 02 - 产品功能（与计划 01 无重叠）
wave: 1
depends_on: []
files_modified: [src/models/product.ts, src/api/products.ts]
autonomous: true

# 计划 03 - 订单功能（无重叠）
wave: 1
depends_on: []
files_modified: [src/models/order.ts, src/api/orders.ts]
autonomous: true
```

所有三个并行运行（波 1）- 无依赖，无文件冲突。

**顺序（真实依赖）：**

```yaml
# 计划 01 - 认证基础
wave: 1
depends_on: []
files_modified: [src/lib/auth.ts, src/middleware/auth.ts]
autonomous: true

# 计划 02 - 受保护的功能（需要认证）
wave: 2
depends_on: ["01"]
files_modified: [src/features/dashboard.ts]
autonomous: true
```

波 2 中的计划 02 等待波 1 中的计划 01 - 对认证类型/中间件的真实依赖。

**检查点计划：**

```yaml
# 计划 03 - 带验证的 UI
wave: 3
depends_on: ["01", "02"]
files_modified: [src/components/Dashboard.tsx]
autonomous: false  # 有 checkpoint:human-verify
```

波 3 在波 1 和 2 后运行。在检查点暂停，协调器呈现给用户，批准后恢复。

</parallel_examples>

---

## 上下文区段

**并行感知的上下文：**

```markdown
<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# 仅当真正需要时才包含 SUMMARY 引用：
# - 此计划从先前的计划导入类型
# - 先前计划做出的决策影响此计划
# - 先前计划的输出是此计划的输入
#
# 独立的计划不需要先前的 SUMMARY 引用。
# 不要反射式链式引用：02 引用 01，03 引用 02...

@src/relevant/source.ts
</context>
```

**不好的模式（创建虚假依赖）：**
```markdown
<context>
@.planning/phases/03-features/03-01-SUMMARY.md  # 仅仅因为它是较早的
@.planning/phases/03-features/03-02-SUMMARY.md  # 反射式链式引用
</context>
```

---

## 范围指导

**计划大小：**

- 每计划 2-3 个任务
- 最大 ~50% 上下文使用
- 复杂阶段：多个聚焦计划，而不是一个大计划

**何时拆分：**

- 不同的子系统（认证 vs API vs UI）
- >3 个任务
- 上下文溢出风险
- TDD 候选 - 单独计划

**优先垂直切片：**

```
PREFER: 计划 01 = 用户（模型 + API + UI）
        计划 02 = 产品（模型 + API + UI）

AVOID:  计划 01 = 所有模型
        计划 02 = 所有 API
        计划 03 = 所有 UI
```

---

## TDD 计划

TDD 功能获得专用计划，`type: tdd`。

**启发式方法：** 你能在编写 `fn` 之前写 `expect(fn(input)).toBe(output)` 吗？
→ 是：创建 TDD 计划
→ 否：标准计划中的标准任务

有关 TDD 计划结构，请参阅 `~/.claude/get-shit-done/references/tdd.md`。

---

## 任务类型

| 类型 | 用途 | 自主性 |
|------|------|--------|
| `auto` | Claude 可以独立做的所有事情 | 完全自主 |
| `checkpoint:human-verify` | 视觉/功能验证 | 暂停，返回协调器 |
| `checkpoint:decision` | 实现选择 | 暂停，返回协调器 |
| `checkpoint:human-action` | 真正不可避免的手动步骤（很少见） | 暂停，返回协调器 |

**并行执行中的检查点行为：**
- 计划运行到检查点
- 代理返回检查点详情 + agent_id
- 协调器呈现给用户
- 用户响应
- 协调器使用 `resume: agent_id` 恢复代理

---

## 示例

**自主并行计划：**

```markdown
---
phase: 03-features
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/features/user/model.ts, src/features/user/api.ts, src/features/user/UserList.tsx]
autonomous: true
---

<objective>
实现完整的用户功能作为垂直切片。

目的：可以与其他功能并行运行的独立用户管理。
输出：用户模型、API 端点和 UI 组件。
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>
<task type="auto">
  <name>任务 1：创建用户模型</name>
  <files>src/features/user/model.ts</files>
  <action>定义包含 id、email、name、createdAt 的 User 类型。导出 TypeScript 接口。</action>
  <verify>tsc --noEmit 通过</verify>
  <done>用户类型已导出且可用</done>
</task>

<task type="auto">
  <name>任务 2：创建用户 API 端点</name>
  <files>src/features/user/api.ts</files>
  <action>GET /users（列表），GET /users/:id（单个），POST /users（创建）。使用模型中的 User 类型。</action>
  <verify>curl 测试所有端点通过</verify>
  <done>所有 CRUD 操作正常工作</done>
</task>
</tasks>

<verification>
- [ ] npm run build 成功
- [ ] API 端点正确响应
</verification>

<success_criteria>
- 所有任务完成
- 用户功能端到端工作
</success_criteria>

<output>
完成后，创建 `.planning/phases/03-features/03-01-SUMMARY.md`
</output>
```

**带检查点的计划（非自主）：**

```markdown
---
phase: 03-features
plan: 03
type: execute
wave: 2
depends_on: ["03-01", "03-02"]
files_modified: [src/components/Dashboard.tsx]
autonomous: false
---

<objective>
构建带有视觉验证的仪表板。

目的：将用户和产品功能集成到统一视图中。
输出：工作的仪表板组件。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
@~/.claude/get-shit-done/references/checkpoints.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/03-features/03-01-SUMMARY.md
@.planning/phases/03-features/03-02-SUMMARY.md
</context>

<tasks>
<task type="auto">
  <name>任务 1：构建仪表板布局</name>
  <files>src/components/Dashboard.tsx</files>
  <action>使用 UserList 和 ProductList 组件创建响应式网格。使用 Tailwind 进行样式设置。</action>
  <verify>npm run build 成功</verify>
  <done>仪表板渲染无错误</done>
</task>

<!-- 检查点模式：Claude 启动服务器，用户访问 URL。完整模式请参阅 checkpoints.md。 -->
<task type="auto">
  <name>启动开发服务器</name>
  <action>在后台运行 `npm run dev`，等待就绪</action>
  <verify>curl localhost:3000 返回 200</verify>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>仪表板 - http://localhost:3000 上的服务器</what-built>
  <how-to-verify>访问 localhost:3000/dashboard。检查：桌面网格、移动端堆叠、无滚动问题。</how-to-verify>
  <resume-signal>键入"approved"或描述问题</resume-signal>
</task>
</tasks>

<verification>
- [ ] npm run build 成功
- [ ] 视觉验证通过
</verification>

<success_criteria>
- 所有任务完成
- 用户批准了视觉布局
</success_criteria>

<output>
完成后，创建 `.planning/phases/03-features/03-03-SUMMARY.md`
</output>
```

---

## 反模式

**不好：反射式依赖链**
```yaml
depends_on: ["03-01"]  # 仅仅因为 01 在 02 之前
```

**不好：水平层分组**
```
计划 01：所有模型
计划 02：所有 API（依赖 01）
计划 03：所有 UI（依赖 02）
```

**不好：缺少自主性标志**
```yaml
# 有检查点但没有 autonomous: false
depends_on: []
files_modified: [...]
# autonomous: ???  <- 缺失！
```

**不好：模糊的任务**
```xml
<task type="auto">
  <name>设置认证</name>
  <action>为应用添加认证</action>
</task>
```

**不好：缺少 read_first（执行器修改了未读取的文件）**
```xml
<task type="auto">
  <name>更新数据库配置</name>
  <files>src/config/database.ts</files>
  <!-- 没有 read_first！执行器不知道当前状态或约定 -->
  <action>更新数据库配置以匹配生产设置</action>
</task>
```

**不好：模糊的验收标准（不可验证）**
```xml
<acceptance_criteria>
  - 配置正确设置
  - 数据库连接正常工作
</acceptance_criteria>
```

**好：具体且带有 read_first + 可验证标准**
```xml
<task type="auto">
  <name>为连接池更新数据库配置</name>
  <files>src/config/database.ts</files>
  <read_first>src/config/database.ts, .env.example, docker-compose.yml</read_first>
  <action>添加池配置：min=2, max=20, idleTimeoutMs=30000。添加 SSL 配置：NODE_ENV=production 时 rejectUnauthorized=true。添加 .env.example 条目：DATABASE_POOL_MAX=20。</action>
  <acceptance_criteria>
    - database.ts 包含 "max: 20" 和 "idleTimeoutMillis: 30000"
    - database.ts 根据 NODE_ENV 包含 SSL 条件
    - .env.example 包含 DATABASE_POOL_MAX
  </acceptance_criteria>
</task>
```

---

## 指导原则

- 始终使用 XML 结构供 Claude 解析
- 每个计划中都包含 `wave`、`depends_on`、`files_modified`、`autonomous`
- 优先垂直切片而非水平层
- 仅当真正需要时才引用先前的 SUMMARY
- 将检查点与相关的自动任务在同一计划中分组
- 每计划 2-3 个任务，~50% 上下文最大

---

## 用户设置（外部服务）

当计划引入需要人类配置的外部服务时，在 frontmatter 中声明：

```yaml
user_setup:
  - service: stripe
    why: "支付处理需要 API 密钥"
    env_vars:
      - name: STRIPE_SECRET_KEY
        source: "Stripe Dashboard → Developers → API keys → Secret key"
      - name: STRIPE_WEBHOOK_SECRET
        source: "Stripe Dashboard → Developers → Webhooks → Signing secret"
    dashboard_config:
      - task: "创建 Webhook 端点"
        location: "Stripe Dashboard → Developers → Webhooks → Add endpoint"
        details: "URL: https://[your-domain]/api/webhooks/stripe"
    local_dev:
      - "stripe listen --forward-to localhost:3000/api/webhooks/stripe"
```

**自动化优先规则：** `user_setup` 仅包含 Claude 真正无法做的事情：
- 账户创建（需要人类注册）
- 密钥检索（需要仪表板访问）
- 仪表板配置（需要人类在浏览器中）

**不包括：** Claude 可以运行的包安装、代码更改、文件创建、CLI 命令。

**结果：** Execute-plan 为用户生成 `{phase}-USER-SETUP.md` 检查清单。

完整架构和示例请参阅 `~/.claude/get-shit-done/templates/user-setup.md`

---

## 必需项（目标向后验证）

`must_haves` 字段定义了要实现阶段目标必须为真的内容。在规划时推导，在执行后验证。

**结构：**

```yaml
must_haves:
  truths:
    - "用户可以看到现有消息"
    - "用户可以发送消息"
    - "消息在刷新时持久化"
  artifacts:
    - path: "src/components/Chat.tsx"
      provides: "消息列表渲染"
      min_lines: 30
    - path: "src/app/api/chat/route.ts"
      provides: "消息 CRUD 操作"
      exports: ["GET", "POST"]
    - path: "prisma/schema.prisma"
      provides: "消息模型"
      contains: "model Message"
  key_links:
    - from: "src/components/Chat.tsx"
      to: "/api/chat"
      via: "fetch in useEffect"
      pattern: "fetch.*api/chat"
    - from: "src/app/api/chat/route.ts"
      to: "prisma.message"
      via: "database query"
      pattern: "prisma\\.message\\.(find|create)"
```

**字段描述：**

| 字段 | 用途 |
|------|------|
| `truths` | 从用户角度的可观察行为。每个都必须可测试。 |
| `artifacts` | 必须存在的文件和实际实现。 |
| `artifacts[].path` | 相对于项目根目录的文件路径。 |
| `artifacts[].provides` | 此工件交付的内容。 |
| `artifacts[].min_lines` | 可选。被认为是实质性的最小行数。 |
| `artifacts[].exports` | 可选。要验证的预期导出。 |
| `artifacts[].contains` | 可选。文件中必须存在的模式。 |
| `key_links` | 工件之间的关键连接。 |
| `key_links[].from` | 源工件。 |
| `key_links[].to` | 目标工件或端点。 |
| `key_links[].via` | 连接方式（描述）。 |
| `key_links[].pattern` | 可选。验证连接存在的正则表达式。 |

**为什么这很重要：**

任务完成 ≠ 目标实现。任务"创建聊天组件"可以通过创建占位符完成。`must_haves` 字段捕获了必须实际工作的内容，使验证能够在问题累积之前发现差距。

**验证流程：**

1. 计划阶段从目标向后推导 must_haves（目标向后）
2. Must_haves 写入 PLAN.md frontmatter
3. 执行阶段运行所有计划
4. 验证子代理检查 must_haves 与代码库的匹配情况
5. 发现差距 → 创建修复计划 → 执行 → 重新验证
6. 所有 must_haves 通过 → 阶段完成

验证逻辑请参阅 `~/.claude/get-shit-done/workflows/verify-phase.md`。