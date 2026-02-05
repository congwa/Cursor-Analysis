# Cursor Analysis 设计系统

> macOS 开发者工具 - Cursor IDE 使用分析工具
> 
> 基于 ui-ux-pro-max 技能生成的完整设计系统

---

## 1. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.8 | 类型安全 |
| Vite | 7 | 构建工具 |
| Tailwind CSS | 3.4 | 样式系统 |
| shadcn/ui | latest | 组件库 |
| Zustand | 5 | 状态管理 |
| Recharts | 3 | 图表库 |
| Lucide React | latest | 图标库 |
| Tauri | 2 | 桌面应用框架 |

---

## 2. 设计原则

### 2.1 核心理念

- **开发者优先**: 界面简洁高效，信息密度适中
- **暗色主题**: GitHub Dark 风格，降低眼睛疲劳
- **数据可视化**: 清晰展示统计数据和趋势
- **一致性**: 统一的组件和交互模式

### 2.2 设计规范

| 规范 | 说明 |
|------|------|
| **性能** | ⚡ 优秀 - 使用虚拟化列表、懒加载 |
| **可访问性** | ✓ WCAG AA - 对比度 4.5:1+ |
| **响应式** | 支持 768px、1024px、1280px |

### 2.3 反模式 (避免)

- ❌ 扁平设计缺乏层次感
- ❌ 文字过多的页面
- ❌ 使用 emoji 作为图标 (使用 Lucide SVG)
- ❌ 没有 hover 状态的可点击元素

---

## 3. 主题设计

### 3.1 调色板

采用 **GitHub Dark / OLED Dark Mode** 风格：

```css
:root {
  /* 背景色 */
  --background: #0d1117;      /* 页面背景 */
  --card: #161b22;            /* 卡片背景 */
  --secondary: #21262d;       /* 次级背景 */
  --popover: #161b22;         /* 弹出层背景 */
  
  /* 文字色 */
  --foreground: #c9d1d9;      /* 主要文字 */
  --muted-foreground: #8b949e; /* 次要文字 */
  
  /* 边框 */
  --border: #30363d;          /* 边框颜色 */
  
  /* 主题色 */
  --primary: #2f81f7;         /* 主色调 - GitHub Blue */
  --ring: #2f81f7;            /* 焦点环 */
}
```

### 3.2 功能色

| 用途 | 颜色 | Hex | 使用场景 |
|------|------|-----|----------|
| 成功/新增 | 绿色 | `#3fb950` | 代码新增、成功状态 |
| 危险/删除 | 红色 | `#f85149` | 代码删除、危险操作 |
| 警告 | 橙色 | `#f0883e` | 警告信息 |
| 信息 | 青色 | `#58a6ff` | 信息提示 |
| Agent 模式 | 紫色 | `#a371f7` | Agent 模式标识 |

### 3.3 图表颜色

```typescript
const CHART_COLORS = [
  '#2f81f7', // 蓝色 - 主要数据
  '#3fb950', // 绿色 - 正向数据
  '#f0883e', // 橙色 - 次要数据
  '#f85149', // 红色 - 负向数据
  '#a371f7', // 紫色 - Agent 相关
  '#8b949e', // 灰色 - 中性数据
]
```

---

## 4. 字体系统

### 4.1 推荐字体

基于 ui-ux-pro-max 推荐的 **Dashboard Data** 字体配对：

| 用途 | 字体 | 备选 |
|------|------|------|
| 代码/数据 | Fira Code | JetBrains Mono |
| UI 文字 | Fira Sans | Inter |
| 系统 | -apple-system | BlinkMacSystemFont |

### 4.2 CSS 导入

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

### 4.3 Tailwind 配置

```javascript
fontFamily: {
  mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
  sans: ['Fira Sans', 'Inter', '-apple-system', 'sans-serif'],
}
```

### 4.4 字号规范

| 用途 | 类名 | 大小 |
|------|------|------|
| 页面标题 | `text-2xl` | 24px |
| 区块标题 | `text-lg` | 18px |
| 卡片标题 | `text-base` | 16px |
| 正文 | `text-sm` | 14px |
| 辅助文字 | `text-xs` | 12px |
| 统计数字 | `text-xl` / `text-2xl` | 20px / 24px |

---

## 5. 间距规范

### 5.1 Tailwind 间距

| 用途 | 类名 | 像素 |
|------|------|------|
| 紧凑间距 | `gap-2` | 8px |
| 默认间距 | `gap-4` | 16px |
| 宽松间距 | `gap-6` | 24px |
| 卡片内边距 | `p-4` | 16px |
| 大区块内边距 | `p-6` | 24px |
| 页面边距 | `px-6 py-5` | 24px / 20px |

### 5.2 圆角规范

| 用途 | 类名 | 大小 |
|------|------|------|
| 小按钮/徽章 | `rounded-sm` | 2px |
| 默认圆角 | `rounded-md` | 6px |
| 卡片圆角 | `rounded-lg` | 8px |
| 弹窗圆角 | `rounded-xl` | 12px |

---

## 6. 组件库

### 6.1 shadcn/ui 组件

已安装的组件：

| 组件 | 文件 | 用途 |
|------|------|------|
| Button | `button.tsx` | 按钮 |
| Card | `card.tsx` | 卡片容器 |
| Dialog | `dialog.tsx` | 对话框 |
| AlertDialog | `alert-dialog.tsx` | 确认对话框 |
| Tabs | `tabs.tsx` | 标签页 |
| Table | `table.tsx` | 数据表格 |
| Badge | `badge.tsx` | 徽章标签 |
| Input | `input.tsx` | 输入框 |
| Checkbox | `checkbox.tsx` | 复选框 |
| Tooltip | `tooltip.tsx` | 提示框 |
| DropdownMenu | `dropdown-menu.tsx` | 下拉菜单 |
| ScrollArea | `scroll-area.tsx` | 滚动区域 |
| Separator | `separator.tsx` | 分隔线 |

### 6.2 Button 变体

```tsx
<Button variant="default">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="destructive">危险按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="link">链接按钮</Button>
```

### 6.3 Badge 变体

```tsx
// 模式徽章
<Badge variant="default">Agent</Badge>
<Badge variant="secondary">Chat</Badge>

// 统计徽章
<Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
  +1,234
</Badge>
<Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
  -567
</Badge>
<Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
  89 文件
</Badge>
```

---

## 7. 自定义组件

### 7.1 StatCard - 统计卡片

```tsx
import { StatCard } from '@/components/shared/StatCard'
import { FolderOpen } from 'lucide-react'

<StatCard
  icon={FolderOpen}
  title="项目数量"
  value={42}
  subtitle="个项目"
  color="#2f81f7"
/>
```

### 7.2 Pagination - 分页

```tsx
import { Pagination } from '@/components/shared/Pagination'

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
/>
```

### 7.3 ConfirmDialog - 确认对话框

```tsx
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

<ConfirmDialog
  open={showDialog}
  title="删除确认"
  message="确定要删除吗？此操作不可恢复。"
  onConfirm={() => handleDelete()}
  onCancel={() => setShowDialog(false)}
/>
```

---

## 8. 图表设计

### 8.1 推荐图表类型

| 数据类型 | 推荐图表 | 库 |
|----------|----------|-----|
| 分类对比 | Bar Chart | Recharts |
| 占比分布 | Pie Chart | Recharts |
| 时间趋势 | Line/Area Chart | Recharts |
| 代码变更 | 堆叠条形图 | Recharts |

### 8.2 图表样式配置

```tsx
// Tooltip 样式
contentStyle={{
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
}}

// 坐标轴样式
stroke="hsl(var(--muted-foreground))"

// 网格线样式
<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
```

### 8.3 图表颜色应用

```tsx
// 代码变更图表
<Bar dataKey="added" fill="#3fb950" name="添加行数" />
<Bar dataKey="removed" fill="#f85149" name="删除行数" />

// 饼图
const COLORS = ['#2f81f7', '#3fb950', '#f0883e', '#f85149', '#a371f7']
```

---

## 9. 状态管理

### 9.1 Zustand Store 结构

```typescript
// src/stores/appStore.ts
interface AppState {
  // 数据
  data: AnalysisResult | null
  trashItems: TrashItem[]
  appVersion: string
  
  // 状态
  loading: boolean
  deleting: boolean
  error: string | null
  
  // UI
  activeTab: TabType
  selectedChat: { chat: ChatSession; projectName: string } | null
  
  // Actions
  setData: (data: AnalysisResult | null) => void
  setActiveTab: (tab: TabType) => void
  // ...
}
```

### 9.2 使用方式

```tsx
import { useAppStore } from '@/stores/appStore'

function Component() {
  const { data, loading, setActiveTab } = useAppStore()
  
  // 使用状态和 actions
}
```

---

## 10. 目录结构

```
src/
├── App.tsx                    # 主应用组件
├── main.tsx                   # 入口文件
├── index.css                  # Tailwind + 主题变量
├── components/
│   ├── ui/                    # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── chat/                  # 会话相关组件
│   │   ├── UnifiedChatList.tsx
│   │   ├── ProjectRow.tsx
│   │   └── WorkspaceRow.tsx
│   ├── tabs/                  # Tab 页面组件
│   │   ├── OverviewTab.tsx
│   │   ├── StorageTab.tsx
│   │   ├── ProjectsTab.tsx
│   │   ├── WorkspacesTab.tsx
│   │   ├── DatabaseTab.tsx
│   │   └── TrashTab.tsx
│   ├── dialogs/               # 弹窗组件
│   │   └── ChatDetailModal.tsx
│   └── shared/                # 共享组件
│       ├── StatCard.tsx
│       ├── Pagination.tsx
│       └── ConfirmDialog.tsx
├── stores/
│   └── appStore.ts            # Zustand 状态管理
├── lib/
│   ├── utils.ts               # shadcn 工具函数
│   └── format.ts              # 格式化工具
└── design-system/
    └── README.md              # 本文档
```

---

## 11. 响应式设计

### 11.1 断点

| 断点 | 宽度 | 场景 |
|------|------|------|
| `sm` | 640px | 小屏幕 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 笔记本 |
| `xl` | 1280px | 桌面 |

### 11.2 网格布局

```tsx
// 统计卡片网格
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

// 会话卡片网格
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
```

---

## 12. 交互规范

### 12.1 过渡动画

```css
/* 默认过渡 */
transition-all duration-150

/* 悬停过渡 */
transition-colors duration-200

/* 变换过渡 */
transition-transform duration-200
```

### 12.2 悬停状态

```tsx
// 卡片悬停
className="hover:border-primary hover:-translate-y-0.5 hover:shadow-lg"

// 按钮悬停
className="hover:bg-primary/90"

// 危险按钮悬停
className="hover:bg-destructive/20 hover:text-destructive"
```

### 12.3 焦点状态

```tsx
// 输入框焦点
className="focus:ring-2 focus:ring-primary focus:border-primary"

// 按钮焦点
className="focus-visible:ring-2 focus-visible:ring-ring"
```

---

## 13. 可访问性清单

- [ ] 所有可点击元素使用 `cursor-pointer`
- [ ] hover 状态使用平滑过渡 (150-300ms)
- [ ] 文字对比度 4.5:1 以上
- [ ] 焦点状态可见 (keyboard nav)
- [ ] 尊重 `prefers-reduced-motion`
- [ ] 响应式支持 375px / 768px / 1024px / 1440px
- [ ] 图标使用 SVG (Lucide)，不使用 emoji

---

## 14. 添加新组件

### 14.1 添加 shadcn 组件

```bash
pnpm dlx shadcn@latest add [组件名]
```

### 14.2 可用组件列表

```bash
pnpm dlx shadcn@latest add accordion
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add command
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add slider
pnpm dlx shadcn@latest add switch
pnpm dlx shadcn@latest add toast
```

---

## 15. 版本发布

```bash
# 增加补丁版本并打包
pnpm run release

# 手动版本控制
pnpm run bump:patch  # 1.0.2 -> 1.0.3
pnpm run bump:minor  # 1.0.2 -> 1.1.0
pnpm run bump:major  # 1.0.2 -> 2.0.0
```

---

*Generated with ui-ux-pro-max skill*
