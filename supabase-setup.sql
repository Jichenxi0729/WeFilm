-- Supabase 数据库设置脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 movies 表
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  releaseYear INTEGER,
  genres TEXT[] DEFAULT '{}',
  mediaType TEXT DEFAULT 'movie',
  personalRating DECIMAL(2,1),
  watchDate DATE,
  overview TEXT,
  tmdbId TEXT,
  coverUrl TEXT,
  backdropUrl TEXT,
  actors TEXT[] DEFAULT '{}',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 启用 Row Level Security (RLS)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略 - 用户只能看到自己的数据
CREATE POLICY "Users can view their own movies"
  ON movies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movies"
  ON movies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movies"
  ON movies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movies"
  ON movies
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_movies_user_id ON movies(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_watch_date ON movies(watchDate);
CREATE INDEX IF NOT EXISTS idx_movies_media_type ON movies(mediaType);

-- 5. 创建一个更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== 批量更新 user_id ==========
-- 如果你已有数据但 user_id 为空，请在登录后：

-- 方法一：如果你确定所有数据都属于当前登录用户，临时禁用 RLS 并更新
-- 先获取你的 user_id（从认证页面或浏览器 Console 获取），然后运行：
-- UPDATE movies SET user_id = '你的-user-id' WHERE user_id IS NULL;

-- 方法二：使用服务角色密钥创建一个 SQL 函数来批量更新
