import { cn } from '../../lib/utils';

const spinnerSizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
};

interface SpinnerProps {
    size?: keyof typeof spinnerSizes;
    className?: string;
}

export default function Spinner({
    size = 'md',
    className,
}: SpinnerProps) {
    return (
        <div
            className={cn(
                'border-black/30 dark:border-white/30 border-t-swiss-red rounded-full animate-spin',
                spinnerSizes[size],
                className,
            )}
        />
    );
}
