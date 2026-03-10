import { useEffect } from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
    pin: string;
    setPin: (val: string | ((prev: string) => string)) => void;
    maxLength?: number;
    error?: boolean;
}

export default function PinPad({ pin, setPin, maxLength = 4, error = false }: PinPadProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't capture keyboard events if the user is typing in another input or textarea
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA'
            ) {
                return;
            }

            if (/^[0-9]$/.test(e.key)) {
                setPin(prev => (prev.length < maxLength ? prev + e.key : prev));
            } else if (e.key === 'Backspace') {
                setPin(prev => prev.slice(0, -1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [maxLength, setPin]);

    const handleInput = (digit: string) => {
        setPin(prev => (prev.length < maxLength ? prev + digit : prev));
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="w-full max-w-[280px] mx-auto">
            {/* PIN Indicators */}
            <div className={`flex justify-center gap-4 mb-8 ${error ? 'animate-shake' : ''}`}>
                {[...Array(maxLength)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${pin.length > i
                            ? 'bg-primary dark:bg-blue-500 scale-125 shadow-md shadow-primary/30'
                            : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    />
                ))}
            </div>

            {/* Touch Visual Keypad */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleInput(num.toString())}
                        className="h-14 md:h-16 rounded-2xl bg-white dark:bg-slate-800 text-2xl font-bold text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95 active:shadow-inner"
                    >
                        {num}
                    </button>
                ))}
                <div /> {/* Empty slot for alignment */}
                <button
                    onClick={() => handleInput('0')}
                    className="h-14 md:h-16 rounded-2xl bg-white dark:bg-slate-800 text-2xl font-bold text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95 active:shadow-inner"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="h-14 md:h-16 rounded-2xl flex items-center justify-center bg-transparent text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-200 transition-all active:scale-95"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
