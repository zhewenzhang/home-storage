import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, MapPin, LayoutGrid, Search, LogOut, Users, Database, Plus, AlertTriangle, User, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { signOut } from '../services/auth';
import AIChat from './AIChat';
import FamilyModal from './FamilyModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { items, searchQuery, setSearchQuery, activeFamilyId } = useStore();
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 临期检查逻辑 (提前30天)
  const expiringItemsCount = items.filter(item => {
    if (!item.expiryDate) return false;
    const days = (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return days <= 30; // 包含已过期和30天内过期的
  }).length;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return '首页';
      case '/items': return '物品管理';
      case '/locations': return '存储位置';
      case '/floorplan': return '平面图';
      case '/batch': return '批量管理';
      case '/settings': return '系统设置';
      default: return 'HomeBox';
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/items', icon: Package, label: '全部物品' },
    { to: '/locations', icon: MapPin, label: '存储位置' },
    { to: '/floorplan', icon: LayoutGrid, label: '房型编辑' },
    { to: '/batch', icon: Database, label: '批量管理' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-slate-900 transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-800 z-30 transition-colors">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-primary-dark dark:bg-blue-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-primary-dark dark:text-gray-100">HomeBox</h1>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">智能家庭储物管理系统</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* 桌面端常驻的大号添加物品按钮 */}
          <Link
            to="/items/new"
            className="btn-primary justify-center mb-6 py-3"
          >
            <Plus className="w-5 h-5" />
            <span>添加物品</span>
          </Link>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item group ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{label}</span>
              {location.pathname === to && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse bg-primary dark:bg-blue-400" />
              )}
            </NavLink>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsFamilyModalOpen(true)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeFamilyId ? 'bg-primary/10 dark:bg-blue-900/30 text-primary-dark dark:text-blue-200' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">家庭共享</span>
              </div>
              {activeFamilyId && (
                <span className="text-[10px] bg-primary dark:bg-blue-600 text-white px-2 py-0.5 rounded-full">已切换</span>
              )}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-50 dark:border-slate-800 space-y-1">
          <NavLink to="/settings" className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-primary/10 dark:bg-blue-900/30 text-primary-dark dark:text-blue-200 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
            <User className="w-4 h-4" />
            <span>我的</span>
          </NavLink>
          <button onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-gray-100/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-20 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 hidden md:flex items-center gap-3 animate-enter">
            {getPageTitle()}
            {activeFamilyId && (
              <span className="text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-700 shadow-sm">
                当前: 共享家庭空间
              </span>
            )}
          </h2>

          <div className="md:hidden flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary dark:bg-blue-600">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg dark:text-gray-100">HomeBox</span>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none justify-end md:w-96 pl-4">
            <button onClick={() => setIsFamilyModalOpen(true)} className="hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-full relative transition-colors">
              <Users className="w-5 h-5 text-gray-700" />
              {activeFamilyId && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full" />}
            </button>
            <div className="relative w-full max-w-md group flex-1 md:flex-none">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="搜索物品或位置..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field py-2 md:py-3 shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 text-sm w-full pr-10"
                style={{ paddingLeft: '2.5rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-32 md:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-enter">
            {expiringItemsCount > 0 && location.pathname !== '/items' && (
              <div
                onClick={() => navigate('/items')}
                className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-3 md:p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl text-yellow-600 dark:text-yellow-400"><AlertTriangle className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-yellow-800 dark:text-yellow-500 text-sm md:text-base">发现 {expiringItemsCount} 件物品已过期或即将过期！</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">点击前往物品列表排查隐患</p>
                  </div>
                </div>
                <div className="text-yellow-600 dark:text-yellow-400 text-sm font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/50 hidden sm:block">
                  去处理 →
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-3xl p-2 flex justify-around items-center z-50 shadow-2xl"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      >
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-primary dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">首页</span>
        </NavLink>

        <NavLink to="/batch" className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-primary dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Database className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">批量录入</span>
        </NavLink>

        <NavLink to="/items/new" className="flex flex-col items-center -mt-8 relative group z-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 border-4 border-[#F8F9FA] dark:border-slate-900 bg-red-500 dark:bg-red-600">
            <Package className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-red-500 dark:text-red-400 font-bold" />
            </div>
          </div>
        </NavLink>

        <button onClick={() => setIsFamilyModalOpen(true)} className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${activeFamilyId ? 'text-primary dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Users className="w-6 h-6 mb-1" />
          {activeFamilyId && <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 border border-white rounded-full" />}
          <span className="text-[10px] font-bold">家庭分享</span>
        </button>

        <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-primary dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">我的</span>
        </NavLink>
      </nav>

      {/* AI 助手 */}
      <AIChat />

      {/* 家庭共享弹窗 */}
      <FamilyModal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} />
    </div>
  );
}
