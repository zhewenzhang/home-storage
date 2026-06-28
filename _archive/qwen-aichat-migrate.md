## 目标
修改 D:\home-storage\src\components\AIChat.tsx，将 swiss-btn 和 swiss-input 替换为 React 组件。
保持所有逻辑不变。

## Import 修改
在文件顶部 import 区域，添加：
```
import { Button } from './ui';
import { Input } from './ui';
```

## 替换 1: swiss-btn → Button (第 556-559 行附近)

原代码：
```tsx
<button onClick={handleConfirm}
    className="flex-1 py-2.5 text-xs font-bold uppercase swiss-btn"
>✅ 确认执行</button>
```

新代码：
```tsx
<Button onClick={handleConfirm}
    variant="primary" size="sm" className="flex-1"
>✅ 确认执行</Button>
```

## 替换 2: swiss-input → Input (第 589-594 行附近)

原代码：
```tsx
<input ref={inputRef} type="text" value={input}
    onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
    placeholder="在书房加个置物柜，把网线放进去..."
    disabled={isLoading || !!pendingActions}
    className="flex-1 px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-sm dark:text-gray-100 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all disabled:opacity-50 swiss-input"
/>
```

新代码：
```tsx
<Input ref={inputRef} type="text" value={input}
    onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
    placeholder="在书房加个置物柜，把网线放进去..."
    disabled={isLoading || !!pendingActions}
    className="flex-1"
/>
```

## 注意事项
- 保持 ALL 其他逻辑不变，不要修改任何其他 JSX
- 不要修改其他 button（如 addNewAction 按钮、handleCancel 按钮、handleSend 按钮）
- Input 组件的 ref 传递使用了 forwardRef，所以 ref={inputRef} 可以直接工作
- 确认 Button、Input 只被导入一次
