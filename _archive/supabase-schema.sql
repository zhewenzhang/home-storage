-- ==============================================
-- HomeBox Supabase 数据库 Schema
-- 请在 Supabase Dashboard → SQL Editor 中运行
-- ==============================================

-- 1. 用户资料表（自动关联 auth.users）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 平面图表
CREATE TABLE IF NOT EXISTS floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '我的家',
  width INTEGER NOT NULL DEFAULT 800,
  height INTEGER NOT NULL DEFAULT 600,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 位置表（房间/收纳点）
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'room',
  parent_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  room_type TEXT,
  bounds JSONB NOT NULL DEFAULT '{"x":0,"y":0,"width":160,"height":120}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 物品表
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '其他',
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 索引 ============
CREATE INDEX IF NOT EXISTS idx_locations_user ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(location_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_user ON floor_plans(user_id);

-- ============ RLS 策略（行级安全） ============

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的资料" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "用户只能更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- floor_plans
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的平面图" ON floor_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能管理自己的平面图" ON floor_plans FOR ALL USING (auth.uid() = user_id);

-- locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的位置" ON locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能管理自己的位置" ON locations FOR ALL USING (auth.uid() = user_id);

-- items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的物品" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能管理自己的物品" ON items FOR ALL USING (auth.uid() = user_id);

-- ============ 自动创建 profile 触发器 ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  -- 为新用户创建默认平面图
  INSERT INTO public.floor_plans (user_id, name, width, height)
  VALUES (NEW.id, '我的家', 800, 600);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注册时自动触发
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
