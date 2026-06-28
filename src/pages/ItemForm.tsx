import ConfirmDialog from '../components/ConfirmDialog';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, X, Loader2, Camera, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_CATEGORIES, Item, Category } from '../types';
import { uploadImage, deleteImage } from '../services/storage';
import { analyzeImageWithAI } from '../services/ai';
import { useToast } from '../components/Toast';
import { Button, Card, Input } from '../components/ui';

export default function ItemForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, locations, addItem, updateItem, deleteItem } = useStore();
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = Boolean(id);
  const routeState = location.state as { imageUrl?: string; aiPreFill?: any; autoScanComplete?: boolean; } | null;

  const [form, setForm] = useState<Omit<Item, 'id' | 'createdAt'>>({
    name: routeState?.aiPreFill?.name || '',
    category: routeState?.aiPreFill?.category && DEFAULT_CATEGORIES.includes(routeState.aiPreFill.category)
      ? routeState.aiPreFill.category
      : DEFAULT_CATEGORIES[0],
    quantity: 1,
    description: routeState?.aiPreFill?.description || (routeState?.aiPreFill?.name && routeState?.autoScanComplete ? '🚀 通过 AI 视觉扫描极速录入' : ''),
    locationId: searchParams.get('locationId') || '',
    expiryDate: routeState?.aiPreFill?.expiryDate || '',
    imageUrl: routeState?.imageUrl || '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    if (!file.type.startsWith('image/')) {
      addToast('error', '只能上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', '图片大小不能超过 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setForm(prev => ({ ...prev, imageUrl: url }));
      } else {
        addToast('error', '图片上传失败，请重试');
      }
    } catch (error) {
      addToast('error', '图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const oldUrl = form.imageUrl;
    setForm(prev => ({ ...prev, imageUrl: '' }));

    if (oldUrl) {
      deleteImage(oldUrl).catch(console.error);
    }
  };

  const handleAIAnalyze = async () => {
    if (!form.imageUrl) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageWithAI(form.imageUrl);
      if (result) {
        setForm(prev => ({
          ...prev,
          name: result.name || prev.name,
          category: (DEFAULT_CATEGORIES.includes(result.category as Category) ? result.category : prev.category) as Category,
          expiryDate: result.expiryDate || prev.expiryDate,
        }));
      } else {
        addToast('warning', 'AI 识别未返回结果，请确保 API 密钥正确且图片清晰');
      }
    } catch (error) {
      console.error(error);
      addToast('error', 'AI 识别请求失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="swiss-enter max-w-2xl mx-auto">
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除物品"
        message={`确定要删除"${form.name}"吗？此操作无法撤回。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white flex-1">
          {isEdit ? '编辑物品' : '添加新物品'}
        </h1>
        {isEdit && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 border-2 border-swiss-red text-swiss-red flex items-center justify-center hover:bg-swiss-red hover:text-white pointer-events-auto"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 物品名称 */}
        <Card>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">物品名称 *</label>
          <Input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
            placeholder="例如：笔记本电脑、冬季被子..."
            required
          />
        </Card>

        {/* 照片集 (Image Upload) */}
        <Card>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" /> 物品照片
          </label>

          <div className="relative group border-2 border-dashed border-black dark:border-white hover:border-swiss-red">
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
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white flex items-center justify-center z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* AI 识别按钮层 */}
                <div className="absolute bottom-3 left-0 w-full flex justify-center z-10">
                  <button
                    type="button"
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold border-2 border-white"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isAnalyzing ? '正在用 AI 提取信息...' : '✨ 让 AI 来认一下'}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                    <span className="text-sm font-bold mb-1">正在上传至家庭云柜...</span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 border-2 border-black dark:border-white flex items-center justify-center mb-3">
                      <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <span className="text-sm font-bold mb-1">点击拍照或上传图片</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">支持 JPG, PNG, WEBP (上限 5MB)</span>
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
        </Card>

        {/* 分类 & 数量 */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">分类</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wide border-2 border-black dark:border-white ${form.category === cat
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                      } `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">数量</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
                  className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-bold text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  −
                </button>
                <Input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="text-center w-20"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, quantity: form.quantity + 1 })}
                  className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-bold text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">存放位置</label>
          {locations.length === 0 ? (
            <div className="text-center py-6 border-2 border-black dark:border-white">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">还没有添加位置</p>
              <button
                type="button"
                onClick={() => navigate('/floorplan')}
                className="text-sm font-bold text-black dark:text-white hover:underline"
              >
                去平面图添加 →
              </button>
            </div>
          ) : (
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="w-full px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent"
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
        </Card>

        {/* 📅 保质期设置 */}
        <Card>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            📅 保质期 <span className="text-xs text-gray-400 dark:text-gray-500 font-normal normal-case tracking-normal">(选填)</span>
          </label>
          <div className="space-y-4">
            <Input
              type="date"
              value={form.expiryDate || ''}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full"
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
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-2 border-black dark:border-white ${btn.months === 0 ? 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black' : 'text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* 备注 */}
        <Card>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">备注</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border-2 border-black dark:border-white text-sm font-bold text-gray-700 dark:text-gray-200 outline-none transition-all bg-transparent min-h-[120px] resize-none"
            placeholder="可选：添加备注信息，如购买日期、保修期等..."
          />
        </Card>

        {/* Submit */}
        <Button type="submit" variant="primary" className="w-full py-4 text-lg">
          <Save className="w-5 h-5" />
          {isEdit ? '保存修改' : '添加物品'}
        </Button>
      </form>
    </div>
  );
}
