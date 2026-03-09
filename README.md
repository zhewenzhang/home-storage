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

## 🎉 最新版本 v2.3.0 (Latest Updates)

本次大版本更新带来了**深度的主题个性化定制**与**更安全、便捷的交互体验**：

- 🎨 **高级暗黑模式与动态主题色**：全站适配深度优化的 Dark Mode，夜间使用不再刺眼。同时在“系统设置”中开放了 **5 款高级主题强调色**（深空蓝、翡翠绿、星云紫、玫瑰红、琥珀黄）供您自由选择，一键切换全局品牌色。
- 🔒 **房型平图只读防误触锁定**：平面图页面默认为“只读模式”，随心滑动查看不再担心误触移位。只有点击“编辑布局”解锁后才可修改，完成后“保存并锁定”。
- ⚡ **无处不在的极速录入入口**：系统侧边栏顶部、首页核心数据面板区均新增了带有高级悬浮动效的“添加物品”快捷按钮，让灵感与整理永远快人一步。
- 💅 **UI 与视觉规范闭环**：全站核心操作按钮（如“编辑布局”、“保存修改”、“添加物品”）全面重构并接入了统一的 `.btn-primary` 标准，阴影交互与状态反馈更加细腻一致。

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

| 领域 | 技术方案 | 描述 |
| --- | --- | --- |
| **前端架构** | `Vite 6` + `React 18` | 极速的热更新与生产环境构建 |
| **状态/持久化** | `Zustand` + `Persist` | 响应式状态管理，支持跨会话数据留存 |
| **后端/安全** | `Supabase` + `RLS` | 行级权限控制，确保每个用户的数据独立且安全 |
| **AI 能力** | `OpenRouter` / `DeepSeek` | 多模型驱动的可视化与文本智能分析 |
| **视觉交互** | `Tailwind CSS` + `Framer Motion` | 辅以微妙的微动画，打造高级感界面 |

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
