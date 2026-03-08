import { Moon, Sun, Monitor } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ThemeToggle() {
    const { theme, setTheme } = useStore();

    const themes = [
        { id: 'light', icon: Sun, label: '日间' },
        { id: 'dark', icon: Moon, label: '夜间' },
        { id: 'system', icon: Monitor, label: '跟随系统' }
    ] as const;

    return (
        <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl shadow-inner mt-4 border border-transparent dark:border-slate-800">
            {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex-1 flex justify-center items-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${isActive
                            ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm border border-transparent dark:border-slate-700'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        title={t.label}
                    >
                        <Icon className="w-4 h-4 mr-1.5 hidden md:block" />
                        <Icon className="w-5 h-5 md:hidden" />
                        <span className="hidden md:block">{t.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
