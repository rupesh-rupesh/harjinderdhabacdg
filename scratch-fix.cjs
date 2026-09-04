require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`ALTER TABLE features ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'Sparkles' NOT NULL, ADD COLUMN IF NOT EXISTS video_url text`
  .then(() => console.log('Fixed features'))
  .catch(e => console.error(e))
  .finally(() => process.exit(0));
