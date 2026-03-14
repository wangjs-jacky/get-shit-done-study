<purpose>
在适当深度级别执行发现。
产生 DISCOVERY.md（用于第 2-3 级）以支持 PLAN.md 创建。

从 plan-phase.md 的 mandatory_discovery 步骤调用，带有深度参数。

注意：对于全面的生态系统研究（"专家如何构建这个"），请使用 /gsd:research-phase，它产生 RESEARCH.md。
</purpose>

<depth_levels>
**此工作流支持三个深度级别：**

| 级别 | 名称 | 时间 | 输出 | 何时使用 |
| ----- | ------------ | --------- | -------------------------------------------- | ----------------------------------------- |
| 1 | 快速验证 | 2-5 分钟 | 无文件，使用已验证知识继续 | 单个库，确认当前语法 |
| 2 | 标准 | 15-30 分钟 | DISCOVERY.md | 在选项间选择，新集成 |
| 3 | 深入挖掘 | 1+ 小时 | 带有验证门限的详细 DISCOVERY.md | 架构决策，新颖问题 |

**深度由 plan-phase.md 在路由到此处前确定。**
</depth_levels>

<source_hierarchy>
**必需：WebSearch 之前的 Context7**

Claude 的训练数据有 6-18 个月的延迟。总是验证。

1. **Context7 MCP 优先** - 当前文档，无幻觉
2. **官方文档** - 当 Context7 缺少覆盖时
3. **WebSearch 最后** - 仅用于比较和趋势

完整的协议见 ~/.claude/get-shit-done/templates/discovery.md `<discovery_protocol>`。
</source_hierarchy>

<process>

<step name="determine_depth">
检查从 plan-phase.md 传递的深度参数：
- `depth=verify` → 第 1 级（快速验证）
- `depth=standard` → 第 2 级（标准发现）
- `depth=deep` → 第 3 级（深入挖掘）

路由到下面的适当级别工作流。
</step>

<step name="level_1_quick_verify">
**第 1 级：快速验证（2-5 分钟）**

适用于：单个已知库，确认语法/版本仍然正确。

**流程：**

1. 在 Context7 中解析库：

   ```
   mcp__context7__resolve-library-id with libraryName: "[库]"
   ```

2. 获取相关文档：

   ```
   mcp__context7__get-library-docs with:
   - context7CompatibleLibraryID: [来自步骤 1]
   - topic: [具体关注点]
   ```

3. 验证：

   - 当前版本符合预期
   - API 语法未更改
   - 最近版本中没有破坏性更改

4. **如果验证通过：** 带确认返回 plan-phase.md。无需 DISCOVERY.md。

5. **如果发现关注点：** 升级到第 2 级。

**输出：** 继续进行的口头确认，或升级到第 2 级。
</step>

<step name="level_2_standard">
**第 2 级：标准发现（15-30 分钟）**

适用于：在选项间选择，新的外部集成。

**流程：**

1. **确定要发现的内容：**

   - 存在哪些选项？
   - 关键比较标准是什么？
   - 我们的具体用例是什么？

2. **对每个选项使用 Context7：**

   ```
   对于每个库/框架：
   - mcp__context7__resolve-library-id
   - mcp__context7__get-library-docs (mode: "code" 用于 API，"info" 用于概念)
   ```

3. **Context7 缺少的内容使用官方文档。**

4. **用于比较的 WebSearch：**

   - "[选项 A] vs [选项 B] {current_year}"
   - "[选项] 已知问题"
   - "[选项] 与 [我们的栈]"

5. **交叉验证：** 任何 WebSearch 发现 → 用 Context7/官方文档确认。

6. **使用 ~/.claude/get-shit-done/templates/discovery.md 结构创建 DISCOVERY.md：**

   - 带推荐摘要
   - 每个选项的关键发现
   - 来自 Context7 的代码示例
   - 置信度级别（第 2 级应为中高）

7. 返回 plan-phase.md。

**输出：** `.planning/phases/XX-name/DISCOVERY.md`
</step>

<step name="level_3_deep_dive">
**第 3 级：深入挖掘（1+ 小时）**

适用于：架构决策，新颖问题，高风险选择。

**流程：**

1. **使用 ~/.claude/get-shit-done/templates/discovery.md 范围化发现：**

   - 定义清晰范围
   - 定义包含/排除边界
   - 列出需要回答的具体问题

2. **详尽的 Context7 研究：**

   - 所有相关库
   - 相关模式和概念
   - 如果需要，每个库的多个主题

3. **官方文档深度阅读：**

   - 架构指南
   - 最佳实践部分
   - 迁移/升级指南
   - 已知限制

4. **生态系统上下文的 WebSearch：**

   - 其他人如何解决类似问题
   - 生产经验
   - 陷阱和反模式
   - 最近更改/公告

5. **交叉验证所有发现：**

   - 每个 WebSearch 声明 → 用权威来源验证
   - 标记已验证 vs 假设的内容
   - 标记矛盾

6. **创建全面的 DISCOVERY.md：**

   - 来自 ~/.claude/get-shit-done/templates/discovery.md 的完整结构
   - 带来源归因的质量报告
   - 按发现的置信度
   - 如果任何关键发现置信度低 → 添加验证检查点

7. **置信度门限：** 如果总体置信度低，在继续前提供选项。

8. 返回 plan-phase.md。

**输出：** `.planning/phases/XX-name/DISCOVERY.md`（全面）
</step>

<step name="identify_unknowns">
**第 2-3 级：** 定义我们需要学习的内容。

询问：在规划此阶段前，我们需要学习什么？

- 技术选择？
- 最佳实践？
- API 模式？
- 架构方法？
  </step>

<step name="create_discovery_scope">
使用 ~/.claude/get-shit-done/templates/discovery.md。

包括：

- 清晰的发现目标
- 范围化的包含/排除列表
- 来源偏好（官方文档、Context7、当前年份）
- DISCOVERY.md 的输出结构
  </step>

<step name="execute_discovery">
运行发现：
- 使用网络搜索获取当前信息
- 使用 Context7 MCP 获取库文档
- 优先当前年份来源
- 按模板结构化发现
</step>

<step name="create_discovery_output">
写入 `.planning/phases/XX-name/DISCOVERY.md`：
- 带推荐的摘要
- 带来源的关键发现
- 如适用，代码示例
- 元数据（置信度、依赖、未解决问题、假设）
</step>

<step name="confidence_gate">
创建 DISCOVERY.md 后，检查置信度级别。

如果置信度为低：
使用 AskUserQuestion：

- header: "低置信度"
- question: "发现置信度为低：[原因]。您希望如何继续？"
- options:
  - "深入挖掘" - 规划前做更多研究
  - "继续进行" - 接受不确定性，带条件规划
  - "暂停" - 我需要考虑一下

如果置信度为中：
内联："发现完成（中等置信度）。[简短原因]。继续规划？"

如果置信度高：
直接继续，仅注意："发现完成（高置信度）。"
</step>

<step name="open_questions_gate">
如果 DISCOVERY.md 有未解决的问题：

内联展示它们：
"来自发现的未解决问题：

- [问题 1]
- [问题 2]

这可能会影响实现。确认并继续？(是 / 先解决)"

如果"先解决"：收集用户对问题的输入，更新发现。
</step>

<step name="offer_next">
```
发现完成：.planning/phases/XX-name/DISCOVERY.md
推荐：[单行描述]
置信度：[级别]

接下来做什么？

1. 讨论阶段上下文 (/gsd:discuss-phase [当前阶段])
2. 创建阶段计划 (/gsd:plan-phase [当前阶段])
3. 完善发现（深入挖掘）
4. 审查发现

```

注意：DISCOVERY.md 不单独提交。它将在阶段完成时提交。
</step>

</process>

<success_criteria>
**第 1 级（快速验证）：**
- 已咨询 Context7 获取库/主题
- 已验证当前状态或升级关注点
- 继续进行的口头确认（无文件）

**第 2 级（标准）：**
- 已咨询所有选项的 Context7
- WebSearch 发现已交叉验证
- 已创建带有推荐的 DISCOVERY.md
- 置信度为中或更高
- 准备支持 PLAN.md 创建

**第 3 级（深入挖掘）：**
- 发现范围已定义
- 已详尽咨询 Context7
- 所有 WebSearch 发现已用权威来源验证
- 已创建带有全面分析的 DISCOVERY.md
- 带来源归因的质量报告
- 如果发现低置信度 → 已定义验证检查点
- 已通过置信度门限
- 准备支持 PLAN.md 创建
</success_criteria>