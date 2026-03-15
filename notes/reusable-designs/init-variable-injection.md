# INIT 变量注入模式

**来源**：get-shit-done / workflows/*.md
**发现时间**：2025-03-15
**关键词**：#bash #json #cli #context-efficiency #variable-injection

## 核心思想

在 bash 脚本中，通过 CLI 工具一次性加载所有上下文到变量，然后用 jq 按需提取字段。避免多次读取文件，保持 context 精简。

## 设计要点

### 1. 一次性加载上下文

```bash
# 在 workflow 的第一步注入 INIT 变量
INIT=$(node "/path/to/cli-tool.cjs" init <workflow-type> "<args>")

# 处理 @file: 协议（大数据时 CLI 会写入临时文件）
if [[ "$INIT" == @file:* ]]; then
  INIT=$(cat "${INIT#@file:}")
fi
```

### 2. CLI 工具返回聚合 JSON

CLI 工具（如 `gsd-tools.cjs`）负责：
- 读取多个文件（STATE.md, ROADMAP.md, config.json, 目录结构等）
- 聚合成一个 JSON 对象
- 返回给调用者

```json
{
  "phase_dir": ".planning/phases/01-foundation",
  "phase_number": 1,
  "plan_count": 3,
  "incomplete_count": 2,
  "executor_model": "sonnet",
  "parallelization": true,
  "state_path": ".planning/STATE.md",
  "roadmap_path": ".planning/ROADMAP.md",
  ...
}
```

### 3. 用 jq 按需提取

```bash
# 提取单个字段
phase_dir=$(echo "$INIT" | jq -r '.phase_dir')
plan_count=$(echo "$INIT" | jq -r '.plan_count')

# 使用提取的值
echo "Found ${plan_count} plans in ${phase_dir}"
```

### 4. @file: 协议处理大数据

当 JSON 超过 CLI 参数限制时：

```bash
# CLI 返回文件路径而不是 JSON 字符串
INIT='@file:/tmp/gsd-init-abc123.json'

# 脚本检测并读取文件
if [[ "$INIT" == @file:* ]]; then
  INIT=$(cat "${INIT#@file:}")
fi
```

## 代码示例

### 完整模式

```bash
#!/bin/bash

# Step 1: 初始化 - 一次性加载所有上下文
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then
  INIT=$(cat "${INIT#@file:}")
fi

# Step 2: 解析 JSON 提取需要的字段
phase_dir=$(echo "$INIT" | jq -r '.phase_dir')
phase_number=$(echo "$INIT" | jq -r '.phase_number')
plan_count=$(echo "$INIT" | jq -r '.plan_count')
incomplete_count=$(echo "$INIT" | jq -r '.incomplete_count')
executor_model=$(echo "$INIT" | jq -r '.executor_model')
parallelization=$(echo "$INIT" | jq -r '.parallelization')
state_exists=$(echo "$INIT" | jq -r '.state_exists')
roadmap_exists=$(echo "$INIT" | jq -r '.roadmap_exists')

# Step 3: 错误检查
if [[ "$state_exists" == "false" ]]; then
  echo "Error: STATE.md not found"
  exit 1
fi

# Step 4: 使用提取的值
echo "Phase ${phase_number}: Found ${plan_count} plans (${incomplete_count} incomplete)"
echo "Using ${executor_model} model, parallelization: ${parallelization}"
```

### CLI 工具端（Node.js 示例）

```javascript
// cli-tool.cjs
const fs = require('fs');
const path = require('path');

function init(workflowType, arg) {
  const cwd = process.cwd();

  // 聚合读取多个文件
  const result = {
    state_exists: fs.existsSync(path.join(cwd, '.planning/STATE.md')),
    roadmap_exists: fs.existsSync(path.join(cwd, '.planning/ROADMAP.md')),
    config: {},
    phases: [],
  };

  // 读取 config.json
  const configPath = path.join(cwd, '.planning/config.json');
  if (fs.existsSync(configPath)) {
    result.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  // 扫描 phases 目录
  const phasesDir = path.join(cwd, '.planning/phases');
  if (fs.existsSync(phasesDir)) {
    result.phases = fs.readdirSync(phasesDir).filter(f => f.match(/^\d+/));
  }

  // 返回 JSON
  const json = JSON.stringify(result);

  // 如果太大，写入临时文件
  if (json.length > 10000) {
    const tmpFile = `/tmp/cli-init-${Date.now()}.json`;
    fs.writeFileSync(tmpFile, json);
    console.log(`@file:${tmpFile}`);
  } else {
    console.log(json);
  }
}
```

## 对比传统做法

| 传统做法 | INIT 注入模式 |
|----------|---------------|
| 多次读取文件 | 一次读取所有 |
| 每次调用都要 context | 只在 init 时需要 context |
| AI 代理 context 持续增长 | AI 代理 context 保持精简 |
| 文件分散在各步骤读取 | 文件集中在 CLI 工具读取 |

### 传统做法（不好）

```bash
# Step 1: 读取 STATE.md
STATE=$(cat .planning/STATE.md)
phase=$(grep "current_phase:" .planning/STATE.md | head -1)

# Step 2: 读取 ROADMAP.md
ROADMAP=$(cat .planning/ROADMAP.md)
plan_count=$(grep -c "PLAN.md" .planning/ROADMAP.md)

# Step 3: 读取 config.json
CONFIG=$(cat .planning/config.json)
model=$(echo "$CONFIG" | jq '.model')

# 问题：3 次文件读取，3 次 context 消耗
```

### INIT 注入模式（好）

```bash
# 一次调用获取所有
INIT=$(node cli-tool.cjs init execute-phase "1")
phase=$(echo "$INIT" | jq -r '.phase_number')
plan_count=$(echo "$INIT" | jq -r '.plan_count')
model=$(echo "$INIT" | jq -r '.executor_model')

# 优点：1 次文件读取，1 次 context 消耗
```

## 可能的复用场景

- [ ] jacky-skills 中的复杂 workflow 命令
- [ ] 需要读取多个配置文件的 CLI 工具
- [ ] AI 代理调用的 bash 脚本（需要保持 context 精简）
- [ ] 任何需要聚合多个数据源的初始化场景

## 复用记录

- {日期} 在 {项目} 中复用：{效果如何}

## 前置条件

- 系统安装 `jq`（`brew install jq`）
- CLI 工具支持 `init` 命令

## 参考资料

- GSD workflows: `~/.claude/get-shit-done/workflows/*.md`
- gsd-tools.cjs: `~/.claude/get-shit-done/bin/gsd-tools.cjs`
- jq 文档: https://stedolan.github.io/jq/
