## 目标
修改 D:\home-storage\src\components\ui\Input.tsx，添加 rightIcon 和 onRightIconClick 支持。

## 为什么
AuthPage、Layout 等页面中的 input 带有右侧图标（如密码可见切换按钮、搜索清除按钮），需要 Input 组件原生支持。

## 修改内容

### 1. 修改 InputProps 接口

原代码（第 4-8 行）：
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}
```

新代码：
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}
```

### 2. 修改 Input 组件

原代码（第 11 行）：
```tsx
    ({ label, error, icon, className, ...props }, ref) => {
```

新代码：
```tsx
    ({ label, error, icon, rightIcon, onRightIconClick, className, ...props }, ref) => {
```

### 3. 添加 rightIcon 渲染块

在 `{icon && (...)}` 块之后、`<input .../>` 之前，添加 rightIcon 代码。具体位置在第 24 行（icon 的 span 关闭之后）。

原代码（第 19-37 行）：
```tsx
                <div className="relative">
                    {icon && (
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </span>
                    )}
                    <input
                        ...
                    />
                </div>
```

新代码：
```tsx
                <div className="relative">
                    {icon && (
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </span>
                    )}
                    {rightIcon && (
                        <span
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 ${onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}
                            onClick={onRightIconClick}
                        >
                            {rightIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full py-3 bg-transparent border-2 border-black dark:border-white text-black dark:text-white placeholder-gray-400 outline-none transition-all font-medium text-sm',
                            icon && 'pl-10',
                            !icon && 'px-4',
                            rightIcon && 'pr-10',
                            error
                                ? 'border-swiss-red'
                                : 'focus:border-swiss-red',
                            className,
                        )}
                        {...props}
                    />
                </div>
```

### 4. class 中的 pr-10 逻辑更新

确保 className 的 cn() 调用中包含 `rightIcon && 'pr-10'`（如上所示）。

## 注意事项
- 不修改任何现有功能
- rightIcon 默认无点击事件（pointer-events-none），但当 onRightIconClick 提供时变为 cursor-pointer
- 始终保持所有现有导出和行为不变
- 更新后的文件完整内容请参考以上片段拼接，保持原有 import 和 displayName 不变
