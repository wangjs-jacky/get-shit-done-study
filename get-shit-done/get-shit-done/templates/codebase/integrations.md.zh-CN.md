# 外部集成模板

用于 `.planning/codebase/INTEGRATIONS.md` - 捕获外部服务依赖。

**目的：** 记录此代码库与哪些外部系统通信。专注于"我们的代码依赖什么外部存在"。

---

## 文件模板

```markdown
# 外部集成

**分析日期：** [YYYY-MM-DD]

## API和外部服务

**支付处理：**
- [服务] - [用途：如"订阅计费、一次性支付"]
  - SDK/客户端：[如"stripe npm包v14.x"]
  - 认证：[如"STRIPE_SECRET_KEY环境变量中的API密钥"]
  - 使用的端点：[如"结账会话、webhooks"]

**邮件/短信：**
- [服务] - [用途：如"事务性邮件"]
  - SDK/客户端：[如"sendgrid/mail v8.x"]
  - 认证：[如"SENDGRID_API_KEY环境变量中的API密钥"]
  - 模板：[如"在SendGrid仪表板中管理"]

**外部API：**
- [服务] - [用途]
  - 集成方法：[如"通过fetch的REST API", "GraphQL客户端"]
  - 认证：[如"AUTH_TOKEN环境变量中的OAuth2令牌"]
  - 速率限制：[如适用]

## 数据存储

**数据库：**
- [类型/提供者] - [如"Supabase上的PostgreSQL"]
  - 连接：[如"通过DATABASE_URL环境变量"]
  - 客户端：[如"Prisma ORM v5.x"]
  - 迁移：[如"migrations/中的prisma migrate"]

**文件存储：**
- [服务] - [如"用户上传的AWS S3"]
  - SDK/客户端：[如"@aws-sdk/client-s3"]
  - 认证：[如"AWS_*环境变量中的IAM凭证"]
  - 存储桶：[如"prod-uploads, dev-uploads"]

**缓存：**
- [服务] - [如"Redis用于会话存储"]
  - 连接：[如"REDIS_URL环境变量"]
  - 客户端：[如"ioredis v5.x"]

## 认证和身份

**认证提供者：**
- [服务] - [如"Supabase Auth", "Auth0", "自定义JWT"]
  - 实现：[如"Supabase客户端SDK"]
  - 令牌存储：[如"httpOnly cookies", "localStorage"]
  - 会话管理：[如"JWT刷新令牌"]

**OAuth集成：**
- [提供者] - [如"Google OAuth登录"]
  - 凭证：[如"GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"]
  - 范围：[如"email, profile"]

## 监控和可观测性

**错误跟踪：**
- [服务] - [如"Sentry"]
  - DSN：[如"SENTRY_DSN环境变量"]
  - 版本跟踪：[如"通过SENTRY_RELEASE"]

**分析：**
- [服务] - [如"Mixpanel用于产品分析"]
  - 令牌：[如"MIXPANEL_TOKEN环境变量"]
  - 跟踪的事件：[如"用户操作、页面浏览"]

**日志：**
- [服务] - [如"CloudWatch", "Datadog", "仅stdout"]
  - 集成：[如"AWS Lambda内置"]

## CI/CD和部署

**托管：**
- [平台] - [如"Vercel", "AWS Lambda", "Docker on ECS"]
  - 部署：[如"main分支推送时自动"]
  - 环境变量：[如"在Vercel仪表板中配置"]

**CI流水线：**
- [服务] - [如"GitHub Actions"]
  - 工作流：[如"test.yml, deploy.yml"]
  - 密钥：[如"存储在GitHub仓库密钥中"]

## 环境配置

**开发：**
- 必需的环境变量：[列出关键变量]
- 密钥位置：[如".env.local（被git忽略）", "1Password保险库"]
- 模拟/存根服务：[如"Stripe测试模式", "本地PostgreSQL"]

**暂存：**
- 环境特定差异：[如"使用暂存Stripe账户"]
- 数据：[如"单独的暂存数据库"]

**生产：**
- 密钥管理：[如"Vercel环境变量"]
- 故障转移/冗余：[如"多区域数据库复制"]

## Webhook和回调

**传入：**
- [服务] - [端点：如"/api/webhooks/stripe"]
  - 验证：[如"通过stripe.webhooks.constructEvent的签名验证"]
  - 事件：[如"payment_intent.succeeded, customer.subscription.updated"]

**传出：**
- [服务] - [触发内容]
  - 端点：[如"用户注册时外部CRM webhook"]
  - 重试逻辑：[如适用]

---

*集成审核：[日期]*
*添加/删除外部服务时更新*
```

<good_examples>
```markdown
# 外部集成

**分析日期：** 2025-01-20

## API和外部服务

**支付处理：**
- Stripe - 订阅计费和一次性课程支付
  - SDK/客户端：stripe npm包v14.8
  - 认证：STRIPE_SECRET_KEY环境变量中的API密钥
  - 使用的端点：结账会话、客户门户、webhooks

**邮件/短信：**
- SendGrid - 事务性邮件（收据、密码重置）
  - SDK/客户端：@sendgrid/mail v8.1
  - 认证：SENDGRID_API_KEY环境变量中的API密钥
  - 模板：在SendGrid仪表板中管理（代码中的模板ID）

**外部API：**
- OpenAI API - 课程内容生成
  - 集成方法：通过openai npm包v4.x的REST API
  - 认证：OPENAI_API_KEY环境变量中的Bearer令牌
  - 速率限制：3500请求/分钟（第3级）

## 数据存储

**数据库：**
- PostgreSQL on Supabase - 主要数据存储
  - 连接：通过DATABASE_URL环境变量
  - 客户端：Prisma ORM v5.8
  - 迁移：prisma/migrations/中的prisma migrate

**文件存储：**
- Supabase Storage - 用户上传（个人头像、课程材料）
  - SDK/客户端：@supabase/supabase-js v2.x
  - 认证：SUPABASE_SERVICE_ROLE_KEY中的服务角色密钥
  - 存储桶：avatars（公共）、course-materials（私有）

**缓存：**
- 当前无（所有数据库查询，无Redis）

## 认证和身份

**认证提供者：**
- Supabase Auth - 邮箱/密码 + OAuth
  - 实现：带服务器端会话管理的Supabase客户端SDK
  - 令牌存储：通过@supabase/ssr的httpOnly cookies
  - 会话管理：由Supabase处理的JWT刷新令牌

**OAuth集成：**
- Google OAuth - 社交登录
  - 凭证：GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET（Supabase仪表板）
  - 范围：email, profile

## 监控和可观测性

**错误跟踪：**
- Sentry - 服务器和客户端错误
  - DSN：SENTRY_DSN环境变量
  - 版本跟踪：通过SENTRY_RELEASE的Git提交SHA

**分析：**
- 无（计划：Mixpanel）

**日志：**
- Vercel日志 - 仅stdout/stderr
  - 保留时间：Pro套餐上7天

## CI/CD和部署

**托管：**
- Vercel - Next.js应用托管
  - 部署：main分支推送时自动
  - 环境变量：在Vercel仪表板中配置（同步到.env.example）

**CI流水线：**
- GitHub Actions - 测试和类型检查
  - 工作流：.github/workflows/ci.yml
  - 密钥：不需要（仅公共仓库测试）

## 环境配置

**开发：**
- 必需环境变量：DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- 密钥位置：.env.local（被git忽略），团队通过1Password保险库共享
- 模拟/存根服务：Stripe测试模式，Supabase本地开发项目

**暂存：**
- 使用单独的Supabase暂存项目
- Stripe测试模式
- 相同的Vercel账户，不同环境

**生产：**
- 密钥管理：Vercel环境变量
- 数据库：具有每日备份的Supabase生产项目

## Webhook和回调

**传入：**
- Stripe - /api/webhooks/stripe
  - 验证：通过stripe.webhooks.constructEvent的签名验证
  - 事件：payment_intent.succeeded, customer.subscription.updated, customer.subscription.deleted

**传出：**
- 无

---

*集成审核：2025-01-20*
*添加/删除外部服务时更新*
```
</good_examples>

<guidelines>
**INTEGRATIONS.md中应包含的内容：**
- 代码通信的外部服务
- 认证模式（密钥在哪里，而不是密钥本身）
- 使用的SDK和客户端库
- 环境变量名称（不是值）
- Webhook端点和验证方法
- 数据库连接模式
- 文件存储位置
- 监控和日志服务

**这里不应包含的内容：**
- 实际的API密钥或密钥（永远不要写这些）
- 内部架构（那是ARCHITECTURE.md）
- 代码模式（那是PATTERNS.md）
- 技术选择（那是STACK.md）
- 性能问题（那是CONCERNS.md）

**填写此模板时：**
- 检查.env.example或.env.template获取必需的环境变量
- 查找SDK导入（stripe、@sendgrid/mail等）
- 检查路由/端点中的webhook处理器
- 注意密钥管理位置（不是密钥本身）
- 记录环境特定差异（dev/staging/prod）
- 为每个服务包含认证模式

**阶段规划时有用：**
- 添加新的外部服务集成
- 调试认证问题
- 理解应用程序外的数据流
- 设置新环境
- 审计第三方依赖
- 规划服务停机或迁移

**安全说明：**
记录密钥所在位置（环境变量、Vercel仪表板、1Password），而不是密钥是什么。
</guidelines>