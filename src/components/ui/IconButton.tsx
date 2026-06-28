import React from 'react';
import { cn } from '../../lib/utils';

const iconVariants = {
    default:
        'border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
    danger:
        'border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white',
    selected:
        'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white',
};

const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
};

interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof iconVariants;
    size?: keyof typeof iconSizes;
    icon: React.ReactNode;
    label?: string;
}

export default function IconButton({
    variant = 'default',
    size = 'md',
    icon,
    label,
    className,
    ...props
}: IconButtonProps) {
    return (
        <button
            className={cn(
                'border-2 flex items-center justify-center transition-colors flex-shrink-0',
                iconVariants[variant],
                iconSizes[size],
                className,
            )}
            title={label}
            aria-label={label}
            {...props}
        >
            {icon}
        </button>
    );
}
