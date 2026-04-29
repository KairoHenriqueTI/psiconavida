import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireRole } from '../../../lib/authz';
import { jsonError, methodNotAllowed } from '../../../lib/api';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

function setCors(req: NextApiRequest, res: any) {
  const origin = req.headers.origin || FRONTEND;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    const entries = await prisma.siteContent.findMany();
    // return compatibility shape for both admin and public frontend
    const mapped = entries.map((e: any) => {
      let parsed: any = e.value;
      try {
        parsed = typeof e.value === 'string' ? JSON.parse(e.value) : e.value;
      } catch (err) {
        parsed = e.value;
      }
      return {
        key: e.key,
        section_key: e.key,
        value: e.value,
        content: parsed,
      };
    });
    return res.json(mapped);
  }
  if (req.method === 'POST') return postHandler(req, res);
  return methodNotAllowed(res, ['GET', 'POST']);
}

// allow updates via POST { section_key, content }
export async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireRole(req, res, ["admin", "editor"]);
  if (!session) return;
  const { section_key, content } = req.body;
  if (!section_key) return jsonError(res, 400, "Missing section_key");
  try {
    const existing = await prisma.siteContent.findUnique({ where: { key: section_key } });
    if (existing) {
      const updated = await prisma.siteContent.update({ where: { key: section_key }, data: { value: typeof content === 'string' ? content : JSON.stringify(content) } });
      return res.json(updated);
    }
    const created = await prisma.siteContent.create({ data: { key: section_key, value: typeof content === 'string' ? content : JSON.stringify(content) } });
    return res.status(201).json(created);
  } catch {
    return jsonError(res, 500, "Could not save site content");
  }
}
