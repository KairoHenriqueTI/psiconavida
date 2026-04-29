import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '../../../lib/authz';
import { jsonError, methodNotAllowed } from '../../../lib/api';
import { AI_RATE_LIMIT } from '../../../lib/config';

// Simple in-memory rate limiter per user (keeps state only while process runs)
const aiUsage: Record<string, { count: number; windowStart: number }> = {};

function isRateLimited(userId: string) {
  const now = Date.now();
  const windowMs = AI_RATE_LIMIT.windowSec * 1000;
  const bucket = aiUsage[userId] || { count: 0, windowStart: now };
  if (now - bucket.windowStart > windowMs) {
    // reset
    aiUsage[userId] = { count: 1, windowStart: now };
    return false;
  }
  if (bucket.count >= AI_RATE_LIMIT.requests) {
    return true;
  }
  bucket.count += 1;
  aiUsage[userId] = bucket;
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const session = await requireRole(req, res, ["admin", "editor"]);
  if (!session) return;

  const { prompt, title, category } = req.body;
  if (!prompt) return jsonError(res, 400, "Missing prompt");

  // Basic prompt validation / sanitization
  if (typeof prompt !== 'string' || prompt.length > 5000) {
    return jsonError(res, 400, "Invalid prompt");
  }
  // remove suspicious control chars
  const safePrompt = prompt.replace(/[\u0000-\u001f\u007f]/g, '');

  const userId = (session.user as any).id as string;
  if (isRateLimited(userId)) {
    return jsonError(res, 429, "Rate limit exceeded for AI generation");
  }

  // If OPENAI_API_KEY is configured, you can call OpenAI here.
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = await import('openai');
      const client = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes blog drafts.' },
          { role: 'user', content: `Write a blog draft with prompt: ${safePrompt}` },
        ],
        max_tokens: 800,
      });
      const content = completion.choices?.[0]?.message?.content || '';
      return res.json({ title: title || 'Draft from AI', excerpt: '', content });
    } catch (e: any) {
      return jsonError(res, 500, "Could not generate post");
    }
  }

  // Fallback stub if no OpenAI key
  const stubContent = `# ${title || 'AI Draft'}\n\n${prompt}\n\n(Insterted sample content — configure OPENAI_API_KEY to enable real generation)`;
  return res.json({ title: title || 'Draft from AI', excerpt: '', content: stubContent });
}
