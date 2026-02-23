-- ==============================================
-- 修复 HomeBox Supabase 照片云柜 (Storage RLS)
-- 请在 Supabase Dashboard → SQL Editor 中运行
-- ==============================================

-- 如果您是手动在后台创建了 homebox-images，
-- 原来绑定在自动创建脚本上的 Policy 可能没挂上或者报错了。
-- 这条脚本会先清理旧有策略，重新给您的桶打上正确的身份认证补丁。

-- 1. 再次确保 public 类型开启
UPDATE storage.buckets
SET public = true
WHERE id = 'homebox-images';

-- 2. 清理可能错乱或者未能正确挂载的已有策略 (防止冲突)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- 3. 重新插入四条绝对严谨的 RLS 策略 
-- (确保对应到真实的 bucket_id)

-- 允许任何人读取 public 桶内的照片
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'homebox-images' );

-- 允许已登录用户 (authenticated) 上传照片
-- 限制条件：上传路径的第一个文件夹名字，必须等于当前用户的 ID
CREATE POLICY "Users can upload their own images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'homebox-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许用户覆盖/更新自己的照片
CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'homebox-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许用户删除自己的照片
CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'homebox-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
