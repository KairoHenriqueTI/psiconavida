import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireRole } from '../../../lib/authz';
import { jsonError, methodNotAllowed } from '../../../lib/api';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).end();

  if (req.method === 'DELETE') {
    const session = await requireRole(req, res, ["admin"]);
    if (!session) return;
    // set role back to editor
    try {
      const user = await prisma.user.update({ where: { id }, data: { role: 'editor' } });
      return res.status(200).json(user);
    } catch {
      return jsonError(res, 500, "Could not remove user role");
    }
  }

  return methodNotAllowed(res, ['DELETE']);
}
