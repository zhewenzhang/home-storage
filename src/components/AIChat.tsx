import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, Loader2, Trash2, CheckCircle2, AlertTriangle, Plus, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
    ChatMessage, AIAction,
    buildSystemPrompt, parseIntentWithAI, localParseIntent, chatWithAI,
    toSimplified, findBestLocation, analyzeImageWithAI
} from '../services/ai';
import { uploadImage } from '../services/storage';
import { useNavigate } from 'react-router-dom';

// 操作类型选项
const ACTION_TYPES = [
    { value: 'add_cabinet', label: '📦 添加收纳' },
    { value: 'add_room', label: '🏠 添加房间' },
    { value: 'add_item', label: '📌 放入物品' },
    { value: 'delete_item', label: '🗑️ 删除物品' },
] as const;

import { Camera } from 'lucide-react';

const CATEGORIES = ['衣物', '电子产品', '工具', '书籍', '厨房用品', '药品', '纪念品', '其他'];

function actionLabel(a: AIAction): string {
    if (a.action === 'add_cabinet') return `📦 添加收纳「${a.name}」${a.parentRoom ? ` → ${a.parentRoom}` : ''}`;
    if (a.action === 'add_room') return `🏠 添加房间「${a.name}」`;
    if (a.action === 'add_item') return `📌 放入「${a.name}」×${a.quantity || 1} → ${a.locationName || '?'}`;
    if (a.action === 'delete_item') return `🗑️ 删除「${a.name}」`;
    return '';
}

export default function AIChat() {
    const { locations, items, addLocation, addItem, deleteItem } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; actions?: AIAction[] }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamText, setStreamText] = useState('');
    const [statusText, setStatusText] = useState('');
    const [pendingActions, setPendingActions] = useState<AIAction[] | null>(null);
    const [pendingUserText, setPendingUserText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // 独立拍照上传状态
    const [isVisionScanning, setIsVisionScanning] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current) {
            const el = messagesEndRef.current;
            // Only smooth scroll if we are somewhat close to bottom, or instantly jump if far away
            el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, streamText, pendingActions, statusText]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen]);

    // 获取所有位置选项（含当前 pending 中新建的）
    const getLocationOptions = useCallback(() => {
        const existing = locations.map(l => ({ name: l.name, isRoom: l.type === 'room' }));
        const newOnes = (pendingActions || [])
            .filter(a => a.action === 'add_cabinet' || a.action === 'add_room')
            .map(a => ({ name: a.name, isRoom: a.action === 'add_room' }));

        const unique: { name: string, isRoom: boolean }[] = [];
        const seen = new Set();
        for (const item of [...existing, ...newOnes]) {
            if (!seen.has(item.name)) {
                seen.add(item.name);
                unique.push(item);
            }
        }
        return unique;
    }, [locations, pendingActions]);

    const getRoomOptions = useCallback((): string[] => {
        const existing = locations.filter(l => l.type === 'room').map(l => l.name);
        const newOnes = (pendingActions || [])
            .filter(a => a.action === 'add_room')
            .map(a => a.name);
        return [...new Set([...existing, ...newOnes])];
    }, [locations, pendingActions]);

    // 顺序执行
    const executeActions = useCallback((actions: AIAction[]): { success: AIAction[]; failed: AIAction[] } => {
        const success: AIAction[] = [];
        const failed: AIAction[] = [];

        const sorted = [...actions].sort((a, b) => {
            const order: Record<string, number> = { add_room: 0, add_cabinet: 1, add_item: 2, delete_item: 2 };
            return (order[a.action] ?? 9) - (order[b.action] ?? 9);
        });

        for (const action of sorted) {
            try {
                const locs = useStore.getState().locations;
                const curItems = useStore.getState().items;

                if (action.action === 'add_cabinet') {
                    const parentRoom = action.parentRoom ? locs.find(l => l.type === 'room' && l.name === action.parentRoom) : null;
                    const bx = parentRoom
                        ? parentRoom.bounds.x + 10 + Math.random() * Math.max(20, parentRoom.bounds.width - 60)
                        : 60 + Math.random() * 400;
                    const by = parentRoom
                        ? parentRoom.bounds.y + 10 + Math.random() * Math.max(20, parentRoom.bounds.height - 60)
                        : 60 + Math.random() * 300;
                    addLocation({
                        name: action.name, type: (action.type as any) || 'cabinet',
                        roomType: action.type || 'cabinet', parentId: parentRoom?.id || null,
                        bounds: { x: Math.round(bx / 20) * 20, y: Math.round(by / 20) * 20, width: 40, height: 40 },
                    });
                    success.push(action);
                } else if (action.action === 'add_room') {
                    const existing = locs.filter(l => l.type === 'room');
                    const col = existing.length % 3;
                    const row = Math.floor(existing.length / 3);
                    addLocation({
                        name: action.name, type: 'room',
                        roomType: action.type || 'living', parentId: null,
                        bounds: { x: col * 200 + 40, y: row * 200 + 40, width: 160, height: 120 },
                    });
                    success.push(action);
                } else if (action.action === 'add_item') {
                    let loc = action.locationName ? locs.find(l => l.name === action.locationName) : null;
                    if (!loc && action.locationName) {
                        const best = findBestLocation(action.locationName, locs as any);
                        if (best) loc = locs.find(l => l.id === (best as any).id) || null;
                    }
                    if (loc) {
                        addItem({
                            name: action.name, category: action.category || '其他',
                            quantity: action.quantity || 1, description: '', locationId: loc.id,
                        });
                        success.push({ ...action, locationName: loc.name });
                    } else {
                        failed.push(action);
                    }
                } else if (action.action === 'delete_item') {
                    const item = curItems.find(i => i.name === action.name);
                    if (item) { deleteItem(item.id); success.push(action); }
                    else failed.push(action);
                }
            } catch (err) {
                console.error('[执行失败]', action, err);
                failed.push(action);
            }
        }
        return { success, failed };
    }, [addLocation, addItem, deleteItem]);

    // 解析 → 展示确认
    const handleSend = async () => {
        const rawText = input.trim();
        if (!rawText || isLoading) return;
        const text = toSimplified(rawText);

        setMessages(prev => [...prev, { role: 'user' as const, content: rawText }]);
        setInput('');
        setIsLoading(true);
        setStatusText('🧠 AI 分析中...');
        setPendingActions(null);
        setPendingUserText(rawText);

        try {
            const state = useStore.getState();
            let actions = await parseIntentWithAI(text, state.locations);
            if (actions.length === 0) actions = localParseIntent(text, state.locations);

            // 校验 locationName
            actions = actions.map(a => {
                if ((a.action === 'add_item' || a.action === 'delete_item') && a.locationName) {
                    const loc = state.locations.find(l => l.name === a.locationName);
                    if (!loc) {
                        const newCab = actions.find(ac => ac.action === 'add_cabinet' && ac.name === a.locationName);
                        if (newCab) return a;
                        const best = findBestLocation(text, state.locations as any);
                        if (best) return { ...a, locationName: best.name };
                    }
                }
                return a;
            });

            if (actions.length > 0) {
                setPendingActions(actions);
                setIsLoading(false);
                setStatusText('');
            } else {
                await getAIReply(rawText, [], []);
            }
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.message || '解析失败'}` }]);
            setIsLoading(false);
            setStatusText('');
        }
    };

    // 编辑操作
    const updateAction = (index: number, updates: Partial<AIAction>) => {
        if (!pendingActions) return;
        setPendingActions(prev => prev!.map((a, i) => i === index ? { ...a, ...updates } : a));
    };

    const removeAction = (index: number) => {
        if (!pendingActions) return;
        const updated = pendingActions.filter((_, i) => i !== index);
        setPendingActions(updated.length > 0 ? updated : null);
    };

    const addNewAction = () => {
        setPendingActions(prev => [
            ...(prev || []),
            { action: 'add_item', name: '', category: '其他', quantity: 1, locationName: '' },
        ]);
    };

    const handleConfirm = async () => {
        if (!pendingActions || pendingActions.length === 0) return;
        // 过滤掉没填名称的
        const valid = pendingActions.filter(a => a.name.trim());
        if (valid.length === 0) {
            setPendingActions(null);
            return;
        }
        setPendingActions(null);
        setIsLoading(true);
        setStatusText('⚡ 执行操作...');
        const { success, failed } = executeActions(valid);
        await getAIReply(pendingUserText, success, failed);
    };

    const handleCancel = async () => {
        setPendingActions(null);
        await getAIReply(pendingUserText, [], []);
    };

    const getAIReply = async (userText: string, success: AIAction[], _failed: AIAction[]) => {
        setIsLoading(true);
        setStatusText('💬 生成回复...');
        setStreamText('');
        try {
            const state = useStore.getState();
            const executed = success.length > 0;
            const desc = success.map(a => {
                if (a.action === 'add_item') return `物品"${a.name}" → ${a.locationName}`;
                if (a.action === 'add_cabinet') return `收纳"${a.name}" → ${a.parentRoom || ''}`;
                if (a.action === 'add_room') return `房间"${a.name}"`;
                if (a.action === 'delete_item') return `删除"${a.name}"`;
                return a.name;
            }).join('；');
            const sp = buildSystemPrompt(state.locations, state.items, executed, desc);
            const apiMsgs: ChatMessage[] = [
                { role: 'system', content: sp },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userText },
            ];
            setStatusText('');
            const reply = await chatWithAI(apiMsgs, (p) => setStreamText(p));
            setMessages(prev => [...prev, {
                role: 'assistant', content: reply.trim(),
                actions: success.length > 0 ? success : undefined,
            }]);
        } catch (err: any) {
            const msg = success.length > 0
                ? `操作已完成！(回复生成失败)` : `❌ ${err.message || '请求失败'}`;
            setMessages(prev => [...prev, {
                role: 'assistant', content: msg,
                actions: success.length > 0 ? success : undefined,
            }]);
        } finally {
            setStreamText('');
            setIsLoading(false);
            setStatusText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const QUICK = [
        '家里有哪些空间？',
        '在书房添加一个书架',
        '在卧室添加衣柜，把冬衣放进去',
        '客厅杂物收纳柜放着湿纸巾和口罩，帮我记录',
    ];

    // 处理拍照捷径
    const handleCaptureImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('只能上传图片文件');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过 5MB');
            return;
        }

        setIsVisionScanning(true);
        try {
            // 1. 上传图片到 Supabase
            const url = await uploadImage(file);
            if (!url) throw new Error('上传失败');

            // 2. 调用 AI 视觉识别
            const aiResult = await analyzeImageWithAI(url);

            // 3. 携带数据跳转到新建页面
            navigate('/items/new', {
                state: {
                    imageUrl: url,
                    aiPreFill: aiResult || undefined,
                    autoScanComplete: true
                }
            });
            setIsOpen(false);
        } catch (err: any) {
            console.error(err);
            alert('识别失败，请重试或手动添加');
        } finally {
            setIsVisionScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* 隐藏的相机输入框 */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleCaptureImage}
            />

            {/* AI 视觉进行中的全屏阻断遮罩 */}
            {isVisionScanning && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl">
                    <div className="relative w-56 h-56 mb-8 mt-4">
                        {/* 扫描虚线框 外发光 */}
                        <div className="absolute inset-0 shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-3xl" />
                        <div className="absolute inset-0 border-[3px] border-emerald-500/60 rounded-3xl overflow-hidden backdrop-blur-md bg-emerald-900/10">
                            {/* 激光扫描线上下浮动效果 (Vfx) */}
                            <div className="absolute left-0 w-full h-[4px] bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.9)] animate-cyber-scan" />
                            {/* 内部网格背景 */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.15)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        </div>
                        {/* 居中图标 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-emerald-300 animate-pulse drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                        </div>
                    </div>

                    {/* 打字机特效文本 */}
                    <div className="flex flex-col items-center animate-enter text-center">
                        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-100 tracking-[0.1em] mb-4 animate-pulse">VISION SYSTEM <span className="text-emerald-400">ACTIVATED</span></h3>
                        <p className="text-emerald-400/90 text-sm mb-2 font-mono flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            正在解构物品空间维数与微观特征...
                        </p>
                        <p className="text-emerald-500/50 text-xs font-mono">▸ MODEL: gemini-2.5-flash / 超维闪速通道在线...</p>
                    </div>

                    <style>{`
                        @keyframes cyber-scan {
                            0% { top: 0; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                        .animate-cyber-scan {
                            animation: cyber-scan 1.5s ease-in-out infinite;
                        }
                    `}</style>
                </div>
            )}

            {/* AI 快捷浮窗容器 */}
            <div className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-3 items-end">
                {/* 新增的 拍照识物 按钮 (尺寸统一调成 w-14 h-14) */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/20 hover:border-emerald-300"
                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
                    title="📸 拍照极速录入"
                >
                    <Camera className="w-6 h-6 text-white" />
                </button>

                {/* 原有的大文字聊天球 */}
                <button onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #3B6D8C 0%, #2A4D63 100%)', boxShadow: '0 4px 20px rgba(59,109,140,0.4)' }}
                >
                    {isOpen ? <X className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
                </button>
            </div>

            {isOpen && (
                <div className="fixed bottom-32 md:bottom-24 right-4 md:right-6 z-50 flex flex-col overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-2xl"
                    style={{
                        width: '420px', maxWidth: 'calc(100vw - 32px)',
                        height: '580px', maxHeight: 'calc(100vh - 140px)',
                        borderRadius: '1.5rem',
                        animation: 'chatEnter 0.3s ease-out forwards',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #3B6D8C 0%, #2A4D63 100%)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">AI 收纳助手</h3>
                            <p className="text-xs text-white/70">{items.length} 物品 · {locations.length} 空间</p>
                        </div>
                        {messages.length > 0 && (
                            <button onClick={() => { setMessages([]); setStreamText(''); setPendingActions(null); }}
                                className="p-2 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
                                title="清空对话"
                            ><Trash2 className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
                            title="关闭聊天"
                        ><X className="w-5 h-5" /></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {messages.length === 0 && !isLoading && !pendingActions && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-transparent dark:border-slate-700">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">👋 你好！我是 AI 收纳助手</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">支持<b>繁体/简体</b>，操作前会先确认 ⚡</p>
                                    <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5 list-disc pl-4">
                                        <li>「在客厅加个鞋柜」→ 添加收纳</li>
                                        <li>「口罩放到了杂物柜里」→ 记录物品</li>
                                        <li>「在书房加置物柜，把网线放进去」→ 复合操作</li>
                                        <li>「删掉书房的PS5」→ 删除物品</li>
                                    </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {QUICK.map((q, i) => (
                                        <button key={i} onClick={() => setInput(q)}
                                            className="p-3 text-xs font-bold text-left rounded-xl border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-[#3B6D8C] dark:hover:border-blue-400 hover:text-[#3B6D8C] dark:hover:text-blue-400 hover:bg-[#F0F7FB] dark:hover:bg-slate-800 transition-all"
                                        >{q}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%]">
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100'}`}
                                        style={msg.role === 'user' ? {
                                            background: 'linear-gradient(135deg, #3B6D8C 0%, #2A4D63 100%)',
                                            borderBottomRightRadius: '6px',
                                        } : { borderBottomLeftRadius: '6px' }}
                                    ><p className="whitespace-pre-wrap">{msg.content}</p></div>
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {msg.actions.map((a, j) => {
                                                const isDel = a.action === 'delete_item';
                                                return (
                                                    <div key={j} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${isDel ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}
                                                    ><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /><span>{actionLabel(a)}</span></div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* ===== 可编辑确认卡片 ===== */}
                        {pendingActions && !isLoading && (
                            <div className="flex justify-start">
                                <div className="w-full">
                                    <div className="rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-900/50 bg-[#F7FBFF] dark:bg-slate-800/80">
                                        <div className="px-4 py-2.5 flex items-center gap-2 bg-[#E3F2FD] dark:bg-blue-900/40">
                                            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">操作预览（可编辑）</span>
                                        </div>

                                        <div className="px-3 py-2 space-y-3 max-h-[240px] overflow-y-auto">
                                            {pendingActions.map((a, i) => (
                                                <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 space-y-2">
                                                    {/* 行1: 操作类型 + 删除按钮 */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <select value={a.action} onChange={e => updateAction(i, { action: e.target.value as any })}
                                                                className="w-full appearance-none pl-2 pr-6 py-1 text-xs font-bold rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 outline-none focus:border-blue-400 dark:text-gray-100"
                                                            >
                                                                {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                            </select>
                                                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        </div>
                                                        <button onClick={() => removeAction(i)}
                                                            className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                                        ><X className="w-3.5 h-3.5" /></button>
                                                    </div>

                                                    {/* 行2: 名称 */}
                                                    <input value={a.name} onChange={e => updateAction(i, { name: e.target.value })}
                                                        placeholder="名称..."
                                                        className="w-full px-2 py-1 text-xs rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 outline-none focus:border-blue-400 dark:text-gray-200"
                                                    />

                                                    {/* 行3: 位置/类别 */}
                                                    {(a.action === 'add_item' || a.action === 'delete_item') && (
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <select value={a.locationName || ''} onChange={e => updateAction(i, { locationName: e.target.value })}
                                                                    className="w-full appearance-none pl-2 pr-6 py-1 text-xs rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 outline-none focus:border-blue-400 dark:text-gray-200"
                                                                >
                                                                    <option value="">选择位置...</option>
                                                                    {getLocationOptions().map(opt => <option key={opt.name} value={opt.name}>{opt.isRoom ? '🏠 [位置] ' : '📦 [收纳] '}{opt.name}</option>)}
                                                                </select>
                                                                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>
                                                            {a.action === 'add_item' && (
                                                                <div className="relative" style={{ width: '80px' }}>
                                                                    <select value={a.category || '其他'} onChange={e => updateAction(i, { category: e.target.value })}
                                                                        className="w-full appearance-none pl-2 pr-5 py-1 text-xs rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 outline-none focus:border-blue-400 dark:text-gray-200"
                                                                    >
                                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                                    </select>
                                                                    <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {a.action === 'add_cabinet' && (
                                                        <div className="relative">
                                                            <select value={a.parentRoom || ''} onChange={e => updateAction(i, { parentRoom: e.target.value || undefined })}
                                                                className="w-full appearance-none pl-2 pr-6 py-1 text-xs rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 outline-none focus:border-blue-400 dark:text-gray-200"
                                                            >
                                                                <option value="">选择房间...</option>
                                                                {getRoomOptions().map(n => <option key={n} value={n}>{n}</option>)}
                                                            </select>
                                                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        </div>
                                                    )}

                                                    {/* 数量 */}
                                                    {a.action === 'add_item' && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">数量:</span>
                                                            <input type="number" min={1} value={a.quantity || 1}
                                                                onChange={e => updateAction(i, { quantity: parseInt(e.target.value) || 1 })}
                                                                className="w-16 px-2 py-1 text-xs rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 outline-none focus:border-blue-400 dark:text-gray-200"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="px-3 py-2 border-t border-blue-100 dark:border-blue-900/50">
                                            <button onClick={addNewAction}
                                                className="w-full py-1.5 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-1"
                                            ><Plus className="w-3 h-3" /> 添加操作</button>
                                        </div>

                                        <div className="px-3 py-2.5 flex gap-2 border-t border-blue-100 dark:border-blue-900/50">
                                            <button onClick={handleConfirm}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-primary dark:bg-blue-600"
                                            >✅ 确认执行</button>
                                            <button onClick={handleCancel}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                                            >❌ 取消</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100"
                                    style={{ borderBottomLeftRadius: '6px' }}
                                >
                                    {streamText ? (
                                        <p className="whitespace-pre-wrap">{streamText}<span className="animate-pulse">▍</span></p>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                                            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">{statusText || '思考中...'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
                        <div className="flex items-center gap-2">
                            <input ref={inputRef} type="text" value={input}
                                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="在书房加个置物柜，把网线放进去..."
                                disabled={isLoading || !!pendingActions}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm dark:text-gray-100 outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
                            />
                            <button onClick={handleSend} disabled={!input.trim() || isLoading || !!pendingActions}
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30 bg-primary dark:bg-blue-600 hover:bg-primary-dark dark:hover:bg-blue-700"
                            ><Send className="w-4 h-4 text-white" /></button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes chatEnter { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        </>
    );
}
