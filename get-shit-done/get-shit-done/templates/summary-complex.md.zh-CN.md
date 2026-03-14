---
phase: XX-name
plan: YY
subsystem: [主要类别]
tags: [可搜索的技术]
requires:
  - phase: [前一阶段]
    provides: [该阶段构建的内容]
provides:
  - [构建/交付内容的清单]
affects: [阶段名称或关键词列表]
tech-stack:
  added: [库/工具]
  patterns: [架构/代码模式]
key-files:
  created: [创建的重要文件]
  modified: [修改的重要文件]
key-decisions:
  - "决策 1"
patterns-established:
  - "模式 1: 描述"
duration: X分钟
completed: YYYY-MM-DD
---

# 阶段 [X]: [名称] 总结（复杂版）

**[描述结果的一行实质性内容]**

## 性能
- **持续时间：** [时间]
- **任务：** [完成数量]
- **修改文件数：** [数量]

## 成就
- [关键成果 1]
- [关键成果 2]

## 任务提交记录
1. **任务 1：[任务名称]** - `哈希值`
2. **任务 2：[任务名称]** - `哈希值`
3. **任务 3：[任务名称]** - `哈希值`

## 创建/修改的文件
- `path/to/file.ts` - 它的功能
- `path/to/another.ts` - 它的功能

## 决策记录
[关键决策及其简要理由]

## 与计划的偏差（自动修复）
[根据 GSD 偏差规则记录的详细自动修复记录]

## 遇到的问题
[计划工作中的问题及解决方案]

## 下一阶段准备情况
[下一阶段准备就绪的内容]
[阻塞点或关注点]