import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('pooler.supabase.com:6543') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!dbUrl && (!sqlHost || !sqlDbName || !user || !password)) {
  console.warn("Missing SQL credentials for Drizzle Kit. Schema migrations may fail.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  ...(dbUrl 
    ? { dbCredentials: { url: dbUrl } }
    : {
        dbCredentials: {
          host: sqlHost || "",
          user: user || "",
          password: password || "",
          database: sqlDbName || "",
          ssl: false,
        }
      }
  ),
  verbose: true,
});
