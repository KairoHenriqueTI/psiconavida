import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireRole } from '../../../lib/authz';
import { jsonError, methodNotAllowed } from '../../../lib/api';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

function setCors(req: NextApiRequest, res: any) {
  const origin = req.headers.origin || FRONTEND;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).end();

  if (req.method === 'GET') {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!post) return jsonError(res, 404, "Not found");
    const mapped = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
      image: post.image,
      author: post.author ? { id: post.author.id, name: post.author.name, email: post.author.email, role: post.author.role } : null,
      category: post.category ? { id: post.category.id, name: post.category.name, slug: post.category.slug } : null,
      authorId: post.authorId,
      categoryId: post.categoryId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      date: post.createdAt || post.updatedAt,
    };
    return res.json(mapped);
  }

  const session = await requireRole(req, res, ["admin", "editor"]);
  if (!session) return;

  if (req.method === 'PUT') {
    const { title, slug, content, excerpt, published, categoryId, image } = req.body;
    try {
      const updated = await prisma.post.update({
        where: { id },
        data: {
          title,
          slug,
          content: sanitizeHtml(content ? String(content) : ""),
          excerpt,
          published,
          categoryId,
          image,
        },
      });
      return res.json(updated);
    } catch {
      return jsonError(res, 500, "Could not update post");
    }
  }

  if (req.method === 'DELETE') {
    const adminCheck = await requireRole(req, res, ["admin"]);
    if (!adminCheck) return;
    try {
      await prisma.post.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return jsonError(res, 500, "Could not delete post");
    }
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
