import { X, Shield, Lock, Server, BrainCircuit, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

export default function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-enter">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-gray-900">家庭云端数据隐私协议</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-1 prose prose-sm md:prose-base prose-emerald max-w-none text-gray-600">
                    <p className="font-bold text-gray-800 text-lg mb-6 leading-relaxed">
                        极客法则第一条：我的家，我做主。<br />
                        HomeBox 是一款彻头彻尾的「自托管 (Self-Hosted)」工具，您的数据主权神圣不可侵犯。
                    </p>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 mt-0 mb-3 text-base">
                                <Server className="w-5 h-5 text-blue-500" />
                                1. 数据的终极归属
                            </h4>
                            <p className="m-0 leading-relaxed text-sm">
                                本应用所有的运行数据（包括但不限于物品明细、房间布局、分类信息以及您的个人账号）均**完整且唯一地存放在您个人管控的 Supabase 数据库实例中**。
                                HomeBox 客户端仅仅是连接该数据库的“前端遥控器”。开发者既没有权限，也没有任何后门手段去读取、拦截或备份您的数据。
                            </p>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 mt-0 mb-3 text-base">
                                <Globe className="w-5 h-5 text-orange-500" />
                                2. 零流量窃听与纯净沙盒
                            </h4>
                            <p className="m-0 leading-relaxed text-sm">
                                我们向您保证：本程序内部**绝对不包含**任何第三方的行为跟踪统计代码（如 Google Analytics、Baidu Tongji、Umeng 等）。我们不会记录您点击了什么按钮，也不会统计家里存放了多少件东西。您的每次操作产生的数据流量，仅仅在您的浏览器设备与您的 Supabase 服务器之间发生直连。
                            </p>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 mt-0 mb-3 text-base">
                                <BrainCircuit className="w-5 h-5 text-purple-500" />
                                3. AI 与大语言模型披露
                            </h4>
                            <p className="m-0 leading-relaxed text-sm">
                                当您主动点击并使用「AI 家庭资产大盘体检」或「AI 自动分类」等衍生功能时，本客户端会将有限的结构化文本（如名称、数量、日期）通过您的 API Key 发送至第三方大语言模型（如 OpenAI、DeepSeek 或 SiliconFlow）以获取文字推理结果。
                                除了在推理的那一瞬间作为请求参数外，HomeBox 的中枢核心层不会对这些文本进行训练沉淀。
                            </p>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 mt-0 mb-3 text-base">
                                <Lock className="w-5 h-5 text-red-500" />
                                4. 明文存储须知
                            </h4>
                            <p className="m-0 leading-relaxed text-sm">
                                为了保证系统的轻量和检索的高效，除账号密码哈希外，您的物品名称和明细等均未经对称加密地保存在 Supabase 的行级安全表 (RLS) 中。请务必保护好您的 Supabase 管理员账号密钥，并对特别私密的贵重物品隐晦命名。如果您的数据库凭据泄露，相关风险需由您自主承担。
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-8 text-center uppercase tracking-widest font-bold">
                        Transparent · Privacy-First · Self-Hosted
                    </p>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="btn-primary px-8 py-2.5 rounded-xl font-bold"
                    >
                        我明白，已阅
                    </button>
                </div>
            </div>
        </div>
    );
}
