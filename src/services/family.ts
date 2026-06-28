import { auth, db } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  deleteDoc, query, where, runTransaction 
} from 'firebase/firestore';

// 生成或获取当前用户的邀请码
export async function getOrCreateInviteCode(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('未登录');

  // 先查询是否已有该用户的邀请码
  const q = query(
    collection(db, 'family_invites'),
    where('owner_id', '==', user.uid)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // 直接返回已有的邀请码（文档ID就是邀请码）
    return snapshot.docs[0].id;
  }

  // 生成新的邀请码 (6位随机字母+数字)
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // 以新邀请码作为文档 ID 写入
  await setDoc(doc(db, 'family_invites', newCode), {
    owner_id: user.uid,
    created_at: Date.now()
  });

  return newCode;
}

// 加入他人家庭 (利用 Firestore 原子事务)
export async function joinFamilyByCode(code: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('未登录');

  const inviteCode = code.trim().toUpperCase();

  return await runTransaction(db, async (transaction) => {
    // 1. 查询邀请码是否存在
    const inviteDocRef = doc(db, 'family_invites', inviteCode);
    const inviteSnap = await transaction.get(inviteDocRef);

    if (!inviteSnap.exists()) {
      throw new Error('邀请码无效');
    }

    const ownerId = inviteSnap.data().owner_id;
    if (ownerId === user.uid) {
      throw new Error('不能加入自己的家庭');
    }

    // 2. 检查是否已经是该家庭成员
    const memberDocId = `${ownerId}_${user.uid}`;
    const memberDocRef = doc(db, 'family_members', memberDocId);
    const memberSnap = await transaction.get(memberDocRef);

    if (memberSnap.exists()) {
      throw new Error('您已经是该家庭的成员了');
    }

    // 3. 写入成员表记录
    transaction.set(memberDocRef, {
      owner_id: ownerId,
      member_id: user.uid,
      alias_name: null,
      role: 'viewer',
      created_at: Date.now()
    });

    return ownerId;
  });
}

// 获取我加入的家庭成员列表
export async function fetchJoinedFamilies(): Promise<{ ownerId: string, displayName: string, role: 'viewer' | 'admin', originalName?: string, aliasName?: string }[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, 'family_members'),
    where('member_id', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  const members = snapshot.docs.map(docSnap => docSnap.data());
  const ownerIds = Array.from(new Set(members.map(m => m.owner_id)));

  // 并行获取 profiles 的 display_name
  const profilesMap: Record<string, string> = {};
  await Promise.all(ownerIds.map(async (ownerId) => {
    const profileSnap = await getDoc(doc(db, 'profiles', ownerId));
    if (profileSnap.exists()) {
      profilesMap[ownerId] = profileSnap.data().display_name || '未命名家庭';
    } else {
      profilesMap[ownerId] = '未命名家庭';
    }
  }));

  return members.map(m => ({
    ownerId: m.owner_id,
    displayName: m.alias_name || profilesMap[m.owner_id] || '未命名家庭',
    originalName: profilesMap[m.owner_id] || '未命名家庭',
    aliasName: m.alias_name || '',
    role: m.role || 'viewer'
  }));
}

// 修改加入的家庭的备注名
export async function updateFamilyAlias(ownerId: string, aliasName: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const memberDocId = `${ownerId}_${user.uid}`;
  const docRef = doc(db, 'family_members', memberDocId);
  await updateDoc(docRef, {
    alias_name: aliasName || null
  });
}

// 获取谁加入了我的家庭
export async function fetchMyFamilyMembers(): Promise<{ memberId: string, displayName: string, joinedAt: string, role: 'viewer' | 'admin' }[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, 'family_members'),
    where('owner_id', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  const members = snapshot.docs.map(docSnap => docSnap.data());
  const memberIds = Array.from(new Set(members.map(m => m.member_id)));

  // 并行获取成员的 display_name
  const profilesMap: Record<string, string> = {};
  await Promise.all(memberIds.map(async (memberId) => {
    const profileSnap = await getDoc(doc(db, 'profiles', memberId));
    if (profileSnap.exists()) {
      profilesMap[memberId] = profileSnap.data().display_name || '未知用户';
    } else {
      profilesMap[memberId] = '未知用户';
    }
  }));

  return members.map(m => ({
    memberId: m.member_id,
    displayName: profilesMap[m.member_id] || '未知用户',
    joinedAt: new Date(m.created_at).toISOString(),
    role: m.role || 'viewer'
  }));
}

// 拥有者修改家庭成员权限
export async function updateFamilyMemberRole(memberId: string, role: 'viewer' | 'admin'): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const memberDocId = `${user.uid}_${memberId}`;
  await updateDoc(doc(db, 'family_members', memberDocId), {
    role
  });
}

// 踢出家庭成员
export async function kickFamilyMember(memberId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const memberDocId = `${user.uid}_${memberId}`;
  await deleteDoc(doc(db, 'family_members', memberDocId));
}

// 退出家庭
export async function leaveFamily(ownerId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const memberDocId = `${ownerId}_${user.uid}`;
  await deleteDoc(doc(db, 'family_members', memberDocId));
}
