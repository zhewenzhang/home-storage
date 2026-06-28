import React from 'react';
import { cn } from '../../lib/utils';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectGroup {
    label: string;
    options: SelectOption[];
}

interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    placeholder?: string;
    options?: SelectOption[];
    groups?: SelectGroup[];
}

export default function Select({
    label,
    error,
    placeholder,
    options,
    groups,
    className,
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                    {label}
                </label>
            )}
            <select
                className={cn(
                    'w-full px-4 py-3 bg-transparent border-2 border-black dark:border-white text-black dark:text-white outline-none font-medium text-sm focus:border-swiss-red appearance-none',
                    error && 'border-swiss-red',
                    className,
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
                {groups?.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                        {group.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-xs font-bold text-swiss-red">
                    {error}
                </p>
            )}
        </div>
    );
}
