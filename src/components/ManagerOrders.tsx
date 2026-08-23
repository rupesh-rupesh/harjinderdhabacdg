import React, { useState, useEffect, useRef } from 'react';
import { DevEmptyStateText } from './DevEmptyStateText';
import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer, Bell, ClipboardCheck, Filter, ChevronDown, ShoppingBag, Eye, Grid } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { managerPrinterService as printerService } from '../lib/printer/PrinterService';
import toast from 'react-hot-toast';
import { PrinterPermissionCard } from './PrinterPermissionCard';

export default function ManagerOrders({ onEditOrder }: { onEditOrder?: (order: any) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [generateGst, setGenerateGst] = useState(true);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  
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

    if (printerService.getConfig().type === 'browser') {

      if (receiptRef.current) {
        window.print();
      }
    } else {
      if (selectedOrder) {
        try {
          await printerService.printReceipt(selectedOrder, false, true, generateGst);
          toast.success("Receipt sent to printer");
        } catch (e: any) {
          if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
        }
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

    if (printerService.getConfig().type === 'browser') {

      toast.error("A direct USB printer connection is required to print a kitchen copy.");
    } else {
      if (selectedOrder) {
        try {
          await printerService.printReceipt(selectedOrder, false, false, generateGst);
          toast.success("KOT sent to printer");
        } catch (e: any) {
          if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
        }
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setOrders(data);
        }
      }
    } catch (e: any) {
      if (e.message !== 'Failed to fetch') {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetch('/api/storefront-data').then(res => res.json()).then(data => {
      if (data.menuItems) setMenuItems(data.menuItems);
    }).catch((e: any) => {
      if (e.message !== 'Failed to fetch') console.error(e);
    });
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: number, status: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleUpdateItemQty = async (index, change) => {
    if (!selectedOrder) return;
    try {
      const items = JSON.parse(selectedOrder.items);
      items[index].quantity += change;
      if (items[index].quantity <= 0) {
        items.splice(index, 1);
      }
      
      const newTotal = items.reduce((acc, item) => acc + ((Number(item.price) || 0) + (item.isButter ? Number(item.butterPrice) || 0 : 0)) * item.quantity, 0);
      
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
      
      const newTotal = items.reduce((acc, item) => acc + ((Number(item.price) || 0) + (item.isButter ? Number(item.butterPrice) || 0 : 0)) * item.quantity, 0);
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

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/admin/orders/${deleteConfirm}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === deleteConfirm) {
          setSelectedOrder(null);
        }
        setDeleteConfirm(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      let matchesTab = false;
      if (activeTab === 'active') matchesTab = ['pending', 'processing'].includes(order.status) || order.status === 'pending';
      else if (activeTab === 'completed') matchesTab = order.status === 'completed';
      else if (activeTab === 'cancelled') matchesTab = order.status === 'cancelled';

      const itemsText = typeof order.items === 'string' ? order.items.toLowerCase() : JSON.stringify(order.items).toLowerCase();
      const matchesSearch = itemsText.includes(searchQuery.toLowerCase()) || 
                            order.id.toString().includes(searchQuery);

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <>
      <div className="hidden">
        <ThermalReceipt order={selectedOrder} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
      </div>
      
      {showReceiptPreview && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setShowReceiptPreview(false)} />
          <div className="bg-stone-200 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Bill Preview</h3>
              <button onClick={() => setShowReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <span className="font-bold">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200">
               <div className="shadow-2xl">
                 <ThermalReceipt order={selectedOrder} includeGst={generateGst} managerName="Manager" />
               </div>
            </div>
            <div className="p-4 bg-white border-t flex flex-col gap-2">
               <button onClick={() => setShowReceiptPreview(false)} className="w-full py-3 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
               <button onClick={handlePrint} className="w-full py-3 bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center shadow-md">
                 <Printer className="w-5 h-5 mr-2" /> Print Bill
               </button>
               <button onClick={handlePrintKOT} className="w-full py-3 bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center shadow-sm">
                 <FileText className="w-5 h-5 mr-2" /> Print KOT
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <PrinterPermissionCard role="manager" onConnect={() => {}} />
        
        {/* Floating Segmented Navigation */}
        <div className="bg-stone-100/80 backdrop-blur-sm p-1.5 rounded-2xl flex gap-1 shadow-inner border border-stone-200/50">
          {[
            { id: 'active', label: 'Live Orders', icon: Bell },
            { id: 'completed', label: 'Completed Orders', icon: CheckCircle2 },
            { id: 'cancelled', label: 'Cancelled Orders', icon: XCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-dhaba-orange shadow-sm scale-100 ring-1 ring-stone-200/50'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 scale-95 opacity-80 hover:opacity-100'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-bounce-slight' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-stone-100 shadow-sm min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-4 border-stone-200 border-t-dhaba-orange rounded-full animate-spin"></div>
              <div className="text-stone-500 font-bold uppercase tracking-widest text-sm">Loading Orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-stone-50/80 backdrop-blur-sm rounded-3xl border border-dashed border-stone-200 text-center shadow-inner">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 relative">
                <Package className="w-12 h-12 text-stone-300" />
                <div className="absolute top-0 right-0 w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-2">No {activeTab} orders</h3>
              <p className="text-stone-500 font-medium max-w-sm">We couldn't find any orders matching this status. Fresh orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map(order => {
                let items = [];
                try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch (e) {}
                const tableMarker = items.find((i: any) => i.isTableMarker);
                const tableNum = tableMarker ? tableMarker.name.replace('Table ', '') : null;
                const displayItems = items.filter((i: any) => !i.isTableMarker);

                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-6 rounded-3xl border text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
                      order.status === 'completed' ? 'bg-gradient-to-br from-green-50 to-emerald-50/30 border-green-100' :
                      order.status === 'cancelled' ? 'bg-gradient-to-br from-red-50 to-rose-50/30 border-red-100' :
                      'bg-white border-stone-100 shadow-sm hover:border-dhaba-orange/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-[#FFF9EE] text-[#D4AF37]'
                        }`}>
                          {tableNum ? <Grid className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-stone-800">
                            {tableNum ? `Table ${tableNum}` : `Order #${order.id}`}
                          </div>
                          <div className="text-xs text-stone-500">
                            {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        order.status === 'completed' ? 'bg-green-500 text-white shadow-sm shadow-green-500/20' :
                        order.status === 'cancelled' ? 'bg-red-500 text-white shadow-sm shadow-red-500/20' :
                        'bg-dhaba-orange text-white shadow-sm shadow-orange-500/20 animate-pulse'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      {displayItems.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-stone-600 flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                      ))}
                      {displayItems.length > 3 && (
                        <div className="text-xs text-stone-400 font-medium pt-1">
                          +{displayItems.length - 3} more items
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-stone-100/50 flex justify-between items-center">
                      <div className="text-sm text-stone-500 font-medium">Total</div>
                      <div className={`text-lg font-bold ${order.status === 'completed' ? 'text-green-700' : order.status === 'cancelled' ? 'text-red-700' : 'text-dhaba-dark'}`}>
                        ₹{order.total}
                      </div>
                    </div>
                  </button>
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
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] relative">
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
                            ₹{((Number(item.price) || 0) + (item.isButter ? (Number(item.butterPrice) || 0) : 0)) * item.quantity}
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
                <button 
                  onClick={() => setShowReceiptPreview(true)}
                  className="w-full py-4 bg-stone-50 border border-stone-200 text-stone-700 font-bold rounded-2xl hover:bg-stone-100 hover:border-stone-300 transition-all flex items-center justify-center text-sm shadow-sm"
                >
                  <Eye className="w-4 h-4 mr-2" /> View Bill
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handlePrint} className="w-full py-4 bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-2xl hover:bg-black transition-colors flex items-center justify-center shadow-md group">
                    <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={handlePrintKOT} className="w-full py-4 bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-2xl hover:bg-stone-200 transition-colors flex items-center justify-center shadow-sm text-sm">
                    KOT
                  </button>
                </div>
              </div>

              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button 
                    onClick={() => { handleUpdateStatus(selectedOrder.id, 'cancelled'); }}
                    className="w-full py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center text-sm shadow-sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                  </button>
                  <button 
                    onClick={() => { handleUpdateStatus(selectedOrder.id, 'completed'); }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                  </button>
                </div>
              )}
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <button 
                  onClick={() => { if (onEditOrder) onEditOrder(selectedOrder); }}
                  className="w-full py-4 bg-dhaba-orange/10 text-dhaba-orange border border-dhaba-orange/20 font-bold rounded-2xl hover:bg-dhaba-orange/20 transition-all flex items-center justify-center text-sm shadow-sm"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Order
                </button>
              )}
              <div className="mt-6 flex justify-center">
                <button onClick={(e) => handleDelete(selectedOrder.id, e)} className="text-stone-400 hover:text-red-500 font-bold text-xs flex items-center transition-colors px-4 py-2 rounded-xl hover:bg-red-50">
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
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
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
