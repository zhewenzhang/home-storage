import { Link } from 'react-router-dom';
import { Plus, Package, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';
import ExpirationWarning from '../components/ExpirationWarning';
import { ButtonLink, Card } from '../components/ui';


const ROOM_TYPES: Record<string, { name: string; fill: string; wallColor: string; icon: string }> = {
  living: { name: '客厅', fill: '#FAFAF5', wallColor: '#6B6B5E', icon: '🛋️' },
  bedroom: { name: '卧室', fill: '#F5F5FA', wallColor: '#5E5E6B', icon: '🛏️' },
  kitchen: { name: '厨房', fill: '#FAF5EB', wallColor: '#6B5E4B', icon: '🍳' },
  bathroom: { name: '卫生间', fill: '#F0FAF0', wallColor: '#4B6B5E', icon: '🚿' },
  balcony: { name: '阳台', fill: '#F0F5F0', wallColor: '#5E6B5E', icon: '🌿' },
  study: { name: '书房', fill: '#F5F0FA', wallColor: '#5E4B6B', icon: '📚' },
  dining: { name: '餐厅', fill: '#FAF0EB', wallColor: '#6B4B3E', icon: '🍽️' },
  storage: { name: '储藏室', fill: '#F0F0F0', wallColor: '#5E5E5E', icon: '📦' },
};

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
    searchQuery,
    displayName,
    theme
  } = useStore();

  const roomLocations = useMemo(() => locations.filter(l => l.type === 'room'), [locations]);
  const cabinetLocations = useMemo(() => locations.filter(l => l.type !== 'room'), [locations]);

  const userName = displayName;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.includes(q)
    );
  }, [items, searchQuery]);

  const matchedLocationIds = useMemo(() => {
    if (!searchQuery) return new Set<string>();
    const ids = new Set<string>();
    for (const item of filteredItems) {
      if (item.locationId) {
        ids.add(item.locationId);
        const loc = locations.find(l => l.id === item.locationId);
        if (loc?.parentId) ids.add(loc.parentId);
      }
    }
    return ids;
  }, [searchQuery, filteredItems, locations]);

  const selectedLocation = useMemo(() => locations.find(l => l.id === selectedLocationId), [locations, selectedLocationId]);

  const displayItems = useMemo(() => {
    if (searchQuery) return filteredItems;
    if (selectedLocationId) return items.filter(i => i.locationId === selectedLocationId);
    return items.slice(-15);
  }, [searchQuery, filteredItems, selectedLocationId, items]);

  const sortedDisplayItems = useMemo(() => [...displayItems].reverse(), [displayItems]);

  return (
    <div className="space-y-6 md:space-y-8 swiss-enter pb-20">

      {/* Desktop Welcome */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-start bg-white dark:bg-black border-2 border-black dark:border-white p-6 mb-2 transition-colors">
        <div>
          <h2 className="text-6xl font-black tracking-tighter uppercase text-black dark:text-white leading-none">
            HOMEBOX
          </h2>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">{userName || 'USER'} — 智能家庭储物管理</p>
        </div>
        <div className="flex gap-8 items-center mt-4 md:mt-0">
          <div className="flex gap-8">
            <div className="text-center border-l-4 border-black dark:border-white pl-6">
              <p className="text-7xl font-black text-swiss-red leading-none">{items.length}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase mt-2">在库物品</p>
            </div>
            <div className="text-center border-l-4 border-black dark:border-white pl-6">
              <p className="text-7xl font-black text-swiss-red leading-none">{locations.length}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase mt-2">存储位置</p>
            </div>
          </div>

          <ButtonLink
            to="/items/new"
            variant="primary" className="whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>添加物品</span>
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left: Floor Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-swiss-red">01.</span>
              {searchQuery ? '搜索定位' : '家庭平面图'}
            </h3>
            <div className="flex gap-2">
              <div className="hidden md:flex items-center gap-2 mr-2">
                <div className="border-2 border-black dark:border-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                  📦 {items.length}
                </div>
                <div className="border-2 border-black dark:border-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                  📍 {locations.length}
                </div>
              </div>
              <Link to="/floorplan" className="text-xs font-black uppercase tracking-wide border-2 border-black dark:border-white px-3 py-1.5 hover:bg-swiss-red hover:border-swiss-red hover:text-white transition-colors text-black dark:text-white">
                编辑户型 <ArrowRight className="w-3 h-3 md:w-4 md:h-4 inline" />
              </Link>
            </div>
          </div>

          <ExpirationWarning />

          <Card className="min-h-[400px]" padding="none">
            {locations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 min-h-[400px]">
                <div className="w-20 h-20 border-2 border-black dark:border-white flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-black dark:text-white uppercase">还没有绘图</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">绘制家庭平面图，开始可视化管理您的物品位置</p>
                </div>
                <ButtonLink to="/floorplan" variant="primary">开始绘制</ButtonLink>
              </div>
            ) : (
              (() => {
                const allLocs = locations.filter(l => l.bounds.x >= 0);
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
                  <div className="w-full h-[450px] flex items-center justify-center overflow-hidden relative bg-white dark:bg-black">
                    <svg width="100%" height="100%" viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`} preserveAspectRatio="xMidYMid meet">
                      {/* Room layer */}
                      {roomLocations.map(location => {
                        const isSelected = selectedLocationId === location.id;
                        const isMatched = matchedLocationIds.has(location.id);
                        const isDimmed = !!searchQuery && !isMatched;
                        const b = location.bounds;
                        
                        const roomConfig = ROOM_TYPES[location.roomType || 'living'] || ROOM_TYPES.living;
                        const SCALE = 0.3 / 20;
                        const wM = (b.width * SCALE).toFixed(2);
                        const hM = (b.height * SCALE).toFixed(2);
                        const area = (b.width * SCALE * b.height * SCALE).toFixed(1);
                        const WALL = 5; // 首页加粗墙体

                        return (
                          <g
                            key={location.id}
                            onClick={() => setSelectedLocationId(isSelected ? null : location.id)}
                            style={{ cursor: 'pointer', opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.2s ease-out' }}
                          >
                            {(isSelected || isMatched) && (
                              <rect x={b.x - 6} y={b.y - 6} width={b.width + 12} height={b.height + 12}
                                strokeWidth="2.5" fill="none"
                                stroke={isMatched ? '#FF3000' : (theme === 'dark' ? '#FFFFFF' : '#000000')}
                              />
                            )}
                            <rect x={b.x} y={b.y} width={b.width} height={b.height}
                              strokeWidth={WALL}
                              stroke={isSelected ? '#FF3000' : roomConfig.wallColor}
                              fill={theme === 'dark' ? '#09090b' : roomConfig.fill}
                              className="transition-all duration-200 ease-out"
                            />
                            <text x={b.x + b.width / 2} y={b.y + b.height / 2 - 6}
                              textAnchor="middle" fontSize="13" fontWeight="900"
                              className="fill-black dark:fill-white uppercase"
                              style={{ pointerEvents: 'none' }}
                            >
                              {roomConfig.icon} {location.name}
                            </text>
                            <text x={b.x + b.width / 2} y={b.y + b.height / 2 + 12}
                              textAnchor="middle" fontSize="10" fontWeight="700"
                              className="fill-gray-500 dark:fill-gray-400"
                              style={{ pointerEvents: 'none' }}
                            >
                              {area}m²
                            </text>
                            <text x={b.x + b.width / 2} y={b.y - 8}
                              textAnchor="middle" fontSize="9" fontFamily="monospace"
                              className="fill-gray-500 dark:fill-gray-400"
                              style={{ pointerEvents: 'none' }}
                            >
                              {wM}m
                            </text>
                            <text x={b.x - 8} y={b.y + b.height / 2}
                              textAnchor="middle" fontSize="9" fontFamily="monospace"
                              className="fill-gray-500 dark:fill-gray-400"
                              transform={`rotate(-90 ${b.x - 8} ${b.y + b.height / 2})`}
                              style={{ pointerEvents: 'none' }}
                            >
                              {hM}m
                            </text>
                          </g>
                        );
                      })}

                      {/* Cabinet layer */}
                      {cabinetLocations.filter(l => l.bounds.x >= 0).map(location => {
                        const config = CABINET_TYPES[location.roomType as keyof typeof CABINET_TYPES] || CABINET_TYPES.cabinet;
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
                            style={{ cursor: 'pointer', opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.2s ease-out' }}
                          >
                            {isMatched && (
                              <circle cx={cx} cy={cy} r={r + 6}
                                fill="none" stroke="#FF3000" strokeWidth="2"
                              />
                            )}
                            <circle cx={cx} cy={cy} r={r}
                              fill={isSelected ? '#FF3000' : '#000000'}
                              strokeWidth="2"
                              className="transition-all duration-200 ease-out origin-center"
                              stroke="white"
                            />
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
          </Card>

          <div className="border-2 border-black dark:border-white p-3 text-[11px] flex gap-2 bg-swiss-red/5 text-black dark:text-white transition-colors">
            <span className="font-black uppercase">提示:</span>
            {searchQuery ? '地图上高亮显示的区域包含您搜索的物品，虚线框标记为收纳位置。' : '点击房间/收纳标记可查看其中的物品详情。'}
          </div>
        </div>

        {/* Right: Items List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-black dark:text-white truncate pr-2">
              {searchQuery ? `"${searchQuery}"` : (selectedLocation ? selectedLocation.name : '最近添加')}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {selectedLocationId && !searchQuery && (
                <button onClick={() => setSelectedLocationId(null)} className="text-[10px] font-black uppercase tracking-wider border-2 border-black dark:border-white px-2 py-1 hover:bg-swiss-red hover:border-swiss-red hover:text-white transition-colors text-black dark:text-white">
                  全部
                </button>
              )}
              <Link
                to={selectedLocationId ? `/items/new?locationId=${selectedLocationId}` : `/items/new`}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border-2 border-swiss-red text-swiss-red px-2 py-1 hover:bg-swiss-red hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" /> 新增
              </Link>
            </div>
          </div>

          <div className="space-y-0 border-2 border-black dark:border-white">
            {sortedDisplayItems.length === 0 ? (
              <div className="text-center py-20 space-y-4 flex flex-col items-center p-6">
                <div className="w-16 h-16 border-2 border-black dark:border-white flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h4 className="font-black text-black dark:text-white uppercase">{searchQuery ? '未找到相关物品' : '暂无物品'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{searchQuery ? '换个关键词试试？' : '点击左侧房间或添加物品'}</p>
                </div>
                {!searchQuery && selectedLocationId && (
                  <ButtonLink to={`/items/new?locationId=${selectedLocationId}`} variant="primary" size="sm" className="mt-2">
                    <Plus className="w-4 h-4" /> 放入物品
                  </ButtonLink>
                )}
              </div>
            ) : (
              sortedDisplayItems.slice(0, 15).map((item, idx) => (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className={`flex items-center gap-4 p-4 border-b-2 border-black dark:border-white hover:bg-swiss-red/5 transition-colors group ${idx === sortedDisplayItems.slice(0, 15).length - 1 ? 'border-b-0' : ''}`}
                >
                  {item.imageUrl ? (
                    <div
                      className="w-12 h-12 border-2 border-black dark:border-white bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                      📦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-black dark:text-white truncate group-hover:text-swiss-red transition-colors text-lg leading-tight uppercase">{item.name}</p>
                      <span className="text-[10px] font-black border-2 border-black dark:border-white px-2 py-0.5">x{item.quantity}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1 uppercase tracking-wide">
                      <span className="border-2 border-black dark:border-white px-1.5 py-0.5">{item.category}</span>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {locations.find(l => l.id === item.locationId)?.name || '未分配'}
                      </span>
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!searchQuery && !selectedLocationId && items.length > 10 && (
            <div className="text-center pt-2">
              <Link to="/items" className="text-sm font-black uppercase tracking-wide text-swiss-red hover:underline inline-flex items-center gap-1">
                查看全部物品 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
