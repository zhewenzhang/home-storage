import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getOrCreateInviteCode, joinFamilyByCode, leaveFamily, fetchMyFamilyMembers, kickFamilyMember, updateFamilyAlias, updateFamilyMemberRole } from '../services/family';
import { Users, ClipboardCopy, Check, UserPlus, LogOut, Home as HomeIcon, X, Edit3, Shield, Eye } from 'lucide-react';
import { useToast } from './Toast';
import { Button, Input } from './ui';

export default function FamilyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { activeFamilyId, setActiveFamilyId, joinedFamilies, loadFromSupabase } = useStore();
    const { addToast } = useToast();

    const [inviteCode, setInviteCode] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [joinError, setJoinError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [joinedUsers, setJoinedUsers] = useState<{ memberId: string, displayName: string, joinedAt: string, role: string }[]>([]);
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
            addToast('success', '成功加入家庭！');
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
            addToast('error', '退出失败');
        }
    };

    const handleKick = async (memberId: string, name: string) => {
        if (!window.confirm(`确定要将 ${name} 踢出您的家庭空间吗？他们将立即失去访问权限。`)) return;
        try {
            await kickFamilyMember(memberId);
            setJoinedUsers(prev => prev.filter(u => u.memberId !== memberId));
        } catch (err) {
            console.error(err);
            addToast('error', '踢出失败');
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
            addToast('error', '修改备注失败');
        }
    };

    const handleRoleChange = async (memberId: string, newRole: 'viewer' | 'admin') => {
        try {
            await updateFamilyMemberRole(memberId, newRole);
            setJoinedUsers(prev => prev.map(u => u.memberId === memberId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error(err);
            addToast('error', '更改权限失败');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 swiss-enter"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-black w-full max-w-md border-2 border-black dark:border-white overflow-hidden flex flex-col max-h-[90vh] my-4 mx-4 swiss-enter"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b-2 border-gray-200 dark:border-gray-700 flex justify-between items-center bg-black dark:bg-white">
                    <h2 className="text-xl font-black uppercase tracking-wider text-white dark:text-black flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        家庭共享与空间切换
                    </h2>
                    <button onClick={onClose} className="p-2 border-2 border-white/50 dark:border-black/50 hover:bg-swiss-red hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    {/* 我的邀请码 */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">我的家庭邀请码</h3>
                        <div className="border-2 border-black dark:border-white p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">将此代码分享给家人，他们即可查看和编辑您的物品</p>
                                <div className="text-2xl font-mono font-bold tracking-widest text-gray-800 dark:text-gray-100">
                                    {inviteCode || '加载中...'}
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                disabled={!inviteCode}
                                className="p-3 border-2 border-black dark:border-white hover:bg-black hover:text-white transition-colors"
                            >
                                {copied ? <Check className="w-5 h-5 text-swiss-red" /> : <ClipboardCopy className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {/* 加入他人家庭 */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">加入其他家庭</h3>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="输入邀请码 (如: HF-1A2B3D)"
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                                className="flex-1 font-mono"
                            />
                            <Button
                                onClick={handleJoin}
                                disabled={isLoading || !joinCodeInput.trim()}
                                variant="primary"
                            >
                                <UserPlus className="w-4 h-4" />
                                加入
                            </Button>
                        </div>
                        {joinError && <p className="text-swiss-red text-sm">{joinError}</p>}
                    </div>

                    {/* 数据空间切换 */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">当前数据空间</h3>
                        <div className="space-y-2">
                            {/* 我自己的空间 */}
                            <div
                                onClick={() => setActiveFamilyId(null)}
                                className={`p-4 cursor-pointer border-2 transition-all flex items-center justify-between group ${activeFamilyId === null ? 'border-swiss-red bg-swiss-red/5' : 'border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${activeFamilyId === null ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                                        <HomeIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${activeFamilyId === null ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>我的家 (默认)</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">管理我自己的物品和平面图</p>
                                    </div>
                                </div>
                                {activeFamilyId === null && <Check className="w-5 h-5 text-swiss-red" />}
                            </div>

                            {/* 加入的家庭空间 */}
                            {joinedFamilies.map(family => (
                                <div
                                    key={family.ownerId}
                                    onClick={() => setActiveFamilyId(family.ownerId)}
                                    className={`p-4 cursor-pointer border-2 transition-all flex items-center justify-between group ${activeFamilyId === family.ownerId ? 'border-swiss-red bg-swiss-red/5' : 'border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 ${activeFamilyId === family.ownerId ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col gap-0.5" style={{ maxWidth: '180px' }}>
                                            {editingAliasOwnerId === family.ownerId ? (
                                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={aliasEditValue}
                                                        onChange={e => setAliasEditValue(e.target.value)}
                                                        className="w-full px-2 py-0.5 text-sm border-2 border-black dark:border-white bg-transparent outline-none dark:text-gray-100"
                                                        placeholder="备注名称..."
                                                        autoFocus
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') handleSaveAlias(family.ownerId);
                                                            if (e.key === 'Escape') setEditingAliasOwnerId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => handleSaveAlias(family.ownerId)} className="text-black dark:text-white bg-black/10 dark:bg-white/10 p-1 hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold truncate ${activeFamilyId === family.ownerId ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {family.displayName} 的家
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAliasEditValue(family.aliasName || family.originalName || '');
                                                            setEditingAliasOwnerId(family.ownerId);
                                                        }}
                                                        className="text-gray-400 hover:text-swiss-red transition-colors p-1"
                                                        title="修改备注名"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* 显示共享状态与原名差异 */}
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {family.role === 'admin' ?
                                                        <span className="flex items-center gap-1 text-[10px] border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-bold">
                                                            <Shield className="w-3 h-3" /> 可编辑
                                                        </span> :
                                                        <span className="flex items-center gap-1 text-[10px] border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-bold">
                                                            <Eye className="w-3 h-3" /> 仅观看
                                                        </span>
                                                    }
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">共享的家庭数据空间</span>
                                                </div>
                                                {family.aliasName && (
                                                    <span className="text-[10px] text-gray-300 dark:text-gray-600">原名: {family.originalName}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleLeave(family.ownerId); }}
                                            className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-swiss-red hover:text-swiss-red hover:bg-swiss-red/10 flex-shrink-0"
                                            title="退出家庭"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                        {activeFamilyId === family.ownerId && <Check className="w-5 h-5 text-swiss-red flex-shrink-0" />}
                                    </div>
                                </div>
                            ))}

                            {joinedFamilies.length === 0 && (
                                <p className="text-center text-sm text-gray-400 py-4">您还未加入其他家庭</p>
                            )}
                        </div>
                    </div>
                    {/* 我的家庭成员（谁加入了我的空间） */}
                    <div className="space-y-4 pt-4 border-t-2 border-black dark:border-white">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">谁加入了我的家庭？</h3>
                        <div className="space-y-2">
                            {joinedUsers.length > 0 ? (
                                joinedUsers.map(u => (
                                    <div key={u.memberId} className="flex items-center justify-between border-2 border-black dark:border-white p-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center bg-black text-white dark:bg-white dark:text-black font-bold text-sm">
                                                {u.displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.displayName}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">于 {new Date(u.joinedAt).toLocaleDateString()} 加入</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.memberId, e.target.value as 'viewer' | 'admin')}
                                                className="text-xs bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white py-1 pl-2 pr-6 outline-none cursor-pointer font-medium text-gray-600 dark:text-gray-300"
                                            >
                                                <option value="viewer">👀 仅观看</option>
                                                <option value="admin">✏️ 可编辑</option>
                                            </select>
                                            <button
                                                onClick={() => handleKick(u.memberId, u.displayName)}
                                                className="border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-all font-medium"
                                                title="移出家庭"
                                            >
                                                <LogOut className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center border-2 border-dashed border-black dark:border-white p-4">
                                    <p className="text-sm text-gray-400 dark:text-gray-500">目前还没有人加入您的家庭空间</p>
                                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">您可以将上面的邀请码发送给家人</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
