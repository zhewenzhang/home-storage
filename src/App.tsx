import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import type { User } from '@supabase/supabase-js';

import Layout from './components/Layout';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemForm from './pages/ItemForm';
import Locations from './pages/Locations';
import FloorPlan from './pages/FloorPlan';
import AuthPage from './pages/AuthPage';
import BatchManage from './pages/BatchManage';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { loadFromSupabase, clearLocalData, dataLoaded } = useStore();

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (!newUser) {
        // 登出 → 清空前端数据
        clearLocalData();
      }
    });

    return () => subscription.unsubscribe();
  }, [clearLocalData]);

  // 用户登录后加载数据
  useEffect(() => {
    if (user && !dataLoaded) {
      loadFromSupabase();
    }
  }, [user, dataLoaded, loadFromSupabase]);

  // 加载中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a2a3a 0%, #2A4D63 100%)' }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录 → 登录页
  if (!user) {
    return <AuthPage />;
  }

  // 已登录 → 主应用
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id" element={<ItemForm />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/floorplan" element={<FloorPlan />} />
          <Route path="/batch" element={<BatchManage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
