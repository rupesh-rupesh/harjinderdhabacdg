import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';
import { categories } from './src/db/schema.ts';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.gygilyvltefcdsjsazcp:harjinder%40123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(pool);
async function run() {
  try {
    const cats = await db.select().from(categories).limit(1);
    console.log('Categories:', cats.length);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}
run();
