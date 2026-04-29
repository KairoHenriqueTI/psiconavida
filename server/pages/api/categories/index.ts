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

  if (req.method === 'GET') {
    try {
      const categories = await prisma.category.findMany();
      return res.json(categories);
    } catch {
      return jsonError(res, 500, "Could not load categories");
    }
  }

  if (req.method === 'POST') {
    const session = await requireRole(req, res, ["admin", "editor"]);
    if (!session) return;
    const { name, slug, description, image } = req.body;
    try {
      const created = await prisma.category.create({ data: { name, slug, description, image } });
      return res.status(201).json(created);
    } catch {
      return jsonError(res, 500, "Could not create category");
    }
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
