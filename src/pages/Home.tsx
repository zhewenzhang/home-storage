import { Link } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';


// 收纳标记类型
const CABINET_TYPES: Record<string, { icon: string; color: string }> = {
  cabinet: { icon: '🗄️', color: '#8B6D4B' },
  wardrobe: { icon: '👔', color: '#6B5E8B' },
  shelf: { icon: '📚', color: '#5E6B8B' },
  drawer: { icon: '🗃️', color: '#6B8B5E' },
  box: { icon: '📦', color: '#8B8B5E' },
};

export default function Home() {
  const {
    locations,
    items,
    selectedLocationId,
    setSelectedLocationId,
    searchQuery
  } = useStore();

  const roomLocations = useMemo(() => locations.filter(l => l.type === 'room'), [locations]);
  const cabinetLocations = useMemo(() => locations.filter(l => l.type !== 'room'), [locations]);

  // 获取用户名
  const [userName, setUserName] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) return;

      // 优先从 profiles 表读取
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', u.id)
        .single();

      const name = profile?.display_name
        || u.user_metadata?.display_name
        || u.email?.split('@')[0]
        || '';
      setUserName(name);
    });
  }, []);

  // 搜索过滤
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.includes(q)
    );
  }, [items, searchQuery]);

  // 搜索高亮的位置 IDs（包括收纳标记及其父房间）
  const matchedLocationIds = useMemo(() => {
    if (!searchQuery) return new Set<string>();
    const ids = new Set<string>();
    for (const item of filteredItems) {
      if (item.locationId) {
        ids.add(item.locationId);
        // 如果匹配的是收纳标记，也高亮其父房间
        const loc = locations.find(l => l.id === item.locationId);
        if (loc?.parentId) ids.add(loc.parentId);
      }
    }
    return ids;
  }, [searchQuery, filteredItems, locations]);

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  const displayItems = searchQuery
    ? filteredItems
    : (selectedLocationId
      ? items.filter(i => i.locationId === selectedLocationId)
      : items.slice(-10) // 最近10个
    );

  const sortedDisplayItems = useMemo(() => [...displayItems].reverse(), [displayItems]);

  return (
    <div className="space-y-6 md:space-y-8 animate-enter pb-20">

      {/* 电脑端才显示的超级大欢迎卡片 */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            Hi {userName || 'there'} 👋
          </h2>
          <p className="opacity-80 text-sm mt-1 text-gray-500">让每一个物品都有家可归</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 border-r border-gray-100">
            <p className="text-3xl font-extrabold text-[#2A4D63]">{items.length}</p>
            <p className="text-xs text-gray-400 font-bold tracking-wider mt-1">在库物品</p>
          </div>
          <div className="text-center px-6">
            <p className="text-3xl font-extrabold text-[#2A4D63]">{locations.length}</p>
            <p className="text-xs text-gray-400 font-bold tracking-wider mt-1">存储位置</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* 左侧：平面图 (移动端排第一视点) */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: '#3B6D8C' }} />
              {searchQuery ? '搜索定位' : '家庭平面图'}
            </h3>
            <div className="flex gap-2">
              {/* 移动端专属的快捷操作入口 (横滑小胶囊) */}
              <div className="md:hidden flex items-center gap-2 mr-2">
                <div className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-600">
                  📦 {items.length}
                </div>
                <div className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-600">
                  📍 {locations.length}
                </div>
              </div>
              <Link to="/floorplan" className="text-xs md:text-sm font-bold flex items-center gap-1 bg-white px-2 md:px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all text-[#3B6D8C]">
                编辑户型 <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </div>
          </div>


          <div className="card p-1 min-h-[400px]">
            {locations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 min-h-[400px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-gray-300" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-600">还没有绘图</h4>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">绘制家庭平面图，开始可视化管理您的物品位置</p>
                </div>
                <Link to="/floorplan" className="btn-primary">开始绘制</Link>
              </div>
            ) : (
              (() => {
                const allLocs = locations.filter(l => l.bounds.x >= 0); // 排除隐藏位置
                if (allLocs.length === 0) return <div className="h-[400px] flex items-center justify-center text-gray-400">无可显示内容</div>;

                const allX = allLocs.map(l => l.bounds.x);
                const allY = allLocs.map(l => l.bounds.y);
                const allR = allLocs.map(l => l.bounds.x + l.bounds.width);
                const allB = allLocs.map(l => l.bounds.y + l.bounds.height);

                const PADDING = 60;
                const viewX = Math.min(...allX) - PADDING;
                const viewY = Math.min(...allY) - PADDING;
                const viewW = Math.max(400, Math.max(...allR) - Math.min(...allX) + PADDING * 2);
                const viewH = Math.max(300, Math.max(...allB) - Math.min(...allY) + PADDING * 2);

                return (
                  <div className="w-full h-[450px] flex items-center justify-center overflow-hidden rounded-2xl relative" style={{ backgroundColor: '#F8F6F0' }}>
                    <svg width="100%" height="100%" viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`} preserveAspectRatio="xMidYMid meet">
                      {/* === 房间层（建筑图风格） === */}
                      {roomLocations.map(location => {
                        const isSelected = selectedLocationId === location.id;
                        const isMatched = matchedLocationIds.has(location.id);
                        const isDimmed = !!searchQuery && !isMatched;
                        const b = location.bounds;
                        const SCALE = 0.3 / 20; // GRID_SIZE=20
                        const wM = (b.width * SCALE).toFixed(2);
                        const hM = (b.height * SCALE).toFixed(2);
                        const area = (b.width * SCALE * b.height * SCALE).toFixed(1);
                        const WALL = 3;

                        return (
                          <g
                            key={location.id}
                            onClick={() => setSelectedLocationId(isSelected ? null : location.id)}
                            style={{ cursor: 'pointer', opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.3s' }}
                          >
                            {/* 搜索/选中高亮 */}
                            {(isSelected || isMatched) && (
                              <rect x={b.x - 6} y={b.y - 6} width={b.width + 12} height={b.height + 12}
                                fill="none" stroke={isMatched ? '#EF4444' : '#2563EB'}
                                strokeWidth="3" opacity="0.5" className="animate-pulse"
                              />
                            )}
                            {/* 墙体 */}
                            <rect x={b.x} y={b.y} width={b.width} height={b.height}
                              fill="#FFFFFF"
                              stroke={isSelected || isMatched ? (isMatched ? '#EF4444' : '#2563EB') : '#3A3A3A'}
                              strokeWidth={WALL}
                            />
                            {/* 房间名 + 面积 */}
                            <text x={b.x + b.width / 2} y={b.y + b.height / 2 - 6}
                              textAnchor="middle" fontSize="13" fontWeight="700" fill="#3A3A3A"
                              style={{ pointerEvents: 'none' }}
                            >
                              {location.name}
                            </text>
                            <text x={b.x + b.width / 2} y={b.y + b.height / 2 + 12}
                              textAnchor="middle" fontSize="11" fontWeight="600" fill="#999"
                              style={{ pointerEvents: 'none' }}
                            >
                              {area}m²
                            </text>
                            {/* 尺寸标注 — 顶部 */}
                            <text x={b.x + b.width / 2} y={b.y - 8}
                              textAnchor="middle" fontSize="9" fill="#888" fontFamily="monospace"
                              style={{ pointerEvents: 'none' }}
                            >
                              {wM}m
                            </text>
                            {/* 尺寸标注 — 左侧 */}
                            <text x={b.x - 8} y={b.y + b.height / 2}
                              textAnchor="middle" fontSize="9" fill="#888" fontFamily="monospace"
                              transform={`rotate(-90 ${b.x - 8} ${b.y + b.height / 2})`}
                              style={{ pointerEvents: 'none' }}
                            >
                              {hM}m
                            </text>
                          </g>
                        );
                      })}

                      {/* === 收纳标记层（圆点） === */}
                      {cabinetLocations.filter(l => l.bounds.x >= 0).map(location => {
                        const config = CABINET_TYPES[(location as any).roomType as keyof typeof CABINET_TYPES] || CABINET_TYPES.cabinet;
                        const isMatched = matchedLocationIds.has(location.id);
                        const isSelected = selectedLocationId === location.id;
                        const isDimmed = !!searchQuery && !isMatched;
                        const cx = location.bounds.x + 16;
                        const cy = location.bounds.y + 16;
                        const r = 14;

                        return (
                          <g
                            key={location.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedLocationId(isSelected ? null : location.id); }}
                            style={{ cursor: 'pointer', opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.3s' }}
                          >
                            {/* 搜索高亮光环 */}
                            {isMatched && (
                              <circle cx={cx} cy={cy} r={r + 6}
                                fill="none" stroke="#EF4444" strokeWidth="2" className="animate-pulse"
                              />
                            )}
                            {/* 圆点 */}
                            <circle cx={cx} cy={cy} r={r}
                              fill={isSelected ? '#3B82F6' : config.color}
                              stroke="white" strokeWidth="2"
                            />
                            {/* 图标 */}
                            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" style={{ pointerEvents: 'none' }}>
                              {config.icon}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()
            )}
          </div>

          <div className="rounded-xl p-4 text-xs flex gap-2" style={{ backgroundColor: 'rgba(59,109,140,0.06)', color: 'rgba(59,109,140,0.8)' }}>
            <span className="font-bold">提示:</span>
            {searchQuery ? '地图上高亮显示的区域包含您搜索的物品，虚线框标记为收纳位置。' : '点击房间/收纳标记可查看其中的物品详情。'}
          </div>
        </div>

        {/* 右侧：物品列表 (移动端放在地图下方) */}
        <div className="lg:col-span-1 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              {searchQuery ? `"${searchQuery}" 的结果` : (selectedLocation ? selectedLocation.name : '最近添加')}
            </h3>
            {selectedLocationId && !searchQuery && (
              <button onClick={() => setSelectedLocationId(null)} className="text-xs text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 px-2 py-1 rounded-md">
                显示全部
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {sortedDisplayItems.length === 0 ? (
              <div className="text-center py-20 space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-500">{searchQuery ? '未找到相关物品' : '暂无物品'}</h4>
                  <p className="text-sm text-gray-400">{searchQuery ? '换个关键词试试？' : '点击左侧房间或添加物品'}</p>
                </div>
                {!searchQuery && selectedLocationId && (
                  <Link to={`/items/new?locationId=${selectedLocationId}`} className="btn-primary text-sm py-2 px-4 mt-2">
                    <Plus className="w-4 h-4" /> 放入物品
                  </Link>
                )}
              </div>
            ) : (
              sortedDisplayItems.slice(0, 50).map(item => (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-900 truncate group-hover:text-[#3B6D8C] transition-colors text-lg leading-tight">{item.name}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(59,109,140,0.1)', color: '#2A4D63' }}>x{item.quantity}</span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{item.category}</span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {locations.find(l => l.id === item.locationId)?.name || '未分配'}
                      </span>
                    </p>
                  </div>
                </Link>
              ))
            )}

            {!searchQuery && !selectedLocationId && items.length > 10 && (
              <div className="text-center pt-4">
                <Link to="/items" className="text-sm font-bold transition-colors inline-block px-4 py-2 rounded-xl" style={{ color: '#3B6D8C', backgroundColor: 'rgba(59,109,140,0.06)' }}>
                  查看全部物品 →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
