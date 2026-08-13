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
    () => sessionStorage.getItem('manager_dashboard_auth') === 'true'
  );
  const [activeModule, setActiveModule] = useState<Module>('billing');
  const [editingOrder, setEditingOrder] = useState<any>(null);
  // Sidebar starts CLOSED on all devices
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!authenticated) {
    return <DashboardAuthModal role="manager" onSuccess={() => setAuthenticated(true)} />;
  }

  const handleLock = () => {
    sessionStorage.removeItem('manager_dashboard_auth');
    setAuthenticated(false);
    toast.success('Manager Dashboard locked');
  };

  const navigate = (key: Module) => {
    setActiveModule(key);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--color-dashboard-bg, #f7f4f0)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Sidebar Overlay (all screens) ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — always slides in/out ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
          {/* Close button — always visible */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: '#7a6555' }}
          >
            <X className="w-4 h-4" />
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

        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-3 sm:px-5 py-3 shrink-0"
          style={{
            background: 'rgba(247,244,240,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #ede8e0',
            height: '56px',
          }}
        >
          {/* Left: Hamburger + Title (only show title for non-billing or small screens) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl transition-colors shrink-0"
              style={{ background: '#fff', border: '1px solid #ede8e0', color: '#241712' }}
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            {/* Show module title only when NOT in billing mode (billing has its own header inside ManagerBilling) */}
            {activeModule !== 'billing' && (
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-base sm:text-lg leading-tight truncate" style={{ color: '#241712' }}>
                  {MODULE_TITLES[activeModule]}
                </h1>
                <p className="text-xs hidden sm:block" style={{ color: '#9a8878' }}>Manager Dashboard</p>
              </div>
            )}
          </div>

          {/* Right: Manager chip + Lock — hide in billing mode as they are moved to POS header */}
          {activeModule !== 'billing' && (
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: '#fff', border: '1px solid #ede8e0' }}
              >
                <UserCircle className="w-4 h-4" style={{ color: '#C89B3C' }} />
                <span className="text-sm font-medium" style={{ color: '#241712' }}>Manager</span>
              </div>
              <button
                onClick={handleLock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            </div>
          )}
        </header>

        {/* Content — no bottom padding since no bottom nav */}
        <main className={`flex-1 overflow-y-auto ${activeModule === 'billing' ? 'p-0 overflow-hidden' : 'p-4 sm:p-6 lg:p-8'}`}>
          <div className={`${activeModule === 'billing' ? 'h-full' : 'max-w-7xl mx-auto w-full fade-in-up'}`}>
            {activeModule === 'billing' ? (
              <ManagerBilling editingOrder={editingOrder} clearEditingOrder={() => setEditingOrder(null)} />
            ) : activeModule === 'orders' ? (
              <ManagerOrders onEditOrder={(order) => { setEditingOrder(order); setActiveModule('billing'); }} />
            ) : activeModule === 'stats' ? (
              <ManagerStats />
            ) : activeModule === 'revenue' ? (
              <ManagerDailyRevenue />
            ) : (
              <PrinterSettings />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
