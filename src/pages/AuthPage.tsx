import { useState } from 'react';
import { signIn, signUp } from '../services/auth';
import { Package, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../components/ui';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password, displayName);
            }
        } catch (err: any) {
            const msg = err.message || '操作失败';
            const code = err.code || '';
            
            if (msg.includes('invalid-credential') || code.includes('invalid-credential') || msg.includes('Invalid login')) {
                setError('邮箱或密码错误。如果您是首次访问新系统，请先切换到上方的「注册」选项卡创建您的私有云端空间。');
            } else if (msg.includes('email-already-in-use') || code.includes('email-already-in-use') || msg.includes('already registered')) {
                setError('该邮箱已注册，请直接登录');
                setIsLogin(true);
            } else if (msg.includes('weak-password') || code.includes('weak-password') || msg.includes('Password should be')) {
                setError('密码至少 6 位');
            } else if (msg.includes('invalid-email') || code.includes('invalid-email') || msg.includes('valid email')) {
                setError('请输入有效邮箱');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
            <div className="relative w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-2 border-white">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">HomeBox</h1>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">智能家居收纳管理</p>
                </div>

                {/* 卡片 */}
                <div className="bg-white dark:bg-black border-2 border-black dark:border-white">
                    {/* Tab 切换 */}
                    <div className="flex border-b-2 border-black dark:border-white">
                        <button onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-4 text-sm transition-all ${isLogin
                                ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black'
                                : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'}`}
                        >登录</button>
                        <button onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-4 text-sm transition-all ${!isLogin
                                ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black'
                                : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'}`}
                        >注册</button>
                    </div>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase">昵称</label>
                                <Input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                        placeholder="你的昵称"
                                        icon={<User className="w-4 h-4" />}
                                    />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase">邮箱</label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com" required
                                    icon={<Mail className="w-4 h-4" />}
                                />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase">密码</label>
                            <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder={isLogin ? '输入密码' : '至少 6 位'} required minLength={6}
                                    icon={<Lock className="w-4 h-4" />}
                                    rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    onRightIconClick={() => setShowPassword(!showPassword)}
                                />
                        </div>

                        {error && (
                            <div className="px-4 py-3 border-2 border-swiss-red bg-swiss-red/5 text-swiss-red font-bold text-xs">
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={loading} variant="primary" className="w-full">
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>{isLogin ? '登录' : '注册'}<ArrowRight className="w-4 h-4" /></>
                            )}
                        </Button>
                    </form>

                    {/* 底部提示 */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {isLogin ? '还没有账号？' : '已有账号？'}
                            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-black dark:text-white font-bold ml-1 hover:underline"
                            >{isLogin ? '立即注册' : '去登录'}</button>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 text-[10px] text-white/40 uppercase tracking-wider">
                    HomeBox · 让每件物品都有家可归
                </p>
            </div>
        </div >
    );
}
