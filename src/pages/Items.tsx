import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, Package, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_CATEGORIES } from '../types';
import { useState } from 'react';

// 确认对话框
function ConfirmDialog({
  open, title, message, onConfirm, onCancel
}: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-enter border border-transparent dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary flex-1">取消</button>
          <button onClick={onConfirm} className="flex-1 px-6 py-3 rounded-2xl font-bold text-white transition-all bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm border-none">
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Items() {
  const { items, locations, deleteItem, searchQuery, canEdit } = useStore();
  const [searchParams] = useSearchParams();
  const filterLocationId = searchParams.get('locationId');

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 过滤
  const filteredItems = items.filter(item => {
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.includes(searchQuery);
    const matchCat = !selectedCat || item.category === selectedCat;
    const matchLocation = !filterLocationId || item.locationId === filterLocationId;
    return matchSearch && matchCat && matchLocation;
  });

  // 按位置分组
  const itemsByLocation = locations
    .filter(loc => !filterLocationId || loc.id === filterLocationId)
    .map(loc => ({
      location: loc,
      items: filteredItems.filter(item => item.locationId === loc.id)
    })).filter(group => group.items.length > 0);

  const unassignedItems = filteredItems.filter(item => !item.locationId);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteItem(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const getExpiryLabel = (dateStr?: string) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    const days = Math.ceil(diff / (1000 * 3600 * 24));

    if (days < 0) return { text: `已过期 ${Math.abs(days)} 天`, color: 'bg-red-100 text-red-600', dot: 'bg-red-500' };
    if (days <= 30) return { text: `还剩 ${days} 天`, color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' };
    return { text: `还剩 ${Math.floor(days / 30)} 个月`, color: 'bg-green-50 text-green-600', dot: 'bg-green-500' };
  };

  return (
    <div className="space-y-6 animate-enter max-w-3xl mx-auto">
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除物品"
        message={`确定要删除"${deleteTarget?.name}"吗？此操作无法撤回。`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-gray-100">物品管理</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{items.length} 件物品</p>
        </div>
        {canEdit() && (
          <Link to="/items/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            添加物品
          </Link>
        )}
      </div>

      {/* 分类过滤 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-bold transition-all border ${!selectedCat ? 'bg-primary dark:bg-blue-600 text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
        >
          全部
        </button>
        {DEFAULT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-bold transition-all border ${selectedCat === cat ? 'bg-primary dark:bg-blue-600 text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center mb-4 border border-transparent dark:border-slate-700">
            {searchQuery || selectedCat ? <Search className="w-10 h-10 text-gray-300 dark:text-gray-500" /> : <Package className="w-10 h-10 text-gray-300 dark:text-gray-500" />}
          </div>
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">
            {searchQuery || selectedCat ? '未找到匹配物品' : '还没有添加物品'}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            {searchQuery || selectedCat ? '试试其他关键词或分类' : '点击上方按钮开始添加'}
          </p>
          {!searchQuery && !selectedCat && (
            <Link to="/items/new" className="btn-primary mx-auto">添加第一个物品</Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {itemsByLocation.map(({ location, items }) => (
            <div key={location.id} className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <span className="w-3 h-3 rounded-full bg-primary dark:bg-blue-500" />
                {location.name}
                <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-900 group transition-all border border-transparent dark:border-slate-800">
                    <Link to={`/items/${item.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                      {item.imageUrl ? (
                        <div
                          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl flex-shrink-0 text-gray-400 dark:text-gray-500">
                          📦
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                          {item.expiryDate && (() => {
                            const l = getExpiryLabel(item.expiryDate);
                            return l ? <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${l.color}`}><span className={`w-1.5 h-1.5 rounded-full ${l.dot}`}></span>{l.text}</span> : null;
                          })()}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} · x{item.quantity}</p>
                      </div>
                    </Link>
                    {canEdit() && (
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0">
                        <Link to={`/items/${item.id}`} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all bg-white md:bg-transparent dark:bg-slate-800 md:dark:bg-transparent shadow-sm md:shadow-none pointer-events-auto">
                          <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </Link>
                        <button onClick={(e) => { e.preventDefault(); setDeleteTarget({ id: item.id, name: item.name }) }} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all bg-white md:bg-transparent dark:bg-slate-800 md:dark:bg-transparent shadow-sm md:shadow-none pointer-events-auto">
                          <Trash2 className="w-4 h-4 text-red-400 dark:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 未分配 */}
          {unassignedItems.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-4 text-gray-400 dark:text-gray-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                未分配位置
                <span className="text-sm font-normal">({unassignedItems.length})</span>
              </h3>
              <div className="space-y-2">
                {unassignedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-900 group transition-all border border-transparent dark:border-slate-800">
                    <Link to={`/items/${item.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                      {item.imageUrl ? (
                        <div
                          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl flex-shrink-0 text-gray-400 dark:text-gray-500">
                          📦
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                          {item.expiryDate && (() => {
                            const l = getExpiryLabel(item.expiryDate);
                            return l ? <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${l.color}`}><span className={`w-1.5 h-1.5 rounded-full ${l.dot}`}></span>{l.text}</span> : null;
                          })()}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} · x{item.quantity}</p>
                      </div>
                    </Link>
                    {canEdit() && (
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0">
                        <Link to={`/items/${item.id}`} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all bg-white md:bg-transparent dark:bg-slate-800 md:dark:bg-transparent shadow-sm md:shadow-none pointer-events-auto">
                          <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </Link>
                        <button onClick={(e) => { e.preventDefault(); setDeleteTarget({ id: item.id, name: item.name }) }} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all bg-white md:bg-transparent dark:bg-slate-800 md:dark:bg-transparent shadow-sm md:shadow-none pointer-events-auto">
                          <Trash2 className="w-4 h-4 text-red-400 dark:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
