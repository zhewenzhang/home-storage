## 目标
在 D:\home-storage\src\components\ui 目录下创建新的 ButtonLink.tsx 文件，并在 index.ts 中导出它。

## 为什么
项目中的 swiss-btn 经常用在 <Link to="..."> 元素（react-router-dom）上，但 Button 组件渲染的是 <button>，无法直接使用。ButtonLink 组件渲染为 <Link>，但视觉上与 Button 完全一致。

## 需要创建的文件
文件路径: D:\home-storage\src\components\ui\ButtonLink.tsx

内容如下：
```tsx
import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../../lib/utils';

const variants = {
    primary:
        'bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white hover:bg-swiss-red hover:border-swiss-red dark:hover:bg-swiss-red dark:hover:border-swiss-red dark:hover:text-white active:scale-[0.97]',
    outline:
        'bg-transparent text-black dark:text-white border-2 border-black dark:border-white hover:bg-swiss-red hover:text-white hover:border-swiss-red dark:hover:bg-swiss-red dark:hover:border-swiss-red active:scale-[0.97]',
    danger:
        'bg-transparent text-swiss-red border-2 border-swiss-red hover:bg-swiss-red hover:text-white active:scale-[0.97]',
    ghost:
        'bg-transparent text-black dark:text-white border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-900',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-6 py-3 text-sm min-h-[48px]',
    lg: 'px-8 py-4 text-base min-h-[56px]',
    icon: 'w-10 h-10 p-0 min-h-0 flex items-center justify-center',
    'icon-sm': 'w-8 h-8 p-0 min-h-0 flex items-center justify-center',
};

interface ButtonLinkProps extends LinkProps {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    selected?: boolean;
    children: React.ReactNode;
}

export default function ButtonLink({
    variant = 'primary',
    size = 'md',
    selected = false,
    className,
    children,
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            className={cn(
                'font-bold uppercase tracking-wider transition-all select-none inline-flex items-center justify-center gap-2 no-underline',
                variants[variant],
                sizes[size],
                selected &&
                    'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
```

## 需要修改的文件
文件路径: D:\home-storage\src\components\ui\index.ts

在最后一行之前添加:
```
export { default as ButtonLink } from './ButtonLink';
```

最终文件内容应为：
```tsx
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
export { default as Badge } from './Badge';
export { default as Spinner } from './Spinner';
export { default as IconButton } from './IconButton';
export { default as ButtonLink } from './ButtonLink';
```

## 注意事项
- ButtonLink 与 Button 共享完全相同的视觉样式（variant、size、selected prop 完全一致）
- 唯一的区别是 ButtonLink 渲染 <Link> 而不是 <button>
- 使用 react-router-dom 的 Link 和 LinkProps 类型
- 添加 no-underline 类名到 className，因为 Link 默认有下划线
- 保持所有其他逻辑不变
