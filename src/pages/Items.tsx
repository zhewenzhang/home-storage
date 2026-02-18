import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_CATEGORIES } from '../types';

export default function Items() {
  const { items, locations, deleteItem, searchQuery } = useStore();

  // 按位置分组
  const itemsByLocation = locations.map(loc => ({
    location: loc,
    items: items.filter(item => item.locationId === loc.id)
  })).filter(group => group.items.length > 0);

  // 未分配物品
  const unassignedItems = items.filter(item => !item.locationId);

  // 过滤
  const filteredItems = searchQuery
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.includes(searchQuery)
      )
    : items;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">物品管理</h2>
        <Link to="/items/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DEFAULT_CATEGORIES.map(cat => (
          <button
            key={cat}
            className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm whitespace-nowrap hover:border-primary transition-all"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Table - Mobile Card View */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">还没有添加物品</p>
          <Link to="/items/new" className="btn-primary">
            添加第一个物品
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* By Location */}
          {itemsByLocation.map(({ location, items }) => (
            <div key={location.id} className="card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                {location.name}
                <span className="text-sm text-gray-400">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 group"
                  >
                    <Link to={`/items/${item.id}`} className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category} · x{item.quantity}</p>
                    </Link>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/items/${item.id}`}
                        className="p-2 rounded-lg hover:bg-gray-200"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Link>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Unassigned */}
          {unassignedItems.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3 text-gray-500">未分配位置</h3>
              <div className="space-y-2">
                {unassignedItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 group"
                  >
                    <Link to={`/items/${item.id}`} className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category} · x{item.quantity}</p>
                    </Link>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/items/${item.id}`}
                        className="p-2 rounded-lg hover:bg-gray-200"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Link>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
