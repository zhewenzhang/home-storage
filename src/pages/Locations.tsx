import { useState } from 'react';
import { Plus, Trash2, Edit, Home, Box } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Locations() {
  const { locations, addLocation, updateLocation, deleteLocation } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<{
    name: string;
    type: 'room' | 'cabinet' | 'drawer' | 'shelf' | 'box';
    parentId: string | null;
  }>({
    name: '',
    type: 'room',
    parentId: '',
  });

  // 按类型分组
  const rooms = locations.filter(l => l.type === 'room');
  const childLocations = locations.filter(l => l.type !== 'room');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // 默认位置（在平面图中央显示）
    const bounds = {
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      width: 120,
      height: 80
    };

    const parentId = form.parentId === '' ? null : form.parentId;
    
    if (editingId) {
      updateLocation(editingId, { 
        name: form.name,
        type: form.type,
        parentId,
      });
    } else {
      addLocation({
        name: form.name,
        type: form.type,
        parentId,
        bounds
      });
    }
    
    setForm({ name: '', type: 'room', parentId: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (loc: typeof locations[0]) => {
    setForm({
      name: loc.name,
      type: loc.type,
      parentId: loc.parentId || ''
    });
    setEditingId(loc.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">位置管理</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', type: 'room', parentId: '' });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-slideUp">
          <h3 className="font-semibold mb-3">
            {editingId ? '编辑位置' : '添加新位置'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="位置名称，例如：主卧衣柜"
              required
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="input"
            >
              <option value="room">房间</option>
              <option value="cabinet">柜子</option>
              <option value="drawer">抽屉</option>
              <option value="shelf">架子</option>
              <option value="box">盒子</option>
            </select>
            {rooms.length > 0 && form.type !== 'room' && (
              <select
                value={form.parentId || ''}
                onChange={(e) => setForm({ ...form, parentId: e.target.value === '' ? '' : e.target.value })}
                className="input"
                required={false}
              >
                <option value="">选择所属房间（可选）</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? '保存' : '添加'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="card text-center py-12">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">还没有添加位置</p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            添加第一个位置
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Rooms */}
          {rooms.map(room => (
            <div key={room.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-gray-500">房间</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(room)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => deleteLocation(room.id)}
                    className="p-2 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              {/* Child Locations */}
              {childLocations.filter(c => c.parentId === room.id).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  {childLocations.filter(c => c.parentId === room.id).map(child => (
                    <div 
                      key={child.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{child.name}</span>
                      </div>
                      <button 
                        onClick={() => deleteLocation(child.id)}
                        className="p-1 rounded hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Root Level Child Locations (no parent) */}
          {childLocations.filter(c => !c.parentId).length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3 text-gray-500 text-sm">未分配房间的位置</h3>
              <div className="grid grid-cols-2 gap-2">
                {childLocations.filter(c => !c.parentId).map(child => (
                  <div 
                    key={child.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{child.name}</span>
                    </div>
                    <button 
                      onClick={() => deleteLocation(child.id)}
                      className="p-1 rounded hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
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
