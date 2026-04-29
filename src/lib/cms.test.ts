import { afterEach, describe, expect, it, vi } from "vitest";
import backend from "@/integrations/backend/api";
import {
  fetchCategories,
  fetchCategoryBySlug,
  fetchPostBySlug,
  fetchPostsByCategory,
  fetchPublishedPosts,
  fetchSiteContent,
  mapCategoryToBlogCategory,
  mapPostToBlogPost,
  resolveSiteContentContent,
} from "./cms";

vi.mock("@/integrations/backend/api", () => ({
  default: {
    fetchAllPosts: vi.fn(),
    fetchCategories: vi.fn(),
    fetchSiteContent: vi.fn(),
  },
}));

const backendMock = vi.mocked(backend);

afterEach(() => {
  vi.clearAllMocks();
});

describe("cms mappings", () => {
  it("maps a backend post into the public blog shape with sensible fallbacks", () => {
    const mapped = mapPostToBlogPost({
      id: "1",
      slug: "my-post",
      title: "My post",
      excerpt: null,
      content: null,
      category: { name: "Autoconhecimento", slug: "autoconhecimento" },
      createdAt: "2026-04-26T12:00:00.000Z",
      read_time: null,
      image: null,
    });

    expect(mapped).toMatchObject({
      id: "1",
      slug: "my-post",
      title: "My post",
      excerpt: "",
      content: "",
      category: "Autoconhecimento",
      categorySlug: "autoconhecimento",
      readTime: "5 min",
      image: "",
    });
    expect(mapped.date).toBe("2026-04-26T12:00:00.000Z");
  });

  it("maps category metadata and preserves post counts", () => {
    expect(mapCategoryToBlogCategory({ id: "c1", name: "Bem-estar", slug: "bem-estar" }, 3)).toEqual({
      name: "Bem-estar",
      slug: "bem-estar",
      description: "",
      image: "",
      postCount: 3,
    });
  });

  it("parses site content JSON when the backend stores a string value", () => {
    expect(resolveSiteContentContent({ value: "{\"text\":\"hello\"}" })).toEqual({ text: "hello" });
    expect(resolveSiteContentContent({ value: "plain text" })).toBe("plain text");
    expect(resolveSiteContentContent({ content: { text: "already parsed" } })).toEqual({ text: "already parsed" });
  });
});

describe("cms fetchers", () => {
  it("returns only published posts ordered by date descending", async () => {
    backendMock.fetchAllPosts.mockResolvedValue([
      {
        id: "a",
        slug: "first",
        title: "First",
        published: true,
        date: "2026-04-20T00:00:00.000Z",
        category: { name: "Cat A", slug: "cat-a" },
      },
      {
        id: "b",
        slug: "second",
        title: "Second",
        published: false,
        date: "2026-04-21T00:00:00.000Z",
      },
      {
        id: "c",
        slug: "third",
        title: "Third",
        published: true,
        date: "2026-04-22T00:00:00.000Z",
        category: { name: "Cat B", slug: "cat-b" },
      },
    ] as any);

    const posts = await fetchPublishedPosts();

    expect(posts.map((p) => p.slug)).toEqual(["third", "first"]);
    expect(posts[0].category).toBe("Cat B");
  });

  it("loads a post by slug using the published filter", async () => {
    backendMock.fetchAllPosts.mockResolvedValue([
      { id: "x", slug: "keep", title: "Keep", published: true, category: { name: "A", slug: "a" } },
      { id: "y", slug: "skip", title: "Skip", published: false },
    ] as any);

    await expect(fetchPostBySlug("keep")).resolves.toMatchObject({ id: "x", slug: "keep", title: "Keep" });
    await expect(fetchPostBySlug("skip")).resolves.toBeNull();
  });

  it("counts categories based on published posts only", async () => {
    backendMock.fetchCategories.mockResolvedValue([
      { id: "c1", name: "Cat 1", slug: "cat-1" },
      { id: "c2", name: "Cat 2", slug: "cat-2" },
    ] as any);
    backendMock.fetchAllPosts.mockResolvedValue([
      { id: "p1", published: true, categoryId: "c1" },
      { id: "p2", published: true, categoryId: "c1" },
      { id: "p3", published: false, categoryId: "c2" },
    ] as any);

    await expect(fetchCategories()).resolves.toEqual([
      { name: "Cat 1", slug: "cat-1", description: "", image: "", postCount: 2 },
      { name: "Cat 2", slug: "cat-2", description: "", image: "", postCount: 0 },
    ]);
  });

  it("loads posts within a category using categoryId", async () => {
    backendMock.fetchCategories.mockResolvedValue([{ id: "c1", name: "Cat 1", slug: "cat-1" }] as any);
    backendMock.fetchAllPosts.mockResolvedValue([
      { id: "p1", slug: "one", title: "One", published: true, categoryId: "c1", date: "2026-04-21T00:00:00.000Z" },
      { id: "p2", slug: "two", title: "Two", published: true, categoryId: "other", date: "2026-04-22T00:00:00.000Z" },
    ] as any);

    await expect(fetchPostsByCategory("cat-1")).resolves.toHaveLength(1);
  });

  it("reads site content through the compatibility shape", async () => {
    backendMock.fetchSiteContent.mockResolvedValue([
      { section_key: "ethical_notice", value: "{\"text\":\"safe\"}" },
      { key: "about_preview", content: { image_author: "/img.png" } },
    ] as any);

    await expect(fetchSiteContent("ethical_notice")).resolves.toEqual({ text: "safe" });
    await expect(fetchSiteContent("about_preview")).resolves.toEqual({ image_author: "/img.png" });
  });

  it("finds a category by slug and counts related posts", async () => {
    backendMock.fetchCategories.mockResolvedValue([
      { id: "c1", name: "Cat 1", slug: "cat-1", description: "Desc" },
    ] as any);
    backendMock.fetchAllPosts.mockResolvedValue([
      { id: "p1", published: true, categoryId: "c1" },
    ] as any);

    await expect(fetchCategoryBySlug("cat-1")).resolves.toEqual({
      name: "Cat 1",
      slug: "cat-1",
      description: "Desc",
      image: "",
      postCount: 1,
    });
  });
});
