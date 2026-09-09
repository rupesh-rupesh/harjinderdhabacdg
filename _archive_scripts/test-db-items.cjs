const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.gygilyvltefcdsjsazcp:harjinder%40123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT COUNT(*) FROM menu_items WHERE is_deleted = false', (err, res) => {
  if (err) {
    console.error('Query failed:', err.message);
  } else {
    console.log('Menu Items (not deleted):', res.rows[0].count);
  }
  pool.query('SELECT COUNT(*) FROM categories WHERE is_deleted = false', (err, res) => {
    if (err) {
      console.error('Query failed:', err.message);
    } else {
      console.log('Categories (not deleted):', res.rows[0].count);
    }
    pool.end();
  });
});
