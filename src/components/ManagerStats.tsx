import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import PanLoader from './PanLoader';
import { Activity, TrendingUp, TrendingDown, Users, Package, ShoppingBag, Banknote, Calendar, BarChart3, Clock, ArrowRight, X, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ManagerStats({ role = 'manager' }: { role?: 'admin' | 'manager' }) {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    posUsers: 1
  });

  const [dailyData, setDailyData] = useState<any[]>([]);
  const [calculated, setCalculated] = useState({
    yesterdayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    aov: 0,
    trendPercent: 0
  });
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  const handleViewOrders = async (dateStr?: string) => {
    setSelectedDateFilter(dateStr || null);
    setShowOrdersModal(true);
    
    // Always fetch if there's a specific date we haven't loaded, or just refetch
    setIsFetchingOrders(true);
    try {
      const qs = dateStr ? `?date=${dateStr}&limit=500` : `?limit=50`;
      const res = await fetch(`/api/admin/orders${qs}`);
      if (res.ok) {
        setAllOrders(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (res.ok) return res.json();
      return stats;
    },
    refetchInterval: 60000,
    staleTime: 60000,
    placeholderData: keepPreviousData
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin_daily_revenue'],
    queryFn: async () => {
      const res = await fetch('/api/admin/daily-revenue');
      if (res.ok) return res.json();
      return [];
    },
    refetchInterval: 60000,
    staleTime: 60000,
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (statsData) setStats(statsData);
    if (revenueData) {
      setDailyData(revenueData);
      calculateMetrics(revenueData, statsData || stats);
    }
  }, [statsData, revenueData]);

  const calculateMetrics = (data: any[], currentStats: any) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let wRev = 0;
    let mRev = 0;
    let yRev = 0;
    let totalLifetimeRevenue = 0;
    
    data.forEach(day => {
      const dayDate = new Date(day.date_str);
      dayDate.setHours(0,0,0,0);
      
      const rev = Number(day.revenue);
      totalLifetimeRevenue += rev;
      
      if (dayDate.getTime() === yesterday.getTime()) yRev = rev;
      if (dayDate >= weekAgo) wRev += rev;
      if (dayDate >= monthStart) mRev += rev;
    });
    
    let trend = 0;
    if (yRev > 0) {
      trend = ((currentStats.dailyRevenue - yRev) / yRev) * 100;
    }
    
    setCalculated({
      yesterdayRevenue: yRev,
      weeklyRevenue: wRev,
      monthlyRevenue: mRev,
      aov: currentStats.totalOrders > 0 ? Math.round(totalLifetimeRevenue / currentStats.totalOrders) : 0,
      trendPercent: trend
    });
  };

  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const existing = dailyData.find(x => x.date_str.startsWith(dateStr));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: dateStr,
      revenue: existing ? Number(existing.revenue) : 0
    };
  });
  
  const maxRev = Math.max(...last7Days.map(d => d.revenue), 1000);

  if (isLoading) {
    return <PanLoader text="Loading Stats..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-dhaba-dark to-stone-900 p-8 sm:p-10 rounded-3xl shadow-2xl overflow-hidden text-white border border-stone-800">
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-overlay" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" fill="none">
          <path d="M-100 350C150 150 300 250 500 -50" stroke="#FF7F50" strokeWidth="2" strokeOpacity="0.5"/>
          <path d="M-50 400C200 200 350 300 550 0" stroke="#FF7F50" strokeWidth="2" strokeOpacity="0.3"/>
          <path d="M200 400C450 150 600 250 900 -50" stroke="#FF7F50" strokeWidth="3" strokeOpacity="0.4"/>
        </svg>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-4 backdrop-blur-md">
              <Activity className="w-4 h-4 text-dhaba-orange" />
              <span className="text-xs font-bold tracking-wider uppercase text-white/90">Real-time Analytics</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-3 tracking-tight">Revenue Insights</h2>
            <p className="text-stone-300 text-lg max-w-xl">Track your dhaba's financial performance, daily trends, and order volumes all in one place.</p>
          </div>
          {role === 'admin' && (
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-right">
              <p className="text-stone-300 text-sm font-medium mb-1">Today's Revenue</p>
              <p className="text-4xl font-bold text-dhaba-orange">₹{stats.dailyRevenue.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${role === 'admin' ? '4' : '3'} gap-4 sm:gap-6`}>
        
        {/* Today Card */}
        {role === 'admin' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Banknote className="w-6 h-6 text-dhaba-orange" />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${calculated.trendPercent >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {calculated.trendPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(calculated.trendPercent).toFixed(1)}%
              </div>
            </div>
            <p className="text-stone-500 text-sm font-medium mb-1">Today's Sales</p>
            <h3 className="text-3xl font-bold text-dhaba-dark">₹{stats.dailyRevenue.toLocaleString()}</h3>
            <p className="text-stone-400 text-xs mt-3">vs yesterday (₹{calculated.yesterdayRevenue.toLocaleString()})</p>
          </div>
        )}

        {/* Weekly Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform border border-stone-100">
              <Calendar className="w-6 h-6 text-stone-600" />
            </div>
          </div>
          <p className="text-stone-500 text-sm font-medium mb-1">This Week</p>
          <h3 className="text-3xl font-bold text-dhaba-dark">₹{calculated.weeklyRevenue.toLocaleString()}</h3>
          <p className="text-stone-400 text-xs mt-3">Trailing 7 days revenue</p>
        </div>

        {/* Monthly Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform border border-stone-100">
              <BarChart3 className="w-6 h-6 text-stone-600" />
            </div>
          </div>
          <p className="text-stone-500 text-sm font-medium mb-1">This Month</p>
          <h3 className="text-3xl font-bold text-dhaba-dark">₹{calculated.monthlyRevenue.toLocaleString()}</h3>
          <p className="text-stone-400 text-xs mt-3">Total revenue this month</p>
        </div>

        {/* AOV Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-dhaba-orange" />
            </div>
          </div>
          <p className="text-stone-500 text-sm font-medium mb-1">Average Order Value</p>
          <h3 className="text-3xl font-bold text-dhaba-dark">₹{calculated.aov.toLocaleString()}</h3>
          <p className="text-stone-400 text-xs mt-3">Based on lifetime orders</p>
        </div>

      </div>

      {/* Secondary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-dhaba-dark">Weekly Revenue Trend</h3>
              <p className="text-stone-500 text-sm mt-1">Last 7 days performance</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg">
              <Activity className="w-5 h-5 text-stone-400" />
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
            {last7Days.map((day, idx) => {
              const heightPercent = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
              const isToday = idx === 6;
              
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer" onClick={() => handleViewOrders(day.dateStr)}>
                  <div className="relative w-full flex justify-center h-[200px] items-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-10">
                      ₹{day.revenue.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[3rem] rounded-t-xl transition-all duration-700 ease-out ${isToday ? 'bg-gradient-to-t from-dhaba-orange to-orange-400' : 'bg-stone-200 group-hover:bg-stone-300'}`}
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    />
                  </div>
                  <span className={`mt-4 text-sm font-medium ${isToday ? 'text-dhaba-orange font-bold' : 'text-stone-400'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 h-full flex flex-col">
            <h3 className="text-xl font-bold text-dhaba-dark mb-6">Order Insights</h3>
            
            <div className="flex-1 space-y-6">
              <div className="flex items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 shrink-0 text-dhaba-orange">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-500 text-sm font-medium">Total Lifetime Orders</p>
                  <p className="text-2xl font-bold text-stone-800">{stats.totalOrders.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 shrink-0 text-dhaba-orange">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-dhaba-orange text-sm font-medium">Active / Pending Orders</p>
                  <p className="text-2xl font-bold text-stone-800">{stats.activeOrders}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 shrink-0 text-stone-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-500 text-sm font-medium">Active POS Users</p>
                  <p className="text-2xl font-bold text-stone-800">{stats.posUsers}</p>
                </div>
              </div>
            </div>
            
            <button onClick={() => handleViewOrders()} className="w-full mt-6 py-4 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2">
              View Order History <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
      {/* Orders List Modal */}
      {showOrdersModal && !selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div>
                <h3 className="text-2xl font-serif font-bold text-dhaba-dark">
                  {selectedDateFilter ? `Orders for ${new Date(selectedDateFilter).toLocaleDateString()}` : 'Order History'}
                </h3>
                <p className="text-stone-500 text-sm mt-1">
                  {isFetchingOrders ? 'Loading orders...' : `${allOrders.filter(o => !selectedDateFilter || o.createdAt.startsWith(selectedDateFilter)).length} orders found`}
                </p>
              </div>
              <button onClick={() => setShowOrdersModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>
            
            {selectedDateFilter && !isFetchingOrders && (
              <div className="bg-stone-50 border-b border-stone-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
                {(() => {
                  const dayOrders = allOrders.filter(o => o.createdAt.startsWith(selectedDateFilter) && o.status !== 'cancelled');
                  const totalSales = dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
                  const totalOrdersCount = dayOrders.length;
                  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;
                  const gstCollected = totalSales > 0 ? Math.round(totalSales - (totalSales / 1.05)) : 0;
                  
                  const selectedDateObj = new Date(selectedDateFilter);
                  const yesterdayObj = new Date(selectedDateObj);
                  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
                  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];
                  const yesterdayOrders = allOrders.filter(o => o.createdAt.startsWith(yesterdayStr) && o.status !== 'cancelled');
                  const yesterdayTotalSales = yesterdayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
                  const trendPercent = yesterdayTotalSales > 0 ? ((totalSales - yesterdayTotalSales) / yesterdayTotalSales) * 100 : 0;

                  return (
                    <>
                      <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">Total Sales</p>
                        <p className="text-lg font-black text-dhaba-dark">₹{totalSales.toLocaleString()}</p>
                        <p className={`text-[10px] mt-0.5 font-bold flex items-center gap-1 ${trendPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {trendPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}% vs y'day
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">GST (5%)</p>
                        <p className="text-lg font-black text-dhaba-dark">₹{gstCollected.toLocaleString()}</p>
                        <p className="text-[10px] mt-0.5 text-stone-400 font-medium">Included in sales</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">Total Orders</p>
                        <p className="text-lg font-black text-dhaba-dark">{totalOrdersCount}</p>
                        <p className="text-[10px] mt-0.5 text-stone-400 font-medium">Completed</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">Avg Order</p>
                        <p className="text-lg font-black text-dhaba-dark">₹{avgOrderValue.toLocaleString()}</p>
                        <p className="text-[10px] mt-0.5 text-stone-400 font-medium">Value per order</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50" data-lenis-prevent="true">
              {isFetchingOrders ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-dhaba-orange border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {allOrders
                    .filter(o => !selectedDateFilter || o.createdAt.startsWith(selectedDateFilter))
                    .map((order, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-dhaba-orange/30 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-dhaba-orange" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-stone-800">Order #{order.id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                            <span>{(() => { try { return JSON.parse(order.items).length; } catch { return 0; } })()} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-dhaba-dark text-lg">₹{order.total}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-dhaba-orange transition-colors" />
                      </div>
                    </div>
                  ))}
                  {allOrders.filter(o => !selectedDateFilter || o.createdAt.startsWith(selectedDateFilter)).length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500">No orders found for this selection.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedOrder(null)}>
          <div 
            className="bg-stone-50 w-full rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ maxWidth: '480px', maxHeight: '92dvh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-white border-b border-stone-100 flex justify-between items-start shrink-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dhaba-orange via-amber-500 to-yellow-400"></div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Order Details</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">#{selectedOrder.id}</span>
                  <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase bg-green-100 text-green-700">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] relative" data-lenis-prevent="true">
              {/* Zigzag top for receipt look */}
              <div className="absolute top-0 left-4 right-4 h-2 bg-repeat-x opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 3px)', backgroundSize: '12px 12px' }}></div>
              
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-100 shadow-sm mb-6">
                <div>
                  <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="font-bold text-stone-800">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-bold text-stone-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-6 relative">
                <div className="p-4 border-b border-dashed border-stone-200 flex justify-between items-center bg-stone-50/50">
                  <h3 className="font-black text-stone-400 uppercase tracking-widest text-xs">Order Items</h3>
                </div>
                <div className="divide-y divide-dashed divide-stone-100 p-2">
                  {(() => {
                    try {
                      const items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items;
                      return items.filter((i: any) => !i.isTableMarker).map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex justify-between items-center group hover:bg-stone-50/50 rounded-xl transition-colors">
                          <div className="flex-1">
                            <div className="font-bold text-stone-800">{item.name}</div>
                            {(item.variantName || item.isHalf || item.isButter) && (
                              <div className="text-xs font-semibold text-stone-400 mt-1 flex gap-2">
                                {item.variantName && <span className="bg-stone-100 px-1.5 rounded">{item.variantName}</span>}
                                {item.isHalf && <span className="bg-stone-100 px-1.5 rounded">Half</span>}
                                {item.isButter && <span className="bg-amber-50 text-amber-600 px-1.5 rounded">+ Butter</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm font-black text-stone-400 bg-stone-100 w-8 h-8 flex items-center justify-center rounded-lg">{item.quantity}x</div>
                            <div className="font-black text-stone-900 w-16 text-right">
                              ₹{(Number(item.price) || 0) * item.quantity}
                            </div>
                          </div>
                        </div>
                      ));
                    } catch {
                      return <p className="text-stone-500 text-sm p-4 text-center font-medium">Could not load items.</p>;
                    }
                  })()}
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-dhaba-orange/20 rounded-full blur-xl"></div>
                
                <div className="flex justify-between items-center mb-3 text-stone-400 relative z-10 font-medium">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-700 relative z-10">
                  <span className="font-bold text-stone-200">Total Paid</span>
                  <span className="text-3xl font-black text-dhaba-orange">₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-stone-100 shrink-0">
              <button onClick={() => setSelectedOrder(null)} className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold transition-colors shadow-sm">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
