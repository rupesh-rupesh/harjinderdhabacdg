import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import PanLoader from './PanLoader';
import { DevEmptyStateText } from './DevEmptyStateText';
import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer, Bell, ClipboardCheck, Filter, ChevronDown, ShoppingBag, Eye, Grid, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { adminPrinterService, managerPrinterService } from '../lib/printer/PrinterService';
import toast from 'react-hot-toast';
import { PrinterPermissionCard } from './PrinterPermissionCard';

export default function ManagerOrders({ onEditOrder, managerName = "Manager", role = 'manager' }: { onEditOrder?: (order: any) => void, managerName?: string, role?: 'admin' | 'manager' }) {
  const printerService = role === 'admin' ? adminPrinterService : managerPrinterService;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'table' | 'amount' | 'orderNo'>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [generateGst, setGenerateGst] = useState(true);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const printReceiptAction = useReactToPrint({ contentRef: receiptRef });

  
  const handlePrintSpecificOrder = async (order: any) => {
    if (printerService.isBrowserPrint()) {
      setSelectedOrder(order);
      setTimeout(() => {
        if (receiptRef.current) printReceiptAction();
      }, 100);
      return;
    }
    if (!printerService.isConnected()) {
       try {
         if (printerService.getConfig().type === 'webusb') {
            await printerService.connectWebUSB();
         } else if (printerService.getConfig().type === 'webbluetooth') {
            await printerService.connectWebBluetooth();
         }
       } catch (err: any) {
           if (err.message && !err.message.toLowerCase().includes('cancel') && !err.message.includes('permissions policy')) {
             toast.error("Please connect printer first: " + err.message);
           }
           return;
         }
    }
    try {
      await printerService.printReceipt(order, false, true, generateGst);
      toast.success("Receipt sent to printer");
    } catch (e: any) {
      if (e.message && !e.message.toLowerCase().includes('cancel')) toast.error(e.message);
    }
  };

  const handlePrint = async () => {
    // Ensure printer is connected before starting async fetch to preserve user gesture
    if (!printerService.isConnected()) {
       try {
         if (printerService.getConfig().type === 'webusb') {
            await printerService.connectWebUSB();
         } else if (printerService.getConfig().type === 'webbluetooth') {
            await printerService.connectWebBluetooth();
         }
       } catch (err: any) {
           if (err.message && !err.message.toLowerCase().includes('cancel') && !err.message.includes('permissions policy')) {
             toast.error("Please connect printer first: " + err.message);
           } else if (err.message && err.message.includes('permissions policy')) {
             toast.error('Bluetooth blocked by browser. Open in a new tab.');
           }
           return;
         }
    }

    if (printerService.isBrowserPrint()) {
      if (receiptRef.current) printReceiptAction();
      return;
    }
    if (selectedOrder) {
      try {
        await printerService.printReceipt(selectedOrder, false, true, generateGst);
        toast.success("Receipt sent to printer");
      } catch (e: any) {
        if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
      }
    }
  };

  
  const handlePrintKOT = async () => {
    // Ensure printer is connected before starting async fetch to preserve user gesture
    if (!printerService.isConnected()) {
       try {
         if (printerService.getConfig().type === 'webusb') {
            await printerService.connectWebUSB();
         } else if (printerService.getConfig().type === 'webbluetooth') {
            await printerService.connectWebBluetooth();
         }
       } catch (err: any) {
           if (err.message && !err.message.toLowerCase().includes('cancel') && !err.message.includes('permissions policy')) {
             toast.error("Please connect printer first: " + err.message);
           } else if (err.message && err.message.includes('permissions policy')) {
             toast.error('Bluetooth blocked by browser. Open in a new tab.');
           }
           return;
         }
    }

    if (selectedOrder) {
      try {
        await printerService.printReceipt(selectedOrder, false, false, generateGst);
        toast.success("KOT sent to printer");
      } catch (e: any) {
        if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
      }
    }
  };

  const { data: serverOrders = [], isLoading: loading, refetch: fetchOrders } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          return data.sort((a: any, b: any) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
        }
      }
      return [];
    },
    refetchInterval: 10000,
    staleTime: 10000,
    placeholderData: keepPreviousData
  });

  // Use the fetched orders directly
  const orders = serverOrders;

  useEffect(() => {
    fetch('/api/storefront-data').then(res => res.json()).then(data => {
      if (data.menuItems) setMenuItems(data.menuItems);
    }).catch((e: any) => {
      if (e.message !== 'Failed to fetch') console.error(e);
    });
  }, []);

  const queryClient = useQueryClient();
  const handleUpdateStatus = async (id: number | string, status: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      // Optimistically update selected order UI
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      // Optimistically update the orders list in cache
      queryClient.setQueryData(['admin_orders'], (oldOrders: any[]) => {
        if (!oldOrders) return oldOrders;
        return oldOrders.map(o => o.id === id ? { ...o, status } : o);
      });

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        fetchOrders(); // Revert on failure
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
      fetchOrders(); // Revert on failure
    }
  };


  const handleDeleteAllCancelled = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all cancelled orders? This action cannot be undone.")) return;
    
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    for (const order of cancelledOrders) {
      await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' }).catch(() => {});
    }
    toast.success("All cancelled orders deleted");
    fetchOrders();
  };

  const handleUpdateItemQty = async (index, change) => {
    if (!selectedOrder) return;
    try {
      const items = JSON.parse(selectedOrder.items);
      items[index].quantity += change;
      if (items[index].quantity <= 0) {
        items.splice(index, 1);
      }
      
      const newTotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
      
      const newOrder = { ...selectedOrder, items: JSON.stringify(items), total: newTotal };
      setSelectedOrder(newOrder);
      
      await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder.items, total: newTotal })
      });
      fetchOrders();
    } catch(e) {}
  };

  const handleAddNewItem = async (menuItem) => {
    if (!selectedOrder) return;
    try {
      const items = JSON.parse(selectedOrder.items);
      const existingIdx = items.findIndex(i => i.id === menuItem.id && !i.variantName && !i.isHalf && !i.isButter);
      if (existingIdx >= 0) {
        items[existingIdx].quantity += 1;
      } else {
        items.push({
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        });
      }
      
      const newTotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
      const newOrder = { ...selectedOrder, items: JSON.stringify(items), total: newTotal };
      setSelectedOrder(newOrder);
      
      await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder.items, total: newTotal })
      });
      fetchOrders();
      setShowAddItem(false);
    } catch(e) {}
  };

  const handleDelete = async (id: number | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const order = orders.find(o => o.id === deleteConfirm || o.localBillId === deleteConfirm);
      if (!order) return;

      // Optimistically remove the order from the list in cache
      queryClient.setQueryData(['admin_orders'], (oldOrders: any[]) => {
        if (!oldOrders) return oldOrders;
        return oldOrders.filter(o => o.id !== deleteConfirm && o.localBillId !== deleteConfirm);
      });

      if (selectedOrder && (selectedOrder.id === deleteConfirm || selectedOrder.localBillId === deleteConfirm)) {
        setSelectedOrder(null);
      }

      const res = await fetch(`/api/admin/orders/${deleteConfirm}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Order deleted");
      } else {
        toast.error("Failed to delete order");
        fetchOrders(); // Revert on failure
      }
    } catch(e) {
      console.error(e);
      fetchOrders(); // Revert on failure
    } finally {
      setDeleteConfirm(null);
    }
  };

  const activeCount = React.useMemo(() => orders.filter(o => ['pending', 'processing'].includes(o.status) || o.status === 'pending').length, [orders]);
  const completedCount = React.useMemo(() => orders.filter(o => o.status === 'completed').length, [orders]);
  const cancelledCount = React.useMemo(() => orders.filter(o => o.status === 'cancelled').length, [orders]);

  const filteredOrders = React.useMemo(() => {
    let result = orders.filter(order => {
      let matchesTab = false;
      if (activeTab === 'active') {
        matchesTab = ['pending', 'processing'].includes(order.status) || order.status === 'pending';
      } else if (activeTab === 'completed') {
        if (order.status !== 'completed') return false;
        
        if (dateFilter === 'all') matchesTab = true;
        else if (dateFilter === 'today') {
          const orderDate = new Date(order.createdAt).setHours(0,0,0,0);
          const today = new Date().setHours(0,0,0,0);
          matchesTab = orderDate === today;
        } else if (dateFilter === 'yesterday') {
          const orderDate = new Date(order.createdAt).setHours(0,0,0,0);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          matchesTab = orderDate === yesterday.setHours(0,0,0,0);
        } else if (dateFilter === 'custom' && customDate) {
          const orderDate = new Date(order.createdAt).setHours(0,0,0,0);
          const cDate = new Date(customDate).setHours(0,0,0,0);
          matchesTab = orderDate === cDate;
        } else {
          matchesTab = true;
        }
      } else if (activeTab === 'cancelled') {
        matchesTab = order.status === 'cancelled';
      }

      if (!matchesTab) return false;

      const itemsText = typeof order.items === 'string' ? order.items.toLowerCase() : JSON.stringify(order.items).toLowerCase();
      const sq = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (sq) {
        const orderAmountFloor = order.total ? Math.floor(order.total).toString() : '';
        
        if (searchType === 'all') {
          matchesSearch = itemsText.includes(sq) || 
                          order.id.toString().includes(sq) ||
                          (order.tableNumber && order.tableNumber.toLowerCase().includes(sq)) ||
                          orderAmountFloor.includes(sq);
        } else if (searchType === 'table') {
          matchesSearch = order.tableNumber && order.tableNumber.toLowerCase().includes(sq);
        } else if (searchType === 'amount') {
          matchesSearch = orderAmountFloor.includes(sq);
        } else if (searchType === 'orderNo') {
          matchesSearch = order.id.toString().includes(sq);
        }
      }

      return matchesSearch;
    });

    const sq = searchQuery.toLowerCase().trim();
    if (sq) {
      result = result.sort((a, b) => {
        let aScore = 0;
        let bScore = 0;
        
        const aAmountFloor = a.total ? Math.floor(a.total).toString() : '';
        const bAmountFloor = b.total ? Math.floor(b.total).toString() : '';

        // exact table match
        if (searchType === 'all' || searchType === 'table') {
           if (a.tableNumber && a.tableNumber.toLowerCase() === sq) aScore += 100;
           if (b.tableNumber && b.tableNumber.toLowerCase() === sq) bScore += 100;
        }
        
        // exact order no match
        if (searchType === 'all' || searchType === 'orderNo') {
           if (a.id.toString() === sq) aScore += 100;
           if (b.id.toString() === sq) bScore += 100;
        }

        // exact amount match
        if (searchType === 'all' || searchType === 'amount') {
           if (aAmountFloor === sq) aScore += 100;
           if (bAmountFloor === sq) bScore += 100;
        }

        if (aScore !== bScore) {
          return bScore - aScore;
        } else {
          return Number(a.id) - Number(b.id);
        }
      });
    }

    return result;
  }, [orders, activeTab, searchQuery, searchType, dateFilter, customDate]);

  return (
    <>
      <div className="hidden print:block">
        <ThermalReceipt order={selectedOrder} includeGst={generateGst} managerName={managerName} forwardedRef={receiptRef} />
      </div>
      
      {showReceiptPreview && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setShowReceiptPreview(false)} />
          <div className="bg-stone-200 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Bill Preview</h3>
              <button type="button" onClick={() => setShowReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <span className="font-bold">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200" data-lenis-prevent="true">
               <div className="shadow-2xl">
                 <ThermalReceipt order={selectedOrder} includeGst={generateGst} managerName={managerName} />
               </div>
            </div>
            <div className="p-4 bg-white border-t flex flex-col gap-2">
               <button type="button" onClick={() => setShowReceiptPreview(false)} className="w-full py-3 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
               <button type="button" onClick={handlePrint} className="w-full py-3 bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center shadow-md">
                 <Printer className="w-5 h-5 mr-2" /> Print Bill
               </button>
               <button type="button" onClick={handlePrintKOT} className="w-full py-3 bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center shadow-sm">
                 <FileText className="w-5 h-5 mr-2" /> Print KOT
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <PrinterPermissionCard role="manager" onConnect={() => {}} />
        
        {/* Floating Segmented Navigation */}
        <div className="bg-stone-100/80 backdrop-blur-sm p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1 shadow-inner border border-stone-200/50">
          {[
            { id: 'active', label: 'Live Orders', icon: Bell, count: activeCount },
            { id: 'completed', label: 'Completed Orders', icon: CheckCircle2 },
            { id: 'cancelled', label: 'Cancelled Orders', icon: XCircle, count: cancelledCount }
          ].map(tab => (
            <button type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 sm:px-4 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-dhaba-orange shadow-sm scale-100 ring-1 ring-stone-200/50'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 scale-95 opacity-80 hover:opacity-100'
              }`}
            >
              <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${activeTab === tab.id ? 'animate-bounce-slight' : ''}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-green-100 text-green-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Date Filter for Completed Orders */}
        {activeTab === 'completed' && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-stone-100 gap-3">
             <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {['all', 'today', 'yesterday', 'custom'].map(filter => (
                   <button type="button" 
                     key={filter} 
                     onClick={() => setDateFilter(filter as any)}
                     className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${dateFilter === filter ? 'bg-dhaba-orange text-white shadow-sm' : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                   >
                     {filter.charAt(0).toUpperCase() + filter.slice(1)}
                   </button>
                ))}
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto">
               {dateFilter === 'custom' && (
                 <div className="w-full sm:w-auto flex animate-in slide-in-from-right-4 duration-300">
                   <input 
                     type="date" 
                     value={customDate} 
                     onChange={(e) => setCustomDate(e.target.value)}
                     className="px-4 py-2 w-full sm:w-48 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-dhaba-orange focus:bg-white transition-all shadow-inner"
                   />
                 </div>
               )}
               <div className="flex bg-stone-50 border border-stone-200 rounded-xl focus-within:ring-2 focus-within:ring-dhaba-orange focus-within:border-dhaba-orange shadow-inner overflow-hidden w-full sm:w-auto">
                 <select 
                   value={searchType}
                   onChange={(e) => setSearchType(e.target.value as any)}
                   className="bg-transparent pl-3 pr-8 py-2 text-sm font-bold text-stone-600 border-r border-stone-200 focus:outline-none appearance-none"
                   style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                 >
                   <option value="all">Search All</option>
                   <option value="table">Table No</option>
                   <option value="amount">Amount</option>
                   <option value="orderNo">Order No</option>
                 </select>
                 <div className="relative w-full sm:w-48">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-stone-400" />
                   </div>
                   <input
                     type="text"
                     placeholder={searchType === 'all' ? "Search..." : `Search ${searchType}...`}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-transparent outline-none text-stone-700 placeholder-stone-400 transition-all text-sm font-medium"
                   />
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Delete All Cancelled Orders */}
        {activeTab === 'cancelled' && filteredOrders.length > 0 && (
          <div className="flex justify-end">
            <button type="button" 
              onClick={handleDeleteAllCancelled}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold shadow-sm transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Cancelled
            </button>
          </div>
        )}

        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-stone-100 shadow-sm min-h-[500px]">
          {loading ? (
            <PanLoader text="Loading Orders..." />
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-stone-50/80 backdrop-blur-sm rounded-3xl border border-dashed border-stone-200 text-center shadow-inner">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 relative">
                {searchQuery ? <Search className="w-12 h-12 text-stone-300" /> : <Package className="w-12 h-12 text-stone-300" />}
                <div className="absolute top-0 right-0 w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-2">
                {searchQuery ? `No ${searchType === 'all' ? 'orders' : searchType} found for "${searchQuery}"` : `No ${activeTab} orders`}
              </h3>
              <p className="text-stone-500 font-medium max-w-sm">
                {searchQuery ? "Try checking for typos or searching with a different term." : "We couldn't find any orders matching this status. Fresh orders will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              {searchQuery && searchType !== 'all' && (
                (() => {
                  const sq = searchQuery.toLowerCase().trim();
                  let hasExactMatch = false;
                  if (searchType === 'table') {
                    hasExactMatch = filteredOrders.some(o => o.tableNumber && o.tableNumber.toLowerCase() === sq);
                  } else if (searchType === 'amount') {
                    hasExactMatch = filteredOrders.some(o => o.total && Math.floor(o.total).toString() === sq);
                  } else if (searchType === 'orderNo') {
                    hasExactMatch = filteredOrders.some(o => o.id.toString() === sq);
                  }
                  
                  if (!hasExactMatch) {
                    return (
                      <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-sm font-bold border border-amber-200 shadow-sm flex items-center">
                        <span className="mr-2">⚠️</span>
                        No exact {searchType === 'orderNo' ? 'order number' : searchType === 'table' ? 'table number' : 'amount'} "{searchQuery}" found. Showing related partial matches below:
                      </div>
                    );
                  }
                  return null;
                })()
              )}

              {filteredOrders.map(order => {
                let items = [];
                try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch (e) {}
                const tableMarker = items.find((i: any) => i.isTableMarker);
                const tableNum = tableMarker ? tableMarker.name.replace('Table ', '') : null;
                const displayItems = items.filter((i: any) => !i.isTableMarker);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`cursor-pointer p-6 rounded-3xl border text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group flex flex-col h-full ${
                      order.status === 'completed' ? 'bg-gradient-to-br from-green-50 to-emerald-50/30 border-green-100' :
                      order.status === 'cancelled' ? 'bg-gradient-to-br from-red-50 to-rose-50/30 border-red-100' :
                      'bg-white border-stone-100 shadow-sm hover:border-dhaba-orange/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4 w-full">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-[#FFF9EE] text-[#D4AF37]'
                        }`}>
                          {tableNum ? <Grid className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="text-base font-black text-stone-800">
                            {tableNum ? `Table ${tableNum}` : `Order #${order.id}`}
                          </div>
                          <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt || order.created_at).toLocaleString('en-GB', {day:'2-digit', month:'short', hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 items-end">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-dhaba-orange animate-pulse'
                        }`}>
                          {order.status}
                        </div>
                        {order._isLocal && order.syncStatus === 'pending' && (
                           <div className="flex items-center gap-1 text-[9px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded-full" title="Waiting for network">
                             <RefreshCw className="w-3 h-3 animate-spin" /> Pending Sync
                           </div>
                        )}
                        {order._isLocal && order.syncStatus === 'failed' && (
                           <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full" title="Sync failed, will retry">
                             <CloudOff className="w-3 h-3" /> Sync Failed
                           </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 flex-1 w-full">
                      {displayItems.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-stone-600 flex justify-between items-center bg-white/40 p-2 rounded-xl">
                          <span className="font-medium flex items-center gap-2">
                            <span className="w-6 h-6 bg-stone-100 rounded-md flex items-center justify-center text-xs text-stone-500">{item.quantity}x</span>
                            {item.name}
                          </span>
                        </div>
                      ))}
                      {displayItems.length > 3 && (
                        <div className="text-xs text-stone-400 font-bold pt-1 px-2">
                          +{displayItems.length - 3} more items
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-stone-200/60 flex justify-between items-center w-full mt-auto">
                      <div>
                        <div className="text-sm text-stone-500 font-bold uppercase tracking-wider">Total Amount</div>
                        <div className={`text-xl font-black ${order.status === 'completed' ? 'text-green-700' : order.status === 'cancelled' ? 'text-red-700' : 'text-dhaba-dark'}`}>
                          ₹{Number(order.total).toFixed(2)}
                        </div>
                      </div>
                      
                      {order.status === 'completed' && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); handlePrintSpecificOrder(order); }} className="p-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl transition-colors shadow-sm" title="Print Bill">
                          <Printer className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-stone-50 w-full rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxWidth: '480px', maxHeight: '92dvh', animation: 'popIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-white border-b border-stone-100 flex justify-between items-start shrink-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dhaba-orange via-amber-500 to-yellow-400"></div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Order Details</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">#{selectedOrder.id}</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
                    selectedOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-[#FFF9EE] text-[#D4AF37]'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button type="button" 
                onClick={() => setSelectedOrder(null)}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] relative" data-lenis-prevent="true">
              {/* Zigzag top for receipt look */}
              <div className="absolute top-0 left-4 right-4 h-2 bg-repeat-x opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 3px)', backgroundSize: '12px 12px' }}></div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-6 relative">
                <div className="p-4 border-b border-dashed border-stone-200 flex justify-between items-center bg-stone-50/50">
                  <h3 className="font-black text-stone-400 uppercase tracking-widest text-xs">Order Items</h3>
                </div>
                <div className="divide-y divide-dashed divide-stone-100 p-2">
                  {(() => {
                    let items = [];
                    try { items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items; } catch (e) {}
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
                  })()}
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-dhaba-orange/20 rounded-full blur-xl"></div>
                
                <div className="flex justify-between items-center mb-3 text-stone-400 relative z-10 font-medium">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-700 relative z-10">
                  <span className="font-bold text-stone-200">Total</span>
                  <span className="text-3xl font-black text-dhaba-orange">₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-stone-100 shrink-0">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button type="button" 
                  onClick={() => setShowReceiptPreview(true)}
                  className="w-full py-4 bg-stone-50 border border-stone-200 text-stone-700 font-bold rounded-2xl hover:bg-stone-100 hover:border-stone-300 transition-all flex items-center justify-center text-sm shadow-sm"
                >
                  <Eye className="w-4 h-4 mr-2" /> View Bill
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={handlePrint} className="w-full py-4 bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-2xl hover:bg-black transition-colors flex items-center justify-center shadow-md group">
                    <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button type="button" onClick={handlePrintKOT} className="w-full py-4 bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-2xl hover:bg-stone-200 transition-colors flex items-center justify-center shadow-sm text-sm">
                    KOT
                  </button>
                </div>
              </div>

              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button type="button" 
                    onClick={() => { handleUpdateStatus(selectedOrder.id, 'cancelled'); }}
                    className="w-full py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center text-sm shadow-sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                  </button>
                  <button type="button" 
                    onClick={() => { handleUpdateStatus(selectedOrder.id, 'completed'); }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                  </button>
                </div>
              )}
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <button type="button" 
                  onClick={() => { if (onEditOrder) onEditOrder(selectedOrder); }}
                  className="w-full py-4 bg-dhaba-orange/10 text-dhaba-orange border border-dhaba-orange/20 font-bold rounded-2xl hover:bg-dhaba-orange/20 transition-all flex items-center justify-center text-sm shadow-sm"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Order
                </button>
              )}
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={(e) => handleDelete(selectedOrder.id, e)} className="text-stone-400 hover:text-red-500 font-bold text-xs flex items-center transition-colors px-4 py-2 rounded-xl hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Order Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Order</h3>
            <p className="text-stone-500 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button type="button" 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
