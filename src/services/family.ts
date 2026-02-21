import { supabase } from '../lib/supabase';

// 生成或获取当前用户的邀请码
export async function getOrCreateInviteCode(): Promise<string> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('未登录');

  // 先查询是否已有
  const { data: existing } = await supabase
    .from('family_invites')
    .select('code')
    .eq('owner_id', user.id)
    .single();

  if (existing?.code) {
    return existing.code;
  }

  // 生成新的邀请码 (6位随机字母+数字)
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { error } = await supabase.from('family_invites').insert({
    owner_id: user.id,
    code: newCode
  });

  if (error) throw error;
  return newCode;
}

// 加入他人家庭
export async function joinFamilyByCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_family_by_code', {
    invite_code: code.trim().toUpperCase()
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error || '加入失败');

  return data.owner_id;
}

// 获取我加入的家庭成员列表
export async function fetchJoinedFamilies(): Promise<{ ownerId: string, displayName: string }[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('family_members')
    .select('owner_id, alias_name, profiles!inner(display_name)')
    .eq('member_id', user.id);

  if (error && error.code !== 'PGRST116') {
    console.error('获取加入的家庭失败:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ownerId: row.owner_id,
    displayName: row.alias_name || row.profiles?.display_name || '未命名家庭',
    originalName: row.profiles?.display_name || '未命名家庭',
    aliasName: row.alias_name || ''
  }));
}

// 修改加入的家庭的备注名
export async function updateFamilyAlias(ownerId: string, aliasName: string): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { error } = await supabase
    .from('family_members')
    .update({ alias_name: aliasName || null })
    .eq('owner_id', ownerId)
    .eq('member_id', user.id);

  if (error) throw error;
}

// 获取谁加入了我的家庭
export async function fetchMyFamilyMembers(): Promise<{ memberId: string, displayName: string, joinedAt: string }[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('family_members')
    .select('member_id, created_at, profiles!family_members_member_id_fkey(display_name)')
    .eq('owner_id', user.id);

  if (error && error.code !== 'PGRST116') {
    console.error('获取家庭成员列表失败:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    memberId: row.member_id,
    displayName: row.profiles?.display_name || '未知用户',
    joinedAt: row.created_at
  }));
}

// 踢出家庭成员
export async function kickFamilyMember(memberId: string): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('owner_id', user.id)
    .eq('member_id', memberId);

  if (error) throw error;
}

// 退出家庭
export async function leaveFamily(ownerId: string): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('owner_id', ownerId)
    .eq('member_id', user.id);

  if (error) throw error;
}
