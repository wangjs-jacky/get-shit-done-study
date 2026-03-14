# 测试模式模板

用于 `.planning/codebase/TESTING.md` - 捕获测试框架和模式。

**目的：** 记录如何编写和运行测试。为添加匹配现有模式的测试提供指导。

---

## 文件模板

```markdown
# 测试模式

**分析日期：** [YYYY-MM-DD]

## 测试框架

**运行器：**
- [框架：如"Jest 29.x", "Vitest 1.x"]
- [配置：如"项目根目录中的jest.config.js"]

**断言库：**
- [库：如"内置的expect", "chai"]
- [匹配器：如"toBe, toEqual, toThrow"]

**运行命令：**
```bash
[e.g., "npm test" or "npm run test"]              # 运行所有测试
[e.g., "npm test -- --watch"]                     # 监视模式
[e.g., "npm test -- path/to/file.test.ts"]       # 单个文件
[e.g., "npm run test:coverage"]                   # 覆盖率报告
```

## 测试文件组织

**位置：**
- [模式：如"源文件旁边的*.test.ts"]
- [替代：如"__tests__/目录"或"单独的tests/树"]

**命名：**
- [单元测试：如"module-name.test.ts"]
- [集成：如"feature-name.integration.test.ts"]
- [E2E：如"user-flow.e2e.test.ts"]

**结构：**
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

**套件组织：**
```typescript
[显示实际使用的模式，例如：

describe('模块名', () => {
  describe('函数名', () => {
    it('应处理成功情况', () => {
      // arrange
      // act
      // assert
    });

    it('应处理错误情况', () => {
      // 测试代码
    });
  });
});
```

**模式：**
- [设置：如"beforeEach用于共享设置，避免beforeAll"]
- [清理：如"afterEach清理，恢复mock"]
- [结构：如"arrange/act/assert模式必需"]

## 模拟

**框架：**
- [工具：如"Jest内置模拟", "Vitest vi", "Sinon"]
- [导入模拟：如"文件顶部的vi.mock()"]

**模式：**
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

**模拟什么：**
- [如"外部API、文件系统、数据库"]
- [如"时间/日期（使用vi.useFakeTimers）"]
- [如"网络调用（使用mock fetch）"]

**什么不模拟：**
- [如"纯函数、工具"]
- [如"内部业务逻辑"]

## 夹具和工厂

**测试数据：**
```typescript
[创建测试数据的模式示例，例如：

// 工厂模式
function createTestUser(overrides?: Partial<用户>): 用户 {
  return {
    id: 'test-id',
    name: '测试用户',
    email: 'test@example.com',
    ...overrides
  };
}

// 夹具文件
// tests/fixtures/users.ts
export const mockUsers = [/* ... */];
]
```

**位置：**
- [如"tests/fixtures/用于共享夹具"]
- [如"工厂函数在测试文件或tests/factories/中"]

## 覆盖率

**要求：**
- [目标：如"80%行覆盖率", "无特定目标"]
- [执行：如"CI阻止<80%", "仅用于意识的覆盖率"]

**配置：**
- [工具：如"通过--coverage标志的内置覆盖率"]
- [排除：如"排除*.test.ts，配置文件"]

**查看覆盖率：**
```bash
[e.g., "npm run test:coverage"]
[e.g., "open coverage/index.html"]
```

## 测试类型

**单元测试：**
- [范围：如"隔离测试单个函数/类"]
- [模拟：如"模拟所有外部依赖"]
- [速度：如"每个测试<1s"]

**集成测试：**
- [范围：如"一起测试多个模块"]
- [模拟：如"模拟外部服务，使用真实内部模块"]
- [设置：如"使用测试数据库，种子数据"]

**E2E测试：**
- [框架：如"E2E的Playwright"]
- [范围：如"测试完整用户流程"]
- [位置：如"与单元测试分离的e2e/目录"]

## 常见模式

**异步测试：**
```typescript
[模式，例如：

it('应处理异步操作', async () => {
  const result = await asyncFunction();
  expect(result).toBe('预期');
});
]
```

**错误测试：**
```typescript
[模式，例如：

it('应在无效输入时抛出', () => {
  expect(() => functionCall()).toThrow('错误消息');
});

// 异步错误
it('应在失败时拒绝', async () => {
  await expect(asyncCall()).rejects.toThrow('错误消息');
});
]
```

**快照测试：**
- [使用：如"仅用于React组件"或"未使用"]
- [位置：如"__snapshots__/目录"]

---

*测试分析：[日期]*
*测试模式变化时更新*
```

<good_examples>
```markdown
# 测试模式

**分析日期：** 2025-01-20

## 测试框架

**运行器：**
- Vitest 1.0.4
- 配置：项目根目录中的vitest.config.ts

**断言库：**
- Vitest内置expect
- 匹配器：toBe, toEqual, toThrow, toMatchObject

**运行命令：**
```bash
npm test                              # 运行所有测试
npm test -- --watch                   # 监视模式
npm test -- path/to/file.test.ts     # 单个文件
npm run test:coverage                 # 覆盖率报告
```

## 测试文件组织

**位置：**
- 源文件旁边的*.test.ts
- 无单独的tests/目录

**命名：**
- unit-name.test.ts用于所有测试
- 文件名中不区分单元/集成

**结构：**
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
    （无测试 - 通过CLI测试集成）
```

## 测试结构

**套件组织：**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('模块名', () => {
  describe('函数名', () => {
    beforeEach(() => {
      // 重置状态
    });

    it('应处理有效输入', () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('应在无效输入时抛出', () => {
      expect(() => functionName(null)).toThrow('无效输入');
    });
  });
});
```

**模式：**
- 使用beforeEach进行每个测试设置，避免beforeAll
- 使用afterEach恢复mock：vi.restoreAllMocks()
- 在复杂测试中显式arrange/act/assert注释
- 每个测试一个断言焦点（但多个expect OK）

## 模拟

**框架：**
- Vitest内置模拟（vi）
- 通过文件顶部的vi.mock()进行模块模拟

**模式：**
```typescript
import { vi } from 'vitest';
import { externalFunction } from './external';

// 模拟模块
vi.mock('./external', () => ({
  externalFunction: vi.fn()
}));

describe('测试套件', () => {
  it('模拟函数', () => {
    const mockFn = vi.mocked(externalFunction);
    mockFn.mockReturnValue('模拟结果');

    // 使用模拟函数的测试代码

    expect(mockFn).toHaveBeenCalledWith('预期参数');
  });
});
```

**模拟什么：**
- 文件系统操作（fs-extra）
- 子进程执行（child_process.exec）
- 外部API调用
- 环境变量（process.env）

**什么不模拟：**
- 内部纯函数
- 简单工具（字符串操作、数组助手）
- TypeScript类型

## 夹具和工厂

**测试数据：**
```typescript
// 测试文件中的工厂函数
function createTestConfig(overrides?: Partial<配置>): 配置 {
  return {
    targetDir: '/tmp/test',
    global: false,
    ...overrides
  };
}

// 共享夹具在tests/fixtures/
// tests/fixtures/sample-command.md
export const sampleCommand = `---
description: 测试命令
---
内容在这里`;
```

**位置：**
- 工厂函数：在使用附近的测试文件中定义
- 共享夹具：tests/fixtures/（用于多文件测试数据）
- 模拟数据：简单时内联在测试中，复杂时使用工厂

## 覆盖率

**要求：**
- 无强制覆盖率目标
- 跟踪覆盖率以供了解
- 关注关键路径（解析器、服务逻辑）

**配置：**
- 通过c8的Vitest覆盖率（内置）
- 排除：*.test.ts, bin/install.ts, 配置文件

**查看覆盖率：**
```bash
npm run test:coverage
open coverage/index.html
```

## 测试类型

**单元测试：**
- 隔离测试单个函数
- 模拟所有外部依赖（fs、child_process）
- 快速：每个测试<100ms
- 示例：parser.test.ts, validator.test.ts

**集成测试：**
- 一起测试多个模块
- 仅模拟外部边界（文件系统、进程）
- 示例：install-service.test.ts（测试服务+解析器）

**E2E测试：**
- 当前未使用
- CLI集成手动测试

## 常见模式

**异步测试：**
```typescript
it('应处理异步操作', async () => {
  const result = await asyncFunction();
  expect(result).toBe('预期');
});
```

**错误测试：**
```typescript
it('应在无效输入时抛出', () => {
  expect(() => parse(null)).toThrow('无法解析null');
});

// 异步错误
it('应在文件未找到时拒绝', async () => {
  await expect(readConfig('invalid.txt')).rejects.toThrow('ENOENT');
});
```

**文件系统模拟：**
```typescript
import { vi } from 'vitest';
import * as fs from 'fs-extra';

vi.mock('fs-extra');

it('模拟文件系统', () => {
  vi.mocked(fs.readFile).mockResolvedValue('文件内容');
  // 测试代码
});
```

**快照测试：**
- 在此代码库中未使用
- 为清晰性优先显式断言

---

*测试分析：2025-01-20*
*测试模式变化时更新*
```
</good_examples>

<guidelines>
**TESTING.md中应包含的内容：**
- 测试框架和运行器配置
- 测试文件位置和命名模式
- 测试结构（describe/it、beforeEach模式）
- 模拟方法和示例
- 夹具/工厂模式
- 覆盖率要求
- 如何运行测试（命令）
- 实际代码中常见测试模式

**这里不应包含的内容：**
- 特定测试用例（ defer到实际测试文件）
- 技术选择（那是STACK.md）
- CI/CD设置（那是部署文档）

**填写此模板时：**
- 检查package.json脚本获取测试命令
- 查找测试配置文件（jest.config.js、vitest.config.ts）
- 读取3-5个现有测试文件以识别模式
- 查找tests/或test-utils/中的测试工具
- 检查覆盖率配置
- 记录实际使用的模式，而非理想模式

**阶段规划时有用：**
- 添加新功能（编写匹配测试）
- 重构（维护测试模式）
- 修复错误（添加回归测试）
- 理解验证方法
- 设置测试基础结构

**分析方法：**
- 检查package.json获取测试框架和脚本
- 读取测试配置文件获取覆盖率、设置
- 检查测试文件组织（并置vs分离）
- 查看5个测试文件获取模式（模拟、结构、断言）
- 查找测试工具、夹具、工厂
- 注意任何测试类型（单元、集成、e2e）
- 记录运行测试的命令
</guidelines>