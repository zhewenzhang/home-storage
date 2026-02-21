import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Plus, Upload, Save, Settings2, Database, X } from 'lucide-react';
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

    // 批量修改弹窗状态
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [batchCategory, setBatchCategory] = useState('');
    const [batchLocationId, setBatchLocationId] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                return {
                    ...d,
                    status: newStatus,
                    category: batchCategory || d.category,
                    locationId: batchLocationId === 'none' ? '' : (batchLocationId || d.locationId)
                };
            }
            return d;
        }));
        setIsEditModalOpen(false);
        setBatchCategory('');
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
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#2A4D63' }}>
                        <Database className="w-6 h-6" />
                        批量数据管理
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        你可以在这里像使用表格一样快速修改、新增、删除物品或进行批量归类，最后统一存档保存。
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* 操作区 */}
                    <input
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        CSV导入
                    </button>
                    <button
                        onClick={handleAddRow}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        新增空行
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        disabled={selectedKeys.size === 0}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-medium text-indigo-700 hover:bg-indigo-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Settings2 className="w-4 h-4" />
                        批量归类 ({selectedKeys.size})
                    </button>
                    <button
                        onClick={handleBatchDelete}
                        disabled={selectedKeys.size === 0}
                        className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        删除选中 ({selectedKeys.size})
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-all flex items-center gap-2 ml-auto md:ml-0"
                        style={{ backgroundColor: '#2A4D63' }}
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? '存档中...' : '提交批量更改'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-[#3B6D8C] focus:ring-[#3B6D8C]"
                                        checked={visibleDrafts.length > 0 && selectedKeys.size === visibleDrafts.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4">物品名称</th>
                                <th className="p-4 w-40">分类</th>
                                <th className="p-4 w-48">所属位置</th>
                                <th className="p-4 w-24">数量</th>
                                <th className="p-4">描述备注</th>
                                <th className="p-4 w-24 text-center">修改状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleDrafts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        暂无数据，点击上方“新增空行”开始填写。
                                    </td>
                                </tr>
                            ) : visibleDrafts.map(draft => (
                                <tr key={draft.key} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selectedKeys.has(draft.key) ? 'bg-[#3B6D8C]/5' : ''}`}>
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-[#3B6D8C] focus:ring-[#3B6D8C]"
                                            checked={selectedKeys.has(draft.key)}
                                            onChange={() => toggleSelect(draft.key)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={draft.name}
                                            onChange={e => updateDraft(draft.key, { name: e.target.value })}
                                            placeholder="物品名称"
                                            className="w-full bg-transparent border-0 focus:ring-2 focus:ring-[#3B6D8C]/30 rounded-md px-2 py-1 outline-none font-medium text-gray-700"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={draft.category}
                                            onChange={e => updateDraft(draft.key, { category: e.target.value })}
                                            className="w-full bg-transparent border-0 focus:ring-2 focus:ring-[#3B6D8C]/30 rounded-md px-2 py-1 outline-none text-sm text-gray-600"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={draft.locationId}
                                            onChange={e => updateDraft(draft.key, { locationId: e.target.value })}
                                            className="w-full bg-transparent border-0 focus:ring-2 focus:ring-[#3B6D8C]/30 rounded-md px-2 py-1 outline-none text-sm text-gray-600"
                                        >
                                            <option value="">-- 未分配 --</option>
                                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={draft.quantity}
                                            onChange={e => updateDraft(draft.key, { quantity: parseInt(e.target.value) || 1 })}
                                            className="w-16 bg-transparent border-0 focus:ring-2 focus:ring-[#3B6D8C]/30 rounded-md px-2 py-1 outline-none text-sm text-gray-600 text-center"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={draft.description}
                                            onChange={e => updateDraft(draft.key, { description: e.target.value })}
                                            placeholder="备注信息"
                                            className="w-full bg-transparent border-0 focus:ring-2 focus:ring-[#3B6D8C]/30 rounded-md px-2 py-1 outline-none text-sm text-gray-500"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        {draft.status === 'unchanged' && <span className="text-gray-300 text-xs">—</span>}
                                        {draft.status === 'added' && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">新增待存</span>}
                                        {draft.status === 'updated' && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">已修改</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 批量修改弹窗 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-enter">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2A4D63' }}>
                                批量归类 ({selectedKeys.size}项)
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">重置分类为</label>
                                <select
                                    className="input-field py-2 w-full text-sm"
                                    value={batchCategory}
                                    onChange={e => setBatchCategory(e.target.value)}
                                >
                                    <option value="">-- 不修改分类 --</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">移动至位置</label>
                                <select
                                    className="input-field py-2 w-full text-sm"
                                    value={batchLocationId}
                                    onChange={e => setBatchLocationId(e.target.value)}
                                >
                                    <option value="">-- 不修改位置 --</option>
                                    <option value="none">-- 移出位置 (置空) --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={applyBatchEdit}
                                className="px-4 py-2 text-sm text-white rounded-xl transition-all shadow-md"
                                style={{ backgroundColor: '#2A4D63' }}
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
