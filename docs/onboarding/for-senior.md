# GSD 学习项目 - 高级工程师 Onboarding 指南

> 面向高级工程师：快速把握架构决策、技术债务、安全模型和可扩展性。假设你熟悉 AI 辅助开发、Agent 编排和上下文工程的基本概念。

---

## 一、架构决策记录（ADR）索引

以下是项目中已经识别和记录的关键架构决策。每个决策链接到对应的笔记文件。

### ADR-001：Command 与 Workflow 分层

| 字段 | 内容 |
|------|------|
| **状态** | 已采纳 |
| **背景** | GSD 的斜杠命令需要同时承担"声明接口"和"实现逻辑"两个职责，导致文件膨胀（300+ 行）且修改耦合 |
| **决策** | 拆分为两层：Command 层（~70 行，声明 + 概述）和 Workflow 层（~300 行，详细步骤 + 条件逻辑），通过 `@` 引用连接 |
| **后果** | Command 可以独立修改接口而不影响实现；Workflow 可以被多个 Command 复用；新增功能只需新增 Workflow |
| **详细分析** | `notes/gsd/Command与Workflow分层设计.md` |

### ADR-002：XML 标签结构化 Prompt

| 字段 | 内容 |
|------|------|
| **状态** | 已采纳 |
| **背景** | 自然语言 Prompt 导致 AI 行为不可预测、容易遗漏步骤、缺乏验证机制 |
| **决策** | 所有 Agent 和 Workflow 使用统一的 XML 标签体系（`<role>`、`<step>`、`<verify>`、`<success_criteria>` 等）结构化指令 |
| **后果** | AI 行为可预测；步骤强制顺序执行；内置验证机制；但增加了 Prompt 编写复杂度 |
| **详细分析** | `notes/reusable-designs/XML标签结构化Prompt设计.md` |

### ADR-003：Orchestrator 模式（编排器不做重活）

| 字段 | 内容 |
|------|------|
| **状态** | 已采纳 |
| **背景** | 单一 Agent 处理复杂任务会导致上下文膨胀，输出质量随对话长度下降 |
| **决策** | 主会话作为轻量编排器（~10-15% context），通过 Task() tool 将重活分派给独立上下文窗口的子代理 |
| **后果** | 主会话始终保持清爽；子代理各有独立 200k context；但编排逻辑增加了复杂度 |
| **详细分析** | `notes/architecture/gsd-framework-overview.md` 的"关键设计模式"章节 |

### ADR-004：Phase 串行 / Plan 并行执行模型

| 字段 | 内容 |
|------|------|
| **状态** | 已采纳 |
| **背景** | 跨 Phase 批量执行存在依赖关系、Context 限制和迭代学习三个不可调和的问题 |
| **决策** | Phase 间严格串行（必须完成一个才能进入下一个），Phase 内通过 Wave 分组并行执行独立 Plan |
| **后果** | 依赖关系正确；Context 可控；但无法全自动完成整个 Milestone |
| **详细分析** | `notes/gsd-execution-model.md` |

### ADR-005：Bridge File 跨进程通信

| 字段 | 内容 |
|------|------|
| **状态** | 已采纳 |
| **背景** | Statusline Hook 和 Context Monitor Hook 运行在不同进程中，需要共享上下文使用量数据 |
| **决策** | 使用临时文件（`/tmp/claude-ctx-{session}.json`）作为 bridge，Statusline 写入、Monitor 读取 |
| **后果** | 解耦了两个进程；包含 timestamp 防止陈旧数据；静默失败不阻塞主流程 |
| **详细分析** | `notes/reusable-designs/gsd-context-lifecycle-management.md` |

### ADR-006：目标反向验证（Goal-Backward Verification）

| 字段 | 内容 |
|------|------|
| **状态** | 已采纳 |
| **背景** | 任务完成不等于目标达成。一个任务"创建聊天组件"可以标记完成但只是占位符 |
| **决策** | Verifier Agent 不检查"任务是否完成"，而是从目标反向推导验证：目标需要什么为真 → 需要什么存在 → 需要什么连接 |
| **后果** | 更可靠的交付质量；但验证逻辑更复杂，可能出现"目标已达成但任务未全部完成"的误判 |
| **详细分析** | `notes/design/agents-design.md` 的"目标向后验证"章节 |

### ADR-007：Skills vs Commands 选择

| 字段 | 内容 |
|------|------|
| **状态** | 学习笔记（非本项目决策） |
| **背景** | GSD 使用 Commands，而 Claude Code 后来推出了功能更强的 Skills 机制 |
| **分析结论** | Skills 是 Commands 的超集（支持自动触发、目录结构、多文件），新项目应优先选择 Skills |
| **详细分析** | `notes/reusable-designs/skills-vs-commands.md` |

---

## 二、已知技术债务和改进方向

### 2.1 框架层面（GSD 源码）

| 债务 | 严重程度 | 说明 | 改进方向 |
|------|----------|------|----------|
| **install.js 体积过大** | 高 | 88KB 的单文件安装器，逻辑密集，难以维护 | 拆分为模块，安装逻辑分层 |
| **gsd-tools.cjs 单体工具** | 中 | 所有运行时工具打包在单个文件中 | 按功能拆分为独立模块 |
| **错误消息不够结构化** | 中 | 部分 Workflow 的错误提示依赖自然语言，难以程序化处理 | 引入结构化错误码 |
| **测试覆盖率** | 中 | 测试覆盖率要求 70%，部分模块（如 init.cjs）测试不足 | 补充核心模块的单元测试 |
| **中英文翻译不完整** | 低 | 部分 Agent 文件的中文版命名不一致（如 `gsd-phase-researcher.md.zh-CN.md`） | 统一翻译文件命名规范 |

### 2.2 学习项目层面

| 债务 | 严重程度 | 说明 | 改进方向 |
|------|----------|------|----------|
| **CLAUDE.md 问题清单未完成** | 中 | 约 20 个问题中只有部分已回答 | 继续问题驱动的源码分析 |
| **Demo 项目 Phase 4 未完成** | 低 | 部署阶段尚未执行 | 用 GSD 工作流完成 |
| **笔记缺少交叉引用** | 低 | 部分笔记之间缺少链接关系 | 添加相关笔记链接 |

### 2.3 可借鉴但尚未实现的改进

| 改进 | 来源 | 适用场景 |
|------|------|----------|
| Skills 替代 Commands | ADR-007 | jacky-skills 项目直接使用 Skills |
| 上下文生命周期管理 | ADR-005 | 任何需要长会话连续性的 AI 工具 |
| 心智状态捕获 | pause-work workflow | 长期任务的断点保存机制 |

---

## 三、安全模型概述

### 3.1 GSD 框架安全机制

#### 敏感文件保护

GSD 通过 Claude Code 的权限系统保护敏感文件：

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

**纵深防御策略**：
1. **读取拒绝** -- 通过 `deny` 列表阻止 Claude 读取敏感文件
2. **提交保护** -- GSD 内置防止提交机密的机制
3. **路径传递** -- 编排器只传递文件路径给子代理，不传递内容

#### Agent 权限隔离

| Agent | 工具权限 | 设计原则 |
|-------|----------|----------|
| planner | Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__* | 需要研究和写入计划 |
| executor | Read, Write, Edit, Bash, Grep, Glob | 需要修改代码和执行命令 |
| verifier | Read, Write, Bash, Grep, Glob | 只读验证 + 写报告 |
| researcher | Read, Write, Bash, Grep, Glob, WebSearch, WebFetch, mcp__context7__* | 需要网络搜索 |

**原则**：最小权限。每个 Agent 只获得完成其职责所必需的工具。

#### 执行偏差处理

Executor Agent 内置分级偏差处理规则：

| 规则 | 行为 | 需要权限 |
|------|------|----------|
| 自动修复 Bug | 自动执行 | 不需要 |
| 自动补充关键缺失功能 | 自动执行 | 不需要 |
| 自动修复阻塞性问题 | 自动执行 | 不需要 |
| 架构变更 | 必须询问 | 需要用户确认 |
| 新增功能 | 必须询问 | 需要用户确认 |

### 3.2 本项目安全注意事项

| 关注点 | 说明 |
|--------|------|
| **GSD 源码只读** | `get-shit-done/` 目录是上游框架源码，不应修改（除非有意贡献） |
| **笔记不含敏感信息** | `notes/` 目录下的笔记不应包含密钥、密码或个人敏感信息 |
| **Demo 项目公开部署** | `demo-by-gsd` 部署在 GitHub Pages，所有内容公开可见 |
| **CI/CD 权限** | `.github/workflows/` 使用最小权限部署，不需要密钥 |

---

## 四、性能基准

### 4.1 框架安装

| 指标 | 数值 | 说明 |
|------|------|------|
| npm 包大小 | ~150KB（压缩后） | `get-shit-done-cc@1.22.4` |
| 安装文件总数 | ~200 个 | 包含 agents、commands、hooks、workflows、templates、references |
| 安装时间 | 5-10 秒 | `npx get-shit-done-cc@latest`，取决于网络 |
| 本地占用空间 | ~2MB | 部署到 `~/.claude/` 目录 |

### 4.2 上下文消耗

| 阶段 | 主会话消耗 | 说明 |
|------|-----------|------|
| `/gsd:new-project` | 30-40% | 编排器只做协调，4 个研究员在独立上下文工作 |
| `/gsd:plan-phase` | 25-35% | Planner + Checker 循环在子代理中执行 |
| `/gsd:execute-phase` | 20-30% | 每个 Executor 有独立 200k context |
| `/gsd:verify-work` | 15-25% | Verifier 在子代理中执行 |

**关键设计目标**：主会话上下文保持在 30-40%，确保对话始终保持响应速度。

### 4.3 执行效率

| 场景 | 时间估算 | 说明 |
|------|----------|------|
| 单个 Plan 执行 | 2-5 分钟 | 取决于任务复杂度和模型配置 |
| 单个 Phase（3-5 Plan） | 10-30 分钟 | 含 Wave 并行 |
| 完整 Milestone（5-8 Phase） | 1-3 小时 | 含讨论、规划、执行、验证 |
| 项目初始化 | 10-20 分钟 | 含研究（4 个并行代理） |

### 4.4 模型配置对成本的影响

| 配置文件 | 规划模型 | 执行模型 | 验证模型 | 相对成本 |
|---------|----------|----------|----------|----------|
| quality | Opus | Opus | Sonnet | 最高 |
| balanced | Opus | Sonnet | Sonnet | 中等（默认） |
| budget | Sonnet | Sonnet | Haiku | 最低 |

---

## 五、可扩展性分析

### 5.1 水平扩展：新增 Agent

GSD 的 Agent 体系设计为可扩展。新增 Agent 的步骤：

1. 在 `agents/` 目录创建 `gsd-{name}.md`
2. 遵循标准结构：frontmatter + `<role>` + `<execution_flow>` + `<output_spec>`
3. 在相关 Workflow 中通过 Task() tool 调用
4. 声明下游消费者确保输出格式兼容

**扩展点**：

```
现有 Agent 体系
  ├── 研究层 → 可新增：性能分析 Agent、安全审计 Agent
  ├── 规划层 → 可新增：架构评审 Agent
  ├── 执行层 → 可新增：重构 Agent、迁移 Agent
  ├── 验证层 → 可新增：可访问性测试 Agent、性能基准 Agent
  └── 辅助层 → 可新增：文档生成 Agent、国际化 Agent
```

### 5.2 垂直扩展：新增 Workflow

Workflow 是编排逻辑的实现地。新增 Workflow 的步骤：

1. 在 `get-shit-done/workflows/` 创建 `{name}.md`
2. 使用 `<step>` 标签定义详细步骤
3. 在 `commands/gsd/` 创建对应的 Command 入口
4. 在 Command 的 `<execution_context>` 中通过 `@` 引用 Workflow

**扩展点**：

| 可能的 Workflow | 用途 |
|----------------|------|
| `refactor-phase.md` | 自动化代码重构流程 |
| `migrate-phase.md` | 技术栈迁移流程 |
| `benchmark-phase.md` | 性能基准测试流程 |
| `security-audit.md` | 安全审计流程 |

### 5.3 配置扩展

`config.json` 的可扩展配置项：

```json
{
  "mode": "yolo|interactive",
  "granularity": "coarse|standard|fine",
  "parallelization": { "enabled": true },
  "model_profile": "quality|balanced|budget",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true,
    "auto_advance": false
  },
  "git": {
    "branching_strategy": "none|phase|milestone",
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}"
  }
}
```

**可新增的配置维度**：
- Agent 级别的模型覆盖（如指定 researcher 用 Haiku）
- 自定义 Phase 粒度范围
- 外部工具集成开关（如 ESLint、Prettier 自动格式化）

### 5.4 模板扩展

`get-shit-done/templates/` 目录提供了所有文档模板：

| 模板 | 用途 | 可扩展方向 |
|------|------|-----------|
| `project.md` | 项目定义模板 | 新增行业专属模板 |
| `requirements.md` | 需求文档模板 | 新增验收标准模板 |
| `roadmap.md` | 路线图模板 | 新增甘特图时间线 |
| `summary.md` | 三种复杂度 | 新增自动生成变更日志 |

### 5.5 限制与约束

| 约束 | 说明 | 影响 |
|------|------|------|
| **上下文窗口硬限制** | 每个 Agent 独立 200k token | 超大文件（>50KB）需要分段处理 |
| **Phase 串行依赖** | 不支持跨 Phase 并行 | 大型项目执行时间较长 |
| **修订循环上限** | Plan-Checker 最多 3 轮 | 复杂场景可能需要人工介入 |
| **单文件安装器** | install.js 88KB 单体 | 扩展安装逻辑需要修改核心文件 |
| **Node.js 运行时** | 依赖 Node.js >= 16.7 | 不支持其他运行时（如 Deno、Bun） |

---

## 六、与其他框架的对比

| 维度 | GSD | BMAD / SpecKit | jacky-skills |
|------|-----|-----------------|--------------|
| **定位** | 完整项目管理框架 | 规范驱动开发 | 单点技能复用 |
| **上下文管理** | 自动（STATE.md + Hook） | 手动 | 无 |
| **Agent 编排** | Workflow 编排多 Agent | 单 Agent | 单 Skill 执行 |
| **并行执行** | Wave 分组并行 | 不支持 | 不支持 |
| **状态持久化** | 三层（任务/项目/全局） | 文件级 | 无 |
| **验证机制** | Goal-Backward + Revision Loop | 人工验证 | 无内置验证 |
| **扩展方式** | Agent + Workflow + Template | Spec 模板 | Skill 目录 |
| **学习曲线** | 中等（12 Agent + 40 命令） | 高（企业仪式） | 低 |

---

## 七、快速导航

### 需要理解架构时

```
notes/architecture/gsd-framework-overview.md     → 完整架构梳理
notes/design/agents-design.md                    → Agent 设计分析
notes/gsd/Command与Workflow分层设计.md            → 分层设计解析
```

### 需要理解执行机制时

```
notes/gsd-execution-model.md                     → 执行模型
notes/gsd-interruption-guide.md                  → 中断恢复机制
notes/gsd/GSD使用指南.md                          → 完整使用指南
```

### 需要借鉴设计模式时

```
notes/reusable-designs/XML标签结构化Prompt设计.md  → Prompt 设计模式
notes/reusable-designs/gsd-context-lifecycle-management.md → 上下文管理
notes/reusable-designs/Hooks跨进程通信模式.md      → Hook 通信
notes/reusable-designs/init-variable-injection.md → 变量注入
notes/reusable-designs/skills-vs-commands.md       → 架构选择分析
```

---

*文档生成时间: 2026-04-04*
*基于 GSD v1.22.4*
