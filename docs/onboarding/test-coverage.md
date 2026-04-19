# 测试覆盖报告

> 本文档对 get-shit-done-study 项目的两个子项目（GSD 框架 + Demo 应用）进行全面测试分析，涵盖测试架构、覆盖矩阵、未测试路径及改进建议。

## 目录

- [1. 测试架构概览](#1-测试架构概览)
- [2. GSD 框架测试矩阵](#2-gsd-框架测试矩阵)
- [3. Demo 项目测试矩阵](#3-demo-项目测试矩阵)
- [4. 未测试的关键路径](#4-未测试的关键路径)
- [5. 如何运行测试](#5-如何运行测试)
- [6. 如何添加新测试](#6-如何添加新测试)
- [7. 覆盖率提升建议](#7-覆盖率提升建议)

---

## 1. 测试架构概览

### 1.1 GSD 框架（get-shit-done/）

| 项目 | 详情 |
|------|------|
| **测试框架** | Node.js 内置测试运行器（`node:test`） |
| **断言库** | Node.js 内置 `node:assert` |
| **文件格式** | CommonJS（`.test.cjs`） |
| **测试数量** | 16 个测试文件，共 **551** 个测试用例 |
| **覆盖率工具** | `c8`（V8 原生覆盖率） |
| **覆盖率目标** | 行覆盖率 >= 70%（`--lines 70`） |
| **覆盖范围** | `get-shit-done/bin/lib/*.cjs` |
| **测试运行方式** | `node --test tests/*.test.cjs`（通过 `scripts/run-tests.cjs` 封装） |

**测试辅助工具**（`tests/helpers.cjs`）：

- `runGsdTools(args, cwd)` — 通过 `execSync` / `execFileSync` 执行 `gsd-tools.cjs` CLI 命令
- `createTempProject()` — 创建临时 `.planning/phases` 目录结构
- `createTempGitProject()` — 创建临时目录并初始化 Git 仓库
- `cleanup(tmpDir)` — 清理临时目录

### 1.2 Demo 项目（demo-by-gsd/）

| 项目 | 详情 |
|------|------|
| **测试框架** | Vitest 3.x |
| **组件测试** | @testing-library/react + jsdom 环境 |
| **文件格式** | TypeScript（`.test.ts` / `.test.tsx`） |
| **测试数量** | 13 个测试文件，共 **105** 个测试用例 |
| **测试配置** | `vitest.config.ts`（jsdom 环境，globals 模式） |
| **Setup 文件** | `src/test/setup.ts`（引入 `@testing-library/jest-dom`） |
| **测试匹配** | `src/**/*.test.ts` + `src/**/*.test.tsx` |

**测试文件分布**：

```
src/
├── components/__tests__/     # 8 个组件测试
├── context/__tests__/        # 1 个 Context 测试
├── data/                     # 2 个数据层测试（styles.test.ts, validate.test.ts）
├── types/                    # 1 个类型测试（style.test.ts）
└── test/                     # 1 个性能测试（performance.test.tsx）
```

---

## 2. GSD 框架测试矩阵

### 2.1 测试文件覆盖范围

| 测试文件 | 测试数 | 覆盖模块 | 测试内容概要 |
|----------|--------|----------|-------------|
| `core.test.cjs` | 72 | `bin/lib/core.cjs` | 配置加载、模型解析、slug 生成、阶段号比较/归一化、文件读取、里程碑信息提取、里程碑阶段过滤 |
| `state.test.cjs` | 66 | `bin/lib/state.cjs` | 状态快照、状态 JSON、状态变更（patch/update）、计划推进、指标记录、进度更新、阻塞项管理、会话记录、frontmatter 同步、里程碑范围阶段计数 |
| `phase.test.cjs` | 60 | `bin/lib/phase.cjs` | 阶段列表/排序、小数阶段、阶段计划索引、XML 格式解析、阶段添加/插入/移除/完成、里程碑范围下一阶段检测 |
| `init.test.cjs` | 47 | `bin/lib/init.cjs` | 初始化命令（execute-phase/plan-phase/progress/phase-op/todos/milestone-op/quick/map-codebase/new-project/new-milestone）、阶段需求 ID 提取 |
| `commands.test.cjs` | 56 | `bin/lib/commands.cjs` | history-digest、依赖图提取、技术栈收集、模板命令 |
| `verify.test.cjs` | 42 | `bin/lib/verify.cjs` | 一致性验证、计划结构验证（frontmatter + XML tasks）、阶段完整性、摘要验证（SUMMARY.md）、引用验证、提交验证、artifacts 验证、key-links 验证 |
| `codex-config.test.cjs` | 33 | `bin/install.js` | Codex 适配器头、Claude→Codex 转换、config.toml 生成/合并、per-agent .toml 生成、卸载清理 |
| `roadmap.test.cjs` | 24 | `bin/lib/roadmap.cjs` | 路线图阶段提取（get-phase）、路线图分析（analyze）、磁盘状态检测、里程碑提取、缺失阶段详情检测、成功标准提取、计划进度更新 |
| `frontmatter.test.cjs` | 32 | `bin/lib/frontmatter.cjs` | YAML 解析（extract/reconstruct/splice）、内联数组、块数组、嵌套对象、引号处理、Round-trip 一致性、parseMustHavesBlock |
| `milestone.test.cjs` | 20 | `bin/lib/milestone.cjs` | 里程碑完成归档、MILESTONES.md 生成、反向时间排序、阶段目录归档、需求数量更新、里程碑范围统计 |
| `config.test.cjs` | 20 | `bin/lib/config.cjs` | config-ensure-section、config-set（类型转换、嵌套键、未知键拒绝）、config-get |
| `dispatcher.test.cjs` | 22 | `bin/gsd-tools.cjs` | 无命令/未知命令错误、--cwd 解析、所有子命令组的未知子命令错误、find-phase、init resume/verify-work、roadmap update-plan-progress、summary-extract |
| `verify-health.test.cjs` | 26 | `bin/lib/verify.cjs` | 8 项健康检查（E001-E005, W001-W009）、健康状态判定（healthy/degraded/broken）、--repair 修复路径 |
| `frontmatter-cli.test.cjs` | 20 | CLI frontmatter 命令 | frontmatter get/set/merge/validate 四个子命令的集成测试 |
| `agent-frontmatter.test.cjs` | 10 | `agents/*.md` | 所有 Agent 文件的 frontmatter 验证（anti-heredoc、skills 字段、注释钩子、spawn 类型一致性） |
| `gemini-config.test.cjs` | 1 | `bin/install.js` | Claude→Gemini Agent 转换（字段过滤、工具映射、shell 变量转义） |

**总计：551 个测试用例**

### 2.2 回归测试追踪

测试文件中包含多个已记录的回归测试：

| 编号 | 描述 | 所在文件 |
|------|------|----------|
| REG-01 | `loadConfig` 遗漏 `model_overrides` 返回值 | `core.test.cjs` |
| REG-02 | `getRoadmapPhaseInternal` 未从 `module.exports` 导出 | `core.test.cjs` |
| REG-03 | `verify-summary` 无 self-check 时返回 `search(-1)` 异常 | `verify.test.cjs` |
| REG-04 | 手写 YAML 解析器对内联数组中引号内逗号的处理缺陷 | `frontmatter.test.cjs` |

---

## 3. Demo 项目测试矩阵

### 3.1 组件测试覆盖

| 源文件 | 测试文件 | 测试数 | 覆盖状态 |
|--------|----------|--------|----------|
| `components/CopyButton.tsx` | `components/__tests__/CopyButton.test.tsx` | 7 | 已覆盖 |
| `components/Gallery.tsx` | `components/__tests__/Gallery.test.tsx` | 6 | 已覆盖 |
| `components/PhoneFrame.tsx` | `components/__tests__/PhoneFrame.test.tsx` | 5 | 已覆盖 |
| `components/PomodoroTimer.tsx` | `components/__tests__/PomodoroTimer.test.tsx` | 8 | 已覆盖 |
| `components/PreviewPane.tsx` | `components/__tests__/PreviewPane.test.tsx` | 6 | 已覆盖 |
| `components/Toast.tsx` | `components/__tests__/Toast.test.tsx` | 7 | 已覆盖 |
| `components/StyleCard.astro` | `components/__tests__/StyleCard.test.ts` | 9 | 已覆盖 |
| `components/StyleList.astro` | `components/__tests__/StyleList.test.ts` | 11 | 已覆盖 |
| `context/ToastContext.tsx` | `context/__tests__/ToastContext.test.tsx` | 6 | 已覆盖 |
| `data/styles.json` | `data/styles.test.ts` | 10 | 已覆盖 |
| `data/validate.ts` | `data/validate.test.ts` | 20 | 已覆盖 |
| `types/style.ts` | `types/style.test.ts` | 6 | 已覆盖 |

### 3.2 跨组件集成测试

| 测试文件 | 测试数 | 测试内容 |
|----------|--------|----------|
| `test/performance.test.tsx` | 4 | 渲染性能（Gallery+Preview 联动）、大列表渲染、快速切换 |

### 3.3 未测试文件

| 源文件 | 类型 | 状态 |
|--------|------|------|
| `components/Layout.astro` | Astro 布局组件 | 无测试（Astro 组件测试需要特殊配置） |
| `pages/index.astro` | Astro 页面 | 无测试（页面级集成测试） |
| `styles/global.css` | 样式文件 | 无测试（CSS 通常不需要单元测试） |

**总计：105 个测试用例，12/15 个源文件有对应测试**

---

## 4. 未测试的关键路径

### 4.1 GSD 框架未测试路径

| 优先级 | 未覆盖路径 | 说明 |
|--------|-----------|------|
| **高** | `bin/lib/commands.cjs` — todo 命令组 | 添加/完成/列出待办事项的完整流程 |
| **高** | `bin/lib/commands.cjs` — pause/resume 工作流 | 暂停和恢复执行的完整状态转换 |
| **高** | `bin/lib/commands.cjs` — debug 命令 | 调试模式下的行为 |
| **中** | `bin/lib/commands.cjs` — map-codebase 执行路径 | 代码库映射的文件扫描和生成逻辑 |
| **中** | `bin/lib/commands.cjs` — health 检查修复的边界情况 | 多个 repair 同时执行时的交互 |
| **中** | `bin/install.js` — 完整安装/卸载流程 | 符号链接创建、配置合并、钩子安装的端到端流程 |
| **低** | `bin/install.js` — Gemini 集成测试 | 目前仅 1 个测试，Gemini Agent 转换的更多边界情况 |
| **低** | `agents/*.md` — 工作流执行逻辑 | Agent 文件的 system prompt 内容验证 |

### 4.2 Demo 项目未测试路径

| 优先级 | 未覆盖路径 | 说明 |
|--------|-----------|------|
| **中** | Astro 组件（Layout.astro、StyleCard.astro） | 需要 Astro 测试环境配置 |
| **中** | 页面级集成测试（index.astro） | 组件间数据流和路由 |
| **低** | CSS 样式验证 | 可通过视觉回归测试覆盖 |

---

## 5. 如何运行测试

### 5.1 GSD 框架测试

```bash
# 进入 GSD 目录
cd get-shit-done

# 运行所有测试
npm test

# 运行带覆盖率的测试（目标: 行覆盖率 >= 70%）
npm run test:coverage

# 运行单个测试文件
node --test tests/core.test.cjs

# 运行特定 describe 组（使用 --test-name-pattern）
node --test --test-name-pattern "loadConfig" tests/core.test.cjs
```

**预期输出**：

```
✓ core.test.cjs > loadConfig > returns defaults when config.json is missing
✓ core.test.cjs > loadConfig > reads model_profile from config.json
...
ℹ tests  551
ℹ tests  passed  551
ℹ tests  skipped  0
ℹ tests  failed  0
```

**覆盖率输出示例**：

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line Ids
----------|---------|----------|---------|---------|-------------------
All files |   78.5% |   72.3%  |  85.1%  |  76.8%  |
 core.cjs |   85.2% |   80.1%  |  92.3%  |  84.5%  | 142-148, 256
 state.cjs|   72.1% |   65.4%  |  78.9%  |  70.2%  | 89-95, 210-215
----------|---------|----------|---------|---------|-------------------
```

### 5.2 Demo 项目测试

```bash
# 进入 Demo 目录
cd demo-by-gsd

# 安装依赖（首次）
npm install

# 运行所有测试（单次）
npm test

# 运行测试（watch 模式）
npm run test:watch

# 运行特定测试文件
npx vitest run src/components/__tests__/Gallery.test.tsx

# 运行带 UI 的测试
npx vitest --ui
```

**预期输出**：

```
 ✓ src/components/__tests__/Gallery.test.tsx (6 tests) 45ms
 ✓ src/components/__tests__/CopyButton.test.tsx (7 tests) 32ms
 ✓ src/data/validate.test.ts (20 tests) 18ms
 ...
 Test Files  13 passed (13)
   Tests  105 passed (105)
  Start at  ...
  Duration  2.5s
```

---

## 6. 如何添加新测试

### 6.1 GSD 框架 — 添加测试

**步骤**：

1. 在 `get-shit-done/tests/` 下创建 `your-module.test.cjs` 文件
2. 使用以下模板：

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

describe('your-feature command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('does something expected', () => {
    // 设置: 创建必要的文件结构
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'ROADMAP.md'),
      '# Roadmap\n\n### Phase 1: Test\n**Goal:** Test\n'
    );

    // 执行: 运行 CLI 命令
    const result = runGsdTools('your-command args', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    // 断言: 验证 JSON 输出
    const output = JSON.parse(result.output);
    assert.strictEqual(output.key, 'expected value');
  });
});
```

3. 文件名以 `.test.cjs` 结尾会自动被 `scripts/run-tests.cjs` 发现
4. 运行 `npm test` 验证

**注意事项**：

- 使用 `createTempProject()` 创建临时项目结构，不要使用真实项目目录
- 使用 `createTempGitProject()` 当测试需要 Git 仓库时
- 测试 Dollar 符号 (`$`) 内容时，使用数组形式参数避免 Shell 解释：`runGsdTools(['state', 'add-decision', '--summary', '$100 item'], tmpDir)`
- 在 `afterEach` 中始终调用 `cleanup(tmpDir)` 清理临时目录

### 6.2 Demo 项目 — 添加测试

**步骤**：

1. 在对应目录创建测试文件：
   - 组件测试: `src/components/__tests__/ComponentName.test.tsx`
   - 工具函数测试: `src/utils/__tests__/utilName.test.ts`
   - 数据层测试: `src/data/moduleName.test.ts`

2. 使用以下模板：

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent prop="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    await user.click(screen.getByRole('button'));
    // 断言交互后的状态
  });
});
```

3. 测试文件匹配模式 `src/**/*.test.{ts,tsx}` 由 `vitest.config.ts` 自动包含
4. 运行 `npm test` 验证

---

## 7. 覆盖率提升建议

### 优先级排序

#### P0 — 立即行动（影响核心工作流）

| 编号 | 建议 | 预期收益 |
|------|------|----------|
| 1 | 为 `state.cjs` 中的 frontmatter 同步路径添加边界测试 | 覆盖 STATE.md 多次写入的幂等性场景 |
| 2 | 为 `phase complete` 添加多里程碑阶段的端到端测试 | 验证里程碑完成时的阶段范围正确性 |
| 3 | 为 `verify-summary` 的文件检查逻辑添加更多边界用例 | 覆盖特殊文件路径、编码问题 |

#### P1 — 短期改进（补充缺失覆盖）

| 编号 | 建议 | 预期收益 |
|------|------|----------|
| 4 | 为 `commands.cjs` 中的 todo 命令组添加测试 | 新增约 15-20 个测试用例，覆盖待办管理流程 |
| 5 | 为 `commands.cjs` 中的 pause/resume 命令添加测试 | 新增约 10-15 个测试用例，覆盖暂停恢复流程 |
| 6 | 为 `frontmatter.cjs` 的 REG-04 缺陷添加修复验证测试 | 文档化当前行为，为未来修复提供回归保护 |
| 7 | 为 `install.js` 的安装/卸载端到端流程添加测试 | 新增约 10 个测试用例 |

#### P2 — 中期优化（提升覆盖率到 85%+）

| 编号 | 建议 | 预期收益 |
|------|------|----------|
| 8 | 为 Demo 项目添加 Astro 组件测试 | 需要 `@astrojs/testing` 或类似库 |
| 9 | 为 Demo 项目添加端到端视觉回归测试 | 使用 Playwright/Cypress 验证页面渲染 |
| 10 | 为 `gemini-config.test.cjs` 扩展更多转换场景 | 从 1 个测试扩展到 10+，覆盖更多边界情况 |
| 11 | 为 `codex-config.test.cjs` 添加多 Agent 并发安装测试 | 验证多个 Agent 同时安装时的配置合并 |

#### P3 — 长期投资（持续质量保障）

| 编号 | 建议 | 预期收益 |
|------|------|----------|
| 12 | 引入 Mutation Testing（如 Stryker） | 评估测试质量，而非仅仅数量 |
| 13 | 在 CI 中强制覆盖率门禁（80%+） | 防止覆盖率回退 |
| 14 | 为 Demo 项目添加 Snapshot Testing | 防止组件输出意外变化 |
| 15 | 建立 GSD 框架性能基准测试 | 监控 CLI 命令执行时间 |

---

## 附录：测试统计摘要

| 指标 | GSD 框架 | Demo 项目 | 合计 |
|------|----------|-----------|------|
| 测试文件数 | 16 | 13 | **29** |
| 测试用例数 | 551 | 105 | **656** |
| 测试框架 | node:test | Vitest 3.x | — |
| 断言库 | node:assert | Vitest expect | — |
| 覆盖率工具 | c8 | — | — |
| 覆盖率目标 | >= 70% 行 | — | — |
| 源文件覆盖 | bin/lib/*.cjs | 12/15 文件 | — |
| 回归测试 | 4 (REG-01~04) | 0 | **4** |
