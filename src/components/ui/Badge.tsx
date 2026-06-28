import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

const badgeVariants = {
    default:
        'border-black dark:border-white text-black dark:text-white',
    red: 'border-swiss-red text-swiss-red bg-swiss-red/5',
    yellow:
        'border-swiss-red text-swiss-red bg-swiss-red/5',
    gray: 'border-gray-400 text-gray-500 dark:text-gray-400',
    success:
        'border-swiss-red text-swiss-red bg-swiss-red/5',
};

const badgeSizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
};

interface BadgeProps {
    variant?: keyof typeof badgeVariants;
    size?: keyof typeof badgeSizes;
    children: ReactNode;
    className?: string;
}

export default function Badge({
    variant = 'default',
    size = 'md',
    children,
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                'border-2 font-bold uppercase inline-flex items-center',
                badgeVariants[variant],
                badgeSizes[size],
                className,
            )}
        >
            {children}
        </span>
    );
}
