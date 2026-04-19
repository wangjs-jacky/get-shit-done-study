---
article_id: OBA-s9xd95nc
tags: [open-source, get-shit-done, gsd-analysis, react, ai-agent, ai]
type: learning
updated_at: 2026-03-17
---

# GSD YOLO 模式设计分析

> YOLO 模式是一个"减少确认点，让 agents 自主决策推进"的设计，但也带来了用户参与感的问题。

## 什么是 YOLO 模式

YOLO (You Only Live Once) 模式是 GSD 框架中的一种工作流配置：

```json
// .planning/config.json
{
  "mode": "yolo",
  "granularity": "standard",
  "parallelization": true,
  "commit_docs": true,
  "model_profile": "balanced"
}
```

**核心特点**：减少人工确认环节，让 AI agents 自主做出决策并推进项目。

## YOLO 模式的工作流程

```
/gsd:new-project
    ↓
派出 4 个 research agents（Stack, Features, Architecture, Pitfalls）
    ↓
agents 自主做技术选型决策
    ↓
直接写入 ROADMAP.md / STATE.md
    ↓
没有问用户"你想用什么框架？"
```

## 设计亮点

| 优点 | 说明 |
|------|------|
| **效率高** | 减少来回确认，项目快速启动 |
| **自动化程度高** | agents 自主完成研究和决策 |
| **适合信任 AI 的用户** | 如果你相信 AI 的判断，很省心 |

## 发现的问题：用户参与感缺失

### 决策层级与用户参与

| 层级 | 当前流程 | 用户参与 |
|------|----------|----------|
| **项目级技术栈** | research agent 自主决定 | ❌ 用户没参与 |
| **阶段级细节** | discuss-phase（可选） | ✅ 用户可参与 |
| **任务级步骤** | plan-phase | ✅ 用户审批 |

### 问题本质

**项目级的技术栈决策没有用户确认环节**。

用户在 `/gsd:new-project` 后，发现技术栈已经被决定了（比如 Astro + React + Tailwind），但没有被问过"你想用什么框架？"。

## 对比：discuss-phase vs 项目级决策

`discuss-phase` 是"阶段级"澄清，用于：
- 技术选型讨论
- 实现路径讨论
- 边界条件确认

但"项目级"的技术栈决策在 `new-project` 阶段就被 research agents 做了，用户没有机会参与。

## 可能的改进方向

1. **增加项目级确认点** - 在 research agents 做出技术选型后，暂停让用户确认
2. **提供"保守模式"** - 关键决策前总是询问用户
3. **明确告知** - 在 new-project 完成后，高亮显示"以下决策已自动做出，如需修改请告知"

## 补救方案

如果用户对自动做出的决策不满意：

1. **推翻决策** - 告诉 AI 想用什么技术栈，更新 PROJECT.md 和 ROADMAP.md
2. **保持现状** - 如果自动选型 OK
3. **重新讨论** - 告诉 AI 技术偏好，一起重新评估

---

## 关键洞察

YOLO 模式是一个权衡设计：
- **效率 vs 参与感**
- **自动化 vs 控制权**

对于熟悉 AI 能力、信任 AI 判断的用户，YOLO 模式很高效。
对于想要更多控制权的用户，可能需要"保守模式"或手动确认关键决策。

---

*记录时间：2026-03-15*
*来源：get-shit-done-study 项目实践*
