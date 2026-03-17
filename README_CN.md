# Get Shit Done 学习项目

深入学习 [get-shit-done](https://github.com/discreteprojects/get-shit-done) 框架 —— 一个为 Claude Code 设计的 AI 辅助开发框架。

[English](./README.md)

## 概述

本项目用于深入理解 GSD (Get Shit Done) 框架，分析其架构设计，并提取可复用的模式用于 AI 辅助开发。

## 学习目标

### 1. 框架能力分析
- 理解 GSD 的整体架构设计
- 掌握各个组件的职责和协作方式
- 分析框架如何实现"目标驱动的开发流程"

### 2. 核心概念

| 概念 | 说明 |
|------|------|
| **Roadmap** | 项目路线图，包含 milestones 和 phases |
| **Milestone** | 里程碑，一个完整的功能集合 |
| **Phase** | 开发阶段，milestone 的子任务单元 |
| **Agent** | 专业化子代理，执行特定类型任务 |
| **Hook** | 钩子函数，在特定时机触发 |

### 3. 组件结构

```
get-shit-done/
├── agents/          # 子代理定义
├── commands/        # 斜杠命令
├── hooks/           # Git/Claude 钩子
├── scripts/         # 辅助脚本
└── tests/           # 测试用例
```

### 4. 技巧提取
- Agent 编排模式：如何拆分任务给专业子代理
- 状态管理：如何持久化项目进度
- 交互设计：如何设计用户确认流程
- 错误处理：如何优雅地处理异常和中断

## 问题驱动学习

本项目采用问题驱动的方式学习，核心问题包括：

- 架构设计模式
- Agent 实现细节
- 状态管理机制
- 用户交互流程
- 可复用技巧

## 在线演示

🔗 **demo-by-gsd**: https://wangjs-jacky.github.io/get-shit-done-study/

> 基于 GSD 框架开发的前端设计技能展示应用

## 参考资源

- [GitHub 仓库](https://github.com/discreteprojects/get-shit-done)
- [中文 README](./get-shit-done/README.zh-CN.md)
- [更新日志](./get-shit-done/CHANGELOG.zh-CN.md)

## 许可证

MIT
