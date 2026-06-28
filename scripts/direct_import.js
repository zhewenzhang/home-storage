import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function main() {
  console.log('===================================================');
  console.log('⚡ Firebase Admin 免密一键数据导入工具 (OAuth2)');
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
  let tokenValue = '';
  try {
    const configPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);
    tokenValue = config.tokens?.access_token;
    if (!tokenValue) throw new Error('Access Token 缺失');
    console.log(`✅ 已成功获取本地 Firebase 登录凭据 (账户: ${config.user?.email || '未知'})`);
  } catch (err) {
    console.error(`❌ 获取本地凭据失败: ${err.message}`);
    console.log('💡 建议：请确保您已在本地终端执行过 firebase login。');
    return;
  }

  // 3. 使用 Access Token 初始化 Firebase Admin
  try {
    console.log('正在利用 OAuth2 Access Token 初始化 Firebase Admin...');
    const customCredential = {
      getAccessToken: async () => {
        return {
          access_token: tokenValue,
          expires_in: 3600
        };
      }
    };
    initializeApp({
      credential: customCredential,
      projectId: 'homebox-hosting'
    });
  } catch (initErr) {
    console.error(`❌ 初始化失败: ${initErr.message}`);
    return;
  }

  const db = getFirestore();
  const auth = getAuth();

  // 4. 定位和反查目标用户邮箱，获取他在 Firebase 上的真实 UID
  const originalProfile = backupData.profiles[0];
  const targetEmail = originalProfile?.email || 'davezhangus@gmail.com';
  
  console.log(`\n🔍 正在根据原账户邮箱 [ ${targetEmail} ] 反查其在 Firebase 的用户 UID...`);
  
  let firebaseUserId = '';
  try {
    const userRecord = await auth.getUserByEmail(targetEmail);
    firebaseUserId = userRecord.uid;
    console.log(`🎯 反查成功！在 Firebase 中的真实 UID 为: ${firebaseUserId}`);
  } catch (authErr) {
    if (authErr.code === 'auth/user-not-found') {
      console.log('ℹ️ Firebase Auth 中尚未找到该邮箱的账号，正在为您以管理员身份预创建占位账号...');
      try {
        const newRecord = await auth.createUser({
          email: targetEmail,
          displayName: originalProfile?.display_name || targetEmail.split('@')[0]
        });
        firebaseUserId = newRecord.uid;
        console.log(`✅ 占位账号创建成功！在 Firebase 中的 UID 为: ${firebaseUserId}`);
      } catch (createErr) {
        console.error(`❌ 创建占位账号失败: ${createErr.message}`);
        return;
      }
    } else {
      console.error(`❌ 获取用户失败: ${authErr.message}`);
      return;
    }
  }

  // 5. 执行转换并写入 Firestore
  console.log('\n🚀 开始往 Firestore 写入数据...');
  
  try {
    // A. 写入 profiles
    console.log('同步个人档案 (profiles)...');
    await db.collection('profiles').doc(firebaseUserId).set({
      display_name: originalProfile?.display_name || targetEmail.split('@')[0],
      updated_at: Date.now()
    });

    // B. 写入 locations
    console.log(`同步 ${backupData.locations.length} 个空间位置 (locations)...`);
    const locBatch = db.batch();
    backupData.locations.forEach(loc => {
      const docRef = db.collection('locations').doc(loc.id);
      locBatch.set(docRef, {
        user_id: firebaseUserId,
        name: loc.name,
        type: loc.type,
        parent_id: loc.parent_id || null,
        room_type: loc.room_type || null,
        bounds: loc.bounds || null,
        created_at: loc.created_at ? new Date(loc.created_at).getTime() : Date.now()
      });
    });
    await locBatch.commit();

    // C. 写入 items
    console.log(`同步 ${backupData.items.length} 件物品明细 (items)...`);
    const batchSize = 400;
    for (let i = 0; i < backupData.items.length; i += batchSize) {
      const itemBatch = db.batch();
      const chunk = backupData.items.slice(i, i + batchSize);
      chunk.forEach(item => {
        const docRef = db.collection('items').doc(item.id);
        itemBatch.set(docRef, {
          user_id: firebaseUserId,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          description: item.description || '',
          location_id: item.location_id || null,
          expiry_date: item.expiry_date || null,
          image_url: item.image_url || null,
          created_at: item.created_at ? new Date(item.created_at).getTime() : Date.now()
        });
      });
      await itemBatch.commit();
    }

    // D. 写入 floor_plans
    if (backupData.floor_plans && backupData.floor_plans.length > 0) {
      console.log(`同步平面图 (floor_plans)...`);
      const fpBatch = db.batch();
      backupData.floor_plans.forEach(fp => {
        const docRef = db.collection('floor_plans').doc(fp.id);
        fpBatch.set(docRef, {
          user_id: firebaseUserId,
          name: fp.name,
          width: fp.width,
          height: fp.height,
          updated_at: fp.updated_at ? new Date(fp.updated_at).getTime() : Date.now()
        });
      });
      await fpBatch.commit();
    }

    // E. 写入 family_invites
    if (backupData.family_invites && backupData.family_invites.length > 0) {
      console.log(`同步家庭邀请码 (family_invites)...`);
      const inviteBatch = db.batch();
      backupData.family_invites.forEach(invite => {
        const code = invite.code;
        if (code) {
          const docRef = db.collection('family_invites').doc(code);
          inviteBatch.set(docRef, {
            owner_id: firebaseUserId,
            created_at: invite.created_at ? new Date(invite.created_at).getTime() : Date.now()
          });
        }
      });
      await inviteBatch.commit();
    }

    console.log('\n===================================================');
    console.log('🎉 恭喜！迁移完成。全部数据已写入云端 Firebase Firestore。');
    console.log('===================================================');

  } catch (migrateErr) {
    console.error(`❌ 迁移写入中途失败: ${migrateErr.message}`);
  }
}

main();
