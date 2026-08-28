import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('pooler.supabase.com:6543') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

const queryClient = postgres(dbUrl || '', { prepare: false });

async function main() {
  await queryClient`
    CREATE TABLE IF NOT EXISTS "news_ticker" (
      "id" SERIAL PRIMARY KEY,
      "text" TEXT NOT NULL,
      "is_active" BOOLEAN DEFAULT true,
      "display_order" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `;
  console.log('Table created!');
  process.exit(0);
}

main().catch(console.error);
