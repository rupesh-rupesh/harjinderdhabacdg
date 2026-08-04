// Minimal ping test - no DB, no Firebase
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function ping(req: VercelRequest, res: VercelResponse) {
  res.json({
    ok: true,
    env: {
      hasDbUrl: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      nodeVersion: process.version,
      time: new Date().toISOString(),
    }
  });
}
