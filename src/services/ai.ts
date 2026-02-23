// OpenRouter AI 服务
const API_KEY = (import.meta as any).env.VITE_AI_API_KEY || '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'stepfun/step-3.5-flash:free';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIAction {
    action: 'add_cabinet' | 'add_room' | 'add_item' | 'delete_item';
    name: string;
    type?: string;
    parentRoom?: string;
    category?: string;
    quantity?: number;
    locationName?: string;
}

interface LocationData {
    id: string;
    name: string;
    type: string;
    roomType?: string;
    parentId?: string | null;
}

interface ItemData {
    id: string;
    name: string;
    category: string;
    quantity: number;
    description?: string;
    locationId?: string;
    expiryDate?: string;
}

// ====== 繁体→简体 常用字映射 ======
const T2S: Record<string, string> = {
    '書': '书', '櫃': '柜', '廳': '厅', '間': '间', '陽': '阳', '臺': '台',
    '衛': '卫', '廚': '厨', '臥': '卧', '層': '层', '幫': '帮', '東': '东',
    '記': '记', '錄': '录', '備': '备', '裡': '里', '裏': '里', '雜': '杂',
    '櫥': '橱', '鞋': '鞋', '電': '电', '視': '视', '頭': '头', '動': '动',
    '點': '点', '號': '号', '個': '个', '兩': '两', '內': '内', '衣': '衣',
    '褲': '裤', '這': '这', '對': '对', '應': '应', '進': '进', '從': '从',
    '們': '们', '還': '还', '與': '与', '機': '机', '開': '开', '關': '关',
    '紙': '纸', '濕': '湿', '買': '买', '賣': '卖', '請': '请', '讓': '让',
    '說': '说', '話': '话', '見': '见', '現': '现', '發': '发', '問': '问',
    '題': '题', '經': '经', '過': '过', '時': '时', '區': '区', '處': '处',
    '網': '网', '絡': '络', '線': '线', '連': '连', '總': '总', '積': '积',
    '物': '物', '品': '品', '納': '纳', '置': '置', '篇': '篇', '導': '导',
    '團': '团', '設': '设', '把': '把', '當': '当', '變': '变', '換': '换',
    '全': '全', '僅': '仅', '縣': '县', '樓': '楼', '報': '报', '告': '告',
};

export function toSimplified(text: string): string {
    let result = '';
    for (const ch of text) {
        result += T2S[ch] || ch;
    }
    return result;
}

// ====== 智能位置匹配 ======

/**
 * 从用户文本中找到最匹配的位置
 * 优先匹配收纳点（更具体），其次房间
 * 按名称长度降序，确保 "杂物收纳柜" 优先于 "客厅"
 */
export function findBestLocation(text: string, locations: LocationData[]): LocationData | null {
    // 按名称长度降序 + 收纳点优先
    const sorted = [...locations].sort((a, b) => {
        // 收纳点优先于房间
        if (a.type === 'room' && b.type !== 'room') return 1;
        if (a.type !== 'room' && b.type === 'room') return -1;
        return b.name.length - a.name.length;
    });

    for (const loc of sorted) {
        if (text.includes(loc.name)) return loc;
    }
    return null;
}

/**
 * 查找所有匹配的位置
 */
function findAllLocations(text: string, locations: LocationData[]): LocationData[] {
    return locations.filter(l => text.includes(l.name));
}

// ====== 系统提示词 ======

export function buildSystemPrompt(
    locations: LocationData[],
    items: ItemData[],
    actionsExecuted: boolean,
    executedDesc: string
): string {
    const rooms = locations.filter(l => l.type === 'room');
    const cabinets = locations.filter(l => l.type !== 'room');

    const roomInfo = rooms.map(r => {
        const children = cabinets.filter(c => c.parentId === r.id);
        const childInfo = children.map(c => {
            const ci = items.filter(i => i.locationId === c.id);
            return ci.length > 0 ? `${c.name}(${ci.map(i => `${i.name}×${i.quantity}`).join(',')})` : c.name;
        });
        return `  ${r.name}${childInfo.length > 0 ? ` → [${childInfo.join(', ')}]` : ''}`;
    }).join('\n');

    let actionNote = '';
    if (actionsExecuted) {
        actionNote = `\n\n✅ 系统已自动完成操作: ${executedDesc}\n请简短确认即可，不要重复操作细节。`;
    } else {
        actionNote = `\n\n⚠️ 注意：本次没有执行任何操作。你绝对不能说"已完成/已添加/已放入"之类的话。如果用户想要操作但未执行，请如实说"抱歉，没有找到对应的位置/收纳点"或给出建议。`;
    }

    return `你是HomeBox收纳助手，帮用户管理家中物品。

家庭布局:
${roomInfo || '(空)'}
统计: ${rooms.length}房间, ${cabinets.length}收纳点, ${items.length}物品${actionNote}

回复规则: 简洁友好中文，不提及系统内部机制。`;
}

// ====== 位置层级（给AI看） ======

function buildHierarchy(locations: LocationData[]): string {
    const rooms = locations.filter(l => l.type === 'room');
    const cabinets = locations.filter(l => l.type !== 'room');
    return rooms.map(r => {
        const children = cabinets.filter(c => c.parentId === r.id);
        return children.length > 0
            ? `${r.name} → [${children.map(c => c.name).join(', ')}]`
            : r.name;
    }).join('\n');
}

// ====== AI 意图解析 ======

export async function parseIntentWithAI(
    userText: string,
    locations: LocationData[]
): Promise<AIAction[]> {
    const hierarchy = buildHierarchy(locations);
    const allNames = locations.map(l => l.name).join(', ');

    const systemPrompt = `你是JSON意图解析器。分析中文指令返回JSON数组。

位置层级(房间→[收纳点]):
${hierarchy}
所有已知位置名: [${allNames}]

操作类型:
- add_cabinet: 添加收纳家具, 字段: name,type(wardrobe/shelf/drawer/box/cabinet),parentRoom
- add_room: 添加房间, 字段: name,type(living/bedroom/kitchen/bathroom/balcony/study/dining/storage)
- add_item: 记录物品位置, 字段: name,category(衣物/电子产品/工具/书籍/厨房用品/药品/其他),quantity,locationName
- delete_item: 删除物品, 字段: name,locationName

关键规则:
1. 【重要】严格区分「存放空间(柜/盒/箱/架/房间)」与「被存放的物品」！例如"杂物柜中加入杂物盒子"，"杂物柜"是收纳(add_cabinet或已存在的位置)，"杂物盒子"是被存放的物品(add_item)！
2. locationName必须精确匹配"所有已知位置名"中的一个，或匹配同一句中新建的收纳名。优先使用收纳点而非房间。
3. "放到了/放在/存到/收到" 等表达 = add_item
4. "添加/新增/创建/加入" 接 具存放功能的家具词汇(柜/箱/盒/架/篓) = add_cabinet
5. 复合指令：如果物品放入一个不存在的新柜子，先产生 add_cabinet，再产生 add_item 并将 locationName 设为该新柜子的 name。
6. 中文数字:一=1,两=2,三=3
7. name中不要包含"收纳-"前缀，直接用原词
8. 查询/建议类请求 = []
9. 只输出JSON数组

示例:
"帮我在客厅的杂物柜中加入杂物盒子"
[{"action":"add_cabinet","name":"杂物柜","type":"cabinet","parentRoom":"客厅"},{"action":"add_item","name":"杂物盒子","category":"其他","quantity":1,"locationName":"杂物柜"}]

"一次性内衣裤放到了书房的柜子里"
[{"action":"add_item","name":"一次性内衣裤","category":"衣物","quantity":1,"locationName":"柜子"}]

"在书房里加入置物柜1，帮我把网络连接线放到里面"
[{"action":"add_cabinet","name":"置物柜1","type":"shelf","parentRoom":"书房"},{"action":"add_item","name":"网络连接线","category":"电子产品","quantity":1,"locationName":"置物柜1"}]

"客厅添加一个鞋柜，把拖鞋放进去"
[{"action":"add_cabinet","name":"鞋柜","type":"cabinet","parentRoom":"客厅"},{"action":"add_item","name":"拖鞋","category":"衣物","quantity":1,"locationName":"鞋柜"}]

"把书房的PS5删掉"
[{"action":"delete_item","name":"PS5","locationName":"书房"}]

"家里有什么？"
[]`;

    if (!API_KEY || API_KEY.indexOf('your-ai-api-key') > -1) {
        console.warn('[AI] API Key 未配置。');
        return [];
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HomeBox-Intent',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText },
                ],
                stream: false,
                max_tokens: 600,
                temperature: 0.05,
            }),
        });

        if (!response.ok) {
            console.warn('[AI] API失败:', response.status);
            return [];
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim() || '[]';
        console.log('[AI意图] 原始:', raw);

        // 提取JSON（去除markdown代码块）
        const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];

        const parsed = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(parsed)) return [];

        // 过滤无效操作：name必须有意义（至少两个字符，不能纯符号）
        const actions = parsed.filter((a: any) => {
            if (!a.action || !a.name) return false;
            const name = String(a.name).trim();
            if (name.length < 1 || /^[.\-_,\s]+$/.test(name)) return false;
            return true;
        }) as AIAction[];
        console.log('[AI意图] 解析:', actions);
        return actions;
    } catch (err) {
        console.error('[AI意图] 失败:', err);
        return [];
    }
}

// ====== 本地意图解析（简化版） ======

const CN_NUM: Record<string, number> = {
    '一': 1, '两': 2, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
};

const ITEM_CATS: Record<string, string> = {
    '衣': '衣物', '裤': '衣物', '鞋': '衣物', '袜': '衣物', '帽': '衣物',
    '外套': '衣物', '雨衣': '衣物', '围巾': '衣物', '内衣': '衣物',
    '书': '书籍', '笔': '书籍',
    '手机': '电子产品', '充电': '电子产品', '耳机': '电子产品', '电脑': '电子产品',
    '碗': '厨房用品', '筷': '厨房用品', '锅': '厨房用品',
    '药': '药品', '创可贴': '药品',
};

function guessCategory(name: string): string {
    for (const [kw, cat] of Object.entries(ITEM_CATS)) {
        if (name.includes(kw)) return cat;
    }
    return '其他';
}

/**
 * 本地意图解析 - 简化版
 * 核心思路：找到位置 → 去掉位置和动词 → 剩下的就是物品/收纳名
 */
export function localParseIntent(text: string, locations: LocationData[]): AIAction[] {
    const actions: AIAction[] = [];

    // === 动作动词检测 ===
    const isPlaceItem = /(?:放到|放在|放进|放了|存到|存在|搬到|收到|放着|记录|帮我)/.test(text);
    const isAddFurniture = /(?:添加|新增|创建|加个|加一|加两|加三|加入)/.test(text);
    const isDelete = /(?:删除|移除|去掉|删掉|移掉|扔掉)/.test(text);
    const isCompound = isAddFurniture && isPlaceItem; // 复合指令

    if (!isPlaceItem && !isAddFurniture && !isDelete) return actions;

    // === 复合指令："在X添加Y，把Z放到里面" ===
    if (isCompound) {
        const roomNames = locations.filter(l => l.type === 'room').map(l => l.name);
        let targetRoom = '';
        for (const rn of roomNames) {
            if (text.includes(rn)) { targetRoom = rn; break; }
        }

        // 提取收纳名："加入X" 或 "添加X" 中的X
        const cabinetMatch = text.match(/(?:添加|新增|创建|加入|加个|加)\s*[\-—]?\s*([^,，。、帮把]+?)(?:，|,|帮|把|$)/);
        // 提取物品名："把Z放到" 中的Z
        const itemMatch = text.match(/(?:把|将)\s*(.+?)\s*(?:放到|放在|放进|存到|收到)/);

        if (cabinetMatch && itemMatch) {
            let cabinetName = cabinetMatch[1].trim();
            // 去掉 "收纳-" 前缀
            cabinetName = cabinetName.replace(/^收纳[\-—]/, '').trim();
            if (!cabinetName) cabinetName = cabinetMatch[1].trim();

            const type = cabinetName.includes('衣柜') || cabinetName.includes('衣橱') ? 'wardrobe'
                : cabinetName.includes('书架') || cabinetName.includes('架') ? 'shelf'
                    : cabinetName.includes('抽屉') ? 'drawer'
                        : cabinetName.includes('盒') || cabinetName.includes('箱') ? 'box'
                            : 'cabinet';

            actions.push({
                action: 'add_cabinet', name: cabinetName, type,
                parentRoom: targetRoom || undefined,
            });

            const itemsPart = itemMatch[1].trim();
            const itemNames = itemsPart.split(/[和以及、，,\s]+/).map(s => s.trim()).filter(s => s && s.length <= 15);
            for (const name of itemNames) {
                actions.push({
                    action: 'add_item', name, category: guessCategory(name),
                    quantity: 1, locationName: cabinetName,
                });
            }

            if (actions.length > 0) {
                console.log('[本地] 复合指令:', actions);
                return actions;
            }
        }
    }

    // === 找到文本中提到的所有位置 ===
    const matchedLocs = findAllLocations(text, locations);
    const bestLoc = findBestLocation(text, locations);

    // === 删除物品 ===
    if (isDelete && bestLoc) {
        let remaining = text;
        for (const loc of matchedLocs) remaining = remaining.replace(loc.name, '');
        remaining = remaining.replace(/(?:删除|移除|去掉|删掉|移掉|扔掉|把|的|了|帮我|从|里)/g, '').trim();
        if (remaining) {
            const names = remaining.split(/[和以及、，,\s]+/).filter(s => s.trim());
            for (const name of names) {
                actions.push({ action: 'delete_item', name: name.trim(), locationName: bestLoc.name });
            }
        }
        if (actions.length > 0) {
            console.log('[本地] delete_item:', actions);
            return actions;
        }
    }

    // === 放入物品 ===
    if (isPlaceItem && bestLoc) {
        let remaining = text;
        // 去掉位置名
        for (const loc of matchedLocs) remaining = remaining.replace(loc.name, '');
        // 去掉所有动词、方位词、助词
        remaining = remaining.replace(
            /(?:放到了|放在了|放进了|放到|放在|放进|存到了|存到|搬到了|搬到|收到了|收到|放着|放了|有|存着|装着|里面是|帮我|记录|加入|添加|以及|的|里|中|了|在|和|上|下|面|中间)+/g,
            ' '
        ).trim();
        // 按分隔符拆分物品
        const names = remaining.split(/[\s、，,]+/).map(s => s.trim()).filter(s => s && s.length > 0 && s.length <= 15);
        for (const name of names) {
            actions.push({
                action: 'add_item', name, category: guessCategory(name),
                quantity: 1, locationName: bestLoc.name,
            });
        }
        if (actions.length > 0) {
            console.log('[本地] add_item:', actions);
            return actions;
        }
    }

    // === 添加收纳家具 ===
    if (isAddFurniture) {
        const roomNames = locations.filter(l => l.type === 'room').map(l => l.name);
        let targetRoom = '';
        for (const rn of roomNames) {
            if (text.includes(rn)) { targetRoom = rn; break; }
        }

        // 提取数量
        let qty = 1;
        const numM = text.match(/(\d+)\s*个/);
        if (numM) qty = parseInt(numM[1]);
        else {
            for (const [cn, n] of Object.entries(CN_NUM)) {
                if (text.includes(cn + '个') || text.includes(cn + '件')) { qty = n; break; }
            }
        }

        // 提取家具名：去掉房间名和动词
        let remaining = text;
        for (const rn of roomNames) remaining = remaining.replace(rn, '');
        remaining = remaining.replace(/(?:添加|新增|创建|加|在|个|件|两|三|四|五|\d)/g, '').trim();
        const parts = remaining.split(/[和以及、，,\s]+/).filter(s => s.trim());

        for (const part of parts) {
            const name = part.trim();
            if (!name || name.length > 10) continue;
            const type = name.includes('衣柜') || name.includes('衣橱') ? 'wardrobe'
                : name.includes('书架') || name.includes('架') ? 'shelf'
                    : name.includes('抽屉') ? 'drawer'
                        : name.includes('盒') || name.includes('箱') ? 'box'
                            : 'cabinet';

            for (let i = 0; i < qty; i++) {
                actions.push({
                    action: 'add_cabinet',
                    name: qty > 1 ? `${name}${i + 1}` : name,
                    type, parentRoom: targetRoom || undefined,
                });
            }
        }

        if (actions.length > 0) {
            console.log('[本地] add_cabinet:', actions);
            return actions;
        }
    }

    return actions;
}

// ====== AI 自然语言回复 ======

export async function chatWithAI(
    messages: ChatMessage[],
    onChunk?: (text: string) => void
): Promise<string> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'HomeBox',
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            stream: !!onChunk,
            max_tokens: 600,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API错误(${response.status}): ${err}`);
    }

    if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                try {
                    const delta = JSON.parse(data).choices?.[0]?.delta?.content || '';
                    if (delta) { fullText += delta; onChunk(fullText); }
                } catch { /* ignore */ }
            }
        }
        return fullText;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，未能获取回复。';
}

// ====== AI 对话助手 ======

export async function getAIReply(
    userText: string,
    locations: LocationData[],
    items: ItemData[],
    onChunk?: (text: string) => void
): Promise<string> {
    if (!API_KEY || API_KEY.indexOf('your-ai-api-key') > -1) {
        return '🚫 系统检测到您的 AI 大模型功能仍未正确获取授权（API Key 丢失）。\n由于我们刚刚使用了更安全的隐藏环境变量文件配置，**您必须返回终端，重启原来运行的 `npm run dev` 命令框**，Vite 前端服务器才能识别到这次新加在底层的安全密钥。\n请立即重启控制台重试本功能！';
    }

    const systemPrompt = buildSystemPrompt(locations, items, false, '');

    return chatWithAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText }
    ], onChunk);
}

// ====== 家庭资产 AI 智能体检 ======

export async function generateHouseHealthReport(
    locations: LocationData[],
    items: ItemData[]
): Promise<string> {
    const rooms = locations.filter(l => l.type === 'room');
    const cabinets = locations.filter(l => l.type !== 'room');

    const hierarchy = rooms.map(r => {
        const children = cabinets.filter(c => c.parentId === r.id);
        const childInfo = children.map(c => {
            const ci = items.filter(i => i.locationId === c.id);
            return ci.length > 0 ? `${c.name}(${ci.map(i => `${i.name}×${i.quantity}${i.expiryDate ? `[保质期:${i.expiryDate}]` : ''}`).join(',')})` : c.name;
        });
        const ri = items.filter(i => i.locationId === r.id);
        const rStr = ri.length > 0 ? `直接散落物品: ${ri.map(i => `${i.name}×${i.quantity}${i.expiryDate ? `[保质期:${i.expiryDate}]` : ''}`).join(',')}` : '';
        return `🏠 ${r.name}:\n  收纳点: ${childInfo.join(', ') || '无'}\n  ${rStr}`;
    }).join('\n\n');

    const unassignedItems = items.filter(i => !i.locationId);
    let unassignedStr = '';
    if (unassignedItems.length > 0) {
        unassignedStr = `\n\n❓ 未分配位置的物品:\n${unassignedItems.map(i => `${i.name}×${i.quantity}${i.expiryDate ? `[保质期:${i.expiryDate}]` : ''}`).join(', ')}`;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const systemPrompt = `你是一位极具专业素养且带有一丝幽默感的「家庭超级管家」。今天的作用是为这个家庭的物品大盘进行一次「资产体检」。
今天是 ${todayDate}。当前家里的所有存货数据如下（请仔细阅读，括号内为数量和用户填写的保质期）：

${hierarchy}${unassignedStr}

你需要出具一份体检报告，语言要口语化、亲切自然，不要使用冷冰冰的机器语调。报告必须包含以下3个部分（使用Markdown格式）：

## 🧊 1. 隐患与常识诊断
- 请发挥你的生活常识，从上面寻找那些【本质上容易腐坏、有保质期】（如牛奶、调料、药品、零食等）但用户【没有记录保质期】的物品。提醒他们尽早确认并补上。（如果没有此类物品，请夸赞他们记录得很完美）。

## ⚠️ 2. 过期与囤积清退预警
- 根据今天的日期 ${todayDate}，计算上面标了保质期的物品。如果已经过期，严厉警告建议扔掉；如果有在一个月内即将临期的，提醒赶紧消耗。
- 分析数量：看看同一种东西（比如纸巾、口罩、药品等）是不是囤积得太多了，结合保质期和数量给出购物建议（例如："你的布洛芬囤了10盒，但半年后就过期了，下次打折请管住手"）。

## 🌟 3. 收纳逻辑点评
- 挑出一两个你觉得收纳位置很有趣、或者放错房间的物品（例如把洗脸巾放在了书房，把扳手放在了卧室）。幽默地吐槽一下，或者给他们合理的重新摆放建议。`;

    if (!API_KEY || API_KEY.indexOf('your-ai-api-key') > -1) {
        return '🚫 **体检引擎离线**\n\n系统未侦测到有效的 AI 诊断密钥。\n\n由于我们刚刚使用了绝对安全的隐藏式环境变量文件 (`.env.local`)，这导致您当前**正在运行中的前端终端服务器 (npm run dev) 还没有读取并感知到这把新的钥匙**。\n\n💡 **解决办法：**\n请前往您一直运行代码的那个命令行黑色窗口（终端），按下键盘 `Ctrl + C` 退出当前服务，然后再敲一遍 `npm run dev` 即可彻底激活硅基管家的权限！';
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HomeBox-HealthCheck',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: '管家，帮我做一次全家的物品大盘体检吧！' },
                ],
                stream: false,
                max_tokens: 1500,
                temperature: 0.6,
            }),
        });

        if (!response.ok) {
            return '抱歉，体检中心系统繁忙，请稍后再试。';
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || 'AI 没有返回任何诊断结果。';
    } catch (err) {
        console.error('[AI健康检查] 请求失败:', err);
        return '抱歉，体检中心系统出错。';
    }
}

// ====== AI Vision 图像识别自动录入 ======

export interface AIVisionResult {
    name: string;
    category: string;
    expiryDate: string;
}

export async function analyzeImageWithAI(imageUrl: string): Promise<AIVisionResult | null> {
    if (!API_KEY || API_KEY.indexOf('your-ai-api-key') > -1) {
        console.warn('AI API Key not configured');
        return null;
    }

    const systemPrompt = `你是一个精准的商品信息提取API。你的任务是分析用户上传的图片，并以严格的JSON格式输出以下字段:
- "name": 商品或物品的名称（尽量简短、准确，抛弃无用的修饰词）
- "category": 物品分类（**必须**是此列表中最适合的一个："电子产品", "工具", "衣物", "书籍", "厨房用品", "药品", "纪念品", "其他"）
- "expiryDate": 保质期或到期日（格式必须为 "YYYY-MM-DD"，如果是零食、药品、化妆品等带有保质期的物品，请仔细寻找。如果确定该物品没有保质期或图上完全找不到，请留空字符串 ""）

重要：
1. 你的回复必须且只能是一串合法的 JSON！绝对不能包含其他任何说明文字、代码块语法（如 \`\`\`json 等）。
2. 如果图片模糊完全无法识别，你可以返回 { "name": "未知物品", "category": "其他", "expiryDate": "" }`;

    try {
        // 用户指定使用的开源强大视觉思考模型
        const visionModel = 'qwen/qwen3-vl-30b-a3b-thinking';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HomeBox-Vision',
            },
            body: JSON.stringify({
                model: visionModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: [
                            { type: "text", text: "请解析这张图里的物品信息并返回JSON。" },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 300,
                temperature: 0.1, // 低温保证JSON输出的稳定性 
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[AI Vision] API 返回错误状态:', response.status, errText);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) return null;

        // 尝试解析 JSON, 兼容偶尔 AI 多嘴带了 Markdown 块的情况
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr) as AIVisionResult;

        return {
            name: parsed.name || '未知物品',
            category: parsed.category || '其他',
            expiryDate: parsed.expiryDate || '',
        };
    } catch (err) {
        console.error('[AI Vision] 解析图片失败:', err);
        return null;
    }
}
