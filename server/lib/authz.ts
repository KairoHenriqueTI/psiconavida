import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { forbidden, unauthorized } from "./api";

type Role = "admin" | "editor";

export async function requireSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session) return null;
  return session as any;
}

export async function requireRole(req: NextApiRequest, res: NextApiResponse, roles: Role[]) {
  const session = await requireSession(req, res);
  if (!session) {
    unauthorized(res);
    return null;
  }
  const role = session.user?.role as Role | undefined;
  if (!role || !roles.includes(role)) {
    forbidden(res);
    return null;
  }
  return session;
}
