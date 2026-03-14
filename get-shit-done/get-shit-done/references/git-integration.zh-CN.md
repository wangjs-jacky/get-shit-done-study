<overview>
GSD 框架的 Git 集成。
</overview>

<core_principle>

**提交结果，而不是过程。**

Git 日志应该像已发布内容的变更日志，而不是规划活动的日记。
</core_principle>

<commit_points>

| 事件 | 提交？ | 原因 |
|------|--------|------|
| BRIEF + ROADMAP 创建 | 是 | 项目初始化 |
| PLAN.md 创建 | 否 | 中间步骤 - 与计划完成一起提交 |
| RESEARCH.md 创建 | 否 | 中间步骤 |
| DISCOVERY.md 创建 | 否 | 中间步骤 |
| **任务完成** | 是 | 工作的原子单元（每个任务一个提交） |
| **计划完成** | 是 | 元数据提交（SUMMARY + STATE + ROADMAP） |
| 交接创建 | 是 | 保存 WIP 状态 |

</commit_points>

<git_check>

```bash
[ -d .git ] && echo "GIT_EXISTS" || echo "NO_GIT"
```

如果是 NO_GIT：静默运行 `git init`。GSD 项目总是有自己的仓库。
</git_check>

<commit_formats>

<format name="initialization">
## 项目初始化（brief 和 roadmap 一起）

```
docs: 初始化 [项目名称] ([N] 个阶段)

[PROJECT.md 中的一行描述]

阶段：
1. [阶段名称]: [目标]
2. [阶段名称]: [目标]
3. [阶段名称]: [目标]
```

提交什么：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: 初始化 [项目名称] ([N] 个阶段)" --files .planning/
```

</format>

<format name="task-completion">
## 任务完成（在计划执行期间）

每个任务在完成后立即获得自己的提交。

```
{type}({阶段}-{计划}): {任务名称}

- [关键变更 1]
- [关键变更 2]
- [关键变更 3]
```

**提交类型：**
- `feat` - 新功能/功能
- `fix` - 错误修复
- `test` - 仅测试（TDD RED 阶段）
- `refactor` - 代码清理（TDD REFACTOR 阶段）
- `perf` - 性能改进
- `chore` - 依赖、配置、工具

**示例：**

```bash
# 标准任务
git add src/api/auth.ts src/types/user.ts
git commit -m "feat(08-02): 创建用户注册端点

- POST /auth/register 验证邮箱和密码
- 检查重复用户
- 成功时返回 JWT 令牌
"

# TDD 任务 - RED 阶段
git add src/__tests__/jwt.test.ts
git commit -m "test(07-02): 添加 JWT 生成的失败测试

- 测试令牌包含用户 ID 声明
- 测试令牌在 1 小时后过期
- 测试签名验证
"

# TDD 任务 - GREEN 阶段
git add src/utils/jwt.ts
git commit -m "feat(07-02): 实现 JWT 生成

- 使用 jose 库进行签名
- 包含用户 ID 和过期声明
- 使用 HS256 算法签名
"
```

</format>

<format name="plan-completion">
## 计划完成（所有任务完成后）

在所有任务提交后，一个最终的元数据提交捕获计划完成。

```
docs({阶段}-{计划}): 完成 [计划名称] 计划

任务完成：[N]/[N]
- [任务 1 名称]
- [任务 2 名称]
- [任务 3 名称]

SUMMARY: .planning/phases/XX-name/{阶段}-{计划}-SUMMARY.md
```

提交什么：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({阶段}-{计划}): 完成 [计划名称] 计划" --files .planning/phases/XX-name/{阶段}-{计划}-PLAN.md .planning/phases/XX-name/{阶段}-{计划}-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md
```

**注意：** 代码文件不包括在内 - 已按任务提交。

</format>

<format name="handoff">
## 交接（WIP）

```
wip: [阶段名称] 在任务 [X]/[Y] 处暂停

当前：[任务名称]
[如果被阻塞：] 阻塞：[原因]
```

提交什么：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "wip: [阶段名称] 在任务 [X]/[Y] 处暂停" --files .planning/
```

</format>
</commit_formats>

<example_log>

**旧方法（按计划提交）：**
```
a7f2d1 feat(checkout): 使用 webhook 验证的 Stripe 支付
3e9c4b feat(products): 带搜索、过滤和分页的产品目录
8a1b2c feat(auth): 使用 jose 的 JWT 和刷新轮换
5c3d7e feat(foundation): Next.js 15 + Prisma + Tailwind 脚手架
2f4a8d docs: 初始化电商应用 (5 个阶段)
```

**新方法（按任务提交）：**
```
# 第 04 阶段 - 结账
1a2b3c docs(04-01): 完成结账流程计划
4d5e6f feat(04-01): 添加 webhook 签名验证
7g8h9i feat(04-01): 实现支付会话创建
0j1k2l feat(04-01): 创建结账页面组件

# 第 03 阶段 - 产品
3m4n5o docs(03-02): 完成产品列表计划
6p7q8r feat(03-02): 添加分页控件
9s0t1u feat(03-02): 实现搜索和过滤
2v3w4x feat(03-01): 创建产品目录架构

# 第 02 阶段 - 认证
5y6z7a docs(02-02): 完成令牌刷新计划
8b9c0d feat(02-02): 实现刷新令牌轮换
1e2f3g test(02-02): 添加令牌刷新的失败测试
4h5i6j docs(02-01): 完成 JWT 设置计划
7k8l9m feat(02-01): 添加 JWT 生成和验证
0n1o2p chore(02-01): 安装 jose 库

# 第 01 阶段 - 基础设施
3q4r5s docs(01-01): 完成脚手架计划
6t7u8v feat(01-01): 配置 Tailwind 和全局样式
9w0x1y feat(01-01): 设置带数据库的 Prisma
2z3a4b feat(01-01): 创建 Next.js 15 项目

# 初始化
5c6d7e docs: 初始化电商应用 (5 个阶段)
```

每个计划产生 2-4 个提交（任务 + 元数据）。清晰、细粒度、可二分查找。

</example_log>

<anti_patterns>

**仍然不要提交（中间工件）：**
- PLAN.md 创建（与计划完成一起提交）
- RESEARCH.md（中间步骤）
- DISCOVERY.md（中间步骤）
- 次要规划调整
- "修复路线图中的拼写错误"

**要提交（结果）：**
- 每个任务完成（feat/fix/test/refactor）
- 计划完成元数据（docs）
- 项目初始化（docs）

**关键原则：** 提交工作代码和发布结果，而不是规划过程。
</anti_patterns>

<commit_strategy_rationale>

## 为什么按任务提交？

**AI 的上下文工程：**
- Git 历史成为未来 Claude 会话的主要上下文源
- `git log --grep="{阶段}-{计划}"` 显示计划的所有工作
- `git diff <hash>^..<hash>` 显示每个任务的确切变更
- 减少 SUMMARY.md 解析依赖 = 更多实际工作上下文

**失败恢复：**
- 任务 1 提交 ✅，任务 2 失败 ❌
- 下一会话中的 Claude：看到任务 1 完成，可以重试任务 2
- 可以 `git reset --hard` 回到最后成功的任务

**调试：**
- `git bisect` 找到确切的失败任务，而不仅仅是失败的计划
- `git blame` 将行跟踪到特定任务上下文
- 每个提交都可以独立撤销

**可观测性：**
- 独立开发者 + Claude 工作流程受益于细粒度归因
- 原子提交是 git 最佳实践
- 当消费者是 Claude 而不是人类时，"提交噪音"无关紧要

</commit_strategy_rationale>