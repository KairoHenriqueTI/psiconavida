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

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function postWriteError(res: NextApiResponse, error: any) {
  if (error?.code === "P2002") return jsonError(res, 409, "Já existe uma publicação com este slug.");
  if (error?.code === "P2003") return jsonError(res, 400, "Categoria inválida.");
  if (error?.code === "P2025") return jsonError(res, 404, "Publicação não encontrada.");
  return jsonError(res, 500, "Não foi possível salvar a publicação.");
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
    const cleanedTitle = title === undefined ? undefined : cleanString(title);
    const cleanedSlug = slug === undefined ? undefined : cleanString(slug);
    if (title !== undefined && !cleanedTitle) return jsonError(res, 400, "Informe o título da publicação.");
    if (slug !== undefined && !cleanedSlug) return jsonError(res, 400, "Informe o slug da publicação.");
    try {
      const updated = await prisma.post.update({
        where: { id },
        data: {
          ...(title !== undefined ? { title: cleanedTitle } : {}),
          ...(slug !== undefined ? { slug: cleanedSlug } : {}),
          ...(content !== undefined ? { content: sanitizeHtml(content ? String(content) : "") } : {}),
          ...(excerpt !== undefined ? { excerpt: cleanString(excerpt) || null } : {}),
          published,
          ...(categoryId !== undefined ? { categoryId: cleanString(categoryId) || null } : {}),
          ...(image !== undefined ? { image: cleanString(image) || null } : {}),
        },
      });
      return res.json(updated);
    } catch (error) {
      return postWriteError(res, error);
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
