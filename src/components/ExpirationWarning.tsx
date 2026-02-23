import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function ExpirationWarning() {
    const { items, deleteItem } = useStore();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // 计算过期状态
    const { expired, expiringSoon } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        const expiredList: typeof items = [];
        const expiringList: typeof items = [];

        items.forEach(item => {
            if (item.expiryDate) {
                const expDate = new Date(item.expiryDate);
                expDate.setHours(0, 0, 0, 0);

                if (expDate < today) {
                    expiredList.push(item);
                } else if (expDate <= thirtyDaysLater) {
                    expiringList.push(item);
                }
            }
        });

        // 按日期排序 (最近的最前)
        expiredList.sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
        expiringList.sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

        return { expired: expiredList, expiringSoon: expiringList };
    }, [items]);

    const totalWarnings = expired.length + expiringSoon.length;

    if (totalWarnings === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden mb-6 flex flex-col">
            {/* 预警头部 */}
            <div
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${expired.length > 0 ? 'bg-red-50 hover:bg-red-100/50' : 'bg-orange-50 hover:bg-orange-100/50'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${expired.length > 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {expired.length > 0 ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm md:text-base ${expired.length > 0 ? 'text-red-700' : 'text-orange-700'}`}>
                            {expired.length > 0 ? '物资过期警报' : '物资临期提醒'}
                        </h3>
                        <p className={`text-xs ${expired.length > 0 ? 'text-red-600/80' : 'text-orange-600/80'}`}>
                            {expired.length > 0 ? `含有 ${expired.length} 项已过期物资` : ''}
                            {expired.length > 0 && expiringSoon.length > 0 ? '，' : ''}
                            {expiringSoon.length > 0 ? `${expiringSoon.length} 项在 30 天内过期` : ''}
                        </p>
                    </div>
                </div>
                <div className={`p-2 rounded-full ${expired.length > 0 ? 'text-red-400' : 'text-orange-400'}`}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* 展开的列表 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100 bg-white"
                    >
                        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                            {/* 已过期 */}
                            {expired.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50/50 group transition-colors">
                                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/items/${item.id}`)}>
                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                            过
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{item.name} <span className="text-gray-400 text-xs ml-1">x{item.quantity}</span></p>
                                            <p className="text-xs text-red-500 font-medium">过期于 {item.expiryDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { if (window.confirm(`确定要彻底丢弃并删除 [${item.name}] 吗？`)) deleteItem(item.id); }}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="丢弃并删除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* 即将过期 */}
                            {expiringSoon.map(item => {
                                const daysLeft = Math.ceil((new Date(item.expiryDate!).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50/50 group transition-colors">
                                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/items/${item.id}`)}>
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                临
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{item.name} <span className="text-gray-400 text-xs ml-1">x{item.quantity}</span></p>
                                                <p className="text-xs text-orange-500 font-medium">还有 {daysLeft} 天过期 ({item.expiryDate})</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { if (window.confirm(`确定已消耗完 [${item.name}] 吗？`)) deleteItem(item.id); }}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                title="已消耗完毕"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
