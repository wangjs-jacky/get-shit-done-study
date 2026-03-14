# 外部集成模板

用于 `.planning/codebase/INTEGRATIONS.md` 的模板 - 记录外部服务依赖。

**目的:** 记录此代码库与哪些外部系统通信。重点关注"我们的代码依赖什么外部内容"。

---

## 文件模板

```markdown
# 外部集成

**分析日期:** [YYYY-MM-DD]

## API 和外部服务

**支付处理:**
- [服务] - [用途: 例如，"订阅计费、一次性付款"]
  - SDK/客户端: [例如，"stripe npm 包 v14.x"]
  - 身份验证: [例如，"STRIPE_SECRET_KEY 环境变量中的 API 密钥"]
  - 使用端点: [例如，"结账会话、webhooks"]

**邮件/短信:**
- [服务] - [用途: 例如，"事务性邮件"]
  - SDK/客户端: [例如，"sendgrid/mail v8.x"]
  - 身份验证: [例如，"SENDGRID_API_KEY 环境变量中的 API 密钥"]
  - 模板: [例如，"在 SendGrid 仪表板中管理"]

**外部 API:**
- [服务] - [用途]
  - 集成方法: [例如，"通过 fetch 的 REST API"、"GraphQL 客户端"]
  - 身份验证: [例如，"AUTH_TOKEN 环境变量中的 OAuth2 令牌"]
  - 速率限制: [如适用]

## 数据存储

**数据库:**
- [类型/提供者] - [例如，"Supabase 上的 PostgreSQL"]
  - 连接: [例如，"通过 DATABASE_URL 环境变量"]
  - 客户端: [例如，"Prisma ORM v5.x"]
  - 迁移: [例如，"prisma migrate 在 migrations/"]

**文件存储:**
- [服务] - [例如，"AWS S3 用于用户上传"]
  - SDK/客户端: [例如，"@aws-sdk/client-s3"]
  - 身份验证: [例如，"AWS_* 环境变量中的 IAM 凭据"]
  - 存储桶: [例如，"prod-uploads、dev-uploads"]

**缓存:**
- [服务] - [例如，"Redis 用于会话存储"]
  - 连接: [例如，"REDIS_URL 环境变量"]
  - 客户端: [例如，"ioredis v5.x"]

## 身份验证和身份

**身份验证提供者:**
- [服务] - [例如，"Supabase Auth"、"Auth0"、"自定义 JWT"]
  - 实现: [例如，"Supabase 客户端 SDK"]
  - 令牌存储: [例如，"httpOnly cookies"、"localStorage"]
  - 会话管理: [例如，"JWT 刷新令牌"]

**OAuth 集成:**
- [提供者] - [例如，"Google OAuth 用于登录"]
  - 凭据: [例如，"GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET"]
  - 范围: [例如，"email、profile"]

## 监控和可观察性

**错误跟踪:**
- [服务] - [例如，"Sentry"]
  - DSN: [例如，"SENTRY_DSN 环境变量"]
  - 发布跟踪: [例如，"通过 SENTRY_RELEASE"]

**分析:**
- [服务] - [例如，"Mixpanel 用于产品分析"]
  - 令牌: [例如，"MIXPANEL_TOKEN 环境变量"]
  - 跟踪的事件: [例如，"用户操作、页面浏览"]

**日志:**
- [服务] - [例如，"CloudWatch"、"Datadog"、"无（仅 stdout）"]
  - 集成: [例如，"AWS Lambda 内置"]

## CI/CD 和部署

**托管:**
- [平台] - [例如，"Vercel"、"AWS Lambda"、"Docker on ECS"]
  - 部署: [例如，"main 分支推送时自动部署"]
  - 环境变量: [例如，"在 Vercel 仪表板中配置"]

**CI 管道:**
- [服务] - [例如，"GitHub Actions"]
  - 工作流: [例如，"test.yml、deploy.yml"]
  - 机密: [例如，"存储在 GitHub 仓库机密中"]

## 环境配置

**开发:**
- 所需的环境变量: [列出关键变量]
- 机密位置: [例如，".env.local（被 git 忽略）"、"1Password 保险库"]
- 模拟/存根服务: [例如，"Stripe 测试模式"、"本地 PostgreSQL"]

**预发布:**
- 环境特定差异: [例如，"使用预发布 Stripe 帐户"]
- 数据: [例如，"单独的预发布数据库"]

**生产:**
- 机密管理: [例如，"Vercel 环境变量"]
- 故障转移/冗余: [例如，"多区域数据库复制"]

## Webhook 和回调

**传入:**
- [服务] - [端点: 例如，"/api/webhooks/stripe"]
  - 验证: [例如，"通过 stripe.webhooks.constructEvent 的签名验证"]
  - 事件: [例如，"payment_intent.succeeded、customer.subscription.updated"]

**传出:**
- [服务] - [触发它的内容]
  - 端点: [例如，"用户注册时外部 CRM webhook"]
  - 重试逻辑: [如适用]

---

*集成审核: [日期]*
*添加/移除外部服务时更新*
```

<good_examples>
```markdown
# 外部集成

**分析日期:** 2025-01-20

## API 和外部服务

**支付处理:**
- Stripe - 订阅计费和一次性课程付款
  - SDK/客户端: stripe npm 包 v14.8
  - 身份验证: STRIPE_SECRET_KEY 环境变量中的 API 密钥
  - 使用端点: 结账会话、客户门户、webhooks

**邮件/短信:**
- SendGrid - 事务性邮件（收据、密码重置）
  - SDK/客户端: @sendgrid/mail v8.1
  - 身份验证: SENDGRID_API_KEY 环境变量中的 API 密钥
  - 模板: 在 SendGrid 仪表板中管理（代码中的模板 ID）

**外部 API:**
- OpenAI API - 课程内容生成
  - 集成方法: 通过 openai npm 包 v4.x 的 REST API
  - 身份验证: OPENAI_API_KEY 环境变量中的 Bearer 令牌
  - 速率限制: 3500 请求/分钟（第 3 层）

## 数据存储

**数据库:**
- PostgreSQL on Supabase - 主要数据存储
  - 连接: 通过 DATABASE_URL 环境变量
  - 客户端: Prisma ORM v5.8
  - 迁移: prisma migrate 在 prisma/migrations/

**文件存储:**
- Supabase Storage - 用户上传（头像、课程材料）
  - SDK/客户端: @supabase/supabase-js v2.x
  - 身份验证: SUPABASE_SERVICE_ROLE_KEY 中的服务角色密钥
  - 存储桶: avatars（公共）、course-materials（私有）

**缓存:**
- 目前无（所有数据库查询，无 Redis）

## 身份验证和身份

**身份验证提供者:**
- Supabase Auth - 电子邮件/密码 + OAuth
  - 实现: 使用服务器端会话管理的 Supabase 客户端 SDK
  - 令牌存储: 通过 @supabase/ssr 的 httpOnly cookies
  - 会话管理: 由 Supabase 处理的 JWT 刷新令牌

**OAuth 集成:**
- Google OAuth - 社交登录
  - 凭据: GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET（Supabase 仪表板）
  - 范围: email、profile

## 监控和可观察性

**错误跟踪:**
- Sentry - 服务器和客户端错误
  - DSN: SENTRY_DSN 环境变量
  - 发布跟踪: 通过 SENTRY_RELEASE 的 Git 提交 SHA

**分析:**
- 无（计划: Mixpanel）

**日志:**
- Vercel 日志 - 仅 stdout/stderr
  - 保留: Pro 计划上保留 7 天

## CI/CD 和部署

**托管:**
- Vercel - Next.js 应用托管
  - 部署: main 分支推送时自动
  - 环境变量: 在 Vercel 仪表板中配置（同步到 .env.example）

**CI 管道:**
- GitHub Actions - 测试和类型检查
  - 工作流: .github/workflows/ci.yml
  - 机密: 无需要（仅公共仓库测试）

## 环境配置

**开发:**
- 所需的环境变量: DATABASE_URL、NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY
- 机密位置: .env.local（被 git 忽略）、团队通过 1Password 保险库共享
- 模拟/存根服务: Stripe 测试模式、Supabase 本地开发项目

**预发布:**
- 使用单独的 Supabase 预发布项目
- Stripe 测试模式
- 相同的 Vercel 帐户，不同的环境

**生产:**
- 机密管理: Vercel 环境变量
- 数据库: 具有每日备份的 Supabase 生产项目

## Webhook 和回调

**传入:**
- Stripe - /api/webhooks/stripe
  - 验证: 通过 stripe.webhooks.constructEvent 的签名验证
  - 事件: payment_intent.succeeded、customer.subscription.updated、customer.subscription.deleted

**传出:**
- 无

---

*集成审核: 2025-01-20*
*添加/移除外部服务时更新*
```
</good_examples>

<guidelines>
**INTEGRATIONS.md 应包含的内容:**
- 代码通信的外部服务
- 身份验证模式（机密所在位置，而非机密本身）
- 使用的 SDK 和客户端库
- 环境变量名称（不是值）
- Webhook 端点和验证方法
- 数据库连接模式
- 文件存储位置
- 监控和日志服务

**这里不应包含的内容:**
- 实际的 API 密钥或机密（永不写入这些）
- 内部架构（那是 ARCHITECTURE.md）
- 代码模式（那是 PATTERNS.md）
- 技术选择（那是 STACK.md）
- 性能问题（那是 CONCERNS.md）

**填写此模板时:**
- 检查 .env.example 或 .env.template 以获取所需的环境变量
- 查找 SDK 导入（stripe、@sendgrid/mail 等）
- 检查路由/endpoint 中的 webhook 处理器
- 注意机密所在位置（不是机密）
- 记录环境特定差异（dev/staging/prod）
- 为每个服务包含身份验证模式

**在阶段规划中用途:**
- 添加新的外部服务集成
- 调试身份验证问题
- 理解应用程序外的数据流
- 设置新环境
- 审计第三方依赖
- 计划服务停机或迁移

**安全说明:**
记录机密所在位置（环境变量、Vercel 仪表板、1Password），而不是机密是什么。
</guidelines>
