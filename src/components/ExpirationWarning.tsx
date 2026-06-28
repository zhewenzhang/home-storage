import { useMemo, useState } from 'react';
import { AlertCircle, Clock, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function ExpirationWarning() {
    const { items, deleteItem } = useStore();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

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

        expiredList.sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
        expiringList.sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

        return { expired: expiredList, expiringSoon: expiringList };
    }, [items]);

    const totalWarnings = expired.length + expiringSoon.length;

    if (totalWarnings === 0) return null;

    return (
        <div className="border-2 border-black dark:border-white overflow-hidden mb-4 transition-colors">
            {/* Header */}
            <div
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${expired.length > 0 ? 'bg-swiss-red/10 hover:bg-swiss-red/20' : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 border-2 ${expired.length > 0 ? 'border-swiss-red text-swiss-red' : 'border-black dark:border-white text-black dark:text-white'}`}>
                        {expired.length > 0 ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className={`font-black text-sm uppercase tracking-wide ${expired.length > 0 ? 'text-swiss-red' : 'text-black dark:text-white'}`}>
                            {expired.length > 0 ? '过期警报' : '临期提醒'}
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${expired.length > 0 ? 'text-swiss-red/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            {expired.length > 0 ? `${expired.length} 项已过期` : ''}
                            {expired.length > 0 && expiringSoon.length > 0 ? ' / ' : ''}
                            {expiringSoon.length > 0 ? `${expiringSoon.length} 项 30 天内过期` : ''}
                        </p>
                    </div>
                </div>
                <div className={expired.length > 0 ? 'text-swiss-red' : 'text-black dark:text-white'}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* Expanded list */}
            <div
                className={`transition-all duration-200 ease-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="border-t-2 border-black dark:border-white bg-white dark:bg-black">
                    <div className="p-2 space-y-0 max-h-[300px] overflow-y-auto">
                        {/* Expired */}
                        {expired.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 border-b-2 border-black/10 dark:border-white/10 hover:bg-swiss-red/5 group transition-colors">
                                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/items/${item.id}`)}>
                                    <div className="w-8 h-8 border-2 border-swiss-red flex items-center justify-center text-swiss-red font-black text-[10px] uppercase">
                                        过
                                    </div>
                                    <div>
                                        <p className="font-bold text-black dark:text-white text-sm uppercase">{item.name} <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">x{item.quantity}</span></p>
                                        <p className="text-[10px] text-swiss-red font-bold uppercase">过期于 {item.expiryDate}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { if (window.confirm(`确定要彻底丢弃并删除 [${item.name}] 吗？`)) deleteItem(item.id); }}
                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-swiss-red hover:bg-swiss-red/10 transition-colors"
                                        title="丢弃并删除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Expiring soon */}
                        {expiringSoon.map(item => {
                            const daysLeft = Math.ceil((new Date(item.expiryDate!).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={item.id} className="flex items-center justify-between p-3 border-b-2 border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-900 group transition-colors">
                                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/items/${item.id}`)}>
                                        <div className="w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center text-black dark:text-white font-black text-[10px] uppercase">
                                            临
                                        </div>
                                        <div>
                                            <p className="font-bold text-black dark:text-white text-sm uppercase">{item.name} <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">x{item.quantity}</span></p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{daysLeft} 天后过期 ({item.expiryDate})</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { if (window.confirm(`确定已消耗完 [${item.name}] 吗？`)) deleteItem(item.id); }}
                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-swiss-red hover:bg-swiss-red/10 transition-colors"
                                            title="已消耗完毕"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
