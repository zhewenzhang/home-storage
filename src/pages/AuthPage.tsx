import { useState } from 'react';
import { signIn, signUp } from '../services/auth';
import { supabase } from '../lib/supabase';
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
                // 登录
                await signIn(email, password);
                // signIn 成功后 App.tsx 的 onAuthStateChange 会自动跳转
            } else {
                // 注册 → 注册完立即登录
                const { session } = await signUp(email, password, displayName);

                if (session) {
                    // signUp 自动创建了 session（邮箱验证关闭时），已登录
                    // 更新 profiles 表的 display_name（确保触发器没有漏掉）
                    if (displayName) {
                        await supabase.from('profiles').update({ display_name: displayName }).eq('id', session.user.id);
                    }
                } else {
                    // 邮箱验证开启时，signUp 不创建 session，需要手动登录
                    await signIn(email, password);
                }
            }
        } catch (err: any) {
            const msg = err.message || '操作失败';
            if (msg.includes('Invalid login')) {
                setError('邮箱或密码错误');
            } else if (msg.includes('already registered') || msg.includes('already been registered')) {
                // 已注册 → 自动帮用户切到登录 tab
                setError('该邮箱已注册，请直接登录');
                setIsLogin(true);
            } else if (msg.includes('Password should be')) {
                setError('密码至少 6 位');
            } else if (msg.includes('valid email')) {
                setError('请输入有效邮箱');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a2a3a 0%, #2A4D63 40%, #3B6D8C 100%)' }}
        >
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #5BA3C9 0%, transparent 70%)' }} />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #8ECAE6 0%, transparent 70%)' }} />
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full" />
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/15 rounded-full" />
                <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white/10 rounded-full" />
            </div>

            <div className="relative w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">HomeBox</h1>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>智能家居收纳管理</p>
                </div>

                {/* 卡片 */}
                <div className="rounded-3xl overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Tab 切换 */}
                    <div className="flex">
                        <button onClick={() => { setIsLogin(true); setError(''); }}
                            className="flex-1 py-4 text-sm font-bold transition-all"
                            style={{
                                color: isLogin ? '#2A4D63' : '#999',
                                borderBottom: isLogin ? '3px solid #3B6D8C' : '3px solid transparent',
                                background: isLogin ? 'rgba(59,109,140,0.05)' : 'transparent',
                            }}
                        >登录</button>
                        <button onClick={() => { setIsLogin(false); setError(''); }}
                            className="flex-1 py-4 text-sm font-bold transition-all"
                            style={{
                                color: !isLogin ? '#2A4D63' : '#999',
                                borderBottom: !isLogin ? '3px solid #3B6D8C' : '3px solid transparent',
                                background: !isLogin ? 'rgba(59,109,140,0.05)' : 'transparent',
                            }}
                        >注册</button>
                    </div>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">昵称</label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                        placeholder="你的昵称"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#3B6D8C] focus:ring-2 focus:ring-[#3B6D8C]/10 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">邮箱</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com" required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#3B6D8C] focus:ring-2 focus:ring-[#3B6D8C]/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">密码</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder={isLogin ? '输入密码' : '至少 6 位'} required minLength={6}
                                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#3B6D8C] focus:ring-2 focus:ring-[#3B6D8C]/10 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl text-xs font-bold text-red-600"
                                style={{ backgroundColor: '#FEE2E2' }}
                            >{error}</div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #3B6D8C 0%, #2A4D63 100%)', boxShadow: '0 4px 15px rgba(59,109,140,0.3)' }}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>{isLogin ? '登录' : '注册'}<ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {/* 底部提示 */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-xs text-gray-400">
                            {isLogin ? '还没有账号？' : '已有账号？'}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-[#3B6D8C] font-bold ml-1 hover:underline"
                            >{isLogin ? '立即注册' : '去登录'}</button>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    HomeBox · 让每件物品都有家可归
                </p>
            </div>
        </div>
    );
}
