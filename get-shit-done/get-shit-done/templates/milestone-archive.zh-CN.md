# 里程碑存档模板

此模板由 complete-milestone 工作流使用，在 `.planning/milestones/` 中创建存档文件。

---

## 文件模板

# 里程碑 v{{VERSION}}: {{MILESTONE_NAME}}

**状态：** ✅ 已发布 {{DATE}}
**阶段：** {{PHASE_START}}-{{PHASE_END}}
**总计划：** {{TOTAL_PLANS}}

## 概述

{{MILESTONE_DESCRIPTION}}

## 阶段

{{PHASES_SECTION}}

[此里程碑中的每个阶段都包括：]

### 阶段 {{PHASE_NUM}}: {{PHASE_NAME}}

**目标：** {{PHASE_GOAL}}
**依赖：** {{DEPENDS_ON}}
**计划：** {{PLAN_COUNT}} 个计划

计划：

- [x] {{PHASE}}-01: {{PLAN_DESCRIPTION}}
- [x] {{PHASE}}-02: {{PLAN_DESCRIPTION}}
      [... 所有计划 ...]

**详情：**
{{PHASE_DETAILS_FROM_ROADMAP}}

**对于十进制阶段，包含 (INSERTED) 标记：**

### 阶段 2.1：关键安全补丁 (INSERTED)

**目标：** 修复身份验证绕过漏洞
**依赖：** 阶段 2
**计划：** 1 个计划

计划：

- [x] 02.1-01: 补丁认证漏洞

**详情：**
{{PHASE_DETAILS_FROM_ROADMAP}}

---

## 里程碑总结

**十进制阶段：**

- 阶段 2.1：关键安全补丁（阶段 2 后插入用于紧急修复）
- 阶段 5.1：性能热修复（阶段 5 后插入用于生产问题）

**关键决策：**
{{DECISIONS_FROM_PROJECT_STATE}}
[示例：]

- 决策：使用 ROADMAP.md 拆分（理由：持续上下文成本）
- 决策：十进制阶段编号（理由：清晰的插入语义）

**已解决的问题：**
{{ISSUES_RESOLVED_DURING_MILESTONE}}
[示例：]

- 修复了 100+ 阶段的上下文溢出
- 解决了阶段插入混乱

**延迟的问题：**
{{ISSUES_DEFERRED_TO_LATER}}
[示例：]

- PROJECT-STATE.md 分层（延迟到决策 > 300）

**技术债务：**
{{SHORTCUTS_NEEDING_FUTURE_WORK}}
[示例：]

- 某些工作流仍有硬编码路径（阶段 5 修复）

---

_当前项目状态，请参阅 .planning/ROADMAP.md_

---

## 使用指南

<guidelines>
**何时创建里程碑存档：**
- 完成里程碑中的所有阶段后（v1.0、v1.1、v2.0 等）
- 由 complete-milestone 工作流触发
- 规划下一个里程碑工作前

**如何填写模板：**

- 用实际值替换 {{PLACEHOLDERS}}
- 从 ROADMAP.md 提取阶段详情
- 用 (INSERTED) 标记记录十进制阶段
- 包括来自 PROJECT-STATE.md 或 SUMMARY 文件的关键决策
- 列出已解决与延迟的问题
- 捕获技术债务以供将来参考

**存档位置：**

- 保存到 `.planning/milestones/v{VERSION}-{NAME}.md`
- 示例：`.planning/milestones/v1.0-mvp.md`

**存档后：**

- 更新 ROADMAP.md 以将完成的里程碑折叠在 `<details>` 标签中
- 更新 PROJECT.md 以包含当前状态的棕地格式
- 在下一个里程碑中继续阶段编号（永不重新从 01 开始）
</guidelines>