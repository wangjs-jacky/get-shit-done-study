<purpose>
验证 `.planning/` 目录完整性并报告可操作问题。检查缺失文件、无效配置、不一致状态和孤立计划。可选地自动修复可修复问题。
</purpose>

<required_reading>
在开始之前，请阅读调用提示的执行_context中引用的所有文件。
</required_reading>

<process>

<step name="parse_args">
**解析参数：**

检查命令参数中是否存在 `--repair` 标志。

```
REPAIR_FLAG=""
if arguments contain "--repair"; then
  REPAIR_FLAG="--repair"
fi
```
</step>

<step name="run_health_check">
**运行健康验证：**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" validate health $REPAIR_FLAG
```

解析 JSON 输出：
- `status`: "healthy" | "degraded" | "broken"
- `errors[]`: 关键问题（代码，消息，修复，可修复性）
- `warnings[]`: 非关键问题
- `info[]`: 信息性注释
- `repairable_count`: 可自动修复问题数量
- `repairs_performed[]`: 如果使用了 --repair，则执行的操作
</step>

<step name="format_output">
**格式化和显示结果：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD 健康检查
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

状态: 健康 | 降级 | 损坏
错误: N | 警告: N | 信息: N
```

**如果执行了修复：**
```
## 执行的修复

- ✓ config.json: 使用默认值创建
- ✓ STATE.md: 从路线图重新生成
```

**如果存在错误：**
```
## 错误

- [E001] config.json: 第 5 行 JSON 解析错误
  修复: 运行 /gsd:health --repair 重置为默认值

- [E002] PROJECT.md 未找到
  修复: 运行 /gsd:new-project 创建
```

**如果存在警告：**
```
## 警告

- [W001] STATE.md 引用阶段 5，但只存在阶段 1-3
  修复: 运行 /gsd:health --repair 重新生成

- [W005] 阶段目录 "1-setup" 不符合 NN-name 格式
  修复: 重命名以匹配模式（例如，01-setup）
```

**如果存在信息：**
```
## 信息

- [I001] 02-implementation/02-01-PLAN.md 没有 SUMMARY.md
  注释: 可能正在进行中
```

**页脚（如果存在可修复问题且未使用 --repair）：**
```
---
N 个问题可以自动修复。运行: /gsd:health --repair
```
</step>

<step name="offer_repair">
**如果存在可修复问题且未使用 --repair：**

询问用户是否要运行修复：

```
您是否要运行 /gsd:health --repair 来自动修复 N 个问题？
```

如果是，重新运行带 --repair 标志的命令并显示结果。
</step>

<step name="verify_repairs">
**如果执行了修复：**

不带 --repair 重新运行健康检查以确认问题已解决：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" validate health
```

报告最终状态。
</step>

</process>

<error_codes>

| 代码 | 严重程度 | 描述 | 可修复 |
|------|----------|------|--------|
| E001 | 错误 | .planning/ 目录未找到 | 否 |
| E002 | 错误 | PROJECT.md 未找到 | 否 |
| E003 | 错误 | ROADMAP.md 未找到 | 否 |
| E004 | 错误 | STATE.md 未找到 | 是 |
| E005 | 错误 | config.json 解析错误 | 是 |
| W001 | 警告 | PROJECT.md 缺少必需部分 | 否 |
| W002 | 警告 | STATE.md 引用无效阶段 | 是 |
| W003 | 警告 | config.json 未找到 | 是 |
| W004 | 警告 | config.json 字段值无效 | 否 |
| W005 | 警告 | 阶段目录命名不匹配 | 否 |
| W006 | 警告 | 阶段在 ROADMAP 中但无目录 | 否 |
| W007 | 警告 | 阶段在磁盘上但不在 ROADMAP 中 | 否 |
| W008 | 警告 | config.json: workflow.nyquist_validation 缺失（默认启用但代理可能跳过） | 是 |
| W009 | 警告 | 阶段在 RESEARCH.md 中有验证架构但无 VALIDATION.md | 否 |
| I001 | 信息 | 没有 SUMMARY 的计划（可能正在进行中） | 否 |

</error_codes>

<repair_actions>

| 操作 | 效果 | 风险 |
|--------|------|------|
| createConfig | 使用默认值创建 config.json | 无 |
| resetConfig | 删除 + 重新创建 config.json | 失去自定义设置 |
| regenerateState | 从 ROADMAP 结构创建 STATE.md | 失去会话历史 |
| addNyquistKey | 向 config.json 添加 workflow.nyquist_validation: true | 无 — 匹配现有默认值 |

**不可修复（风险太高）：**
- PROJECT.md, ROADMAP.md 内容
- 阶段目录重命名
- 孤立计划清理

</repair_actions>