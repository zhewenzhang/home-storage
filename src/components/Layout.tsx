import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, MapPin, LayoutGrid, Search, LogOut, Users, Database, Plus, AlertTriangle, User, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { signOut } from '../services/auth';
import AIChat from './AIChat';
import FamilyModal from './FamilyModal';
import { ButtonLink, Input } from '../components/ui';

export default function Layout({ children }: { children: ReactNode }) {
  const { items, searchQuery, setSearchQuery, activeFamilyId, theme, setTheme } = useStore();
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const expiringItemsCount = useMemo(() => items.filter(item => {
    if (!item.expiryDate) return false;
    const days = (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return days <= 30;
  }).length, [items]);

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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-black border-r-2 border-black dark:border-white z-30 transition-colors swiss-grid-pattern">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-0">
            <div className="bg-swiss-red px-3 py-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-white" />
              <h1 className="text-lg font-black tracking-tighter text-white uppercase flex items-end">
                HomeBox
                <span className="text-[9px] text-white/50 font-mono ml-1.5 leading-none mb-0.5">v{__APP_VERSION__}</span>
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-0 py-4 space-y-0 overflow-y-auto">
          <div className="px-4 mb-4">
            <ButtonLink to="/items/new" variant="primary" size="md" className="w-full justify-center">
              <Plus className="w-4 h-4" />
              <span>添加物品</span>
            </ButtonLink>
          </div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 no-underline border-l-2 border-transparent transition-all hover:text-black dark:hover:text-white hover:border-l-black dark:hover:border-l-white hover:bg-gray-100 dark:hover:bg-gray-900 ${isActive ? 'text-swiss-red border-l-swiss-red bg-swiss-red/5 dark:bg-swiss-red/15' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="mt-6 pt-4 border-t-2 border-black dark:border-white mx-4">
            <button
              onClick={() => setIsFamilyModalOpen(true)}
              className={`w-full flex items-center justify-between p-3 transition-all border-2 ${activeFamilyId ? 'border-swiss-red bg-swiss-red/5 text-swiss-red' : 'border-black dark:border-white text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wide">家庭共享</span>
              </div>
              {activeFamilyId && (
                <span className="text-[10px] bg-swiss-red text-white px-2 py-0.5 font-bold uppercase">已切换</span>
              )}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t-2 border-black dark:border-white space-y-0">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-black dark:border-white text-sm font-bold uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            {theme === 'dark' ? '☀️ 亮色' : '🌙 暗色'}
          </button>
          <NavLink to="/settings" className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 border-2 text-sm font-bold uppercase tracking-wide transition-all mt-2 ${isActive ? 'border-swiss-red bg-swiss-red/5 text-swiss-red' : 'border-black dark:border-white text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
            <User className="w-4 h-4" />
            <span>我的</span>
          </NavLink>
          <button onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-black dark:border-white text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 hover:bg-swiss-red hover:border-swiss-red hover:text-white transition-all mt-2"
            aria-label="退出登入"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 px-6 md:px-8 flex items-center justify-between border-b-2 border-black dark:border-white bg-white dark:bg-black z-20 transition-colors">
          <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white hidden md:flex items-center gap-3">
            {getPageTitle()}
            {activeFamilyId && (
              <span className="text-[10px] font-black bg-swiss-red text-white px-2 py-0.5 uppercase tracking-wider">
                共享
              </span>
            )}
          </h2>

          <div className="md:hidden flex items-center gap-3">
            <div className="bg-swiss-red px-2 py-1 flex items-center gap-1">
              <Package className="w-4 h-4 text-white" />
              <span className="font-black text-sm text-white uppercase flex items-end">
                HomeBox
                <span className="text-[8px] text-white/50 font-mono ml-1 leading-none mb-0.5">v{__APP_VERSION__}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none justify-end md:w-80 pl-4">
            <div className="relative w-full max-w-md group flex-1 md:flex-none">
              <Input
                type="text"
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
                icon={<Search className="w-4 h-4" />}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                  aria-label="清除搜索"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-32 md:p-8 scroll-smooth bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto swiss-enter">
            {expiringItemsCount > 0 && location.pathname !== '/items' && (
              <div
                onClick={() => navigate('/items')}
                className="mb-6 border-2 border-swiss-red bg-swiss-red/5 p-4 cursor-pointer hover:bg-swiss-red/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-swiss-red" />
                    <div>
                      <p className="font-black text-swiss-red text-sm uppercase tracking-wide">发现 {expiringItemsCount} 件物品已过期或即将过期</p>
                    </div>
                  </div>
                  <div className="text-swiss-red text-sm font-black uppercase hidden sm:block">
                    去处理 →
                  </div>
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black dark:bg-white border-t-2 border-black dark:border-white p-2 flex justify-around items-center z-50">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center p-2 transition-all ${isActive ? 'text-swiss-red' : 'text-white dark:text-black'}`} aria-label="首页">
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold uppercase">首页</span>
        </NavLink>

        <NavLink to="/batch" className={({ isActive }) => `flex flex-col items-center p-2 transition-all ${isActive ? 'text-swiss-red' : 'text-white dark:text-black'}`} aria-label="批量录入">
          <Database className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold uppercase">批量</span>
        </NavLink>

        <NavLink to="/items/new" className="flex flex-col items-center -mt-6 relative z-10">
          <div className="w-12 h-12 bg-swiss-red flex items-center justify-center text-white border-2 border-white dark:border-black">
            <Package className="w-6 h-6" />
          </div>
        </NavLink>

        <button onClick={() => setIsFamilyModalOpen(true)} className={`flex flex-col items-center p-2 transition-all relative ${activeFamilyId ? 'text-swiss-red' : 'text-white dark:text-black'}`} aria-label="家庭共享">
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold uppercase">家庭</span>
        </button>

        <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center p-2 transition-all ${isActive ? 'text-swiss-red' : 'text-white dark:text-black'}`} aria-label="我的">
          <User className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold uppercase">我的</span>
        </NavLink>
      </nav>

      {/* AI 助手 */}
      <AIChat />

      {/* 家庭共享弹窗 */}
      <FamilyModal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} />
    </div>
  );
}
