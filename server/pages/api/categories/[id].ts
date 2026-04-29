import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireRole } from '../../../lib/authz';
import { jsonError, methodNotAllowed } from '../../../lib/api';

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

  if (req.method === 'PUT') {
    const session = await requireRole(req, res, ["admin", "editor"]);
    if (!session) return;
    const { name, slug, description, image } = req.body;
    try {
      const updated = await prisma.category.update({ where: { id }, data: { name, slug, description, image } });
      return res.json(updated);
    } catch {
      return jsonError(res, 500, "Could not update category");
    }
  }

  if (req.method === 'DELETE') {
    const session = await requireRole(req, res, ["admin"]);
    if (!session) return;
    try {
      const postsCount = await prisma.post.count({ where: { categoryId: id } });
      if (postsCount > 0) return jsonError(res, 409, "Category has posts assigned");
      await prisma.category.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return jsonError(res, 500, "Could not delete category");
    }
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
}
