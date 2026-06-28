import { useState, useRef, useMemo } from 'react';
import { Plus, Move, Trash2, GripHorizontal, LayoutGrid, ChevronDown, Edit3, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Card } from '../components/ui';

type Tool = 'select' | 'add-room' | 'add-cabinet';

const GRID_SIZE = 20;

// 房间类型
const ROOM_TYPES: Record<string, { name: string; fill: string; wallColor: string; icon: string }> = {
  living: { name: '客厅', fill: '#FAFAF5', wallColor: '#6B6B5E', icon: '\ud83d\udecb\ufe0f' },
  bedroom: { name: '卧室', fill: '#F5F5FA', wallColor: '#5E5E6B', icon: '\ud83d\udecf\ufe0f' },
  kitchen: { name: '厨房', fill: '#FAF5EB', wallColor: '#6B5E4B', icon: '\ud83c\udf73' },
  bathroom: { name: '卫生间', fill: '#F0FAF0', wallColor: '#4B6B5E', icon: '\ud83d\udebf' },
  balcony: { name: '阳台', fill: '#F0F5F0', wallColor: '#5E6B5E', icon: '\ud83c\udf3f' },
  study: { name: '书房', fill: '#F5F0FA', wallColor: '#5E4B6B', icon: '\ud83d\udcda' },
  dining: { name: '餐厅', fill: '#FAF0EB', wallColor: '#6B4B3E', icon: '\ud83c\udf7d\ufe0f' },
  storage: { name: '储藏室', fill: '#F0F0F0', wallColor: '#5E5E5E', icon: '\ud83d\udce6' },
};

// 收纳标记类型
const CABINET_TYPES: Record<string, { name: string; icon: string; color: string }> = {
  cabinet: { name: '柜子', icon: '\ud83d\uddc4\ufe0f', color: '#8B6D4B' },
  wardrobe: { name: '衣柜', icon: '\ud83d\udc54', color: '#6B5E8B' },
  shelf: { name: '书架', icon: '\ud83d\udcda', color: '#5E6B8B' },
  drawer: { name: '抽屉', icon: '\ud83d\uddc3\ufe0f', color: '#6B8B5E' },
  box: { name: '收纳盒', icon: '\ud83d\udce6', color: '#8B8B5E' },
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
    const parentRoom = selectedId ? roomLocations.find(r => r.id === selectedId) : roomLocations[0];
    const baseX = parentRoom ? parentRoom.bounds.x + 20 : 60;
    const baseY = parentRoom ? parentRoom.bounds.y + 20 : 60;

    addLocation({
      name: config.name,
      type: type === 'wardrobe' ? 'cabinet' : type as 'room' | 'cabinet' | 'drawer' | 'shelf' | 'box',
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
    <div className="space-y-5 swiss-enter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">平面图编辑</h2>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">绘制户型，标记收纳位置</p>
        </div>
      </div>

      <Card className="relative z-20" padding="sm">
        <div className="flex items-center gap-2 flex-wrap">
          {!isEditMode ? (
            <>
              <span className="text-sm font-bold text-gray-500 mr-2 flex-1">当前为只读模式，防止误操作。</span>
              <Button onClick={() => setIsEditMode(true)} variant="primary" size="sm">
                <Edit3 className="w-4 h-4" /> 编辑布局
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-bold text-gray-500 mr-1 hidden sm:inline">工具</span>

              <button
                onClick={() => setTool('select')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 border-2 font-bold text-xs sm:text-sm transition-all ${tool === 'select' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-black dark:border-white bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
              >
                <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">选择/移动</span><span className="inline sm:hidden">选择</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => { setShowRoomPicker(!showRoomPicker); setShowCabinetPicker(false); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 border-2 font-bold text-xs sm:text-sm transition-all ${tool === 'add-room' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-black dark:border-white bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 房间 <ChevronDown className="w-3 h-3" />
                </button>
                {showRoomPicker && (
                  <div className="absolute top-full left-0 mt-2 border-2 border-black dark:border-white bg-white dark:bg-black p-3 z-50 w-56 swiss-enter">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ROOM_TYPES).map(([key, config]) => (
                        <button key={key} onClick={() => addNewRoom(key)} className="p-3 border-2 border-black dark:border-white hover:bg-black hover:text-white hover:border-swiss-red transition-all text-center group">
                          <span className="text-xl block group-hover:scale-110 transition-transform">{config.icon}</span>
                          <p className="font-bold text-xs mt-1 text-gray-600 dark:text-gray-300">{config.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => { setShowCabinetPicker(!showCabinetPicker); setShowRoomPicker(false); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 border-2 font-bold text-xs sm:text-sm transition-all ${tool === 'add-cabinet' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-black dark:border-white bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 收纳 <ChevronDown className="w-3 h-3" />
                </button>
                {showCabinetPicker && (
                  <div className="absolute top-full left-0 mt-2 border-2 border-black dark:border-white bg-white dark:bg-black p-3 z-50 w-64 swiss-enter">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">选择类型，标记将添加到{selectedLoc?.type === 'room' ? `"${selectedLoc.name}"` : '画布'}中</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(CABINET_TYPES).map(([key, config]) => (
                        <button key={key} onClick={() => addNewCabinet(key)} className="p-3 border-2 border-black dark:border-white hover:bg-black hover:text-white hover:border-swiss-red transition-all text-center group">
                          <span className="text-xl block group-hover:scale-110 transition-transform">{config.icon}</span>
                          <p className="font-bold text-xs mt-1 text-gray-600 dark:text-gray-300">{config.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleDelete} disabled={!selectedId} className="p-2 sm:p-2.5 border-2 border-swiss-red hover:bg-swiss-red hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="删除选中">
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-swiss-red" />
              </button>

              <div className="flex-1" />

              <Button onClick={() => { setIsEditMode(false); setSelectedId(null); setSelectedLocationId(null); }} variant="primary" size="sm" className="ml-auto">
                <Save className="w-4 h-4" /> 保存修改
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden relative group">
        <div className="overflow-auto relative w-full touch-pan-x touch-pan-y" style={{ height: '500px' }}>
          <div
            ref={containerRef}
            className="absolute top-0 left-0 bg-[#ECECEC] dark:bg-gray-950"
            style={{
              width: '1200px',
              height: '1000px',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)`,
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
            {locations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <LayoutGrid className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400 font-bold">点击上方「房间」按钮开始绘制</p>
                  <p className="text-gray-300 text-sm mt-1">添加房间后，可以继续标记收纳位置</p>
                </div>
              </div>
            )}

            {roomLocations.map(location => {
              const isSelected = selectedId === location.id;
              const b = location.bounds;
              const roomConfig = ROOM_TYPES[location.roomType || 'living'] || ROOM_TYPES.living;
              
              const WALL = 6; // 加粗墙面，使实体感更强
              const SCALE = 0.3 / GRID_SIZE;
              const wM = (b.width * SCALE).toFixed(2);
              const hM = (b.height * SCALE).toFixed(2);
              const area = (b.width * SCALE * b.height * SCALE).toFixed(1);

              return (
                <div
                  key={location.id}
                  className={`absolute dark:!bg-zinc-950 transition-all ${
                    isSelected ? 'shadow-[0_0_0_4px_rgba(255,48,0,0.15)] z-20' : 'shadow-[0_4px_16px_rgba(0,0,0,0.06)] z-10'
                  }`}
                  style={{
                    left: b.x, 
                    top: b.y, 
                    width: b.width, 
                    height: b.height,
                    borderWidth: `${WALL}px`,
                    borderStyle: 'solid',
                    borderColor: isSelected ? '#FF3000' : roomConfig.wallColor,
                    backgroundColor: roomConfig.fill,
                    transition: isDragging ? 'none' : 'box-shadow 0.15s, border-color 0.15s',
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{roomConfig.icon}</span>
                      <span className="text-sm font-black text-gray-800 dark:text-gray-100 tracking-wide">{location.name}</span>
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-gray-400 dark:text-gray-500">{area} m²</span>
                  </div>

                  <div className="absolute pointer-events-none select-none" style={{ left: '50%', top: -22, transform: 'translateX(-50%)' }}>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-transparent border-2 border-black dark:border-white px-1.5 py-0.5">{wM}m</span>
                  </div>
                  <div className="absolute pointer-events-none select-none" style={{ left: -8, top: '50%', transform: 'translateY(-50%) translateX(-100%) rotate(-90deg)' }}>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-transparent border border-black px-1.5 py-0.5">{hM}m</span>
                  </div>

                  {isSelected && isEditMode && (
                    <>
                      <div className="absolute -right-3 -bottom-3 bg-black w-6 h-6 flex items-center justify-center cursor-se-resize hover:bg-swiss-red z-30" onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => handleResizeStart(e, 'se')}>
                        <GripHorizontal className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="absolute -left-2.5 -top-2.5 bg-black w-5 h-5 cursor-nw-resize z-30 hover:bg-swiss-red" onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => handleResizeStart(e, 'nw')} />
                      <div className="absolute -right-2.5 -top-2.5 bg-black w-5 h-5 cursor-ne-resize z-30 hover:bg-swiss-red" onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => handleResizeStart(e, 'ne')} />
                      <div className="absolute -left-2.5 -bottom-2.5 bg-black w-5 h-5 cursor-sw-resize z-30 hover:bg-swiss-red" onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => handleResizeStart(e, 'sw')} />
                    </>
                  )}
                </div>
              );
            })}

            {cabinetLocations.map(location => {
              const cabinetConfig = CABINET_TYPES[location.roomType as keyof typeof CABINET_TYPES] || CABINET_TYPES.cabinet;
              const isSelected = selectedId === location.id;
              const b = location.bounds;
              const DOT_SIZE = 32;

              return (
                <div key={location.id} className="absolute group" style={{ left: b.x, top: b.y, width: DOT_SIZE, height: DOT_SIZE, zIndex: isSelected ? 40 : 30, cursor: 'pointer', transition: isDragging ? 'none' : 'transform 0.2s' }}>
                  <div className="w-full h-full flex items-center justify-center transition-all" style={{ backgroundColor: isSelected ? '#FF3000' : '#000000', border: isSelected ? '3px solid #FF3000' : '2px solid white', boxShadow: isSelected ? '0 0 0 4px rgba(255,48,0,0.25), 0 2px 8px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.15)', transform: isSelected ? 'scale(1.2)' : 'scale(1)' }}>
                    <span className="text-sm select-none" style={{ filter: 'brightness(10)' }}>{cabinetConfig.icon}</span>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white border-2 border-white">{location.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {selectedLoc && isEditMode && (() => {
        const SCALE = 0.3 / GRID_SIZE;
        const widthM = +(selectedLoc.bounds.width * SCALE).toFixed(1);
        const heightM = +(selectedLoc.bounds.height * SCALE).toFixed(1);

        const setDimension = (dim: 'width' | 'height', meters: number) => {
          const clamped = Math.max(0.5, meters);
          const px = snapToGrid(Math.round(clamped / SCALE));
          updateLocation(selectedLoc.id, { bounds: { ...selectedLoc.bounds, [dim]: px } });
        };

        return (
          <Card className="swiss-enter" style={{ borderLeft: '4px solid #FF3000' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center text-2xl flex-shrink-0">
                {selectedLoc.type === 'room' ? (ROOM_TYPES[selectedLoc.roomType || '']?.icon || '\ud83c\udfe0') : (CABINET_TYPES[selectedLoc.roomType || '']?.icon || '\ud83d\uddc4\ufe0f')}
              </div>
              <div className="flex-1 min-w-0">
                <input type="text" value={selectedLoc.name} onChange={(e) => updateLocation(selectedLoc.id, { name: e.target.value })} className="font-bold text-black dark:text-white bg-transparent border-b-2 border-black dark:border-white focus:border-swiss-red outline-none w-full transition-colors py-0.5 text-lg" placeholder="输入名称..." />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedLoc.type === 'room' ? '房间' : '收纳点'} · {selectedItemCount} 件物品
                  {selectedLoc.parentId && ` · 位于 ${locations.find(l => l.id === selectedLoc.parentId)?.name || '未知'}`}
                </p>
              </div>
              <button onClick={handleDelete} className="p-2 border-2 border-swiss-red hover:bg-swiss-red hover:text-white flex-shrink-0 transition-all">
                <Trash2 className="w-4 h-4 text-swiss-red" />
              </button>
            </div>

            {selectedLoc.type === 'room' && (
              <div className="mt-4 pt-4 border-t border-black dark:border-white flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">尺寸</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">宽</label>
                  <input type="number" step="0.1" min="0.5" value={widthM} onChange={(e) => setDimension('width', parseFloat(e.target.value) || 0.5)} className="w-16 px-2 py-1.5 border-2 border-black dark:border-white text-center font-bold text-sm outline-none transition-all dark:text-gray-100 bg-transparent" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">m</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">×</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">高</label>
                  <input type="number" step="0.1" min="0.5" value={heightM} onChange={(e) => setDimension('height', parseFloat(e.target.value) || 0.5)} className="w-16 px-2 py-1.5 border-2 border-black dark:border-white text-center font-bold text-sm outline-none transition-all dark:text-gray-100 bg-transparent" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">m</span>
                </div>
              </div>
            )}

            {selectedLoc.type !== 'room' && (
              <div className="mt-4 pt-4 border-t border-black dark:border-white flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">所属房间</span>
                <select value={selectedLoc.parentId || ''} onChange={(e) => updateLocation(selectedLoc.id, { parentId: e.target.value || null })} className="flex-1 px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent">
                  <option value="">未指定</option>
                  {roomLocations.map(room => (
                    <option key={room.id} value={room.id}>{ROOM_TYPES[room.roomType || '']?.icon || '\ud83c\udfe0'} {room.name}</option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        );
      })()}

      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wide">点击选择 · 拖拽移动 · 角落调整大小 · 先选中房间再添加收纳标记</p>
    </div>
  );
}
