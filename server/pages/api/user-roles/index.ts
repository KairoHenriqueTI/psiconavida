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

  if (req.method === 'GET') {
    const session = await requireRole(req, res, ["admin"]);
    if (!session) return;
    try {
      const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
      return res.json(users);
    } catch {
      return jsonError(res, 500, "Could not load users");
    }
  }

  if (req.method === 'POST') {
    const session = await requireRole(req, res, ["admin"]);
    if (!session) return;
    const { userId, role } = req.body;
    if (!userId || !role) return jsonError(res, 400, "Missing userId or role");
    try {
      const user = await prisma.user.update({ where: { id: userId }, data: { role } });
      return res.status(201).json(user);
    } catch {
      return jsonError(res, 500, "Could not update user role");
    }
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
