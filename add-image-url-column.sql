-- ==============================================
-- 终极修复：为物品表补全 image_url 字段
-- ==============================================

-- 之前由于跳过了包含建立列的第一段脚本，导致数据库的 items 中缺少了这个记录图片的字段。
-- 运行这行语句，加上后保存物品时就不会报 PGRST204 错误了。

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 刷新缓存 (可选，但推荐。能让 postgrest 立即知道列加了)
NOTIFY pgrst, 'reload schema';
