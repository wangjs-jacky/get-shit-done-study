# 编码规范模板

用于 `.planning/codebase/CONVENTIONS.md` - 捕获编码风格和模式。

**目的：** 记录此代码库中代码的编写方式。Claude匹配现有风格的规定性指南。

---

## 文件模板

```markdown
# 编码规范

**分析日期：** [YYYY-MM-DD]

## 命名模式

**文件：**
- [模式：如"所有文件使用kebab-case"]
- [测试文件：如"源文件旁边的*.test.ts"]
- [组件：如"React组件使用PascalCase.tsx"]

**函数：**
- [模式：如"所有函数使用camelCase"]
- [异步：如"async函数无特殊前缀"]
- [处理器：如"事件处理器使用handleEventName"]

**变量：**
- [模式：如"变量使用camelCase"]
- [常量：如"常量使用UPPER_SNAKE_CASE"]
- [私有：如"_prefix表示私有成员"或"无前缀"]

**类型：**
- [接口：如"PascalCase，无I前缀"]
- [类型：如"类型别名使用PascalCase"]
- [枚举：如"枚举名使用PascalCase，值使用UPPER_CASE"]

## 代码风格

**格式化：**
- [工具：如"Prettier与.prettierrc中的配置"]
- [行长：如"最多100字符"]
- [引号：如"字符串使用单引号"]
- [分号：如"必需"或"省略"]

**代码检查：**
- [工具：如"ESLint与eslint.config.js"]
- [规则：如"extends airbnb-base，生产环境中无console"]
- [运行：如"npm run lint"]

## 导入组织

**顺序：**
1. [如"外部包（react、express等）"]
2. [如"内部模块（@/lib、@/components）"]
3. [如"相对导入（.、..）"]
4. [如"类型导入（import type {}）"]

**分组：**
- [空行：如"各组间有空行"]
- [排序：如"每组内按字母顺序"]

**路径别名：**
- [使用的别名：如"@/映射到src/，@components/映射到src/components/"]

## 错误处理

**模式：**
- [策略：如"抛出错误，在边界处捕获"]
- [自定义错误：如"扩展Error类，命名为*Error"]
- [异步：如"使用try/catch，无.catch()链"]

**错误类型：**
- [何时抛出：如"无效输入、缺少依赖"]
- [何时返回：如"预期失败返回Result<T, E>"]
- [日志：如"抛出前记录带有上下文的错误"]

## 日志

**框架：**
- [工具：如"console.log、pino、winston"]
- [级别：如"debug、info、warn、error"]

**模式：**
- [格式：如"带有上下文对象的结构化日志"]
- [何时：如"记录状态转换、外部调用"]
- [位置：如"在服务边界记录，不在工具函数中"]

## 注释

**何时注释：**
- [如"解释为什么，而不是做什么"]
- [如"记录业务逻辑、算法、边界情况"]
- [如"避免明显的注释如//递增计数器"]

**JSDoc/TSDoc：**
- [使用：如"公共API必需，内部可选"]
- [格式：如"使用@param、@returns、@throws标签"]

**TODO注释：**
- [模式：如"// TODO(username): 描述"]
- [跟踪：如"如有，链接到问题号"]

## 函数设计

**大小：**
- [如"保持在50行以内，提取辅助函数"]

**参数：**
- [如"最多3个参数，使用对象处理更多"]
- [如"在参数列表中解构对象"]

**返回值：**
- [如"显式返回，无隐式undefined"]
- [如"守卫子句提前返回"]

## 模块设计

**导出：**
- [如"优先命名导出，React组件使用默认导出"]
- [如"从index.ts导出公共API"]

**桶文件：**
- [如"使用index.ts重新导出公共API"]
- [如"避免循环依赖"]

---

*规范分析：[日期]*
*模式变化时更新*
```

<good_examples>
```markdown
# 编码规范

**分析日期：** 2025-01-20

## 命名模式

**文件：**
- 所有文件使用kebab-case（command-handler.ts、user-service.ts）
- *.test.ts与源文件并排
- index.ts用于桶导出

**函数：**
- 所有函数使用camelCase
- 异步函数无特殊前缀
- 事件处理器使用handleEventName（handleClick、handleSubmit）

**变量：**
- 变量使用camelCase
- 常量使用UPPER_SNAKE_CASE（MAX_RETRIES、API_BASE_URL）
- 无下划线前缀（在TS中无私有标记）

**类型：**
- 接口使用PascalCase，无I前缀（User，不是IUser）
- 类型别名使用PascalCase（UserConfig、ResponseData）
- 枚举名使用PascalCase，值使用UPPER_CASE（Status.PENDING）

## 代码风格

**格式化：**
- Prettier与.prettierrc
- 100字符行长度
- 字符串使用单引号
- 分号必需
- 2空格缩进

**代码检查：**
- ESLint与eslint.config.js
- 扩展@typescript-eslint/recommended
- 生产代码中无console.log（使用记录器）
- 运行：npm run lint

## 导入组织

**顺序：**
1. 外部包（react、express、commander）
2. 内部模块（@/lib、@/services）
3. 相对导入（./utils、../types）
4. 类型导入（import type { User }）

**分组：**
- 各组间有空行
- 每组内按字母顺序
- 类型导入在每组中最后

**路径别名：**
- @/映射到src/
- 不定义其他别名

## 错误处理

**模式：**
- 抛出错误，在边界处捕获（路由处理器、主函数）
- 自定义错误扩展Error类（ValidationError、NotFoundError）
- 异步函数使用try/catch，无.catch()链

**错误类型：**
- 无效输入、缺少依赖、不变量违反时抛出
- 抛出前记录带有上下文的错误：logger.error({ err, userId }, '处理失败')
- 在错误消息中包含原因：new Error('X失败', { cause: originalError })

## 日志

**框架：**
- 从lib/logger.ts导出的pino记录器实例
- 级别：debug、info、warn、error（无trace）

**模式：**
- 带有上下文的结构化日志：logger.info({ userId, action }, '用户操作')
- 在服务边界记录，不在工具函数中
- 记录状态转换、外部API调用、错误
- 已提交代码中无console.log

## 注释

**何时注释：**
- 解释为什么，而不是做什么：// 重试3次因为API有瞬时故障
- 记录业务规则：// 用户必须在24小时内验证邮箱
- 解释非明显的算法或变通方案
- 避免明显的注释：// 将计数设置为0

**JSDoc/TSDoc：**
- 公共API函数必需
- 如果签名不言自明，内部函数可选
- 使用@param、@returns、@throws标签

**TODO注释：**
- 格式：// TODO: 描述（无用户名，使用git blame）
- 如存在则链接到问题：// TODO: 修复竞争条件（问题#123）

## 函数设计

**大小：**
- 保持50行以下
- 为复杂逻辑提取辅助函数
- 每个函数一个抽象层次

**参数：**
- 最多3个参数
- 4+参数使用选项对象：function create(options: CreateOptions)
- 在参数列表中解构：function process({ id, name }: ProcessParams)

**返回值：**
- 显式返回语句
- 守卫子句提前返回
- 对预期失败使用Result<T, E>类型

## 模块设计

**导出：**
- 优先命名导出
- 仅React组件使用默认导出
- 从index.ts桶文件导出公共API

**桶文件：**
- index.ts重新导出公共API
- 保持内部助手私有（不从index导出）
- 避免循环依赖（如需要从特定文件导入）

---

*规范分析：2025-01-20*
*模式变化时更新*
```
</good_examples>

<guidelines>
**CONVENTIONS.md中应包含的内容：**
- 代码库中观察到的命名模式
- 格式化规则（Prettier配置、代码检查规则）
- 导入组织模式
- 错误处理策略
- 日志方法
- 注释约定
- 函数和模块设计模式

**这里不应包含的内容：**
- 架构决策（那是ARCHITECTURE.md）
- 技术选择（那是STACK.md）
- 测试模式（那是TESTING.md）
- 文件组织（那是STRUCTURE.md）

**填写此模板时：**
- 检查.prettierrc、.eslintrc或类似配置文件
- 检查5-10个代表性源文件的模式
- 检查一致性：如果80%+遵循模式，记录它
- 规定性：使用"使用X"而不是"有时使用Y"
- 注意偏差："遗留代码使用Y，新代码应使用X"
- 保持约150行总长度

**阶段规划时有用：**
- 编写新代码（匹配现有风格）
- 添加功能（遵循命名模式）
- 重构（应用一致的约定）
- 代码审查（对照记录的模式检查）
- 上手（理解风格期望）

**分析方法：**
- 扫描src/目录获取文件命名模式
- 检查package.json脚本获取格式/代码检查命令
- 读取5-10个文件识别函数命名、错误处理
- 查找配置文件（.prettierrc、eslint.config.js）
- 注意导入、注释、函数签名中的模式
</guidelines>