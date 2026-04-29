export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Rate limiter defaults for AI endpoints
export const AI_RATE_LIMIT = {
  // requests per window
  requests: Number(process.env.AI_RATE_LIMIT_REQUESTS || 5),
  // window seconds
  windowSec: Number(process.env.AI_RATE_LIMIT_WINDOW_SEC || 60),
};
