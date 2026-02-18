import { useState, useRef } from 'react';
import { Plus, Move, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

type Tool = 'select' | 'add' | 'move';

export default function FloorPlan() {
  const { locations, floorPlan, addLocation, updateLocation, setSelectedLocationId } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 预设房间模板
  const roomTemplates = [
    { name: '客厅', width: 200, height: 150 },
    { name: '主卧', width: 160, height: 140 },
    { name: '次卧', width: 140, height: 120 },
    { name: '厨房', width: 120, height: 100 },
    { name: '卫生间', width: 80, height: 100 },
    { name: '阳台', width: 100, height: 80 },
  ];

  // 添加新位置
  const addNewLocation = (template?: { name: string; width: number; height: number }) => {
    const newLocation = {
      name: template?.name || '新位置',
      type: 'room' as const,
      parentId: null,
      bounds: {
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 150,
        width: template?.width || 150,
        height: template?.height || 100,
      }
    };
    
    addLocation(newLocation);
  };

  // 处理点击/拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'add') {
      // 添加新区域
      addNewLocation();
    } else if (tool === 'select') {
      // 检查是否点击了某个位置
      const clickedLocation = locations.find(loc => {
        const bx = (loc.bounds.x / (floorPlan?.width || 800)) * 100;
        const by = (loc.bounds.y / (floorPlan?.height || 600)) * 100;
        const bw = (loc.bounds.width / (floorPlan?.width || 800)) * 100;
        const bh = (loc.bounds.height / (floorPlan?.height || 600)) * 100;
        
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        
        return px >= bx && px <= bx + bw && py >= by && py <= by + bh;
      });
      
      if (clickedLocation) {
        setSelectedId(clickedLocation.id);
        setSelectedLocationId(clickedLocation.id);
        
        // 开始拖拽
        const offsetX = x - (clickedLocation.bounds.x / (floorPlan?.width || 800)) * rect.width;
        const offsetY = y - (clickedLocation.bounds.y / (floorPlan?.height || 600)) * rect.height;
        setDragOffset({ x: offsetX, y: offsetY });
      } else {
        setSelectedId(null);
        setSelectedLocationId(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !selectedId || tool !== 'move') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    // 转换为百分比
    const newX = Math.max(0, (x / rect.width) * (floorPlan?.width || 800));
    const newY = Math.max(0, (y / rect.height) * (floorPlan?.height || 600));
    
    const loc = locations.find(l => l.id === selectedId);
    if (loc) {
      updateLocation(selectedId, {
        bounds: {
          ...loc.bounds,
          x: newX,
          y: newY
        }
      });
    }
  };

  const handleMouseUp = () => {
    // nothing
  };

  // 删除选中位置
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">平面图编辑</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded-xl ${tool === 'select' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            title="选择"
          >
            <Move className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('add')}
            className={`p-2 rounded-xl ${tool === 'add' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            title="添加区域"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Add Templates */}
      <div className="card">
        <h3 className="font-semibold mb-3">快速添加房间</h3>
        <div className="grid grid-cols-3 gap-2">
          {roomTemplates.map(template => (
            <button
              key={template.name}
              onClick={() => addNewLocation(template)}
              className="p-3 rounded-xl bg-gray-50 hover:bg-primary/10 transition-all text-center"
            >
              <p className="font-medium text-sm">{template.name}</p>
              <p className="text-xs text-gray-400">{template.width}×{template.height}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Floor Plan Canvas */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{floorPlan?.name || '我的家'}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={!selectedId}
              className="p-2 rounded-lg bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Drawing Area */}
        <div
          ref={containerRef}
          className={`floor-plan-area cursor-${tool === 'move' ? 'move' : tool === 'add' ? 'crosshair' : 'default'}`}
          style={{
            background: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {locations.map(location => (
            <div
              key={location.id}
              className={`absolute rounded-lg flex items-center justify-center text-white font-medium text-sm cursor-pointer transition-all ${
                selectedId === location.id 
                  ? 'ring-4 ring-accent ring-offset-2' 
                  : 'hover:ring-2 hover:ring-primary/50'
              }`}
              style={{
                left: `${(location.bounds.x / (floorPlan?.width || 800)) * 100}%`,
                top: `${(location.bounds.y / (floorPlan?.height || 600)) * 100}%`,
                width: `${(location.bounds.width / (floorPlan?.width || 800)) * 100}%`,
                height: `${(location.bounds.height / (floorPlan?.height || 600)) * 100}%`,
                background: 'linear-gradient(135deg, #4A90A4 0%, #3D7A8C 100%)',
                boxShadow: '0 4px 12px rgba(74, 144, 164, 0.3)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(location.id);
                setSelectedLocationId(location.id);
              }}
            >
              <span className="px-2 truncate">{location.name}</span>
            </div>
          ))}
        </div>

        {/* Tips */}
        <p className="text-sm text-gray-500 mt-3 text-center">
          点击位置可查看物品，或拖拽调整位置
        </p>
      </div>

      {/* Selected Location Info */}
      {selectedId && (
        <div className="card animate-slideUp">
          <h3 className="font-semibold mb-2">已选中位置</h3>
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
