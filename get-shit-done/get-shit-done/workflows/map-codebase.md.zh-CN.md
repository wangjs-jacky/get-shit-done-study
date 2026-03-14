<purpose>
协调并行代码库映射代理分析代码库并在 .planning/codebase/ 中生成结构化文档。

每个代理都有新鲜上下文，探索特定焦点区域，并**直接编写文档**。编排器仅接收确认 + 行数，然后编写摘要。

输出：包含 7 个关于代码库状态的结构化文档的 .planning/codebase/ 文件夹。
</purpose>

<philosophy>
**为什么使用专门的映射代理：**
- 每个领域都有新鲜上下文（无令牌污染）
- 代理直接编写文档（无上下文传输回编排器）
- 编排器仅总结创建了什么（最小上下文使用）
- 更快执行（代理同时运行）

**文档质量优先于长度：**
包含足够细节作为参考。优先实用示例（特别是代码模式）而非任意简洁。

**始终包含文件路径：**
文档是 Claude 规划/执行时的参考材料。始终包含实际文件路径，使用反引号格式：`src/services/user.ts`。
</philosophy>

<process>

<step name="init_context" priority="first">
加载代码库映射上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init map-codebase)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`mapper_model`, `commit_docs`, `codebase_dir`, `existing_maps`, `has_maps`, `codebase_dir_exists`。
</step>

<step name="check_existing">
使用 `has_maps` 从 init 上下文检查 .planning/codebase/ 是否已存在。

如果 `codebase_dir_exists` 为 true：
```bash
ls -la .planning/codebase/
```

**如果存在：**

```
.planning/codebase/ 已存在以下文档：
[找到的列表]

接下来是什么？
1. 刷新 - 删除现有并重新映射代码库
2. 更新 - 保持现有，仅更新特定文档
3. 跳过 - 如使用现有代码库映射
```

等待用户响应。

如果"刷新"：删除 .planning/codebase/，继续到 create_structure
如果"更新"：询问要更新哪些文档，继续到 spawn_agents（过滤）
如果"跳过"：退出工作流

**如果不存在：**
继续到 create_structure。
</step>

<step name="create_structure">
创建 .planning/codebase/ 目录：

```bash
mkdir -p .planning/codebase
```

**预期输出文件：**
- STACK.md（来自技术映射器）
- INTEGRATIONS.md（来自技术映射器）
- ARCHITECTURE.md（来自架构映射器）
- STRUCTURE.md（来自架构映射器）
- CONVENTIONS.md（来自质量映射器）
- TESTING.md（来自质量映射器）
- CONCERNS.md（来自关注点映射器）

继续到 spawn_agents。
</step>

<step name="spawn_agents">
生成 4 个并行的 gsd-codebase-mapper 代理。

使用 Task 工具，`subagent_type="gsd-codebase-mapper"`, `model="{mapper_model}"`, `run_in_background=true` 用于并行执行。

**关键：** 使用专用的 `gsd-codebase-mapper` 代理，不是 `Explore`。映射代理直接编写文档。

**代理 1：技术焦点**

```
Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="映射代码库技术栈",
  prompt="Focus: tech

分析此代码库的技术栈和外部集成。

将此文档写入 .planning/codebase/：
- STACK.md - 语言、运行时、框架、依赖、配置
- INTEGRATIONS.md - 外部 API、数据库、认证提供者、Webhook

彻底探索。使用模板直接编写文档。仅返回确认。"
)
```

**代理 2：架构焦点**

```
Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="映射代码库架构",
  prompt="Focus: arch

分析此代码库架构和目录结构。

将此文档写入 .planning/codebase/：
- ARCHITECTURE.md - 模式、层、数据流、抽象、入口点
- STRUCTURE.md - 目录布局、关键位置、命名约定

彻底探索。使用模板直接编写文档。仅返回确认。"
)
```

**代理 3：质量焦点**

```
Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="映射代码库约定",
  prompt="Focus: quality

分析此代码库的编码约定和测试模式。

将此文档写入 .planning/codebase/：
- CONVENTIONS.md - 代码样式、命名、模式、错误处理
- TESTING.md - 框架、结构、模拟、覆盖率

彻底探索。使用模板直接编写文档。仅返回确认。"
)
```

**代理 4：关注点焦点**

```
Task(
  subagent_type="gsd-codebase-mapper",
  model="{mapper_model}",
  run_in_background=true,
  description="映射代码库关注点",
  prompt="Focus: concerns

分析此代码库的技术债务、已知问题和关注点领域。

将此文档写入 .planning/codebase/：
- CONCERNS.md - 技术债务、错误、安全、性能、脆弱区域

彻底探索。使用模板直接编写文档。仅返回确认。"
)
```

继续到 collect_confirmations。
</step>

<step name="collect_confirmations">
等待所有 4 个代理完成。

读取每个代理的输出文件以收集确认。

**每个代理的预期确认格式：**
```
## 映射完成

**焦点：** {focus}
**编写的文档：**
- `.planning/codebase/{DOC1}.md` ({N} 行)
- `.planning/codebase/{DOC2}.md` ({N} 行)

准备编排器摘要。
```

**您收到的内容：** 只是文件路径和行数。不是文档内容。

如果有任何代理失败，记录失败并继续成功文档。

继续到 verify_output。
</step>

<step name="verify_output">
验证所有文档成功创建：

```bash
ls -la .planning/codebase/
wc -l .planning/codebase/*.md
```

**验证清单：**
- 所有 7 个文档存在
- 没有空文档（每个应该 >20 行）

如果任何文档缺失或为空，记录哪些代理可能失败。

继续到 scan_for_secrets。
</step>

<step name="scan_for_secrets">
**关键安全检查：** 在提交前扫描输出文件以避免意外泄露的秘密。

运行秘密模式检测：

```bash
# 检查生成文档中的常见 API 密钥模式
grep -E '(sk-[a-zA-Z0-9]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9_-]+|AKIA[A-Z0-9]{16}|xox[baprs]-[a-zA-Z0-9-]+|-----BEGIN.*PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.)' .planning/codebase/*.md 2>/dev/null && SECRETS_FOUND=true || SECRETS_FOUND=false
```

**如果 SECRETS_FOUND=true：**

```
⚠️  安全警报：在代码库文档中检测到潜在秘密！

在以下内容中找到看起来像 API 密钥或令牌的模式：
[显示 grep 输出]

如果提交，这将暴露凭据。

**需要的操作：**
1. 检查上述标记的内容
2. 如果这些是真实的秘密，提交前必须删除
3. 考虑将敏感文件添加到 Claude Code "拒绝"权限

提交前暂停。如果标记的内容实际上不敏感，回复"安全继续"，或先编辑文件。
```

等待用户确认后再继续到 commit_codebase_map。

**如果 SECRETS_FOUND=false：**

继续到 commit_codebase_map。
</step>

<step name="commit_codebase_map">
提交代码库映射：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: 映射现有代码库" --files .planning/codebase/*.md
```

继续到 offer_next。
</step>

<step name="offer_next">
呈现完成摘要和下一步骤。

**获取行数：**
```bash
wc -l .planning/codebase/*.md
```

**输出格式：**

```
代码库映射完成。

创建了 .planning/codebase/：
- STACK.md ([N] 行) - 技术和依赖
- ARCHITECTURE.md ([N] 行) - 系统设计和模式
- STRUCTURE.md ([N] 行) - 目录布局和组织
- CONVENTIONS.md ([N] 行) - 代码样式和模式
- TESTING.md ([N] 行) - 测试结构和实践
- INTEGRATIONS.md ([N] 行) - 外部服务和 API
- CONCERNS.md ([N] 行) - 技术债务和问题


---

## ▶ 下一步

**初始化项目** — 使用代码库上下文进行规划

`/gsd:new-project`

<sub>`/clear` 首先 → 新鲜上下文窗口</sub>

---

**也可用：**
- 重新运行映射：`/gsd:map-codebase`
- 查看特定文件：`cat .planning/codebase/STACK.md`
- 在继续前编辑任何文档

---
```

结束工作流。
</step>

</process>

<success_criteria>
- 创建了 .planning/codebase/ 目录
- 生成了 4 个并行 gsd-codebase-mapper 代理，使用 run_in_background=true
- 代理直接编写文档（编排器不接收文档内容）
- 读取代理输出文件以收集确认
- 所有 7 个代码库文档存在
- 清晰的完成摘要，包含行数
- 用户获得清晰的 GSD 风格下一步
</success_criteria>