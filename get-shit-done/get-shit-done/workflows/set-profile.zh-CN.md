<目的>
切换 GSD 代理使用的模型配置文件。控制每个代理使用哪个 Claude 模型，平衡质量与令牌消耗。
</目的>

<必读资料>
在开始前读取调用提示的 execution_context 引用的所有文件。
</必读资料>

<流程>

<step name="validate">
验证参数：

```
if $ARGUMENTS.profile not in ["quality", "balanced", "budget"]:
  错误：无效的配置文件 "$ARGUMENTS.profile"
  有效配置文件：quality, balanced, budget
  退出
```
</step>

<step name="ensure_and_load_config">
确保配置文件存在并加载当前状态：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-ensure-section
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

如果缺失，这会创建带有默认值的 `.planning/config.json` 并加载当前配置。
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
显示所选配置文件的确认信息和模型表：

```
✓ 模型配置文件设置为：$ARGUMENTS.profile

代理现在将使用：

[从 gsd-tools.cjs 中的 MODEL_PROFILES 显示所选配置文件的表]

示例：
| 代理 | 模型 |
|-------|-------|
| gsd-planner | opus |
| gsd-executor | sonnet |
| gsd-verifier | haiku |
| ... | ... |

新创建的代理将使用新配置文件。
```

映射配置文件名称：
- quality：使用 MODEL_PROFILES 中的 "quality" 列
- balanced：使用 MODEL_PROFILES 中的 "balanced" 列
- budget：使用 MODEL_PROFILES 中的 "budget" 列
</step>

</process>

<成功标准>
- [ ] 参数已验证
- [ ] 配置文件已确保存在
- [ ] 配置已使用新的 model_profile 更新
- [ ] 已显示带有模型的确认表
</成功标准>