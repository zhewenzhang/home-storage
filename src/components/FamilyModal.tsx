import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getOrCreateInviteCode, joinFamilyByCode, leaveFamily, fetchMyFamilyMembers, kickFamilyMember, updateFamilyAlias } from '../services/family';
import { Users, ClipboardCopy, Check, UserPlus, LogOut, Home as HomeIcon, X, Edit3 } from 'lucide-react';

export default function FamilyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { activeFamilyId, setActiveFamilyId, joinedFamilies, loadFromSupabase } = useStore();

    const [inviteCode, setInviteCode] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [joinError, setJoinError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [joinedUsers, setJoinedUsers] = useState<{ memberId: string, displayName: string, joinedAt: string }[]>([]);
    const [editingAliasOwnerId, setEditingAliasOwnerId] = useState<string | null>(null);
    const [aliasEditValue, setAliasEditValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            getOrCreateInviteCode().then(setInviteCode).catch(console.error);
            // 获取我的家庭成员
            fetchMyFamilyMembers().then(setJoinedUsers).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoin = async () => {
        if (!joinCodeInput.trim()) return;
        setIsLoading(true);
        setJoinError('');
        try {
            await joinFamilyByCode(joinCodeInput);
            await loadFromSupabase(); // 重新加载以获取最新加入的家庭列表
            setJoinCodeInput('');
            alert('成功加入家庭！');
        } catch (err: any) {
            setJoinError(err.message || '加入失败，请检查邀请码');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeave = async (ownerId: string) => {
        if (!window.confirm('确定要退出该家庭吗？退出后将无法查看和编辑该家庭的数据。')) return;
        try {
            await leaveFamily(ownerId);
            if (activeFamilyId === ownerId) {
                setActiveFamilyId(null);
            } else {
                await loadFromSupabase();
            }
        } catch (err) {
            console.error(err);
            alert('退出失败');
        }
    };

    const handleKick = async (memberId: string, name: string) => {
        if (!window.confirm(`确定要将 ${name} 踢出您的家庭空间吗？他们将立即失去访问权限。`)) return;
        try {
            await kickFamilyMember(memberId);
            setJoinedUsers(prev => prev.filter(u => u.memberId !== memberId));
        } catch (err) {
            console.error(err);
            alert('踢出失败');
        }
    };

    const handleSaveAlias = async (ownerId: string) => {
        try {
            await updateFamilyAlias(ownerId, aliasEditValue);
            setEditingAliasOwnerId(null);
            // 刷新本地数据
            await useStore.getState().reloadJoinedFamilies();
        } catch (err) {
            console.error(err);
            alert('修改备注失败');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-enter">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#2A4D63' }}>
                        <Users className="w-6 h-6" />
                        家庭共享与空间切换
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    {/* 我的邀请码 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">我的家庭邀请码</h3>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">将此代码分享给家人，他们即可查看和编辑您的物品</p>
                                <div className="text-2xl font-mono font-bold tracking-widest text-gray-800">
                                    {inviteCode || '加载中...'}
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                disabled={!inviteCode}
                                className="p-3 bg-white shadow-sm border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <ClipboardCopy className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>

                    {/* 加入他人家庭 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">加入其他家庭</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="输入邀请码 (如: HF-1A2B3D)"
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3B6D8C] focus:ring-1 focus:ring-[#3B6D8C] outline-none font-mono"
                            />
                            <button
                                onClick={handleJoin}
                                disabled={isLoading || !joinCodeInput.trim()}
                                className="px-5 py-3 text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                                style={{ backgroundColor: '#2A4D63' }}
                            >
                                <UserPlus className="w-4 h-4" />
                                加入
                            </button>
                        </div>
                        {joinError && <p className="text-red-500 text-sm">{joinError}</p>}
                    </div>

                    {/* 数据空间切换 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">当前数据空间</h3>
                        <div className="space-y-2">
                            {/* 我自己的空间 */}
                            <div
                                onClick={() => setActiveFamilyId(null)}
                                className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex items-center justify-between group ${activeFamilyId === null ? 'border-[#3B6D8C] bg-[#3B6D8C]/5' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${activeFamilyId === null ? 'bg-[#3B6D8C] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <HomeIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${activeFamilyId === null ? 'text-[#3B6D8C]' : 'text-gray-700'}`}>我的家 (默认)</p>
                                        <p className="text-xs text-gray-400">管理我自己的物品和平面图</p>
                                    </div>
                                </div>
                                {activeFamilyId === null && <Check className="w-5 h-5 text-[#3B6D8C]" />}
                            </div>

                            {/* 加入的家庭空间 */}
                            {joinedFamilies.map(family => (
                                <div
                                    key={family.ownerId}
                                    onClick={() => setActiveFamilyId(family.ownerId)}
                                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex items-center justify-between group ${activeFamilyId === family.ownerId ? 'border-[#3B6D8C] bg-[#3B6D8C]/5' : 'border-transparent hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${activeFamilyId === family.ownerId ? 'bg-[#3B6D8C] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col gap-0.5" style={{ maxWidth: '180px' }}>
                                            {editingAliasOwnerId === family.ownerId ? (
                                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={aliasEditValue}
                                                        onChange={e => setAliasEditValue(e.target.value)}
                                                        className="w-full px-2 py-0.5 text-sm border border-[#3B6D8C] rounded outline-none"
                                                        placeholder="备注名称..."
                                                        autoFocus
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') handleSaveAlias(family.ownerId);
                                                            if (e.key === 'Escape') setEditingAliasOwnerId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => handleSaveAlias(family.ownerId)} className="text-[#3B6D8C] bg-[#3B6D8C]/10 p-1 rounded hover:bg-[#3B6D8C]/20 transition-colors">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold truncate ${activeFamilyId === family.ownerId ? 'text-[#3B6D8C]' : 'text-gray-700'}`}>
                                                        {family.displayName} 的家
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAliasEditValue(family.aliasName || family.originalName || '');
                                                            setEditingAliasOwnerId(family.ownerId);
                                                        }}
                                                        className="text-gray-400 hover:text-[#3B6D8C] transition-colors p-1"
                                                        title="修改备注名"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* 显示共享状态与原名差异 */}
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">共享的家庭数据空间</span>
                                                {family.aliasName && (
                                                    <span className="text-[10px] text-gray-300">原名: {family.originalName}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleLeave(family.ownerId); }}
                                            className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                                            title="退出家庭"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                        {activeFamilyId === family.ownerId && <Check className="w-5 h-5 text-[#3B6D8C] flex-shrink-0" />}
                                    </div>
                                </div>
                            ))}

                            {joinedFamilies.length === 0 && (
                                <p className="text-center text-sm text-gray-400 py-4">您还未加入其他家庭</p>
                            )}
                        </div>
                    </div>
                    {/* 我的家庭成员（谁加入了我的空间） */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">谁加入了我的家庭？</h3>
                        <div className="space-y-2">
                            {joinedUsers.length > 0 ? (
                                joinedUsers.map(u => (
                                    <div key={u.memberId} className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-200 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B6D8C] to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                                {u.displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{u.displayName}</p>
                                                <p className="text-[10px] text-gray-400">于 {new Date(u.joinedAt).toLocaleDateString()} 加入</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleKick(u.memberId, u.displayName)}
                                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded bg-red-50 opacity-0 group-hover:opacity-100 transition-all font-medium"
                                        >
                                            移出
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-400">目前还没有人加入您的家庭空间</p>
                                    <p className="text-xs text-gray-300 mt-1">您可以将上面的邀请码发送给家人</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
