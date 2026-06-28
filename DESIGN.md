# HomeBox Swiss Design System

## 核心原则

| 原则 | 规则 |
|------|------|
| 直角 | 禁止使用 `rounded-*`、`border-radius`。唯一例外：Spinner loading 指示器 |
| 无阴影 | 禁止使用 `shadow-*`、`box-shadow` |
| 无渐变 | 禁止使用 `bg-gradient-*`、`linear-gradient`（背景装饰纹理除外） |
| 边框 | 一律使用 `border-2`，从不使用 `border`（1px）或 `border-4` |
| 颜色 | 仅使用黑、白、`#FF3000`（swiss-red）及灰色阶 |
| 字体 | Inter, 900/700/500, uppercase + `tracking-wider` |
| 动效 | 仅用 `transition-colors`，禁用 `scale`、`translate`、`rotate` 动画 |

## 颜色体系

```
黑   #000000  — 主要文字、背景、边框
白   #FFFFFF  — 背景、反色文字
红   #FF3000  — 强调色、危险操作、活跃状态  (Tailwind: swiss-red)
灰50 #F2F2F2  — 浅灰背景/hover
灰100 #999    — 次要文字、禁用状态
灰200 #666    — 辅助文字
```

Tailwind 使用：`black`、`white`、`swiss-red`、`gray-*`、`gray-*`

**禁止使用**：emerald、blue、orange、teal、violet 等非灰色调颜色。

## 排版

| 元素 | 样式 |
|------|------|
| 页面标题 | `text-2xl font-black uppercase tracking-wider` |
| 卡片标题 | `text-[10px] font-black uppercase tracking-wider text-gray-500` |
| 正文 | `text-sm font-medium` |
| 辅助文字 | `text-[10px] font-bold uppercase tracking-wide text-gray-500` |
| 数字/统计 | `text-7xl font-black text-swiss-red` |

## 间距

| Token | 值 | 用途 |
|-------|-----|------|
| 卡片内边距 | `p-5` (Card default) | 所有标准卡片 |
| 卡片无内边距 | `padding="none"` | 带 divide 的卡片 |
| 页面间距 | `space-y-6` | 子页面中卡片/区块之间 |
| 栅格间距 | `gap-4` 或 `gap-6` | grid 布局 |

## 页面布局规范

### 容器宽度

| 页面类型 | 宽度 | 说明 |
|----------|------|------|
| 仪表盘/首页 | `max-w-6xl` | Layout 提供，页面无需额外约束 |
| 内容管理页 | `max-w-4xl` | Items, Locations, Settings |
| 表单页 | `max-w-2xl` | ItemForm (单个表单) |
| 全宽操作页 | `max-w-6xl` | BatchManage, FloorPlan (继承 Layout) |
| 认证页 | `max-w-md` | AuthPage (居中卡片，独立布局) |

### 新增页面规则

所有页面必须位于 `<Layout>` 内部渲染，Layout 已提供 `max-w-6xl mx-auto` 容器。内容页不应额外添加 `mx-auto` 约束。

## 组件规范

### Button

```tsx
<Button variant="primary" size="sm">文字</Button>
```

| variant | 视觉效果 | 用途 |
|---------|----------|------|
| `primary` | 黑底白字 → hover 红底 | 主要操作 |
| `outline` | 透明黑边 → hover 红底 | 次要操作 |
| `danger` | 红边红字 → hover 红底白字 | 删除/危险 |
| `ghost` | 无边框 → hover 灰底 | 最小化操作 |

| size | 高度 | 用途 |
|------|------|------|
| `sm` | min-h-[36px] | 行内/小按钮 |
| `md` | min-h-[48px] | 标准按钮 |
| `lg` | min-h-[56px] | 全宽提交按钮 |

### ButtonLink

渲染为 `<Link>`（react-router-dom），视觉与 Button 相同。

```tsx
<ButtonLink to="/items/new" variant="primary" size="sm">
  <Plus className="w-4 h-4" /> 添加
</ButtonLink>
```

### Card

```tsx
<Card padding="none" className="overflow-hidden">
<Card>  {/* default padding="default" (p-5) */}
```

| padding | 值 |
|---------|-----|
| `none` | `p-0` |
| `sm` | `p-3` |
| `default` | `p-5` |

### Input

```tsx
<Input icon={<Search className="w-4 h-4" />} />
<Input rightIcon={<Eye className="w-4 h-4" />} onRightIconClick={fn} />
<Input label="邮箱" error="必填" />
```

支持所有标准 `<input>` 属性（type, value, onChange, placeholder, disabled 等）。

### Spinner

```tsx
<Spinner size="md" />
```

唯一允许使用 `rounded-full` 的组件（功能性必需）。

## 菜单导航规范

### 侧边栏 (Desktop)

```tsx
<NavLink
  to="/items"
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider
     text-gray-500 dark:text-gray-400 no-underline border-l-2 border-transparent
     transition-all hover:text-black dark:hover:text-white hover:border-l-black
     dark:hover:border-l-white hover:bg-gray-100 dark:hover:bg-gray-900
     ${isActive ? 'text-swiss-red border-l-swiss-red bg-swiss-red/5 dark:bg-swiss-red/15' : ''}`
  }
>
  <Icon className="w-5 h-5" />
  <span>标签</span>
</NavLink>
```

## Loading Screen (index.html)

```css
/* 黑底、白边方框、白色文字、swiss-red 进度条 */
body { background: #000000; }
.l-b { border: 3px solid #FFFFFF; }
.l-t { color: #FFFFFF; font-weight: 900; letter-spacing: 6px; text-transform: uppercase; }
.l-f { background: #FF3000; }
```

禁止使用：`border-radius`、`box-shadow`、`linear-gradient`、`rgba(255,255,255,0.x)` 颜色文字。

## 禁止清单 (DO NOT)

- ❌ `rounded-sm / rounded / rounded-lg / rounded-xl / rounded-2xl / rounded-full`
- ❌ `shadow-sm / shadow / shadow-lg / shadow-xl / shadow-2xl`
- ❌ `bg-gradient-to-r / bg-gradient-to-br`
- ❌ `backdrop-blur / backdrop-filter`
- ❌ 非 Swiss 颜色: `emerald / blue / green / orange / teal / violet` 及其变体
- ❌ `border` / `border-4 / border-[3px]`（只用 `border-2`）
- ❌ `scale-*` / `translate-*` / `rotate-*` transform 动画
- ❌ `gap-3` 以外的不规则间距（用 `gap-1.5` 等）

## 设计规范执行

1. 新增组件需从 `src/components/ui/` 中引用，禁止自行实现 UI 样式
2. 新增页面遵循页面布局规范中的宽度规则
3. 提交前运行 `grep -rn 'rounded\|shadow\|bg-gradient' src/` 检查违规
4. 若有非标准样式需求，先在 DESIGN.md 中补充规范后再实现
