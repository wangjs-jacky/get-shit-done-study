<purpose>
基于已完成阶段的 SUMMARY.md、CONTEXT.md 和实现生成单元测试和端到端测试。将每个修改的文件分类为 TDD（单元）、E2E（浏览器）或 Skip 类别，向用户呈现测试计划供批准，然后遵循 RED-GREEN 约定生成测试。

目前用户在每个阶段后手工制作 `/gsd:quick` 提示来生成测试。此工作流程通过适当的分类、质量门限和差距报告来标准化该过程。
</purpose>

<required_reading>
在开始前读取所有被调用提示的 execution_context 引用的文件。
</required_reading>

<process>

<step name="parse_arguments">
解析 `$ARGUMENTS`：
- 阶段编号（整数、小数或字母后缀）→ 存储为 `$PHASE_ARG`
- 阶段编号后的剩余文本 → 存储为 `$EXTRA_INSTRUCTIONS`（可选）

示例：`/gsd:add-tests 12 focus on edge cases` → `$PHASE_ARG=12`, `$EXTRA_INSTRUCTIONS="focus on edge cases"`

如果没有提供阶段参数：

```
ERROR: 需要阶段编号
用法: /gsd:add-tests <phase> [additional instructions]
示例: /gsd:add-tests 12
示例: /gsd:add-tests 12 focus on edge cases in the pricing module
```

退出。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`phase_dir`, `phase_number`, `phase_name`.

验证阶段目录存在。如果不存在：
```
ERROR: 未找到阶段 ${PHASE_ARG} 的阶段目录
确保阶段存在于 .planning/phases/ 中
```
退出。

按优先级读取阶段工件：
1. `${phase_dir}/*-SUMMARY.md` — 实现的内容，修改的文件
2. `${phase_dir}/CONTEXT.md` — 验收标准，决策
3. `${phase_dir}/*-VERIFICATION.md` — 用户验证的场景（如果进行了 UAT）

如果没有 SUMMARY.md：
```
ERROR: 未找到阶段 ${PHASE_ARG} 的 SUMMARY.md
此命令适用于已完成的阶段。先运行 /gsd:execute-phase。
```
退出。

呈现横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 添加测试 — 阶段 ${phase_number}: ${phase_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="analyze_implementation">
从 SUMMARY.md 的 "Files Changed" 或等效部分提取阶段修改的文件列表。

对每个文件，分类为以下三种类别之一：

| 类别 | 标准 | 测试类型 |
|----------|----------|-----------|
| **TDD** | 可以编写 `expect(fn(input)).toBe(output)` 的纯函数 | 单元测试 |
| **E2E** | 可通过浏览器自动化验证的 UI 行为 | Playwright/E2E 测试 |
| **Skip** | 无意义测试或已覆盖 | 无 |

**TDD 分类 — 在以下情况下应用：**
- 业务逻辑：计算、定价、税收规则、验证
- 数据转换：映射、过滤、聚合、格式化
- 解析器：CSV、JSON、XML、自定义格式解析
- 验证器：输入验证、模式验证、业务规则
- 状态机：状态转换、工作流步骤
- 工具函数：字符串操作、日期处理、数字格式化

**E2E 分类 — 在以下情况下应用：**
- 键盘快捷键：键绑定、修饰键、和弦序列
- 导航：页面转换、路由、面包屑、前进/后退
- 表单交互：提交、验证错误、字段焦点、自动完成
- 选择：行选择、多选、shift-click 范围
- 拖放：重新排序、在容器间移动
- 模态对话框：打开、关闭、确认、取消
- 数据网格：排序、过滤、内联编辑、列调整大小

**Skip 分类 — 在以下情况下应用：**
- UI 布局/样式：CSS 类、视觉外观、响应式断点
- 配置：配置文件、环境变量、功能标志
- 胶水代码：依赖注入设置、中间件注册、路由表
- 迁移：数据库迁移、架构更改
- 简单 CRUD：无业务逻辑的基本创建/读取/更新/删除
- 类型定义：无逻辑的记录、DTO、接口

读取每个文件以验证分类。不要仅基于文件名进行分类。
</step>

<step name="present_classification">
在继续之前向用户呈现分类以供确认：

```
AskUserQuestion(
  header: "测试分类",
  question: |
    ## 文件已分类用于测试

    ### TDD (单元测试) — {N} 个文件
    {文件列表及简短原因}

    ### E2E (浏览器测试) — {M} 个文件
    {文件列表及简短原因}

    ### 跳过 — {K} 个文件
    {文件列表及简短原因}

    {if $EXTRA_INSTRUCTIONS: "额外指令: ${EXTRA_INSTRUCTIONS}"}

    您希望如何继续？
  options:
    - "批准并生成测试计划"
    - "调整分类（我将指定更改）"
    - "取消"
)
```

如果用户选择 "调整分类"：应用他们的更改并重新呈现。
如果用户选择 "取消"：正常退出。
</step>

<step name="discover_test_structure">
在生成测试计划之前，发现项目现有的测试结构：

```bash
# 查找现有测试目录
find . -type d -name "*test*" -o -name "*spec*" -o -name "*__tests__*" 2>/dev/null | head -20
# 查找现有测试文件以匹配约定
find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*Tests.fs" -o -name "*Test.fs" \) 2>/dev/null | head -20
# 检查测试运行器
ls package.json *.sln 2>/dev/null
```

识别：
- 测试目录结构（单元测试所在位置，E2E 测试所在位置）
- 命名约定（`.test.ts`, `.spec.ts`, `*Tests.fs` 等）
- 测试运行器命令（如何执行单元测试，如何执行 E2E 测试）
- 测试框架（xUnit、NUnit、Jest、Playwright 等）

如果测试结构不明确，询问用户：
```
AskUserQuestion(
  header: "测试结构",
  question: "我找到了多个测试位置。我应该在何处创建测试？",
  options: [列出发现的位置]
)
```
</step>

<step name="generate_test_plan">
对于每个批准的文件，创建详细的测试计划。

**对于 TDD 文件**，遵循 RED-GREEN-REFACTOR 计划测试：
1. 识别文件中可测试的函数/方法
2. 对每个函数：列出输入场景、预期输出、边界情况
3. 注意：由于代码已存在，测试可能会立即通过 — 没问题，但验证它们测试的是正确的行为

**对于 E2E 文件**，遵循 RED-GREEN 门限计划测试：
1. 从 CONTEXT.md/VERIFICATION.md 识别用户场景
2. 对每个场景：描述用户操作、预期结果、断言
3. 注意：RED 门限意味着如果功能损坏，测试将失败得到确认

呈现完整的测试计划：

```
AskUserQuestion(
  header: "测试计划",
  question: |
    ## 测试生成计划

    ### 单元测试（{N} 个测试，{M} 个文件）
    {对每个文件：测试文件路径，测试用例列表}

    ### E2E 测试（{P} 个测试，{Q} 个文件）
    {对每个文件：测试文件路径，测试场景列表}

    ### 测试命令
    - 单元：{发现的测试命令}
    - E2E：{发现的 e2e 命令}

    准备生成？
  options:
    - "全部生成"
    - "选择性生成（我将指定）"
    - "调整计划"
)
```

如果 "选择性生成"：询问用户包含哪些测试。
如果 "调整计划"：应用更改并重新呈现。
</step>

<step name="execute_tdd_generation">
对于每个批准的 TDD 测试：

1. **创建测试文件**，遵循发现的项目约定（目录、命名、导入）

2. **编写测试**，使用清晰的 arrange/act/assert 结构：
   ```
   // Arrange — 设置输入和预期输出
   // Act — 调用被测试的函数
   // Assert — 验证输出与预期匹配
   ```

3. **运行测试**：
   ```bash
   {发现的测试命令}
   ```

4. **评估结果：**
   - **测试通过**：好 — 实现满足测试。验证测试检查有意义的行为（而不仅仅是编译）。
   - **测试因断言错误失败**：这可能是测试发现的实际错误。标记它：
     ```
     ⚠️ 发现潜在错误：{测试名称}
     预期：{预期}
     实际：{实际}
     文件：{实现文件}
     ```
     不要修复实现 — 这是测试生成命令，不是修复命令。记录发现。
   - **测试因错误失败（导入、语法等）**：这是测试错误。修复测试并重新运行。
</step>

<step name="execute_e2e_generation">
对于每个批准的 E2E 测试：

1. **检查是否存在覆盖相同场景的现有测试**：
   ```bash
   grep -r "{场景关键词}" {e2e 测试目录} 2>/dev/null
   ```
   如果找到，扩展而不是复制。

2. **创建测试文件**，针对来自 CONTEXT.md/VERIFICATION.md 的用户场景

3. **运行 E2E 测试**：
   ```bash
   {发现的 e2e 命令}
   ```

4. **评估结果：**
   - **GREEN（通过）**：记录成功
   - **RED（失败）**：确定是测试问题还是实际的应用程序错误。标记错误：
     ```
     ⚠️ E2E 失败：{测试名称}
     场景：{描述}
     错误：{错误消息}
     ```
   - **无法运行**：报告阻塞器。不要标记为完成。
     ```
     🛑 E2E 阻塞器：{无法运行测试的原因}
     ```

**无跳过规则**：如果 E2E 测试无法执行（缺少依赖项、环境问题），报告阻塞器并将测试标记为不完整。在没有实际运行测试的情况下，永远不要标记为成功。
</step>

<step name="summary_and_commit">
创建测试覆盖率报告并向用户呈现：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 测试生成完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 结果

| 类别 | 已生成 | 通过 | 失败 | 阻塞 |
|----------|-----------|---------|---------|---------|
| 单元测试 | {N}       | {n1}    | {n2}    | {n3}    |
| E2E 测试 | {M}       | {m1}    | {m2}    | {m3}    |

## 创建/修改的文件
{带路径的测试文件列表}

## 覆盖范围差距
{无法测试的区域及原因}

## 发现的错误
{表示实现错误的任何断言失败}
```

在项目状态中记录测试生成：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state-snapshot
```

如果有要通过的测试要提交：

```bash
git add {测试文件}
git commit -m "test(phase-${phase_number}): add unit and E2E tests from add-tests command"
```

呈现下一步：

```
---

## ▶ 接下来

{if bugs discovered:}
**修复发现的错误：** `/gsd:quick fix the {N} test failures discovered in phase ${phase_number}`

{if blocked tests:}
**解决测试阻塞器：** {需要的内容描述}

{otherwise:}
**所有测试通过！** 阶段 ${phase_number} 已完全测试。

---

**也可用：**
- `/gsd:add-tests {next_phase}` — 测试另一个阶段
- `/gsd:verify-work {phase_number}` — 运行 UAT 验证

---
```
</step>

</process>

<success_criteria>
- [ ] 阶段工件已加载（SUMMARY.md、CONTEXT.md、可选 VERIFICATION.md）
- [ ] 所有修改的文件已分类到 TDD/E2E/Skip 类别
- [ ] 分类已向用户呈现并获批准
- [ ] 项目测试结构已发现（目录、约定、运行器）
- [ ] 测试计划已向用户呈现并获批准
- [ ] TDD 测试已生成，使用 arrange/act/assert 结构
- [ ] E2E 测试已生成，针对用户场景
- [ ] 所有测试已执行 — 没有未测试的测试被标记为通过
- [ ] 测试发现的错误已标记（未修复）
- [ ] 测试文件已提交，消息合适
- [ ] 覆盖范围差距已记录
- [ ] 下一步已向用户呈现
</success_criteria>
