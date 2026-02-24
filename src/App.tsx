import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import type { User } from '@supabase/supabase-js';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';

// 解决 Zeabur 重新部署后，旧缓存请求新分包导致 Failed to fetch dynamically imported module 的问题
const lazyWithRetries = (componentImport: () => Promise<any>) =>
  React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch dynamically imported module')) {
        // 如果是从缓存加载了旧的 JS 发起对不存在的新哈希的请求，重载整个 SPA 获取最新 index.html
        window.location.reload();
        return { default: () => <div>Loading...</div> }; // 防御性返回
      }
      throw error;
    }
  });

const Items = lazyWithRetries(() => import('./pages/Items'));
const ItemForm = lazyWithRetries(() => import('./pages/ItemForm'));
const Locations = lazyWithRetries(() => import('./pages/Locations'));
const FloorPlan = lazyWithRetries(() => import('./pages/FloorPlan'));
const BatchManage = lazyWithRetries(() => import('./pages/BatchManage'));
const Settings = lazyWithRetries(() => import('./pages/Settings'));

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { loadFromSupabase, clearLocalData, dataLoaded } = useStore();

  useEffect(() => {
    // 聚合初始化：一次性拿回 session 并建立监听
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      // 只有在用户状态真正变化时才 set，减少 React 重新渲染
      setUser(prev => prev?.id === newUser?.id ? prev : newUser);
      if (!newUser) clearLocalData();
    });

    return () => subscription.unsubscribe();
  }, [clearLocalData]);

  // 用户登录后加载数据
  useEffect(() => {
    if (user && !dataLoaded) {
      loadFromSupabase();
    }
  }, [user, dataLoaded, loadFromSupabase]);

  // 移除 index.html 中的首开加载动画
  useEffect(() => {
    if (user || !authLoading) {
      const loader = document.getElementById('app-loading');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    }
  }, [user, authLoading]);

  // 加载中 - 仅在没有缓存数据时显示重度加载页
  if (authLoading) {
    return null; // 让 index.html 的加载动画继续显示
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
