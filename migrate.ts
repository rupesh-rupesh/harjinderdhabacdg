import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sqlClient = postgres(connectionString);
const db = drizzle(sqlClient);

async function run() {
  try {
    console.log("Adding columns...");
    await db.execute(sql`ALTER TABLE analytics_settings ADD COLUMN IF NOT EXISTS dashboard_cache JSONB;`);
    await db.execute(sql`ALTER TABLE analytics_settings ADD COLUMN IF NOT EXISTS cache_updated_at TIMESTAMP;`);
    console.log("Success!");
  } catch(e) {
    console.error("Failed:", e);
  }
  process.exit(0);
}
run();
