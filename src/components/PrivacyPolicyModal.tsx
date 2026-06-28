import { Shield, Lock, Server, BrainCircuit, Globe } from 'lucide-react';
import { Modal, Button } from './ui';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

export default function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
    return (
        <Modal isOpen={true} onClose={onClose} size="lg" title={
            <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-swiss-red" />
                <span>家庭云端数据隐私协议</span>
            </div>
        }>
            <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh]">
                <p className="font-bold text-black dark:text-white text-lg mb-6 leading-relaxed">
                    极客法则第一条：我的家，我做主。<br />
                    HomeBox 是一款彻头彻尾的「自托管 (Self-Hosted)」工具，您的数据主权神圣不可侵犯。
                </p>

                <div className="space-y-6">
                    <div className="border-2 border-black dark:border-white p-5">
                        <h4 className="flex items-center gap-2 font-bold text-black dark:text-white mt-0 mb-3 text-base">
                            <Server className="w-5 h-5 text-black dark:text-white" />
                            1. 数据的终极归属
                        </h4>
                        <p className="m-0 leading-relaxed text-sm text-gray-600 dark:text-gray-300">
                            本应用所有的运行数据（包括但不限于物品明细、房间布局、分类信息以及您的个人账号）均**完整且唯一地存放在您个人管控的 Firebase (Firestore) 数据库实例中**。
                            HomeBox 客户端仅仅是连接该数据库的"前端遥控器"。开发者既没有权限，也没有任何后门手段去读取、拦截或备份您的数据。
                        </p>
                    </div>

                    <div className="border-2 border-black dark:border-white p-5">
                        <h4 className="flex items-center gap-2 font-bold text-black dark:text-white mt-0 mb-3 text-base">
                            <Globe className="w-5 h-5 text-black dark:text-white" />
                            2. 零流量窃听与纯净沙盒
                        </h4>
                        <p className="m-0 leading-relaxed text-sm text-gray-600 dark:text-gray-300">
                            我们向您保证：本程序内部**绝对不包含**任何第三方的行为跟踪统计代码（如 Google Analytics、Baidu Tongji、Umeng 等）。我们不会记录您点击了什么按钮，也不会统计家里存放了多少件物品。您的每次操作产生的数据流量，仅仅在您的浏览器设备与您的 Firebase 服务器之间发生直连。
                        </p>
                    </div>

                    <div className="border-2 border-black dark:border-white p-5">
                        <h4 className="flex items-center gap-2 font-bold text-black dark:text-white mt-0 mb-3 text-base">
                            <BrainCircuit className="w-5 h-5 text-black dark:text-white" />
                            3. AI 与大语言模型披露
                        </h4>
                        <p className="m-0 leading-relaxed text-sm text-gray-600 dark:text-gray-300">
                            当您主动点击并使用「AI 家庭资产大盘体检」或「AI 自动分类」等衍生功能时，本客户端会将有限的结构化文本（如名称、数量、日期）通过您的 API Key 发送至第三方大语言模型（如 OpenAI、DeepSeek 或 SiliconFlow）以获取文字推理结果。
                            除了在推理的那一瞬间作为请求参数外，HomeBox 的中枢核心层不会对这些文本进行训练沉淀。
                        </p>
                        <p className="m-0 mt-3 leading-relaxed text-sm text-swiss-red font-bold">
                            ⚠️ 重要说明：您配置的 AI API Key 将通过环境变量注入前端 JavaScript 代码，任何使用浏览器开发者工具的人均可查看。这是客户端渲染架构的固有特性，无法做到完全隐匿。建议使用专用 API Key 并设置调用额度上限，避免使用具有超高权限的 Key。
                        </p>
                    </div>

                    <div className="border-2 border-black dark:border-white p-5">
                        <h4 className="flex items-center gap-2 font-bold text-black dark:text-white mt-0 mb-3 text-base">
                            <Lock className="w-5 h-5 text-black dark:text-white" />
                            4. 明文存储须知
                        </h4>
                        <p className="m-0 leading-relaxed text-sm text-gray-600 dark:text-gray-300">
                            为了保证系统的轻量和检索的高效，除账号密码哈希外，你的物品名称和明细等均未经对称加密地保存在 Firebase Firestore 安全规则保障中。请务必保护好您的 Firebase 账号凭证，并对特别私密的贵重物品隐晦命名。如果您的数据库凭据泄露，相关风险需由您自主承担。
                        </p>
                    </div>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-8 text-center uppercase tracking-widest font-bold">
                    Transparent · Privacy-First · Self-Hosted
                </p>
            </div>

            <div className="px-6 py-4 border-t-2 border-black dark:border-white flex justify-end">
                <Button onClick={onClose} variant="primary">
                    我明白，已阅
                </Button>
            </div>
        </Modal>
    );
}
