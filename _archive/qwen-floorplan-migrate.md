## 目标
修改 D:\home-storage\src\pages\FloorPlan.tsx，将 swiss-btn、swiss-card 替换为 UI 组件。

## ⚠️ 严格限制
只修改 FloorPlan.tsx 这一个文件。绝对不要修改任何其他文件。

## Import 修改
在文件顶部 import 区域（第 3 行之后）添加：
```
import { Button, Card } from '../components/ui';
```

## 逐个替换

### 替换 1：toolbar card（第 206 行）
原代码：
```tsx
      <div className="swiss-card relative z-20">
```
新代码：
```tsx
      <Card className="relative z-20" padding="sm">
```
找到对应的 `</div>`（第 281 行 `</div>`）改为 `</Card>`。

### 替换 2：编辑布局按钮（第 211 行）
原代码：
```tsx
              <button onClick={() => setIsEditMode(true)} className="swiss-btn">
```
新代码：
```tsx
              <Button onClick={() => setIsEditMode(true)} variant="primary" size="sm">
```
找到对应的 `</button>` 改为 `</Button>`。

### 替换 3：保存修改按钮（第 275 行）
原代码：
```tsx
              <button onClick={() => { setIsEditMode(false); setSelectedId(null); setSelectedLocationId(null); }} className="swiss-btn ml-auto">
```
新代码：
```tsx
              <Button onClick={() => { setIsEditMode(false); setSelectedId(null); setSelectedLocationId(null); }} variant="primary" size="sm" className="ml-auto">
```
找到对应的 `</button>` 改为 `</Button>`。

### 替换 4：画布卡片（第 283 行）
原代码：
```tsx
      <div className="swiss-card p-0 overflow-hidden relative group">
```
新代码：
```tsx
      <Card padding="none" className="overflow-hidden relative group">
```
找到对应的 `</div>`（第 381 行 `</div>`）改为 `</Card>`。

### 替换 5：选中位置详情卡片（第 395 行）
原代码：
```tsx
          <div className="swiss-card swiss-enter" style={{ borderLeft: '4px solid #FF3000' }}>
```
新代码：
```tsx
          <Card className="swiss-enter" style={{ borderLeft: '4px solid #FF3000' }}>
```
找到对应的 `</div>`（第 440 行 `</div>`）改为 `</Card>`。

## 注意事项
- 不要修改其他内容
- 注意 closing tag 的匹配
