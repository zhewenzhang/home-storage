import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle, Image as ImageIcon, X, Loader2, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_CATEGORIES, Item } from '../types';
import { uploadImage, deleteImage } from '../services/storage';

// 确认对话框组件
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

export default function ItemForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, locations, addItem, updateItem, deleteItem } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = Boolean(id);

  const [form, setForm] = useState<Omit<Item, 'id' | 'createdAt'>>({
    name: '',
    category: DEFAULT_CATEGORIES[0],
    quantity: 1,
    description: '',
    locationId: searchParams.get('locationId') || '',
    expiryDate: '',
    imageUrl: '',
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      const existing = items.find(item => item.id === id);
      if (existing) {
        setForm({
          name: existing.name,
          category: existing.category,
          quantity: existing.quantity,
          description: existing.description,
          locationId: existing.locationId,
          expiryDate: existing.expiryDate || '',
          imageUrl: existing.imageUrl || '',
        });
      }
    }
  }, [id, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (isEdit && id) {
      updateItem(id, form);
    } else {
      addItem(form);
    }
    navigate('/items');
  };

  const handleDelete = () => {
    if (id) {
      deleteItem(id);
      navigate('/items');
    }
  };

  // 按房间分组位置（包括柜子等子级）
  const rooms = locations.filter(l => l.type === 'room');
  const getChildLocations = (roomId: string) => locations.filter(l => l.parentId === roomId && l.type !== 'room');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (e.g., max 5MB)
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // If there's an existing image, we don't strictly *need* to delete it immediately 
      // (Supabase storage can overwrite or we just leave it orphan for now to be safe until final submit), 
      // but let's just upload the new one.
      const url = await uploadImage(file);
      if (url) {
        setForm(prev => ({ ...prev, imageUrl: url }));
      } else {
        alert('图片上传失败，请重试');
      }
    } catch (error) {
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    // Delete from state immediately
    const oldUrl = form.imageUrl;
    setForm(prev => ({ ...prev, imageUrl: '' }));

    // Attempt backend delete if it's a real supabase URL
    if (oldUrl) {
      deleteImage(oldUrl).catch(console.error);
    }
  };

  return (
    <div className="animate-enter max-w-2xl mx-auto">
      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除物品"
        message={`确定要删除"${form.name}"吗？此操作无法撤回。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold flex-1">
          {isEdit ? '编辑物品' : '添加新物品'}
        </h1>
        {isEdit && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 物品名称 */}
        <div className="card">
          <label className="block text-sm font-bold text-gray-600 mb-3">物品名称 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="例如：笔记本电脑、冬季被子..."
            required
          />
        </div>

        {/* 照片集 (Image Upload) */}
        <div className="card">
          <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-500" /> 物品照片
          </label>

          <div className="relative group rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 transition-all hover:border-emerald-300 hover:bg-emerald-50/50">
            {form.imageUrl ? (
              <div className="relative aspect-video w-full flex items-center justify-center bg-gray-900">
                <img
                  src={form.imageUrl}
                  alt="Item"
                  className="object-contain w-full h-full max-h-[300px]"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 backdrop-blur-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                    <span className="text-sm font-bold text-emerald-600">正在上传至家庭云柜...</span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-600 mb-1">点击拍照或上传图片</span>
                    <span className="text-xs text-gray-400">支持 JPG, PNG, WEBP (上限 5MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* 分类 & 数量 */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">分类</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px - 4 py - 2 rounded - xl text - sm font - bold transition - all border ${form.category === cat
                      ? 'bg-[#3B6D8C] text-white border-[#3B6D8C] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#6B9AC4]'
                      } `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">数量</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-all active:scale-90"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="input-field text-center w-20 text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, quantity: form.quantity + 1 })}
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-all active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 存放位置 — 按层级显示 */}
        <div className="card">
          <label className="block text-sm font-bold text-gray-600 mb-3">存放位置</label>
          {locations.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-sm mb-2">还没有添加位置</p>
              <button
                type="button"
                onClick={() => navigate('/floorplan')}
                className="text-sm font-bold text-[#3B6D8C] hover:underline"
              >
                去平面图添加 →
              </button>
            </div>
          ) : (
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="input-field"
            >
              <option value="">选择位置...</option>
              {rooms.map(room => (
                <optgroup key={room.id} label={`🏠 ${room.name} `}>
                  <option value={room.id}>{room.name}（整个房间）</option>
                  {getChildLocations(room.id).map(child => (
                    <option key={child.id} value={child.id}>
                      └ {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
              {locations.filter(l => l.type !== 'room' && !l.parentId).length > 0 && (
                <optgroup label="未分配房间">
                  {locations.filter(l => l.type !== 'room' && !l.parentId).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
        </div>

        {/* 📅 保质期设置 */}
        <div className="card">
          <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
            📅 保质期 <span className="text-xs text-gray-400 font-normal">(选填)</span>
          </label>
          <div className="space-y-4">
            <input
              type="date"
              value={form.expiryDate || ''}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="input-field"
            />
            {/* 快捷按钮 */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '清空', months: 0 },
                { label: '+1个月', months: 1 },
                { label: '+6个月', months: 6 },
                { label: '+1年', months: 12 },
                { label: '+3年(药品)', months: 36 }
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (btn.months === 0) {
                      setForm({ ...form, expiryDate: '' });
                      return;
                    }
                    const d = new Date();
                    d.setMonth(d.getMonth() + btn.months);
                    setForm({ ...form, expiryDate: d.toISOString().split('T')[0] });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${btn.months === 0 ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="card">
          <label className="block text-sm font-bold text-gray-600 mb-3">备注</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[120px] resize-none"
            placeholder="可选：添加备注信息，如购买日期、保修期等..."
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full py-4 text-lg">
          <Save className="w-5 h-5" />
          {isEdit ? '保存修改' : '添加物品'}
        </button>
      </form>
    </div>
  );
}
