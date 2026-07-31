const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Update imports
if (!code.includes("import { eq, desc, lt, inArray, sql } from 'drizzle-orm';")) {
    code = code.replace("import { eq, desc, lt, inArray } from 'drizzle-orm';", "import { eq, desc, lt, inArray, sql } from 'drizzle-orm';");
}

const newEndpoints = `  app.get("/api/admin/stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const statsResult = await db.execute(sql\`
        SELECT 
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed' AND created_at >= \${today.toISOString()}) as daily_revenue,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'processing')) as active_orders,
          (SELECT COUNT(*) FROM users WHERE uid = 'pos_system') as pos_users
      \`);
      
      res.json({
         dailyRevenue: Number(statsResult.rows[0].daily_revenue || 0),
         totalOrders: Number(statsResult.rows[0].total_orders || 0),
         activeOrders: Number(statsResult.rows[0].active_orders || 0),
         posUsers: Number(statsResult.rows[0].pos_users || 0)
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/daily-revenue", async (req, res) => {
    try {
      const revenueResult = await db.execute(sql\`
        SELECT 
          DATE(created_at) as date_str,
          COUNT(id) as order_count,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      \`);
      
      res.json(revenueResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch daily revenue" });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {`;

code = code.replace(`  app.get("/api/admin/orders", async (req, res) => {`, newEndpoints);

fs.writeFileSync('server.ts', code);
