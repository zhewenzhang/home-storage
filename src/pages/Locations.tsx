import ConfirmDialog from '../components/ConfirmDialog';
import { useState } from 'react';
import { Plus, Trash2, Edit, Home, X, ChevronDown, ChevronRight, QrCode } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, Card } from '../components/ui';
import Spinner from '../components/ui/Spinner';
import QRCodeGenerator from '../components/QRCodeGenerator';

// 位置类型图标映射
const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  room: { icon: '🏠', label: '房间' },
  cabinet: { icon: '🗄️', label: '柜子' },
  drawer: { icon: '🗃️', label: '抽屉' },
  shelf: { icon: '📦', label: '架子' },
  box: { icon: '📦', label: '盒子' },
};

export default function Locations() {
  const { locations, items, addLocation, updateLocation, deleteLocation, dataLoaded } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [qrTarget, setQrTarget] = useState<{ id: string; name: string } | null>(null);

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
    <div className="space-y-6 swiss-enter max-w-4xl mx-auto">
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="删除位置"
        message={`确定要删除"${deleteTarget?.name}"吗？该位置下的物品将变为"未分配"状态。`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">存储位置</h2>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{locations.length} 个位置，{items.length} 件物品</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', type: 'room', parentId: '' });
          }}
          variant="primary" size="sm"
        >
          <Plus className="w-4 h-4" />
          添加位置
        </Button>
      </div>

      {/* Add/Edit Form — Modal Style */}
      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-white dark:bg-black border-2 border-black dark:border-white p-8 max-w-md w-full swiss-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-wider text-black dark:text-white">{editingId ? '编辑位置' : '添加新位置'}</h3>
              <button onClick={() => setShowForm(false)} className="border-2 border-black dark:border-white p-1 hover:bg-swiss-red hover:border-swiss-red hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">名称</label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full"
                  placeholder="例如：主卧衣柜"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">类型</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key as any })}
                      className={`p-3 text-center transition-all border-2 ${form.type === key
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-transparent border-black dark:border-white text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
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
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">所属房间</label>
                  <select
                    value={form.parentId || ''}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value === '' ? '' : e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent"
                  >
                    <option value="">不指定房间</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingId ? '保存' : '添加'}
                </Button>
                <Button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  variant="outline"
                >
                  取消
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Locations List */}
      {!dataLoaded ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : locations.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 mx-auto border-2 border-black dark:border-white flex items-center justify-center mb-4">
            <Home className="w-10 h-10 text-gray-300 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">还没有添加存储位置</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">先去平面图绘制房间，或在此手动添加</p>
          <Button
            onClick={() => setShowForm(true)}
            variant="primary" className="mx-auto"
          >
            <Plus className="w-4 h-4" /> 添加第一个位置
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => {
            const children = getChildLocations(room.id);
            const totalItems = getItemCount(room.id) + children.reduce((sum, c) => sum + getItemCount(c.id), 0);
            const isExpanded = expandedRooms.has(room.id);

            return (
              <div key={room.id} className="border-2 border-black dark:border-white p-4 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Expand Toggle */}
                  {children.length > 0 ? (
                    <button onClick={() => toggleRoom(room.id)} className="border-2 border-black dark:border-white p-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  ) : (
                    <div className="w-7" />
                  )}

                  <div className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center text-2xl flex-shrink-0">
                    🏠
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black dark:text-white truncate">{room.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {children.length > 0 && `${children.length} 个收纳点 · `}{totalItems} 件物品
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setQrTarget({ id: room.id, name: room.name })}
                      className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      title="打印空间码"
                    >
                      <QrCode className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: room.id, name: room.name })}
                      className="p-2 border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-swiss-red" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {isExpanded && children.length > 0 && (
                  <div className="mt-4 ml-10 space-y-2 pt-4 border-t-2 border-black dark:border-white">
                    {children.map(child => {
                      const config = TYPE_CONFIG[child.type] || TYPE_CONFIG.box;
                      return (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 border-2 border-black dark:border-white group hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
                        >
                          <span className="text-lg">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-black dark:text-white">{child.name}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{getItemCount(child.id)} 件</span>
                          </div>
                          <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setQrTarget({ id: child.id, name: child.name })} className="p-1.5 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black bg-white md:bg-transparent dark:bg-black md:dark:bg-transparent" title="打印空间码">
                              <QrCode className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            </button>
                            <button onClick={() => handleEdit(child)} className="p-1.5 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black bg-white md:bg-transparent dark:bg-black md:dark:bg-transparent">
                              <Edit className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: child.id, name: child.name })} className="p-1.5 border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white bg-white md:bg-transparent dark:bg-black md:dark:bg-transparent">
                              <Trash2 className="w-3.5 h-3.5 text-swiss-red" />
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
            <Card>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-3">未归属房间</h3>
              <div className="space-y-2">
                {locations.filter(l => l.type !== 'room' && !l.parentId).map(child => {
                  const config = TYPE_CONFIG[child.type] || TYPE_CONFIG.box;
                  return (
                    <div key={child.id} className="flex items-center gap-3 p-3 border-2 border-black dark:border-white group hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-bold text-black dark:text-white flex-1">{child.name}</span>
                      <button onClick={() => setQrTarget({ id: child.id, name: child.name })} className="p-2 mx-1 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black md:opacity-0 group-hover:opacity-100 transition-colors bg-white md:bg-transparent dark:bg-black md:dark:bg-transparent" title="打印空间码">
                        <QrCode className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: child.id, name: child.name })} className="p-2 border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white md:opacity-0 group-hover:opacity-100 transition-colors bg-white md:bg-transparent dark:bg-black md:dark:bg-transparent">
                        <Trash2 className="w-3.5 h-3.5 text-swiss-red" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {qrTarget && (
        <QRCodeGenerator
          locationId={qrTarget.id}
          locationName={qrTarget.name}
          onClose={() => setQrTarget(null)}
        />
      )}
    </div>
  );
}
