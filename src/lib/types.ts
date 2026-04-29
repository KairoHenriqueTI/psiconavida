export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: string;
  image: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  image: string;
  postCount: number;
}
