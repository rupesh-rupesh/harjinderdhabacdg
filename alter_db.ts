import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not found');
  const sql = postgres(url, { ssl: 'require' });
  
  try {
    console.log("Altering table...");
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;`;
    console.log("Table altered successfully!");
  } catch (error) {
    console.error("Failed to alter table:", error);
  } finally {
    await sql.end();
  }
}

run();
