<purpose>
切换 GSD 代理使用的模型配置文件。控制每个代理使用哪个 Claude 模型，平衡质量和令牌消耗。
</purpose>

<required_reading>
在开始之前，读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="validate">
验证参数：

```
if $ARGUMENTS.profile not in ["quality", "balanced", "budget"]:
  Error: 无效配置文件 "$ARGUMENTS.profile"
  有效配置文件：quality, balanced, budget
  EXIT
```
</step>

<step name="ensure_and_load_config">
确保配置文件存在并加载当前状态：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-ensure-section
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

如果缺失，使用默认值创建 `.planning/config.json` 并加载当前配置。
</step>

<step name="update_config">
从状态加载或直接读取当前配置：

更新 `model_profile` 字段：
```json
{
  "model_profile": "$ARGUMENTS.profile"
}
```

将更新的配置写回 `.planning/config.json`。
</step>

<step name="confirm">
使用模型表显示确认所选配置文件：

```
✓ 模型配置文件设置为：$ARGUMENTS.profile

代理将现在使用：

[从 gsd-tools.cjs 中的 MODEL_PROFILES 为所选配置文件显示表格]

示例：
| 代理 | 模型 |
|-------|-------|
| gsd-planner | opus |
| gsd-executor | sonnet |
| gsd-verifier | haiku |
| ... | ... |

下一个生成的代理将使用新配置文件。
```

映射配置文件名称：
- quality：从 MODEL_PROFILES 使用 "quality" 列
- balanced：从 MODEL_PROFILES 使用 "balanced" 列
- budget：从 MODEL_PROFILES 使用 "budget" 列
</step>

</process>

<success_criteria>
- [ ] 参数已验证
- [ ] 配置文件已确保
- [ ] 配置已使用新的 model_profile 更新
- [ ] 已显示带有模型表的确认
</success_criteria>