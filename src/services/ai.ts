// OpenRouter AI 服务
const API_KEY = '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';
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
所有位置名: [${allNames}]

操作类型:
- add_cabinet: 添加收纳家具, 字段: name,type(wardrobe/shelf/drawer/box/cabinet),parentRoom
- add_room: 添加房间, 字段: name,type(living/bedroom/kitchen/bathroom/balcony/study/dining/storage)
- add_item: 记录物品位置, 字段: name,category(衣物/电子产品/工具/书籍/厨房用品/药品/其他),quantity,locationName
- delete_item: 删除物品, 字段: name,locationName

关键规则:
1. locationName必须精确匹配"所有位置名"中的一个，或匹配同一句中新建的收纳名
2. 优先选收纳点而非房间。"书房的柜子"→locationName="柜子"(如果存在)
3. 中文数字:一=1,两=2,三=3
4. "放到了/放在/存到/收到" 等表达 = add_item
5. "添加/新增/创建/加入" + 家具名 = add_cabinet
6. "删除/移除/去掉" = delete_item
7. 复合指令：先add_cabinet再add_item到新建的收纳里
8. "里面/裡面" 指代前面提到的收纳点
9. name中不要包含"收纳-"前缀，直接用家具名如"置物柜1"
10. 查询/建议类请求 = []
11. 只输出JSON数组

示例:
"杂物收纳柜中放着湿纸巾和口罩，帮我记录"
[{"action":"add_item","name":"湿纸巾","category":"其他","quantity":1,"locationName":"杂物收纳柜"},{"action":"add_item","name":"口罩","category":"其他","quantity":1,"locationName":"杂物收纳柜"}]

"一次性内衣裤放到了书房的柜子里"
[{"action":"add_item","name":"一次性内衣裤","category":"衣物","quantity":1,"locationName":"柜子"}]

"在书房里加入置物柜1，帮我把网络连接线放到里面"
[{"action":"add_cabinet","name":"置物柜1","type":"shelf","parentRoom":"书房"},{"action":"add_item","name":"网络连接线","category":"电子产品","quantity":1,"locationName":"置物柜1"}]

"客厅添加一个鞋柜，把拖鞋和运动鞋放进去"
[{"action":"add_cabinet","name":"鞋柜","type":"cabinet","parentRoom":"客厅"},{"action":"add_item","name":"拖鞋","category":"衣物","quantity":1,"locationName":"鞋柜"},{"action":"add_item","name":"运动鞋","category":"衣物","quantity":1,"locationName":"鞋柜"}]

"在客厅添加两个衣柜"
[{"action":"add_cabinet","name":"衣柜1","type":"wardrobe","parentRoom":"客厅"},{"action":"add_cabinet","name":"衣柜2","type":"wardrobe","parentRoom":"客厅"}]

"把书房的PS5删掉"
[{"action":"delete_item","name":"PS5","locationName":"书房"}]

"家里有什么？"
[]`;

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
