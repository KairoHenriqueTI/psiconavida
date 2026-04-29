import type { NextApiResponse } from "next";

export function jsonError(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
  res.setHeader("Allow", allowed);
  return res.status(405).json({ error: "Method not allowed" });
}

export function unauthorized(res: NextApiResponse) {
  return jsonError(res, 401, "Not authenticated");
}

export function forbidden(res: NextApiResponse) {
  return jsonError(res, 403, "Forbidden");
}
