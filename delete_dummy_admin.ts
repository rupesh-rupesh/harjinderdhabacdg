import { db } from './src/db/index.js';
import { staffAccounts } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
    await db.delete(staffAccounts).where(eq(staffAccounts.email, 'admin@yourdomain.com'));
    console.log('Deleted dummy admin account');
    const existing = await db.select().from(staffAccounts);
    console.log('Remaining accounts:', existing);
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
