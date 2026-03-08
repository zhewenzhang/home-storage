import { useEffect, useState } from 'react';
import { LogOut, User, MapPin, Database, ChevronRight, Moon, Bell, HelpCircle, Shield, Edit3, Check, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signOut } from '../services/auth';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { generateHouseHealthReport } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import ThemeToggle from '../components/ThemeToggle';

export default function Settings() {
    const { locations, items, displayName } = useStore();
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState(displayName || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    // AI Report State
    const [reportLoading, setReportLoading] = useState(false);
    const [healthReport, setHealthReport] = useState<string | null>(null);

    // Privacy Modal State
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

    // 强制刷新更新版本
    const handleForceUpdate = () => {
        if (window.confirm('是否检查并更新到最新版本？应用将重新加载。')) {
            window.location.reload();
        }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const u = data.user;
            if (!u) return;
            setUserId(u.id);
            setEmail(u.email || '');
            if (!displayName) {
                setName(u.user_metadata?.display_name || u.email?.split('@')[0] || '');
            }
        });
    }, [displayName]);

    useEffect(() => {
        if (displayName) setName(displayName);
    }, [displayName]);

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

    const handleGenerateReport = async () => {
        setReportLoading(true);
        setHealthReport(null);
        try {
            const report = await generateHouseHealthReport(locations, items);
            setHealthReport(report);
        } catch (error) {
            console.error(error);
            setHealthReport('生成失败，请检查网络或配置...');
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-enter">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400">
                    系统设置
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">管理您的账户属性及个性化配置</p>
            </div>

            {/* 账户卡片 */}
            <div className="card p-5 border border-blue-50/50 dark:border-blue-900/30 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800/80 transition-colors">
                <h2 className="text-xs font-bold text-blue-800/60 dark:text-blue-400/80 uppercase tracking-wider mb-4">账户信息</h2>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-sm transition-colors">
                        <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    type="text"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    disabled={isSavingName}
                                    className="flex-1 w-full px-2 py-1 text-sm border-b-2 border-blue-400 bg-transparent outline-none font-bold text-gray-900 dark:text-gray-100"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') setIsEditingName(false);
                                    }}
                                />
                                <button onClick={handleSaveName} disabled={isSavingName} className="p-1 rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsEditingName(false)} disabled={isSavingName} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{name}</h3>
                                <button
                                    onClick={() => { setEditNameValue(name); setIsEditingName(true); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-400 transition-all"
                                    title="修改昵称"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                    </div>
                    <button onClick={signOut} className="btn-outline px-4 py-2 text-sm text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500/50 flex items-center gap-2 border rounded-xl transition-colors">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">安全退出</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 存储基建 */}
                <div className="card p-0 overflow-hidden border border-gray-100/50 dark:border-gray-800 shadow-sm">
                    <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">系统定义与重组</h2>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        <Link to="/locations" className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">所有存储位置 / 房间</p>
                                    <p className="text-xs text-gray-400 mt-0.5">目前已设立 {locations.length} 个锚点</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                        </Link>

                        <Link to="/batch" className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">物品批量数据表与迁移</p>
                                    <p className="text-xs text-gray-400 mt-0.5">全量维护 {items.length} 个物品属性</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                        </Link>
                    </div>
                </div>

                {/* 偏好设置 */}
                <div className="card p-0 overflow-hidden border border-gray-100/50 dark:border-gray-800 shadow-sm">
                    <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">交互与偏好</h2>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        <div className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 dark:text-purple-400">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">深色模式 / 主题</p>
                                    <p className="text-xs text-gray-400 mt-0.5">选择您喜欢的外观</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-not-allowed opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 dark:text-green-400">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">保质期过期通知</p>
                                    <p className="text-xs text-gray-400 mt-0.5">即刻送达您的手机微信(即将上线)</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                                <div className="absolute left-1 top-1 bg-white dark:bg-gray-400 w-3 h-3 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 关于本产品 */}
            <div className="card p-0 overflow-hidden border border-gray-100/50 dark:border-gray-800 shadow-sm mt-4">
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    <div
                        onClick={() => setShowPrivacyPolicy(true)}
                        className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                        <span className="text-sm font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" />家庭云端数据隐私协议</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-700 dark:text-gray-300">
                        <span className="text-sm font-bold flex items-center gap-2"><HelpCircle className="w-4 h-4 text-orange-400" />使用帮助与产品反馈</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">v2.1.0</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleForceUpdate(); }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                检查更新
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI 家庭大盘体检 */}
            <div id="ai-health-check" className="card p-0 overflow-hidden border border-emerald-100/50 dark:border-emerald-900/50 shadow-sm mt-4 relative bg-gradient-to-br from-emerald-50/30 to-teal-50/10 dark:from-emerald-900/10 dark:to-teal-900/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 dark:bg-emerald-400/10 rounded-full blur-3xl" />
                <div className="px-5 py-4 border-b border-emerald-100/50 dark:border-emerald-800/30 relative">
                    <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI 家庭资产大盘体检
                    </h2>
                </div>

                <div className="p-5 relative">
                    {!healthReport && !reportLoading ? (
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">一键扫描资产隐患</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                结合最新保质期追踪，AI管家将深度巡视您的 {items.length} 件物品，抓出烂账、提醒过期，并给出囤货建议。
                            </p>
                            <button
                                onClick={handleGenerateReport}
                                className="px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all active:scale-95"
                            >
                                <Sparkles className="w-4 h-4 inline-block mr-1.5" /> 开始深度解读
                            </button>
                        </div>
                    ) : reportLoading ? (
                        <div className="text-center py-10 space-y-4">
                            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                            <p className="text-sm font-bold text-emerald-700 animate-pulse">管家正在翻箱倒柜盘点...</p>
                        </div>
                    ) : (
                        <div className="animate-enter">
                            <div className="prose prose-sm md:prose-base prose-emerald dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                <ReactMarkdown>{healthReport || ''}</ReactMarkdown>
                            </div>
                            <div className="mt-8 pt-4 border-t border-emerald-100/50 dark:border-emerald-900/50 text-center">
                                <button
                                    onClick={handleGenerateReport}
                                    className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline"
                                >
                                    重新运行体检
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/*底部留白*/}
            {showPrivacyPolicy && (
                <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
            )}
        </div>
    );
}
