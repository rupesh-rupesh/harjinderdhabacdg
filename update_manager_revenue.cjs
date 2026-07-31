const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerDailyRevenue.tsx', 'utf-8');

const oldUseState = `  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedDateStats, setSelectedDateStats] = useState<{ date: Date; revenue: number; orderCount: number } | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);`;

const newUseState = `  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [selectedDateStats, setSelectedDateStats] = useState<{ date: Date; revenue: number; orderCount: number } | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch('/api/admin/daily-revenue');
        if (res.ok) {
          const data = await res.json();
          setDailyData(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchRevenue();
    const interval = setInterval(fetchRevenue, 30000);
    return () => clearInterval(interval);
  }, []);`;

code = code.replace(oldUseState, newUseState);

const oldGetDayStats = `  const getDayStats = (day: number) => {
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = dateObj.toDateString();
    let revenue = 0;
    let orderCount = 0;
    
    orders.forEach(order => {
      if (order.status === 'completed' && new Date(order.createdAt).toDateString() === dateStr) {
        revenue += order.total;
        orderCount++;
      }
    });

    return { date: dateObj, revenue, orderCount };
  };`;

const newGetDayStats = `  const getDayStats = (day: number) => {
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStrCheck = dateObj.toDateString();
    
    const dataForDay = dailyData.find((d: any) => new Date(d.date_str).toDateString() === dateStrCheck);

    return { 
      date: dateObj, 
      revenue: dataForDay ? Number(dataForDay.revenue) : 0, 
      orderCount: dataForDay ? Number(dataForDay.order_count) : 0 
    };
  };`;

code = code.replace(oldGetDayStats, newGetDayStats);

fs.writeFileSync('src/components/ManagerDailyRevenue.tsx', code);
