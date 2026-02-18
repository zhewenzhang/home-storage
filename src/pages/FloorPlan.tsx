import { useState, useRef } from 'react';
import { Plus, Move, Trash2, GripHorizontal, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/useStore';

type Tool = 'select' | 'add';

const GRID_SIZE = 20;

// 房间类型配置 - 更美观的室内设计风格
const ROOM_TYPES = {
  living: { name: '客厅', color: '#F5F0E8', border: '#8B7355', icon: '🛋️', pattern: 'linear-gradient(135deg, #F5F0E8 0%, #E8E0D5 100%)' },
  bedroom: { name: '卧室', color: '#E8EEF5', border: '#6B8BA4', icon: '🛏️', pattern: 'linear-gradient(135deg, #E8EEF5 0%, #D8E2ED 100%)' },
  kitchen: { name: '厨房', color: '#FFF5E6', border: '#C49A6C', icon: '🍳', pattern: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8D0 100%)' },
  bathroom: { name: '卫生间', color: '#E8F5E9', border: '#6B9B7A', icon: '🚿', pattern: 'linear-gradient(135deg, #E8F5E9 0%, #D4EBD8 100%)' },
  balcony: { name: '阳台', color: '#E8F4E8', border: '#7AA37A', icon: '🌿', pattern: 'linear-gradient(135deg, #E8F4E8 0%, #D8EBD8 100%)' },
  study: { name: '书房', color: '#F0EDF5', border: '#8B7AA4', icon: '📚', pattern: 'linear-gradient(135deg, #F0EDF5 0%, #E5E0EE 100%)' },
};

export default function FloorPlan() {
  const { locations, floorPlan, addLocation, updateLocation, setSelectedLocationId } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, locX: 0, locY: 0, width: 0, height: 0 });

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const addNewLocation = (type?: string) => {
    const roomType = type && ROOM_TYPES[type as keyof typeof ROOM_TYPES] ? type : 'living';
    const config = ROOM_TYPES[roomType as keyof typeof ROOM_TYPES];
    
    const newLocation = {
      name: config.name,
      type: 'room' as const,
      parentId: null,
      roomType: roomType,
      bounds: {
        x: snapToGrid(40 + Math.random() * 100),
        y: snapToGrid(40 + Math.random() * 80),
        width: snapToGrid(160),
        height: snapToGrid(120),
      }
    };
    
    addLocation(newLocation);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (tool === 'add') {
      addNewLocation();
      return;
    }
    
    const clickedLocation = locations.find(loc => {
      const bx = loc.bounds.x;
      const by = loc.bounds.y;
      const bw = loc.bounds.width;
      const bh = loc.bounds.height;
      
      return mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;
    });
    
    if (clickedLocation) {
      setSelectedId(clickedLocation.id);
      setSelectedLocationId(clickedLocation.id);
      setIsDragging(true);
      setDragStart({
        x: mouseX,
        y: mouseY,
        locX: clickedLocation.bounds.x,
        locY: clickedLocation.bounds.y,
        width: clickedLocation.bounds.width,
        height: clickedLocation.bounds.height,
      });
    } else {
      setSelectedId(null);
      setSelectedLocationId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !selectedId) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isDragging && !isResizing) {
      let newX = dragStart.locX + (mouseX - dragStart.x);
      let newY = dragStart.locY + (mouseY - dragStart.y);
      
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
      
      newX = Math.max(0, Math.min(newX, (floorPlan?.width || 800) - 40));
      newY = Math.max(0, Math.min(newY, (floorPlan?.height || 600) - 40));
      
      updateLocation(selectedId, {
        bounds: { ...locations.find(l => l.id === selectedId)!.bounds, x: newX, y: newY }
      });
    } else if (isResizing) {
      const loc = locations.find(l => l.id === selectedId);
      if (!loc) return;
      
      let newWidth = dragStart.width;
      let newHeight = dragStart.height;
      let newX = dragStart.locX;
      let newY = dragStart.locY;
      
      const dx = mouseX - dragStart.x;
      const dy = mouseY - dragStart.y;
      
      if (resizeDir.includes('e')) newWidth = Math.max(60, dragStart.width + dx);
      if (resizeDir.includes('s')) newHeight = Math.max(40, dragStart.height + dy);
      if (resizeDir.includes('w')) {
        const newLocX = dragStart.locX + dx;
        if (newLocX >= 0 && newLocX < dragStart.locX + dragStart.width - 60) {
          newWidth = dragStart.width - dx;
          newX = newLocX;
        }
      }
      if (resizeDir.includes('n')) {
        const newLocY = dragStart.locY + dy;
        if (newLocY >= 0 && newLocY < dragStart.locY + dragStart.height - 40) {
          newHeight = dragStart.height - dy;
          newY = newLocY;
        }
      }
      
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);
      
      updateLocation(selectedId, {
        bounds: { x: newX, y: newY, width: newWidth, height: newHeight }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDir('');
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (!selectedId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const loc = locations.find(l => l.id === selectedId);
    if (!loc) return;
    
    setIsResizing(true);
    setResizeDir(direction);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      locX: loc.bounds.x,
      locY: loc.bounds.y,
      width: loc.bounds.width,
      height: loc.bounds.height,
    });
  };

  const handleDelete = () => {
    if (selectedId) {
      updateLocation(selectedId, { 
        bounds: { x: -1000, y: -1000, width: 0, height: 0 } 
      });
      setSelectedId(null);
      setSelectedLocationId(null);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 标题区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">平面图编辑</h2>
            <p className="text-xs text-gray-500">拖拽调整房间位置和大小</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('select')}
            className={`p-2.5 rounded-xl transition-all ${tool === 'select' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="选择"
          >
            <Move className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('add')}
            className={`p-2.5 rounded-xl transition-all ${tool === 'add' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="添加区域"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 房间模板 */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">添加房间</h3>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(ROOM_TYPES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => addNewLocation(key)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-primary/10 transition-all text-center group"
            >
              <span className="text-xl block group-hover:scale-110 transition-transform">{config.icon}</span>
              <p className="font-medium text-xs mt-1 text-gray-600 group-hover:text-primary">{config.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 平面图画布 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">{floorPlan?.name || '我的家'}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{locations.length} 个房间</span>
            <button
              onClick={handleDelete}
              disabled={!selectedId}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-30 disabled:hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* 画布区域 */}
        <div
          ref={containerRef}
          className="relative bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden"
          style={{
            width: '100%',
            height: '400px',
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 空白提示 */}
          {locations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <LayoutGrid className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>点击上方房间按钮添加</p>
              </div>
            </div>
          )}

          {locations.map(location => {
            const config = ROOM_TYPES[(location as any).roomType as keyof typeof ROOM_TYPES] || ROOM_TYPES.living;
            const isSelected = selectedId === location.id;
            
            return (
              <div
                key={location.id}
                className={`absolute rounded-lg cursor-pointer transition-all duration-150 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : 'hover:ring-2 hover:ring-primary/30 hover:shadow-md'
                }`}
                style={{
                  left: location.bounds.x,
                  top: location.bounds.y,
                  width: location.bounds.width,
                  height: location.bounds.height,
                  background: config.pattern,
                  border: `3px solid ${isSelected ? '#3B82F6' : config.border}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDragging) {
                    setSelectedId(location.id);
                    setSelectedLocationId(location.id);
                  }
                }}
                onMouseDown={(e) => handleMouseDown(e)}
              >
                {/* 房间名称 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-sm font-semibold" style={{ color: config.border }}>
                    {config.icon} {location.name}
                  </span>
                </div>
                
                {/* 调整大小手柄 */}
                {isSelected && (
                  <div 
                    className="absolute -right-1 -bottom-1 w-5 h-5 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                    onMouseDown={(e) => handleResizeStart(e, 'se')}
                  >
                    <GripHorizontal className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 提示 */}
        <p className="text-sm text-gray-500 mt-4 text-center">
          点击选择房间 → 拖拽移动位置 → 右下角调整大小
        </p>
      </div>

      {/* 选中信息 */}
      {selectedId && (
        <div className="card animate-slideUp border-l-4 border-l-primary">
          <h3 className="font-semibold text-gray-700 mb-2">已选中位置</h3>
          <p className="text-primary font-medium">
            {locations.find(l => l.id === selectedId)?.name}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            可以在物品管理中添加这个位置的物品
          </p>
        </div>
      )}
    </div>
  );
}
