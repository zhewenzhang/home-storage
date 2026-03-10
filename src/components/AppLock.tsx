import { useEffect, useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { signOut } from '../services/auth';
import PinPad from './PinPad';

export default function AppLock() {
    const { appPin, unlockApp } = useStore();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === appPin) {
                unlockApp();
            } else {
                setError(true);
                setTimeout(() => {
                    setPin('');
                    setError(false);
                }, 500);
            }
        }
    }, [pin, appPin, unlockApp]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl transition-all">
            <div className="flex flex-col items-center max-w-sm w-full px-6 animate-enter">
                <div className="w-16 h-16 bg-primary dark:bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6 mt-10">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">应用已锁定</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">
                    请输入 4 位防窥解锁密码<br />
                    <span className="text-xs opacity-70">(PC 端可直接使用物理键盘输入)</span>
                </p>

                <PinPad pin={pin} setPin={setPin} error={error} maxLength={4} />

                <div className="mt-12 text-center">
                    <button
                        onClick={() => signOut()}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="w-4 h-4" /> 忘记密码 (强制注销账号)
                    </button>
                </div>
            </div>
        </div>
    );
}
