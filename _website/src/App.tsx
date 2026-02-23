import { motion } from 'framer-motion';
import { Box, Lock, Share2, Sparkles, Github, ExternalLink, ArrowRight, Users } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }
  })
};

export default function App() {

  const features = [
    {
      title: "自由定位空间",
      desc: "彻底抛弃枯燥的一维列表。通过高度交互的二维房型编辑器，您可以随心所欲地拖拽、绘制您的家庭平面图。所见即所得地定义每一个储物柜的位置和容积率，让您的资产管理拥有真正的「空间感」。",
      icon: <Box className="w-8 h-8 text-blue-500" />,
      tag: "可视化呈现"
    },
    {
      title: "全栈家庭共享",
      desc: "家里的数据，全家一起管！只需通过专属的邀请码，即可在毫秒间邀请家人连入同一个数据节点。数据变动支持实时穿透推送，并拥有防误操作日志，真正实现家庭无界协作。",
      icon: <Share2 className="w-8 h-8 text-indigo-500" />,
      tag: "无缝互联"
    },
    {
      title: "开源且绝对安全",
      desc: "您的数字资产比什么都重要。HomeBox 搭建于最先进的 Supabase PostgreSQL 环境上，所有的读写均通过极其苛刻的 RLS (行级安全认证) 鉴权。而且，底层代码完全开源透明。",
      icon: <Lock className="w-8 h-8 text-teal-500" />,
      tag: "行级安全"
    },
    {
      title: "硬核 AI 认知引擎",
      desc: "不只是被动记录，它能主动思考！内置大语言模型引擎，随时可以分析您填写的保质期隐患、识别盲目的「消费主义」囤积症，甚至能幽默地吐槽您糟糕的收纳逻辑。",
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      tag: "大语言模型"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* 极简顶栏 */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">HomeBox</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">核心特性</a>
            <a href="#demo" className="hover:text-blue-600 transition-colors">产品界面</a>
            <a href="https://github.com/zhewenzhang/home-storage" target="_blank" className="hover:text-slate-900 transition-colors flex items-center gap-2">
              <Github className="w-5 h-5" /> 开放源代码
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://homestorage.zeabur.app/#/" target="_blank" className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors flex items-center gap-2">
              去云端控制面板走一遭 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* 全新开场 Banner (TON-Style) */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32">
          {/* 装饰用蓝色光晕 */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <motion.div custom={0} initial="hidden" animate="visible" variants={fadeIn}>
                <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6 border border-blue-100">
                  ✨ v1.2 全新发布 - 搭载架构级 AI 体检能力
                </span>
              </motion.div>

              <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeIn} className="text-6xl md:text-[80px] font-black text-slate-900 tracking-tight leading-[1.05] mb-8">
                让每一件物品 <br />
                <span className="text-blue-600">都有家可归。</span>
              </motion.h1>

              <motion.p custom={2} initial="hidden" animate="visible" variants={fadeIn} className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                打破枯燥列表。自定义您的 2D 房型矩阵，全栈家庭协作共享，更有硬核 AI 管家全景诊断。为您打造全天候无死角的「透明化」现代收纳大盘。
              </motion.p>

              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4">
                <a href="https://homestorage.zeabur.app/#/" target="_blank" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3">
                  进入云端服务体验 <ArrowRight className="w-5 h-5" />
                </a>
                <a href="https://github.com/zhewenzhang/home-storage" target="_blank" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-50 text-slate-700 font-bold text-lg border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  <Github className="w-5 h-5" /> 查看 GitHub 源码
                </a>
              </motion.div>
            </div>

            {/* 右侧核心截图 - 图1 (HomeBox-PC 主屏) */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeIn} className="flex-1 w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-white p-2">
              <div className="bg-slate-100 rounded-2xl aspect-[4/3] w-full relative overflow-hidden flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200">
                <Box className="w-16 h-16 text-blue-300 mb-6" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">全站二维拓扑结构</h3>
                <p className="text-slate-500 font-medium">所见即所得的极简交互呈现，告别枯燥的折叠列表</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 核心卖点网格区域 */}
        <section id="features" className="py-32 bg-[#F8F9FB]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">这不是一个简单的记事本。</h2>
              <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
                HomeBox 融合了极其现代的大量 Web 渲染技术、企业级云端鉴权引擎，以及最新一代大语言模型架构，是您居家资产的终极中心。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-10 md:p-14 rounded-[32px] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-blue-50 transition-all">
                      {f.icon}
                    </div>
                    <span className="px-4 py-2 rounded-full bg-slate-100/80 text-slate-500 text-sm font-bold tracking-wide">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 深度截图展示区 */}
        <section id="demo" className="py-32 bg-slate-900 text-white overflow-hidden rounded-[40px] mx-4 md:mx-10 mb-20">
          <div className="max-w-[1400px] mx-auto px-6 relative">
            {/* 背景装饰光 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />

            <div className="text-center mb-20 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">沉浸式的多维管理图景</h2>
              <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                不管是严谨的数字大盘，还是高度自由的平面布局，甚至是请求 AI 管家主动出击，我们都有无可比拟的体验。
              </p>
            </div>

            {/* 三宫格图片展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* 图2: 批量管理引擎 */}
              <div className="rounded-[32px] overflow-hidden border border-white/10 bg-black/40 p-2 md:col-span-2">
                <div className="w-full h-[400px] rounded-[24px] bg-gradient-to-br from-slate-800 to-black flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <h3 className="text-3xl font-black text-white/90 mb-4 z-10 font-mono tracking-tight">DATA_GRID_ENGINE</h3>
                  <p className="text-slate-400 font-medium max-w-sm text-center z-10">如 Excel 般流畅的批量操作体验，支持分类筛选与极速修改，轻松承载海量家庭资产数据。</p>
                </div>
              </div>

              {/* 图3: AI收纳 */}
              <div className="rounded-[32px] overflow-hidden border border-white/10 bg-black/40 p-2">
                <div className="w-full h-[300px] rounded-[24px] bg-gradient-to-br from-purple-900/40 to-black flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Sparkles className="w-12 h-12 text-purple-400 mb-6 z-10 mix-blend-screen" />
                  <h3 className="text-2xl font-black text-white/90 mb-3 z-10">硅基自然语言助理</h3>
                  <p className="text-slate-400 text-sm font-medium text-center px-6 z-10">深度意图识别，智能全家大盘过期分析与收纳吐槽建议。</p>
                </div>
              </div>

              {/* 图4: 全栈家庭共享 */}
              <div className="rounded-[32px] overflow-hidden border border-white/10 bg-black/40 p-2">
                <div className="w-full h-[300px] rounded-[24px] bg-gradient-to-br from-emerald-900/40 to-black flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Users className="w-12 h-12 text-emerald-400 mb-6 z-10 mix-blend-screen" />
                  <h3 className="text-2xl font-black text-white/90 mb-3 z-10">毫秒级家庭热组网</h3>
                  <p className="text-slate-400 text-sm font-medium text-center px-6 z-10">一条六位邀请码，瞬间打通全家人跨端协同编辑流，实时穿透推送。</p>
                </div>
              </div>
            </div>

            <div className="mt-20 text-center relative z-10">
              <a href="https://homestorage.zeabur.app/#/" target="_blank" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-100 transition-all hover:scale-105">
                立即接入 Web 云服务系统 <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-white border-t border-slate-200 py-12 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Box className="w-6 h-6 text-blue-600" />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">HomeBox</span>
          </div>
          <p className="text-slate-500 font-medium">
            Made with 💙 for organized lives. @Dave
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/zhewenzhang/home-storage" className="text-slate-400 hover:text-slate-900"><Github /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
