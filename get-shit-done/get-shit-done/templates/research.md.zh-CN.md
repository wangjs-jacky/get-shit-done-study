# 研究模板

用于 `.planning/phases/XX-name/{phase_num}-RESEARCH.md` — 规划前的全面生态系统研究。

**目的：** 记录 Claude 需要知道什么来很好地实施阶段 — 不仅仅是"哪个库"，而是"专家如何构建这个"。

---

## 文件模板

```markdown
# 阶段 [X]: [名称] - 研究

**研究日期：** [日期]
**领域：** [主要技术/问题领域]
**置信度：** [高/中/低]

<user_constraints>
## 用户约束条件（来自 CONTEXT.md）

**重要：** 如果 CONTEXT.md 存在（来自 /gsd:discuss-phase），请逐字复制锁定决策在此。规划者必须遵守这些决策。

### 锁定决策
[从 CONTEXT.md `## 决策` 部分复制 - 这些是不可协商的]
- [决策 1]
- [决策 2]

### Claude 的决策权
[从 CONTEXT.md 复制 - 研究者/规划者可以选择的区域]
- [区域 1]
- [区域 2]

### 推迟的想法（范围外）
[从 CONTEXT.md 复制 - 不要研究和规划这些]
- [推迟 1]
- [推迟 2]

**如果 CONTEXT.md 不存在：** 写"无用户约束 - 所有决策由 Claude 自行决定"
</user_constraints>

<research_summary>
## 总结

[2-3 段执行摘要]
- 研究了什么
- 标准方法是什么
- 主要建议

**主要建议：** [一句可执行的行动指导]
</research_summary>

<standard_stack>
## 标准技术栈

该领域成熟的库/工具：

### 核心
| 库 | 版本 | 用途 | 为什么标准 |
|------|------|------|-----------|
| [名称] | [版本] | [功能] | [为什么专家使用它] |
| [名称] | [版本] | [功能] | [为什么专家使用它] |

### 支持
| 库 | 版本 | 用途 | 使用时机 |
|------|------|------|---------|
| [名称] | [版本] | [功能] | [用例] |
| [名称] | [版本] | [功能] | [用例] |

### 考虑的替代方案
| 替代 | 可用 | 权衡 |
|------|------|------|
| [标准] | [替代] | [替代有意义的时机] |

**安装：**
```bash
npm install [包名]
# 或
yarn add [包名]
```
</standard_stack>

<architecture_patterns>
## 架构模式

### 推荐项目结构
```
src/
├── [文件夹]/        # [用途]
├── [文件夹]/        # [用途]
└── [文件夹]/        # [用途]
```

### 模式 1: [模式名称]
**是什么：** [描述]
**何时使用：** [条件]
**示例：**
```typescript
// [来自 Context7/官方文档的代码示例]
```

### 模式 2: [模式名称]
**是什么：** [描述]
**何时使用：** [条件]
**示例：**
```typescript
// [代码示例]
```

### 避免的反模式
- **[反模式]:** [为什么不好，应该做什么]
- **[反模式]:** [为什么不好，应该做什么]
</architecture_patterns>

<dont_hand_roll>
## 不要手动构建

看起来简单但已有解决方案的问题：

| 问题 | 不要构建 | 使用替代方案 | 原因 |
|------|---------|-------------|------|
| [问题] | [你会构建的] | [库] | [边缘情况，复杂性] |
| [问题] | [你会构建的] | [库] | [边缘情况，复杂性] |
| [问题] | [你会构建的] | [库] | [边缘情况，复杂性] |

**关键见解：** [为什么自定义解决方案在此领域更差]
</dont_hand_roll>

<common_pitfalls>
## 常见陷阱

### 陷阱 1: [名称]
**出问题：** [描述]
**原因：** [根本原因]
**如何避免：** [预防策略]
**预警信号：** [如何早期检测]

### 陷阱 2: [名称]
**出问题：** [描述]
**原因：** [根本原因]
**如何避免：** [预防策略]
**预警信号：** [如何早期检测]

### 陷阱 3: [名称]
**出问题：** [描述]
**原因：** [根本原因]
**如何避免：** [预防策略]
**预警信号：** [如何早期检测]
</common_pitfalls>

<code_examples>
## 代码示例

来自官方来源的验证模式：

### [常见操作 1]
```typescript
// 来源: [Context7/官方文档 URL]
[代码]
```

### [常见操作 2]
```typescript
// 来源: [Context7/官方文档 URL]
[代码]
```

### [常见操作 3]
```typescript
// 来源: [Context7/官方文档 URL]
[代码]
```
</code_examples>

<sota_updates>
## 现状（2024-2025）

最近的变化：

| 旧方法 | 当前方法 | 变化时间 | 影响 |
|--------|----------|----------|------|
| [旧] | [新] | [日期/版本] | [对实施的意义] |

**新工具/模式考虑：**
- [工具/模式]: [它 enables 什么，何时使用]
- [工具/模式]: [它 enables 什么，何时使用]

**已废弃/过时的：**
- [东西]: [为什么过时，被什么取代]
</sota_updates>

<open_questions>
## 开放问题

无法完全解决的问题：

1. **[问题]**
   - 我们知道：[部分信息]
   - 不清楚：[差距]
   - 建议：[如何在规划/执行中处理]

2. **[问题]**
   - 我们知道：[部分信息]
   - 不清楚：[差距]
   - 建议：[如何处理]
</open_questions>

<sources>
## 来源

### 主要来源（高置信度）
- [Context7 库 ID] - [获取的主题]
- [官方文档 URL] - [检查的内容]

### 次要来源（中置信度）
- [经过官方来源验证的 WebSearch] - [发现 + 验证]

### 次要来源（低置信度 - 需要验证）
- [仅 WebSearch] - [发现，标记为实施时验证]
</sources>

<metadata>
## 元数据

**研究范围：**
- 核心技术：[什么]
- 生态系统：[探索的库]
- 模式：[研究的模式]
- 陷阱：[检查的领域]

**置信度 breakdown：**
- 标准技术栈：[高/中/低] - [原因]
- 架构：[高/中/低] - [原因]
- 陷阱：[高/中/低] - [原因]
- 代码示例：[高/中/低] - [原因]

**研究日期：** [日期]
**有效期至：** [估计 - 稳定技术 30 天，快速发展技术 7 天]
</metadata>

---

*阶段：XX-name*
*研究完成：[日期]*
*准备规划：[是/否]*
```

---

## 良好示例

```markdown
# 阶段 3: 3D 城市驾驶 - 研究

**研究日期：** 2025-01-20
**领域：** Three.js 3D 网络游戏，带驾驶机制
**置信度：** 高

<research_summary>
## 总结

研究了用于构建 3D 城市驾驶游戏的 Three.js 生态系统。标准方法使用 Three.js 和 React Three Fiber 进行组件架构，Rapier 用于物理，drei 用于常见帮助。

关键发现：不要手动构建物理或碰撞检测。Rapier（通过 @react-three/rapier）高效处理车辆物理、地形碰撞和城市物体交互。自定义物理代码会导致错误和性能问题。

**主要建议：** 使用 R3F + Rapier + drei 技术栈。从 drei 的车辆控制器开始，添加 Rapier 车辆物理，使用实例化网格构建城市以提高性能。
</research_summary>

<standard_stack>
## 标准技术栈

### 核心
| 库 | 版本 | 用途 | 为什么标准 |
|------|------|------|-----------|
| three | 0.160.0 | 3D 渲染 | Web 3D 的标准 |
| @react-three/fiber | 8.15.0 | Three.js 的 React 渲染器 | 声明式 3D，更好的 DX |
| @react-three/drei | 9.92.0 | 帮助和抽象 | 解决常见问题 |
| @react-three/rapier | 1.2.1 | 物理引擎绑定 | R3F 的最佳物理选择 |

### 支持
| 库 | 版本 | 用途 | 使用时机 |
|------|------|------|---------|
| @react-three/postprocessing | 2.16.0 | 视觉效果 | Bloom、DOF、动态模糊 |
| leva | 0.9.35 | 调试 UI | 调整参数 |
| zustand | 4.4.7 | 状态管理 | 游戏状态、UI 状态 |
| use-sound | 4.0.1 | 音频 | 引擎声音、环境音 |

### 考虑的替代方案
| 替代 | 可用 | 权衡 |
|------|------|------|
| Rapier | Cannon.js | Cannon 更简单但车辆性能较低 |
| R3F | 原生 Three | 如果不使用 React 则用原生，但 R3F DX 好得多 |
| drei | 自定义帮助 | drei 是经过验证的，不要重新发明 |

**安装：**
```bash
npm install three @react-three/fiber @react-three/drei @react-three/rapier zustand
```
</standard_stack>

<architecture_patterns>
## 架构模式

### 推荐项目结构
```
src/
├── components/
│   ├── Vehicle/          # 带物理的玩家汽车
│   ├── City/             # 城市生成和建筑
│   ├── Road/             # 道路网络
│   └── Environment/      # 天空、光照、雾
├── hooks/
│   ├── useVehicleControls.ts
│   └── useGameState.ts
├── stores/
│   └── gameStore.ts      # Zustand 状态
└── utils/
    └── cityGenerator.ts  # 程序化生成助手
```

### 模式 1: 带有 Rapier 物理的车辆
**是什么：** 使用特定于车辆的设置的 RigidBody，不是自定义物理
**何时使用：** 任何地面车辆
**示例：**
```typescript
// 来源: @react-three/rapier 文档
import { RigidBody, useRapier } from '@react-three/rapier'

function Vehicle() {
  const rigidBody = useRef()

  return (
    <RigidBody
      ref={rigidBody}
      type="dynamic"
      colliders="hull"
      mass={1500}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <mesh>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial />
      </mesh>
    </RigidBody>
  )
}
```

### 模式 2: 用于城市的实例化网格
**是什么：** 对重复对象（建筑、树木、道具）使用 InstancedMesh
**何时使用：** >100 个相似对象
**示例：**
```typescript
// 来源: drei 文档
import { Instances, Instance } from '@react-three/drei'

function Buildings({ positions }) {
  return (
    <Instances limit={1000}>
      <boxGeometry />
      <meshStandardMaterial />
      {positions.map((pos, i) => (
        <Instance key={i} position={pos} scale={[1, Math.random() * 5 + 1, 1]} />
      ))}
    </Instances>
  )
}
```

### 避免的反模式
- **在渲染循环中创建网格：** 创建一次，仅更新变换
- **不使用 InstancedMesh：** 单独的建筑网格会杀死性能
- **自定义物理数学：** Rapier 每次都更好处理
</architecture_patterns>

<dont_hand_roll>
## 不要手动构建

| 问题 | 不要构建 | 使用替代方案 | 原因 |
|------|---------|-------------|------|
| 车辆物理 | 自定义速度/加速度 | Rapier RigidBody | 轮子摩擦、悬挂、碰撞很复杂 |
| 碰撞检测 | 对所有东西进行光线投射 | Rapier 碰撞器 | 性能、边缘情况、隧道效应 |
| 相机跟随 | 手动 lerp | drei CameraControls 或自定义使用 useFrame | 平滑插值、边界 |
| 城市生成 | 纯随机放置 | 基于网格+噪声的变化 | 随机看起来不对，网格是可预测的 |
| LOD | 手动距离检查 | drei <Detailed> | 处理过渡、滞回 |

**关键见解：** 3D 游戏开发有 40 多年的已解决问题。Rapier 实现适当的物理模拟。drei 实现适当的 3D 帮助。与之对抗会导致看起来像"游戏感觉"但实际上是物理边缘情况错误的 bug。
</dont_hand_roll>

<common_pitfalls>
## 常见陷阱

### 陷阱 1: 物理隧道效应
**出问题：** 快速物体穿过墙壁
**原因：** 默认物理步长对于速度来说太大
**如何避免：** 在 Rapier 中使用 CCD（连续碰撞检测）
**预警信号：** 物体随机出现在建筑外

### 陷阱 2: 绘制调用导致的性能死亡
**出问题：** 游戏在大量建筑时卡顿
**原因：** 每个网格 = 1 个绘制调用，数百个建筑 = 数百个调用
**如何避免：** 对相似对象使用 InstancedMesh，合并静态几何
**预警信号：** GPU 受限，简单场景 FPS 低

### 陷阱 3: 车辆"漂浮"感
**出问题：** 汽车感觉不接地
**原因：** 缺少适当的轮子/悬挂模拟
**如何避免：** 使用 Rapier 车辆控制器或仔细调整质量/阻尼
**预警信号：** 汽车奇怪弹跳，不抓弯道
</common_pitfalls>

<code_examples>
## 代码示例

### 基本 R3F + Rapier 设置
```typescript
// 来源: @react-three/rapier 入门
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'

function Game() {
  return (
    <Canvas>
      <Physics gravity={[0, -9.81, 0]}>
        <Vehicle />
        <City />
        <Ground />
      </Physics>
    </Canvas>
  )
}
```

### 车辆控制 Hook
```typescript
// 来源: 社区模式，用 drei 文档验证
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'

function useVehicleControls(rigidBodyRef) {
  const [, getKeys] = useKeyboardControls()

  useFrame(() => {
    const { forward, back, left, right } = getKeys()
    const body = rigidBodyRef.current
    if (!body) return

    const impulse = { x: 0, y: 0, z: 0 }
    if (forward) impulse.z -= 10
    if (back) impulse.z += 5

    body.applyImpulse(impulse, true)

    if (left) body.applyTorqueImpulse({ x: 0, y: 2, z: 0 }, true)
    if (right) body.applyTorqueImpulse({ x: 0, y: -2, z: 0 }, true)
  })
}
```
</code_examples>

<sota_updates>
## 现状（2024-2025）

| 旧方法 | 当前方法 | 变化时间 | 影响 |
|--------|----------|----------|------|
| cannon-es | Rapier | 2023 | Rapier 更快，维护更好 |
| 原生 Three.js | React Three Fiber | 2020+ | R3F 现在是 React 应用标准 |
| 手动 InstancedMesh | drei <Instances> | 2022 | 更简单的 API，处理更新 |

**新工具/模式考虑：**
- **WebGPU：** 正在到来但游戏尚不可用（2025）
- **drei Gltf 帮助：** <useGLTF.preload> 用于加载屏幕

**已废弃/过时的：**
- **cannon.js（原始版）：** 使用 cannon-es fork 或更好的选择，Rapier
- **手动光线投射进行物理：** 只使用 Rapier 碰撞器
</sota_updates>

<sources>
## 来源

### 主要来源（高置信度）
- /pmndrs/react-three-fiber - 入门、hooks、性能
- /pmndrs/drei - 实例、控制、帮助
- /dimforge/rapier-js - 物理设置、车辆物理

### 次要来源（中置信度）
- Three.js discourse "city driving game" 线程 - 用文档验证模式
- R3F 示例仓库 - 验证代码有效

### 次要来源（低置信度 - 需要验证）
- 无 - 所有发现都已验证
</sources>

<metadata>
## 元数据

**研究范围：**
- 核心技术：Three.js + React Three Fiber
- 生态系统：Rapier、drei、zustand
- 模式：车辆物理、实例化、城市生成
- 陷阱：性能、物理、感觉

**置信度 breakdown：**
- 标准技术栈：高 - 用 Context7 验证，广泛使用
- 架构：高 - 来自官方示例
- 陷阱：高 - 在 discourse 中记录，在文档中验证
- 代码示例：高 - 来自 Context7/官方来源

**研究日期：** 2025-01-20
**有效期至：** 2025-02-20（30 天 - R3F 生态系统稳定）
</metadata>

---

*阶段：03-city-driving*
*研究完成：2025-01-20*
*准备规划：是*
```

---

## 指导原则

**何时创建：**
- 在专业/复杂领域规划阶段前
- 当 Claude 的训练数据可能过时或稀少时
- 当"专家如何做"比"哪个库"更重要时

**结构：**
- 使用 XML 标签作为部分标记符（匹配 GSD 模板）
- 七个核心部分：summary、standard_stack、architecture_patterns、dont_hand_roll、common_pitfalls、code_examples、sources
- 所有部分都是必需的（驱动全面研究）

**内容质量：**
- 标准技术栈：具体版本，不只是名称
- 架构：来自权威来源的实际代码示例
- 不要手动构建：明确说明不应该自己解决的问题
- 陷阱：包括预警信号，不只是"不要做这个"
- 来源：诚实标记置信度级别

**与规划的集成：**
- RESEARCH.md 作为 PLAN.md 中的 @context 引用加载
- 标准技术栈影响库选择
- 不要手动构建防止自定义解决方案
- 陷阱影响验证标准
- 代码示例可以在任务动作中引用

**创建后：**
- 文件位于阶段目录：`.planning/phases/XX-name/{phase_num}-RESEARCH.md`
- 在规划工作流程中引用
- plan-phase 在存在时自动加载