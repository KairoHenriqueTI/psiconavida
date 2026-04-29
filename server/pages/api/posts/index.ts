import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireRole } from '../../../lib/authz';
import { methodNotAllowed, jsonError } from '../../../lib/api';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

import { FRONTEND_URL } from '../../../lib/config';

function setCors(req: NextApiRequest, res: any) {
  const origin = req.headers.origin || FRONTEND_URL;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    // map to frontend-friendly shape (include `date`)
    const mapped = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      published: p.published,
      image: p.image,
      author: p.author ? { id: p.author.id, name: p.author.name, email: p.author.email, role: p.author.role } : null,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      authorId: p.authorId,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      date: p.date || p.createdAt || p.updatedAt,
    }));
    return res.json(mapped);
  }

  if (req.method === 'POST') {
    const session = await requireRole(req, res, ["admin", "editor"]);
    if (!session) return;
    const userId = (session.user as any).id;
    const { title, slug, content, excerpt, published, categoryId, image } = req.body;
    try {
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          content: sanitizeHtml(content ? String(content) : ""),
          excerpt,
          published: !!published,
          categoryId,
          image,
          authorId: userId,
        },
      });
      return res.status(201).json(post);
    } catch {
      return jsonError(res, 500, "Could not create post");
    }
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
