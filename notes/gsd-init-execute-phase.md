# gsd-tools init execute-phase 数据读取分析

> 深入分析 `init execute-phase` 命令的 JSON 输出字段来源与读取逻辑

## 命令用法

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase <phase>
```

**示例**:

```bash
# 在 GSD 项目目录下运行
cd /path/to/gsd-project
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase 1
```

## 输出结构

```json
{
  "executor_model": "sonnet",
  "verifier_model": "sonnet",
  "commit_docs": true,
  "parallelization": true,
  "branching_strategy": "none",
  "phase_branch_template": "gsd/phase-{phase}-{slug}",
  "milestone_branch_template": "gsd/{milestone}-{slug}",
  "verifier_enabled": true,
  "phase_found": true,
  "phase_dir": ".planning/phases/01-foundation",
  "phase_number": "01",
  "phase_name": "foundation",
  "phase_slug": "foundation",
  "phase_req_ids": "REQ-01, REQ-02",
  "plans": ["01-01", "01-02", "01-03"],
  "summaries": ["01-01", "01-02"],
  "incomplete_plans": ["01-03"],
  "plan_count": 3,
  "incomplete_count": 1,
  "branch_name": null,
  "milestone_version": "v1.0",
  "milestone_name": "MVP",
  "milestone_slug": "mvp",
  "state_exists": true,
  "roadmap_exists": true,
  "config_exists": true,
  "state_path": ".planning/STATE.md",
  "roadmap_path": ".planning/ROADMAP.md",
  "config_path": ".planning/config.json"
}
```

---

## 字段来源详解

### 一、配置类字段

来源文件: `.planning/config.json`

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `executor_model` | 执行器使用的模型 | sonnet |
| `verifier_model` | 验证器使用的模型 | sonnet |
| `commit_docs` | 是否自动提交文档 | true |
| `parallelization` | 是否并行执行 plans | true |
| `branching_strategy` | 分支策略 | none |
| `phase_branch_template` | Phase 分支命名模板 | gsd/phase-{phase}-{slug} |
| `milestone_branch_template` | Milestone 分支命名模板 | gsd/{milestone}-{slug} |
| `verifier_enabled` | 是否启用验证器 | true |

**读取函数**: `loadConfig(cwd)` in `lib/core.cjs`

```javascript
function loadConfig(cwd) {
  const configPath = path.join(cwd, '.planning', 'config.json');
  const defaults = {
    model_profile: 'balanced',
    commit_docs: true,
    branching_strategy: 'none',
    parallelization: true,
    // ...
  };

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}
```

---

### 二、Phase 信息字段

来源: 扫描 `.planning/phases/` 目录

| 字段 | 说明 | 生成逻辑 |
|------|------|---------|
| `phase_found` | 是否找到 phase | 目录存在则为 true |
| `phase_dir` | Phase 目录相对路径 | 如 `.planning/phases/01-foundation` |
| `phase_number` | Phase 编号 | 从目录名提取 `01` |
| `phase_name` | Phase 名称 | 从目录名提取 `foundation` |
| `phase_slug` | Phase slug | 名称转小写+连字符 |
| `phase_req_ids` | 需求 ID 列表 | 从 ROADMAP.md 提取 |
| `plans` | 所有 PLAN 文件 | 扫描 `*-PLAN.md` |
| `summaries` | 所有 SUMMARY 文件 | 扫描 `*-SUMMARY.md` |
| `incomplete_plans` | 未完成的 plans | plans 中排除已有 summaries |
| `plan_count` | Plan 总数 | plans.length |
| `incomplete_count` | 未完成数量 | incomplete_plans.length |

**读取函数**: `findPhaseInternal(cwd, phase)` in `lib/core.cjs`

```javascript
function findPhaseInternal(cwd, phase) {
  const phasesDir = path.join(cwd, '.planning', 'phases');
  const normalized = normalizePhaseName(phase);

  // Search current phases first
  const current = searchPhaseInDir(phasesDir, '.planning/phases', normalized);
  if (current) return current;

  // Search archived milestone phases (newest first)
  const milestonesDir = path.join(cwd, '.planning', 'milestones');
  // ...
}
```

**目录命名约定**:

```
.planning/phases/
├── 01-foundation/        # phase_number=01, phase_name=foundation
│   ├── 01-01-PLAN.md
│   ├── 01-02-PLAN.md
│   └── 01-03-PLAN.md
├── 02-features/
│   └── ...
└── 03-polish/
    └── ...
```

---

### 三、Milestone 信息字段

来源文件: `.planning/STATE.md`

| 字段 | 说明 |
|------|------|
| `milestone_version` | 当前 milestone 版本 (如 v1.0) |
| `milestone_name` | 当前 milestone 名称 (如 MVP) |
| `milestone_slug` | 名称转 slug |

**读取函数**: `getMilestoneInfo(cwd)` in `lib/core.cjs`

```javascript
function getMilestoneInfo(cwd) {
  try {
    const roadmap = fs.readFileSync(
      path.join(cwd, '.planning', 'ROADMAP.md'), 'utf-8'
    );

    // Extract from "## Milestone: vX.X - Name" heading
    const milestoneMatch = roadmap.match(/##\s+Milestone:\s+(v[\d.]+)\s*-\s*(.+)/);
    // ...
  }
}
```

---

### 四、文件存在性检查

直接检查文件是否存在:

| 字段 | 检查路径 |
|------|---------|
| `state_exists` | `.planning/STATE.md` |
| `roadmap_exists` | `.planning/ROADMAP.md` |
| `config_exists` | `.planning/config.json` |

**读取函数**: `pathExistsInternal(cwd, relativePath)`

```javascript
function pathExistsInternal(cwd, relativePath) {
  return fs.existsSync(path.join(cwd, relativePath));
}
```

---

### 五、分支名称字段

来源: 根据 `branching_strategy` 计算

| branching_strategy | branch_name 生成逻辑 |
|--------------------|-----------------------|
| `none` | `null` (不创建分支) |
| `phase` | 使用 `phase_branch_template`，替换 `{phase}` 和 `{slug}` |
| `milestone` | 使用 `milestone_branch_template`，替换 `{milestone}` 和 `{slug}` |

**示例**:
- `branching_strategy: phase` + `phase_number: 01` + `phase_slug: foundation`
  → `branch_name: gsd/phase-01-foundation`

---

## 数据流图

```
init execute-phase 1
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  loadConfig(cwd)                                                          │
│  └─ 读取 .planning/config.json                                            │
│     ├─ executor_model                                                     │
│     ├─ verifier_model                                                     │
│     ├─ parallelization                                                    │
│     └─ branching_strategy                                                 │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  findPhaseInternal(cwd, "1")                                              │
│  └─ 扫描 .planning/phases/ 目录                                           │
│     ├─ 查找匹配 "01-*" 或 "1-*" 的目录                                    │
│     ├─ 找到 .planning/phases/01-foundation                                │
│     ├─ 扫描目录内 *-PLAN.md 文件 → plans[]                                │
│     ├─ 扫描目录内 *-SUMMARY.md 文件 → summaries[]                         │
│     └─ 计算 incomplete_plans = plans - summaries                          │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  getMilestoneInfo(cwd)                                                    │
│  └─ 读取 .planning/ROADMAP.md                                             │
│     └─ 提取 "## Milestone: vX.X - Name" 标题                              │
│        ├─ milestone_version: "v1.0"                                        │
│        └─ milestone_name: "MVP"                                            │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  pathExistsInternal() 检查                                                │
│  ├─ .planning/STATE.md → state_exists                                     │
│  ├─ .planning/ROADMAP.md → roadmap_exists                                 │
│  └─ .planning/config.json → config_exists                                 │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
      返回 JSON
```

---

## 常见问题

### Q: 为什么 `phase_found` 返回 false？

**原因**: 当前目录不是 GSD 项目根目录

**解决**: 切换到包含 `.planning/` 目录的项目根目录

```bash
# 错误 - 在错误的目录
cd /some/other/project
node ... init execute-phase 1
# → phase_found: false

# 正确 - 在 GSD 项目根目录
cd /path/to/gsd-project
node ... init execute-phase 1
# → phase_found: true
```

### Q: Phase 编号如何匹配？

`findPhaseInternal` 支持多种格式:
- `1` → 匹配 `01-*` 或 `1-*`
- `01` → 匹配 `01-*`
- `1.1` → 匹配 `01.1-*` (decimal phase)

**匹配函数**: `normalizePhaseName(phase)`

```javascript
function normalizePhaseName(phase) {
  // "1" → "01"
  // "01" → "01"
  // "1.1" → "01.1"
}
```

---

## 源码位置

| 文件 | 路径 |
|------|------|
| 入口 | `~/.claude/get-shit-done/bin/gsd-tools.cjs` |
| Init 命令 | `~/.claude/get-shit-done/bin/lib/init.cjs` |
| 核心函数 | `~/.claude/get-shit-done/bin/lib/core.cjs` |

---

## 相关命令

| 命令 | 用途 |
|------|------|
| `init plan-phase <phase>` | plan-phase workflow 初始化 |
| `init new-project` | new-project workflow 初始化 |
| `init new-milestone` | new-milestone workflow 初始化 |
| `init progress` | 获取项目进度概览 |
| `init resume` | 恢复工作上下文 |

---

## 参考资料

- [INIT 变量注入模式](./reusable-designs/init-variable-injection.md)
- [execute-phase workflow 分析](./gsd-workflow-analysis.md)
