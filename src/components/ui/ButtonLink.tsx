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
