// Vercel Serverless Function — proxies all /api/* requests to the Express app
// @ts-ignore — TypeScript may not resolve .ts imports in this context
import app from '../server.ts';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure the URL starts with /api so Express routes match correctly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  // @ts-ignore — Express and Vercel request/response types are compatible
  return app(req, res);
}
