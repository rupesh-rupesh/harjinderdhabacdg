const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerStats.tsx', 'utf-8');

const oldFetchStats = `  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const orders = await res.json();
          
          let revenue = 0;
          let active = 0;
          
          orders.forEach((order: any) => {
            if (order.status === 'completed') {
              // Check if order is from today
              const orderDate = new Date(order.createdAt);
              const today = new Date();
              if (orderDate.toDateString() === today.toDateString()) {
                revenue += order.total;
              }
            } else if (order.status === 'pending' || order.status === 'processing') {
              active += 1;
            }
          });

          setStats({
            dailyRevenue: revenue,
            totalOrders: orders.length,
            activeOrders: active,
            posUsers: 1 // Placeholder for now, unless we have a real POS users endpoint
          });
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };
    
    fetchStats();`;

const newFetchStats = `  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };
    
    fetchStats();`;

code = code.replace(oldFetchStats, newFetchStats);
fs.writeFileSync('src/components/ManagerStats.tsx', code);
