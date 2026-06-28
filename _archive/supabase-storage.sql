-- ==============================================
-- HomeBox Supabase 数据库升级 (v2.1 Phase II)
-- 主题：挂载云端照片柜 (Supabase Storage) & 添加物品图片字段
-- 请在 Supabase Dashboard → SQL Editor 中运行
-- ==============================================

-- 1. 在物品表中新增图片 URL 字段 (如果尚未存在)
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. 创建或确保存在名为 'homebox-images' 的存储桶 (Bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homebox-images', 'homebox-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 配置 Storage RLS 策略 (行级安全)

-- 允许所有用户查看公开的图片 (因为 bucket 是 public 的)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'homebox-images' );

-- 仅允许登录用户上传图片，且限制只能上传到具有自己用户 ID 前缀的文件夹中
-- 比如: 文件路径必须是 "user_id/xxxx.jpg"
CREATE POLICY "Users can upload their own images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'homebox-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 仅允许用户更新/覆盖自己的图片
CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'homebox-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 仅允许用户删除自己的图片
CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'homebox-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
