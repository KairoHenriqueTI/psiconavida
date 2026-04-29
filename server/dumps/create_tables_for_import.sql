-- helper tables to receive the Supabase export (created to match exported column names)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY,
  name text,
  slug text,
  description text,
  image text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY,
  title text,
  slug text,
  excerpt text,
  content text,
  image text,
  category_id uuid,
  author text,
  read_time text,
  published boolean,
  date timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY,
  section_key text UNIQUE,
  content jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY,
  user_id uuid,
  role text
);
