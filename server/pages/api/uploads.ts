import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireRole } from '../../lib/authz';
import { jsonError } from '../../lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req: any, res: any) {
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Prefer configured frontend URL for CORS
  const origin = req.headers.origin || process.env.FRONTEND_URL || FRONTEND;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Authenticate
  const session = await requireRole(req, res, ["admin", "editor"]);
  if (!session) return;

  const form = new IncomingForm({ multiples: false, maxFileSize: MAX_FILE_SIZE });
  form.parse(req, (err, fields, files) => {
    if (err) return jsonError(res, 500, "Could not process upload");
    const file = (files.file as any);
    if (!file) return jsonError(res, 400, "No file provided");
    const tempPath = file.filepath || file.path;
    const originalName = file.originalFilename || file.name || tempPath;
    const ext = path.extname(originalName) || '';
    const mime = file.mimetype || file.type || '';

    // Basic MIME check
    if (!/^image\//.test(mime) && !/(\.png|\.jpe?g|\.webp|\.gif)$/i.test(ext)) {
      return jsonError(res, 400, "Only image uploads are allowed");
    }

    const id = uuidv4();
    const filename = `${id}${ext}`;
    const dest = path.join(uploadDir, filename);
    try {
      // Try a fast rename first (same filesystem)
      fs.renameSync(tempPath, dest);
    } catch (e: any) {
      // EXDEV happens when tempPath and dest are on different devices/filesystems
      // Fall back to copy + unlink which works across devices
      if (e && e.code === 'EXDEV') {
        try {
          fs.copyFileSync(tempPath, dest);
          fs.unlinkSync(tempPath);
        } catch (e2: any) {
          return jsonError(res, 500, "Could not store uploaded file");
        }
      } else {
        return jsonError(res, 500, "Could not store uploaded file");
      }
    }
    const url = `/uploads/${filename}`;
    return res.status(201).json({ url });
  });
}
