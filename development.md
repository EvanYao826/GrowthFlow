# GrowthFlow 项目开发文档

> 个人成长计划与记录系统 — 开发指南与规范

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [数据模型](#数据模型)
- [页面结构](#页面结构)
- [核心功能](#核心功能)
- [分阶段开发计划](#分阶段开发计划)
- [开发规范](#开发规范)
- [测试与验收](#测试与验收)
- [部署说明](#部署说明)
- [隐私与安全](#隐私与安全)

---

## 项目概述

### 项目定位

**GrowthFlow**（个人成长计划与记录系统）是一个 Local-First（本地优先）的个人效率工具，帮助用户管理每日计划、记录实际执行情况、跟踪学习与运动、进行每周和每月复盘。

### 核心理念

- 计划可以灵活调整，不强迫用户每天完成所有任务
- 记录应简单快捷，晚上花 3–5 分钟就能完成
- 计划和实际执行情况分开存储
- 用户的数据由用户自己掌控，不依赖特定账号、服务器或付费服务
- 任何人都可以 Clone 项目、本地运行、部署到自己的静态网站

### 产品原则

**简单、可靠、可持续、数据属于用户。**

---

## 技术栈

| 技术 | 用途 | 说明 |
|------|------|------|
| Vue 3 | 前端框架 | 使用 Composition API + `<script setup>` |
| TypeScript | 类型系统 | 为业务数据、组件 Props、函数提供明确类型 |
| Vite | 构建工具 | 开发服务器与生产构建 |
| Pinia | 状态管理 | 管理计划、每日记录、用户设置等应用状态 |
| Vue Router | 路由 | 多页面导航 |
| Tailwind CSS | 样式框架 | 响应式界面，统一设计规范 |
| IndexedDB (Dexie) | 本地数据库 | 保存计划、每日执行记录和复盘数据 |
| Lucide Vue Next | 图标库 | 统一的图标组件 |
| Vitest | 测试框架 | 测试核心业务逻辑和数据导入导出 |

### 版本要求

- 使用稳定、相互兼容的依赖版本
- 在 `package.json` 中明确声明版本号
- 不引入没有实际用途的依赖

---

## 项目结构

```
GrowthFlow/
├── public/
│   └── examples/          # 示例计划文件
├── src/
│   ├── assets/            # 静态资源
│   ├── components/        # 通用组件
│   │   ├── layout/        # 布局组件（导航栏、侧边栏等）
│   │   ├── dashboard/     # 首页相关组件
│   │   ├── calendar/      # 日历相关组件
│   │   ├── tasks/         # 任务相关组件
│   │   ├── records/       # 每日记录相关组件
│   │   ├── reviews/       # 复盘相关组件
│   │   └── import-export/ # 导入导出相关组件
│   ├── views/             # 页面视图
│   ├── stores/            # Pinia 状态管理
│   ├── services/          # 业务服务
│   │   ├── database/      # IndexedDB 数据库服务
│   │   ├── importers/     # 各种格式导入器
│   │   ├── exporters/     # 各种格式导出器
│   │   └── statistics/    # 统计计算服务
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── router/            # 路由配置
│   └── App.vue
├── tests/                 # 测试文件
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

---

## 数据模型

### PlanTask（计划任务）

```typescript
interface PlanTask {
  id: string;                    // 唯一标识
  date: string;                  // 计划日期 (YYYY-MM-DD)
  title: string;                 // 任务名称
  description: string;           // 任务描述
  category: TaskCategory;        // 任务类别
  priority: TaskPriority;        // 任务优先级
  minimumRequirement: string;    // 最低完成标准
  plannedMinutes?: number;       // 计划时长（可选）
  status: TaskStatus;            // 任务状态
  actualMinutes?: number;        // 实际投入时间（可选）
  note: string;                  // 任务备注
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}
```

### TaskCategory（任务类别）

```typescript
type TaskCategory = 
  | 'work'        // 工作
  | 'study'       // 学习
  | 'exercise'    // 运动
  | 'creation'    // 内容创作
  | 'life'        // 生活
  | 'other';      // 其他
```

### TaskPriority（任务优先级）

```typescript
type TaskPriority = 'high' | 'medium' | 'low';
```

### TaskStatus（任务状态）

```typescript
type TaskStatus = 
  | 'not-started'   // 未开始
  | 'in-progress'   // 进行中
  | 'completed'     // 已完成
  | 'skipped';      // 主动跳过
```

### DailyRecord（每日记录）

```typescript
interface DailyRecord {
  date: string;                  // 记录日期 (YYYY-MM-DD)
  
  // 工作记录
  workDone: string;              // 今天完成了什么工作
  workProblems: string;          // 遇到了什么问题
  workLearnings: string;         // 学到了什么工程经验
  
  // 学习记录
  studyTopic: string;            // 今日学习主题
  studyMinutes: number;          // 实际有效学习时间
  masteredQuestions: string;     // 已经能够独立回答的问题
  unresolvedQuestions: string;   // 仍然不会的问题
  studyLinks: string;            // 对应的笔记或外部链接
  
  // 运动记录
  exerciseType: string;          // 运动类型
  exerciseContent: string;       // 训练内容与时长
  bodyCondition: string;         // 身体状态
  nextAdjustment: string;        // 是否需要调整下一次训练
  
  // 创作记录
  creationTitle: string;         // 内容标题
  creationType: string;          // 内容类型
  creationStatus: CreationStatus;// 当前状态
  publishLink: string;           // 发布链接
  creationNotes: string;         // 相关素材和备注
  
  // 每日复盘
  achievement: string;           // 今日最重要的进展
  obstacle: string;              // 今日最大的困难
  energy: number;                // 精力状态 1-5 分
  tomorrowMinimum: string;       // 明天最小的任务
  generalNotes: string;          // 自由文本备注
  
  updatedAt: number;             // 更新时间戳
}
```

### CreationStatus（创作状态）

```typescript
type CreationStatus = 'draft' | 'preparing' | 'published';
```

### Review（复盘）

```typescript
interface Review {
  id: string;                    // 唯一标识
  periodType: 'weekly' | 'monthly'; // 周复盘或月复盘
  startDate: string;             // 周期开始日期
  endDate: string;               // 周期结束日期
  achievements: string;          // 阶段成果
  obstacles: string;             // 主要阻碍
  improvements: string;          // 下一阶段改进计划
  notes: string;                 // 补充内容
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}
```

### AppSettings（应用设置）

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';  // 主题设置
  weekStartsOn: 0 | 1;                 // 每周起始日（0=周日，1=周一）
  defaultStudyMinimum: number;         // 默认每日最低学习量（分钟）
  categories: TaskCategoryConfig[];    // 任务类别配置
  schemaVersion: number;               // 数据版本号
}

interface TaskCategoryConfig {
  key: TaskCategory;
  label: string;
  color: string;
  icon: string;
}
```

---

## 页面结构

### 整体布局

- **桌面端**：左侧导航栏 + 主内容区
- **移动端**：底部导航栏或抽屉式导航
- **主题**：支持浅色和深色模式
- **响应式**：适配桌面、平板和手机

### 页面一：首页 / 今日计划（`/`）

**顶部展示：**
- 当前日期、星期
- 每日变化的简短鼓励语
- 今日整体完成进度
- 今日任务数量、已完成数量
- 最近的学习、运动和创作记录

**主体功能：**
- 今日任务列表（按类别分组）
- 任务详情：名称、描述、类别、优先级、完成标准
- 任务操作：标记状态（未开始/进行中/已完成/主动跳过）、编辑、删除、调整顺序
- 记录实际投入时间及完成情况
- 添加任务备注
- 新增临时任务
- 「今日记录」入口

### 页面二：日历 / 计划管理（`/calendar`）

**功能：**
- 月视图日历，默认展示当前月份
- 按日期显示每日任务和完成情况
- 不同任务类别通过颜色或图标区分
- 点击某一天，打开当天计划与记录详情
- 支持切换上个月、下个月及返回今天
- 支持补录过去日期的记录
- 支持新增、修改和删除未来计划
- 支持将任务安排到指定日期
- 区分「计划完成」和「实际完成」

### 页面三：每日记录（`/record`）

**模块：**
1. 工作记录
2. 学习记录
3. 运动记录
4. 创作记录
5. 每日复盘

**要求：**
- 自动保存
- 切换页面或刷新后数据仍在
- 保存状态提示
- 支持查看和编辑历史记录
- 当天没有某类活动时允许留空

### 页面四：每周复盘与月度统计（`/reviews`）

**周复盘：**
- 本周完成的重要任务
- 有效学习次数和学习总时长
- 计划训练与实际训练次数
- 已发布的技术视频和文章数量
- 本周最大的阻碍
- 本周最重要的收获
- 下周最值得改进的一件事

**月度复盘：**
- 月度计划完成情况
- 学习次数和总时长
- 不同类别任务的完成情况
- 运动次数与运动时长
- 内容创作和发布数量
- 连续记录天数
- 未完成任务及其原因
- 本月总结和下月目标

### 页面五：数据管理与设置（`/settings`）

**功能：**
- 主题设置
- 每周起始日设置
- 默认每日最低学习量设置
- 任务类别管理
- 数据导入（文件导入、粘贴导入）
- 数据导出
- 数据恢复
- 示例数据加载与清除
- 清空所有本地数据（二次确认）

---

## 核心功能

### 计划导入方式

#### 1. 文件导入

支持格式：
- **JSON**：标准计划数据，结构化导入
- **Markdown**：支持标题、列表、日期标题和任务复选框
- **TXT**：按行解析任务
- **CSV**：包含日期、任务名称、任务类别、描述、最低完成标准等字段

功能要求：
- 文件选择器 + 拖放上传
- 文件类型、大小和内容格式校验
- 解析进度或处理状态显示
- 解析失败时显示具体原因

#### 2. 复制粘贴导入

处理流程：
1. 粘贴文本
2. 点击「解析计划」
3. 展示解析后的预览表格（按日期分组）
4. 允许用户编辑解析结果
5. 检查重复日期、空任务、无效日期等问题
6. 选择导入策略并确认导入

识别内容：
- 日期与星期
- 任务名称
- 任务类别
- 任务描述
- 最低完成量
- 任务优先级
- 计划备注

#### 3. 手动创建计划

功能：
- 创建单日计划
- 批量创建多个任务
- 指定日期和类别
- 设置任务描述和最低完成标准
- 复制已有任务到其他日期
- 修改和删除任务
- 周期性计划（每周重复规则）

#### 导入策略

- **追加导入**：保留现有计划，添加新任务
- **合并导入**：根据任务 ID 识别重复数据，提供冲突预览
- **替换指定日期的计划**：只替换用户选择的日期范围

### 数据导出与备份

- 导出完整 JSON 备份
- 导出指定日期范围的计划与记录
- 从备份文件恢复数据
- 导入前校验结构、版本和字段类型
- 版本不兼容时给出清晰提示
- 导入失败时不破坏现有数据
- 完全由浏览器端完成

---

## 分阶段开发计划

### 阶段 0：项目初始化与开发环境

- 检查当前目录和现有文件
- 创建项目基础结构
- 配置 Vue 3、TypeScript、Vite、Tailwind CSS 等技术栈
- 安装依赖
- 启动开发服务器
- 确保浏览器可以访问基础页面

### 阶段 1：整体布局与视觉基础

- 实现导航栏、主内容区和响应式布局
- 实现主题、基础卡片、按钮、表单等通用组件
- 完成首页的基础视觉结构
- 确保桌面端和移动端布局正常

### 阶段 2：数据存储与任务管理

- 建立 TypeScript 数据模型
- 实现 IndexedDB 数据持久化
- 实现任务的新增、编辑、删除、完成和状态调整
- 验证刷新后数据仍然存在

### 阶段 3：计划导入

子阶段：
1. 手动创建计划
2. JSON 文件导入与导出
3. Markdown、TXT 文件导入
4. 复制粘贴文本解析
5. CSV 导入
6. 导入预览、冲突检查、合并与替换策略

### 阶段 4：今日计划页面

- 展示当天任务
- 按类别分组
- 显示任务状态和完成进度
- 支持快速编辑、完成、跳过和新增任务
- 正确关联真实数据

### 阶段 5：日历与日期管理

- 实现月历
- 实现日期切换
- 实现指定日期计划查看与编辑
- 实现过去日期补录和未来日期计划管理

### 阶段 6：每日记录

- 实现工作、学习、运动、创作和每日复盘表单
- 实现自动保存和保存状态提示
- 实现历史记录查看与编辑

### 阶段 7：每周复盘与月度统计

- 实现统计计算
- 实现周复盘和月度复盘
- 实现历史复盘查看与编辑

### 阶段 8：设置、备份与恢复

- 实现用户偏好设置
- 实现 JSON 备份与恢复
- 实现示例数据管理
- 实现清空数据前的确认机制

### 阶段 9：开源完善与最终验收

- 完善 README、MIT License、贡献指南
- 完善部署配置
- 执行测试和生产构建
- 修复已发现的问题
- 检查全流程

---

## 开发规范

### 代码规范

- 使用 TypeScript 严格模式
- 组件使用 Composition API + `<script setup>`
- Props 和 Emits 必须有明确类型
- 避免使用 `any` 类型
- 函数参数和返回值必须有类型注解

### 组件规范

- 组件职责单一明确
- 通用组件放在 `components/` 对应目录
- 页面级组件放在 `views/`
- 使用 PascalCase 命名组件文件

### 状态管理规范

- 使用 Pinia 管理全局状态
- 状态变更通过 actions 进行
- 异步操作放在 actions 中
- 计算属性使用 getters

### 数据库规范

- 使用 Dexie 操作 IndexedDB
- 所有数据库操作封装在 services 中
- 提供数据版本号和迁移机制
- 错误处理要完善

### 样式规范

- 使用 Tailwind CSS
- 统一的间距、圆角、字体、颜色
- 支持深色模式
- 响应式设计优先

---

## 测试与验收

### 测试范围

1. IndexedDB 数据保存与读取
2. 新增、修改、删除任务
3. 每日记录保存和恢复
4. JSON 导入与导出往返测试
5. Markdown、TXT、CSV 导入测试
6. 非法日期和无效数据校验
7. 重复任务识别与冲突处理
8. 导入失败时的数据完整性
9. 月度统计与周复盘统计
10. 日期跨月、跨年和闰年边界处理

### 验收标准

- `npm install` 能够安装依赖
- `npm run dev` 能够启动开发环境
- `npm run build` 能够完成生产构建
- `npm run test` 能够执行测试
- 关键页面没有明显的运行时错误
- 页面刷新后数据仍然存在
- 不同日期的记录不会互相覆盖
- JSON 备份可以恢复
- 文件导入、粘贴导入、手动创建三种方式均可实际使用
- 不配置后端也能完成全部核心工作流
- 手机和桌面浏览器均能正常使用
- 新用户可以通过示例数据快速理解使用方法

---

## 部署说明

### 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 运行测试
npm run test
```

### 静态部署

- 支持 GitHub Pages
- 支持 Vercel
- 支持任意静态网站托管服务
- 正确配置 SPA 路由回退，避免刷新子页面时出现 404

### 开源要求

- 不依赖私有 API、个人账号、专用服务器或外部数据库
- 不提交任何密钥、令牌或个人数据
- 提供完整的 README.md
- 提供 MIT License
- 提供 CONTRIBUTING.md
- 提供示例计划文件

---

## 隐私与安全

- 默认所有数据仅保存在用户本地浏览器
- 不添加不必要的遥测、追踪和第三方分析
- 不对用户输入的 Markdown 直接作为未经处理的 HTML 执行
- 对文件内容进行类型、大小和结构校验
- 所有删除操作必须有明确的用户操作和必要确认
- 自动保存失败时给出可见提示
- 对 IndexedDB 初始化失败、配额不足和数据损坏等情况提供错误提示
- 不得声称浏览器本地数据绝对不会丢失
- 不得在没有实现的情况下宣称支持云同步
