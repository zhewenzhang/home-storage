import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// 加载现有的环境变量
dotenv.config();
// 尝试加载生产环境变量
dotenv.config({ path: '.env.production' });

const rl = readline.createInterface({ input, output });

async function main() {
  console.log('===================================================');
  console.log('🚀 HomeBox 数据库平稳迁移工具 (Supabase -> Firebase)');
  console.log('===================================================');

  // 1. 获取 Supabase 配置
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 未在项目环境变量中找到 Supabase 配置！请确保存在 .env.production 并包含 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。');
    rl.close();
    return;
  }

  console.log(`Supabase URL: ${supabaseUrl}`);

  // 2. 交互式获取 Supabase 账号密码进行登录以绕过 RLS
  console.log('\n--- 步骤 1: 登录 Supabase 并提取数据 ---');
  const suEmail = await rl.question('请输入您的 Supabase 登录邮箱: ');
  const suPassword = await rl.question('请输入您的 Supabase 登录密码: ');

  if (!suEmail || !suPassword) {
    console.error('❌ 邮箱或密码不能为空！');
    rl.close();
    return;
  }

  let supabaseToken = '';
  let supabaseUserId = '';

  try {
    console.log('正在登录 Supabase 获取授权 Token...');
    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: suEmail.trim(), password: suPassword.trim() })
    });

    if (!loginRes.ok) {
      const errDetail = await loginRes.text();
      throw new Error(`登录失败 (HTTP ${loginRes.status}): ${errDetail}`);
    }

    const loginData = await loginRes.json();
    supabaseToken = loginData.access_token;
    supabaseUserId = loginData.user.id;
    console.log(`✅ 登录成功！用户在 Supabase 的 ID 为: ${supabaseUserId}`);
  } catch (err) {
    console.error(`❌ Supabase 登录失败: ${err.message}`);
    rl.close();
    return;
  }

  // 3. 拉取所有数据
  const backupData = {
    profiles: [],
    locations: [],
    items: [],
    floor_plans: [],
    family_invites: []
  };

  try {
    console.log('\n开始从 Supabase 拉取用户资产数据...');

    // 拉取 profile
    console.log('正在拉取个人配置 (profiles)...');
    backupData.profiles = await fetchSupabaseTable('profiles', 'id', supabaseUserId, supabaseUrl, supabaseAnonKey, supabaseToken);

    // 拉取 locations
    console.log('正在拉取空间位置 (locations)...');
    backupData.locations = await fetchSupabaseTable('locations', 'user_id', supabaseUserId, supabaseUrl, supabaseAnonKey, supabaseToken);

    // 拉取 items
    console.log('正在拉取收纳物品 (items)...');
    backupData.items = await fetchSupabaseTable('items', 'user_id', supabaseUserId, supabaseUrl, supabaseAnonKey, supabaseToken);

    // 拉取 floor_plans
    console.log('正在拉取户型平面图 (floor_plans)...');
    backupData.floor_plans = await fetchSupabaseTable('floor_plans', 'user_id', supabaseUserId, supabaseUrl, supabaseAnonKey, supabaseToken);

    // 拉取 family_invites
    console.log('正在拉取家庭邀请码 (family_invites)...');
    backupData.family_invites = await fetchSupabaseTable('family_invites', 'owner_id', supabaseUserId, supabaseUrl, supabaseAnonKey, supabaseToken);

    console.log(`\n🎉 数据拉取完成！统计数据如下：`);
    console.log(`- 位置: ${backupData.locations.length} 个`);
    console.log(`- 物品: ${backupData.items.length} 件`);
    console.log(`- 户型图: ${backupData.floor_plans.length} 个`);
    console.log(`- 邀请码: ${backupData.family_invites.length} 个`);

    // 写入本地备份文件，防止丢失
    const backupPath = path.resolve('supabase_backup.json');
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`💾 数据已成功备份至本地文件: ${backupPath}`);
  } catch (err) {
    console.error(`❌ 拉取数据失败: ${err.message}`);
    rl.close();
    return;
  }

  // 4. 获取 Firebase Config 并初始化
  console.log('\n--- 步骤 2: 配置 Firebase 并登录/创建账号 ---');
  
  let firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

  if (!hasFirebaseConfig) {
    console.log('未检测到本地 `.env` 里的 Firebase 配置。请输入您的 Firebase Web SDK 配置对象参数：');
    firebaseConfig.apiKey = await rl.question('VITE_FIREBASE_API_KEY: ');
    firebaseConfig.authDomain = await rl.question('VITE_FIREBASE_AUTH_DOMAIN: ');
    firebaseConfig.projectId = await rl.question('VITE_FIREBASE_PROJECT_ID: ');
    firebaseConfig.storageBucket = await rl.question('VITE_FIREBASE_STORAGE_BUCKET: ');
    firebaseConfig.messagingSenderId = await rl.question('VITE_FIREBASE_MESSAGING_SENDER_ID: ');
    firebaseConfig.appId = await rl.question('VITE_FIREBASE_APP_ID: ');

    // 顺手写入本地 .env，为用户完成环境搭建
    const envLines = [
      `VITE_FIREBASE_API_KEY=${firebaseConfig.apiKey}`,
      `VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}`,
      `VITE_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}`,
      `VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}`,
      `VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}`,
      `VITE_FIREBASE_APP_ID=${firebaseConfig.appId}`,
      `VITE_AI_API_KEY=${process.env.VITE_AI_API_KEY || ''}`,
      `VITE_AI_MODEL=${process.env.VITE_AI_MODEL || ''}`
    ];
    await fs.writeFile('.env', envLines.join('\n'), 'utf-8');
    console.log('💾 已成功将 Firebase 配置写入本地 `.env` 文件。');
  }

  // 初始化 Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 5. 登录/注册 Firebase Auth 账号
  const fbEmail = await rl.question('\n请输入您的 Firebase 登录邮箱 (可与 Supabase 相同): ');
  const fbPassword = await rl.question('请输入您的 Firebase 登录密码 (至少 6 位): ');

  if (!fbEmail || !fbPassword) {
    console.error('❌ 邮箱或密码不能为空！');
    rl.close();
    return;
  }

  let firebaseUser = null;
  try {
    console.log(`正在登录 Firebase 账号 (${fbEmail.trim()})...`);
    const cred = await signInWithEmailAndPassword(auth, fbEmail.trim(), fbPassword.trim());
    firebaseUser = cred.user;
    console.log('✅ 登录成功！');
  } catch (loginErr) {
    if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
      console.log('账号未找到，正在为您尝试自动注册该账号...');
      try {
        const cred = await createUserWithEmailAndPassword(auth, fbEmail.trim(), fbPassword.trim());
        firebaseUser = cred.user;
        console.log('✅ 注册并登录成功！');
      } catch (regErr) {
        console.error(`❌ 自动注册失败: ${regErr.message}`);
        rl.close();
        return;
      }
    } else {
      console.error(`❌ 登录失败: ${loginErr.message}`);
      rl.close();
      return;
    }
  }

  const firebaseUserId = firebaseUser.uid;
  console.log(`Firebase 用户 UID 为: ${firebaseUserId}`);

  // 6. 开始数据迁移写入 Firestore
  console.log('\n--- 步骤 3: 转换关系并写入 Firestore ---');
  const confirmMigrate = await rl.question('是否确认将数据同步写入 Firebase？ (y/n): ');
  if (confirmMigrate.toLowerCase() !== 'y') {
    console.log('🚫 迁移已取消。备份数据仍安全保存在本地。');
    rl.close();
    return;
  }

  try {
    console.log('开始同步数据写入 Firestore...');

    // A. 写入 profiles
    const originalProfile = backupData.profiles[0];
    const displayName = originalProfile?.display_name || fbEmail.split('@')[0];
    console.log(`同步 profile: ${displayName}`);
    await setDoc(doc(db, 'profiles', firebaseUserId), {
      display_name: displayName,
      updated_at: Date.now()
    });

    // B. 写入 locations
    console.log(`正在同步 ${backupData.locations.length} 个空间位置...`);
    for (const loc of backupData.locations) {
      await setDoc(doc(db, 'locations', loc.id), {
        user_id: firebaseUserId, // 映射到新用户ID
        name: loc.name,
        type: loc.type,
        parent_id: loc.parent_id || null,
        room_type: loc.room_type || null,
        bounds: loc.bounds || null,
        created_at: loc.created_at ? new Date(loc.created_at).getTime() : Date.now()
      });
    }

    // C. 写入 items
    console.log(`正在同步 ${backupData.items.length} 件收纳物品...`);
    for (const item of backupData.items) {
      // 替换图片域名，如果原本是 Supabase storage 域名，友情保留，但最好能迁移。
      // 为防止破坏原链接，我们暂时保持原样，如果有必要，用户可在 Firebase storage 里重新上传。
      await setDoc(doc(db, 'items', item.id), {
        user_id: firebaseUserId, // 映射到新用户ID
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description || '',
        location_id: item.location_id || null,
        expiry_date: item.expiry_date || null,
        image_url: item.image_url || null,
        created_at: item.created_at ? new Date(item.created_at).getTime() : Date.now()
      });
    }

    // D. 写入 floor_plans
    console.log(`正在同步 ${backupData.floor_plans.length} 个平面图...`);
    for (const fp of backupData.floor_plans) {
      await setDoc(doc(db, 'floor_plans', fp.id), {
        user_id: firebaseUserId,
        name: fp.name,
        width: fp.width,
        height: fp.height,
        updated_at: fp.updated_at ? new Date(fp.updated_at).getTime() : Date.now()
      });
    }

    // E. 写入 family_invites
    console.log(`正在同步 ${backupData.family_invites.length} 个家庭邀请码...`);
    for (const invite of backupData.family_invites) {
      // 邀请码在 Supabase 里通常以 code 字段保存。我们在 Firestore 中以 code 作为文档 ID。
      const code = invite.code;
      if (code) {
        await setDoc(doc(db, 'family_invites', code), {
          owner_id: firebaseUserId,
          created_at: invite.created_at ? new Date(invite.created_at).getTime() : Date.now()
        });
      }
    }

    console.log('\n===================================================');
    console.log('🎉 恭喜！全部资产数据已成功从 Supabase 拷贝到 Firebase！');
    console.log('===================================================');

  } catch (err) {
    console.error(`❌ 迁移写入失败: ${err.message}`);
  } finally {
    rl.close();
  }
}

async function fetchSupabaseTable(tableName, userIdField, userId, supabaseUrl, anonKey, token) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?${userIdField}=eq.${userId}`;
  const res = await fetch(url, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error(`拉取表 ${tableName} 失败: ${res.statusText}`);
  }
  return await res.json();
}

main();
