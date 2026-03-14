<overview>
TDD 关乎设计质量，而不是覆盖率指标。红-绿-重构周期迫使您在实现前思考行为，产生更清洁的接口和更可测试的代码。

**原则：** 如果您可以在编写 `fn` 之前将行为描述为 `expect(fn(input)).toBe(output)`，TDD 会改善结果。

**关键洞察：** TDD 工作本质上比标准任务更重 — 它需要 2-3 个执行周期（RED → GREEN → REFACTOR），每个周期都涉及文件读取、测试运行和潜在调试。TDD 功能获得专用计划以确保在整个周期中都有完整的上下文。
</overview>

<when_to_use_tdd>
## TDD 何时提高质量

**TDD 候选（创建 TDD 计划）：**
- 具有定义输入/输出的业务逻辑
- 具有请求/响应合同的 API 端点
- 数据转换、解析、格式化
- 验证规则和约束
- 具有可测试行为的算法
- 状态机和工作流
- 具有清晰规范的工具函数

**跳过 TDD（使用带 `type="auto"` 任务的常规计划）：**
- UI 布局、样式、视觉组件
- 配置更改
- 连接现有组件的粘合代码
- 一次性脚本和迁移
- 没有业务逻辑的简单 CRUD
- 探索性原型

**启发式：** 您可以在编写 `fn` 前编写 `expect(fn(input)).toBe(output)` 吗？
→ 是：创建 TDD 计划
→ 否：使用常规计划，如果需要稍后添加测试
</when_to_use_tdd>

<tdd_plan_structure>
## TDD 计划结构

每个 TDD 计划通过完整的 RED-GREEN-REFACTOR 周期实现**一个功能**。

```markdown
---
phase: XX-name
plan: NN
type: tdd
---

<objective>
[什么功能和为什么]
目的：此功能 TDD 的设计优势
输出：工作、测试过的功能
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@relevant/source/files.ts
</context>

<feature>
  <name>[功能名称]</name>
  <files>[源文件，测试文件]</files>
  <behavior>
    [预期行为，可测试术语]
    案例：输入 → 预期输出
  </behavior>
  <implementation>[测试通过后如何实现]</implementation>
</feature>

<verification>
[证明功能工作的测试命令]
</verification>

<success_criteria>
- 编写并提交失败的测试
- 实现通过测试
- 重构完成（如果需要）
- 所有 2-3 个提交都存在
</success_criteria>

<output>
完成后，创建 SUMMARY.md，包含：
- RED：编写了什么测试，为什么失败
- GREEN：什么实现使其通过
- REFACTOR：进行了什么清理（如果有）
- 提交：产生的提交列表
</output>
```

**每个 TDD 计划一个功能。** 如果功能足够简单可以批量，它们就足够简单可以跳过 TDD — 使用常规计划，稍后添加测试。
</tdd_plan_structure>

<execution_flow>
## 红-绿-重构周期

**RED - 编写失败测试：**
1. 创建遵循项目约定的测试文件
2. 编写描述预期行为的测试（来自 `<behavior>` 元素）
3. 运行测试 - 必须失败
4. 如果测试通过：功能已存在或测试错误。调查。
5. 提交：`test({阶段}-{计划}): 为 [功能] 添加失败测试`

**GREEN - 实现通过：**
1. 编写使测试通过的最小代码
2. 不要聪明，不要优化 — 只是让它工作
3. 运行测试 - 必须
通过
4. 提交：`feat({阶段}-{计划}): 实现 [功能]`

**REFACTOR（如果需要）：**
1. 如果存在明显改进，清理实现
2. 运行测试 - 仍然必须通过
3. 仅在有更改时提交：`refactor({阶段}-{计划}): 清理 [功能]`

**结果：** 每个 TDD 计划产生 2-3 个原子提交。
</execution_flow>

<test_quality>
## 好测试 vs 坏测试

**测试行为，而不是实现：**
- 好："返回格式化的日期字符串"
- 坏："使用正确参数调用 formatDate 辅助函数"
- 测试应该能在重构后存活

**每个测试一个概念：**
- 好：为有效输入、空输入、格式错误输入的单独测试
- 坏：单个测试使用多个断言检查所有边缘情况

**描述性名称：**
- 好："应该拒绝空邮箱", "为无效 ID 返回 null"
- 坏："test1", "处理错误", "正确工作"

**不要实现细节：**
- 好：测试公共 API，可观察行为
- 坏：模拟内部，测试私有方法，断言内部状态
</test_quality>

<framework_setup>
## 测试框架设置（如果不存在）

执行 TDD 计划但未配置测试框架时，将其作为 RED 阶段的一部分设置：

**1. 检测项目类型：**
```bash
# JavaScript/TypeScript
if [ -f package.json ]; then echo "node"; fi

# Python
if [ -f requirements.txt ] || [ -f pyproject.toml ]; then echo "python"; fi

# Go
if [ -f go.mod ]; then echo "go"; fi

# Rust
if [ -f Cargo.toml ]; then echo "rust"; fi
```

**2. 安装最小框架：**

| 项目 | 框架 | 安装 |
|------|------|------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | 内置 |
| Rust | cargo test | 内置 |

**3. 如需要创建配置：**
- Jest：`jest.config.js` 使用 ts-jest 预设
- Vitest：`vitest.config.ts` 使用测试全局变量
- pytest：`pytest.ini` 或 `pyproject.toml` 部分

**4. 验证设置：**
```bash
# 运行空测试套件 - 应该以 0 个测试通过
npm test  # Node
pytest    # Python
go test ./...  # Go
cargo test    # Rust
```

**5. 创建第一个测试文件：**
遵循项目的测试位置约定：
- 源代码旁边的 `*.test.ts` / `*.spec.ts`
- `__tests__/` 目录
- 根目录的 `tests/` 目录

框架设置是一次性成本，包含在第一个 TDD 计划的 RED 阶段中。
</framework_setup>

<error_handling>
## 错误处理

**RED 阶段测试不失败：**
- 功能可能已存在 - 调查
- 测试可能错误（没有测试您认为的内容）
- 在继续前修复

**GREEN 阶段测试不通过：**
- 调试实现
- 不要跳到重构
- 继续迭代直到变绿

**REFACTOR 阶段测试失败：**
- 撤销重构
- 提交过早
- 更小步骤重构

**不相关的测试失败：**
- 停止并调查
- 可能表示耦合问题
- 在继续前修复
</error_handling>

<commit_pattern>
## TDD 计划的提交模式

TDD 计划产生 2-3 个原子提交（每个阶段一个）：

```
test(08-02): 为邮箱验证添加失败测试

- 测试有效邮箱格式被接受
- 测试无效格式被拒绝
- 测试空输入处理

feat(08-02): 实现邮箱验证

- 正则表达式匹配 RFC 5322
- 返回有效性布尔值
- 处理边缘情况（空、null）

refactor(08-02): 提取正则表达式到常量（可选）

- 将模式移动到 EMAIL_REGEX 常量
- 无行为更改
- 测试仍然通过
```

**与常规计划对比：**
- 常规计划：每个任务 1 个提交，每计划 2-4 个提交
- TDD 计划：单个功能 2-3 个提交

两者都遵循相同格式：`{type}({阶段}-{计划}): {描述}`

**优势：**
- 每个提交可独立撤销
- Git bisect 在提交级别工作
- 显示 TDD 纪律的清晰历史
- 与整体提交策略一致
</commit_pattern>

<context_budget>
## 上下文预算

TDD 计划针对 **~40% 上下文使用率**（低于常规计划的 ~50%）。

为什么更低：
- RED 阶段：编写测试，运行测试，潜在调试为什么没有失败
- GREEN 阶段：实现，运行测试，潜在迭代失败
- REFACTOR 阶段：修改代码，运行测试，验证无回归

每个阶段都涉及读取文件、运行命令、分析输出。来回本质上比线性任务执行更重。

单一功能重点确保整个周期的完全质量。
</context_budget>