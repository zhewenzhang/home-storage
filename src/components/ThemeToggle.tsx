import { Moon, Sun, Monitor } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from './ui';

export default function ThemeToggle() {
    const { theme, setTheme } = useStore();

    const themes = [
        { id: 'light', icon: Sun, label: '日间' },
        { id: 'dark', icon: Moon, label: '夜间' },
        { id: 'system', icon: Monitor, label: '跟随系统' }
    ] as const;

    return (
        <div className="border-2 border-black dark:border-white bg-transparent flex mt-4">
            {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                    <Button
                        key={t.id}
                        variant="ghost"
                        selected={isActive}
                        size="sm"
                        onClick={() => setTheme(t.id)}
                        title={t.label}
                        className="flex-1"
                    >
                        <Icon className="w-4 h-4 mr-1.5 hidden md:block" />
                        <Icon className="w-5 h-5 md:hidden" />
                        <span className="hidden md:block">{t.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
