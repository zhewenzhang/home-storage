import { NavLink } from 'react-router-dom';
import { Home, Package, MapPin, LayoutGrid, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { searchQuery, setSearchQuery } = useStore();

  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/items', icon: Package, label: '物品' },
    { to: '/locations', icon: MapPin, label: '位置' },
    { to: '/floorplan', icon: LayoutGrid, label: '平面图' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">HomeStorage</h1>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索物品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24 md:pl-64 md:pb-4">
        {children}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="md:hidden bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar - Desktop Only */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 flex-col p-4 pt-16 z-30">
        <div className="text-sm font-semibold text-gray-400 mb-4 px-4">导航</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
