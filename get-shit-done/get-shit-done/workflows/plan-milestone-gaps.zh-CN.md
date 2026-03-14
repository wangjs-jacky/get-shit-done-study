<purpose>
创建所有必要的阶段来关闭 `/gsd:audit-milestone` 识别的差距。读取 MILESTONE-AUDIT.md，将差距分组到逻辑阶段，在 ROADMAP.md 中创建阶段条目，并提议计划每个阶段。一个命令创建所有修复阶段 — 无需每个差距手动 `/gsd:add-phase`。
</purpose>

<必读资料>
在开始前读取调用提示的 execution_context 引用的所有文件。
</必读资料>

<流程>

## 1. 加载审核结果

```bash
# 查找最近的审核文件
ls -t .planning/v*-MILESTONE-AUDIT.md 2>/dev/null | head -1
```

解析 YAML frontmatter 以提取结构化的差距：
- `gaps.requirements` — 未满足的需求
- `gaps.integration` — 缺少跨阶段连接
- `gaps.flows` — 损坏的端到端流程

如果没有审核文件或没有差距，显示错误：
```
未找到审核差距。请先运行 `/gsd:audit-milestone`。
```

## 2. 优先级排序差距

根据 REQUIREMENTS.md 按优先级分组差距：

| 优先级 | 动作 |
|----------|--------|
| `must` | 创建阶段，阻碍里程碑 |
| `should` | 创建阶段，推荐 |
| `nice` | 询问用户：包含还是推迟？ |

对于集成/流程差距，从受影响的需求推断优先级。

## 3. 将差距分组到阶段

将相关差距聚类到逻辑阶段中：

**分组规则：**
- 相同受影响的阶段 → 合并到一个修复阶段
- 相同的子系统（认证、API、UI）→ 合并
- 依赖顺序（先修复桩，再连接）
- 保持阶段专注：每个 2-4 个任务

**示例分组：**
```
差距：DASH-01 未满足（仪表板不获取数据）
差距：集成阶段 1→3（认证未传递给 API 调用）
差距：流程"查看仪表板"在数据获取时损坏

→ 阶段 6："将仪表板连接到 API"
  - 在 Dashboard.tsx 中添加获取
  - 在获取中包含认证头
  - 处理响应，更新状态
  - 渲染用户数据
```

## 4. 确定阶段编号

找到最高现有阶段：
```bash
# 获取排序的阶段列表，提取最后一个
PHASES=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phases list)
HIGHEST=$(printf '%s\n' "$PHASES" | jq -r '.directories[-1]')
```

新阶段从那里继续：
- 如果阶段 5 是最高的，差距变成阶段 6、7、8...

## 5. 展示差距关闭计划

```markdown
## 差距关闭计划

**里程碑：** {version}
**要关闭的差距：** {N} 个需求，{M} 个集成，{K} 个流程

### 提议的阶段

**阶段 {N}: {名称}**
关闭：
- {REQ-ID}: {描述}
- 集成：{从} → {到}
任务数：{count}

**阶段 {N+1}: {名称}**
关闭：
- {REQ-ID}: {描述}
- 流程：{流程名称}
任务数：{count}

{如果存在 nice-to-have 差距：}

### 推迟（nice-to-have）

这些差距是可选的。包含它们吗？
- {差距描述}
- {差距描述}

---

创建这些 {X} 个阶段吗？(yes / adjust / defer all optional)
```

等待用户确认。

## 6. 更新 ROADMAP.md

向当前里程碑添加新阶段：

```markdown
### 阶段 {N}: {名称}
**目标：**（从要关闭的差距推导）
**需求：** （要满足的 REQ-ID）
**差距关闭：** 从审核关闭差距

### 阶段 {N+1}: {名称}
...
```

## 7. 更新 REQUIREMENTS.md 可追溯性表（必需）

对于分配给差距关闭阶段的每个 REQ-ID：
- 更新阶段列以反映新的差距关闭阶段
- 重置状态为 `Pending`

重置审核发现未满足的已勾选需求：
- 将任何审核标记为未满足的需求的 `[x]` 改为 `[ ]`
- 更新 REQUIREMENTS.md 顶部的覆盖率计数

```bash
# 验证可追溯性表反映差距关闭分配
grep -c "Pending" .planning/REQUIREMENTS.md
```

## 8. 创建阶段目录

```bash
mkdir -p ".planning/phases/{NN}-{name}"
```

## 9. 提交路线图和需求更新

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(roadmap): add gap closure phases {N}-{M}" --files .planning/ROADMAP.md .planning/REQUIREMENTS.md
```

## 10. 提供下一步

```markdown
## ✓ 差距关闭阶段已创建

**添加的阶段：** {N} - {M}
**解决的差距：** {count} 个需求，{count} 个集成，{count} 个流程

---

## ▶ 接下来做什么

**计划第一个差距关闭阶段**

`/gsd:plan-phase {N}`

<sub>`/clear` 首先 → 新鲜的上下文窗口</sub>

---

**也可用：**
- `/gsd:execute-phase {N}` — 如果计划已存在
- `cat .planning/ROADMAP.md` — 查看更新的路线图

---

**所有差距阶段完成后：**

`/gsd:audit-milestone` — 重新审核以验证差距已关闭
`/gsd:complete-milestone {version}` — 审核通过时存档
```

</process>

<gap_to_phase_mapping>

## 差距如何变成任务

**需求差距 → 任务：**
```yaml
gap:
  id: DASH-01
  description: "用户看到他们的数据"
  reason: "仪表板存在但不从 API 获取"
  missing:
    - "使用 useEffect 获取 /api/user/data"
    - "用户数据的状态"
    - "在 JSX 中渲染用户数据"

变成：

phase: "连接仪表板数据"
tasks:
  - name: "添加数据获取"
    files: [src/components/Dashboard.tsx]
    action: "添加在挂载时获取 /api/user/data 的 useEffect"

  - name: "添加状态管理"
    files: [src/components/Dashboard.tsx]
    action: "为 userData、loading、error 状态添加 useState"

  - name: "渲染用户数据"
    files: [src/components/Dashboard.tsx]
    action: "用 userData.map 渲染替换占位符"
```

**集成差距 → 任务：**
```yaml
gap:
  from_phase: 1
  to_phase: 3
  connection: "认证令牌 → API 调用"
  reason: "仪表板 API 调用不包含认证头"
  missing:
    - "获取调用中的认证头"
    - "401 时刷新令牌"

变成：

phase: "为仪表板 API 调用添加认证"
tasks:
  - name: "为获取添加认证头"
    files: [src/components/Dashboard.tsx, src/lib/api.ts]
    action: "在所有 API 调用中包含带有令牌的 Authorization 头"

  - name: "处理 401 响应"
    files: [src/lib/api.ts]
    action: "添加拦截器在 401 时刷新令牌或重定向到登录"
```

**流程差距 → 任务：**
```yaml
gap:
  name: "用户登录后查看仪表板"
  broken_at: "仪表板数据加载"
  reason: "没有获取调用"
  missing:
    - "挂载时获取用户数据"
    - "显示加载状态"
    - "渲染用户数据"

变成：

# 通常与其他差距类型相同阶段
# 流程差距通常与其他差距类型重叠
```

</gap_to_phase_mapping>

<success_criteria>
当满足以下条件时，差距关闭完成：

- [ ] MILESTONE-AUDIT.md 已加载并差距已解析
- [ ] 差距已优先级排序（must/should/nice）
- [ ] 差距已分组到逻辑阶段
- [ ] 用户确认了阶段计划
- [ ] ROADMAP.md 已用新阶段更新
- [ ] REQUIREMENTS.md 可追溯性表已用差距关闭阶段分配更新
- [ ] 未满足的需求复选框已重置（`[x]` → `[ ]`）
- [ ] REQUIREMENTS.md 中的覆盖率计数已更新
- [ ] 阶段目录已创建
- [ ] 更改已提交（包含 REQUIREMENTS.md）
- [ ] 用户知道下一步运行 `/gsd:plan-phase`
</success_criteria>