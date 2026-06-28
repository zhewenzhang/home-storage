import { useState, useMemo } from 'react';
import { X, Camera, Sparkles, Loader2, Plus, Minus, Check, MapPin, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { uploadImage } from '../services/storage';
import { analyzeBatchImageWithAI } from '../services/ai';
import { Button } from './ui';

interface AIBatchImportModalProps {
    onClose: () => void;
    onSuccess: (count: number) => void;
}

interface ParsedItem {
    name: string;
    category: string;
    quantity: number;
    expiryDate: string;
    description: string;
    locationId: string; // 用户分配的具体存储位置
}

const CATEGORIES = ["电子产品", "工具", "衣物", "书籍", "厨房用品", "药品", "纪念品", "其他"];

export default function AIBatchImportModal({ onClose, onSuccess }: AIBatchImportModalProps) {
    const { locations } = useStore();
    const [step, setStep] = useState<'upload' | 'analyzing' | 'confirm'>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState('');
    const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
    const [globalLocationId, setGlobalLocationId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const roomLocations = useMemo(() => locations.filter(l => l.type === 'room'), [locations]);
    const cabinetLocations = useMemo(() => locations.filter(l => l.type !== 'room'), [locations]);

    // 处理文件选择
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 触发图像多模态分析
    const handleStartAnalysis = async () => {
        if (!selectedFile) return;
        setStep('analyzing');
        setLoadingText('正在将照片存入家庭云端...');

        try {
            // 1. 上传图片到 Firebase Storage
            const downloadUrl = await uploadImage(selectedFile);
            if (!downloadUrl) throw new Error('图片存储同步失败');

            setLoadingText('硅基管家正在帮您仔细辨识这一袋子囤货...');

            // 2. 调用多模态批量视觉提取
            const visionResults = await analyzeBatchImageWithAI(downloadUrl);
            if (visionResults.length === 0) {
                alert('未能在图片中识别出物品，请确保光线充足并清晰拍照。');
                setStep('upload');
                return;
            }

            // 3. 构建待编辑列表并尝试智能推荐位置
            const initialLocation = cabinetLocations[0]?.id || roomLocations[0]?.id || '';
            const mapped = visionResults.map(item => {
                // 简单的名称位置推荐逻辑：例如含有“药”字则推荐带“药”的空间
                let matchedLocId = initialLocation;
                const found = locations.find(loc => {
                    if (item.category === '药品' && (loc.name.includes('药') || loc.name.includes('医药'))) return true;
                    if (item.category === '厨房用品' && (loc.name.includes('厨') || loc.name.includes('冰箱'))) return true;
                    if (item.category === '衣物' && (loc.name.includes('衣') || loc.name.includes('柜'))) return true;
                    return false;
                });
                if (found) matchedLocId = found.id;

                return {
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    expiryDate: item.expiryDate,
                    description: item.description || '',
                    locationId: matchedLocId,
                };
            });

            setParsedItems(mapped);
            setStep('confirm');
        } catch (err) {
            console.error('[AI Batch Upload] 失败:', err);
            alert('AI 批量分析失败，请重试');
            setStep('upload');
        }
    };

    // 一键批量修改位置
    const applyGlobalLocation = (locId: string) => {
        setGlobalLocationId(locId);
        if (locId) {
            setParsedItems(prev => prev.map(item => ({ ...item, locationId: locId })));
        }
    };

    // 修改单项属性
    const updateItemField = (index: number, field: keyof ParsedItem, value: any) => {
        setParsedItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    // 提交一键极速入库
    const handleSaveAll = async () => {
        if (parsedItems.length === 0) return;
        setIsSaving(true);
        try {
            // 调用 store 中的批量操作接口
            const { processBatch } = useStore.getState();
            
            // 构造批量写入格式
            const batchAdds = parsedItems.map(item => ({
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                description: item.description,
                locationId: item.locationId || "",
                expiryDate: item.expiryDate || undefined,
            }));

            await processBatch(batchAdds, [], []);
            onSuccess(parsedItems.length);
        } catch (err) {
            console.error('[Batch Save] 批量保存出错:', err);
            alert('保存失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-black p-6 w-full max-w-2xl swiss-enter relative border-2 border-black dark:border-white max-h-[90vh] flex flex-col">
                {/* 顶部标题与关闭 */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white mb-4 flex-shrink-0">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 text-black dark:text-white">
                        <Sparkles className="w-5 h-5 text-swiss-red animate-pulse" /> AI 拍照批量收纳
                    </h3>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 1. 上传页面 */}
                {step === 'upload' && (
                    <div className="flex-1 flex flex-col justify-center py-6">
                        {!previewUrl ? (
                            <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white cursor-pointer p-10 text-center flex flex-col items-center justify-center transition-all bg-gray-50 dark:bg-zinc-900/20 group">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-black dark:border-white mb-4 group-hover:scale-105 transition-transform">
                                    <Camera className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="font-bold text-sm text-black dark:text-gray-100">选择照片或立即拍摄</span>
                                <span className="text-xs text-gray-400 mt-2">支持平铺的多件物品全局清晰照</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative border-2 border-black dark:border-white aspect-video max-h-60 overflow-hidden bg-black flex items-center justify-center">
                                    <img src={previewUrl} alt="预览" className="max-h-full max-w-full object-contain" />
                                    <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-black text-white p-1.5 border border-white hover:bg-swiss-red">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <Button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} variant="outline" className="flex-1">
                                        重新拍照
                                    </Button>
                                    <Button onClick={handleStartAnalysis} variant="primary" className="flex-1">
                                        <Sparkles className="w-4 h-4 inline mr-1" /> 开始 AI 批量识别
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. 识别等待 */}
                {step === 'analyzing' && (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-swiss-red border-t-transparent rounded-full animate-spin"></div>
                            <Sparkles className="w-6 h-6 text-swiss-red absolute animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-black text-black dark:text-white animate-pulse">{loadingText}</p>
                            <p className="text-xs text-gray-400">Gemini 正在多模态神经元提取，请稍候约 5-10 秒...</p>
                        </div>
                    </div>
                )}

                {/* 3. 确认入库列表 */}
                {step === 'confirm' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* 批量设置归属位置 */}
                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 border-2 border-black dark:border-white mb-4 flex items-center gap-3 flex-shrink-0">
                            <MapPin className="w-4 h-4 text-swiss-red" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">一键指定全部位置</span>
                            <select
                                value={globalLocationId}
                                onChange={(e) => applyGlobalLocation(e.target.value)}
                                className="flex-1 bg-transparent border-b-2 border-black dark:border-white outline-none text-xs font-bold text-black dark:text-white py-1 transition-colors focus:border-swiss-red"
                            >
                                <option value="" className="dark:bg-black">选择目标抽屉/柜子...</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id} className="dark:bg-black">
                                        {loc.type === 'room' ? '🏠' : '📦'} {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 滚动列表 */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 border-b-2 border-black dark:border-white pb-4 mb-4">
                            {parsedItems.map((item, index) => (
                                <div key={index} className="border-2 border-black dark:border-white p-4 relative bg-gray-50/50 dark:bg-zinc-900/10 hover:border-swiss-red transition-colors space-y-3">
                                    {/* 顶部名称与分类 */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase">物品名</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItemField(index, 'name', e.target.value)}
                                                className="w-full bg-transparent border-b border-black dark:border-white focus:border-swiss-red outline-none text-sm font-bold py-0.5 text-black dark:text-white"
                                            />
                                        </div>
                                        <div className="w-full sm:w-40">
                                            <label className="text-[9px] font-black text-gray-400 uppercase">分类</label>
                                            <select
                                                value={item.category}
                                                onChange={(e) => updateItemField(index, 'category', e.target.value)}
                                                className="w-full bg-transparent border-b border-black dark:border-white focus:border-swiss-red outline-none text-xs font-bold py-1 text-black dark:text-white"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat} className="dark:bg-black">{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 位置、数量与保质期 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* 归属位置 */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">存放位置</label>
                                            <select
                                                value={item.locationId}
                                                onChange={(e) => updateItemField(index, 'locationId', e.target.value)}
                                                className="w-full bg-transparent border-b border-black dark:border-white focus:border-swiss-red outline-none text-xs font-bold py-1 text-black dark:text-white"
                                            >
                                                <option value="" className="dark:bg-black">未分配</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id} className="dark:bg-black">
                                                        {loc.type === 'room' ? '🏠' : '📦'} {loc.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 保质期 */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">保质期 (如不需要留空)</label>
                                            <input
                                                type="date"
                                                value={item.expiryDate}
                                                onChange={(e) => updateItemField(index, 'expiryDate', e.target.value)}
                                                className="w-full bg-transparent border-b border-black dark:border-white focus:border-swiss-red outline-none text-xs font-bold py-0.5 text-black dark:text-white"
                                            />
                                        </div>

                                        {/* 数量调整 */}
                                        <div className="flex flex-col justify-end">
                                            <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">收纳数量</label>
                                            <div className="flex items-center border-2 border-black dark:border-white w-28 bg-white dark:bg-zinc-900">
                                                <button
                                                    onClick={() => updateItemField(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                    className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border-r border-black dark:border-white"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="flex-1 text-center font-mono font-bold text-sm text-black dark:text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItemField(index, 'quantity', item.quantity + 1)}
                                                    className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border-l border-black dark:border-white"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 描述备注 */}
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase block">AI 状态诊断</label>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 text-swiss-red" />
                                            <span>{item.description || '无备注数据'}</span>
                                        </div>
                                    </div>

                                    {/* 移除卡片按钮 */}
                                    <button
                                        onClick={() => setParsedItems(prev => prev.filter((_, idx) => idx !== index))}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-swiss-red transition-colors p-1"
                                        title="不录入此项"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 底部操作 */}
                        <div className="flex gap-4 flex-shrink-0">
                            <Button
                                onClick={() => { setStep('upload'); setSelectedFile(null); setPreviewUrl(null); }}
                                disabled={isSaving}
                                variant="outline"
                                className="flex-1"
                            >
                                重新拍照
                            </Button>
                            <Button
                                onClick={handleSaveAll}
                                disabled={isSaving || parsedItems.length === 0}
                                variant="primary"
                                className="flex-1"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1.5 inline" /> 保存入库中...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-1.5 inline" /> 确认批量入库 ({parsedItems.length}件)
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
