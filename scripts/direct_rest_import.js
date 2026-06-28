import fs from 'fs/promises';
import path from 'path';
import os from 'os';

function toFirestoreValue(val) {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: val.toString() };
    }
    return { doubleValue: val };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(item => toFirestoreValue(item))
      }
    };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

async function writeDocument(collectionId, documentId, fields, token) {
  const url = `https://firestore.googleapis.com/v1/projects/homebox-hosting/databases/(default)/documents/${collectionId}/${documentId}`;
  
  const payload = {
    fields: {}
  };
  for (const [k, v] of Object.entries(fields)) {
    payload.fields[k] = toFirestoreValue(v);
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`写入 ${collectionId}/${documentId} 失败 (HTTP ${res.status}): ${errText}`);
  }
}

async function main() {
  console.log('===================================================');
  console.log('⚡ Firestore REST API 数据一键直连写入工具');
  console.log('===================================================');

  // 1. 读取本地 Supabase 备份数据
  let backupData;
  const backupPath = path.resolve('public/supabase_data.json');
  try {
    const content = await fs.readFile(backupPath, 'utf-8');
    backupData = JSON.parse(content);
    console.log(`✅ 成功读取本地备份数据！`);
  } catch (err) {
    console.error('❌ 未在项目 public 目录中找到 supabase_data.json 备份包。请确保先运行过 extract 脚本。');
    return;
  }

  // 2. 读取本地 Firebase CLI 缓存凭证
  let accessToken = '';
  try {
    const configPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);
    accessToken = config.tokens?.access_token;
    if (!accessToken) throw new Error('Access Token 缺失');
    console.log(`✅ 已成功获取本地 Firebase 登录凭据 (账户: ${config.user?.email || '未知'})`);
  } catch (err) {
    console.error(`❌ 获取本地凭据失败: ${err.message}`);
    console.log('💡 建议：请确保您已在本地终端执行过 firebase login。');
    return;
  }

  // 3. 执行写入
  console.log('\n🚀 开始通过 REST API 写入 Firestore...');
  
  const targetUserId = '0420fa03-512a-406c-aa91-ea5bbc00987b'; // 写入旧所有者 ID，供前端静默绑定

  try {
    // A. 写入 profiles
    console.log('同步个人档案 (profiles)...');
    const originalProfile = backupData.profiles[0];
    await writeDocument('profiles', targetUserId, {
      display_name: originalProfile?.display_name || 'davezhangus',
      updated_at: Date.now()
    }, accessToken);

    // B. 写入 locations
    console.log(`同步 ${backupData.locations.length} 个空间位置 (locations)...`);
    for (const loc of backupData.locations) {
      await writeDocument('locations', loc.id, {
        user_id: targetUserId,
        name: loc.name,
        type: loc.type,
        parent_id: loc.parent_id || null,
        room_type: loc.room_type || null,
        bounds: loc.bounds || null,
        created_at: loc.created_at ? new Date(loc.created_at).getTime() : Date.now()
      }, accessToken);
    }

    // C. 写入 items
    console.log(`同步 ${backupData.items.length} 件物品明细 (items)...`);
    for (const item of backupData.items) {
      await writeDocument('items', item.id, {
        user_id: targetUserId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description || '',
        location_id: item.location_id || null,
        expiry_date: item.expiry_date || null,
        image_url: item.image_url || null,
        created_at: item.created_at ? new Date(item.created_at).getTime() : Date.now()
      }, accessToken);
    }

    // D. 写入 floor_plans
    if (backupData.floor_plans && backupData.floor_plans.length > 0) {
      console.log(`同步平面图 (floor_plans)...`);
      for (const fp of backupData.floor_plans) {
        await writeDocument('floor_plans', fp.id, {
          user_id: targetUserId,
          name: fp.name,
          width: fp.width,
          height: fp.height,
          updated_at: fp.updated_at ? new Date(fp.updated_at).getTime() : Date.now()
        }, accessToken);
      }
    }

    // E. 写入 family_invites
    if (backupData.family_invites && backupData.family_invites.length > 0) {
      console.log(`同步家庭邀请码 (family_invites)...`);
      for (const invite of backupData.family_invites) {
        const code = invite.code;
        if (code) {
          await writeDocument('family_invites', code, {
            owner_id: targetUserId,
            created_at: invite.created_at ? new Date(invite.created_at).getTime() : Date.now()
          }, accessToken);
        }
      }
    }

    console.log('\n===================================================');
    console.log('🎉 恭喜！数据直连迁移已全部成功导入 Firestore！');
    console.log('现在您只需用 Google 账号登录本地页面，系统就会为您全自动静默导入归属权。');
    console.log('===================================================');

  } catch (migrateErr) {
    console.error(`❌ 迁移写入中途失败: ${migrateErr.message}`);
  }
}

main();
