-- ==============================================
-- HomeBox 分享功能 Supabase 数据库升级脚本
-- 请在 Supabase Dashboard → SQL Editor 中运行
-- ==============================================

-- 1. 分享邀请码表 (使用 owner_id 作为主键方便更新)
CREATE TABLE IF NOT EXISTS public.family_invites (
  owner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 家庭成员关系表
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alias_name TEXT, -- 允许成员为家庭设置本地备注名称
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, member_id),
  CONSTRAINT family_members_owner_id_profiles_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
  CONSTRAINT family_members_member_id_profiles_fkey FOREIGN KEY (member_id) REFERENCES public.profiles (id) ON DELETE CASCADE
);

-- 2.1 修改了关系表后，通过独立语句增加列（以防已存在的表不执行上方语句）
ALTER TABLE IF EXISTS public.family_members ADD COLUMN IF NOT EXISTS alias_name TEXT;

-- 2.2 为已存在的表补充指向 profiles 的外键，以便 PostgREST 能正确联表查询 (Profiles)
DO $$
BEGIN
    -- 首先，清理掉由于脏数据导致外键创建失败的孤儿数据
    -- 删除那些 owner_id 或 member_id 在 profiles 表中不存在的关系记录
    DELETE FROM public.family_members 
    WHERE owner_id NOT IN (SELECT id FROM public.profiles)
       OR member_id NOT IN (SELECT id FROM public.profiles);

    -- 然后安全地增加外键约束
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'family_members_owner_id_profiles_fkey') THEN
        ALTER TABLE public.family_members ADD CONSTRAINT family_members_owner_id_profiles_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles (id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'family_members_member_id_profiles_fkey') THEN
        ALTER TABLE public.family_members ADD CONSTRAINT family_members_member_id_profiles_fkey FOREIGN KEY (member_id) REFERENCES public.profiles (id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. 判断访问权限的辅助函数
CREATE OR REPLACE FUNCTION public.is_family_member(item_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    -- 是自己的数据
    item_user_id = auth.uid()
    OR
    -- 或自己作为成员加入了该拥有者的家庭
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.owner_id = item_user_id AND fm.member_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 安全地根据邀请码加入家庭的函数
CREATE OR REPLACE FUNCTION public.join_family_by_code(invite_code TEXT)
RETURNS JSON AS $$
DECLARE
  target_owner UUID;
  new_member UUID;
BEGIN
  new_member := auth.uid();
  
  IF new_member IS NULL THEN
    RETURN json_build_object('success', false, 'error', '未登录');
  END IF;

  SELECT owner_id INTO target_owner FROM public.family_invites WHERE code = invite_code;
  
  IF target_owner IS NULL THEN
    RETURN json_build_object('success', false, 'error', '邀请码无效或已失效');
  END IF;
  
  IF target_owner = new_member THEN
    RETURN json_build_object('success', false, 'error', '不能加入自己的家庭');
  END IF;

  INSERT INTO public.family_members (owner_id, member_id) 
  VALUES (target_owner, new_member)
  ON CONFLICT (owner_id, member_id) DO NOTHING;
  
  RETURN json_build_object('success', true, 'owner_id', target_owner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 5. ======= 更新现有表的 RLS 策略 =======
    
    -- floor_plans
    DROP POLICY IF EXISTS "用户只能查看自己的平面图" ON public.floor_plans;
    DROP POLICY IF EXISTS "用户只能管理自己的平面图" ON public.floor_plans;
    DROP POLICY IF EXISTS "查看自己和加入的平面图" ON public.floor_plans;
    DROP POLICY IF EXISTS "管理自己和加入的平面图" ON public.floor_plans;
    CREATE POLICY "查看自己和加入的平面图" ON public.floor_plans FOR SELECT USING (public.is_family_member(user_id));
    CREATE POLICY "管理自己和加入的平面图" ON public.floor_plans FOR ALL USING (public.is_family_member(user_id)) WITH CHECK (public.is_family_member(user_id));
    
    -- locations
    DROP POLICY IF EXISTS "用户只能查看自己的位置" ON public.locations;
    DROP POLICY IF EXISTS "用户只能管理自己的位置" ON public.locations;
    DROP POLICY IF EXISTS "查看自己和加入的位置" ON public.locations;
    DROP POLICY IF EXISTS "管理自己和加入的位置" ON public.locations;
    CREATE POLICY "查看自己和加入的位置" ON public.locations FOR SELECT USING (public.is_family_member(user_id));
    CREATE POLICY "管理自己和加入的位置" ON public.locations FOR ALL USING (public.is_family_member(user_id)) WITH CHECK (public.is_family_member(user_id));
    
    -- items
    DROP POLICY IF EXISTS "用户只能查看自己的物品" ON public.items;
    DROP POLICY IF EXISTS "用户只能管理自己的物品" ON public.items;
    DROP POLICY IF EXISTS "查看自己和加入的物品" ON public.items;
    DROP POLICY IF EXISTS "管理自己和加入的物品" ON public.items;
    CREATE POLICY "查看自己和加入的物品" ON public.items FOR SELECT USING (public.is_family_member(user_id));
    CREATE POLICY "管理自己和加入的物品" ON public.items FOR ALL USING (public.is_family_member(user_id)) WITH CHECK (public.is_family_member(user_id));

-- 6. ======= 新表的 RLS 策略 =======

ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
-- 拥有者管理自己的邀请码
DROP POLICY IF EXISTS "用户可管理自己的邀请码" ON public.family_invites;
CREATE POLICY "用户可管理自己的邀请码" ON public.family_invites FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
-- 成员和拥有者可见
DROP POLICY IF EXISTS "成员和拥有者可见" ON public.family_members;
CREATE POLICY "成员和拥有者可见" ON public.family_members FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = member_id);
DROP POLICY IF EXISTS "成员自己可退出或拥有者可踢出" ON public.family_members;
CREATE POLICY "成员自己可退出或拥有者可踢出" ON public.family_members FOR DELETE USING (auth.uid() = owner_id OR auth.uid() = member_id);
-- 成员可以修改自己记录的alias_name (给别人的家庭加备注)
DROP POLICY IF EXISTS "成员可修改备注名" ON public.family_members;
CREATE POLICY "成员可修改备注名" ON public.family_members FOR UPDATE USING (auth.uid() = member_id) WITH CHECK (auth.uid() = member_id);

-- 完毕
