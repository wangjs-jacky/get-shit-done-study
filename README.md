# Get Shit Done 学习项目

深入学习 [get-shit-done](https://github.com/discreteprojects/get-shit-done) 框架 —— 一个为 Claude Code 设计的 AI 辅助开发框架。

[English](./README.md)

## 项目结构

本项目包含三个主要部分：

### 📦 get-shit-done

GSD 框架的源码目录，包含完整的中文翻译：
- `README.zh-CN.md` - 中文 README
- `CHANGELOG.zh-CN.md` - 中文更新日志

框架核心组件：
- `agents/` - 子代理定义（executor、planner、researcher 等）
- `commands/` - 斜杠命令（/gsd:* 系列命令）
- `hooks/` - Git/Claude 钩子
- `scripts/` - 辅助脚本

### 📝 notes

学习笔记目录，记录对 GSD 框架的研究和理解：

| 目录/文件 | 内容说明 |
|-----------|----------|
| `gsd/` | GSD 框架核心概念解析 |
| `architecture/` | 架构设计相关笔记 |
| `commands/` | 命令系统分析 |
| `design/` | 设计模式收集 |
| `gsd-execution-model.md` | 执行模型详解 |
| `gsd-init-execute-phase.md` | 初始化与执行阶段说明 |
| `gsd-interruption-guide.md` | 中断恢复机制指南 |
| `reusable-designs/` | 可复用设计模式 |

### 🚀 demo-by-gsd

基于 GSD 框架实际开发的演示项目（前端设计技能展示应用）：

🔗 **在线演示**: https://wangjs-jacky.github.io/get-shit-done-study/

技术栈：
- **Astro** - 静态站点生成器
- **React 19** - UI 框架
- **Tailwind CSS 4** - 样式系统
- **Vitest** - 测试框架

功能特性：
- 多种前端设计主题展示（Terminal Noir、Cyberpunk、Glassmorphism 等）
- 实时预览面板
- 一键复制代码功能
- 响应式布局

项目结构遵循 GSD 的 `.planning/` 规范，包含完整的 Roadmap 和 Phase 规划。

## GSD 核心概念

| 概念 | 说明 |
|------|------|
| **Roadmap** | 项目路线图，包含 milestones 和 phases |
| **Milestone** | 里程碑，一个完整的功能集合 |
| **Phase** | 开发阶段，milestone 的子任务单元 |
| **Agent** | 专业化子代理，执行特定类型任务 |
| **Hook** | 钩子函数，在特定时机触发 |

## 学习目标

1. **框架能力分析** - 理解 GSD 的整体架构设计和组件协作方式
2. **Agent 编排模式** - 学习如何拆分任务给专业子代理
3. **状态管理** - 掌握项目进度的持久化机制
4. **实践验证** - 通过 demo-by-gsd 项目验证学习成果

## 参考资源

- [GSD 官方仓库](https://github.com/discreteprojects/get-shit-done)
- [GSD 中文 README](./get-shit-done/README.zh-CN.md)
- [GSD 中文更新日志](./get-shit-done/CHANGELOG.zh-CN.md)

## 许可证

MIT
