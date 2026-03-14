---
name: gsd:map-codebase
description: 使用并行映射器智能体分析代码库，生成 .planning/codebase/ 文档
argument-hint: "[可选：要映射的特定区域，例如 'api' 或 'auth']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
使用并行的 gsd-codebase-mapper 智能体分析现有代码库，生成结构化的代码库文档。

每个映射器智能体探索一个重点领域并**直接写入文档**到 `.planning/codebase/`。协调器仅接收确认，保持上下文使用最小化。

输出：带有关于代码库状态的 7 个结构化文档的 .planning/codebase/ 文件夹。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/map-codebase.md
</execution_context>

<context>
Focus area: $ARGUMENTS (可选 - 如果提供，告诉智能体专注于特定子系统)

**加载项目状态（如果存在）：**
检查 .planning/STATE.md - 如果项目已经初始化则加载上下文

**此命令可以运行：**
- 在 /gsd:new-project 之前（遗留代码库）- 首先创建代码库映射
- 在 /gsd:new-project 之后（全新代码库）- 随着代码演进更新代码库映射
- 任何时间刷新代码库理解
</context>

<when_to_use>
**使用 map-codebase 的情况：**
- 初始化前的遗留项目（先理解现有代码）
- 显著更改后刷新代码库映射
- 加入不熟悉的代码库
- 主要重构之前（理解当前状态）
- 当 STATE.md 引用过时的代码库信息时

**跳过 map-codebase 的情况：**
- 尚无代码的全新项目（没有可映射的内容）
- 微不足道的代码库（<5 个文件）
</when_to_use>

<process>
1. 检查 .planning/codebase/ 是否已存在（提供刷新或跳过选项）
2. 创建 .planning/codebase/ 目录结构
3. 生成 4 个并行的 gsd-codebase-mapper 智能体：
   - 智能体 1：技术焦点 → 写入 STACK.md, INTEGRATIONS.md
   - 智能体 2：架构焦点 → 写入 ARCHITECTURE.md, STRUCTURE.md
   - 智能体 3：质量焦点 → 写入 CONVENTIONS.md, TESTING.md
   - 智能体 4：关注点焦点 → 写入 CONCERNS.md
4. 等待智能体完成，收集确认（不是文档内容）
5. 验证所有 7 个文档存在并统计行数
6. 提交代码库映射
7. 提供下一步建议（通常是：/gsd:new-project 或 /gsd:plan-phase）
</process>

<success_criteria>
- [ ] .planning/codebase/ 目录已创建
- [ ] 所有 7 个代码库文档由映射器智能体写入
- [ ] 文档遵循模板结构
- [ ] 并行智能体无错误完成
- [ ] 用户知道下一步
</success_criteria>