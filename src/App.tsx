import React, { useState, useEffect, Suspense } from 'react';
import { useToast } from './components/Toast';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { onAuthStateChange, getUser, User } from './services/auth';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import AppLock from './components/AppLock';
import Spinner from './components/ui/Spinner';

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
  const { loadFromSupabase, clearLocalData, theme, appPin, isAppLocked, lockApp, errorMessage } = useStore();
  const { addToast } = useToast();

  // 立即移除 index.html 加载动画 - 不等待 auth
  useEffect(() => {
    const loader = document.getElementById('app-loading');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  // Handle Dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Auto Lock when app goes to background
  useEffect(() => {
    if (!appPin) return;
    let timeoutId: number;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Lock after 30 seconds of being in the background
        timeoutId = window.setTimeout(() => {
          lockApp();
        }, 30000);
      } else {
        window.clearTimeout(timeoutId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearTimeout(timeoutId);
    };
  }, [appPin, lockApp]);

  useEffect(() => {
    if (errorMessage) {
      addToast('error', errorMessage);
      useStore.getState().setErrorMessage(null);
    }
  }, [errorMessage, addToast]);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
      setAuthLoading(false);
    };

    initAuth();

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(prev => prev?.uid === newUser?.uid ? prev : newUser);
      if (!newUser) clearLocalData();
    });

    return () => unsubscribe();
  }, [clearLocalData]);

  // 用户登录后加载数据 - 后台刷新
  useEffect(() => {
    if (user && !authLoading) {
      loadFromSupabase(user.uid);
    }
  }, [user, authLoading, loadFromSupabase]);

  // 等待 auth 初始化时显示轻量 spinner，不阻塞首次渲染
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <Spinner />
      </div>
    );
  }

  // 未登录 → 登录页
  if (!user) {
    return <AuthPage />;
  }

  // 已登录 → 主应用
  return (
    <>
      {appPin && isAppLocked && <AppLock />}
      <HashRouter>
        <Layout>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
              <Spinner />
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
    </>
  );
}

export default App;
