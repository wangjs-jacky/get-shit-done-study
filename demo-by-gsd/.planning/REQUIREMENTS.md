# Requirements: Frontend Design Gallery

**Defined:** 2026-03-15
**Core Value:** 让开发者在几秒钟内找到并复制他们想要的 UI 风格 prompt

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Layout & Structure

- [ ] **LAYT-01**: 左右分栏布局 - 左侧预览区 + 右侧风格列表
- [ ] **LAYT-02**: 响应式设计 - 移动端堆叠布局
- [x] **LAYT-03**: 页面标题和简介说明网站用途

### Live Preview

- [ ] **PREV-01**: 功能性演示应用（番茄时钟），有真实交互
- [ ] **PREV-02**: 点击风格后左侧立即更新预览（无页面刷新）
- [ ] **PREV-03**: 预览区显示完整的演示应用，包含所有 UI 元素
- [ ] **PREV-04**: 演示应用有真实的计时器功能

### Style List

- [ ] **STYL-01**: 右侧列出所有可用风格
- [ ] **STYL-02**: 每个风格卡片显示风格名称和简短描述
- [ ] **STYL-03**: 当前选中风格有视觉高亮
- [ ] **STYL-04**: 风格列表可滚动（移动端横向滚动）

### Copy Functionality

- [ ] **COPY-01**: "Copy Prompt" 按钮 - 一键复制风格 prompt 到剪贴板
- [ ] **COPY-02**: 复制成功提示（Toast 通知）
- [ ] **COPY-03**: 复制的 prompt 适合粘贴到 CLAUDE.md 文件
- [ ] **COPY-04**: 复制按钮有清晰的视觉标识

### Style Data

- [x] **DATA-01**: 风格数据从 frontend-design skill 提取
- [x] **DATA-02**: 所有风格代码预生成（构建时生成）
- [x] **DATA-03**: 风格数据包含：ID、名称、描述、CSS 变量、prompt 文本

### Performance

- [x] **PERF-01**: 风格切换时间 < 100ms
- [x] **PERF-02**: 初始页面加载 < 3s
- [x] **PERF-03**: 无 FOUC（Flash of Unstyled Content）

### Deployment

- [ ] **DEPL-01**: 自动部署到 GitHub Pages
- [ ] **DEPL-02**: 推送到 main 分支时自动触发部署
- [ ] **DEPL-03**: 使用 GitHub Actions 进行 CI/CD

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Preview

- **PREV-05**: Dark/Light 模式切换
- **PREV-06**: 多个演示应用可选（番茄时钟、待办事项等）
- **PREV-07**: 风格对比模式（并排显示两个风格）

### Enhanced Navigation

- **NAVG-01**: 键盘导航支持
- **NAVG-02**: 风格分类/标签筛选
- **NAVG-03**: 风格搜索功能

### User Experience

- **UX-01**: 记住用户上次选择的风格（localStorage）
- **UX-02**: 风格预览网格视图
- **UX-03**: 复制历史记录

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 实时生成代码 | 避免复杂性和延迟，所有风格代码预生成 |
| 用户上传自定义风格 | v1 专注展示已有风格，避免审核负担 |
| 用户账户系统 | 不需要登录即可使用 |
| 风格编辑器 | 超出展示和复制的核心目标 |
| 多语言支持 | v1 仅中文 |
| 实时协作 | 过于复杂，超出核心功能 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYT-01 | Phase 1 | Pending |
| LAYT-02 | Phase 1 | Pending |
| LAYT-03 | Phase 1 | Complete |
| PREV-01 | Phase 2 | Pending |
| PREV-02 | Phase 2 | Pending |
| PREV-03 | Phase 2 | Pending |
| PREV-04 | Phase 2 | Pending |
| STYL-01 | Phase 1 | Pending |
| STYL-02 | Phase 1 | Pending |
| STYL-03 | Phase 1 | Pending |
| STYL-04 | Phase 1 | Pending |
| COPY-01 | Phase 3 | Pending |
| COPY-02 | Phase 3 | Pending |
| COPY-03 | Phase 3 | Pending |
| COPY-04 | Phase 3 | Pending |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| PERF-01 | Phase 2 | Complete |
| PERF-02 | Phase 2 | Complete |
| PERF-03 | Phase 2 | Complete |
| DEPL-01 | Phase 4 | Pending |
| DEPL-02 | Phase 4 | Pending |
| DEPL-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after initial definition*
