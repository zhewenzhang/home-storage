import fs from 'fs';

const buttonContent = `import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    selected?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', selected, children, ...props }, ref) => {
        const baseStyles = 'font-bold transition-all rounded-xl';
        const variantStyles: Record<string, string> = {
            primary: 'bg-primary dark:bg-blue-600 text-white hover:opacity-90 active:scale-95',
            secondary: 'border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
            ghost: 'hover:bg-gray-100 dark:hover:bg-slate-700',
            outline: 'border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-blue-400',
            danger: 'bg-red-500 text-white hover:bg-red-600',
        };
        const sizeStyles: Record<string, string> = {
            sm: 'py-2.5 px-3 text-xs',
            md: 'py-3 px-4 text-sm',
            lg: 'py-4 px-6 text-base',
        };
        const selectedStyle = selected ? 'bg-primary text-white border-primary' : '';

        return (
            <button
                ref={ref}
                className={\\\`\\\${baseStyles} \\\${variantStyles[variant]} \\\${sizeStyles[size]} \\\${selectedStyle} \\\${className}\\\`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
`;

const inputContent = `import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={\\\`px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm dark:text-gray-100 outline-none focus:border-primary dark:focus:border-blue-400 transition-all disabled:opacity-50 \\\${className}\\\`}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';
`;

const modalContent = `import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}
`;

const cardContent = `import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={\\\`rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm \\\${className}\\\`}>
            {children}
        </div>
    );
}
`;

const indexContent = `export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Card } from './Card';
`;

fs.writeFileSync('D:/home-storage/src/components/ui/Button.tsx', buttonContent, 'utf8');
fs.writeFileSync('D:/home-storage/src/components/ui/Input.tsx', inputContent, 'utf8');
fs.writeFileSync('D:/home-storage/src/components/ui/Modal.tsx', modalContent, 'utf8');
fs.writeFileSync('D:/home-storage/src/components/ui/Card.tsx', cardContent, 'utf8');
fs.writeFileSync('D:/home-storage/src/components/ui/index.ts', indexContent, 'utf8');

console.log('✅ All UI components updated');
