const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.gygilyvltefcdsjsazcp:harjinder%40123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT * FROM categories LIMIT 1', (err, res) => {
  if (err) {
    console.error('Query failed:', err.message);
  } else {
    console.log('Query succeeded, rows:', res.rows.length);
  }
  pool.end();
});
