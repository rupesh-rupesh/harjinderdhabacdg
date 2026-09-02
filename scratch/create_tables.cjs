require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function createTables() {
  try {
    console.log("Creating missing tables...");

    await sql`
      CREATE TABLE IF NOT EXISTS journey_settings (
        id SERIAL PRIMARY KEY,
        header TEXT NOT NULL DEFAULT 'Our Journey',
        description TEXT NOT NULL DEFAULT '',
        signature TEXT,
        sub_signature TEXT
      );
    `;
    console.log("Created journey_settings");

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_settings (
        id SERIAL PRIMARY KEY,
        tracking_enabled BOOLEAN DEFAULT true,
        location_tracking_enabled BOOLEAN DEFAULT true,
        device_tracking_enabled BOOLEAN DEFAULT true,
        browser_tracking_enabled BOOLEAN DEFAULT true,
        live_monitoring_enabled BOOLEAN DEFAULT true,
        export_enabled BOOLEAN DEFAULT true,
        session_timeout_minutes INTEGER DEFAULT 30,
        data_retention_days INTEGER DEFAULT 90,
        demo_notice_enabled BOOLEAN DEFAULT true
      );
    `;
    console.log("Created analytics_settings");

    console.log("Tables created successfully!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

createTables();
