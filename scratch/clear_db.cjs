require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function clear() {
  try {
    await sql`DELETE FROM otp_sessions`;
    await sql`DELETE FROM staff_accounts`;
    console.log('Cleared staff_accounts and otp_sessions successfully!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
clear();
