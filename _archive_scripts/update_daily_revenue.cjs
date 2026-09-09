const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerDailyRevenue.tsx', 'utf-8');

const newCode = `import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, TrendingUp, Package } from 'lucide-react';

export default function ManagerDailyRevenue() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStats, setSelectedDateStats] = useState<{ date: Date, revenue: number, orderCount: number } | null>(null);

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
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDayStats = (day: number) => {
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
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF9EE] shadow-inner flex items-center justify-center shrink-0 border border-[#F2E5C5]/50">
            <CalendarIcon className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#3B291A] tracking-tight">Daily Revenue</h2>
            <p className="text-[#5C4D40] text-sm">Track your daily sales and orders</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-stone-100 w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white rounded-xl transition-colors text-stone-600 shadow-sm border border-transparent hover:border-stone-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-[#3B291A] min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-xl transition-colors text-stone-600 shadow-sm border border-transparent hover:border-stone-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#F2E5C5]/50 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#F2E5C5]/50 bg-[#FFFDF5]">
          {dayNames.map(day => (
            <div key={day} className="py-4 text-center font-bold text-[#8B7355] text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 bg-[#F2E5C5]/30 gap-px">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={\`empty-\${i}\`} className="bg-[#FAF8F5] min-h-[120px]" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const stats = getDayStats(day);
            const isToday = new Date().toDateString() === stats.date.toDateString();
            const hasData = stats.revenue > 0;
            
            return (
              <button
                key={day}
                onClick={() => hasData && setSelectedDateStats(stats)}
                disabled={!hasData}
                className={\`min-h-[120px] bg-white p-3 flex flex-col items-center transition-all group relative \${hasData ? 'hover:bg-orange-50 cursor-pointer' : 'cursor-default'} \${isToday && !hasData ? 'bg-orange-50/30' : ''} \${hasData ? 'z-10 shadow-[0_0_15px_rgba(234,88,12,0.1)] rounded-xl border border-[#F97316] m-[-1px]' : ''}\`}
              >
                <span className={\`text-base font-bold w-10 h-10 flex items-center justify-center rounded-full transition-colors \${hasData ? 'bg-[#F97316] text-white shadow-md' : (isToday ? 'bg-stone-100 text-[#3B291A]' : 'text-[#3B291A]')}\`}>
                  {day}
                </span>
                
                {hasData && (
                  <div className="mt-auto w-full text-center flex flex-col items-center justify-center space-y-1">
                    <div className="text-xs text-[#8B7355] font-medium">{stats.orderCount} orders</div>
                    <div className="w-full flex items-center justify-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#F97316]/30"></div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent"></div>
                      <div className="w-1 h-1 rounded-full bg-[#F97316]/30"></div>
                    </div>
                    <div className="font-bold text-green-600 text-sm">
                      ₹{stats.revenue}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDateStats && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedDateStats(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#3B291A] p-6 text-white text-center relative border-b-4 border-[#D4AF37]">
              <button 
                onClick={() => setSelectedDateStats(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-serif font-bold">
                {selectedDateStats.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-0.5">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">₹{selectedDateStats.revenue}</p>
                </div>
              </div>
              
              <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-200 text-stone-600 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">Total Orders</p>
                  <p className="text-2xl font-bold text-stone-800">{selectedDateStats.orderCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/ManagerDailyRevenue.tsx', newCode);
