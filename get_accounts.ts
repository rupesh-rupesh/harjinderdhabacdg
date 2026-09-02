import { db } from './src/db/index.js';
import { staffAccounts } from './src/db/schema.js';

async function main() {
    const existing = await db.select().from(staffAccounts);
    console.log(existing);
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
