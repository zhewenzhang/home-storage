import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_CATEGORIES, Item } from '../types';

export default function ItemForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, locations, addItem, updateItem, deleteItem } = useStore();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<Omit<Item, 'id' | 'createdAt'>>({
    name: '',
    category: DEFAULT_CATEGORIES[0],
    quantity: 1,
    description: '',
    locationId: searchParams.get('locationId') || '',
  });

  // 加载现有数据
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
    if (id && confirm('确定要删除这个物品吗？')) {
      deleteItem(id);
      navigate('/items');
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">
          {isEdit ? '编辑物品' : '添加物品'}
        </h1>
        {isEdit && (
          <button 
            onClick={handleDelete}
            className="ml-auto p-2 rounded-xl hover:bg-red-100"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物品名称 *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="例如：笔记本电脑"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input"
          >
            {DEFAULT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            数量
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
              className="input text-center w-20"
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: form.quantity + 1 })}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            存放位置
          </label>
          {locations.length === 0 ? (
            <p className="text-gray-500 text-sm mb-2">
              还没有添加位置，请先去
              <span 
                className="text-primary cursor-pointer"
                onClick={() => navigate('/floorplan')}
              >
                平面图
              </span>
              添加
            </p>
          ) : (
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="input"
            >
              <option value="">选择位置...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input min-h-[100px]"
            placeholder="添加备注信息..."
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          {isEdit ? '保存修改' : '添加物品'}
        </button>
      </form>
    </div>
  );
}
