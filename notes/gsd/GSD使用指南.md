# Get Shit Done (GSD) 使用指南

> 一份面向实践的 GSD 框架完整使用指南

## 一、GSD 是什么？

**Get Shit Done (GSD)** 是一个为 Claude Code 设计的**元提示词、上下文工程和规范驱动开发系统**。

### 解决的核心问题

**上下文衰减** — 当 Claude 填满其上下文窗口时，输出质量会下降。GSD 通过以下方式解决这个问题：

1. **上下文工程** — 通过结构化文件管理项目知识
2. **子代理编排** — 繁重工作交给新鲜上下文的子代理
3. **状态持久化** — 跨会话保持项目进度和决策

### 核心理念

> *"复杂性在系统中，而不是在你的工作流中。"*

- 没有企业角色扮演（冲刺仪式、故事点、Jira 工作流）
- 几个命令就能工作
- 幕后是复杂的上下文工程和 Agent 编排

---

## 二、快速开始

### 安装

```bash
npx get-shit-done-cc@latest
```

安装程序会提示选择：
1. **运行时** — Claude Code、OpenCode、Gemini、Codex 或全部
2. **位置** — 全局（所有项目）或本地（仅当前项目）

### 验证安装

```bash
/gsd:help
```

### 推荐运行方式

```bash
claude --dangerously-skip-permissions
```

> **原因**：GSD 设计为无摩擦的自动化，频繁批准权限违背其目的。

---

## 三、核心概念

### 3.1 项目结构

GSD 在项目根目录创建 `.planning/` 目录：

```
.planning/
├── PROJECT.md          # 项目愿景（总是加载）
├── REQUIREMENTS.md     # 划定范围的 v1/v2 需求
├── ROADMAP.md          # 阶段路线图
├── STATE.md            # 跨会话记忆（决策、阻塞、位置）
├── config.json         # 工作流配置
├── research/           # 领域研究（栈、功能、架构、陷阱）
├── phases/             # 各阶段的计划、总结、验证
│   ├── 1-feature-a/
│   │   ├── 1-CONTEXT.md
│   │   ├── 1-RESEARCH.md
│   │   ├── 1-1-PLAN.md
│   │   ├── 1-1-SUMMARY.md
│   │   └── 1-VERIFICATION.md
│   └── 2-feature-b/
├── todos/              # 捕获的想法和任务
├── quick/              # 快速任务的计划和总结
├── codebase/           # 代码库分析文档
└── milestones/         # 已完成里程碑的归档
```

### 3.2 核心层级

| 层级 | 说明 |
|------|------|
| **Project** | 整体项目，包含愿景和约束 |
| **Milestone** | 里程碑，一个完整的功能集合（如 v1.0） |
| **Phase** | 开发阶段，milestone 的子任务单元 |
| **Plan** | 原子任务，在单一上下文窗口中可执行 |

### 3.3 文件作用

| 文件 | 作用 |
|------|------|
| `PROJECT.md` | 项目愿景，总是加载 |
| `research/` | 生态系统知识（栈、功能、架构、陷阱） |
| `REQUIREMENTS.md` | 划定范围的 v1/v2 需求，带有阶段可追溯性 |
| `ROADMAP.md` | 你要去的地方，已完成的内容 |
| `STATE.md` | 决策、阻塞、位置 — 跨会话的记忆 |
| `PLAN.md` | 带有 XML 结构的原子任务，验证步骤 |
| `SUMMARY.md` | 发生了什么，改变了什么，提交历史 |
| `CONTEXT.md` | 阶段实现决策，指导研究和规划 |

---

## 四、完整工作流

### 4.1 标准流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GSD 标准工作流                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │ /gsd:new-    │  初始化项目                                       │
│  │ project      │  提问 → 研究 → 需求 → 路线图                       │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │ /gsd:discuss │ →  │ /gsd:plan-   │ →  │ /gsd:execute │          │
│  │ -phase N     │    │ phase N      │    │ -phase N     │          │
│  └──────────────┘    └──────────────┘    └──────┬───────┘          │
│         │                   │                   │                   │
│    捕获实现决策        研究+创建计划         波次并行执行            │
│    (CONTEXT.md)       (PLAN.md)            (SUMMARY.md)            │
│                                               │                     │
│                                               ▼                     │
│                                        ┌──────────────┐             │
│                                        │ /gsd:verify  │             │
│                                        │ -work N      │             │
│                                        └──────┬───────┘             │
│                                               │                     │
│                                          人工验证                   │
│                                          (UAT.md)                   │
│                                               │                     │
│         ┌─────────────────────────────────────┘                     │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────┐                                               │
│  │ 重复下一阶段...  │                                               │
│  │ 直到里程碑完成   │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────┐    ┌──────────────┐                               │
│  │ /gsd:audit-  │ →  │ /gsd:complete│                               │
│  │ milestone    │    │ -milestone   │                               │
│  └──────────────┘    └──────────────┘                               │
│                                                                      │
│  验证里程碑完成度      归档+打标签+准备下一版本                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 阶段 1：初始化项目

```bash
/gsd:new-project
```

**发生什么：**

1. **提问阶段** — 系统深入了解你的想法
   - 目标是什么？
   - 有什么约束？
   - 技术偏好？
   - 边缘情况？

2. **研究阶段**（可选但推荐）— 启动 4 个并行代理调查领域
   - 栈研究
   - 功能研究
   - 架构研究
   - 陷阱研究

3. **需求阶段** — 提取什么是 v1、v2 和超出范围的内容

4. **路线图阶段** — 创建映射到需求的阶段

**输出文件：**
- `PROJECT.md` — 项目上下文
- `REQUIREMENTS.md` — 划定范围的需求
- `ROADMAP.md` — 阶段结构
- `STATE.md` — 项目记忆
- `.planning/research/` — 领域研究

### 4.3 阶段 2：讨论阶段（可选但推荐）

```bash
/gsd:discuss-phase 1
```

**目的**：在研究和计划之前捕获你的实现偏好。

**发生什么：**

1. 系统分析阶段目标
2. 根据构建内容识别灰色区域：
   - **视觉功能** → 布局、密度、交互、空状态
   - **API/CLI** → 响应格式、标志、错误处理
   - **内容系统** → 结构、语气、深度、流程
   - **组织任务** → 分组标准、命名、重复
3. 你选择要讨论的区域
4. 系统提问直到你满意

**输出文件：**
- `{phase_num}-CONTEXT.md` — 决策清晰，下游代理可直接使用

> **关键**：你在这一步深入的程度，系统就越能构建你真正想要的东西。跳过它，你得到合理的默认值。

### 4.4 阶段 3：规划阶段

```bash
/gsd:plan-phase 1
```

**发生什么：**

1. **研究** — 根据 CONTEXT.md 决策调查如何实现
2. **计划** — 创建 2-3 个带 XML 结构的原子任务计划
3. **验证** — 对照需求检查计划，循环直到通过

**计划示例：**
```xml
<task type="auto">
  <name>创建登录端点</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    使用 jose 进行 JWT（不是 jsonwebtoken - CommonJS 问题）。
    根据用户表验证凭据。
    成功时返回 httpOnly cookie。
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login 返回 200 + Set-Cookie</verify>
  <done>有效凭据返回 cookie，无效返回 401</done>
</task>
```

**输出文件：**
- `{phase_num}-RESEARCH.md`
- `{phase_num}-{N}-PLAN.md`

### 4.5 阶段 4：执行阶段

```bash
/gsd:execute-phase 1
```

**发生什么：**

1. **波浪式运行计划** — 可能的话并行，有依赖时顺序
2. **每个计划新鲜上下文** — 200k 令牌纯用于实现
3. **每个任务提交** — 每个任务都有自己的原子提交
4. **对照目标验证** — 检查代码库是否交付了阶段承诺

**波浪执行示意：**
```
波浪 1 (并行)        波浪 2 (并行)        波浪 3
┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐
│ 计划 01 │ │ 计划 02 │ →  │ 计划 03 │ │ 计划 04 │ →  │ 计划 05 │
│ 用户    │ │ 产品    │    │ 订单    │ │ 购物车  │    │ 结账    │
│ 模型    │ │ 模型    │    │ API     │ │ API     │    │ UI      │
└─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘
```

**输出文件：**
- `{phase_num}-{N}-SUMMARY.md`
- `{phase_num}-VERIFICATION.md`

### 4.6 阶段 5：验证工作

```bash
/gsd:verify-work 1
```

**目的**：确认功能按你预期的方式工作。

**发生什么：**

1. 提取可测试的交付物
2. 引导你逐一完成测试
3. 如果有问题，自动诊断故障
4. 创建验证修复计划

**输出文件：**
- `{phase_num}-UAT.md`
- 如发现问题则创建修复计划

### 4.7 阶段 6：完成里程碑

```bash
/gsd:audit-milestone
/gsd:complete-milestone 1.0
```

**审计里程碑：**
- 验证需求覆盖
- 检查跨阶段集成
- 确认 E2E 流程

**完成里程碑：**
- 归档到 `.planning/milestones/`
- 创建 Git 标签
- 准备下一版本

---

## 五、命令速查表

### 5.1 核心工作流命令

| 命令 | 作用 | 使用场景 |
|------|------|----------|
| `/gsd:new-project` | 完整初始化：问题 → 研究 → 需求 → 路线图 | 新项目开始 |
| `/gsd:discuss-phase N` | 在规划前捕获实现决策 | 有特定实现偏好时 |
| `/gsd:plan-phase N` | 阶段的研究 + 规划 + 验证 | 每个阶段开始前 |
| `/gsd:execute-phase N` | 并行波浪执行所有计划 | 计划完成后 |
| `/gsd:verify-work N` | 人工用户验收测试 | 执行完成后 |
| `/gsd:audit-milestone` | 验证里程碑达到完成定义 | 里程碑结束前 |
| `/gsd:complete-milestone` | 存档里程碑，标记发布 | 里程碑完成后 |
| `/gsd:new-milestone` | 启动下一个版本 | 上一版本完成后 |

### 5.2 导航命令

| 命令 | 作用 |
|------|------|
| `/gsd:progress` | 我在哪？下一步是什么？ |
| `/gsd:help` | 显示所有命令和使用指南 |

### 5.3 阶段管理命令

| 命令 | 作用 |
|------|------|
| `/gsd:add-phase` | 向路线图附加阶段 |
| `/gsd:insert-phase N` | 在阶段之间插入紧急工作（小数编号） |
| `/gsd:remove-phase N` | 移除未来阶段，重新编号 |
| `/gsd:list-phase-assumptions N` | 在规划前查看 Claude 的预期方法 |
| `/gsd:plan-milestone-gaps` | 创建阶段以关闭审计差距 |

### 5.4 会话管理命令

| 命令 | 作用 |
|------|------|
| `/gsd:pause-work` | 在阶段中途停止时创建交接 |
| `/gsd:resume-work` | 从上一个会话恢复 |

### 5.5 实用工具命令

| 命令 | 作用 |
|------|------|
| `/gsd:quick` | 执行临时任务（跳过可选步骤） |
| `/gsd:debug` | 使用持久状态进行系统调试 |
| `/gsd:add-todo` | 捕获想法供以后使用 |
| `/gsd:check-todos` | 列出待办事项 |
| `/gsd:settings` | 配置模型配置文件和工作流代理 |
| `/gsd:set-profile` | 切换模型配置文件 |
| `/gsd:health` | 验证 `.planning/` 目录完整性 |
| `/gsd:update` | 更新 GSD 到最新版本 |

---

## 六、常见使用场景

### 场景 1：全新项目

```bash
# 1. 初始化项目
/gsd:new-project

# 2. 对第一阶段进行讨论（可选）
/gsd:discuss-phase 1

# 3. 规划第一阶段
/gsd:plan-phase 1

# 4. 执行第一阶段
/gsd:execute-phase 1

# 5. 验证工作
/gsd:verify-work 1

# 6. 重复 2-5 直到完成
/gsd:discuss-phase 2
/gsd:plan-phase 2
/gsd:execute-phase 2
/gsd:verify-work 2

# 7. 完成里程碑
/gsd:audit-milestone
/gsd:complete-milestone 1.0
```

### 场景 2：已有代码库

```bash
# 1. 先分析现有代码库
/gsd:map-codebase

# 2. 然后初始化项目（会参考代码库分析）
/gsd:new-project

# 后续流程同上...
```

### 场景 3：小任务快速执行

```bash
# 使用快速模式，跳过研究和验证
/gsd:quick
# 然后描述你想做什么

# 如果需要讨论上下文
/gsd:quick --discuss

# 如果需要完整保证
/gsd:quick --full
```

### 场景 4：会话中断后恢复

```bash
# 如果之前暂停了工作
/gsd:resume-work

# 或者检查进度
/gsd:progress
```

### 场景 5：紧急任务插入

```bash
# 在阶段 3 和 4 之间插入紧急工作
/gsd:insert-phase 3 "修复登录 Bug"

# 会创建阶段 3.1
```

### 场景 6：调试问题

```bash
# 使用系统化调试
/gsd:debug "用户无法登录"
# 然后回答关于症状的问题
```

---

## 七、配置说明

### 7.1 模型配置文件

| 配置文件 | 规划 | 执行 | 验证 | 适用场景 |
|---------|----------|-----------|--------------|----------|
| `quality` | Opus | Opus | Sonnet | 最高质量，成本较高 |
| `balanced`（默认） | Opus | Sonnet | Sonnet | 质量与成本平衡 |
| `budget` | Sonnet | Sonnet | Haiku | 成本优先 |

切换配置：
```bash
/gsd:set-profile budget
```

### 7.2 工作流代理开关

| 设置 | 默认值 | 作用 |
|---------|---------|--------------|
| `research` | `true` | 在规划每个阶段前研究领域 |
| `plan_check` | `true` | 在执行前验证计划达到阶段目标 |
| `verifier` | `true` | 执行后确认必须交付的内容 |
| `auto_advance` | `false` | 自动链接讨论 → 规划 → 执行 |

通过 `/gsd:settings` 配置。

### 7.3 覆盖选项

```bash
# 跳过研究
/gsd:plan-phase 1 --skip-research

# 跳过验证
/gsd:plan-phase 1 --skip-verify

# 强制重新研究
/gsd:plan-phase 1 --research

# 使用 PRD 文件
/gsd:plan-phase 1 --prd ./docs/prd.md
```

---

## 八、为什么 GSD 有效

### 8.1 上下文工程

通过结构化文件管理项目知识，确保 Claude 始终有正确的上下文。

### 8.2 子代理编排

| 阶段 | 编排器 | 代理 |
|-------|--------|------|
| 研究 | 协调，展示发现 | 4 个并行研究员 |
| 规划 | 验证，管理迭代 | 规划师 + 检查器 |
| 执行 | 分组为波浪，跟踪进度 | 执行者并行实现 |
| 验证 | 展示结果，路由下一步 | 验证器 + 调试器 |

**关键**：编排器从不做繁重工作，主上下文保持在 30-40%。

### 8.3 原子 Git 提交

每个任务完成后立即获得自己的提交：

```bash
abc123f docs(08-02): 完成用户注册计划
def456g feat(08-02): 添加邮箱确认流程
hij789k feat(08-02): 实现密码哈希
lmn012o feat(08-02): 创建注册端点
```

**好处**：
- Git bisect 找到确切失败的任务
- 每个任务可独立回滚
- 未来会话中 Claude 的清晰历史

---

## 九、最佳实践

### 9.1 何时使用 discuss-phase

**推荐使用**：
- 你有特定的 UI/UX 偏好
- API 设计有特定要求
- 对实现方式有明确想法

**可以跳过**：
- 标准的 CRUD 操作
- 技术实现细节（Claude 能处理）

### 9.2 何时使用 quick 模式

**推荐使用**：
- Bug 修复
- 小功能添加
- 配置更改
- 一次性任务

**不应该用**：
- 大型功能开发
- 需要研究的领域

### 9.3 会话管理建议

1. **长时间工作**：定期运行 `/gsd:pause-work` 保存进度
2. **恢复工作**：始终用 `/gsd:resume-work` 而不是手动查找
3. **检查进度**：不确定时运行 `/gsd:progress`

### 9.4 棕地项目建议

1. **先分析**：`/gsd:map-codebase` 了解现有代码
2. **后初始化**：`/gsd:new-project` 会参考代码库分析
3. **小步迭代**：每个阶段专注于一个功能区域

---

## 十、故障排除

### 命令未找到

1. 重启 Claude Code
2. 验证文件存在于 `~/.claude/commands/gsd/`
3. 重新运行 `npx get-shit-done-cc@latest`

### 命令未按预期工作

1. 运行 `/gsd:help` 验证安装
2. 运行 `/gsd:health` 检查目录完整性
3. 使用 `/gsd:health --repair` 自动修复

### 更新 GSD

```bash
npx get-shit-done-cc@latest
```

### 本地修改丢失

更新后运行：
```bash
/gsd:reapply-patches
```

---

## 十一、参考资源

- [GitHub 仓库](https://github.com/discreteprojects/get-shit-done)
- [用户指南](https://github.com/discreteprojects/get-shit-done/blob/main/docs/USER-GUIDE.md)
- [Discord 社区](https://discord.gg/gsd)
