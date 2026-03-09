import { useState, useRef, useMemo } from 'react';
import { Plus, Move, Trash2, GripHorizontal, LayoutGrid, ChevronDown, Edit3, Save } from 'lucide-react';
import { useStore } from '../store/useStore';

type Tool = 'select' | 'add-room' | 'add-cabinet';

const GRID_SIZE = 20;

// 房间类型
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

// 收纳标记类型
const CABINET_TYPES: Record<string, { name: string; icon: string; color: string }> = {
  cabinet: { name: '柜子', icon: '🗄️', color: '#8B6D4B' },
  wardrobe: { name: '衣柜', icon: '👔', color: '#6B5E8B' },
  shelf: { name: '书架', icon: '📚', color: '#5E6B8B' },
  drawer: { name: '抽屉', icon: '🗃️', color: '#6B8B5E' },
  box: { name: '收纳盒', icon: '📦', color: '#8B8B5E' },
};

export default function FloorPlan() {
  const { locations, items, addLocation, updateLocation, deleteLocation, setSelectedLocationId } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>('select');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, locX: 0, locY: 0, width: 0, height: 0 });
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [showCabinetPicker, setShowCabinetPicker] = useState(false);

  // 分离房间和收纳标记
  const roomLocations = useMemo(() => locations.filter(l => l.type === 'room'), [locations]);
  const cabinetLocations = useMemo(() => locations.filter(l => l.type !== 'room'), [locations]);

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const addNewRoom = (type: string) => {
    const config = ROOM_TYPES[type] || ROOM_TYPES.living;
    addLocation({
      name: config.name,
      type: 'room' as const,
      parentId: null,
      roomType: type,
      bounds: {
        x: snapToGrid(40 + Math.random() * 200),
        y: snapToGrid(40 + Math.random() * 100),
        width: snapToGrid(180),
        height: snapToGrid(140),
      }
    });
    setShowRoomPicker(false);
  };

  const addNewCabinet = (type: string) => {
    const config = CABINET_TYPES[type] || CABINET_TYPES.cabinet;
    // 找到当前选中的房间作为父级
    const parentRoom = selectedId ? roomLocations.find(r => r.id === selectedId) : roomLocations[0];

    const baseX = parentRoom ? parentRoom.bounds.x + 20 : 60;
    const baseY = parentRoom ? parentRoom.bounds.y + 20 : 60;

    addLocation({
      name: config.name,
      type: type === 'wardrobe' ? 'cabinet' : type as any,
      parentId: parentRoom?.id || null,
      roomType: type,
      bounds: {
        x: snapToGrid(baseX + Math.random() * 60),
        y: snapToGrid(baseY + Math.random() * 40),
        width: snapToGrid(60),
        height: snapToGrid(40),
      }
    });
    setShowCabinetPicker(false);
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isEditMode) return;
    const { x: mouseX, y: mouseY } = getMousePos(e);

    // 先检查收纳标记(在上层)，再检查房间
    const clickedCabinet = cabinetLocations.find(loc => {
      const bx = loc.bounds.x, by = loc.bounds.y, bw = loc.bounds.width, bh = loc.bounds.height;
      return mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;
    });

    const clickedRoom = roomLocations.find(loc => {
      const bx = loc.bounds.x, by = loc.bounds.y, bw = loc.bounds.width, bh = loc.bounds.height;
      return mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;
    });

    const clickedLocation = clickedCabinet || clickedRoom;

    if (clickedLocation) {
      setSelectedId(clickedLocation.id);
      setSelectedLocationId(clickedLocation.id);
      setIsDragging(true);
      setDragStart({
        x: mouseX, y: mouseY,
        locX: clickedLocation.bounds.x, locY: clickedLocation.bounds.y,
        width: clickedLocation.bounds.width, height: clickedLocation.bounds.height,
      });
    } else {
      setSelectedId(null);
      setSelectedLocationId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !selectedId) return;
    const { x: mouseX, y: mouseY } = getMousePos(e);
    const loc = locations.find(l => l.id === selectedId);
    if (!loc) return;

    if (isDragging && !isResizing) {
      let newX = snapToGrid(dragStart.locX + (mouseX - dragStart.x));
      let newY = snapToGrid(dragStart.locY + (mouseY - dragStart.y));
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      updateLocation(selectedId, { bounds: { ...loc.bounds, x: newX, y: newY } });
    } else if (isResizing) {
      let newWidth = dragStart.width;
      let newHeight = dragStart.height;
      let newX = dragStart.locX;
      let newY = dragStart.locY;
      const dx = mouseX - dragStart.x;
      const dy = mouseY - dragStart.y;

      if (resizeDir.includes('e')) newWidth = Math.max(40, dragStart.width + dx);
      if (resizeDir.includes('s')) newHeight = Math.max(30, dragStart.height + dy);
      if (resizeDir.includes('w')) {
        const candidateX = dragStart.locX + dx;
        if (candidateX >= 0 && candidateX < dragStart.locX + dragStart.width - 40) {
          newWidth = dragStart.width - dx; newX = candidateX;
        }
      }
      if (resizeDir.includes('n')) {
        const candidateY = dragStart.locY + dy;
        if (candidateY >= 0 && candidateY < dragStart.locY + dragStart.height - 30) {
          newHeight = dragStart.height - dy; newY = candidateY;
        }
      }
      updateLocation(selectedId, {
        bounds: { x: snapToGrid(newX), y: snapToGrid(newY), width: snapToGrid(newWidth), height: snapToGrid(newHeight) }
      });
    }
  };

  const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); setResizeDir(''); };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, direction: string) => {
    e.stopPropagation();
    if (!selectedId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const loc = locations.find(l => l.id === selectedId);
    if (!loc) return;
    setIsResizing(true);
    setResizeDir(direction);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX - rect.left, y: clientY - rect.top,
      locX: loc.bounds.x, locY: loc.bounds.y,
      width: loc.bounds.width, height: loc.bounds.height,
    });
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteLocation(selectedId);
      setSelectedId(null);
      setSelectedLocationId(null);
    }
  };

  const selectedLoc = selectedId ? locations.find(l => l.id === selectedId) : null;
  const selectedItemCount = selectedId ? items.filter(i => i.locationId === selectedId).length : 0;

  return (
    <div className="space-y-5 animate-enter">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">平面图编辑</h2>
          <p className="text-sm text-gray-500 mt-1">绘制户型，标记收纳位置</p>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="card relative z-20">
        <div className="flex items-center gap-2 flex-wrap">
          {!isEditMode ? (
            <>
              <span className="text-sm font-bold text-gray-500 mr-2 flex-1">当前为只读模式，防止误操作。</span>
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-primary"
              >
                <Edit3 className="w-4 h-4" /> 编辑布局
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-bold text-gray-500 mr-1 hidden sm:inline">工具</span>

              <button
                onClick={() => setTool('select')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${tool === 'select' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
              >
                <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">选择/移动</span><span className="inline sm:hidden">选择</span>
              </button>

              {/* 添加房间 */}
              <div className="relative">
                <button
                  onClick={() => { setShowRoomPicker(!showRoomPicker); setShowCabinetPicker(false); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${tool === 'add-room' ? 'bg-primary dark:bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 房间 <ChevronDown className="w-3 h-3" />
                </button>
                {showRoomPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-3 z-50 w-56 animate-enter">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ROOM_TYPES).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => addNewRoom(key)}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-[#EAF4F8] dark:hover:bg-blue-900/30 transition-all text-center group border border-transparent dark:border-slate-700"
                        >
                          <span className="text-xl block group-hover:scale-110 transition-transform">{config.icon}</span>
                          <p className="font-bold text-xs mt-1 text-gray-600 dark:text-gray-300">{config.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 添加收纳 */}
              <div className="relative">
                <button
                  onClick={() => { setShowCabinetPicker(!showCabinetPicker); setShowRoomPicker(false); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${tool === 'add-cabinet' ? 'bg-[#8B6D4B] dark:bg-amber-600 text-white shadow-lg' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                    }`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 收纳 <ChevronDown className="w-3 h-3" />
                </button>
                {showCabinetPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-3 z-50 w-64 animate-enter">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">选择类型，标记将添加到{selectedLoc?.type === 'room' ? `"${selectedLoc.name}"` : '画布'}中</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(CABINET_TYPES).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => addNewCabinet(key)}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all text-center group border border-transparent dark:border-slate-700"
                        >
                          <span className="text-xl block group-hover:scale-110 transition-transform">{config.icon}</span>
                          <p className="font-bold text-xs mt-1 text-gray-600 dark:text-gray-300">{config.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 删除按钮 */}
              <button
                onClick={handleDelete}
                disabled={!selectedId}
                className="p-2 sm:p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="删除选中"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 dark:text-red-400" />
              </button>

              <div className="flex-1" />

              {/* 保存并退出编辑 */}
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedId(null);
                  setSelectedLocationId(null);
                }}
                className="btn-primary ml-auto"
              >
                <Save className="w-4 h-4" /> 保存修改
              </button>
            </>
          )}
        </div>
      </div>

      {/* 画布包裹区域 - 增加滚动与指示器 */}
      <div className="card p-3 overflow-hidden relative group">
        <div className="absolute inset-x-0 top-3 bottom-3 flex items-center justify-between pointer-events-none md:hidden z-30 opacity-40">
          <div className="w-6 h-full bg-gradient-to-r from-gray-100 to-transparent"></div>
          <div className="w-6 h-full bg-gradient-to-l from-gray-100 to-transparent"></div>
        </div>
        <div className="overflow-auto rounded-2xl relative w-full touch-pan-x touch-pan-y" style={{ height: '500px' }}>
          <div
            ref={containerRef}
            className="absolute top-0 left-0 bg-[#ECECEC] dark:bg-slate-900"
            style={{
              width: '1200px', // 设定一个固定的超大逻辑宽带保证移动端拖拽不撞墙
              height: '1000px', // 设定超大高度
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              cursor: !isEditMode ? 'default' : (tool === 'select' ? 'default' : 'crosshair'),
              pointerEvents: isEditMode ? 'auto' : 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onClick={() => { setShowRoomPicker(false); setShowCabinetPicker(false); }}
          >
            {/* 空白提示 */}
            {locations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <LayoutGrid className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400 font-bold">点击上方「房间」按钮开始绘制</p>
                  <p className="text-gray-300 text-sm mt-1">添加房间后，可以继续标记收纳位置</p>
                </div>
              </div>
            )}

            {/* === 房间层（建筑图风格） === */}
            {roomLocations.map(location => {
              const isSelected = selectedId === location.id;
              const b = location.bounds;
              const WALL = 4; // 墙线厚度(px)
              const SCALE = 0.3 / GRID_SIZE;
              const wM = (b.width * SCALE).toFixed(2);
              const hM = (b.height * SCALE).toFixed(2);
              const area = (b.width * SCALE * b.height * SCALE).toFixed(1);

              return (
                <div
                  key={location.id}
                  className={`absolute bg-white dark:bg-slate-800 ${isSelected ? 'border-blue-600 dark:border-blue-500' : 'border-[#3A3A3A] dark:border-slate-600'}`}
                  style={{
                    left: b.x, top: b.y, width: b.width, height: b.height,
                    borderWidth: `${WALL}px`,
                    borderStyle: 'solid',
                    boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.25)' : 'none',
                    transition: isDragging ? 'none' : 'box-shadow 0.15s, border-color 0.15s',
                    zIndex: isSelected ? 20 : 10,
                  }}
                >
                  {/* 中心标签：名称 + 面积 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide">
                      {location.name}
                    </span>
                    <span className="text-xs font-bold mt-1 text-gray-400 dark:text-gray-500">
                      {area}m²
                    </span>
                  </div>

                  {/* 尺寸标注 — 顶部(宽) */}
                  <div className="absolute pointer-events-none select-none"
                    style={{ left: '50%', top: -22, transform: 'translateX(-50%)' }}
                  >
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-[#F5F5F0] dark:bg-slate-700 px-1.5 py-0.5 rounded">{wM}m</span>
                  </div>
                  {/* 尺寸标注 — 左侧(高) */}
                  <div className="absolute pointer-events-none select-none"
                    style={{ left: -8, top: '50%', transform: 'translateY(-50%) translateX(-100%) rotate(-90deg)' }}
                  >
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-[#F5F5F0] dark:bg-slate-700 px-1.5 py-0.5 rounded">{hM}m</span>
                  </div>

                  {/* Resize 手柄 */}
                  {isSelected && isEditMode && (
                    <>
                      <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-blue-600 rounded-full cursor-se-resize flex items-center justify-center shadow-lg hover:bg-blue-700 z-30"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                        onTouchStart={(e) => handleResizeStart(e, 'se')}
                      >
                        <GripHorizontal className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="absolute -left-2.5 -top-2.5 w-5 h-5 bg-blue-500 rounded-full cursor-nw-resize shadow-md z-30"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                        onTouchStart={(e) => handleResizeStart(e, 'nw')}
                      />
                      <div className="absolute -right-2.5 -top-2.5 w-5 h-5 bg-blue-500 rounded-full cursor-ne-resize shadow-md z-30"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                        onTouchStart={(e) => handleResizeStart(e, 'ne')}
                      />
                      <div className="absolute -left-2.5 -bottom-2.5 w-5 h-5 bg-blue-500 rounded-full cursor-sw-resize shadow-md z-30"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                        onTouchStart={(e) => handleResizeStart(e, 'sw')}
                      />
                    </>
                  )}
                </div>
              );
            })}

            {/* === 收纳标记层（圆点样式） === */}
            {cabinetLocations.map(location => {
              const cabinetConfig = CABINET_TYPES[(location as any).roomType as keyof typeof CABINET_TYPES] || CABINET_TYPES.cabinet;
              const isSelected = selectedId === location.id;
              const b = location.bounds;
              const DOT_SIZE = 32;

              return (
                <div
                  key={location.id}
                  className="absolute group"
                  style={{
                    left: b.x, top: b.y,
                    width: DOT_SIZE, height: DOT_SIZE,
                    zIndex: isSelected ? 40 : 30,
                    cursor: 'pointer',
                    transition: isDragging ? 'none' : 'transform 0.2s',
                  }}
                >
                  {/* 圆点本体 */}
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-md transition-all"
                    style={{
                      backgroundColor: isSelected ? '#3B82F6' : cabinetConfig.color,
                      border: isSelected ? '3px solid #3B82F6' : '2px solid white',
                      boxShadow: isSelected ? '0 0 0 4px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.15)',
                      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <span className="text-sm select-none" style={{ filter: isSelected ? 'brightness(10)' : 'none' }}>{cabinetConfig.icon}</span>
                  </div>
                  {/* 悬浮名称提示 */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-white shadow-lg">
                      {location.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 选中信息面板 — 可编辑名称 + 尺寸 */}
      {selectedLoc && isEditMode && (() => {
        // 米与像素换算：meters = pixels / GRID_SIZE * 0.3
        const SCALE = 0.3 / GRID_SIZE; // 1px = 0.015m
        const widthM = +(selectedLoc.bounds.width * SCALE).toFixed(1);
        const heightM = +(selectedLoc.bounds.height * SCALE).toFixed(1);

        const setDimension = (dim: 'width' | 'height', meters: number) => {
          const clamped = Math.max(0.5, meters); // 最小 0.5m
          const px = snapToGrid(Math.round(clamped / SCALE));
          updateLocation(selectedLoc.id, {
            bounds: { ...selectedLoc.bounds, [dim]: px }
          });
        };

        return (
          <div className="card animate-enter" style={{ borderLeft: '4px solid #3B6D8C' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: selectedLoc.type === 'room' ? '#EAF4F8' : '#FFF5EB' }}
              >
                {selectedLoc.type === 'room'
                  ? (ROOM_TYPES[(selectedLoc as any).roomType]?.icon || '🏠')
                  : (CABINET_TYPES[(selectedLoc as any).roomType]?.icon || '🗄️')
                }
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={selectedLoc.name}
                  onChange={(e) => updateLocation(selectedLoc.id, { name: e.target.value })}
                  className="font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-transparent hover:border-gray-200 dark:hover:border-slate-700 focus:border-primary dark:focus:border-blue-500 outline-none w-full transition-colors py-0.5 text-lg"
                  placeholder="输入名称..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedLoc.type === 'room' ? '房间' : '收纳点'} · {selectedItemCount} 件物品
                  {selectedLoc.parentId && ` · 位于 ${locations.find(l => l.id === selectedLoc.parentId)?.name || '未知'}`}
                </p>
              </div>
              <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-400 dark:text-red-500" />
              </button>
            </div>

            {/* 房间尺寸设置 */}
            {selectedLoc.type === 'room' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">尺寸</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">宽</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={widthM}
                    onChange={(e) => setDimension('width', parseFloat(e.target.value) || 0.5)}
                    className="w-16 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-center font-bold text-sm focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 outline-none transition-all dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">m</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">×</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">高</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={heightM}
                    onChange={(e) => setDimension('height', parseFloat(e.target.value) || 0.5)}
                    className="w-16 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-center font-bold text-sm focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 outline-none transition-all dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">m</span>
                </div>
              </div>
            )}

            {/* 收纳点：所属房间选择 */}
            {selectedLoc.type !== 'room' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">所属房间</span>
                <select
                  value={selectedLoc.parentId || ''}
                  onChange={(e) => updateLocation(selectedLoc.id, { parentId: e.target.value || null })}
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-gray-200 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                >
                  <option value="">未指定</option>
                  {roomLocations.map(room => (
                    <option key={room.id} value={room.id}>
                      {ROOM_TYPES[(room as any).roomType]?.icon || '🏠'} {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })()}

      {/* 操作提示 */}
      <p className="text-center text-xs text-gray-400">
        点击选择 · 拖拽移动 · 角落调整大小 · 先选中房间再添加收纳标记
      </p>
    </div>
  );
}
