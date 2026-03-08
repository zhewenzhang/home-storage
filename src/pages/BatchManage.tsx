import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Plus, Upload, Save, Settings2, Database, X, MapPin } from 'lucide-react';
import type { Item } from '../types';

interface DraftItem {
    key: string;
    id: string | null;
    name: string;
    category: string;
    quantity: number;
    description: string;
    locationId: string;
    status: 'unchanged' | 'added' | 'updated' | 'deleted';
}

const CATEGORIES = ['数码', '衣物', '文件', '消耗品', '纪念品', '书籍', '工具', '食品', '其他'];

export default function BatchManage() {
    const { items, locations, processBatch } = useStore();
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [batchCategory, setBatchCategory] = useState('');
    const [batchLocationId, setBatchLocationId] = useState('');
    const [batchRoomId, setBatchRoomId] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 计算位置树：取出所有房间及其子收纳点
    const rootRooms = locations.filter(l => l.type === 'room');
    const getSubLocations = (parentId: string) => locations.filter(l => l.parentId === parentId);

    useEffect(() => {
        // 页面加载或 items 变动时，初始化 drafts
        setDrafts(items.map(item => ({
            key: item.id,
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            description: item.description || '',
            locationId: item.locationId || '',
            status: 'unchanged'
        })));
        setSelectedKeys(new Set());
    }, [items]);

    const toggleSelectAll = () => {
        if (selectedKeys.size === drafts.filter(d => d.status !== 'deleted').length) {
            setSelectedKeys(new Set());
        } else {
            setSelectedKeys(new Set(drafts.filter(d => d.status !== 'deleted').map(d => d.key)));
        }
    };

    const toggleSelect = (key: string) => {
        const next = new Set(selectedKeys);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedKeys(next);
    };

    const updateDraft = (key: string, updates: Partial<DraftItem>) => {
        setDrafts(prev => prev.map(d => {
            if (d.key !== key) return d;
            let newStatus = d.status;
            if (d.status === 'unchanged') newStatus = 'updated';
            return { ...d, ...updates, status: newStatus };
        }));
    };

    const handleAddRow = () => {
        setDrafts([{
            key: 'draft_' + Math.random().toString(36).substring(2),
            id: null,
            name: '',
            category: '其他',
            quantity: 1,
            description: '',
            locationId: '',
            status: 'added'
        }, ...drafts]);
    };

    const handleDuplicateSelected = () => {
        if (selectedKeys.size === 0) return;
        const newDrafts: DraftItem[] = [];
        drafts.forEach(d => {
            if (selectedKeys.has(d.key)) {
                newDrafts.push({
                    ...d,
                    key: 'draft_' + Math.random().toString(36).substring(2),
                    id: null,
                    status: 'added' // 复制的新行始终视为"新增"
                });
            }
        });
        setDrafts([...newDrafts, ...drafts]);
        setSelectedKeys(new Set()); // 复制完清空选择
    };

    const handleBatchDelete = () => {
        if (selectedKeys.size === 0) return;
        setDrafts(prev => prev.map(d => {
            if (selectedKeys.has(d.key)) {
                if (d.status === 'added') return null; // 直接丢弃还没保存的新增行
                return { ...d, status: 'deleted' };
            }
            return d;
        }).filter(Boolean) as DraftItem[]);
        setSelectedKeys(new Set());
    };

    const applyBatchEdit = () => {
        setDrafts(prev => prev.map(d => {
            if (selectedKeys.has(d.key)) {
                let newStatus = d.status;
                if (d.status === 'unchanged') newStatus = 'updated';

                // 位置逻辑：优先使用具体的收纳(batchLocationId)，如果不选收纳，则使用所选房间(batchRoomId)。如果清除位置则清空。
                let finalLocationId = d.locationId;
                if (batchLocationId === 'none') {
                    finalLocationId = '';
                } else if (batchLocationId) {
                    finalLocationId = batchLocationId;
                } else if (batchRoomId && batchRoomId !== 'none') {
                    finalLocationId = batchRoomId;
                }

                return {
                    ...d,
                    status: newStatus,
                    category: batchCategory || d.category,
                    locationId: finalLocationId
                };
            }
            return d;
        }));
        setIsEditModalOpen(false);
        setBatchCategory('');
        setBatchRoomId('');
        setBatchLocationId('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) return;

            // 简单解析 CSV: 名称,分类,数量,描述
            const newDrafts: DraftItem[] = [];
            // 检查第一行是否是表头
            const startIdx = lines[0].includes('名称') ? 1 : 0;

            for (let i = startIdx; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                const name = cols[0] || '未命名物品';
                const category = cols[1] || '其他';
                const quantity = parseInt(cols[2]) || 1;
                const description = cols[3] || '';

                newDrafts.push({
                    key: 'draft_' + Math.random().toString(36).substring(2) + i,
                    id: null,
                    name,
                    category,
                    quantity,
                    description,
                    locationId: '',
                    status: 'added'
                });
            }
            setDrafts(prev => [...newDrafts, ...prev]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const adds: Omit<Item, 'id' | 'createdAt'>[] = [];
            const updates: { id: string, changes: Partial<Item> }[] = [];
            const deletes: string[] = [];

            drafts.forEach(d => {
                if (d.status === 'added') {
                    if (!d.name.trim()) return; // 忽略空名字的新增行
                    adds.push({
                        name: d.name,
                        category: d.category,
                        quantity: d.quantity,
                        description: d.description,
                        locationId: d.locationId || '',
                    });
                } else if (d.status === 'updated' && d.id) {
                    updates.push({
                        id: d.id,
                        changes: {
                            name: d.name,
                            category: d.category,
                            quantity: d.quantity,
                            description: d.description,
                            locationId: d.locationId || ''
                        }
                    });
                } else if (d.status === 'deleted' && d.id) {
                    deletes.push(d.id);
                }
            });

            if (adds.length === 0 && updates.length === 0 && deletes.length === 0) {
                alert('没有任何需要保存的更改');
                return;
            }

            await processBatch(adds, updates, deletes);
            alert('批量存档成功！');
        } catch (err: any) {
            alert('存档失败: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const visibleDrafts = drafts.filter(d => d.status !== 'deleted');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400">
                        <Database className="w-6 h-6" />
                        批量数据管理
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        你可以在这里像使用表格一样快速修改、新增、删除物品或进行批量归类，最后统一存档保存。
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 text-white rounded-xl text-sm font-medium shadow-md transition-all flex items-center gap-2 bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? '存档中...' : '保存修改'}
                    </button>
                </div>
            </div>

            {/* 操作栏 */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={handleAddRow}
                        className="btn-outline px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> 新增行
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors"
                    >
                        <Upload className="w-4 h-4" /> CSV导入
                    </button>
                </div>

                {selectedKeys.size > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/30 rounded-lg border border-blue-100/50 dark:border-blue-900/50 animate-enter">
                        <span className="text-sm text-blue-800 dark:text-blue-300 font-medium px-2">已选 {selectedKeys.size} 项</span>
                        <div className="w-px h-4 bg-blue-200 dark:bg-blue-800"></div>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                            title="批量设置类别和位置"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDuplicateSelected}
                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-md transition-colors font-semibold text-xs flex items-center gap-1"
                            title="复制选中的数据"
                        >
                            复制
                        </button>
                        <button
                            onClick={handleBatchDelete}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors"
                            title="批量删除"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    {/* PC 端表格 / 移动端卡片列表 */}
                    <div className="min-w-full inline-block align-middle">
                        <div className="hidden md:block">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-700 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        <th className="p-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500 cursor-pointer"
                                                checked={visibleDrafts.length > 0 && selectedKeys.size === visibleDrafts.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4">物品名称</th>
                                        <th className="p-4 w-32">分类</th>
                                        <th className="p-4 w-40">所属位置</th>
                                        <th className="p-4 w-20">数量</th>
                                        <th className="p-4">描述备注</th>
                                        <th className="p-4 w-24 text-center">状态</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleDrafts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                暂无数据，点击上方“新增空行”开始填写。
                                            </td>
                                        </tr>
                                    ) : visibleDrafts.map(draft => (
                                        <tr key={draft.key} className={`border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors ${selectedKeys.has(draft.key) ? 'bg-primary/5 dark:bg-blue-900/20' : ''}`}>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedKeys.has(draft.key)}
                                                    onChange={() => toggleSelect(draft.key)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    value={draft.name}
                                                    onChange={e => updateDraft(draft.key, { name: e.target.value })}
                                                    placeholder="物品名称"
                                                    className="w-full bg-transparent border-0 focus:ring-2 focus:ring-primary/30 dark:focus:ring-blue-500/30 rounded-md px-2 py-1.5 outline-none font-bold text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={draft.category}
                                                    onChange={e => updateDraft(draft.key, { category: e.target.value })}
                                                    className="w-full bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                                                >
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={draft.locationId}
                                                    onChange={e => updateDraft(draft.key, { locationId: e.target.value })}
                                                    className="w-full bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                                                    title="如需精细分配可在此选择。或者通过上方批量归类指定。"
                                                >
                                                    <option value="">-- 未分配 --</option>
                                                    {rootRooms.map(room => (
                                                        <optgroup key={room.id} label={room.name}>
                                                            <option value={room.id}>📍 {room.name} (仅房间)</option>
                                                            {getSubLocations(room.id).map(sub => (
                                                                <option key={sub.id} value={sub.id}>┖ {sub.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                    {/* 游离在房间外的收纳点 */}
                                                    {locations.filter(l => l.type !== 'room' && !l.parentId).length > 0 && (
                                                        <optgroup label="其他收纳点">
                                                            {locations.filter(l => l.type !== 'room' && !l.parentId).map(sub => (
                                                                <option key={sub.id} value={sub.id}>┖ {sub.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={draft.quantity}
                                                    onChange={e => updateDraft(draft.key, { quantity: parseInt(e.target.value) || 1 })}
                                                    className="w-16 bg-transparent border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-800 dark:text-gray-100 font-medium text-center transition-colors"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    value={draft.description}
                                                    onChange={e => updateDraft(draft.key, { description: e.target.value })}
                                                    placeholder="追加备注 (可选)"
                                                    className="w-full bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-500 dark:text-gray-400 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                {draft.status === 'unchanged' && <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                                                {draft.status === 'added' && <span className="inline-block px-2 py-1 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold">新增待存</span>}
                                                {draft.status === 'updated' && <span className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-primary dark:text-blue-400 rounded-md text-xs font-semibold">已修改</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 移动端卡片视图 */}
                        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-700">
                            {/* 移动端全选控制条 */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-900/80 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-slate-700">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500"
                                        checked={visibleDrafts.length > 0 && selectedKeys.size === visibleDrafts.length}
                                        onChange={toggleSelectAll}
                                    />
                                    {selectedKeys.size > 0 ? `已选 ${selectedKeys.size} 项` : '全选 / 取消全选'}
                                </label>
                            </div>

                            {visibleDrafts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">暂无数据，点击上方添加。</div>
                            ) : (
                                visibleDrafts.map(draft => (
                                    <div key={draft.key} className={`p-4 flex gap-3 transition-colors ${selectedKeys.has(draft.key) ? 'bg-primary/5 dark:bg-blue-900/20' : ''}`}>
                                        <div className="pt-1 select-none">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500"
                                                checked={selectedKeys.has(draft.key)}
                                                onChange={() => toggleSelect(draft.key)}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-3 min-w-0">
                                            {/* Top row: Name & Status */}
                                            <div className="flex justify-between items-start gap-2">
                                                <input
                                                    value={draft.name}
                                                    onChange={e => updateDraft(draft.key, { name: e.target.value })}
                                                    placeholder="物品名称..."
                                                    className="flex-1 bg-transparent border-0 border-b border-gray-200 dark:border-slate-700 focus:border-primary dark:focus:border-blue-500 px-0 py-1 outline-none font-bold text-gray-800 dark:text-gray-100 text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                                />
                                                <div className="flex-shrink-0 pt-1">
                                                    {draft.status === 'added' && <span className="inline-block px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded text-[10px] font-semibold">新增</span>}
                                                    {draft.status === 'updated' && <span className="inline-block px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-primary dark:text-blue-400 rounded text-[10px] font-semibold">修改</span>}
                                                </div>
                                            </div>

                                            {/* Middle row: Category & Quanity */}
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider">分类</label>
                                                    <select
                                                        value={draft.category}
                                                        onChange={e => updateDraft(draft.key, { category: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-700 dark:text-gray-200 font-medium"
                                                    >
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-20 flex-shrink-0">
                                                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider">数量</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={draft.quantity}
                                                        onChange={e => updateDraft(draft.key, { quantity: parseInt(e.target.value) || 1 })}
                                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-center text-gray-800 dark:text-gray-100 font-bold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Location row */}
                                            <div>
                                                <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> 存储位置
                                                </label>
                                                <select
                                                    value={draft.locationId}
                                                    onChange={e => updateDraft(draft.key, { locationId: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-primary dark:text-blue-400 font-medium"
                                                >
                                                    <option value="">-- 未分配 --</option>
                                                    {rootRooms.map(room => (
                                                        <optgroup key={room.id} label={room.name}>
                                                            <option value={room.id}>📍 {room.name} (仅房间)</option>
                                                            {getSubLocations(room.id).map(sub => (
                                                                <option key={sub.id} value={sub.id}>┖ {sub.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                    {locations.filter(l => l.type !== 'room' && !l.parentId).length > 0 && (
                                                        <optgroup label="其他收纳点">
                                                            {locations.filter(l => l.type !== 'room' && !l.parentId).map(sub => (
                                                                <option key={sub.id} value={sub.id}>┖ {sub.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </div>

                                            {/* Note row */}
                                            <input
                                                value={draft.description}
                                                onChange={e => updateDraft(draft.key, { description: e.target.value })}
                                                placeholder="添加备注..."
                                                className="w-full bg-transparent border-0 border-b border-transparent focus:border-gray-200 dark:focus:border-slate-700 px-0 py-1.5 outline-none text-xs text-gray-400 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 批量修改弹窗 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-enter p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col border border-transparent dark:border-slate-700">
                        <div className="p-5 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400">
                                批量归类 ({selectedKeys.size}项)
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">重置分类为</label>
                                <select
                                    className="input-field py-2 w-full text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-gray-200"
                                    value={batchCategory}
                                    onChange={e => setBatchCategory(e.target.value)}
                                >
                                    <option value="">-- 不修改分类 --</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">移动至指定房间</label>
                                <select
                                    className="input-field py-2 w-full text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-gray-200"
                                    value={batchRoomId}
                                    onChange={e => { setBatchRoomId(e.target.value); setBatchLocationId(''); }}
                                >
                                    <option value="">-- 不修改房间 --</option>
                                    <option value="none">-- 移出位置 (置空) --</option>
                                    {rootRooms.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            {batchRoomId && batchRoomId !== 'none' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">存入房间内具体收纳</label>
                                    <select
                                        className="input-field py-2 w-full text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-gray-200"
                                        value={batchLocationId}
                                        onChange={e => setBatchLocationId(e.target.value)}
                                    >
                                        <option value="">-- （仅暂存房间） --</option>
                                        {getSubLocations(batchRoomId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={applyBatchEdit}
                                className="px-4 py-2 text-sm text-white rounded-xl transition-all shadow-md bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                确认应用
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
