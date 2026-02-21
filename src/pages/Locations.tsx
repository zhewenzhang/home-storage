import { useState } from 'react';
import { Plus, Trash2, Edit, Home, X, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

// 位置类型图标映射
const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  room: { icon: '🏠', label: '房间' },
  cabinet: { icon: '🗄️', label: '柜子' },
  drawer: { icon: '🗃️', label: '抽屉' },
  shelf: { icon: '📦', label: '架子' },
  box: { icon: '📦', label: '盒子' },
};

// 确认对话框
function ConfirmDialog({
  open, title, message, onConfirm, onCancel
}: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary flex-1">取消</button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-2xl font-bold text-white transition-all"
            style={{ backgroundColor: '#EF4444' }}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Locations() {
  const { locations, items, addLocation, updateLocation, deleteLocation } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState<{
    name: string;
    type: 'room' | 'cabinet' | 'drawer' | 'shelf' | 'box';
    parentId: string | null;
  }>({
    name: '',
    type: 'room',
    parentId: '',
  });

  const rooms = locations.filter(l => l.type === 'room');
  const getChildLocations = (roomId: string) => locations.filter(l => l.parentId === roomId && l.type !== 'room');
  const getItemCount = (locId: string) => items.filter(i => i.locationId === locId).length;

  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

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

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteLocation(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-enter max-w-3xl mx-auto">
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除位置"
        message={`确定要删除"${deleteTarget?.name}"吗？该位置下的物品将变为"未分配"状态。`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">存储位置</h2>
          <p className="text-sm text-gray-500 mt-1">{locations.length} 个位置，{items.length} 件物品</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', type: 'room', parentId: '' });
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          添加位置
        </button>
      </div>

      {/* Add/Edit Form — Modal Style */}
      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingId ? '编辑位置' : '添加新位置'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="例如：主卧衣柜"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">类型</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key as any })}
                      className={`p-3 rounded-xl text-center transition-all border ${form.type === key
                        ? 'bg-[#EAF4F8] border-[#3B6D8C] text-[#3B6D8C] shadow-md'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <span className="text-xl block">{config.icon}</span>
                      <span className="text-xs font-bold mt-1 block">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {rooms.length > 0 && form.type !== 'room' && (
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">所属房间</label>
                  <select
                    value={form.parentId || ''}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value === '' ? '' : e.target.value })}
                    className="input-field"
                  >
                    <option value="">不指定房间</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? '保存' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="btn-secondary"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Home className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">还没有添加存储位置</h3>
          <p className="text-sm text-gray-400 mb-6">先去平面图绘制房间，或在此手动添加</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mx-auto"
          >
            <Plus className="w-4 h-4" /> 添加第一个位置
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => {
            const children = getChildLocations(room.id);
            const totalItems = getItemCount(room.id) + children.reduce((sum, c) => sum + getItemCount(c.id), 0);
            const isExpanded = expandedRooms.has(room.id);

            return (
              <div key={room.id} className="card overflow-hidden">
                <div className="flex items-center gap-4">
                  {/* Expand Toggle */}
                  {children.length > 0 ? (
                    <button onClick={() => toggleRoom(room.id)} className="p-1 rounded-lg hover:bg-gray-100 transition-all">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>
                  ) : (
                    <div className="w-7" />
                  )}

                  <div className="w-12 h-12 rounded-2xl bg-[#EAF4F8] flex items-center justify-center text-2xl flex-shrink-0">
                    🏠
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{room.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {children.length > 0 && `${children.length} 个收纳点 · `}{totalItems} 件物品
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: room.id, name: room.name })}
                      className="p-2 rounded-xl hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {isExpanded && children.length > 0 && (
                  <div className="mt-4 ml-10 space-y-2 pt-4 border-t border-gray-100">
                    {children.map(child => {
                      const config = TYPE_CONFIG[child.type] || TYPE_CONFIG.box;
                      return (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 group hover:bg-gray-100 transition-all"
                        >
                          <span className="text-lg">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-700">{child.name}</span>
                            <span className="text-xs text-gray-400 ml-2">{getItemCount(child.id)} 件</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(child)} className="p-1 rounded-lg hover:bg-white">
                              <Edit className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: child.id, name: child.name })} className="p-1 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Orphan locations */}
          {locations.filter(l => l.type !== 'room' && !l.parentId).length > 0 && (
            <div className="card">
              <h3 className="text-sm font-bold text-gray-400 mb-3">未归属房间</h3>
              <div className="space-y-2">
                {locations.filter(l => l.type !== 'room' && !l.parentId).map(child => {
                  const config = TYPE_CONFIG[child.type] || TYPE_CONFIG.box;
                  return (
                    <div key={child.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 group">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-bold text-gray-700 flex-1">{child.name}</span>
                      <button onClick={() => setDeleteTarget({ id: child.id, name: child.name })} className="p-1 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
