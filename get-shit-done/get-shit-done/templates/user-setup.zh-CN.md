# 用户设置模板

用于 `.planning/phases/XX-name/{phase}-USER-SETUP.md` - 人类必需的配置，Claude 无法自动化。

**目的:** 记录需要人工操作的任务 - 账户创建、仪表板配置、密钥检索。Claude 自动化一切可能的操作；此文件仅捕获剩余的操作。

---

## 文件模板

```markdown
# 阶段 {X}: 需要用户设置

**生成时间:** [YYYY-MM-DD]
**阶段:** {phase-name}
**状态:** 未完成

为集成功能完成这些项目。Claude 自动化了所有可能的操作；这些项目需要人类访问外部仪表板/账户。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `ENV_VAR_NAME` | [服务仪表板 → 路径 → 到 → 值] | `.env.local` |
| [ ] | `ANOTHER_VAR` | [服务仪表板 → 路径 → 到 → 值] | `.env.local` |

## 账户设置

[仅在需要新建账户时]

- [ ] **创建 [服务] 账户**
  - URL: [注册 URL]
  - 如果已有账户则跳过

## 仪表板配置

[仅在需要仪表板配置时]

- [ ] **[配置任务]**
  - 位置: [服务仪表板 → 路径 → 到 → 设置]
  - 设置为: [所需值或配置]
  - 备注: [任何重要细节]

## 验证

完成后验证:

```bash
# [验证命令]
```

预期结果:
- [成功看起来什么样]

---

**一旦所有项目完成:** 在文件顶部将状态标记为"完成"。
```

---

## 何时生成

当计划前言包含 `user_setup` 字段时生成 `{phase}-USER-SETUP.md`。

**触发器:** `user_setup` 存在于 PLAN.md 前言中并有项目。

**位置:** 与 PLAN.md 和 SUMMARY.md 相同目录。

**时间:** 在任务完成后生成，创建 SUMMARY.md 之前。

---

## 前言模式

在 PLAN.md 中，`user_setup` 声明人类必需的配置：

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
        details: "URL: https://[你的域名]/api/webhooks/stripe, 事件: checkout.session.completed, customer.subscription.*"
    local_dev:
      - "运行: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
      - "使用 CLI 输出的 webhook 密钥进行本地测试"
```

---

## 自动化优先规则

**USER-SETUP.md 仅包含 Claude 字面上无法执行的操作。**

| Claude 可以做（不在 USER-SETUP 中） | Claude 无法做（→ USER-SETUP） |
|-----------------------------------|--------------------------------|
| `npm install stripe` | 创建 Stripe 账户 |
| 编写 webhook 处理器代码 | 从仪表板获取 API 密钥 |
| 创建 `.env.local` 文件结构 | 复制实际密钥值 |
| 运行 `stripe listen` | 验证 Stripe CLI（浏览器 OAuth） |
| 配置 package.json | 访问外部服务仪表板 |
| 编写任何代码 | 从第三方系统检索密钥 |

**测试:** "这是否需要人类在浏览器中，访问 Claude 没有凭据的账户？"
- 是 → USER-SETUP.md
- 否 → Claude 自动执行

---

## 服务特定示例

<stripe_example>
```markdown
# 阶段 10: 需要用户设置

**生成时间:** 2025-01-14
**阶段:** 10-货币化
**状态:** 未完成

为 Stripe 集成功能完成这些项目。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `STRIPE_SECRET_KEY` | Stripe 仪表板 → 开发者 → API 密钥 → 密钥 | `.env.local` |
| [ ] | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 仪表板 → 开发者 → API 密钥 → 可发布密钥 | `.env.local` |
| [ ] | `STRIPE_WEBHOOK_SECRET` | Stripe 仪表板 → 开发者 → Webhooks → [端点] → 签名密钥 | `.env.local` |

## 账户设置

- [ ] **创建 Stripe 账户**（如需要）
  - URL: https://dashboard.stripe.com/register
  - 如果已有 Stripe 账户则跳过

## 仪表板配置

- [ ] **创建 Webhook 端点**
  - 位置: Stripe 仪表板 → 开发者 → Webhooks → 添加端点
  - 端点 URL: `https://[你的域名]/api/webhooks/stripe`
  - 要发送的事件:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

- [ ] **创建产品和价格**（如果使用订阅层级）
  - 位置: Stripe 仪表板 → 产品 → 添加产品
  - 创建每个订阅层级
  - 将价格 ID 复制到:
    - `STRIPE_STARTER_PRICE_ID`
    - `STRIPE_PRO_PRICE_ID`

## 本地开发

用于本地 webhook 测试:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
使用 CLI 输出的 webhook 签名密钥（以 `whsec_` 开头）。

## 验证

完成后验证:

```bash
# 检查环境变量是否设置
grep STRIPE .env.local

# 验证构建通过
npm run build

# 测试 webhook 端点（应返回 400 错误签名，而不是 500 崩溃）
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

预期: 构建通过，webhook 返回 400（签名验证工作）。

---

**一旦所有项目完成:** 在文件顶部将状态标记为"完成"。
```
</stripe_example>

<supabase_example>
```markdown
# 阶段 2: 需要用户设置

**生成时间:** 2025-01-14
**阶段:** 02-身份验证
**状态:** 未完成

为 Supabase Auth 功能完成这些项目。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 仪表板 → 设置 → API → 项目 URL | `.env.local` |
| [ ] | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 仪表板 → 设置 → API → 匿名公共密钥 | `.env.local` |
| [ ] | `SUPABASE_SERVICE_ROLE_KEY` | Supabase 仪表板 → 设置 → API → 服务角色密钥 | `.env.local` |

## 账户设置

- [ ] **创建 Supabase 项目**
  - URL: https://supabase.com/dashboard/new
  - 如果已有此应用的项目则跳过

## 仪表板配置

- [ ] **启用邮箱认证**
  - 位置: Supabase 仪表板 → 身份验证 → 提供商
  - 启用: 邮箱提供商
  - 配置: 确认邮箱（根据偏好开启/关闭）

- [ ] **配置 OAuth 提供商**（如果使用社交登录）
  - 位置: Supabase 仪表板 → 身份验证 → 提供商
  - 对于 Google: 从 Google Cloud Console 添加客户端 ID 和密钥
  - 对于 GitHub: 从 GitHub OAuth Apps 添加客户端 ID 和密钥

## 验证

完成后验证:

```bash
# 检查环境变量
grep SUPABASE .env.local

# 验证连接（在项目目录中运行）
npx supabase status
```

---

**一旦所有项目完成:** 在文件顶部将状态标记为"完成"。
```
</supabase_example>

<sendgrid_example>
```markdown
# 阶段 5: 需要用户设置

**生成时间:** 2025-01-14
**阶段:** 05-通知
**状态:** 未完成

为 SendGrid 邮件功能完成这些项目。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `SENDGRID_API_KEY` | SendGrid 仪表板 → 设置 → API 密钥 → 创建 API 密钥 | `.env.local` |
| [ ] | `SENDGRID_FROM_EMAIL` | 您的已验证发件人邮箱地址 | `.env.local` |

## 账户设置

- [ ] **创建 SendGrid 账户**
  - URL: https://signup.sendgrid.com/
  - 如果已有账户则跳过

## 仪表板配置

- [ ] **验证发件人身份**
  - 位置: SendGrid 仪表板 → 设置 → 发件人身份验证
  - 选项 1: 单一发件人验证（快速，开发用）
  - 选项 2: 域身份验证（生产环境）

- [ ] **创建 API 密钥**
  - 位置: SendGrid 仪表板 → 设置 → API 密钥 → 创建 API 密钥
  - 权限: 受限访问 → 邮件发送（完全访问）
  - 立即复制密钥（仅显示一次）

## 验证

完成后验证:

```bash
# 检查环境变量
grep SENDGRID .env.local

# 测试邮件发送（替换为您的测试邮箱）
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your@email.com"}'
```

---

**一旦所有项目完成:** 在文件顶部将状态标记为"完成"。
```
</sendgrid_example>

---

## 指导原则

**绝不包含:** 实际密钥值。Claude 可以自动化的操作（包安装、代码更改）。

**命名:** `{phase}-USER-SETUP.md` 匹配阶段编号模式。
**状态跟踪:** 用户标记复选框并在完成时更新状态行。
**可搜索性:** `grep -r "USER-SETUP" .planning/` 找到所有有用户需求的阶段。