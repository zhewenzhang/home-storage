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
                        className={`w-4 h-4 border-2 transition-all duration-200 ${pin.length > i
                            ? 'bg-black dark:bg-white border-black dark:border-white'
                            : 'border-gray-300 dark:border-gray-600 bg-transparent'
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
                        className="h-14 md:h-16 border-2 border-black dark:border-white bg-transparent text-2xl font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        aria-label={num.toString()}
                    >
                        {num}
                    </button>
                ))}
                <div /> {/* Empty slot for alignment */}
                <button
                    onClick={() => handleInput('0')}
                    className="h-14 md:h-16 border-2 border-black dark:border-white bg-transparent text-2xl font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    aria-label="0"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="h-14 md:h-16 border-2 border-black dark:border-white flex items-center justify-center bg-transparent text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    aria-label="刪除"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
