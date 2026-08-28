import * as dotenv from 'dotenv';
dotenv.config({ override: true });
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

export const createPool = () => {
  const commonConfig = {
    max: 10,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 60000,
    keepAlive: true,
  };
  let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (dbUrl && dbUrl.includes('pooler.supabase.com:6543') && !dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  if (dbUrl) {
    const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    const isSSLRequired = !isLocal;
    return new Pool({
      ...commonConfig,
      connectionString: dbUrl,
      ssl: isSSLRequired ? { rejectUnauthorized: false } : undefined,
    });
  }
  return new Pool({
    ...commonConfig,
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
  });
};

const pool = createPool();
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});
export const db = drizzle(pool, { schema });
