<目的>
审核已完成阶段的 Nyquist 验证漏洞。生成缺失的测试。更新 VALIDATION.md。
</目的>

<必读资料>
@~/.claude/get-shit-done/references/ui-brand.md
</必读资料>

<流程>

## 0. 初始化

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析: `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`。

```bash
AUDITOR_MODEL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-nyquist-auditor --raw)
NYQUIST_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config get workflow.nyquist_validation --raw)
```

如果 `NYQUIST_CFG` 为 `false`：退出并显示 "Nyquist validation is disabled. Enable via /gsd:settings."

显示横幅: `GSD > VALIDATE PHASE {N}: {name}`

## 1. 检测输入状态

```bash
VALIDATION_FILE=$(ls "${PHASE_DIR}"/*-VALIDATION.md 2>/dev/null | head -1)
SUMMARY_FILES=$(ls "${PHASE_DIR}"/*-SUMMARY.md 2>/dev/null)
```

- **状态 A** (`VALIDATION_FILE` 非空)：审核现有文件
- **状态 B** (`VALIDATION_FILE` 为空，`SUMMARY_FILES` 非空)：从工件重建
- **状态 C** (`SUMMARY_FILES` 为空)：退出 — "Phase {N} not executed. Run /gsd:execute-phase {N} first."

## 2. 发现

### 2a. 读取阶段工件

读取所有 PLAN 和 SUMMARY 文件。提取：任务列表、需求 ID、关键文件更改、验证块。

### 2b. 构建需求到任务映射

每个任务: `{ task_id, plan_id, wave, requirement_ids, has_automated_command }`

### 2c. 检测测试基础设施

状态 A：从现有的 VALIDATION.md 测试基础设施表中解析。
状态 B：文件系统扫描：

```bash
find . -name "pytest.ini" -o -name "jest.config.*" -o -name "vitest.config.*" -o -name "pyproject.toml" 2>/dev/null | head -10
find . \( -name "*.test.*" -o -name "*.spec.*" -o -name "test_*" \) -not -path "*/node_modules/*" 2>/dev/null | head -40
```

### 2d. 交叉引用

通过文件名、导入、测试描述将每个需求与现有测试匹配。记录：requirement → test_file → status。

## 3. 差距分析

分类每个需求：

| 状态 | 标准 |
|------|------|
| COVERED | 测试存在，目标行为，运行通过 |
| PARTIAL | 测试存在，失败或不完整 |
| MISSING | 未找到测试 |

构建: `{ task_id, requirement, gap_type, suggested_test_path, suggested_command }`

无差距 → 跳至步骤 6，设置 `nyquist_compliant: true`。

## 4. 展示差距计划

调用 AskUserQuestion，显示差距表和选项：
1. "Fix all gaps" → 步骤 5
2. "Skip — mark manual-only" → 添加到 Manual-Only，步骤 6
3. "Cancel" → 退出

## 5. 生成 gsd-nyquist-auditor

```
Task(
  prompt="Read ~/.claude/agents/gsd-nyquist-auditor.md for instructions.\n\n" +
    "<files_to_read>{PLAN, SUMMARY, impl files, VALIDATION.md}</files_to_read>" +
    "<gaps>{gap list}</gaps>" +
    "<test_infrastructure>{framework, config, commands}</test_infrastructure>" +
    "<constraints>Never modify impl files. Max 3 debug iterations. Escalate impl bugs.</constraints>",
  subagent_type="gsd-nyquist-auditor",
  model="{AUDITOR_MODEL}",
  description="Fill validation gaps for Phase {N}"
)
```

处理返回：
- `## GAPS FILLED` → 记录测试 + 映射更新，步骤 6
- `## PARTIAL` → 记录已解决，将升级的移至 manual-only，步骤 6
- `## ESCALATE` → 将所有移至 manual-only，步骤 6

## 6. 生成/更新 VALIDATION.md

**状态 B（创建）：**
1. 从 `~/.claude/get-shit-done/templates/VALIDATION.md` 读取模板
2. 填充：frontmatter、测试基础设施、每个任务映射、Manual-Only、签署
3. 写入 `${PHASE_DIR}/${PADDED_PHASE}-VALIDATION.md`

**状态 A（更新）：**
1. 更新每个任务映射状态，将升级的添加到 Manual-Only，更新 frontmatter
2. 追加审核轨迹：

```markdown
## Validation Audit {date}
| 指标 | 数量 |
|------|------|
| 发现的差距 | {N} |
| 已解决 | {M} |
| 已升级 | {K} |
```

## 7. 提交

```bash
git add {test_files}
git commit -m "test(phase-${PHASE}): add Nyquist validation tests"

node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit-docs "docs(phase-${PHASE}): add/update validation strategy"
```

## 8. 结果 + 路由

**合规：**
```
GSD > PHASE {N} IS NYQUIST-COMPLIANT
All requirements have automated verification.
▶ Next: /gsd:audit-milestone
```

**部分：**
```
GSD > PHASE {N} VALIDATED (PARTIAL)
{M} automated, {K} manual-only.
▶ Retry: /gsd:validate-phase {N}
```

显示 `/clear` 提醒。

</流程>

<成功标准>
- [ ] Nyquist 配置已检查（如果禁用则退出）
- [ ] 输入状态已检测（A/B/C）
- [ ] 状态 C 清理退出
- [ ] PLAN/SUMMARY 文件已读取，需求映射已构建
- [ ] 测试基础设施已检测
- [ ] 差距已分类（COVERED/PARTIAL/MISSING）
- [ ] 用户使用差距表进行把关
- [ ] Auditor 已生成完整上下文
- [ ] 所有三种返回格式已处理
- [ ] VALIDATION.md 已创建或更新
- [ ] 测试文件已单独提交
- [ ] 结果和路由已呈现
</成功标准>