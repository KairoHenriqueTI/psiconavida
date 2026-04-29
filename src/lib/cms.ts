import backend from '@/integrations/backend/api';
import type { BlogPost, Category } from "./types";

type BackendPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  published?: boolean;
  category?: { id?: string; name?: string; slug?: string } | null;
  categoryId?: string | null;
  date?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  read_time?: string | null;
  readTime?: string | null;
  image?: string | null;
};

type BackendCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

type BackendSiteContent = {
  key?: string;
  section_key?: string;
  value?: string;
  content?: any;
};

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function mapPostToBlogPost(p: BackendPost): BlogPost {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    content: p.content || "",
    category: p.category?.name || "",
    categorySlug: p.category?.slug || "",
    date: p.date ? String(p.date) : p.createdAt ? String(p.createdAt) : p.updatedAt ? String(p.updatedAt) : new Date().toISOString(),
    readTime: p.read_time || p.readTime || "5 min",
    image: p.image || "",
  };
}

export function mapCategoryToBlogCategory(c: BackendCategory, postCount = 0): Category {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    image: c.image || "",
    postCount,
  };
}

export function resolveSiteContentContent(entry: BackendSiteContent) {
  if (entry.content !== undefined) return entry.content;
  if (entry.value === undefined) return null;
  return typeof entry.value === "string" ? safeParse(entry.value) : entry.value;
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const data = await backend.fetchAllPosts();
  const posts = (data || []).filter((p: any) => p.published).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts.map((p: any) => mapPostToBlogPost(p));
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await backend.fetchAllPosts();
  const data = (posts || []).find((p: any) => p.slug === slug && p.published);
  if (!data) return null;
  return mapPostToBlogPost(data);
}

export async function fetchCategories(): Promise<Category[]> {
  const cats = await backend.fetchCategories();
  const posts = await backend.fetchAllPosts();
  const countMap: Record<string, number> = {};
  (posts || []).forEach((p: any) => { if (p.published && p.categoryId) countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1; });
  return (cats || []).map((c: any) => mapCategoryToBlogCategory(c, countMap[c.id] || 0));
}

export async function fetchPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const cats = await backend.fetchCategories();
  const cat = (cats || []).find((c: any) => c.slug === categorySlug);
  if (!cat) return [];
  const posts = await backend.fetchAllPosts();
  return (posts || []).filter((p: any) => p.published && p.categoryId === cat.id).sort((a: any,b:any)=> new Date(b.date).getTime()-new Date(a.date).getTime()).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    content: p.content || "",
    category: cat.name,
    categorySlug: cat.slug,
    date: p.date ? String(p.date) : p.createdAt ? String(p.createdAt) : p.updatedAt ? String(p.updatedAt) : new Date().toISOString(),
    readTime: p.read_time || p.readTime || "5 min",
    image: p.image || "",
  }));
}

export async function fetchSiteContent(sectionKey: string): Promise<Record<string, any> | null> {
  const site = await backend.fetchSiteContent();
  const found = (site || []).find((s: any) => s.section_key === sectionKey || s.key === sectionKey);
  return found ? resolveSiteContentContent(found) : null;
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await backend.fetchCategories();
  const cat = (cats || []).find((c: any) => c.slug === slug);
  if (!cat) return null;
  const posts = await backend.fetchAllPosts();
  const count = (posts || []).filter((p: any) => p.published && p.categoryId === cat.id).length;
  return mapCategoryToBlogCategory(cat, count || 0);
}
