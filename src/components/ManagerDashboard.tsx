import React, { useState, useEffect, lazy, Suspense } from 'react';
import PanLoader from './PanLoader';
import { ShoppingCart, Package, Activity, Calendar, Printer, ArrowLeft, Lock, UserCircle, X, LayoutDashboard, ChevronLeft, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManagerBilling = lazy(() => import('./ManagerBilling'));
const ManagerOrders = lazy(() => import('./ManagerOrders'));
const ManagerStats = lazy(() => import('./ManagerStats'));
const ManagerDailyRevenue = lazy(() => import('./ManagerDailyRevenue'));
const PrinterSettings = lazy(() => import('./PrinterSettings'));
import StaffLoginModal from './StaffLoginModal';

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
  const [session, setSession] = useState<{ name: string; email: string; role: string; sessionToken: string } | null>(() => {
    try {
      const stored = localStorage.getItem('staff_session');
      if (!stored) return null;
      
      let lastActive = localStorage.getItem('staff_last_active');
      if (!lastActive) {
        lastActive = Date.now().toString();
        localStorage.setItem('staff_last_active', lastActive);
      }
      
      if (Date.now() - Number(lastActive) > 12 * 60 * 60 * 1000) {
        localStorage.removeItem('staff_session');
        localStorage.removeItem('staff_last_active');
        return null;
      }
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const authenticated = !!session;
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

  useEffect(() => {
    if (!authenticated) return;
    let lastUpdate = 0;
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) {
        localStorage.setItem('staff_last_active', now.toString());
        lastUpdate = now;
      }
    };
    updateActivity();
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [authenticated]);

  if (!authenticated) {
    return (
      <StaffLoginModal
        role="manager"
        onSuccess={(info) => {
          localStorage.setItem('staff_session', JSON.stringify(info));
          localStorage.setItem('staff_last_active', Date.now().toString());
          setSession(info);
        }}
      />
    );
  }

  const handleLock = () => {
    localStorage.removeItem('staff_session');
    localStorage.removeItem('staff_last_active');
    setSession(null);
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
        {/* Sidebar Header & Profile */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(200,155,60,0.12)' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89B3C] to-amber-600 flex items-center justify-center text-[#1a1008] font-bold text-lg shadow-[0_0_15px_rgba(200,155,60,0.4)]">
              {session?.name ? session.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">{session?.name?.toUpperCase() || 'MANAGER'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Package className="w-3.5 h-3.5 text-[#C89B3C]" />
                <p className="text-[#C89B3C] text-xs font-medium uppercase tracking-wider">{session?.role || 'Manager'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors" title="Close Sidebar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                navigate(key);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
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
            <Suspense fallback={<PanLoader text="Loading module..." />}>
            {activeModule === 'billing' ? (
              <ManagerBilling editingOrder={editingOrder} clearEditingOrder={() => setEditingOrder(null)} />
            ) : activeModule === 'orders' ? (
              <ManagerOrders onEditOrder={(order) => { setEditingOrder(order); setActiveModule('billing'); }} />
            ) : activeModule === 'stats' ? (
              <ManagerStats />
            ) : activeModule === 'revenue' ? (
              <ManagerDailyRevenue />
            ) : activeModule === 'printer' ? (
              <PrinterSettings role="manager" />
            ) : null}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
