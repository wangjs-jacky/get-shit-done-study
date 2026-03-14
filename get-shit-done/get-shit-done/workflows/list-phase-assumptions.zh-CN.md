<目的>
在计划前揭示 Claude 对某个阶段的假设，使用户能够及早纠正误解。

与 discuss-phase 的关键区别：这是对 Claude 思考的分析，而不是对用户知识的接收。无文件输出 - 纯对话式讨论提示。
</目的>

<流程>

<step name="validate_phase" priority="first">
阶段编号: $ARGUMENTS (必需)

**如果参数缺失：**

```
错误：需要阶段编号。

用法: /gsd:list-phase-assumptions [phase-number]
示例: /gsd:list-phase-assumptions 3
```

退出工作流。

**如果参数提供：**
验证阶段是否存在于路线图中：

```bash
cat .planning/ROADMAP.md | grep -i "Phase ${PHASE}"
```

**如果未找到阶段：**

```
错误：在路线图中未找到阶段 ${PHASE}。

可用阶段：
[从路线图列出阶段]
```

退出工作流。

**如果找到阶段：**
从路线图解析阶段详细信息：

- 阶段编号
- 阶段名称
- 阶段描述/目标
- 任何提及的范围细节

继续到 analyze_phase。
</step>

<step name="analyze_phase">
基于路线图描述和项目上下文，从五个方面识别假设：

**1. 技术方法：**
Claude 会使用哪些库、框架、模式或工具？
- "I'd use X library because..."
- "I'd follow Y pattern because..."
- "I'd structure this as Z because..."

**2. 实现顺序：**
Claude 会先构建什么，然后是第二个，第三个？
- "I'd start with X because it's foundational"
- "Then Y because it depends on X"
- "Finally Z because..."

**3. 范围边界：**
Claude 的解释中包含什么，排除什么？
- "This phase includes: A, B, C"
- "This phase does NOT include: D, E, F"
- "Boundary ambiguities: G could go either way"

**4. 风险区域：**
Claude 预期复杂度或挑战在哪里？
- "The tricky part is X because..."
- "Potential issues: Y, Z"
- "I'd watch out for..."

**5. 依赖关系：**
Claude 假设存在什么或需要到位什么？
- "This assumes X from previous phases"
- "External dependencies: Y, Z"
- "This will be consumed by..."

诚实地表达不确定性。用置信度标记假设：
- "Fairly confident: ..." (从路线图中清晰)
- "Assuming: ..." (合理的推断)
- "Unclear: ..." (可能有多种方式)
</step>

<step name="present_assumptions">
以清晰、可扫描的格式呈现假设：

```
## 我对阶段 ${PHASE} 的假设：${PHASE_NAME}

### 技术方法
[关于如何实现的假设列表]

### 实现顺序
[关于顺序的假设列表]

### 范围边界
**包含在内：** [包含的内容]
**排除在外：** [排除的内容]
**不明确的：** [可能有两种情况的内容]

### 风险区域
[预期的挑战列表]

### 依赖关系
**来自之前阶段：** [需要的内容]
**外部：** [第三方需求]
**输出到：** [未来阶段需要此阶段的什么]

---

**你怎么看？**

这些假设准确吗？请告诉我：
- 我说对了什么
- 我说错了什么
- 我遗漏了什么
```

等待用户响应。
</step>

<step name="gather_feedback">
**如果用户提供纠正：**

承认纠正：

```
关键纠正：
- [纠正 1]
- [纠正 2]

这显著改变了我对 [总结新理解] 的理解。
```

**如果用户确认假设：**

```
假设已验证。
```

继续到 offer_next。
</step>

<step name="offer_next">
提供下一步：

```
接下来是什么？
1. 讨论上下文 (/gsd:discuss-phase ${PHASE}) - 我会问你问题来构建全面上下文
2. 计划这个阶段 (/gsd:plan-phase ${PHASE}) - 创建详细执行计划
3. 重新审视假设 - 我会用你的纠正重新分析
4. 暂时完成
```

等待用户选择。

如果"讨论上下文"：注意 CONTEXT.md 将纳入此处讨论的任何纠正
如果"计划这个阶段"：在假设被理解的情况下继续
如果"重新审视"：用更新的理解返回 analyze_phase
</step>

</process>

<成功标准>
- 阶段编号已对照路线图验证
- 假设在五个领域被揭示：技术方法、实现顺序、范围、风险、依赖关系
- 适当时标记置信度
- "你怎么看？"提示已呈现
- 用户反馈已承认
- 已提供清晰的下一步
</成功标准>