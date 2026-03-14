# 测试模式模板

用于 `.planning/codebase/TESTING.md` 的模板 - 记录测试框架和模式。

**目的:** 记录如何编写和运行测试。添加匹配现有模式的测试的指南。

---

## 文件模板

```markdown
# 测试模式

**分析日期:** [YYYY-MM-DD]

## 测试框架

**运行器:**
- [框架: 例如，"Jest 29.x"、"Vitest 1.x"]
- [配置: 例如，"项目根目录中的 jest.config.js"]

**断言库:**
- [库: 例如，"内置的 expect"、"chai"]
- [匹配器: 例如，"toBe、toEqual、toThrow"]

**运行命令:**
```bash
[例如，"npm test" 或 "npm run test"]              # 运行所有测试
[例如，"npm test -- --watch"]                     # 监听模式
[例如，"npm test -- path/to/file.test.ts"]       # 单个文件
[例如，"npm run test:coverage"]                   # 覆盖率报告
```

## 测试文件组织

**位置:**
- [模式: 例如，"*.test.ts 与源文件并列"]
- [替代: 例如，"__tests__/ 目录"或"单独的 tests/ 树"]

**命名:**
- [单元测试: 例如，"module-name.test.ts"]
- [集成: 例如，"feature-name.integration.test.ts"]
- [端到端: 例如，"user-flow.e2e.test.ts"]

**结构:**
```
[显示实际目录模式，例如：
src/
  lib/
    utils.ts
    utils.test.ts
  services/
    user-service.ts
    user-service.test.ts
]
```

## 测试结构

**套件组织:**
```typescript
[显示使用的实际模式，例如：

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle success case', () => {
      // arrange
      // act
      // assert
    });

    it('should handle error case', () => {
      // 测试代码
    });
  });
});
]
```

**模式:**
- [设置: 例如，"beforeEach 用于共享设置，避免 beforeAll"]
- [清理: 例如，"afterEach 清理，恢复模拟"]
- [结构: 例如，"必需的 arrange/act/assert 模式"]

## 模拟

**框架:**
- [工具: 例如，"Jest 内置模拟"、"Vitest vi"、"Sinon"]
- [导入模拟: 例如，"文件顶部的 vi.mock()"]

**模式:**
```typescript
[显示实际模拟模式，例如：

// 模拟外部依赖
vi.mock('./external-service', () => ({
  fetchData: vi.fn()
}));

// 在测试中模拟
const mockFetch = vi.mocked(fetchData);
mockFetch.mockResolvedValue({ data: 'test' });
]
```

**模拟什么:**
- [例如，"外部 API、文件系统、数据库"]
- [例如，"时间/日期（使用 vi.useFakeTimers）"]
- [例如，"网络调用（使用模拟 fetch）"]

**不模拟什么:**
- [例如，"纯函数、工具"]
- [例如，"内部业务逻辑"]

## 装置和工厂

**测试数据:**
```typescript
[创建测试数据的模式示例：

// 工厂模式
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  };
}

// 装置文件
// tests/fixtures/users.ts
export const mockUsers = [/* ... */];
]
```

**位置:**
- [例如，"tests/fixtures/ 用于共享装置"]
- [例如，"工厂函数在测试文件或 tests/factories/ 中"]

## 覆盖率

**要求:**
- [目标: 例如，"80% 行覆盖率"、"无特定目标"]
- [执行: 例如，"CI 阻止 <80%"、"仅用于了解的覆盖率"]

**配置:**
- [工具: 例如，"通过 --coverage 标志的内置覆盖率"]
- [排除: 例如，"排除 *.test.ts、配置文件"]

**查看覆盖率:**
```bash
[例如，"npm run test:coverage"]
[例如，"open coverage/index.html"]
```

## 测试类型

**单元测试:**
- [范围: 例如，"隔离测试单个函数/类"]
- [模拟: 例如，"模拟所有外部依赖"]
- [速度: 例如，"每个测试必须在 <1s 内运行"]

**集成测试:**
- [范围: 例如，"一起测试多个模块"]
- [模拟: 例如，"模拟外部服务，使用真实的内部模块"]
- [设置: 例如，"使用测试数据库，种子数据"]

**端到端测试:**
- [框架: 例如，"用于 E2E 的 Playwright"]
- [范围: 例如，"测试完整的用户流程"]
- [位置: 例如，"与单元测试分离的 e2e/ 目录"]

## 常见模式

**异步测试:**
```typescript
[模式示例：

it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
]
```

**错误测试:**
```typescript
[模式示例：

it('should throw on invalid input', () => {
  expect(() => functionCall()).toThrow('error message');
});

// 异步错误
it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('error message');
});
]
```

**快照测试:**
- [使用: 例如，"仅用于 React 组件"或"未使用"]
- [位置: 例如，"__snapshots__/ 目录"]

---

*测试分析: [日期]*
*在测试模式变更时更新*
```

<good_examples>
```markdown
# 测试模式

**分析日期:** 2025-01-20

## 测试框架

**运行器:**
- Vitest 1.0.4
- 配置: 项目根目录中的 vitest.config.ts

**断言库:**
- Vitest 内置 expect
- 匹配器: toBe、toEqual、toThrow、toMatchObject

**运行命令:**
```bash
npm test                              # 运行所有测试
npm test -- --watch                   # 监听模式
npm test -- path/to/file.test.ts     # 单个文件
npm run test:coverage                 # 覆盖率报告
```

## 测试文件组织

**位置:**
- *.test.ts 与源文件并列
- 无单独的 tests/ 目录

**命名:**
- unit-name.test.ts 用于所有测试
- 文件名中不区分单元/集成

**结构:**
```
src/
  lib/
    parser.ts
    parser.test.ts
  services/
    install-service.ts
    install-service.test.ts
  bin/
    install.ts
    (无测试 - 通过 CLI 测试集成)
```

## 测试结构

**套件组织:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // 重置状态
    });

    it('should handle valid input', () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input');
    });
  });
});
```

**模式:**
- 使用 beforeEach 进行每测试设置，避免 beforeAll
- 使用 afterEach 恢复模拟：vi.restoreAllMocks()
- 在复杂测试中使用显式的 arrange/act/assert 注释
- 每个测试一个断言焦点（但多个 expect 可以）

## 模拟

**框架:**
- Vitest 内置模拟（vi）
- 通过 vi.mock() 在测试文件顶部进行模块模拟

**模式:**
```typescript
import { vi } from 'vitest';
import { externalFunction } from './external';

// 模拟模块
vi.mock('./external', () => ({
  externalFunction: vi.fn()
}));

describe('test suite', () => {
  it('mocks function', () => {
    const mockFn = vi.mocked(externalFunction);
    mockFn.mockReturnValue('mocked result');

    // 使用模拟函数的测试代码

    expect(mockFn).toHaveBeenCalledWith('expected arg');
  });
});
```

**模拟什么:**
- 文件系统操作（fs-extra）
- 子进程执行（child_process.exec）
- 外部 API 调用
- 环境变量（process.env）

**不模拟什么:**
- 内部纯函数
- 简单工具（字符串操作、数组助手）
- TypeScript 类型

## 装置和工厂

**测试数据:**
```typescript
// 测试文件中的工厂函数
function createTestConfig(overrides?: Partial<Config>): Config {
  return {
    targetDir: '/tmp/test',
    global: false,
    ...overrides
  };
}

// 共享装置在 tests/fixtures/
// tests/fixtures/sample-command.md
export const sampleCommand = `---
description: 测试命令
---
内容在这里`;
```

**位置:**
- 工厂函数：在使用附近在测试文件中定义
- 共享装置：tests/fixtures/（用于多文件测试数据）
- 模拟数据：测试中内联，复杂时使用工厂

## 覆盖率

**要求:**
- 无强制覆盖率目标
- 跟踪用于了解的覆盖率
- 专注于关键路径（解析器、服务逻辑）

**配置:**
- 通过 c8 的 Vitest 覆盖率（内置）
- 排除：*.test.ts、bin/install.ts、配置文件

**查看覆盖率:**
```bash
npm run test:coverage
open coverage/index.html
```

## 测试类型

**单元测试:**
- 隔离测试单个函数
- 模拟所有外部依赖（fs、child_process）
- 快速：每个测试 <100ms
- 示例：parser.test.ts、validator.test.ts

**集成测试:**
- 一起测试多个模块
- 仅模拟外部边界（文件系统、进程）
- 示例：install-service.test.ts（测试服务 + 解析器）

**端到端测试:**
- 目前未使用
- CLI 集成手动测试

## 常见模式

**异步测试:**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
```

**错误测试:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null');
});

// 异步错误
it('should reject on file not found', async () => {
  await expect(readConfig('invalid.txt')).rejects.toThrow('ENOENT');
});
```

**文件系统模拟:**
```typescript
import { vi } from 'vitest';
import * as fs from 'fs-extra';

vi.mock('fs-extra');

it('mocks file system', () => {
  vi.mocked(fs.readFile).mockResolvedValue('file content');
  // 测试代码
});
```

**快照测试:**
- 在此代码库中未使用
- 优先使用明确的断言以获得清晰度

---

*测试分析: 2025-01-20*
*在测试模式变更时更新*
```
</good_examples>

<guidelines>
**TESTING.md 应包含的内容:**
- 测试框架和运行器配置
- 测试文件位置和命名模式
- 测试结构（describe/it、beforeEach 模式）
- 模拟方法和示例
- 装置/工厂模式
- 覆盖率要求
- 如何运行测试（命令）
- 实际代码中的常见测试模式

**这里不应包含的内容:**
- 特定测试用例（ defer 到实际测试文件）
- 技术选择（那是 STACK.md）
- CI/CD 设置（那是部署文档）

**填写此模板时:**
- 检查 package.json 脚本以获取测试命令
- 查找测试配置文件（jest.config.js、vitest.config.ts）
- 读取 3-5 个现有测试文件以识别模式
- 查找 tests/ 或 test-utils/ 中的测试工具
- 检查覆盖率配置
- 记录使用的实际模式，而非理想模式

**在阶段规划中用途:**
- 添加新功能（编写匹配的测试）
- 重构（维护测试模式）
- 修复错误（添加回归测试）
- 理解验证方法
- 设置测试基础设施

**分析方法:**
- 检查 package.json 以获取测试框架和脚本
- 读取测试配置文件以获取覆盖率、设置
- 检查测试文件组织（并列 vs 分离）
- 查看 5 个测试文件以获取模式（模拟、结构、断言）
- 查找测试工具、装置、工厂
- 注意任何测试类型（单元、集成、端到端）
- 记录运行测试的命令
</guidelines>
