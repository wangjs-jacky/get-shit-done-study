# 编码约定模板

用于 `.planning/codebase/CONVENTIONS.md` 的模板 - 记录编码风格和模式。

**目的:** 记录在此代码库中如何编写代码。Claude 匹配现有风格的规定性指南。

---

## 文件模板

```markdown
# 编码约定

**分析日期:** [YYYY-MM-DD]

## 命名模式

**文件:**
- [模式: 例如，"所有文件使用 kebab-case"]
- [测试文件: 例如，"源文件旁边的 *.test.ts"]
- [组件: 例如，"React 组件使用 PascalCase.tsx"]

**函数:**
- [模式: 例如，"所有函数使用 camelCase"]
- [异步: 例如，"异步函数没有特殊前缀"]
- [处理器: 例如，"事件处理器使用 handleEventName"]

**变量:**
- [模式: 例如，"变量使用 camelCase"]
- [常量: 例如，"常量使用 UPPER_SNAKE_CASE"]
- [私有: 例如，"_prefix 用于私有成员"或"无前缀"]

**类型:**
- [接口: 例如，"PascalCase，无 I 前缀"]
- [类型: 例如，"类型别名使用 PascalCase"]
- [枚举: 例如，"枚举名称使用 PascalCase，值使用 UPPER_CASE"]

## 代码风格

**格式化:**
- [工具: 例如，"使用 .prettierrc 中的 Prettier"]
- [行长: 例如，"最大 100 字符"]
- [引号: 例如，"字符串使用单引号"]
- [分号: 例如，"必需"或"省略"]

**代码检查:**
- [工具: 例如，"使用 eslint.config.js 的 ESLint"]
- [规则: 例如，"扩展 airbnb-base，生产环境中无 console"]
- [运行: 例如，"npm run lint"]

## 导入组织

**顺序:**
1. [例如，"外部包（react、express 等）"]
2. [例如，"内部模块（@/lib、@/components）"]
3. [例如，"相对导入（.、..）"]
4. [例如，"类型导入（import type {}）"]

**分组:**
- [空行: 例如，"组之间有空行"]
- [排序: 例如，"每组内按字母顺序"]

**路径别名:**
- [使用的别名: 例如， "@/ 表示 src/、@components/ 表示 src/components/"]

## 错误处理

**模式:**
- [策略: 例如，"抛出错误，在边界捕获"]
- [自定义错误: 例如，"扩展 Error 类，命名为 *Error"]
- [异步: 例如，"使用 try/catch，无 .catch() 链"]

**错误类型:**
- [何时抛出: 例如，"无效输入、缺少依赖"]
- [何时返回: 例如，"预期失败返回 Result<T, E>"]
- [日志: 例如，"抛出前记录带有上下文的错误"]

## 日志

**框架:**
- [工具: 例如，"console.log、pino、winston"]
- [级别: 例如，"debug、info、warn、error"]

**模式:**
- [格式: 例如，"带有上下文对象的结构化日志"]
- [何时: 例如，"记录状态转换、外部调用"]
- [在哪里: 例如，"在服务边界记录，不在工具中"]

## 注释

**何时注释:**
- [例如，"解释为什么，而不是什么"]
- [例如，"记录业务逻辑、算法、边界情况"]
- [例如，"避免明显的注释如 // 增加计数器"]

**JSDoc/TSDoc:**
- [使用: 例如，"公共 API 必需，内部可选"]
- [格式: 例如，"使用 @param、@returns、@throws 标签"]

**TODO 注释:**
- [模式: 例如，"// TODO(username): 描述"]
- [跟踪: 例如，"如有问题号则链接"]

## 函数设计

**大小:**
- [例如，"保持在 50 行以下，提取助手"]

**参数:**
- [例如，"最多 3 个参数，超过的使用对象"]
- [例如，"在参数列表中解构对象"]

**返回值:**
- [例如，"显式返回，无隐式 undefined"]
- [例如，"为保护子句返回早期"]

## 模块设计

**导出:**
- [例如，"首选命名导出，React 组件使用默认导出"]
- [例如，"从 index.ts 导出公共 API"]

**桶文件:**
- [例如，"使用 index.ts 重新导出公共 API"]
- [例如，"避免循环依赖"]

---

*约定分析: [日期]*
*在模式变更时更新*
```

<good_examples>
```markdown
# 编码约定

**分析日期:** 2025-01-20

## 命名模式

**文件:**
- kebab-case.md: Markdown 文档
- kebab-case.js: JavaScript 源文件
- UPPERCASE.md: 重要项目文件（README、CLAUDE、CHANGELOG）

**函数:**
- camelCase: 所有函数
- 无异步函数特殊前缀
- handleEventName 用于事件处理器（handleClick、handleSubmit）

**变量:**
- camelCase: 变量
- UPPER_SNAKE_CASE: 常量（MAX_RETRIES、API_BASE_URL）
- 无下划线前缀（无 TS 私有标记）

**类型:**
- PascalCase: 接口，无 I 前缀（User，不是 IUser）
- PascalCase: 类型别名（UserConfig、ResponseData）
- PascalCase: 枚举名，UPPER_CASE: 值（Status.PENDING）

## 代码风格

**格式化:**
- Prettier 与 .prettierrc
- 100 字符行长度
- 字符串使用单引号
- 分号必需
- 2 空格缩进

**代码检查:**
- ESLint 与 eslint.config.js
- 扩展 @typescript-eslint/recommended
- 生产代码中无 console.log（使用日志器）
- 运行: npm run lint

## 导入组织

**顺序:**
1. 外部包（react、express、commander）
2. 内部模块（@/lib、@/services）
3. 相对导入（./utils、../types）
4. 类型导入（import type { User }）

**分组:**
- 组之间有空行
- 每组内按字母顺序
- 类型导入在每个组中排在最后

**路径别名:**
- @/ 映射到 src/
- 未定义其他别名

## 错误处理

**模式:**
- 抛出错误，在边界捕获（路由处理器、主函数）
- 为自定义错误扩展 Error 类（ValidationError、NotFoundError）
- 异步函数使用 try/catch，无 .catch() 链

**错误类型:**
- 在无效输入、缺少依赖、不变量违反时抛出
- 抛出前记录带有上下文的错误：logger.error({ err, userId }, '处理失败')
- 在错误消息中包含原因：new Error('X 失败', { cause: originalError })

## 日志

**框架:**
- 从 lib/logger.ts 导出的 pino 日志器实例
- 级别: debug、info、warn、error（无 trace）

**模式:**
- 结构化日志与上下文：logger.info({ userId, action }, '用户操作')
- 在服务边界记录，不在工具函数中
- 记录状态转换、外部 API 调用、错误
- 提交的代码中无 console.log

## 注释

**何时注释:**
- 解释为什么，而不是什么：// 重试 3 次，因为 API 有瞬时故障
- 记录业务规则：// 用户必须在 24 小时内验证邮箱
- 解释非明显的算法或变通方法
- 避免明显的注释：// 将计数器设置为 0

**JSDoc/TSDoc:**
- 公共 API 函数必需
- 如果签名自解释则内部函数可选
- 使用 @param、@returns、@throws 标签

**TODO 注释:**
- 格式: // TODO: 描述（无用户名，使用 git blame）
- 如有问题则链接：// TODO: 修复竞态条件（问题 #123）

## 函数设计

**大小:**
- 保持低于 50 行
- 提取复杂逻辑的助手
- 每个函数一个抽象级别

**参数:**
- 最多 3 个参数
- 4+ 参数使用选项对象：function create(options: CreateOptions)
- 在参数列表中解构：function process({ id, name }: ProcessParams)

**返回值:**
- 显式 return 语句
- 保护子句使用早期返回
- 对预期失败使用 Result<T, E> 类型

## 模块设计

**导出:**
- 首选命名导出
- 仅 React 组件使用默认导出
- 从 index.ts 桶文件导出公共 API

**桶文件:**
- index.ts 重新导出公共 API
- 保持内部助手私有（不从 index 导出）
- 避免循环依赖（如需要则从特定文件导入）

---

*约定分析: 2025-01-20*
*在模式变更时更新*
```
</good_examples>

<guidelines>
**CONVENTIONS.md 应包含的内容:**
- 在代码库中观察到的命名模式
- 格式化规则（Prettier 配置、代码检查规则）
- 导入组织模式
- 错误处理策略
- 日志方法
- 注释约定
- 函数和模块设计模式

**这里不应包含的内容:**
- 架构决策（那是 ARCHITECTURE.md）
- 技术选择（那是 STACK.md）
- 测试模式（那是 TESTING.md）
- 文件组织（那是 STRUCTURE.md）

**填写此模板时:**
- 检查 .prettierrc、.eslintrc 或类似配置文件
- 检查 5-10 个代表性源文件的模式
- 寻找一致性：如果 80%+ 遵循模式，则记录它
- 规定性："使用 X" 而不是 "有时使用 Y"
- 注意偏差："旧代码使用 Y，新代码应使用 X"
- 保持约 150 行总数

**在阶段规划中用途:**
- 编写新代码（匹配现有风格）
- 添加功能（遵循命名模式）
- 重构（应用一致的约定）
- 代码审查（对照记录的模式检查）
- 入职（理解风格期望）

**分析方法:**
- 扫描 src/ 目录以获取文件命名模式
- 检查 package.json 脚本以获取 lint/format 命令
- 读取 5-10 个文件以识别函数命名、错误处理
- 查找配置文件（.prettierrc、eslint.config.js）
- 注意导入、注释、函数签名中的模式
</guidelines>
