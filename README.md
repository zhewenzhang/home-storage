<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/package.svg" width="80" alt="HomeBox Logo"/>
  <h1>📦 HomeBox / 智能家庭储物管理系统</h1>
  <p><strong>一个现代、直观且强大的跨平台家庭物资追踪与可视化整理工具</strong></p>

  <p>
    <a href="https://github.com/zhewenzhang/home-storage/stargazers"><img src="https://img.shields.io/github/stars/zhewenzhang/home-storage?style=for-the-badge&color=2A4D63&logo=github" alt="Stars" /></a>
    <a href="https://github.com/zhewenzhang/home-storage/issues"><img src="https://img.shields.io/github/issues/zhewenzhang/home-storage?style=for-the-badge&color=E88B46" alt="Issues" /></a>
    <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite_React-3B6D8C?style=for-the-badge&logo=vite&logoColor=white" alt="Vite+React" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-44A873?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Backend" /></a>
  </p>

  <a href="https://star-history.com/#zhewenzhang/home-storage&Date">
    <img src="https://api.star-history.com/svg?repos=zhewenzhang/home-storage&type=Date&theme=dark" alt="Star History Chart" width="600px">
  </a>
</div>

---

## 🎉 最新版本 v2.4.0 (Latest Updates)

本次更新聚焦于**隐私安全增强**与**系统底层健壮性**的全面升级：

- 🔐 **应用防窥锁 (App Lock)**：新增 4 位数字 PIN 码保护，支持移动端触控键盘与 PC 端物理键盘盲打交互。
- 🛡️ **设备级本地隔离**：解锁密码仅本地加密存储，不上传云端，兼顾隐私安全与多终端使用的独立性。
- ⚡ **PWA 强更新机制优化**：重构了 Service Worker 缓存策略（NetworkFirst），彻底解决部署后旧版本哈希导致的“启动死锁”问题，实现即刻部署即刻更新。
- 🧱 **部署健壮性兜底**：优化了 Supabase 初始化逻辑，针对环境变量缺失场景增加了防御性优雅降级提示，确保应用在任何环境下都能安全启动。

---

## 🌟 核心特性概览 (Features)

HomeBox 致力于提供所见即所得的极客级收纳体验：

- **🗺️ 可视化房型图** - 建立属于自己的 2D 房型结构，将储物位置（Location）以可拖拽模块放置。找东西不再是翻箱倒柜，而是像地图导航一样直观。
- **✨ AI 视觉识别 (New!)** - 集成 **Qwen-VL / GPT-4o** 大模型。只需拍摄物品照片，AI 即可自动识别名称、分类并预测过期时间，实现零成本录入。
- **👨‍👩‍👧‍👦 家庭协同共享** - 支持多成员、多家庭绑定。您可以邀请家人加入，实时同步物资变动，支持别名备注与权限管控。
- **📱 PWA 原生体验** - 完全适配 **PWA (Progressive Web App)**。支持断网查看、桌面安装，拥有原生应用般的丝滑手感。
- **💻 极速批量管理** - 专为“大扫除”设计。支持类 Excel 的批量编辑模式，一次性处理上百件物资的归属、保质期与数量。
- **🤖 AI 家庭体检** - 不仅仅是记录，AI 会定期扫描您的资产，提醒您处理临期食品、消耗品囤积，并给出幽默且实用的收纳建议。
- **⏰ 智能临期预警** - 精确的保质期追踪。过期或临期物品会在系统各处高亮提醒，并首页横幅拦截，彻底告别过期食品。

<br/>

## 🚀 性能优化的“秘密武器” (Performance)

我们对 HomeBox 进行了手术级的性能调优，只为追求“秒开”的极致体验：

- **📦 极致分包 (Bundle Slimming)**：通过 Vite Manual Chunks 策略，将巨型 JS 包从 **569kB 压缩至 87kB**（减少 85%），核心逻辑瞬间加载。
- **⚡ 离线持久化 (Instant Persistence)**：利用状态提升与持久化缓存技术，App 启动时**优先恢复本地快照**，无需等待网络请求，实现 UI 瞬间呈现。
- **💎 沉浸式启动页 (App Shell)**：设计了高颜值的原生内联 Loading 方案，消除了前端框架初始化时的空白闪烁，让加载过程具有“呼吸感”。
- **🖼️ 静态多级缓存**：Service Worker 自动接管 Supabase 图片与字体请求，实现海量物品照片的离线秒出。

<br/>

## 🛠️ 技术栈 (Tech Stack)

| 领域 | 技术方案 | 架构优势 |
| --- | --- | --- |
| **前端架构** | `Vite 6` + `React 18` | 抛弃笨重的 Webpack，实现毫秒级冷启动与 HMR 热更新 |
| **状态缓冲** | `Zustand` + `Persist` | 极简的状态容器，配合本地存储实现“快照优先展示”的零等待体验 |
| **后端大脑** | `Supabase` + `RLS` | Serverless 架构，开箱即用的 PostgreSQL 搭配行级安全控制机制 |
| **AI 引擎** | `Qwen-VL` / `GPT-4o` | 强大的多模态视觉大模型，实现复杂物品图片的语义化解读 |
| **视觉基建** | `Tailwind CSS` + `Lucide React` | 告别臃肿的重型组件库，通过 CSS Variables 实现零性能损耗的动态主题切换 |

<br/>

## 🗺️ 未来架构演进计划 (Roadmap)

HomeBox 是一个面向长期维护的 **Vibe Coding** 项目。随着功能与数据量的增加，我们制定了以下架构防护与重构计划：

- [ ] **精细化组件拆分 (Componentization)**: 将超大型视图（如 `FloorPlan.tsx`）深度拆解微小可复用组件（如 `<RoomNode />`），保持单文件 200 行以内的极致可读性。
- [ ] **表单性能重构 (React Hook Form + Zod)**: 引入 `react-hook-form` 搭配数据校验 `zod`，替换原生的状态受控组件，避免复杂表单带来的 React UI 渲染锁死。
- [ ] **万级数据列表渲染 (Virtualization)**: 引入 `@tanstack/react-virtual` 虚拟长列表技术。确保当用户记录超过 3000 件物品时，浏览滑动依旧丝滑如初。
- [ ] **远端状态隔离 (TanStack Query)**: 将纯前端 UI 状态（继续由 Zustand 管理）与 Supabase 服务器状态剥离，通过 React Query 自动接管网络超时、乐观更新与缓存失效策略。

<br/>

## 📁 主要项目结构

```text
home-storage/
├── src/
│   ├── components/      # 复用 UI 组件（弹窗、导航、表单）
│   ├── pages/           # 核心逻辑页面（物品、位置、地图、设置）
│   ├── services/        # 封装层：DB 查询、AI 接口、图片上传
│   ├── store/           # Zustand 控制中心（核心持久化逻辑在此）
│   ├── types/           # 强类型 TypeScript 规范
│   └── App.tsx          # 聚合入口与 Auth 监听逻辑
├── supabase-schema.sql  # 数据库结构初始化脚本
└── vite.config.ts       # PWA、分包策略与构建配置
```

<br/>

## 🤝 参与贡献 (Contributing)

任何 `Issue`、`Feature Request` 或 `Pull Request` 我们都热烈欢迎！

1. **Fork** 本项目
2. `git checkout -b feature/CoolNewFeature`
3. `git commit -m 'Add some cool features'`
4. `git push origin feature/CoolNewFeature`

&nbsp;
<p align="center">基于 ♥︎ 构建。享受生活，让家有迹可循。</p>
