import ConfirmDialog from '../components/ConfirmDialog';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_CATEGORIES } from '../types';
import { useState } from 'react';
import { ButtonLink, Card } from '../components/ui';
import Spinner from '../components/ui/Spinner';

export default function Items() {
  const { items, locations, deleteItem, searchQuery, canEdit, dataLoaded } = useStore();
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

    if (days < 0) return { text: `已过期 ${Math.abs(days)} 天`, dot: 'bg-swiss-red' };
    if (days <= 30) return { text: `还剩 ${days} 天`, dot: 'bg-swiss-red' };
    return { text: `还剩 ${Math.floor(days / 30)} 个月`, dot: 'bg-gray-400' };
  };

  const getExpiryColor = (dateStr?: string) => {
    if (!dateStr) return 'text-gray-500 dark:text-gray-400';
    const expiry = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'text-swiss-red';
    if (days <= 30) return 'text-black dark:text-white';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="space-y-6 swiss-enter max-w-4xl mx-auto">
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="删除物品"
        message={`确定要删除"${deleteTarget?.name}"吗？此操作无法撤回。`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">物品管理</h2>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{items.length} 件物品</p>
        </div>
        {canEdit() && (
          <ButtonLink to="/items/new" variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            添加物品
          </ButtonLink>
        )}
      </div>

      {/* 分类过滤 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-4 py-2 text-sm whitespace-nowrap font-bold uppercase tracking-wide transition-all border-2 border-black dark:border-white ${!selectedCat ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
            }`}
        >
          全部
        </button>
        {DEFAULT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
            className={`px-4 py-2 text-sm whitespace-nowrap font-bold uppercase tracking-wide transition-all border-2 border-black dark:border-white ${selectedCat === cat ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {!dataLoaded ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 mx-auto border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center mb-4">
            {searchQuery || selectedCat ? <Search className="w-10 h-10 text-gray-300 dark:text-gray-500" /> : <Package className="w-10 h-10 text-gray-300 dark:text-gray-500" />}
          </div>
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">
            {searchQuery || selectedCat ? '未找到匹配物品' : '还没有添加物品'}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            {searchQuery || selectedCat ? '试试其他关键词或分类' : '点击上方按钮开始添加'}
          </p>
          {!searchQuery && !selectedCat && (
            <ButtonLink to="/items/new" variant="primary" size="sm" className="mx-auto">添加第一个物品</ButtonLink>
          )}
        </Card>
      ) : (
        <div className="space-y-5">
          {itemsByLocation.map(({ location, items }) => (
            <Card key={location.id}>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-black dark:text-white">
                <span className="w-3 h-3 bg-black dark:bg-white" />
                {location.name}
                <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 group transition-all">
                    <Link to={`/items/${item.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                      {item.imageUrl ? (
                        <div
                          className="w-10 h-10 border-2 border-black dark:border-white bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center text-xl flex-shrink-0 text-gray-400 dark:text-gray-500">
                          📦
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-bold text-black dark:text-white truncate">{item.name}</p>
                          {item.expiryDate && (() => {
                            const l = getExpiryLabel(item.expiryDate);
                            return l ? <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold border-2 border-black dark:border-white ${getExpiryColor(item.expiryDate)}`}><span className={`w-1.5 h-1.5 ${l.dot}`}></span>{l.text}</span> : null;
                          })()}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} · x{item.quantity}</p>
                      </div>
                    </Link>
                    {canEdit() && (
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0">
                        <Link to={`/items/${item.id}`} className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all pointer-events-auto">
                          <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </Link>
                        <button onClick={(e) => { e.preventDefault(); setDeleteTarget({ id: item.id, name: item.name }) }} className="p-2 border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white transition-all pointer-events-auto">
                          <Trash2 className="w-4 h-4 text-swiss-red" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* 未分配 */}
          {unassignedItems.length > 0 && (
            <Card>
              <h3 className="font-bold mb-4 text-gray-400 dark:text-gray-500 flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-300 dark:bg-gray-600" />
                未分配位置
                <span className="text-sm font-normal">({unassignedItems.length})</span>
              </h3>
              <div className="space-y-2">
                {unassignedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 group transition-all">
                    <Link to={`/items/${item.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                      {item.imageUrl ? (
                        <div
                          className="w-10 h-10 border-2 border-black dark:border-white bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center text-xl flex-shrink-0 text-gray-400 dark:text-gray-500">
                          📦
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-bold text-black dark:text-white truncate">{item.name}</p>
                          {item.expiryDate && (() => {
                            const l = getExpiryLabel(item.expiryDate);
                            return l ? <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold border-2 border-black dark:border-white ${getExpiryColor(item.expiryDate)}`}><span className={`w-1.5 h-1.5 ${l.dot}`}></span>{l.text}</span> : null;
                          })()}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} · x{item.quantity}</p>
                      </div>
                    </Link>
                    {canEdit() && (
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0">
                        <Link to={`/items/${item.id}`} className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all pointer-events-auto">
                          <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </Link>
                        <button onClick={(e) => { e.preventDefault(); setDeleteTarget({ id: item.id, name: item.name }) }} className="p-2 border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white transition-all pointer-events-auto">
                          <Trash2 className="w-4 h-4 text-swiss-red" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
