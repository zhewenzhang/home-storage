import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Plus, Upload, Save, Settings2, Database, X, MapPin } from 'lucide-react';
import type { Item } from '../types';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui';

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

import { DEFAULT_CATEGORIES as CATEGORIES } from '../types';

export default function BatchManage() {
    const { items, locations, processBatch } = useStore();
    const { addToast } = useToast();
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [batchCategory, setBatchCategory] = useState('');
    const [batchLocationId, setBatchLocationId] = useState('');
    const [batchRoomId, setBatchRoomId] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const rootRooms = locations.filter(l => l.type === 'room');
    const getSubLocations = (parentId: string) => locations.filter(l => l.parentId === parentId);

    useEffect(() => {
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
                    status: 'added'
                });
            }
        });
        setDrafts([...newDrafts, ...drafts]);
        setSelectedKeys(new Set());
    };

    const handleBatchDelete = () => {
        if (selectedKeys.size === 0) return;
        setDrafts(prev => prev.map(d => {
            if (selectedKeys.has(d.key)) {
                if (d.status === 'added') return null;
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
            const newDrafts: DraftItem[] = [];
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
                    if (!d.name.trim()) return;
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
                addToast('info', '没有任何需要保存的更改');
                return;
            }
            await processBatch(adds, updates, deletes);
            addToast('success', '批量存档成功！');
        } catch (err: any) {
            addToast('error', '存档失败: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const visibleDrafts = drafts.filter(d => d.status !== 'deleted');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                        <Database className="w-6 h-6" />
                        批量数据管理
                    </h1>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                        你可以在这里像使用表格一样快速修改、新增、删除物品或进行批量归类，最后统一存档保存。
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red hover:border-swiss-red border-2 border-black dark:border-white font-bold uppercase text-sm transition-all flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? '存档中...' : '保存修改'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-black p-3 border-2 border-black dark:border-white flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <input type="file" accept=".csv,.txt" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <button onClick={handleAddRow} className="border-2 border-black dark:border-white px-3 py-1.5 text-sm font-bold uppercase text-gray-700 dark:text-gray-400 hover:bg-black hover:text-white flex items-center gap-1.5 transition-colors">
                        <Plus className="w-4 h-4" /> 新增行
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="border-2 border-black dark:border-white px-3 py-1.5 text-sm font-bold uppercase text-gray-700 dark:text-gray-400 hover:bg-black hover:text-white flex items-center gap-1.5 transition-colors">
                        <Upload className="w-4 h-4" /> CSV导入
                    </button>
                </div>
                {selectedKeys.size > 0 && (
                    <div className="flex items-center gap-2 border-2 border-black dark:border-white bg-swiss-red/5 p-2 swiss-enter">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white px-2">已选 {selectedKeys.size} 项</span>
                        <div className="w-px h-4 bg-black dark:bg-white"></div>
                        <button onClick={() => setIsEditModalOpen(true)} className="p-1.5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="批量设置类别和位置">
                            <Settings2 className="w-4 h-4" />
                        </button>
                        <button onClick={handleDuplicateSelected} className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors font-semibold text-xs flex items-center gap-1" title="复制选中的数据">
                            复制
                        </button>
                        <button onClick={handleBatchDelete} className="p-1.5 text-swiss-red hover:bg-swiss-red/10 transition-colors" title="批量删除">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-black border-2 border-black dark:border-white overflow-hidden">
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-full inline-block align-middle">
                        <div className="hidden md:block">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="p-4 w-12 text-center">
                                            <input type="checkbox" className="w-4 h-4 text-black dark:text-white focus:ring-black dark:focus:ring-white cursor-pointer" checked={visibleDrafts.length > 0 && selectedKeys.size === visibleDrafts.length} onChange={toggleSelectAll} />
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
                                        <tr><td colSpan={7} className="p-8 text-center text-gray-400 dark:text-gray-500">暂无数据，点击上方"新增空行"开始填写。</td></tr>
                                    ) : visibleDrafts.map(draft => (
                                        <tr key={draft.key} className={`border-b-2 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors ${selectedKeys.has(draft.key) ? 'bg-swiss-red/5' : ''}`}>
                                            <td className="p-3 text-center">
                                                <input type="checkbox" className="w-4 h-4 text-black dark:text-white focus:ring-black dark:focus:ring-white cursor-pointer" checked={selectedKeys.has(draft.key)} onChange={() => toggleSelect(draft.key)} />
                                            </td>
                                            <td className="p-2">
                                                <input value={draft.name} onChange={e => updateDraft(draft.key, { name: e.target.value })} placeholder="物品名称" className="w-full bg-transparent border-0 focus:border-black dark:focus:border-white border-b-2 px-2 py-1.5 outline-none font-bold text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                                            </td>
                                            <td className="p-2">
                                                <select value={draft.category} onChange={e => updateDraft(draft.key, { category: e.target.value })} className="w-full border-2 border-black dark:border-white bg-transparent px-2 py-1.5 outline-none text-sm text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <select value={draft.locationId} onChange={e => updateDraft(draft.key, { locationId: e.target.value })} className="w-full border-2 border-black dark:border-white bg-transparent px-2 py-1.5 outline-none text-sm text-gray-600 dark:text-gray-300 transition-colors cursor-pointer" title="如需精细分配可在此选择。或者通过上方批量归类指定。">
                                                    <option value="">-- 未分配 --</option>
                                                    {rootRooms.map(room => (
                                                        <optgroup key={room.id} label={room.name}>
                                                            <option value={room.id}>📍 {room.name} (仅房间)</option>
                                                            {getSubLocations(room.id).map(sub => (<option key={sub.id} value={sub.id}>┖ {sub.name}</option>))}
                                                        </optgroup>
                                                    ))}
                                                    {locations.filter(l => l.type !== 'room' && !l.parentId).length > 0 && (
                                                        <optgroup label="其他收纳点">
                                                            {locations.filter(l => l.type !== 'room' && !l.parentId).map(sub => (<option key={sub.id} value={sub.id}>┖ {sub.name}</option>))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="1" value={draft.quantity} onChange={e => updateDraft(draft.key, { quantity: parseInt(e.target.value) || 1 })} className="w-16 bg-transparent border-2 border-black dark:border-white px-2 py-1.5 outline-none text-sm text-gray-800 dark:text-gray-100 font-medium text-center transition-colors" />
                                            </td>
                                            <td className="p-2">
                                                <input value={draft.description} onChange={e => updateDraft(draft.key, { description: e.target.value })} placeholder="追加备注 (可选)" className="w-full bg-transparent border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white border-b-2 px-2 py-1.5 outline-none text-sm text-gray-500 dark:text-gray-400 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                                            </td>
                                            <td className="p-2 text-center">
                                                {draft.status === 'unchanged' && <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                                                {draft.status === 'added' && <span className="inline-block border-2 border-black dark:border-white font-bold uppercase text-[10px] px-2 py-0.5">新增待存</span>}
                                                {draft.status === 'updated' && <span className="inline-block border-2 border-black dark:border-white font-bold uppercase text-[10px] px-2 py-0.5">已修改</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden flex flex-col divide-y-2 divide-black dark:divide-white">
                            <div className="p-3 bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white flex items-center justify-between sticky top-0 z-10">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-black dark:text-white focus:ring-black dark:focus:ring-white" checked={visibleDrafts.length > 0 && selectedKeys.size === visibleDrafts.length} onChange={toggleSelectAll} />
                                    {selectedKeys.size > 0 ? `已选 ${selectedKeys.size} 项` : '全选 / 取消全选'}
                                </label>
                            </div>
                            {visibleDrafts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">暂无数据，点击上方添加。</div>
                            ) : (
                                visibleDrafts.map(draft => (
                                    <div key={draft.key} className={`p-4 flex gap-3 transition-colors ${selectedKeys.has(draft.key) ? 'bg-swiss-red/5' : ''}`}>
                                        <div className="flex-shrink-0 pt-1">
                                            <input type="checkbox" className="w-4 h-4 text-black dark:text-white focus:ring-black dark:focus:ring-white" checked={selectedKeys.has(draft.key)} onChange={() => toggleSelect(draft.key)} />
                                        </div>
                                        <div className="flex-1 space-y-3 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <input value={draft.name} onChange={e => updateDraft(draft.key, { name: e.target.value })} placeholder="物品名称..." className="flex-1 bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white px-0 py-1 outline-none font-bold text-gray-800 dark:text-gray-100 text-base placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                                                <div className="flex-shrink-0 pt-1">
                                                    {draft.status === 'added' && <span className="inline-block border-2 border-black dark:border-white font-bold uppercase text-[10px] px-2 py-0.5">新增</span>}
                                                    {draft.status === 'updated' && <span className="inline-block border-2 border-black dark:border-white font-bold uppercase text-[10px] px-2 py-0.5">修改</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider">分类</label>
                                                    <select value={draft.category} onChange={e => updateDraft(draft.key, { category: e.target.value })} className="w-full border-2 border-black dark:border-white bg-transparent px-2 py-1.5 outline-none text-sm text-gray-700 dark:text-gray-200 font-medium">
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-20 flex-shrink-0">
                                                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider">数量</label>
                                                    <input type="number" min="1" value={draft.quantity} onChange={e => updateDraft(draft.key, { quantity: parseInt(e.target.value) || 1 })} className="w-full border-2 border-black dark:border-white bg-transparent px-2 py-1.5 outline-none text-sm text-center text-gray-800 dark:text-gray-100 font-bold" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> 存储位置
                                                </label>
                                                <select value={draft.locationId} onChange={e => updateDraft(draft.key, { locationId: e.target.value })} className="w-full border-2 border-black dark:border-white bg-transparent px-2 py-1.5 outline-none text-sm text-black dark:text-white font-medium">
                                                    <option value="">-- 未分配 --</option>
                                                    {rootRooms.map(room => (
                                                        <optgroup key={room.id} label={room.name}>
                                                            <option value={room.id}>📍 {room.name} (仅房间)</option>
                                                            {getSubLocations(room.id).map(sub => (<option key={sub.id} value={sub.id}>┖ {sub.name}</option>))}
                                                        </optgroup>
                                                    ))}
                                                    {locations.filter(l => l.type !== 'room' && !l.parentId).length > 0 && (
                                                        <optgroup label="其他收纳点">
                                                            {locations.filter(l => l.type !== 'room' && !l.parentId).map(sub => (<option key={sub.id} value={sub.id}>┖ {sub.name}</option>))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </div>
                                            <input value={draft.description} onChange={e => updateDraft(draft.key, { description: e.target.value })} placeholder="添加备注..." className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-black dark:focus:border-white px-0 py-1.5 outline-none text-xs text-gray-400 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-black/60 swiss-enter p-4">
                    <div className="bg-white dark:bg-black w-full max-w-sm border-2 border-black dark:border-white overflow-hidden flex flex-col">
                        <div className="p-5 border-b-2 border-black dark:border-white flex justify-between items-center bg-gray-100 dark:bg-gray-900">
                            <h2 className="text-lg font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                                批量归类 ({selectedKeys.size}项)
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="border-2 border-black dark:border-white p-2 transition-colors">
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold uppercase text-gray-700 dark:text-gray-300 mb-1 tracking-wider">重置分类为</label>
                                <select className="w-full border-2 border-black dark:border-white bg-transparent py-2 text-sm dark:text-gray-200" value={batchCategory} onChange={e => setBatchCategory(e.target.value)}>
                                    <option value="">-- 不修改分类 --</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-gray-700 dark:text-gray-300 mb-1 tracking-wider">移动至指定房间</label>
                                <select className="w-full border-2 border-black dark:border-white bg-transparent py-2 text-sm dark:text-gray-200" value={batchRoomId} onChange={e => { setBatchRoomId(e.target.value); setBatchLocationId(''); }}>
                                    <option value="">-- 不修改房间 --</option>
                                    <option value="none">-- 移出位置 (置空) --</option>
                                    {rootRooms.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            {batchRoomId && batchRoomId !== 'none' && (
                                <div>
                                    <label className="block text-sm font-bold uppercase text-gray-700 dark:text-gray-300 mb-1 tracking-wider">存入房间内具体收纳</label>
                                    <select className="w-full border-2 border-black dark:border-white bg-transparent py-2 text-sm dark:text-gray-200" value={batchLocationId} onChange={e => setBatchLocationId(e.target.value)}>
                                        <option value="">-- （仅暂存房间） --</option>
                                        {getSubLocations(batchRoomId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-950 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold uppercase border-2 border-black dark:border-white text-gray-700 dark:text-gray-400 hover:bg-black hover:text-white">
                                取消
                            </button>
                            <Button onClick={applyBatchEdit} variant="primary" size="sm">
                                确认应用
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
