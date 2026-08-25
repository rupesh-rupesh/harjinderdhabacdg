import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Activity, Calendar, Printer, ArrowLeft, Lock, UserCircle, X, LayoutDashboard, ChevronLeft, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import ManagerBilling from './ManagerBilling';
import ManagerOrders from './ManagerOrders';
import ManagerStats from './ManagerStats';
import ManagerDailyRevenue from './ManagerDailyRevenue';
import PrinterSettings from './PrinterSettings';
import DashboardAuthModal from './DashboardAuthModal';

type Module = 'billing' | 'orders' | 'stats' | 'revenue' | 'printer';

const NAV_ITEMS: { key: Module; label: string; icon: React.ReactNode }[] = [
  { key: 'billing',  label: 'POS Billing',      icon: <ShoppingCart className="w-5 h-5" /> },
  { key: 'orders',   label: 'Order Overview',   icon: <Package className="w-5 h-5" /> },
  { key: 'stats',    label: 'Manager Stats',    icon: <Activity className="w-5 h-5" /> },
  { key: 'revenue',  label: 'Daily Revenue',    icon: <Calendar className="w-5 h-5" /> },
  { key: 'printer',  label: 'Printer Settings', icon: <Printer className="w-5 h-5" /> },
];

const MODULE_TITLES: Record<Module, string> = {
  billing:  'POS Billing',
  orders:   'Order Overview',
  stats:    'Manager Stats',
  revenue:  'Daily Revenue',
  printer:  'Printer Settings',
};

export default function ManagerDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('manager_dashboard_auth') === 'true' || localStorage.getItem('manager_dashboard_auth') === 'true'
  );
  const [activeModule, setActiveModule] = useState<Module>('billing');
  const [editingOrder, setEditingOrder] = useState<any>(null);
  // Sidebar starts open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('manager_sidebar_open');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    localStorage.setItem('manager_sidebar_open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  if (!authenticated) {
    return <DashboardAuthModal role="manager" onSuccess={() => setAuthenticated(true)} />;
  }

  const handleLock = () => {
    sessionStorage.removeItem('manager_dashboard_auth');
    localStorage.removeItem('manager_dashboard_auth');
    setAuthenticated(false);
    toast.success('Manager Dashboard locked');
  };

  const navigate = (key: Module) => {
    setActiveModule(key);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--color-dashboard-bg, #f7f4f0)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Sidebar Overlay (only on mobile) ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — fixed or relative depending on screen ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          transform transition-all duration-300 ease-in-out lg:relative lg:z-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
        `}
        style={{ background: 'linear-gradient(180deg,#1a1008 0%,#241712 65%,#1a1008 100%)' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(200,155,60,0.12)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,155,60,0.2)' }}>
                <LayoutDashboard className="w-4 h-4" style={{ color: '#C89B3C' }} />
              </div>
              <span className="font-serif text-xl font-bold" style={{ color: '#C89B3C' }}>Manager</span>
            </div>
            <p className="text-xs" style={{ color: '#7a6555' }}>Harjinder Tourist Dhaba</p>
          </div>
          {/* Close button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: '#7a6555' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Manager Profile Chip */}
        <div className="mx-4 mt-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,155,60,0.15)' }}>
            <UserCircle className="w-5 h-5" style={{ color: '#C89B3C' }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Manager</div>
            <div className="text-xs" style={{ color: '#7a6555' }}>Operational Access</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`dash-sidebar-item${activeModule === key ? ' active' : ''}`}
            >
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-6 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
          <button
            onClick={handleLock}
            className="dash-sidebar-item w-full"
            style={{ color: '#ef4444' }}
          >
            <span className="icon"><Lock className="w-5 h-5" style={{ color: '#ef4444' }} /></span>
            Lock Dashboard
          </button>
          <Link to="/" className="dash-sidebar-item">
            <span className="icon"><ArrowLeft className="w-5 h-5" /></span>
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Floating Main Menu Toggle Button (Mobile/when closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl bg-dhaba-dark text-white hover:bg-stone-800 transition-all active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Content */}
        <div className={`flex-1 ${activeModule === 'billing' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 lg:p-8 pb-8'}`}>
          <div className={`${activeModule === 'billing' ? 'h-full' : 'max-w-6xl mx-auto w-full'}`}>
            {activeModule === 'billing' ? (
              <ManagerBilling editingOrder={editingOrder} clearEditingOrder={() => setEditingOrder(null)} />
            ) : activeModule === 'orders' ? (
              <ManagerOrders onEditOrder={(order) => { setEditingOrder(order); setActiveModule('billing'); }} />
            ) : activeModule === 'stats' ? (
              <ManagerStats />
            ) : activeModule === 'revenue' ? (
              <ManagerDailyRevenue />
            ) : (
              <PrinterSettings role="manager" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
