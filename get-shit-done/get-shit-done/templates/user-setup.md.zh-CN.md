# 用户设置模板

用于 `.planning/phases/XX-name/{phase}-USER-SETUP.md` — 人类需要配置的内容。

**目的：** 记录确实需要人类操作的任务 — 账户创建、仪表板配置、密钥检索。Claude 自动化一切可能的内容；这个文件只记录剩余部分。

---

## 文件模板

```markdown
# 阶段 {X}: 用户设置要求

**生成日期：** [YYYY-MM-DD]
**阶段：** {阶段名称}
**状态：** 未完成

完成这些项目使集成能够正常工作。Claude 自动化了所有可能的内容；这些项目需要人类访问外部仪表板/账户。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|------|------|------|--------|
| [ ] | `ENV_VAR_NAME` | [服务仪表板 → 路径 → 到 → 值] | `.env.local` |
| [ ] | `ANOTHER_VAR` | [服务仪表板 → 路径 → 到 → 值] | `.env.local` |

## 账户设置

[仅当需要创建新账户时]

- [ ] **创建 [服务] 账户**
  - URL: [注册 URL]
  - 如果已有账户则跳过

## 仪表板配置

[仅当需要仪表板配置时]

- [ ] **[配置任务]**
  - 位置：[服务仪表板 → 路径 → 到 → 设置]
  - 设置为：[所需值或配置]
  - 注意：[任何重要细节]

## 验证

完成设置后，使用以下命令验证：

```bash
# [验证命令]
```

预期结果：
- [成功看起来像什么]

---

**一旦所有项目完成：** 在文件顶部将状态标记为"完成"。
```

---

## 何时生成

当计划 frontmatter 包含 `user_setup` 字段时生成 `{phase}-USER-SETUP.md`。

**触发器：** `user_setup` 在 PLAN.md frontmatter 中存在并有项目。

**位置：** 与 PLAN.md 和 SUMMARY.md 相同的目录。

**时机：** 在任务完成后、创建 SUMMARY.md 之前在 execute-plan.md 期间生成。

---

## Frontmatter Schema

在 PLAN.md 中，`user_setup` 声明人类需要的配置：

```yaml
user_setup:
  - service: stripe
    why: "支付处理需要 API 密钥"
    env_vars:
      - name: STRIPE_SECRET_KEY
        source: "Stripe 仪表板 → 开发者 → API 密钥 → 密钥"
      - name: STRIPE_WEBHOOK_SECRET
        source: "Stripe 仪表板 → 开发者 → Webhooks → 签名密钥"
    dashboard_config:
      - task: "创建 Webhook 端点"
        location: "Stripe 仪表板 → 开发者 → Webhooks → 添加端点"
        details: "URL: https://[your-domain]/api/webhooks/stripe, 事件: checkout.session.completed, customer.subscription.*"
    local_dev:
      - "运行: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
      - "使用 CLI 输出的 Webhook 密钥进行本地测试"
```

---

## 自动化优先规则

**USER-SETUP.md 只包含 Claude 确实不能做的事情。**

| Claude 可以做（不在 USER-SETUP 中） | Claude 不能做（→ USER-SETUP） |
|-----------------------------------|------------------------------|
| `npm install stripe` | 创建 Stripe 账户 |
| 编写 webhook 处理器代码 | 从仪表板获取 API 密钥 |
| 创建 `.env.local` 文件结构 | 复制实际的密钥值 |
| 运行 `stripe listen` | 验证 Stripe CLI（浏览器 OAuth） |
| 配置 package.json | 访问外部服务仪表板 |
| 编写任何代码 | 从第三方系统检索密钥 |

**测试：** "这是否需要人类在浏览器中，访问 Claude 没有凭据的账户？"
- 是 → USER-SETUP.md
- 否 → Claude 自动完成

---

## 服务特定示例

<stripe_example>
```markdown
# 阶段 10：用户设置要求

**生成日期：** 2025-01-14
**阶段：** 10-monetization
**状态：** 未完成

完成这些项目使 Stripe 集成能够正常工作。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|------|------|------|--------|
| [ ] | `STRIPE_SECRET_KEY` | Stripe 仪表板 → 开发者 → API 密钥 → 密钥 | `.env.local` |
| [ ] | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 仪表板 → 开发者 → API 密钥 → 可发布密钥 | `.env.local` |
| [ ] | `STRIPE_WEBHOOK_SECRET` | Stripe 仪表板 → 开发者 → Webhooks → [端点] → 签名密钥 | `.env.local` |

## 账户设置

- [ ] **创建 Stripe 账户**（如果需要）
  - URL: https://dashboard.stripe.com/register
  - 如果已有 Stripe 账户则跳过

## 仪表板配置

- [ ] **创建 Webhook 端点**
  - 位置：Stripe 仪表板 → 开发者 → Webhooks → 添加端点
  - 端点 URL：`https://[your-domain]/api/webhooks/stripe`
  - 要发送的事件：
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

- [ ] **创建产品和价格**（如果使用订阅层级）
  - 位置：Stripe 仪表板 → 产品 → 添加产品
  - 创建每个订阅层级
  - 复制价格 ID 到：
    - `STRIPE_STARTER_PRICE_ID`
    - `STRIPE_PRO_PRICE_ID`

## 本地开发

用于本地 webhook 测试：
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
使用 CLI 输出的 webhook 签名密钥（以 `whsec_` 开头）。

## 验证

完成设置后：

```bash
# 检查环境变量是否设置
grep STRIPE .env.local

# 验证构建通过
npm run build

# 测试 webhook 端点（应返回 400 错误签名，不是 500 崩溃）
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

预期：构建通过，webhook 返回 400（签名验证工作）。

---

**一旦所有项目完成：** 在文件顶部将状态标记为"完成"。
```
</stripe_example>

<supabase_example>
```markdown
# 阶段 2：用户设置要求

**生成日期：** 2025-01-14
**阶段：** 02-authentication
**状态：** 未完成

完成这些项目使 Supabase Auth 能够正常工作。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|------|------|------|--------|
| [ ] | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 仪表板 → 设置 → API → 项目 URL | `.env.local` |
| [ ] | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 仪表板 → 设置 → API → 匿名公共 | `.env.local` |
| [ ] | `SUPABASE_SERVICE_ROLE_KEY` | Supabase 仪表板 → 设置 → API → 服务角色 | `.env.local` |

## 账户设置

- [ ] **创建 Supabase 项目**
  - URL: https://supabase.com/dashboard/new
  - 如果已有此应用的项目则跳过

## 仪表板配置

- [ ] **启用邮箱认证**
  - 位置：Supabase 仪表板 → 认证 → 提供商
  - 启用：邮箱提供商
  - 配置：确认邮箱（根据偏好开关）

- [ ] **配置 OAuth 提供商**（如果使用社交登录）
  - 位置：Supabase 仪表板 → 认证 → 提供商
  - 对于 Google：从 Google Cloud Console 添加客户端 ID 和密钥
  - 对于 GitHub：从 GitHub OAuth Apps 添加客户端 ID 和密钥

## 验证

完成设置后：

```bash
# 检查环境变量
grep SUPABASE .env.local

# 验证连接（在项目目录中运行）
npx supabase status
```

---

**一旦所有项目完成：** 在文件顶部将状态标记为"完成"。
```
</supabase_example>

<sendgrid_example>
```markdown
# 阶段 5：用户设置要求

**生成日期：** 2025-01-14
**阶段：** 05-notifications
**状态：** 未完成

完成这些项目使 SendGrid 邮件能够正常工作。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|------|------|------|--------|
| [ ] | `SENDGRID_API_KEY` | SendGrid 仪表板 → 设置 → API 密钥 → 创建 API 密钥 | `.env.local` |
| [ ] | `SENDGRID_FROM_EMAIL` | 您已验证的发件人邮箱地址 | `.env.local` |

## 账户设置

- [ ] **创建 SendGrid 账户**
  - URL: https://signup.sendgrid.com/
  - 如果已有账户则跳过

## 仪表板配置

- [ ] **验证发件人身份**
  - 位置：SendGrid 仪表板 → 设置 → 发件人认证
  - 选项 1：单发件人验证（快速，用于开发）
  - 选项 2：域名认证（生产环境）

- [ ] **创建 API 密钥**
  - 位置：SendGrid 仪表板 → 设置 → API 密钥 → 创建 API 密钥
  - 权限：受限访问 → 邮件发送（完全访问）
  - 立即复制密钥（仅显示一次）

## 验证

完成设置后：

```bash
# 检查环境变量
grep SENDGRID .env.local

# 测试邮件发送（替换为您的测试邮箱）
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your@email.com"}'
```

---

**一旦所有项目完成：** 在文件顶部将状态标记为"完成"。
```
</sendgrid_example>

---

## 指导原则

**绝不包含：** 实际的密钥值。Claude 可以自动化的步骤（包安装、代码更改）。

**命名：** `{phase}-USER-SETUP.md` 匹配阶段编号模式。
**状态跟踪：** 用户勾选复选框并在完成时更新状态行。
**可搜索性：** `grep -r "USER-SETUP" .planning/` 找到所有有用户需求的阶段。