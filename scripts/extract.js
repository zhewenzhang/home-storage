import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// 优先使用特殊的 Service Role Key（绕过 RLS），没有则使用 ANON_KEY（需要用户提供或表未设防）
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function main() {
  console.log('===================================================');
  console.log('📥 HomeBox Supabase 数据物理提取工具');
  console.log('===================================================');

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ 缺少环境变量！请确保 .env.production 中存在 VITE_SUPABASE_URL，并且已在其中或普通 .env 中配置了 VITE_SUPABASE_SERVICE_ROLE_KEY。');
    return;
  }

  // 1. 获取目标用户的 ID
  // 我们通过先扫描 items 数据库，找出资产数量最多、最活跃的 user_id 作为我们的主要提取对象。
  console.log('正在扫描 Supabase items 物品表，确定主要数据所有者...');
  
  let targetUserId = '';
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/items?select=user_id`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (res.ok) {
      const items = await res.json();
      if (items.length > 0) {
        const counts = {};
        items.forEach(it => {
          counts[it.user_id] = (counts[it.user_id] || 0) + 1;
        });
        // 找物品数量最多的那个
        const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        targetUserId = sorted[0];
        console.log(`🎯 自动检测：物品数量最多（拥有 ${counts[targetUserId]} 件物品）的用户 ID 是: ${targetUserId}`);
      }
    }
  } catch (err) {
    console.warn(`扫描 items 失败: ${err.message}`);
  }

  // 如果 items 没有数据，尝试扫描 locations 拿到第一个所有者
  if (!targetUserId) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/locations?select=user_id&limit=1`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          targetUserId = data[0].user_id;
          console.log(`🎯 检测到有空间位置数据的所有者 ID: ${targetUserId}`);
        }
      }
    } catch (err) {
      console.warn('扫描 locations 失败:', err.message);
    }
  }

  // 如果依然没有，再尝试从 profiles 表中拉取第一个用户
  if (!targetUserId) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,display_name&limit=1`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          targetUserId = data[0].id;
          console.log(`🎯 回退策略：选择首个 Profile 用户 (昵称: ${data[0].display_name || '未设置'}, ID: ${targetUserId})`);
        }
      }
    } catch (err) {
      console.warn('获取 profiles 失败:', err.message);
    }
  }

  if (!targetUserId) {
    console.error('❌ 无法确定要提取的 Supabase 用户 ID！您可以手动在脚本中写入 targetUserId。');
    return;
  }

  const backupData = {
    profiles: [],
    locations: [],
    items: [],
    floor_plans: [],
    family_invites: []
  };

  try {
    console.log('\n开始拉取全量资产数据...');

    // 1. profiles
    backupData.profiles = await fetchTable('profiles', 'id', targetUserId);
    // 2. locations
    backupData.locations = await fetchTable('locations', 'user_id', targetUserId);
    // 3. items
    backupData.items = await fetchTable('items', 'user_id', targetUserId);
    // 4. floor_plans
    backupData.floor_plans = await fetchTable('floor_plans', 'user_id', targetUserId);
    // 5. family_invites
    backupData.family_invites = await fetchTable('family_invites', 'owner_id', targetUserId);

    console.log(`\n🎉 数据提取成功：`);
    console.log(`- 空间位置: ${backupData.locations.length} 个`);
    console.log(`- 物品数据: ${backupData.items.length} 件`);
    console.log(`- 户型平面图: ${backupData.floor_plans.length} 个`);

    // 将数据写入项目 public 目录，供前端页面一键读取
    const publicDir = path.resolve('public');
    await fs.mkdir(publicDir, { recursive: true });
    
    const targetPath = path.join(publicDir, 'supabase_data.json');
    await fs.writeFile(targetPath, JSON.stringify(backupData, null, 2), 'utf-8');
    
    console.log('\n===================================================');
    console.log(`💾 备份已成功写入前端资源目录: ${targetPath}`);
    console.log('项目启动后，前端“设置”页面将自动检测到该文件并提示您一键同步！');
    console.log('===================================================');

  } catch (err) {
    console.error(`❌ 数据备份失败: ${err.message}`);
  }
}

async function fetchTable(tableName, userIdField, userId) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?${userIdField}=eq.${userId}`;
  const res = await fetch(url, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });
  if (!res.ok) {
    throw new Error(`拉取表 ${tableName} 失败: ${res.statusText}`);
  }
  return await res.json();
}

main();
