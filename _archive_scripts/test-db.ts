import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import { db } from './src/db/index';
import { categories, menuItems } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function run() {
  const cats = await db.select({ count: sql`count(*)` }).from(categories);
  const items = await db.select({ count: sql`count(*)` }).from(menuItems);
  console.log('Categories count:', cats[0]?.count);
  console.log('Menu items count:', items[0]?.count);
  process.exit(0);
}
run();
