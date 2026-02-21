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

## 🌟 核心特性概览 (Features)

HomeBox 致力于颠覆传统的列表记忆，为你提供所见即所得的极客级收纳体验：

- **🗺️ 双向可视化绑定** - 独特的可视化室内 2D 房型图模块，你可以建立属于自己的主卧、客厅结构，并将储物箱 (Location) 以可拖拽模块放置在其所在的地方。“找东西”从翻箱倒柜变成了像玩经营游戏一样简单。
- **👨‍👩‍👧‍👦 多账号家庭共享区** - 首创多成员授权绑定体系。您可以生成专属的 6 位邀请邀请码，分享给亲人。接入房间后相互可查可改同一套数据库。包含**安全退出、管理员踢人、自定义别名（备注名）**的全栈成员协同管控能力！
- **💻 极致的批量编辑器模式** - 对于大单量、大扫除的情况，我们完全还原了 Excel 类表格交互体验的心智。一次性选择上百件物品进行：**统一划拨房间归属、无限制行数复制增加、文本 CSV 解析导入**，一切以客户端草稿隔离并可在确认无误后通过事务全量存储入库！
- **🤖 内置 AI 整理助手顾问** - 集成了自然语言 AI 聊天窗口。不知分类或者收纳心得，可随时在系统侧边获取帮助指南。
- **🛡️ 企业级极速与安全响应** - 使用 `Supabase Auth` + `Postgres RLS (行级安全策略) RPC 驱动` 的云端设计方案。所有的物品增删查改都经过严格的鉴权边界。
- **📱 响应式的原生体验UI** - React+Tailwind 的极简轻量审美设计重铸界面，暗金色、天霁蓝的现代调色板。兼顾 Desktop 与 Mobile。

<br/>

## 🛠️ 技术栈 (Tech Stack)

| 领域 | 技术方案 | 描述 |
| --- | --- | --- |
| **前端架构** | `Vite` + `React 18` | 确保飞一般的冷启动与极速的客户端刷新率 |
| **状态管理** | `Zustand` | 轻量化、跨级的无感全局数据切片管控工具 |
| **样式与组件** | `Tailwind CSS 3` + `Lucide React`|  提供现代、响应式和美观的高分辨率矢量界面支持 |
| **路由** | `React Router DOM` | 实现无刷新的单页操作切换，支持参数持久化 |
| **核心底层与库** | `Supabase-js v2` | 提供核心强悍且实时的增量存储与 Serverless API 互通 |
| **部署托管** | 可部署于任何静态节点 (`Vercel`, `Netlify`) | 一键分发零服务器负担。|

<br/>

## 🚀 快速启动指南 (Get Started)

### 1. 克隆代码到本地
```bash
git clone https://github.com/zhewenzhang/home-storage.git
cd home-storage
```

### 2. 初始化与安装依赖包
```bash
npm install
# 建议您运行 npm outdated 验证包无严重不一致后运行
```

### 3. 环境配置 (.env.local)
您需要在 Supabase 端创建自己的云端或者自建容器。
将如下项替换为大家提供的连接并存放在根目录 `.env` 文件。
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...<your-api-key>
```
*💡 备注：您同时需要在 Supabase Console 仪表盘内执行根目录留存的 `supabase-schema.sql` 和 `update-schema.sql` 两个文件以初始化所需要的数据集结构和 RLS 连接验证！*

### 4. 运行
```bash
npm run dev
```

打开 `http://localhost:5173/home-storage/`（或控制台提示端口），然后马上享受绝妙的整理收起管理之旅！🎉

<br/>

## 📁 主要项目结构说明表

```text
home-storage/
├── src/
│   ├── components/      # (前端) 各个页面复用卡片与弹窗：例如 FamilyModal 和 Layout
│   ├── lib/             # (工具) supabase 实例化的拦截与初始化声明
│   ├── pages/           # (切片) 主站的五大核心逻辑路由区域
│   ├── services/        # (后端层) db.ts等封装对 DB 远程存储及所有 Promise
│   ├── store/           # (内存层) Zustand 控制中心聚合处理数据的实时回显
│   ├── types/           # 全局 Typescript 类型强规范文件
│   └── App.tsx / main.tsx
├── ...配置文件集
└── update-schema.sql    # 最近增加的 家庭分享功能/RLS SQL 函数安全执行策略 (关键)
```

<br/>

## 🤝 参与贡献 (Contributing)

感谢您感兴趣一起帮大伙“找东西”！如果您有更好的点子：

1. **Fork** 本项目
2. 切换一个特色分支：`git checkout -b feature/NewAwesomeFeature`
3. 提交改进：`git commit -m 'Add a cool storage function'`
4. 上传分支：`git push origin feature/NewAwesomeFeature`
5. 开启一个崭新的 **Pull Request**

任何 `Issue` 和对于 bug 的捕捉反馈我们都双手欢迎！🔥

&nbsp;
<p align="center">基于 ♥︎ 构建。享受生活，让家有迹可循。</p>
<br/>
