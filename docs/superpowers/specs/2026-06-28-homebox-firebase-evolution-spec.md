# HomeBox 储物系统后续演进与规范规格说明书 (Spec)

> **创建日期**：2026 年 6 月 28 日  
> **项目定位**：从「个人/家庭极致储物神器 (Dogfooding)」逐步向「商业化 SaaS」演进。  
> **核心原则**：极致的速度、清爽整洁的高级产品设计感、扎实规范的数据库底座。

---

## 📌 一、 项目发展路线与优先级

经过 CEO 与架构师的脑暴与决策，项目后续的功能开发优先级明确如下：

$$\text{AI 批量视觉录入 (A)} > \text{Canvas 平面图下钻动效 (C)} > \text{智能临期 Email 推送 (B)} > \text{家庭极简协作 (D)}$$

*   **当前阶段 (A + C)**：打磨用户体验爽点。攻克“物品批量录入成本高”的瓶颈，深度开发 Canvas 可视化找物的差异化卖点。
*   **后续阶段 (B + D)**：逐步丰富通知场景，并优化家庭绑定链路，为后续商业化做准备。

---

## 🗃️ 二、 数据库与存储规范化设计 (基础底座)

为了保证后续复杂开发的扎实度，彻底清理旧有 Supabase 的残余字段，Firestore 数据库集合（Collections）Schema 规范统一如下：

### 1. `profiles` (用户档案表)
每个用户注册后在云端有且仅有一条记录，以 Firebase `uid` 作为 Document ID。
```json
{
  "display_name": "davezhangus",
  "updated_at": 1719530000000
}
```

### 2. `locations` (空间位置表)
记录所有的房间、柜子、格位层级。Document ID 采用随机 UUID。
```json
{
  "user_id": "firebase-user-uid",
  "name": "主卧五斗橱",
  "type": "drawer",              // 空间类型：room, wardrobe, drawer, box
  "parent_id": "parent-location-uuid-or-null", // 支持无限层级嵌套
  "room_type": "wardrobe",       // 图标类型映射
  "bounds": {                    // Canvas 平面图坐标区域
    "x": 120,
    "y": 80,
    "width": 60,
    "height": 40
  },
  "created_at": 1719530000000
}
```

### 3. `items` (物品明细表)
记录具体的储物资产。Document ID 采用随机 UUID。
```json
{
  "user_id": "firebase-user-uid",
  "name": "海飞丝去屑洗发水",
  "category": "洗护用品",
  "quantity": 3,
  "description": "2026年618囤货",
  "location_id": "target-location-uuid",
  "expiry_date": "2028-06-28",  // 统一格式化为 YYYY-MM-DD，无过期日则为 null
  "image_url": "https://firebasestorage.googleapis.com/v0/b/...", // 纯 Firebase 存储链
  "created_at": 1719530000000
}
```

### 4. `floor_plans` (户型平面图配置)
记录每个家庭/用户上传的户型图背景信息。
```json
{
  "user_id": "firebase-user-uid",
  "name": "我的温馨小家",
  "width": 800,
  "height": 600,
  "image_url": "https://firebasestorage.googleapis.com/v0/b/...",
  "updated_at": 1719530000000
}
```

---

## 📸 三、 AI 批量多模态拍照录入规范

### 1. 核心流程与架构
1. **调用相机**：前端提供显眼的「AI 拍照批量录入」按钮，支持手机摄像头实时拍照或相册选择。
2. **多模态分析**：图片在前端压缩转为 Base64，调用 Firebase Cloud Functions 或中转 API 访问 Gemini 视觉模型。
3. **数据结构化输出**：AI 需以严格 JSON 格式返回识别出的多件物品列表：
   ```json
   {
     "items": [
       { "name": "蓝月亮洗衣液", "quantity": 2, "category": "家清用品", "expiry_years_suggest": 3 },
       { "name": "乐事薯片", "quantity": 1, "category": "食品零食", "expiry_date_suggest": "2026-12-28" }
     ]
   }
   ```
4. **批量入库确认页**：
   * 前端使用卡片列表呈现 AI 的识别结果，用户可一键修改数量，或批量指定它们归属的「存储位置」。
   * 点击「一键入库」，前端通过 Firestore Write Batch 原子批量写入，提升写入速度并减少网络请求次数。

---

## 📐 四、 Canvas 空间高级下钻与动效规范

### 1. 无缝下钻与聚焦交互 (Drill-down)
* **下钻机制**：
  * Canvas 画布侦听双击事件。当双击某个房间（如：`厨房`）时，计算该空间在 Canvas 的 bounding box。
  * 执行平滑的补间矩阵变换（Matrix Transform Scale），使当前空间平滑放大至全屏，并淡出其他无关空间。
  * 渐变显示该空间下的子位置（如：`冰箱`、`橱柜`）。
* **面包屑追踪**：
  * 顶部常驻面包屑导航：`我的家 > 厨房 > 冰箱 > 零食盒`。点击面包屑的任何一级，Canvas 自动平滑缩退（Zoom-out）到对应的层级。
* **动效算法**：
  * 采用 `requestAnimationFrame` 配合三次贝塞尔曲线算法（Cubic-Bezier）计算每一帧的 `Scale` 和 `Translate`。
  * 保证在千元机/低端移动端浏览器上依然保持 **60 FPS** 级别的跟手缩放，绝无生硬跳变与卡顿。

---

## ⚡ 五、 整体性能与加载速度优化规范

1. **分包与延迟加载 (Lazy Loading)**：
   * 对 Firebase SDK 相关的重量级依赖进行 Vite 分块打包（Code Splitting），使非设置、非数据库交互的页面（如登录引导页、普通列表页）体积缩减 60% 以上。
   * 对复杂的 Canvas 重绘组件采用 `React.lazy()` 延迟导入。
2. **连接预解析**：
   * 在 HTML 头部维持 `dns-prefetch` 和 `preconnect`，对 Firebase API 域名进行提前握手，缩短网络延时。
3. **本地状态首屏快照**：
   * 采用 Zustand + localStorage 缓存上一次读取的位置与物品元数据。在网页冷启动时，**优先瞬间渲染本地缓存**，同步在后台拉取 Firestore 最新数据，实现用户体感的“零等待”加载。

---

## 🎨 六、 界面整洁度与产品设计规范

* **规范化栅格系统**：全站统一采用 4px/8px倍数的间距系统，杜绝任何随意的 ad-hoc 边距。
* **精美动效微交互**：按钮悬浮时具有微妙的缩放和阴影变化，层级切换有轻微的过渡动效，展现出极其 premium 的高级感。
* **清爽色调与卡片**：全站维持 sleek 的深色/浅色自适应模式，利用毛玻璃效果（Glassmorphism）与优雅微渐变，使得即使在最深层的子页面也具备统一的高级产品调性。

---

## 📅 七、 推送与提醒模块演进规划

1. **第一阶段 (低频被动)**：
   * 前端在 `Settings` 页面允许绑定用户的电子邮箱。
   * 配置低成本的发信定时任务，每周一上午自动向用户发送一封精美的「储物周报」，罗列哪些囤货即将过期、哪些空间利用率过高。
2. **第二阶段 (高频即时)**：
   * 规划打通 Telegram Bot 或微信测试号，用户可在系统内一键扫码绑定。当发生物品被家人取走、或者保质期仅剩 3 天时，触发即时聊天消息提醒。
