import { Link } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

// 房间类型配置 - 与 FloorPlan 页面一致
const ROOM_TYPES = {
  living: { name: '客厅', color: '#F5F0E8', border: '#8B7355', icon: '🛋️' },
  bedroom: { name: '卧室', color: '#E8EEF5', border: '#6B8BA4', icon: '🛏️' },
  kitchen: { name: '厨房', color: '#FFF5E6', border: '#C49A6C', icon: '🍳' },
  bathroom: { name: '卫生间', color: '#E8F5E9', border: '#6B9B7A', icon: '🚿' },
  balcony: { name: '阳台', color: '#E8F4E8', border: '#7AA37A', icon: '🌿' },
  study: { name: '书房', color: '#F0EDF5', border: '#8B7AA4', icon: '📚' },
};

export default function Home() {
  const { 
    locations, 
    items, 
    floorPlan,
    selectedLocationId, 
    setSelectedLocationId,
    searchQuery 
  } = useStore();

  const filteredItems = searchQuery
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.includes(searchQuery)
      )
    : items;

  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const selectedLocationItems = selectedLocationId 
    ? filteredItems.filter(item => item.locationId === selectedLocationId)
    : [];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-sm text-gray-500">物品总数</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{locations.length}</p>
            <p className="text-sm text-gray-500">存储位置</p>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <Link to="/items/new" className="card flex items-center justify-center gap-2 py-4 border-primary/20 border-dashed">
        <Plus className="w-5 h-5 text-primary" />
        <span className="font-medium text-primary">添加新物品</span>
      </Link>

      {/* Floor Plan */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">家庭平面图</h2>
          <Link to="/floorplan" className="text-sm text-primary flex items-center gap-1">
            编辑 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {locations.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center" style={{ height: '300px' }}>
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-3">还没有添加位置</p>
              <Link to="/floorplan" className="btn-primary text-sm">
                去添加位置
              </Link>
            </div>
          </div>
        ) : (
          <div 
            className="relative bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden"
            style={{ height: '300px' }}
          >
            {/* 绘制位置区域 - 使用与 FloorPlan 相同的样式 */}
            {locations.map((location) => {
              const config = ROOM_TYPES[(location as any).roomType as keyof typeof ROOM_TYPES] || { border: '#8B7355', icon: '📍' };
              const isSelected = selectedLocationId === location.id;
              
              return (
                <div
                  key={location.id}
                  className={`absolute rounded-lg cursor-pointer flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-primary/30'
                  }`}
                  style={{
                    left: `${(location.bounds.x / (floorPlan?.width || 800)) * 100}%`,
                    top: `${(location.bounds.y / (floorPlan?.height || 600)) * 100}%`,
                    width: `${(location.bounds.width / (floorPlan?.width || 800)) * 100}%`,
                    height: `${(location.bounds.height / (floorPlan?.height || 600)) * 100}%`,
                    background: `linear-gradient(135deg, ${config.color || '#F5F0E8'} 0%, ${config.color ? config.color + 'CC' : '#E8E0D5'} 100%)`,
                    border: `2px solid ${isSelected ? '#3B82F6' : config.border}`,
                  }}
                  onClick={() => setSelectedLocationId(
                    selectedLocationId === location.id ? null : location.id
                  )}
                >
                  <span style={{ color: config.border }}>{config.icon} {location.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Location Items */}
      {selectedLocation && (
        <div className="card animate-slideUp border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {selectedLocation.name} 的物品 ({selectedLocationItems.length})
            </h3>
            <button 
              onClick={() => setSelectedLocationId(null)}
              className="text-sm text-gray-500"
            >
              清除
            </button>
          </div>
          
          {selectedLocationItems.length === 0 ? (
            <p className="text-gray-400 text-center py-4">这个位置还没有物品</p>
          ) : (
            <div className="space-y-2">
              {selectedLocationItems.map(item => (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <span className="text-sm text-gray-400">x{item.quantity}</span>
                </Link>
              ))}
            </div>
          )}
          
          <Link 
            to={`/items/new?locationId=${selectedLocationId}`}
            className="mt-3 w-full btn-primary text-center block"
          >
            在这里添加物品
          </Link>
        </div>
      )}

      {/* Recent Items */}
      {!selectedLocationId && filteredItems.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">最近添加</h3>
          <div className="space-y-2">
            {filteredItems.slice(-5).reverse().map(item => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
