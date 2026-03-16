# Phase 4: Deployment - Research

**Researched:** 2026-03-16
**Domain:** GitHub Pages deployment with GitHub Actions CI/CD
**Confidence:** HIGH

## Summary

本阶段研究如何将 Astro 6.x 项目部署到 GitHub Pages，使用 GitHub Actions 实现自动化 CI/CD。Astro 官方提供了 `withastro/action` GitHub Action，这是部署到 GitHub Pages 的推荐方式，配置简单且与 Astro 生态紧密集成。

**Primary recommendation:** 使用 Astro 官方的 `withastro/action@v5` + `actions/deploy-pages@v4` 组合，这是 Astro 官方推荐的最佳实践。

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEPL-01 | 自动部署到 GitHub Pages | `withastro/action` + `actions/deploy-pages` 实现自动部署 |
| DEPL-02 | 推送到 main 分支时自动触发部署 | GitHub Actions `on: push: branches: [main]` 触发器 |
| DEPL-03 | 使用 GitHub Actions 进行 CI/CD | 使用官方 Astro action 和 GitHub Pages action |

## Standard Stack

### Core
| Library/Service | Version | Purpose | Why Standard |
|-----------------|---------|---------|--------------|
| `withastro/action` | v5 | Astro 构建和部署 | Astro 官方维护，与 Astro 生态紧密集成 |
| `actions/deploy-pages` | v4 | 部署到 GitHub Pages | GitHub 官方维护，支持 GitHub Pages 最新特性 |
| `actions/checkout` | v5/v6 | 检出代码 | GitHub 官方 action，必需的第一步 |

### Supporting
| Service | Purpose | When to Use |
|---------|---------|-------------|
| GitHub Pages | 静态站点托管 | 本项目使用，免费且与 GitHub 深度集成 |
| GitHub Actions | CI/CD 平台 | 本项目使用，自动化构建和部署 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `withastro/action` | `peaceiris/actions-gh-pages` | 第三方维护，配置更复杂，但功能更丰富 |
| GitHub Pages | Vercel/Netlify | 更强大的功能（SSR、边缘函数），但需要额外账号配置 |
| GitHub Actions | GitHub Pages legacy (branch-based) | 已弃用，GitHub 推荐使用 Actions |

**Installation:**
```bash
# 无需安装 npm 包，GitHub Actions 在云端运行
# 只需创建 .github/workflows/deploy.yml 文件
```

## Architecture Patterns

### Recommended Project Structure
```
project/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 工作流
├── astro.config.mjs        # Astro 配置（site + base）
├── package.json            # 构建脚本
├── dist/                   # 构建输出（由 action 生成）
└── public/                 # 静态资源
```

### Pattern 1: Astro Official Deployment Workflow
**What:** 使用 Astro 官方 action 自动构建和部署
**When to use:** 所有部署到 GitHub Pages 的 Astro 项目
**Example:**
```yaml
# Source: https://docs.astro.build/en/guides/deploy/github/
name: Deploy to GitHub Pages

on:
  # 每次推送到 main 分支时触发
  push:
    branches: [main]
  # 允许从 Actions 页面手动触发
  workflow_dispatch:

# 权限配置
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v6
      - name: Install, build, and upload your site
        uses: withastro/action@v5
        # 可选配置：
        # with:
        #   node-version: 22
        #   package-manager: npm

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Pattern 2: Astro Configuration for GitHub Pages
**What:** 正确配置 `site` 和 `base` 以支持子路径部署
**When to use:** 部署到 `username.github.io/repo-name/` 形式的 URL
**Example:**
```javascript
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/deploy/github/
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/frontend-design-gallery',
  output: 'static',
})
```

### Anti-Patterns to Avoid
- **使用已弃用的 branch-based deployment:** GitHub Pages 的旧部署方式（从 gh-pages 分支部署）已被弃用，应使用 GitHub Actions
- **忘记设置 base 路径:** 部署到子路径时必须设置 `base`，否则资源加载会失败
- **使用绝对路径引用静态资源:** 在代码中使用 `/assets/image.png` 会在子路径部署时失效，应使用 Astro 的路径处理

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 自动化部署脚本 | 自定义 shell 脚本 | `withastro/action` | 官方维护，处理了所有边缘情况 |
| 缓存管理 | 手动配置缓存 | action 内置 cache 选项 | 自动优化，避免缓存问题 |
| 部署状态检查 | 自定义健康检查 | GitHub Pages 内置 | 自动处理部署状态和回滚 |

**Key insight:** GitHub Actions 和 Astro 官方 action 已经处理了部署过程中的所有复杂情况（依赖安装、构建优化、缓存管理、部署状态），无需手动实现。

## Common Pitfalls

### Pitfall 1: 资源加载失败（404 错误）
**What goes wrong:** 部署后页面空白，CSS/JS 资源返回 404
**Why it happens:** 未正确设置 `base` 路径，或使用了绝对路径
**How to avoid:**
1. 在 `astro.config.mjs` 中设置 `base: '/frontend-design-gallery'`
2. 使用 Astro 的 `Astro.url` 或 `import.meta.env.BASE_URL` 处理动态路径
**Warning signs:** 本地开发正常，部署后静态资源 404

### Pitfall 2: GitHub Pages 设置错误
**What goes wrong:** 工作流运行成功但网站无法访问
**Why it happens:** 仓库的 Pages 设置未选择 "GitHub Actions" 作为 Source
**How to avoid:**
1. 进入仓库 Settings > Pages
2. 在 "Build and deployment" > "Source" 中选择 "GitHub Actions"
**Warning signs:** Actions 显示成功但访问网站返回 404

### Pitfall 3: 权限配置缺失
**What goes wrong:** 工作流失败，提示权限不足
**Why it happens:** 未在 workflow 文件中声明必要的权限
**How to avoid:**
```yaml
permissions:
  contents: read    # 读取代码
  pages: write      # 写入 Pages
  id-token: write   # OIDC 认证
```
**Warning signs:** Actions 日志显示 "permission denied"

### Pitfall 4: Node 版本不兼容
**What goes wrong:** 构建失败，提示语法错误或依赖问题
**Why it happens:** GitHub Actions 默认 Node 版本与项目要求不匹配
**How to avoid:**
- 项目 package.json 已指定 `"engines": {"node": ">=22.12.0"}`
- `withastro/action` 默认使用 Node 22，符合要求
**Warning signs:** 构建日志显示 Node 版本警告

### Pitfall 5: 部署间歇性失败（2026年1月已知问题）
**What goes wrong:** 部署有时成功有时失败，无明显规律
**Why it happens:** GitHub Actions/deploy-pages 在 2026年1月有已知间歇性问题
**How to avoid:**
1. 监控 GitHub Status 页面
2. 如遇持续失败，可尝试在仓库设置中禁用再启用 Pages
**Warning signs:** 部署偶尔卡在 `deployment_queued` 状态

## Code Examples

### 完整的部署工作流文件
```yaml
# .github/workflows/deploy.yml
# Source: https://github.com/withastro/action
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v6
      - name: Install, build, and upload your site
        uses: withastro/action@v5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Astro 配置（已配置）
```javascript
// astro.config.mjs
// 当前项目已正确配置
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/frontend-design-gallery',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 处理动态路径（如需要）
```astro
---
// 使用 Astro 的内置路径处理
const logoUrl = `${Astro.url.origin}${Astro.url.pathname}logo.png`;
// 或使用 BASE_URL
const baseUrl = import.meta.env.BASE_URL;
---
<img src={`${baseUrl}logo.png`} alt="Logo" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| branch-based deployment (gh-pages) | GitHub Actions deployment | 2022+ | 更可靠的部署，更好的 CI/CD 集成 |
| 手动触发部署 | 自动 push 触发 | 现在 | 持续部署，减少手动操作 |
| peaceiris/actions-gh-pages | withastro/action | Astro 官方推出后 | 更紧密的 Astro 集成，更简单的配置 |

**Deprecated/outdated:**
- **GitHub Pages legacy branch deployment:** 已弃用，GitHub 推荐使用 Actions
- **手动 npm run build + 上传:** 低效且容易出错

## Open Questions

1. **是否需要添加部署前的测试运行？**
   - What we know: 当前项目有完整的 Vitest 测试套件（96 tests）
   - What's unclear: 是否在部署工作流中添加测试步骤
   - Recommendation: 建议添加，在 build job 之前运行 `npm test`，确保代码质量

2. **是否需要添加 Lighthouse 性能检查？**
   - What we know: 项目有性能要求（PERF-01/02/03）
   - What's unclear: 是否在部署后自动验证性能
   - Recommendation: v1 可选，后续可添加

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | 手动验证 + GitHub Actions 状态 |
| Config file | `.github/workflows/deploy.yml` |
| Quick run command | `npm run build && npm run preview` |
| Full suite command | Actions 工作流自动运行 |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEPL-01 | 自动部署到 GitHub Pages | E2E | 工作流 `build` + `deploy` jobs | Wave 0 创建 |
| DEPL-02 | 推送到 main 分支时自动触发部署 | Integration | `on: push: branches: [main]` | Wave 0 创建 |
| DEPL-03 | 使用 GitHub Actions 进行 CI/CD | Integration | `withastro/action@v5` | Wave 0 创建 |

### Sampling Rate
- **Per task commit:** 本地运行 `npm run build` 验证构建成功
- **Per wave merge:** GitHub Actions 自动运行完整工作流
- **Phase gate:**
  1. 工作流运行成功（绿色勾）
  2. 网站 https://wangjs-jacky.github.io/frontend-design-gallery 可访问
  3. 所有功能正常（预览、切换风格、复制按钮）

### Wave 0 Gaps
- [ ] `.github/workflows/deploy.yml` - GitHub Actions 工作流文件
- [ ] 仓库设置：Settings > Pages > Source = "GitHub Actions"
- [ ] 验证：首次推送后检查网站可访问性

### Acceptance Criteria (Testable)
1. **DEPL-01 验证步骤:**
   - 推送代码到 main 分支
   - 等待 Actions 工作流完成
   - 访问 https://wangjs-jacky.github.io/frontend-design-gallery
   - 确认页面加载成功，无 404 错误

2. **DEPL-02 验证步骤:**
   - 做一个小改动（如修改标题）
   - 推送到 main 分支
   - 观察 Actions 自动触发
   - 确认新改动已部署

3. **DEPL-03 验证步骤:**
   - 检查 `.github/workflows/deploy.yml` 存在
   - 检查工作流使用 `withastro/action@v5`
   - 检查工作流使用 `actions/deploy-pages@v4`
   - 确认无需手动操作

## Sources

### Primary (HIGH confidence)
- [Astro Official Docs - Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) - Astro 官方部署指南
- [withastro/action GitHub Repository](https://github.com/withastro/action) - Astro 官方 GitHub Action
- [actions/deploy-pages GitHub Repository](https://github.com/actions/deploy-pages) - GitHub 官方 Pages 部署 action

### Secondary (MEDIUM confidence)
- [GitHub Actions CI/CD Best Practices](https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md) - GitHub 官方最佳实践
- [GitHub Docs - Deploying with GitHub Actions](https://docs.github.com/actions/deployment/about-deployments/deploying-with-github-actions) - GitHub 官方部署文档

### Tertiary (LOW confidence)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) - 第三方替代方案（未使用）

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Astro 官方文档和 GitHub 官方 actions
- Architecture: HIGH - 官方推荐模式，配置简单明确
- Pitfalls: HIGH - 基于官方文档和常见问题汇总

**Research date:** 2026-03-16
**Valid until:** 6-12 个月（GitHub Actions 和 Astro 部署方式稳定）

---

## 实施清单（供 Planner 参考）

### Plan 04-01: GitHub Pages 配置
1. 创建 `.github/workflows/deploy.yml` 文件
2. 确认 `astro.config.mjs` 的 `site` 和 `base` 配置正确（已配置）
3. 首次推送触发部署
4. 在仓库设置中确认 Pages Source = "GitHub Actions"

### Plan 04-02: CI/CD 验证和优化
1. 验证自动部署工作正常
2. 验证网站可访问且功能完整
3. （可选）添加测试步骤到工作流
4. 更新 REQUIREMENTS.md 标记完成
