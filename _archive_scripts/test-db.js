import pg from 'pg';
const pool = new pg.Pool({
  connectionString: "postgresql://postgres.gygilyvltefcdsjsazcp:harjinder%40123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT count(*) FROM categories', (err, res) => {
  if (err) {
    console.error('DB Connection Error:', err.message);
  } else {
    console.log('Categories count:', res.rows[0]);
  }
  pool.query('SELECT count(*) FROM menu_items', (err, res) => {
    if (err) {
      console.error('DB Connection Error:', err.message);
    } else {
      console.log('Items count:', res.rows[0]);
    }
    pool.end();
  });
});
