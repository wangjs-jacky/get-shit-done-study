<purpose>
提取下游代理需要的实施决策。分析阶段以识别灰色区域，让用户选择讨论内容，然后深入探讨每个选定的区域，直到满意为止。

您是思考伙伴，而不是采访者。用户是远见者 — 您是建造者。您的工作是捕获将指导研究和规划的决策，而不是自己确定实施。
</purpose>

<downstream_awareness>
**CONTEXT.md 供以下内容使用：**

1. **gsd-phase-researcher** — 读取 CONTEXT.md 了解要研究什么
   - "用户想要基于卡片布局" → 研究人员研究卡片组件模式
   - "已决定无限滚动" → 研究人员研究虚拟化库

2. **gsd-planner** — 读取 CONTEXT.md 了解已锁定的决策
   - "移动设备上拉刷新" → 规划人员在任务规格中包含
   - "Claude 的自由度：加载骨架" → 规划人员可以决定方法

**您的工作：** 清晰地捕获决策，使得下游代理能够据此行动，而无需再次询问用户。

**您不负责的：** 确定如何实施。这正是您捕获的决策由研究和规划要做的工作。
</downstream_awareness>

<philosophy>
**用户 = 创始人/远见者。Claude = 建造者。**

用户知道：
- 他们想象如何工作
- 应该看起来/感觉如何
- 什么是本质功能 vs 好用但非必需
- 他们心中特定的行为或参考

用户不知道（也不应该被询问）：
- 代码库模式（研究人员读取代码）
- 技术风险（研究人员识别这些）
- 实施方法（规划人员确定这个）
- 成功指标（从工作中推断）

询问愿景和实施选择。为下游代理捕获决策。
</philosophy>

<scope_guardrail>
**关键：不要范围蔓延。**

阶段边界来自 ROADMAP.md 并且是固定的。讨论澄清如何实施范围内的内容，绝不添加新功能。

**允许的（澄清模糊性）：**
- "帖子应该如何显示？"（布局、密度、显示的信息）
- "空状态会发生什么？"（功能内）
- "下拉刷新还是手动？"（行为选择）

**不允许的（范围蔓延）：**
- "我们还应该添加评论吗？"（新功能）
- "搜索/过滤怎么样？"（新功能）
- "也许包含书签？"（新功能）

**启发式方法：这澄清了如何实施已在该阶段中的内容，还是添加了可以成为其自己阶段的新功能？

**当用户建议范围蔓延时：**
```
"[功能 X] 会是新功能 — 那是它自己的阶段。
要我将其记入路线图待办事项吗？

现在，让我们专注于 [阶段领域]。"
```

在"延迟想法"部分捕获这个想法。不要丢失它，不要据此行动。
</scope_guardrail>

<gray_area_identification>
灰色区域是**用户关心的实施决策** — 可能以多种方式进行并会改变结果的事情。

**如何识别灰色区域：**

1. **读取阶段目标** 从 ROADMAP.md
2. **理解领域** — 正在构建什么类型的东西？
   - 用户看到的 → 视觉呈现、交互、状态很重要
   - 用户调用的 → 接口约定、响应、错误很重要
   - 用户运行的 → 调用、输出、行为模式很重要
   - 用户阅读的 → 结构、语调、深度、流程很重要
   - 被组织的 → 标准、分组、异常处理很重要
3. **生成阶段特定的灰色区域** — 不是通用类别，而是此阶段的具体决策

**不要使用通用类别标签**（UI、UX、行为）。生成具体的灰色区域：

```
阶段："用户身份验证"
→ 会话处理、错误响应、多设备策略、恢复流程

阶段："整理照片库"
→ 分组标准、重复处理、命名约定、文件夹结构

阶段："数据库备份 CLI"
→ 输出格式、标志设计、进度报告、错误恢复

阶段："API 文档"
→ 结构/导航、代码示例深度、版本化方法、交互元素
```

**关键问题：** 用户应该权衡哪些可能改变结果的决策？

**Claude 处理这些（不要询问）：**
- 技术实施细节
- 架构模式
- 性能优化
- 范围（路线图定义这个）
</gray_area_identification>

<process>

**快速路径可用：** 如果您已经有 PRD 或验收标准文档，使用 `/gsd:plan-phase {phase} --prd path/to/prd.md` 跳过此讨论并直接进入规划。

<step name="initialize" priority="first">
来自参数的阶段编号（必需）。

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 JSON 中解析：`commit_docs`、`phase_found`、`phase_dir`、`phase_number`、`phase_name`、`phase_slug`、`padded_phase`、`has_research`、`has_context`、`has_plans`、`has_verification`、`plan_count`、`roadmap_exists`、`planning_exists`。

**如果 `phase_found` 为 false：**
```
阶段 [X] 在路线图中未找到。

使用 /gsd:progress 查看可用阶段。
```
退出工作流。

**如果 `phase_found` 为 true：** 继续到 check_existing。
</step>

<step name="check_existing">
使用 init 中的 `has_context` 检查 CONTEXT.md 是否已存在。

```bash
ls ${phase_dir}/*-CONTEXT.md 2>/dev/null
```

**如果存在：**
使用 AskUserQuestion：
- header: "上下文"
- question: "阶段 [X] 已有上下文。您想要做什么？"
- options:
  - "更新它" — 审查和修改现有上下文
  - "查看它" — 显示现有内容
  - "跳过" — 按原样使用现有上下文

如果"更新"：加载现有内容，继续到 analyze_phase
如果"查看"：显示 CONTEXT.md，然后提供更新/跳过选项
如果"跳过"：退出工作流

**如果不存在：**

检查 init 中的 `has_plans` 和 `plan_count`。**如果 `has_plans` 为 true：**

使用 AskUserQuestion：
- header: "计划已存在"
- question: "阶段 [X] 已有 {plan_count} 个计划在无需用户上下文的情况下创建。您的决策不会影响现有计划，除非您重新规划。"
- options:
  - "继续并在之后重新规划" — 捕获上下文，然后运行 /gsd:plan-phase {X} 重新规划
  - "查看现有计划" — 在决定前显示计划
  - "取消" — 跳过 discuss-phase

如果"继续并在之后重新规划"：继续到 analyze_phase
如果"查看现有计划"：显示计划文件，然后提供"继续"/"取消"选项
如果"取消"：退出工作流。

**如果 `has_plans` 为 false：** 继续到 load_prior_context。
</step>

<step name="load_prior_context">
读取项目级别和先前阶段上下文，避免重复询问已决定的问题并保持一致性。

**步骤 1：读取项目级别文件**
```bash
# 核心项目文件
cat .planning/PROJECT.md 2>/dev/null
cat .planning/REQUIREMENTS.md 2>/dev/null
cat .planning/STATE.md 2>/dev/null
```

从这些中提取：
- **PROJECT.md** — 愿景、原则、不可谈判项、用户偏好
- **REQUIREMENTS.md** — 验收标准、约束、必需项 vs 好用但非必需项
- **STATE.md** — 当前进度，任何标志或会话说明

**步骤 2：读取所有先前的 CONTEXT.md 文件**
```bash
# 查找所有来自当前阶段之前的 CONTEXT.md 文件
find .planning/phases -name "*-CONTEXT.md" 2>/dev/null | sort
```

对于每个阶段编号 < 当前阶段的 CONTEXT.md：
- 读取 `<decisions>` 部分 — 这些是已锁定的偏好
- 读取 `<specifics>` — 特定参考或"我想要它像 X"的时刻
- 注意任何模式（例如，"用户始终偏好最小化 UI"，"用户拒绝单键快捷键"）

**步骤 3：构建内部 `<prior_decisions>` 上下文**

结构化提取的信息：
```
<prior_decisions>
## 项目级别
- [来自 PROJECT.md 的关键原则或约束]
- [来自 REQUIREMENTS.md 的影响此阶段的需求]

## 来自先前的阶段
### 阶段 N：[名称]
- [可能影响当前阶段的决策]
- [建立模式的偏好]

### 阶段 M：[名称]
- [另一个相关决策]
</prior_decisions>
```

**在后续步骤中的使用：**
- `analyze_phase`：跳过先前阶段已决定的灰色区域
- `present_gray_areas`：用先前决策注释选项（"您在阶段 5 选择了 X"）
- `discuss_areas`：预填充答案或标记冲突（"这与阶段 3 矛盾 — 这里相同还是不同？"）

**如果不存在先前的上下文：** 继续进行 — 这对于早期阶段是预期的。
</step>

<step name="scout_codebase">
对现有代码进行轻量级扫描，以支持灰色区域识别和讨论。使用约 10% 的上下文 — 适用于交互会话。

**步骤 1：检查现有的代码库映射**
```bash
ls .planning/codebase/*.md 2>/dev/null
```

**如果代码库映射存在：** 读取最相关的（基于阶段类型的 CONVENTIONS.md、STRUCTURE.md、STACK.md）。提取：
- 可重用的组件/钩子/工具
- 既定模式（状态管理、样式、数据获取）
- 集成点（新代码将连接的位置）

跳到下面的步骤 3。

**步骤 2：如果没有代码库映射，进行有针对性的 grep**

从阶段目标中提取关键术语（例如，"feed" → "post"、"card"、"list"；"auth" → "login"、"session"、"token"）。

```bash
# 查找与阶段目标术语相关的文件
grep -rl "{term1}\|{term2}" src/ app/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -10

# 查找现有组件/钩子
ls src/components/ 2>/dev/null
ls src/hooks/ 2>/dev/null
ls src/lib/ src/utils/ 2>/dev/null
```

读取 3-5 个最相关的文件以理解既定模式。

**步骤 3：构建内部 codebase_context**

从扫描中识别：
- **可重用资产** — 可在此阶段使用的现有组件、钩子、工具
- **既定模式** — 代码库如何进行状态管理、样式、数据获取
- **集成点** — 新代码将连接的位置（路由、导航、提供者）
- **创造性选项** — 现有架构启用或约束的方法

存储为内部 `<codebase_context>` 用于 analyze_phase 和 present_gray_areas。这不写入文件 — 仅在此会话中使用。
</step>

<step name="analyze_phase">
分析阶段以识别值得讨论的灰色区域。**同时使用 `prior_decisions` 和 `codebase_context` 来支持分析。**

**从 ROADMAP.md 读取阶段描述并确定：**

1. **领域边界** — 此阶段提供什么能力？清晰地说明它。

1b. **初始化规范引用累加器** — 开始为 CONTEXT.md 构建 `<canonical_refs>` 列表。这在整个讨论过程中累积，而不仅仅是此步骤。

   **来源 1（现在）：** 从此阶段的 ROADMAP.md 复制 `Canonical refs:`。每个扩展为完整相对路径。
   **来源 2（现在）：** 检查 REQUIREMENTS.md 和 PROJECT.md 中为此阶段引用的任何规格/ADR。
   **来源 3（scout_codebase）：** 如果现有代码引用文档（例如，注释引用 ADR），添加那些。
   **来源 4（discuss_areas）：** 当用户说"读取 X"、"检查 Y"或在讨论中引用任何文档/规格/ADR 时 — 立即添加。这些通常是更重要的引用，因为它们代表用户特别希望下游代理遵循的文档。

   此列表在 CONTEXT.md 中是必需的。每个引用必须具有完整相对路径，以便下游代理可以直接读取。如果不存在外部文档，明确说明。

2. **检查先前决策** — 在生成灰色区域前，检查是否有任何已决定：
   - 扫描 `<prior_decisions>` 寻找相关选择（例如，"仅 Ctrl+C，无单键快捷键"）
   - 这些是**预回答的** — 除非此阶段有冲突需求，不要重新询问
   - 注明适用的先前决策用于展示

3. **按类别分组的灰色区域** — 对于每个相关类别（UI、UX、行为、空状态、内容），识别 1-2 个可能改变实施的具体模糊性。**在相关处用代码上下文注释**（例如，"您已经有 Card 组件"或"没有此的既定模式"）。

4. **跳过评估** — 如果没有有意义的灰色区域存在（纯基础设施、明确的实施，或所有已在先前阶段决定），此阶段可能不需要讨论。

**内部输出您的分析，然后向用户展示。**

示例分析"帖子流"阶段（带代码和先前上下文）：
```
领域：显示关注用户的帖子
现有：Card 组件（src/components/ui/Card.tsx）、useInfiniteQuery 钩子、Tailwind CSS
先前决策："偏好最小化 UI"（阶段 2）、"无分页 — 总是无限滚动"（阶段 4）
灰色区域：
- UI：布局样式（卡片 vs 时间线 vs 网格）— Card 组件存在带阴影/圆角变体
- UI：信息密度（完整帖子 vs 预览）— 没有现有密度模式
- 行为：加载模式 — 已决定：无限滚动（阶段 4）
- 空状态：无帖子存在时显示什么 — EmptyState 组件存在于 ui/
- 内容：显示什么元数据（时间、作者、反应计数）
```
</step>

<step name="present_gray_areas">
向用户展示领域边界、先前决策和灰色区域。

**首先，说明边界和任何适用的先前决策：**
```
阶段 [X]：[名称]
领域：[此阶段提供的内容 — 来自您的分析]

我们将澄清如何实施此功能。
（新功能属于其他阶段。）

[如果适用先前决策：]
**从早期阶段继承：**
- [适用于此的阶段 N 的决策]
- [适用于此的阶段 M 的决策]
```

**然后使用 AskUserQuestion（multiSelect: true）：**
- header: "讨论"
- question: "您希望为 [阶段名称] 讨论哪些领域？"
- options: 生成 3-4 个阶段特定的灰色区域，每个包含：
  - "[具体领域]"（标签）— 具体，而不是通用
  - [涵盖的 1-2 个问题 + 代码上下文注释]（描述）
  - **用简要解释推荐的选择**

**先前决策注释：** 当灰色区域在先前阶段已决定时，注释它：
```
☐ 退出快捷键 — 用户应该如何退出？
  （您在阶段 5 决定了"仅 Ctrl+C，无单键快捷键" — 重新考虑还是保持？）
```

**代码上下文注释：** 当 scout 发现相关现有代码时，注释灰色区域描述：
```
☐ 布局样式 — 卡片 vs 列表 vs 时间线？
  （您已经有 Card 组件带阴影/圆角变体。重用它保持应用一致性。）
```

**组合两者：** 当两者都适用时：
```
☐ 加载行为 — 无限滚动或分页？
  （您在阶段 4 选择了无限滚动。useInfiniteQuery 钩子已设置。）
```

**不要包含"跳过"或"您决定"选项。** 用户运行此命令是为了讨论 — 给他们真实的选择。

**按领域的示例（带代码上下文）：**

对于"帖子流"（视觉功能）：
```
☐ 布局样式 — 卡片 vs 列表 vs 时间线？（Card 组件存在变体）
☐ 加载行为 — 无限滚动或分页？（useInfiniteQuery 钩子可用）
☐ 内容排序 — 按时间、算法或用户选择？
☐ 帖子元数据 — 每个帖子什么信息？时间戳、反应、作者？
```

对于"数据库备份 CLI"（命令行工具）：
```
☐ 输出格式 — JSON、表格还是纯文本？详细程度级别？
☐ 标志设计 — 短标志、长标志还是两者？必需 vs 可选？
☐ 进度报告 — 静默、进度条还是详细日志？
☐ 错误恢复 — 快速失败、重试还是提示操作？
```

对于"整理照片库"（组织任务）：
```
☐ 分组标准 — 按日期、位置、面部还是事件？
☐ 重复处理 — 保留最佳、全部保留还是每次提示？
☐ 命名约定 — 原始名称、日期还是描述性？
☐ 文件夹结构 — 扁平、按年份嵌套还是按类别？
```

继续使用选定区域讨论_areas。
</step>

<step name="discuss_areas">
对于每个选定区域，进行有针对性的讨论循环。

**批处理模式支持：** 从 `$ARGUMENTS` 解析可选 `--batch`。
- 接受 `--batch`、`--batch=N` 或 `--batch N`
- 未提供数字时默认每批 4 个问题
- 将显式大小限制为 2-5，以便一批问题可以回答
- 如果 `--batch` 不存在，保持现有的逐个问题流程

**理念：** 保持适应，但让用户选择节奏。
- 默认模式：4 个单独问题回合，然后检查是否继续
- `--batch` 模式：1 个包含 2-5 个编号问题的分组回合，然后检查是否继续

每个答案（或批处理模式中的答案组）应该揭示下一个问题或下一批。

**对于每个区域：**

1. **宣布区域：**
   ```
   让我们谈谈 [领域]。
   ```

2. **使用选定的节奏提问：**

   **默认（无 `--batch`）：使用 AskUserQuestion 问 4 个问题**
   - header: "[领域]"（最多 12 个字符 — 如需要缩写）
   - question: 此区域的具体决策
   - options: 2-3 个具体选择（AskUserQuestion 自动添加"其他"），推荐选择突出显示并简要解释为什么
   - **在相关时用代码上下文注释选项：**
     ```
     "帖子应该如何显示？"
     - 卡片（重用现有 Card 组件 — 与消息一致）
     - 列表（更简单，将是新模式）
     - 时间线（需要新的 Timeline 组件 — 尚不存在）
     ```
   - 当合理时包含"您决定"作为选项 — 捕获 Claude 自由度
   - **库选择的 Context7：** 当灰色区域涉及库选择（例如，"魔法链接" → 查询 next-auth 文档）或 API 方法决策时，使用 `mcp__context7__*` 工具获取当前文档并告知选项。不要对每个问题都使用 Context7 — 仅当库特定知识改善选项时才使用。

   **批处理模式（`--batch`）：在一个纯文本回合中问 2-5 个编号问题**
   - 将当前区域密切相关的问题组合到单条消息中
   - 保持每个问题具体且可在一次回复中回答
   - 当选项有帮助时，每个问题包含简短的内联选择，而不是为每个项目单独使用 AskUserQuestion
   - 用户回复后，反射回捕获的决策，记录任何未回答的项目，并在继续前仅询问最少后续问题
   - 保持批处理之间的适应度：使用完整答案集决定下一批或领域是否足够清晰

3. **在当前问题集后检查：**
   - header: "[领域]"（最多 12 个字符）
   - question: "关于 [领域] 更多问题，还是继续下一个？"
   - options: "更多问题" / "下一个领域"

   如果"更多问题" → 再问 4 个单独问题，或当 `--batch` 激活时问另一个 2-5 问题批，然后再次检查
   如果"下一个领域" → 继续下一个选定区域
   如果"其他"（自由文本）→ 解释意图：延续短语（"多聊点"、"继续"、"是"、"更多"）映射到"更多问题"；前进短语（"完成"、"继续"、"下一个"、"跳过"）映射到"下一个领域"。如果模糊，询问："继续关于 [领域] 的更多问题，还是进入下一个领域？"

4. **在所有最初选定区域完成后：**
   - 总结到目前为止从讨论中捕获的内容
   - AskUserQuestion：
     - header: "完成"
     - question: "我们已经讨论了 [列出领域]。哪些灰色区域仍然不清楚？"
     - options: "探索更多灰色区域" / "我准备好上下文"
   - 如果"探索更多灰色区域"：
     - 根据所学识别 2-4 个额外灰色区域
     - 使用这些新区域返回到 present_gray_areas 逻辑
     - 循环：讨论新区域，然后再次提示
   - 如果"我准备好上下文"：继续到 write_context

**讨论期间的规范引用累积：**
当用户在回答期间引用文档、规格或 ADR 时 — 例如，"读取 adr-014"、"检查 MCP 规范"、"根据 browse-spec.md" — 立即：
1. 读取引用的文档（或确认其存在）
2. 添加到规范引用累加器，带有完整相对路径
3. 使用从文档中学到的内容指导后续问题

用户引用的文档通常比 ROADMAP.md 引用更重要，因为它们代表用户特别希望下游代理遵循的文档。永远不要丢弃它们。

**问题设计：**
- 选项应具体，而不是抽象的（"卡片"而不是"选项 A"）
- 每个答案应该指导下一个问题或下一批
- 如果用户选择"其他"提供自由格式输入（例如，"让我描述"、"其他内容"或开放式回复），您的后续问题应以纯文本形式提出 — 不是另一个 AskUserQuestion。等待他们在常规提示处输入，然后反射他们的输入并在恢复 AskUserQuestion 或下一个编号批前确认。

**范围蔓延处理：**
如果用户提到阶段领域之外的内容：
```
"[功能] 听起来是新功能 — 那属于它自己的阶段。
我将将其记为延迟想法。

回到 [当前领域]：[回到当前问题]"
```

内部跟踪延迟想法。
</step>

<step name="write_context">
创建 CONTEXT.md 捕获已做的决策。

**查找或创建阶段目录：**

使用 init 中的值：`phase_dir`、`phase_slug`、`padded_phase`。

如果 `phase_dir` 为 null（阶段存在于路线图中但没有目录）：
```bash
mkdir -p ".planning/phases/${padded_phase}-${phase_slug}"
```

**文件位置：** `${phase_dir}/${padded_phase}-CONTEXT.md`

**按讨论内容结构化：**

```markdown
# 阶段 [X]：[名称] - 上下文

**收集：** [日期]
**状态：** 准备规划

<domain>
## 阶段边界

[此阶段提供什么内容的清晰陈述 — 范围锚点]

</domain>

<decisions>
## 实施决策

### [讨论的类别 1]
- [捕获的决策或偏好]
- [如果适用，另一个决策]

### [讨论的类别 2]
- [捕获的决策或偏好]

### Claude 的自由度
[用户说"您决定"的领域 — 注意 Claude 在这里有灵活性]

</decisions>

<canonical_refs>
## 规范引用

**下游代理在规划或实施前必须读取这些。**

[必需部分。在此处写入完整累加的规范引用列表。
来源：ROADMAP.md 引用 + REQUIREMENTS.md 引用 + 讨论期间用户引用的文档 +
代码库 scout 期间发现的任何文档。按主题区域分组。
每个条目需要完整相对路径 — 不仅是名称。]

### [主题区域 1]
- `path/to/adr-or-spec.md` — [相关/决定的内容]
- `path/to/doc.md` §N — [特定部分引用]

### [主题区域 2]
- `path/to/feature-doc.md` — [此文档定义的内容]

[如果没有外部规格："无外部规格 — 要求完全包含在上面的决策中"]

</canonical_refs>

<code_context>
## 现有代码洞察

### 可重用资产
- [组件/钩子/工具]：[在此阶段中如何使用]

### 既定模式
- [模式]：[如何约束/启用此阶段]

### 集成点
- [新代码连接到现有系统的位置]

</code_context>

<specifics>
## 具体想法

[讨论中任何特定参考、示例或"我想要它像 X"的时刻]

[如果没有："无具体要求 — 开放标准方法"]

</specifics>

<deferred>
## 延迟想法

[出现但属于其他阶段的想法。不要丢失它们。]

[如果没有："无 — 讨论保持在阶段范围内"]

</deferred>

---

*阶段：XX-name*
*上下文收集：[日期]*
```

写入文件。
</step>

<step name="confirm_creation">
展示摘要和下一步：

```
已创建：.planning/phases/${PADDED_PHASE}-${SLUG}/${PADDED_PHASE}-CONTEXT.md

## 捕获的决策

### [类别]
- [关键决策]

### [类别]
- [关键决策]

[如果存在延迟想法：]
## 稍后记录
- [延迟想法] — 未来阶段

---

## ▶ 接下来做什么

**阶段 ${PHASE}：[名称]** — [来自 ROADMAP.md 的目标]

`/gsd:plan-phase ${PHASE}`

<sub>先使用 /clear → 获取新的上下文窗口</sub>

---

**其他可用选项：**
- `/gsd:plan-phase ${PHASE} --skip-research` — 无研究直接规划
- 继续前审查/编辑 CONTEXT.md

---
```
</step>

<step name="git_commit">
提交阶段上下文（内部使用 init 中的 `commit_docs`）：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(${padded_phase}): 捕获阶段上下文" --files "${phase_dir}/${padded_phase}-CONTEXT.md"
```

确认："已提交：docs(${padded_phase}): 捕获阶段上下文"
</step>

<step name="update_state">
用会话信息更新 STATE.md：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state record-session \
  --stopped-at "阶段 ${PHASE} 上下文已收集" \
  --resume-file "${phase_dir}/${padded_phase}-CONTEXT.md"
```

提交 STATE.md：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(state): 记录阶段 ${PHASE} 上下文会话" --files .planning/STATE.md
```
</step>

<step name="auto_advance">
检查自动触发：

1. 从 $ARGUMENTS 解析 `--auto` 标志
2. **将链标志与意图同步** — 如果用户手动调用（无 `--auto`），清除任何先前中断的 `--auto` 链的临时链标志。这不影响 `workflow.auto_advance`（用户的持久设置偏好）：
   ```bash
   if [[ ! "$ARGUMENTS" =~ --auto ]]; then
     node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false 2>/dev/null
   fi
   ```
3. 读取链标志和用户偏好：
   ```bash
   AUTO_CHAIN=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow._auto_chain_active 2>/dev/null || echo "false")
   AUTO_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.auto_advance 2>/dev/null || echo "false")
   ```

**如果 `--auto` 标志存在且 `AUTO_CHAIN` 不为 true：** 将链标志持久化到配置（处理没有 new-project 的直接 `--auto` 使用）：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active true
```

**如果 `--auto` 标志存在或 `AUTO_CHAIN` 为 true 或 `AUTO_CFG` 为 true：**

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 自动推进到规划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

上下文已捕获。启动 plan-phase...
```

使用 Skill 工具启动 plan-phase 以避免嵌套的 Task 会话（由于深度代理嵌套导致运行时冻结 — 参见 #686）：
```
Skill(skill="gsd:plan-phase", args="${PHASE} --auto")
```

这保持自动推进链平坦 — 讨论、规划和执行都在同一嵌套级别运行，而不是生成越来越深的 Task 代理。

**处理 plan-phase 返回：**
- **阶段完成** → 完整链成功。显示：
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GSD ► 阶段 ${PHASE} 完成
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  自动推进管道完成：讨论 → 规划 → 执行

  下一个：/gsd:discuss-phase ${NEXT_PHASE} --auto
  <sub>先使用 /clear → 获取新的上下文窗口</sub>
  ```
- **规划完成** → 规划完成，执行未完成：
  ```
  自动推进部分：规划完成，执行未完成。
  继续：/gsd:execute-phase ${PHASE}
  ```
- **规划结论不明 / 检查点** → 停止链：
  ```
  自动推进停止：规划需要输入。
  继续：/gsd:plan-phase ${PHASE}
  ```
- **发现差距** → 停止链：
  ```
  自动推进停止：执行期间发现差距。
  继续：/gsd:plan-phase ${PHASE} --gaps
  ```

**如果既没有 `--auto` 也没有配置启用：**
路由到 `confirm_creation` 步骤（现有行为 — 显示手动下一步）。
</step>

</process>

<success_criteria>
- 阶段已根据路线图验证
- 已加载先前上下文（PROJECT.md、REQUIREMENTS.md、STATE.md、先前 CONTEXT.md 文件）
- 已避免重新询问已决定的问题（从先前阶段继承）
- 已进行代码库 scout 以查找可重用资产、模式和集成点
- 已通过智能分析和代码及先前决策注释识别灰色区域
- 用户已选择讨论哪些领域
- 每个选定区域都已探讨，直到用户满意（带代码信息和先前决策信息的选项）
- 范围蔓延已重定向到延迟想法
- CONTEXT.md 捕获实际决策，而非模糊的愿景
- CONTEXT.md 包含 canonical_refs 部分，带有下游代理需要的每个规格/ADR/文档的完整文件路径（必需 — 永远不要省略）
- CONTEXT.md 包含 code_context 部分，带有可重用资产和模式
- 延迟想法已保存供未来阶段使用
- STATE.md 已更新会话信息
- 用户了解下一步
</success_criteria>