import { db } from './src/db/index';
import { orders } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const data = await db.select().from(orders).where(eq(orders.id, 38));
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}
run();
