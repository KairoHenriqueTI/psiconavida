
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Editors can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author TEXT NOT NULL DEFAULT 'Autora',
  read_time TEXT NOT NULL DEFAULT '5 min',
  published BOOLEAN NOT NULL DEFAULT false,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are publicly readable"
  ON public.posts FOR SELECT USING (published = true);

CREATE POLICY "Editors can view all posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors can manage posts"
  ON public.posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Site content table (flexible JSONB for section content)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is publicly readable"
  ON public.site_content FOR SELECT USING (true);

CREATE POLICY "Editors can manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true);

CREATE POLICY "CMS images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'cms-images');

CREATE POLICY "Editors can upload CMS images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cms-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "Editors can update CMS images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cms-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "Editors can delete CMS images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cms-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

-- Seed default site content sections
INSERT INTO public.site_content (section_key, content) VALUES
('hero', '{"title": "Psico na Vida", "subtitle": "Psicologia que cabe no seu dia a dia. Respire psicologia.", "description": "A Psiconavida existe para tornar a psicologia algo vivo e presente no cotidiano.", "image_desktop": "", "image_mobile": ""}'),
('about_preview', '{"title": "Sobre o Projeto", "description": "A Psiconavida existe para tornar a psicologia algo vivo e presente no cotidiano. Seu propósito é inspirar pessoas a integrarem o saber psicológico às suas decisões, relações e forma de existir.", "quote": "A Psicologia não é só um curso — é uma forma de enxergar a vida", "image_author": "", "image_secondary": ""}'),
('manifesto', '{"title": "Manifesto", "lines": ["Na Psiconavida, a vida respira saber,", "A psicologia é ponte, é jeito de viver.", "Nos gestos pequenos, no modo de escutar,", "Há ciência, cuidado e o ato de cuidar.", "É ética em prática, presença no dia,", "É palavra que abraça, é clareza que guia."]}'),
('newsletter', '{"title": "Newsletter Psiconavida", "description": "Toda semana, um novo olhar sobre psicologia no seu LinkedIn. Assine a Newsletter Psiconavida e receba conteúdos que conectam teoria, prática e vida real — direto no seu feed.", "button_text": "Assinar no LinkedIn", "button_url": "https://www.linkedin.com/newsletters/psiconavida", "footer_text": "Publicações semanais · Gratuito", "image": ""}'),
('ethical_notice', '{"text": "O conteúdo deste site tem caráter informativo e educativo. Não substitui o acompanhamento de um profissional de saúde mental. Se você sente que precisa de apoio, procure um psicólogo."}'),
('about_page', '{"title": "Sobre a Psiconavida", "subtitle": "Psicologia que cabe no seu dia a dia", "intro": "A Psiconavida nasceu da crença de que a psicologia pode — e deve — fazer parte da vida cotidiana de todos.", "mission_title": "Nossa Missão", "mission_text": "Tornar a psicologia acessível, prática e presente no dia a dia das pessoas.", "author_name": "Sobre a Autora", "author_bio": "", "author_image": ""}');
