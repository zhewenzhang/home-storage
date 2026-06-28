## 目标
修改 D:\home-storage\src\pages\Settings.tsx，将 swiss-btn、swiss-btn-outline、swiss-card 替换为 UI 组件。

## ⚠️ 严格限制
只修改 Settings.tsx 这一个文件。绝对不要修改任何其他文件。

## Import 修改
在文件顶部 import 区域添加：
```
import { Button, Card } from '../components/ui';
```

## 逐个替换

### 替换 1：退出按钮（第 186 行）
原代码：
```tsx
                    <button onClick={signOut} className="swiss-btn-outline px-4 py-2 text-sm flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">安全退出</span>
                    </button>
```
新代码：
```tsx
                    <Button onClick={signOut} variant="outline" size="sm">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">安全退出</span>
                    </Button>
```

### 替换 2：账户卡片（第 144 行）
原代码：
```tsx
            <div className="swiss-card p-5 border-2 border-black dark:border-white transition-colors">
```
新代码：
```tsx
            <Card className="transition-colors">
```
找到对应的 `</div>`（第 190 行 `</div>`）改为 `</Card>`。

### 替换 3：存储基建卡片（第 194 行）
原代码：
```tsx
                <div className="swiss-card p-0 overflow-hidden border-2 border-black dark:border-white">
```
新代码：
```tsx
                <Card padding="none" className="overflow-hidden">
```
找到对应的 `</div>`（第 225 行 `</div>`）改为 `</Card>`。

### 替换 4：偏好设置卡片（第 228 行）
原代码：
```tsx
                <div className="swiss-card p-0 overflow-hidden border-2 border-black dark:border-white">
```
新代码：
```tsx
                <Card padding="none" className="overflow-hidden">
```
找到对应的 `</div>`（第 292 行 `</div>`）改为 `</Card>`。

### 替换 5：安全与保护卡片（第 296 行）
原代码：
```tsx
            <div className="swiss-card p-0 overflow-hidden border-2 border-black dark:border-white mt-4 swiss-enter" style={{ animationDelay: '0.1s' }}>
```
新代码：
```tsx
            <Card padding="none" className="overflow-hidden mt-4 swiss-enter" style={{ animationDelay: '0.1s' }}>
```
找到对应的 `</div>`（第 316 行 `</div>`）改为 `</Card>`。

### 替换 6：关于本产品卡片（第 319 行）
原代码：
```tsx
            <div className="swiss-card p-0 overflow-hidden border-2 border-black dark:border-white mt-4">
```
新代码：
```tsx
            <Card padding="none" className="overflow-hidden mt-4">
```
找到对应的 `</div>`（第 341 行 `</div>`）改为 `</Card>`。

### 替换 7：AI 体检卡片（第 344 行）
原代码：
```tsx
            <div id="ai-health-check" className="swiss-card p-0 overflow-hidden border-2 border-black dark:border-white mt-4">
                <div className="px-5 py-4 border-b-2 border-black dark:border-white">
```
新代码：
```tsx
            <Card id="ai-health-check" padding="none" className="overflow-hidden mt-4">
                <div className="px-5 py-4 border-b-2 border-black dark:border-white">
```
找到对应的 `</div>`（第 391 行 `</div>`）改为 `</Card>`。

### 替换 8：AI 扫描按钮（第 363-368 行）
原代码：
```tsx
                            <button
                                onClick={handleGenerateReport}
                                className="swiss-btn px-6 py-2.5"
                            >
                                <Sparkles className="w-4 h-4 inline-block mr-1.5" /> 开始深度解读
                            </button>
```
新代码：
```tsx
                            <Button
                                onClick={handleGenerateReport}
                                variant="primary"
                            >
                                <Sparkles className="w-4 h-4 inline-block mr-1.5" /> 开始深度解读
                            </Button>
```

## 注意事项
- 不要修改其他内容
- 注意 closing tag 的匹配：`</div>` → `</Card>`（仅限被改为 Card 的那些）
- `id="ai-health-check"` 要保留在 Card 上
