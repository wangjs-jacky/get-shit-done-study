# 更新日志

GSD 的所有显著更改都将记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)。

## [未发布]

### 新增
- **节点修复操作符** (`workflows/node-repair.md`) — 任务验证失败时的自主恢复。不是立即询问用户，执行器尝试结构化修复：RETRY（不同方法）、DECOMPOSE（分解为子任务）或PRUNE（跳过并有理由）。仅在修复预算耗尽或需要架构决策时才升级到用户。修复预算默认为每个任务2次尝试；可通过 `workflow.node_repair_budget` 配置。使用 `workflow.node_repair: false` 完全禁用以恢复原始行为。

## [1.22.4] - 2026-03-03

### 新增
- `/gsd:quick` 的 `--discuss` 标志 — 快速任务前轻量级规划讨论以收集上下文

### 修复
- Windows：大初始化负载（>50KB）的 `@file:` 协议解析 — 所有32个工作流/代理文件现在解析临时文件路径，而不是让代理产生 `/tmp` 路径幻觉（#841）
- gsd-nyquist-auditor 代理缺少 `skills` frontmatter

## [1.22.3] - 2026-03-03

### 新增
- Verify-work 为修改服务器、数据库、种子或启动文件的阶段自动注入冷启动冒烟测试 — 捕捉热状态盲点

### 更改
- 将 `depth` 设置重命名为 `granularity`，值为 `coarse`/`standard`/`fine`，以准确反映它控制的内容（阶段数，而非调查深度）。向后兼容的迁移自动重命名现有配置。

### 修复
- 安装程序现在为非 Claude 运行时替换 `$HOME/.claude/` 路径（不仅仅是 `~/.claude/`）— 修复本地安装和 Gemini/OpenCode/Codex 安装的损坏命令（#905，#909）

## [1.22.2] - 2026-03-03

### 修复
- Codex 安装程序不再在重新安装时创建重复的 `[features]` 和 `[agents]` 部分（#902，#882）
- 上下文监控钩子是对非 GSD 工作流的建议性而非阻塞性
- 钩子尊重自定义配置目录的 `CLAUDE_CONFIG_DIR`
- 钩子包含 stdin 超时保护，防止管道错误时挂起
- 状态栏上下文缩放匹配自动压缩缓冲区阈值
- 间隙闭合计划计算波浪号而非硬编码波浪1
- `auto_advance` 配置标志不再跨会话持久化
- 阶段完成扫描 ROADMAP.md 作为下一阶段检测的回退
- `getMilestoneInfo()` 优先选择进行中的里程碑标记，而不是总是返回第一个
- 状态解析支持粗体和普通字段格式
- 阶段计数限定在当前里程碑内
- 当阶段目录尚不存在时，总阶段数从 ROADMAP 派生
- OpenCode 检测运行时配置目录而不是硬编码 `.claude`
- Gemini 钩子使用 `AfterTool` 事件而不是 `PostToolUse`
- CLI 路由器中保留多词提交消息
- 里程碑/状态助手中的正则表达式模式已正确转义

---
*注意：这是一个简化版本，只包含最近的更新。完整版本请参考原始 CHANGELOG.md。*