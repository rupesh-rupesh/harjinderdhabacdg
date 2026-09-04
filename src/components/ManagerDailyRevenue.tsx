import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, TrendingUp, Package, Receipt, Clock, Info } from 'lucide-react';

export default function ManagerDailyRevenue() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: dailyRevenueData = [] } = useQuery({
    queryKey: ['admin_daily_revenue'],
    queryFn: async () => {
      const res = await fetch('/api/admin/daily-revenue');
      if (res.ok) return res.json();
      return [];
    },
    refetchInterval: 60000,
    staleTime: 60000
  });

  const { data: selectedDayOrders = [], isFetching: isLoadingDayOrders } = useQuery({
    queryKey: ['admin_orders', selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/admin/orders?date=${dateStr}&status=completed&limit=500`);
      if (res.ok) return res.json();
      return [];
    },
    enabled: !!selectedDate,
    staleTime: 60000
  });

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
    const dateStrCheck = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    const revenueRecord = dailyRevenueData.find((r: any) => r.date_str.startsWith(dateStrCheck));
    const revenue = revenueRecord ? Number(revenueRecord.revenue) : 0;
    const orderCount = revenueRecord ? Number(revenueRecord.order_count) : 0;
    
    // For the detail view, if this is the selected date, use the fetched orders
    const dayOrders = (selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth()) ? selectedDayOrders : [];
    
    let subtotal = 0;
    dayOrders.forEach((o: any) => {
      try {
        const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
        const orderSubtotal = items.reduce((s: number, i: any) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
        subtotal += orderSubtotal;
      } catch(e) {}
    });

    const gstCollected = Math.max(0, revenue - subtotal);
    const aov = orderCount > 0 ? revenue / orderCount : 0;

    return { 
      date: dateObj, 
      revenue, 
      orderCount,
      dayOrders,
      subtotal,
      gstCollected,
      aov
    };
  };

  const selectedStats = selectedDate ? getDayStats(selectedDate.getDate()) : null;

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
            <div key={`empty-${i}`} className="bg-[#FAF8F5] min-h-[120px]" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const stats = getDayStats(day);
            const isToday = new Date().toDateString() === stats.date.toDateString();
            const hasData = stats.revenue > 0;
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(stats.date)}
                className={`min-h-[120px] bg-white p-3 flex flex-col items-center transition-all group relative hover:bg-orange-50 cursor-pointer ${isToday ? 'bg-orange-50/10' : ''} ${hasData ? 'z-10 shadow-[0_0_15px_rgba(234,88,12,0.1)] rounded-xl border border-[#F97316] m-[-1px]' : ''}`}
              >
                <span className={`text-base font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-dhaba-dark text-white shadow-md' : 'text-[#3B291A]'}`}>
                  {day}
                </span>
                
                {hasData && (
                  <div className="mt-auto w-full text-center flex flex-col items-center justify-center space-y-1">
                    <div className="text-xs text-[#8B7355] font-medium">{stats.orderCount} Orders</div>
                    <div className="w-full flex items-center justify-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#F97316]/30"></div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent"></div>
                      <div className="w-1 h-1 rounded-full bg-[#F97316]/30"></div>
                    </div>
                    <div className="font-bold text-green-600 text-sm">
                      ₹{stats.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedStats && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#3B291A] p-6 text-white text-center relative border-b-4 border-[#D4AF37] shrink-0">
              <button 
                onClick={() => setSelectedDate(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-serif font-bold">
                {selectedStats.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6 bg-stone-50">
              {selectedStats.orderCount > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-600">₹{selectedStats.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Completed Orders</span>
                      <span className="text-2xl font-bold text-dhaba-dark">{selectedStats.orderCount}</span>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Avg Order Value</span>
                      <span className="text-2xl font-bold text-blue-600">₹{selectedStats.aov.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Subtotal</span>
                      <span className="text-xl font-bold text-stone-700">₹{selectedStats.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">GST Collected</span>
                      <span className="text-xl font-bold text-stone-700">₹{selectedStats.gstCollected.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-800 text-lg mb-4 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-dhaba-orange" />
                      Order Details
                    </h4>
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-stone-100/50 border-b border-stone-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-stone-600">Order ID</th>
                            <th className="px-4 py-3 font-semibold text-stone-600">Table/Type</th>
                            <th className="px-4 py-3 font-semibold text-stone-600">Time</th>
                            <th className="px-4 py-3 font-semibold text-stone-600">Items</th>
                            <th className="px-4 py-3 font-semibold text-stone-600 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {selectedStats.dayOrders.map((order: any) => {
                            let tableNum = 'Takeaway';
                            let displayItems = [];
                            try {
                              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                              const tableMarker = items.find((i: any) => i.isTableMarker);
                              if (tableMarker) {
                                tableNum = tableMarker.name;
                              }
                              displayItems = items.filter((i: any) => !i.isTableMarker);
                            } catch (e) {}

                            return (
                              <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-stone-900">#{order.id}</td>
                                <td className="px-4 py-3 text-stone-600">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tableNum === 'Takeaway' ? 'bg-orange-100 text-orange-800' : 'bg-stone-100 text-stone-800'}`}>
                                    {tableNum}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-stone-500">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="max-w-[200px] truncate text-stone-600 text-xs">
                                    {displayItems.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-bold text-stone-900 text-right">₹{order.total}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-stone-400">
                  <Info className="w-12 h-12 mb-3 text-stone-300" />
                  <p className="text-lg font-medium text-stone-500">There are no completed orders to display for the selected date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
