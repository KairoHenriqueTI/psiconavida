import { API_BASE } from "@/lib/apiBase";

async function apiGet(path: string) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchAllPosts() {
  return apiGet('/api/posts');
}

export async function fetchPost(id: string) {
  return apiGet(`/api/posts/${id}`);
}

export async function fetchCategories() {
  return apiGet('/api/categories');
}

export async function fetchSiteContent() {
  return apiGet('/api/site-content');
}

export default { fetchAllPosts, fetchPost, fetchCategories, fetchSiteContent };
