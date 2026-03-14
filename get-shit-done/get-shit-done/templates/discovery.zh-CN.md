# 发现模板

用于 `.planning/phases/XX-name/DISCOVERY.md` — 库/选项决策的浅层研究。

**目的：** 在 plan-phase 的强制性发现期间回答"我们应该使用哪个库/选项"的问题。

对于深层生态系统研究（"专家如何构建这个"），使用 `/gsd:research-phase` 生成 RESEARCH.md。

---

## 文件模板

```markdown
---
phase: XX-name
type: discovery
topic: [发现主题]
---

<session_initialization>
开始发现前，验证今天的日期：
!`date +%Y-%m-%d`

搜索"当前"或"最新"信息时使用此日期。
示例：如果今天是 2025-11-22，搜索"2025"而不是"2024"。
</session_initialization>

<discovery_objective>
发现 [主题] 以支持 [阶段名称] 实现。

目的：[此启用的决策/实现]
范围：[边界]
输出：包含建议的 DISCOVERY.md
</discovery_objective>

<discovery_scope>
<include>
- [要回答的问题]
- [要调查的区域]
- [需要的特定比较（如果有的话）]
</include>

<exclude>
- [此发现超出范围]
- [延迟到实现阶段]
</exclude>
</discovery_scope>

<discovery_protocol>

**来源优先级：**
1. **Context7 MCP** - 用于库/框架文档（当前、权威）
2. **官方文档** - 用于平台特定或未编入索引的库
3. **WebSearch** - 用于比较、趋势、社区模式（验证所有发现）

**质量检查清单：**
完成发现前，验证：
- [ ] 所有主张都有权威来源（Context7 或官方文档）
- [ ] 否定性主张（"X 不可能"）通过官方文档验证
- [ ] API 语法/配置来自 Context7 或官方文档（不能单独使用 WebSearch）
- [ ] WebSearch 发现交叉检查权威来源
- [ ] 检查最近的更新/变更日志以了解破坏性更改
- [ ] 考虑替代方案（不仅仅是找到的第一个解决方案）

**信心水平：**
- HIGH：Context7 或官方文档确认
- MEDIUM：WebSearch + Context7/官方文档确认
- LOW：仅 WebSearch 或仅训练知识（标记需要验证）

</discovery_protocol>

<output_structure>
创建 `.planning/phases/XX-name/DISCOVERY.md`：

```markdown
# [主题] 发现

## 总结
[2-3 段执行摘要 - 研究了什么，发现了什么，推荐什么]

## 主要建议
[做什么和为什么 - 具体且可执行]

## 考虑的替代方案
[评估的其他方案以及为什么不选择]

## 关键发现

### [类别 1]
- [发现，带有源 URL 和与我们案例的相关性]

### [类别 2]
- [发现，带有源 URL 和相关性]

## 代码示例
[相关的实现模式（如果适用）]

## 元数据

<metadata>
<confidence level="high|medium|low">
[为什么这个信心水平 - 基于来源质量和验证]
</confidence>

<sources>
- [使用的主要权威来源]
</sources>

<open_questions>
[无法确定或在实现期间需要验证的内容]
</open_questions>

<validation_checkpoints>
[如果信心为 LOW 或 MEDIUM，列出实现期间需要验证的具体内容]
</validation_checkpoints>
</metadata>
```
</output_structure>

<success_criteria>
- 所有范围问题都通过权威来源回答
- 完成质量检查清单项目
- 清晰的主要建议
- 低信心发现标记有验证检查点
- 准备支持 PLAN.md 创建
</success_criteria>

<guidelines>
**何时使用发现：**
- 技术选择不明确（库 A vs B）
- 不熟悉集成需要最佳实践
- 需要库/调查 API
- 单个决策等待

**何时不使用：**
- 既定模式（CRUD、使用已知库的认证）
- 实现细节（延迟到执行）
- 可从现有项目上下文回答的问题

**何时使用 RESEARCH.md：**
- 小众/复杂领域（3D、游戏、音频、着色器）
- 需要生态系统知识，不仅仅是库选择
- "专家如何构建这个"问题
- 使用 `/gsd:research-phase` 处理这些
</guidelines>