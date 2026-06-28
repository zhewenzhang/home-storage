import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
    default: 'border-2 border-black dark:border-white',
    sectioned: 'border-2 border-black dark:border-white',
};

const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-5',
};

interface CardProps {
    variant?: keyof typeof variants;
    padding?: keyof typeof paddings;
    hover?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
}

export default function Card({
    variant = 'default',
    padding = 'default',
    hover = false,
    onClick,
    children,
    className,
    style,
    id,
}: CardProps) {
    return (
        <div
            id={id}
            onClick={onClick}
            style={style}
            className={cn(
                'bg-white dark:bg-black transition-colors',
                variants[variant],
                paddings[padding],
                hover && 'hover:border-swiss-red cursor-pointer',
                onClick && 'cursor-pointer',
                className,
            )}
        >
            {children}
        </div>
    );
}
