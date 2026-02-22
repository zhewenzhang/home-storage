import { useEffect, useState } from 'react';
import { LogOut, User, MapPin, Database, ChevronRight, Moon, Bell, HelpCircle, Shield, Edit3, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signOut } from '../services/auth';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Settings() {
    const { locations, items } = useStore();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [isSavingName, setIsSavingName] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            const u = data.user;
            if (!u) return;
            setUserId(u.id);
            setEmail(u.email || '');

            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('id', u.id)
                .single();

            setName(profile?.display_name || u.user_metadata?.display_name || u.email?.split('@')[0] || '');
        });
    }, []);

    const handleSaveName = async () => {
        if (!userId || !editNameValue.trim() || editNameValue.trim() === name) {
            setIsEditingName(false);
            return;
        }
        setIsSavingName(true);
        try {
            // Update auth metadata
            await supabase.auth.updateUser({ data: { display_name: editNameValue.trim() } });
            // Update profile table
            await supabase.from('profiles').update({ display_name: editNameValue.trim() }).eq('id', userId);
            setName(editNameValue.trim());
            setIsEditingName(false);
        } catch (err: any) {
            console.error('修改昵称失败:', err);
            alert('修改昵称失败');
        } finally {
            setIsSavingName(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-enter">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#2A4D63' }}>
                    系统设置
                </h1>
                <p className="text-sm text-gray-500 mt-1">管理您的账户属性及个性化配置</p>
            </div>

            {/* 账户卡片 */}
            <div className="card p-5 border border-blue-50/50" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f4f8fb 100%)' }}>
                <h2 className="text-xs font-bold text-blue-800/60 uppercase tracking-wider mb-4">账户信息</h2>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    type="text"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    disabled={isSavingName}
                                    className="flex-1 w-full px-2 py-1 text-sm border-b-2 border-blue-400 bg-transparent outline-none font-bold text-gray-900"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') setIsEditingName(false);
                                    }}
                                />
                                <button onClick={handleSaveName} disabled={isSavingName} className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsEditingName(false)} disabled={isSavingName} className="p-1 rounded text-gray-400 hover:bg-gray-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
                                <button
                                    onClick={() => { setEditNameValue(name); setIsEditingName(true); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-50 text-blue-400 transition-all"
                                    title="修改昵称"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-500">{email}</p>
                    </div>
                    <button onClick={signOut} className="btn-outline px-4 py-2 text-sm text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">安全退出</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 存储基建 */}
                <div className="card p-0 overflow-hidden border border-gray-100/50 shadow-sm">
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">系统定义与重组</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <Link to="/locations" className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">所有存储位置 / 房间</p>
                                    <p className="text-xs text-gray-400 mt-0.5">目前已设立 {locations.length} 个锚点</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                        </Link>

                        <Link to="/batch" className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">物品批量数据表与迁移</p>
                                    <p className="text-xs text-gray-400 mt-0.5">全量维护 {items.length} 个物品属性</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                        </Link>
                    </div>
                </div>

                {/* 偏好设置 */}
                <div className="card p-0 overflow-hidden border border-gray-100/50 shadow-sm">
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">交互与偏好</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group cursor-not-allowed opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">深色模式跟随</p>
                                    <p className="text-xs text-gray-400 mt-0.5">敬请期待新版本</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                                <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group cursor-not-allowed opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">保质期过期通知</p>
                                    <p className="text-xs text-gray-400 mt-0.5">即刻送达您的手机微信(即将上线)</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                                <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 关于本产品 */}
            <div className="card p-0 overflow-hidden border border-gray-100/50 shadow-sm mt-4">
                <div className="divide-y divide-gray-50">
                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" />家庭云端数据隐私协议</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2"><HelpCircle className="w-4 h-4 text-orange-400" />使用帮助与产品反馈</span>
                        <span className="text-xs text-gray-400">v1.2.0</span>
                    </div>
                </div>
            </div>

            {/* AI 占位 */}
            <div className="text-center pt-8 pb-10">
                <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">HomeBox Artificial Intelligence powered</p>
            </div>
        </div>
    );
}
