# 模型配置文件

模型配置控制每个 GSD 代理使用哪个 Claude 模型。这允许在质量和令牌消耗之间取得平衡。

## 配置定义

| 代理 | `quality` | `balanced` | `budget` |
|------|-----------|------------|----------|
| gsd-planner | opus | opus | sonnet |
| gsd-roadmapper | opus | sonnet | sonnet |
| gsd-executor | opus | sonnet | sonnet |
| gsd-phase-researcher | opus | sonnet | haiku |
| gsd-project-researcher | opus | sonnet | haiku |
| gsd-research-synthesizer | sonnet | sonnet | haiku |
| gsd-debugger | opus | sonnet | sonnet |
| gsd-codebase-mapper | sonnet | haiku | haiku |
| gsd-verifier | sonnet | sonnet | haiku |
| gsd-plan-checker | sonnet | sonnet | haiku |
| gsd-integration-checker | sonnet | sonnet | haiku |
| gsd-nyquist-auditor | sonnet | sonnet | haiku |

## 配置理念

**quality** - 最大推理能力
- 所有决策代理使用 Opus
- 仅读验证使用 Sonnet
- 使用场景：配额可用时，关键架构工作

**balanced**（默认）- 智能分配
- 仅规划使用 Opus（架构决策发生的地方）
- 执行和研究使用 Sonnet（遵循明确指令）
- 验证使用 Sonnet（需要推理，不只是模式匹配）
- 使用场景：常规开发，质量和成本的良好平衡

**budget** - 最少 Opus 使用
- 任何编写代码的工作使用 Sonnet
- 研究和验证使用 Haiku
- 使用场景：节约配额，高容量工作，不太关键的阶段

## 解析逻辑

编排器在生成前解析模型：

```
1. 读取 .planning/config.json
2. 检查 model_overrides 获取代理特定覆盖
3. 如果没有覆盖，在配置表中查找代理
4. 将模型参数传递给 Task 调用
```

## 每个代理的覆盖

在不更改整个配置的情况下覆盖特定代理：

```json
{
  "model_profile": "balanced",
  "model_overrides": {
    "gsd-executor": "opus",
    "gsd-planner": "haiku"
  }
}
```

覆盖优先于配置。有效值：`opus`、`sonnet`、`haiku`。

## 切换配置

运行时：`/gsd:set-profile <配置>`
每项目默认值：设置在 `.planning/config.json` 中：
```json
{
  "model_profile": "balanced"
}
```

## 设计原理

**为什么 gsd-planner 使用 Opus？**
规划涉及架构决策、目标分解和任务设计。这是模型质量影响最高的地方。

**为什么 gsd-executor 使用 Sonnet？**
执行器遵循 PLAN.md 指令。计划已包含推理；执行是实现。

**为什么 balanced 中验证器使用 Sonnet（不是 Haiku）？**
验证需要目标向后推理 - 检查代码是否**实现**了阶段所承诺的，而不只是模式匹配。Sonnet 很好地处理这一点；Haiku 可能会遗漏细微的差距。

**为什么 gsd-codebase-mapper 使用 Haiku？**
仅读探索和模式提取。不需要推理，只需要从文件内容中输出结构化数据。

**为什么使用 `inherit` 而不是直接传递 `opus`？**
Claude Code 的 `"opus"` 别名映射到特定的模型版本。组织可能会阻止较旧的 opus 版本，同时允许较新的版本。GSD 为 opus 级别代理返回 `"inherit"`，导致它们使用用户在其会话中配置的任何 opus 版本。这避免了版本冲突和静默回退到 Sonnet。