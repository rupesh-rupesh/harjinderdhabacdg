require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function addIndexes() {
  try {
    console.log("Adding indexes...");
    await sql`CREATE INDEX IF NOT EXISTS categories_is_deleted_idx ON categories (is_deleted);`;
    await sql`CREATE INDEX IF NOT EXISTS categories_is_hidden_idx ON categories (is_hidden);`;
    
    await sql`CREATE INDEX IF NOT EXISTS features_is_active_idx ON features (is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS features_display_order_idx ON features (display_order);`;
    
    await sql`CREATE INDEX IF NOT EXISTS journey_media_is_active_idx ON journey_media (is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS journey_media_display_order_idx ON journey_media (display_order);`;

    // staff tables might not exist yet if the app hasn't initialized them! 
    // We can use IF EXISTS or just catch the error and continue.
    try {
      await sql`CREATE INDEX IF NOT EXISTS staff_accounts_email_idx ON staff_accounts (email);`;
      await sql`CREATE INDEX IF NOT EXISTS staff_accounts_role_idx ON staff_accounts (role);`;
      await sql`CREATE INDEX IF NOT EXISTS staff_accounts_is_active_idx ON staff_accounts (is_active);`;
      
      await sql`CREATE INDEX IF NOT EXISTS otp_sessions_staff_id_idx ON otp_sessions (staff_id);`;
      await sql`CREATE INDEX IF NOT EXISTS otp_sessions_used_idx ON otp_sessions (used);`;
      await sql`CREATE INDEX IF NOT EXISTS otp_sessions_expires_at_idx ON otp_sessions (expires_at);`;
    } catch(e) {
       console.log("Staff tables not found yet, skipping staff indexes...");
    }

    console.log("Indexes added successfully!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

addIndexes();
