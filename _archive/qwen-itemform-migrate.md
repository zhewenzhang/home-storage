## 目标
修改 D:\home-storage\src\pages\ItemForm.tsx，将 swiss-btn、swiss-card、swiss-input 替换为 UI 组件。

## ⚠️ 严格限制
只修改 ItemForm.tsx 这一个文件。绝对不要修改任何其他文件。

## Import 修改
在文件顶部 import 区域（第 10 行之后）添加：
```
import { Button, Card, Input } from '../components/ui';
```

## 逐个替换（注意：所有 closing tag 行号都必须精确匹配！）

### 替换 1：物品名称卡片（第 171 行）
原代码：
```tsx
        <div className="swiss-card">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">物品名称 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="swiss-input w-full"
            placeholder="例如：笔记本电脑、冬季被子..."
            required
          />
        </div>
```
新代码：
```tsx
        <Card>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">物品名称 *</label>
          <Input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
            placeholder="例如：笔记本电脑、冬季被子..."
            required
          />
        </Card>
```
注意：第 181 行的 `</div>` 改为 `</Card>`。

### 替换 2：照片卡片（第 184 行）
原代码：
```tsx
        <div className="swiss-card">
```
新代码：
```tsx
        <Card>
```
找到第 244 行的 `</div>` 改为 `</Card>`。

### 替换 3：分类 & 数量卡片（第 247 行）
原代码：
```tsx
        <div className="swiss-card">
```
新代码：
```tsx
        <Card>
```
找到第 294 行的 `</div>` 改为 `</Card>`。

### 替换 4：存放位置卡片（第 297 行）
原代码：
```tsx
        <div className="swiss-card">
```
新代码：
```tsx
        <Card>
```
找到第 336 行的 `</div>` 改为 `</Card>`。

### 替换 5：保质期卡片（第 339 行）
原代码：
```tsx
        <div className="swiss-card">
```
新代码：
```tsx
        <Card>
```
找到第 378 行的 `</div>` 改为 `</Card>`。

### 替换 6：备注卡片（第 381 行）
原代码：
```tsx
        <div className="swiss-card">
```
新代码：
```tsx
        <Card>
```
找到第 389 行的 `</div>` 改为 `</Card>`。

### 替换 7：数量 input（第 277-283 行）
原代码：
```tsx
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="swiss-input text-center w-20"
                />
```
新代码：
```tsx
                <Input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="text-center w-20"
                />
```

### 替换 8：存放位置 select（第 311-315 行）
原代码：
```tsx
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="swiss-input w-full"
            >
```
新代码：
```tsx
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent"
            >
```

### 替换 9：保质期 input（第 344-349 行）
原代码：
```tsx
            <input
              type="date"
              value={form.expiryDate || ''}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="swiss-input w-full"
            />
```
新代码：
```tsx
            <Input
              type="date"
              value={form.expiryDate || ''}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full"
            />
```

### 替换 10：备注 textarea（第 383-388 行）
原代码：
```tsx
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="swiss-input w-full min-h-[120px] resize-none"
            placeholder="可选：添加备注信息，如购买日期、保修期等..."
          />
```
新代码：
```tsx
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent min-h-[120px] resize-none"
            placeholder="可选：添加备注信息，如购买日期、保修期等..."
          />
```

### 替换 11：提交按钮（第 392-395 行）
原代码：
```tsx
        <button type="submit" className="swiss-btn w-full py-4 text-lg">
          <Save className="w-5 h-5" />
          {isEdit ? '保存修改' : '添加物品'}
        </button>
```
新代码：
```tsx
        <Button type="submit" variant="primary" className="w-full py-4 text-lg">
          <Save className="w-5 h-5" />
          {isEdit ? '保存修改' : '添加物品'}
        </Button>
```
注意：第 395 行的 `</button>` 改为 `</Button>`。

## 注意事项
- 绝对不要修改任何非替换行的内容
- 每个 closing tag 的修改必须精确匹配指定的行号
- 不要修改其他 `.css` 文件或其他 `.tsx` 文件
