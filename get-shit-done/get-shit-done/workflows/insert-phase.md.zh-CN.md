<purpose>
在现有整数阶段之间插入十进制阶段用于紧急发现的中途里程碑工作。使用十进制编号（72.1、72.2 等）来保留规划阶段的逻辑顺序，同时允许紧急插入而无需重新编号整个路线图。
</purpose>

<required_reading>
在开始之前，请阅读调用提示的执行_context中引用的所有文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 第一个参数：要插入后的整数阶段号
- 剩余参数：阶段描述

示例：`/gsd:insert-phase 72 修复关键认证错误`
-> after = 72
-> description = "修复关键认证错误"

如果参数缺失：

```
ERROR：阶段号和描述都是必需的
用法：/gsd:insert-phase <after> <description>
示例：/gsd:insert-phase 72 修复关键认证错误
```

退出。

验证第一个参数是整数。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${after_phase}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

检查 `roadmap_exists` 是否来自 init JSON。如果是 false：
```
ERROR：未找到路线图（.planning/ROADMAP.md）
```
退出。
</step>

<step name="insert_phase">
**将阶段插入委托给 gsd-tools：**

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase insert "${after_phase}" "${description}")
```

CLI 处理：
- 验证目标阶段存在于 ROADMAP.md 中
- 计算下一个十进制阶段号（检查磁盘上现有十进制）
- 从描述生成 slug
- 创建阶段目录（`.planning/phases/{N.M}-{slug}/`）
- 在目标阶段后插入阶段条目到 ROADMAP.md，带 (INSERTED) 标记

从结果中提取：`phase_number`, `after_phase`, `name`, `slug`, `directory`。
</step>

<step name="update_project_state">
更新 STATE.md 以反映插入的阶段：

1. 读取 `.planning/STATE.md`
2. 在 "## 累积上下文" → "### 路线图演变" 下添加条目：
   ```
   - 阶段 {decimal_phase} 在阶段 {after_phase} 后插入：{description}（紧急）
   ```

如果"路线图演变"部分不存在，则创建它。
</step>

<step name="completion">
呈现完成摘要：

```
阶段 {decimal_phase} 在阶段 {after_phase} 后插入：
- 描述：{description}
- 目录：.planning/phases/{decimal-phase}-{slug}/
- 状态：尚未规划
- 标记：(INSERTED) - 表示紧急工作

路线图已更新：.planning/ROADMAP.md
项目状态已更新：.planning/STATE.md

---

## 下一步

**阶段 {decimal_phase}：{description}** — 紧急插入

`/gsd:plan-phase {decimal_phase}`

<sub>`/clear` 首先 → 新鲜上下文窗口</sub>

---

**也可用：**
- 检查插入影响：查看阶段 {next_integer} 依赖项是否仍然合理
- 查看路线图

---
```
</step>

</process>

<anti_patterns>

- 不要为此计划外的里程碑末尾工作使用此（使用 /gsd:add-phase）
- 不要在阶段 1 前插入（十进制 0.1 没有意义）
- 不要重新编号现有阶段
- 不要修改目标阶段内容
- 不要创建计划（那是 /gsd:plan-phase）
- 不要提交更改（用户决定何时提交）
</anti_patterns>

<success_criteria>
阶段插入完成时：

- [ ] `gsd-tools phase insert` 成功执行
- [ ] 阶段目录已创建
- [ ] 路线图使用新阶段条目更新（包括 "(INSERTED)" 标记）
- [ ] STATE.md 使用路线图演变说明更新
- [ ] 用户了解下一步和依赖影响
</success_criteria>