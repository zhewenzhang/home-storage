import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import type { User } from '@supabase/supabase-js';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';

const Items = React.lazy(() => import('./pages/Items'));
const ItemForm = React.lazy(() => import('./pages/ItemForm'));
const Locations = React.lazy(() => import('./pages/Locations'));
const FloorPlan = React.lazy(() => import('./pages/FloorPlan'));
const BatchManage = React.lazy(() => import('./pages/BatchManage'));
const Settings = React.lazy(() => import('./pages/Settings'));

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
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#3B6D8C] rounded-full animate-spin"></div>
          </div>
        }>
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
        </Suspense>
      </Layout>
    </HashRouter>
  );
}

export default App;
