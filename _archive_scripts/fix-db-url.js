const fs = require('fs');

const indexFile = 'src/db/index.ts';
let indexCode = fs.readFileSync(indexFile, 'utf8');

if (!indexCode.includes('pgbouncer=true')) {
  indexCode = indexCode.replace(
    'const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;',
    `let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (dbUrl && dbUrl.includes('pooler.supabase.com:6543') && !dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }`
  );
  fs.writeFileSync(indexFile, indexCode);
}

const drizzleConfigFile = 'src/db/drizzle.config.ts';
let drizzleCode = fs.readFileSync(drizzleConfigFile, 'utf8');

if (!drizzleCode.includes('pgbouncer=true')) {
  drizzleCode = drizzleCode.replace(
    'const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;',
    `let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('pooler.supabase.com:6543') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}`
  );
  fs.writeFileSync(drizzleConfigFile, drizzleCode);
}
