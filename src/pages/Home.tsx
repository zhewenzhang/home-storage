import { Link } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Home() {
  const { 
    locations, 
    items, 
    floorPlan,
    selectedLocationId, 
    setSelectedLocationId,
    searchQuery 
  } = useStore();

  // 过滤显示的物品
  const filteredItems = searchQuery
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.includes(searchQuery)
      )
    : items;

  // 选中的位置
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
          <div className="floor-plan-area flex items-center justify-center">
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
            className="floor-plan-area relative"
            style={{ 
              height: floorPlan ? `${Math.min(400, (floorPlan.height / floorPlan.width) * 100)}%` : '400px' 
            }}
          >
            {/* 绘制位置区域 */}
            {locations.map((location) => (
              <div
                key={location.id}
                className={`location-marker ${selectedLocationId === location.id ? 'selected' : ''}`}
                style={{
                  left: `${(location.bounds.x / (floorPlan?.width || 800)) * 100}%`,
                  top: `${(location.bounds.y / (floorPlan?.height || 600)) * 100}%`,
                  width: `${(location.bounds.width / (floorPlan?.width || 800)) * 100}%`,
                  height: `${(location.bounds.height / (floorPlan?.height || 600)) * 100}%`,
                }}
                onClick={() => setSelectedLocationId(
                  selectedLocationId === location.id ? null : location.id
                )}
              >
                <span className="px-2 truncate">{location.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Location Items */}
      {selectedLocation && (
        <div className="card animate-slideUp">
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
