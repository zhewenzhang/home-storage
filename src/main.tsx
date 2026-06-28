import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'

// 解决 PWA 部署新版本后，浏览器缓存旧 HTML 找不到已下线旧 JS 资源而卡死的 ChunkLoadError 问题
window.addEventListener('error', (e) => {
  const target = e.target as any;
  if (
    e.message?.includes('dynamically imported module') || 
    e.message?.includes('Failed to fetch dynamically') ||
    (target && target.tagName === 'SCRIPT')
  ) {
    console.warn('[PWA] 侦测到旧版静态资源 Chunk 缺失，正在为您强制刷新以加载最新云端版本...');
    window.location.reload();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
