## 目标
修改 D:\home-storage\src\pages\Locations.tsx，将 swiss-btn、swiss-btn-outline、swiss-card、swiss-input 替换为 UI 组件。

## ⚠️ 严格限制
只修改 Locations.tsx 这一个文件。绝对不要修改任何其他文件。

## Import 修改
在文件顶部 import 区域（第 5 行之后）添加：
```
import { Button, Input, Card } from '../components/ui';
```

注意：Keep all existing imports.

## 逐个替换

### 替换 1：添加位置按钮（第 113-123 行）
原代码：
```tsx
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', type: 'room', parentId: '' });
          }}
          className="swiss-btn"
        >
          <Plus className="w-4 h-4" />
          添加位置
        </button>
```
新代码：
```tsx
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', type: 'room', parentId: '' });
          }}
          variant="primary" size="sm"
        >
          <Plus className="w-4 h-4" />
          添加位置
        </Button>
```

### 替换 2：名称 input（第 144-152 行）
原代码：
```tsx
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="swiss-input w-full"
                  placeholder="例如：主卧衣柜"
                  required
                  autoFocus
                />
```
新代码：
```tsx
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full"
                  placeholder="例如：主卧衣柜"
                  required
                  autoFocus
                />
```

### 替换 3：select 所属房间（第 181 行）
原代码：
```tsx
                    className="swiss-input w-full"
```
新代码（replacing `swiss-input` with Tailwind classes）：
```tsx
                    className="w-full px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent"
```

### 替换 4：提交按钮（第 192 行）
原代码：
```tsx
                <button type="submit" className="swiss-btn flex-1">
```
新代码：
```tsx
                <Button type="submit" variant="primary" className="flex-1">
```
找到对应的 `</button>` 改为 `</Button>`。

### 替换 5：取消按钮（第 195-201 行）
原代码：
```tsx
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="swiss-btn-outline"
                >
                  取消
                </button>
```
新代码：
```tsx
                <Button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  variant="outline"
                >
                  取消
                </Button>
```

### 替换 6：空状态卡片（第 210 行）
原代码：
```tsx
        <div className="swiss-card text-center py-16">
```
新代码：
```tsx
        <Card className="text-center py-16">
```
找到对应的 `</div>`（第 222 行）改为 `</Card>`。

### 替换 7：空状态按钮（第 216-221 行）
原代码：
```tsx
          <button
            onClick={() => setShowForm(true)}
            className="swiss-btn mx-auto"
          >
            <Plus className="w-4 h-4" /> 添加第一个位置
          </button>
```
新代码：
```tsx
          <Button
            onClick={() => setShowForm(true)}
            variant="primary" className="mx-auto"
          >
            <Plus className="w-4 h-4" /> 添加第一个位置
          </Button>
```

### 替换 8：房间卡片（第 231 行）
原代码：
```tsx
              <div key={room.id} className="swiss-card">
```
新代码：
```tsx
              <div key={room.id} className="border-2 border-black dark:border-white p-4 transition-colors">
```

### 替换 9：未归属房间卡片（第 311 行）
原代码：
```tsx
            <div className="swiss-card">
```
新代码：
```tsx
            <Card>
```
找到对应的 `</div>`（第 330 行）改为 `</Card>`。

## 注意事项
- 不要修改其他内容（逻辑、其他 className 等保持不变）
- 注意 closing tag 的匹配：`</button>` → `</Button>`，`</div>` → `</Card>`（仅限被改为 Card 的那些）
- 第 231 行的 swiss-card 改为 div with Tailwind classes，NOT Card（因为它内部有复杂结构）
