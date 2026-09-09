require('dotenv').config();
const { sql } = require('drizzle-orm');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function dropTables() {
  let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('No database URL found');
    process.exit(1);
  }
  if (dbUrl.includes('pooler.supabase.com') && !dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  const queryClient = postgres(dbUrl, { max: 1, prepare: false });
  const db = drizzle(queryClient);

  try {
    console.log('Dropping journey_media and journey_settings...');
    await db.execute(sql`DROP TABLE IF EXISTS journey_media CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS journey_settings CASCADE;`);
    console.log('Tables dropped successfully.');
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    await queryClient.end();
  }
}

dropTables();
