import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  post: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  category: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  siteContent: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("../lib/prisma", () => ({
  default: prismaMock,
}));

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("../lib/authOptions", () => ({
  authOptions: {},
}));

vi.mock("formidable", () => ({
  IncomingForm: vi.fn(),
}));

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  const mocked = {
    ...actual,
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    renameSync: vi.fn(),
    copyFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    createWriteStream: vi.fn(),
  };
  return {
    ...mocked,
    default: mocked,
  } as any;
});

vi.mock("uuid", () => ({
  v4: vi.fn(() => "uuid-1"),
}));

function makeRes() {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, any>,
    body: undefined as any,
    setHeader: vi.fn((key: string, value: any) => {
      res.headers[key] = value;
    }),
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload: any) => {
      res.body = payload;
      return res;
    }),
    end: vi.fn((payload?: any) => {
      res.body = payload;
      return res;
    }),
  };
  return res;
}

describe("API security guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated post creation", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue(null as any);
    const handler = (await import("../pages/api/posts/index")).default;

    const req: any = { method: "POST", headers: {}, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ error: "Not authenticated" });
  });

  it("does not expose hashed passwords in public post list responses", async () => {
    prismaMock.post.findMany.mockResolvedValue([
      {
        id: "p1",
        slug: "one",
        title: "One",
        published: true,
        author: { id: "u1", name: "User", email: "user@example.com", role: "editor", hashedPassword: "secret" },
        category: { id: "c1", name: "Cat", slug: "cat" },
        date: "2026-04-01T00:00:00.000Z",
      },
    ] as any);
    const handler = (await import("../pages/api/posts/index")).default;

    const req: any = { method: "GET", headers: {}, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.body[0].author).toEqual({ id: "u1", name: "User", email: "user@example.com", role: "editor" });
    expect(res.body[0].author).not.toHaveProperty("hashedPassword");
  });

  it("rejects unauthenticated category deletion", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue(null as any);
    const handler = (await import("../pages/api/categories/[id]")).default;

    const req: any = { method: "DELETE", headers: {}, query: { id: "cat-1" }, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ error: "Not authenticated" });
  });

  it("blocks deleting categories that still have posts", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", role: "admin" } } as any);
    prismaMock.post.count.mockResolvedValue(2 as any);
    const handler = (await import("../pages/api/categories/[id]")).default;

    const req: any = { method: "DELETE", headers: {}, query: { id: "cat-1" }, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(prismaMock.category.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.body).toEqual({ error: "Category has posts assigned" });
  });

  it("forbids editors from deleting categories", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", role: "editor" } } as any);
    const handler = (await import("../pages/api/categories/[id]")).default;

    const req: any = { method: "DELETE", headers: {}, query: { id: "cat-1" }, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({ error: "Forbidden" });
  });

  it("forbids editors from deleting posts", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", role: "editor" } } as any);
    const handler = (await import("../pages/api/posts/[id]")).default;

    const req: any = { method: "DELETE", headers: {}, query: { id: "post-1" }, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({ error: "Forbidden" });
  });

  it("forbids editors from managing user roles", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", role: "editor" } } as any);
    const handler = (await import("../pages/api/user-roles/index")).default;

    const req: any = { method: "GET", headers: {}, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({ error: "Forbidden" });
  });

  it("rejects invalid AI prompts before calling the model", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "editor" } } as any);
    const handler = (await import("../pages/api/ai/generate-post")).default;

    const req: any = { method: "POST", headers: {}, body: { prompt: "", title: "A" } };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ error: "Missing prompt" });
  });

  it("rejects non-image uploads", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "editor" } } as any);

    const { IncomingForm } = await import("formidable");
    vi.mocked(IncomingForm).mockImplementation(() => ({
      parse: vi.fn((req: any, cb: any) => {
        cb(null, {}, {
          file: {
            filepath: "/tmp/file.txt",
            originalFilename: "file.txt",
            mimetype: "text/plain",
          },
        });
      }),
    }) as any);

    const handler = (await import("../pages/api/uploads")).default;

    const req: any = { method: "POST", headers: {}, query: {}, body: {} };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ error: "Only image uploads are allowed" });
  });

  it("sanitizes malicious HTML before saving posts", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "author-1", role: "editor" } } as any);
    prismaMock.post.create.mockResolvedValue({ id: "post-1" } as any);
    const handler = (await import("../pages/api/posts/index")).default;

    const req: any = {
      method: "POST",
      headers: {},
      body: {
        title: "Hello",
        slug: "hello",
        content: `<script>alert(1)</script><p onclick="evil()">safe <a href="javascript:alert(2)">link</a></p>`,
        excerpt: "x",
        published: true,
        categoryId: null,
        image: "",
      },
    };
    const res = makeRes();

    await handler(req, res);

    expect(prismaMock.post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: '<p>safe <a>link</a></p>',
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("preserves allowed inline heading classes in post content", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "author-1", role: "editor" } } as any);
    prismaMock.post.create.mockResolvedValue({ id: "post-1" } as any);
    const handler = (await import("../pages/api/posts/index")).default;

    const req: any = {
      method: "POST",
      headers: {},
      body: {
        title: "Hello",
        slug: "hello",
        content: `<p>Texto <span class="editor-inline-heading editor-inline-h2 evil">selecionado</span></p>`,
      },
    };
    const res = makeRes();

    await handler(req, res);

    expect(prismaMock.post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: '<p>Texto <span class="editor-inline-heading editor-inline-h2">selecionado</span></p>',
        }),
      })
    );
  });

  it("returns a useful conflict when post slug already exists", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "author-1", role: "editor" } } as any);
    prismaMock.post.create.mockRejectedValue({ code: "P2002" });
    const handler = (await import("../pages/api/posts/index")).default;

    const req: any = {
      method: "POST",
      headers: {},
      body: {
        title: "Hello",
        slug: "hello",
        content: "<p>Hello</p>",
        excerpt: "",
        published: true,
        categoryId: "",
        image: "",
      },
    };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.body).toEqual({ error: "Já existe uma publicação com este slug." });
  });

  it("normalizes empty optional post fields before create", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "author-1", role: "editor" } } as any);
    prismaMock.post.create.mockResolvedValue({ id: "post-1" } as any);
    const handler = (await import("../pages/api/posts/index")).default;

    const req: any = {
      method: "POST",
      headers: {},
      body: {
        title: "  Hello  ",
        slug: "  hello  ",
        content: "<p>Hello</p>",
        excerpt: "",
        published: false,
        categoryId: "",
        image: "",
      },
    };
    const res = makeRes();

    await handler(req, res);

    expect(prismaMock.post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Hello",
          slug: "hello",
          excerpt: null,
          categoryId: null,
          image: null,
        }),
      })
    );
  });
});
