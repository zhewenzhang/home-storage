import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, rightIcon, onRightIconClick, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                        {label}
                    </label>
                )}
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
                {error && (
                    <p className="mt-1 text-xs font-bold text-swiss-red">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
export default Input;
