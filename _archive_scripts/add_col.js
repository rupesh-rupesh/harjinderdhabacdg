import postgres from 'postgres';
import dns from 'dns';
import * as dotenv from 'dotenv';
dotenv.config();

dns.setDefaultResultOrder('ipv4first');

const sql = postgres(process.env.POSTGRES_URL || process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1
});

async function run() {
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS local_bill_id text UNIQUE;`;
    await sql`CREATE INDEX IF NOT EXISTS orders_local_bill_id_idx ON orders (local_bill_id);`;
    console.log("Column added successfully!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await sql.end();
  }
}

run();
