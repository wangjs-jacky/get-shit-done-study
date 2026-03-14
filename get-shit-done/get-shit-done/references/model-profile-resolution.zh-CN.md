# 模型解析配置

在编排开始时解析一次模型配置，然后在所有任务生成中使用它。

## 解析模式

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

默认值：如果未设置或配置缺失，则为 `balanced`。

## 查找表

@~/.claude/get-shit-done/references/model-profiles.md

在表中查找解析配置的代理。将模型参数传递给任务调用：

```
Task(
  prompt="...",
  subagent_type="gsd-planner",
  model="{解析的模型}"  # "inherit"、"sonnet" 或 "haiku"
)
```

**注意：** Opus 级别的代理解析为 `"inherit"`（而不是 `"opus"`）。这会导致代理使用父会话的模型，避免可能与特定 opus 版本冲突的组织政策。

## 使用方法

1. 在编排开始时解析一次
2. 存储配置值
3. 生成时从表中查找每个代理的模型
4. 将模型参数传递给每个任务调用（值：`"inherit"`、`"sonnet"`、`"haiku"`）