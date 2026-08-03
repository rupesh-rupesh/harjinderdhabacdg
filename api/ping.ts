// Minimal debug handler to isolate crash
export default function handler(req: any, res: any) {
  res.json({ 
    status: 'ok', 
    env_db: !!process.env.DATABASE_URL,
    node: process.version,
    time: new Date().toISOString()
  });
}
