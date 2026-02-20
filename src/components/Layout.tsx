import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, MapPin, LayoutGrid, Search, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { signOut } from '../services/auth';
import AIChat from './AIChat';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { searchQuery, setSearchQuery } = useStore();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return '首页';
      case '/items': return '物品管理';
      case '/locations': return '存储位置';
      case '/floorplan': return '平面图';
      default: return 'HomeBox';
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/items', icon: Package, label: '全部物品' },
    { to: '/locations', icon: MapPin, label: '存储位置' },
    { to: '/floorplan', icon: LayoutGrid, label: '房型编辑' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-100 z-30">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#2A4D63' }}>
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#2A4D63' }}>HomeBox</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 px-1">智能家庭储物管理系统</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#3B6D8C' }} />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-gray-100/50 bg-white/70 backdrop-blur-sm z-20">
          <h2 className="text-2xl font-bold text-gray-900 hidden md:block animate-enter">
            {getPageTitle()}
          </h2>

          <div className="md:hidden flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3B6D8C' }}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">HomeBox</span>
          </div>

          <div className="flex items-center gap-4 flex-1 md:flex-none justify-end md:w-96">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#3B6D8C] transition-colors" />
              <input
                type="text"
                placeholder="搜索物品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field py-3 shadow-sm bg-white"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl p-2 flex justify-between items-center z-50"
        style={{ boxShadow: '0 4px 30px rgba(59,109,140,0.15)' }}
      >
        {navItems.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `p-4 rounded-2xl transition-all ${isActive
                ? 'text-white shadow-lg transform -translate-y-2'
                : 'text-gray-400 hover:bg-gray-50'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: '#3B6D8C' } : {}}
          >
            <Icon className="w-6 h-6" />
          </NavLink>
        ))}
      </nav>

      {/* AI 助手 */}
      <AIChat />
    </div>
  );
}
