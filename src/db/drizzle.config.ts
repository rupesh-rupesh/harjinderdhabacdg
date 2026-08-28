import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('pooler.supabase.com:6543')) {
  // Convert Supabase pooler URL to direct connection URL for Drizzle Push
  // From: postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
  // To: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
  const match = dbUrl.match(/postgres\.([^:]+):([^@]+)@[^:]+:6543/);
  if (match) {
    const projectRef = match[1];
    const password = match[2];
    dbUrl = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
  }
} else if (dbUrl && !dbUrl.includes('sslmode=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
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
