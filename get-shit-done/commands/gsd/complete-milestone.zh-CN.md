---
type: prompt
name: gsd:complete-milestone
description: 归档已完成的里程碑并为下一个版本做准备
argument-hint: <版本>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
将里程碑 {{version}} 标记为已完成，归档到 milestones/ 中，并更新 ROADMAP.md 和 REQUIREMENTS.md。

目的：创建已发布版本的历史记录，归档里程碑成果（路线图 + 需求），并为下一个里程碑做准备。
输出：里程碑已归档（路线图 + 需求），PROJECT.md 已演进，Git 已标记。
</objective>

<execution_context>
**立即加载这些文件（在继续之前）：**

- @~/.claude/get-shit-done/workflows/complete-milestone.md（主工作流）
- @~/.claude/get-shit-done/templates/milestone-archive.md（归档模板）
  </execution_context>

<context>
**项目文件：**
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`

**用户输入：**

- 版本：{{version}}（例如："1.0"、"1.1"、"2.0"）
  </context>

<process>

**遵循 complete-milestone.md 工作流：**

0. **检查审核：**

   - 查找 `.planning/v{{version}}-MILESTONE-AUDIT.md`
   - 如果缺失或过时：建议先运行 `/gsd:audit-milestone`
   - 如果审核状态为 `gaps_found`：建议先运行 `/gsd:plan-milestone-gaps`
   - 如果审核状态为 `passed`：进入第 1 步

   ```markdown
   ## 起飞前检查

   {如果不存在 v{{version}}-MILESTONE-AUDIT.md:}
   ⚠ 未找到里程碑审核。请先运行 `/gsd:audit-milestone` 验证
   需求覆盖、跨阶段集成和 E2E 流程。

   {如果审核有差距：}
   ⚠ 里程碑审核发现差距。请运行 `/gsd:plan-milestone-gaps` 创建
   弥合差距的阶段，或接受技术债务继续。

   {如果审核通过：}
   ✓ 里程碑审核通过。继续完成流程。
   ```

1. **验证准备就绪：**

   - 检查里程碑中的所有阶段都有完成计划（SUMMARY.md 存在）
   - 呈现里程碑范围和统计信息
   - 等待确认

2. **收集统计信息：**

   - 计算阶段数、计划数、任务数
   - 计算 Git 范围、文件更改、代码行数
   - 从 Git 日志中提取时间线
   - 呈现摘要，确认

3. **提取成就：**

   - 读取里程碑范围内的所有阶段 SUMMARY.md 文件
   - 提取 4-6 个关键成就
   - 呈现获得批准

4. **归档里程碑：**

   - 创建 `.planning/milestones/v{{version}}-ROADMAP.md`
   - 从 ROADMAP.md 中提取完整的阶段详情
   - 填充 milestone-archive.md 模板
   - 更新 ROADMAP.md 为单行摘要并带有链接

5. **归档需求：**

   - 创建 `.planning/milestones/v{{version}}-REQUIREMENTS.md`
   - 将所有 v1 需求标记为完成（复选框已勾选）
   - 记录需求结果（已验证、已调整、已删除）
   - 删除 `.planning/REQUIREMENTS.md`（为下一个里程碑创建新的）

6. **更新 PROJECT.md：**

   - 添加带有已发布版本的"当前状态"部分
   - 添加"下一个里程碑目标"部分
   - 将以前的内容归档在 `<details>` 中（如果是 v1.1+）

7. **提交和标记：**

   - 暂存：MILESTONES.md、PROJECT.md、ROADMAP.md、STATE.md、归档文件
   - 提交：`chore: archive v{{version}} milestone`
   - 标记：`git tag -a v{{version}} -m "[里程碑摘要]"`
   - 询问是否推送标签

8. **提供下一步操作：**
   - `/gsd:new-milestone` — 开始下一个里程碑（疑问 → 研究 → 需求 → 路线图）

</process>

<success_criteria>

- 里程碑归档到 `.planning/milestones/v{{version}}-ROADMAP.md`
- 需求归档到 `.planning/milestones/v{{version}}-REQUIREMENTS.md`
- `.planning/REQUIREMENTS.md` 已删除（为下一个里程碑创建新的）
- ROADMAP.md 收缩为单行条目
- PROJECT.md 已更新当前状态
- Git 标签 v{{version}} 已创建
- 提交成功
- 用户知道下一步操作（包括新鲜需求的需求）
  </success_criteria>

<critical_rules>

- **先加载工作流：** 执行前先读取 complete-milestone.md
- **验证完成情况：** 所有阶段必须 SUMMARY.md 文件
- **用户确认：** 在验证门控处等待批准
- **先归档再删除：** 总是在更新/删除原始文件前创建归档文件
- **单行摘要：** ROADMAP.md 中的收缩里程碑应该是单行并带有链接
- **上下文效率：** 归档使 ROADMAP.md 和 REQUIREMENTS.md 每个里程碑保持恒定大小
- **新鲜需求：** 下一个里程碑以包含需求定义的 `/gsd:new-milestone` 开始
  </critical_rules>