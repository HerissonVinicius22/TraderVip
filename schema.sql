DROP TABLE IF EXISTS vip_offers CASCADE;
DROP TABLE IF EXISTS terms_acceptance CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS users_profiles CASCADE;

CREATE TABLE users_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  "passwordHash" TEXT,
  role TEXT,
  is_blocked BOOLEAN,
  is_vip BOOLEAN,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  cover_image_url TEXT,
  order_index INTEGER,
  is_vip BOOLEAN
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT,
  youtube_url TEXT,
  duration TEXT,
  description TEXT,
  order_index INTEGER
);

CREATE TABLE lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users_profiles(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE terms_acceptance (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users_profiles(id) ON DELETE CASCADE,
  accepted BOOLEAN,
  accepted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE vip_offers (
  id SERIAL PRIMARY KEY,
  monthly_title TEXT,
  monthly_price TEXT,
  monthly_installment_value TEXT,
  monthly_checkout_url TEXT,
  lifetime_title TEXT,
  lifetime_price TEXT,
  lifetime_installment_value TEXT,
  lifetime_checkout_url TEXT
);

CREATE TABLE user_activities (
  id TEXT PRIMARY KEY REFERENCES users_profiles(id) ON DELETE CASCADE,
  favorites JSONB DEFAULT '[]'::jsonb,
  recents JSONB DEFAULT '[]'::jsonb
);
