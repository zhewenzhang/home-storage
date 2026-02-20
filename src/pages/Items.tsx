import { Link } from 'react-router-dom';
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
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-enter"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary flex-1">取消</button>
          <button onClick={onConfirm} className="flex-1 px-6 py-3 rounded-2xl font-bold text-white transition-all" style={{ backgroundColor: '#EF4444' }}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Items() {
  const { items, locations, deleteItem, searchQuery } = useStore();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 过滤
  const filteredItems = items.filter(item => {
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.includes(searchQuery);
    const matchCat = !selectedCat || item.category === selectedCat;
    return matchSearch && matchCat;
  });

  // 按位置分组
  const itemsByLocation = locations.map(loc => ({
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
          <h2 className="text-2xl font-bold">物品管理</h2>
          <p className="text-sm text-gray-500 mt-1">{items.length} 件物品</p>
        </div>
        <Link to="/items/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          添加物品
        </Link>
      </div>

      {/* 分类过滤 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-bold transition-all border ${!selectedCat ? 'bg-[#3B6D8C] text-white border-[#3B6D8C] shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
        >
          全部
        </button>
        {DEFAULT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-bold transition-all border ${selectedCat === cat ? 'bg-[#3B6D8C] text-white border-[#3B6D8C] shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
            {searchQuery || selectedCat ? <Search className="w-10 h-10 text-gray-300" /> : <Package className="w-10 h-10 text-gray-300" />}
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">
            {searchQuery || selectedCat ? '未找到匹配物品' : '还没有添加物品'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
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
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B6D8C' }} />
                {location.name}
                <span className="text-sm text-gray-400 font-normal">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 group hover:bg-gray-100 transition-all">
                    <Link to={`/items/${item.id}`} className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category} · x{item.quantity}</p>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/items/${item.id}`} className="p-2 rounded-xl hover:bg-white transition-all">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </Link>
                      <button onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="p-2 rounded-xl hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 未分配 */}
          {unassignedItems.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-4 text-gray-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300" />
                未分配位置
                <span className="text-sm font-normal">({unassignedItems.length})</span>
              </h3>
              <div className="space-y-2">
                {unassignedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 group hover:bg-gray-100 transition-all">
                    <Link to={`/items/${item.id}`} className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category} · x{item.quantity}</p>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/items/${item.id}`} className="p-2 rounded-xl hover:bg-white">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </Link>
                      <button onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="p-2 rounded-xl hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
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
