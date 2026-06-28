import { useEffect, useState } from 'react';
import { LogOut, User, MapPin, Database, ChevronRight, Moon, Bell, HelpCircle, Shield, Edit3, Check, X, Sparkles, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { decodePin } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { signOut, getUser } from '../services/auth';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { generateHouseHealthReport } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import ThemeToggle from '../components/ThemeToggle';
import PinPad from '../components/PinPad';
import { Button, Card } from '../components/ui';

export default function Settings() {
    const { locations, items, displayName, themeColor, setThemeColor, appPin, setAppPin, loadFromSupabase } = useStore();
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState(displayName || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    
    // 数据迁移状态
    const [backupCheck, setBackupCheck] = useState<{ hasBackup: boolean; data: any } | null>(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetch('/supabase_data.json')
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && (data.locations || data.items)) {
                    setBackupCheck({ hasBackup: true, data });
                }
            })
            .catch(() => {
                // 静默忽略错误
            });
    }, []);

    const handleImportLocalBackup = async () => {
        if (!userId || !backupCheck?.data) return;
        setImporting(true);
        try {
            const { locations: locs, items: itms, floor_plans: fps, family_invites: invites } = backupCheck.data;
            
            // 1. 同步 locations
            if (locs && locs.length > 0) {
                const batch = writeBatch(db);
                locs.forEach((loc: any) => {
                    const docRef = doc(db, 'locations', loc.id);
                    batch.set(docRef, {
                        user_id: userId,
                        name: loc.name,
                        type: loc.type,
                        parent_id: loc.parent_id || null,
                        room_type: loc.room_type || null,
                        bounds: loc.bounds || null,
                        created_at: loc.created_at ? new Date(loc.created_at).getTime() : Date.now()
                    });
                });
                await batch.commit();
            }

            // 2. 同步 items
            if (itms && itms.length > 0) {
                const batchSize = 400;
                for (let i = 0; i < itms.length; i += batchSize) {
                    const batch = writeBatch(db);
                    const chunk = itms.slice(i, i + batchSize);
                    chunk.forEach((item: any) => {
                        const docRef = doc(db, 'items', item.id);
                        batch.set(docRef, {
                            user_id: userId,
                            name: item.name,
                            category: item.category,
                            quantity: item.quantity,
                            description: item.description || '',
                            location_id: item.location_id || null,
                            expiry_date: item.expiry_date || null,
                            image_url: item.image_url || null,
                            created_at: item.created_at ? new Date(item.created_at).getTime() : Date.now()
                        });
                    });
                    await batch.commit();
                }
            }

            // 3. 同步 floor_plans
            if (fps && fps.length > 0) {
                const batch = writeBatch(db);
                fps.forEach((fp: any) => {
                    const docRef = doc(db, 'floor_plans', fp.id);
                    batch.set(docRef, {
                        user_id: userId,
                        name: fp.name,
                        width: fp.width,
                        height: fp.height,
                        updated_at: fp.updated_at ? new Date(fp.updated_at).getTime() : Date.now()
                    });
                });
                await batch.commit();
            }

            // 4. 同步邀请码
            if (invites && invites.length > 0) {
                const batch = writeBatch(db);
                invites.forEach((invite: any) => {
                    const code = invite.code;
                    if (code) {
                        const docRef = doc(db, 'family_invites', code);
                        batch.set(docRef, {
                            owner_id: userId,
                            created_at: invite.created_at ? new Date(invite.created_at).getTime() : Date.now()
                        });
                    }
                });
                await batch.commit();
            }

            alert('🎉 导入成功！数据已全部同步至 Firebase。');
            await loadFromSupabase(userId);
            setBackupCheck(null);
        } catch (err: any) {
            console.error(err);
            alert('导入失败: ' + err.message);
        } finally {
            setImporting(false);
        }
    };

    // App Lock State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinSetupStep, setPinSetupStep] = useState<'verify' | 'new' | 'confirm'>('verify');
    const [tempPin, setTempPin] = useState('');
    const [enteredPin, setEnteredPin] = useState('');
    const [pinError, setPinError] = useState(false);

    useEffect(() => {
        if (showPinModal) {
            setEnteredPin('');
            setTempPin('');
            setPinError(false);
            setPinSetupStep(appPin ? 'verify' : 'new');
        }
    }, [showPinModal, appPin]);

    useEffect(() => {
        if (enteredPin.length === 4) {
            if (pinSetupStep === 'verify') {
                if (enteredPin === decodePin(appPin)) {
                    setAppPin(null);
                    setShowPinModal(false);
                } else {
                    setPinError(true);
                    setTimeout(() => { setEnteredPin(''); setPinError(false); }, 500);
                }
            } else if (pinSetupStep === 'new') {
                setTempPin(enteredPin);
                setPinSetupStep('confirm');
                setEnteredPin('');
            } else if (pinSetupStep === 'confirm') {
                if (enteredPin === tempPin) {
                    setAppPin(enteredPin);
                    setShowPinModal(false);
                } else {
                    setPinError(true);
                    setTimeout(() => {
                        setPinSetupStep('new');
                        setTempPin('');
                        setEnteredPin('');
                        setPinError(false);
                    }, 500);
                }
            }
        }
    }, [enteredPin, pinSetupStep, appPin, tempPin, setAppPin]);

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
        getUser().then((u) => {
            if (!u) return;
            setUserId(u.uid);
            setEmail(u.email || '');
            if (!displayName) {
                setName(u.displayName || u.email?.split('@')[0] || '');
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
            const u = auth.currentUser;
            if (u) {
                await updateProfile(u, { displayName: editNameValue.trim() });
            }
            // Update profile collection
            await updateDoc(doc(db, 'profiles', userId), { display_name: editNameValue.trim() });
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
        <div className="max-w-4xl mx-auto space-y-6 pb-20 swiss-enter">
            <div className="mb-8">
                <h1 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
                    系统设置
                </h1>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">管理您的账户属性及个性化配置</p>
            </div>

            {/* 账户卡片 */}
            <Card className="transition-colors">
                <h2 className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">账户信息</h2>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-black dark:border-white">
                        <User className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    type="text"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    disabled={isSavingName}
                                    className="flex-1 w-full px-2 py-1 text-sm border-b-2 border-black bg-transparent outline-none font-bold text-gray-900 dark:text-gray-100"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') setIsEditingName(false);
                                    }}
                                />
                                <button onClick={handleSaveName} disabled={isSavingName} className="p-1 text-swiss-red hover:bg-swiss-red/10 transition-colors">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsEditingName(false)} disabled={isSavingName} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{name}</h3>
                                <button
                                    onClick={() => { setEditNameValue(name); setIsEditingName(true); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-all"
                                    title="修改昵称"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                    </div>
                    <Button onClick={signOut} variant="outline" size="sm">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">安全退出</span>
                    </Button>
                </div>
            </Card>

            {/* 检测本地备份并提示同步导入 */}
            {backupCheck?.hasBackup && (
                <Card className="border-2 border-amber-500 bg-amber-500/10 dark:bg-amber-950/10 swiss-enter">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center border-2 border-black dark:border-white flex-shrink-0">
                            <Database className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">检测到本地 Supabase 备份数据</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                系统在前端公共资源目录中扫描到了 `supabase_data.json` 备份包，其中包含 **{backupCheck.data.locations?.length || 0} 个空间位置** 和 **{backupCheck.data.items?.length || 0} 件物品**。点击按钮即可安全地一键同步写入当前的 Firebase 数据库。
                            </p>
                            <div className="mt-3 flex gap-2">
                                <Button 
                                    onClick={handleImportLocalBackup} 
                                    disabled={importing}
                                    variant="outline" 
                                    size="sm" 
                                    className="border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white"
                                >
                                    {importing ? '正在同步写入...' : '一键同步到 Firebase'}
                                </Button>
                                <Button
                                    onClick={() => setBackupCheck(null)}
                                    disabled={importing}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 dark:border-gray-700 text-gray-500"
                                >
                                    暂不处理
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 存储基建 */}
                <Card padding="none" className="overflow-hidden">
                    <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800 border-b-2 border-black dark:border-white">
                        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">系统定义与重组</h2>
                    </div>
                    <div className="divide-y-2 divide-black dark:divide-white">
                        <Link to="/locations" className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-white group-hover:scale-110 transition-transform border-2 border-black dark:border-white">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">所有存储位置 / 房间</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">目前已设立 {locations.length} 个锚点</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                        </Link>

                        <Link to="/batch" className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-white group-hover:scale-110 transition-transform border-2 border-black dark:border-white">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">物品批量数据表与迁移</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">全量维护 {items.length} 个物品属性</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                        </Link>
                    </div>
                </Card>

                {/* 偏好设置 */}
                <Card padding="none" className="overflow-hidden">
                    <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800 border-b-2 border-black dark:border-white">
                        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">交互与偏好</h2>
                    </div>
                    <div className="divide-y-2 divide-black dark:divide-white">
                        <div className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-white border-2 border-black dark:border-white">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">深色模式 / 主题</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">选择您喜欢的外观</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        <div className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-white border-2 border-black dark:border-white">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">主题强调色</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">选择您喜欢的品牌色调</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Color Swatches */}
                                {[
                                    { id: 'blue', color: '#3B6D8C' },
                                    { id: 'emerald', color: '#10B981' },
                                    { id: 'violet', color: '#8B5CF6' },
                                    { id: 'rose', color: '#F43F5E' },
                                    { id: 'amber', color: '#F59E0B' },
                                ].map(({ id, color }) => (
                                    <button
                                        key={id}
                                        onClick={() => setThemeColor(id as any)}
                                        className={`w-10 h-10 flex items-center justify-center transition-all border-2 ${themeColor === id ? 'border-swiss-red scale-110' : 'border-black dark:border-white hover:scale-105 opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {themeColor === id && <Check className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-not-allowed opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 border-2 border-black dark:border-white">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">保质期过期通知</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">即刻送达您的手机微信(即将上线)</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 relative border-2 border-black dark:border-white">
                                <div className="absolute left-1 top-1 bg-white dark:bg-gray-400 w-3 h-3"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* 安全与保护 */}
            <Card padding="none" className="overflow-hidden mt-4 swiss-enter" style={{ animationDelay: '0.1s' }}>
                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800 border-b-2 border-black dark:border-white">
                    <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">安全与保护</h2>
                </div>
                <div className="divide-y-2 divide-black dark:divide-white">
                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer" onClick={() => setShowPinModal(true)}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${appPin ? 'bg-swiss-red/10 text-swiss-red' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} flex items-center justify-center transition-colors border-2 border-black dark:border-white`}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">应用防窥锁 (App Lock)</p>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{appPin ? '已开启，切出后台 30 秒即自动锁定' : '未开启，开启可防止他人随手查阅'}</p>
                            </div>
                        </div>
                        <div className={`relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none border-2 border-black dark:border-white ${appPin ? 'bg-swiss-red' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <span className={`inline-block h-4 w-4 bg-white transition-transform ${appPin ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* 关于本产品 */}
            <Card padding="none" className="overflow-hidden mt-4">
                <div className="divide-y-2 divide-black dark:divide-white">
                    <div
                        onClick={() => setShowPrivacyPolicy(true)}
                        className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                        <span className="text-sm font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />家庭云端数据隐私协议</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-700 dark:text-gray-300">
                        <span className="text-sm font-bold flex items-center gap-2"><HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />使用帮助与产品反馈</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">v2.2.0</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleForceUpdate(); }}
                                className="text-[10px] font-bold px-2 py-0.5 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                检查更新
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* AI 家庭大盘体检 */}
            <Card id="ai-health-check" padding="none" className="overflow-hidden mt-4">
                <div className="px-5 py-4 border-b-2 border-black dark:border-white">
                    <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI 家庭资产大盘体检
                    </h2>
                </div>

                <div className="p-5 relative">
                    {!healthReport && !reportLoading ? (
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-white">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">一键扫描资产隐患</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                结合最新保质期追踪，AI管家将深度巡视您的 {items.length} 件物品，抓出烂账、提醒过期，并给出囤货建议。
                            </p>
                            <Button
                                onClick={handleGenerateReport}
                                variant="primary"
                            >
                                <Sparkles className="w-4 h-4 inline-block mr-1.5" /> 开始深度解读
                            </Button>
                        </div>
                    ) : reportLoading ? (
                        <div className="text-center py-10 space-y-4">
                            <RefreshCw className="w-8 h-8 text-swiss-red animate-spin mx-auto" />
                            <p className="text-sm font-bold text-swiss-red animate-pulse">管家正在翻箱倒柜盘点...</p>
                        </div>
                    ) : (
                        <div className="swiss-enter">
                            <div className="prose prose-sm md:prose-base prose-emerald dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                <ReactMarkdown>{healthReport || ''}</ReactMarkdown>
                            </div>
                            <div className="mt-8 pt-4 border-t-2 border-black dark:border-white text-center">
                                <button
                                    onClick={handleGenerateReport}
                                    className="text-sm font-bold text-swiss-red hover:text-swiss-red hover:underline"
                                >
                                    重新运行体检
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                </Card>

            {/*底部留白*/}
            {showPrivacyPolicy && (
                <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
            )}

            {/* App Lock Validation / Setup Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-black p-6 w-full max-w-sm swiss-enter relative border-2 border-black dark:border-white">
                        <button onClick={() => setShowPinModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-8 mt-2">
                            <div className="w-12 h-12 bg-swiss-red/10 dark:bg-swiss-red/20 text-swiss-red dark:text-swiss-red flex items-center justify-center mx-auto mb-4 border-2 border-black dark:border-white">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {pinSetupStep === 'verify' ? '验证当前密码以关闭' : pinSetupStep === 'new' ? '设置 4 位防窥密码' : '请再次确认防窥密码'}
                            </h3>
                            {pinError && <p className="text-swiss-red text-sm mt-2 font-bold">{pinSetupStep === 'confirm' ? '两次密码不一致，请重新输入' : '密码不正确'}</p>}
                            {!pinError && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{pinSetupStep === 'confirm' ? '确保密码输入无误' : '开启后切换出应用将自动锁定'}</p>}
                        </div>

                        <PinPad pin={enteredPin} setPin={setEnteredPin} error={pinError} maxLength={4} />
                    </div>
                </div>
            )}
        </div>
    );
}
