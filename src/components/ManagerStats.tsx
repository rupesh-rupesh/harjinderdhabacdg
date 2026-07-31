import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Package, Info } from 'lucide-react';

export default function ManagerStats() {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    posUsers: 1
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e: any) {
        if (e.message !== 'Failed to fetch') {
          console.error("Failed to fetch stats", e);
        }
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#FFFDF5] to-[#FDF8E7] p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#F2E5C5] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" fill="none">
          <path d="M-100 350C150 150 300 250 500 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.4"/>
          <path d="M-50 400C200 200 350 300 550 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2"/>
          <path d="M200 400C450 150 600 250 900 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.3"/>
          <path d="M300 450C550 200 700 300 1000 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2"/>
        </svg>

        <div className="relative z-10">
          <div className="flex flex-col items-start justify-center text-left mb-8">
            <h2 className="text-4xl font-serif font-bold text-[#3B291A] mb-2 tracking-tight">Manager Stats</h2>
            <p className="text-[#5C4D40] text-lg">Overview of POS and order metrics.</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-24 h-[1px] bg-[#D4AF37] opacity-50"></div>
            <div className="w-2 h-2 rotate-45 bg-[#D4AF37] opacity-80"></div>
            <div className="w-24 h-[1px] bg-[#D4AF37] opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Revenue */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100/50 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#F0F5FF] flex items-center justify-center shrink-0 shadow-inner">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-stone-500 font-medium mb-1">Daily Revenue</p>
            <p className="text-3xl font-bold text-stone-800 tracking-tight">₹{stats.dailyRevenue}</p>
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100/50 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-400"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center shrink-0 shadow-inner">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-stone-500 font-medium mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-stone-800 tracking-tight">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100/50 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] flex items-center justify-center shrink-0 shadow-inner">
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-stone-500 font-medium mb-1">Active Orders</p>
            <p className="text-3xl font-bold text-stone-800 tracking-tight">{stats.activeOrders}</p>
          </div>
        </div>

        {/* POS Users */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100/50 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-400"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#FAF5FF] flex items-center justify-center shrink-0 shadow-inner">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-stone-500 font-medium mb-1">POS Users</p>
            <p className="text-3xl font-bold text-stone-800 tracking-tight">{stats.posUsers}</p>
          </div>
        </div>
      </div>
      
      {/* Info Notice */}
      <div className="bg-[#FCFAEE] p-6 rounded-3xl border border-[#F2E5C5]/50 flex items-start gap-4">
        <div className="mt-1 flex-shrink-0 text-[#B8860B]">
          <Info className="w-6 h-6" />
        </div>
        <p className="text-[#5C4D40] text-[15px] leading-relaxed max-w-md">
          Detailed charts and analytics will be available in the future to ensure data is accumulated.
        </p>
      </div>
    </div>
  );
}
