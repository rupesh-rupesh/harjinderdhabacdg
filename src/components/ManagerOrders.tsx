import React, { useState, useEffect, useRef } from 'react';
import { DevEmptyStateText } from './DevEmptyStateText';
import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer, Bell, ClipboardCheck, Filter, ChevronDown, ShoppingBag, Eye, Grid } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { printerService } from '../lib/printer/PrinterService';
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

  const filteredOrders = orders.filter(order => {
    let matchesTab = false;
    if (activeTab === 'active') matchesTab = ['pending', 'processing'].includes(order.status) || order.status === 'pending';
    else if (activeTab === 'completed') matchesTab = order.status === 'completed';
    else if (activeTab === 'cancelled') matchesTab = order.status === 'cancelled';

    const itemsText = order.items.toLowerCase();
    const matchesSearch = itemsText.includes(searchQuery.toLowerCase()) || 
                          order.id.toString().includes(searchQuery);

    return matchesTab && matchesSearch;
  });

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

      <div className="space-y-0 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <PrinterPermissionCard onConnect={() => {}} />
        {/* Top Navigation Tabs */}
        <div className="flex border-b border-stone-200">
          {[
            { id: 'active', label: 'Live Orders', icon: Bell },
            { id: 'completed', label: 'Completed Orders', icon: CheckCircle2 },
            { id: 'cancelled', label: 'Cancelled Orders', icon: XCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm sm:text-base border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-gold)] text-dhaba-dark bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-700 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 bg-white min-h-[500px]">
          {loading ? (
            <div className="text-center text-stone-500 py-12 animate-pulse">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4 bg-stone-50 rounded-2xl border border-stone-100">
              <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-700 mb-2">No {activeTab} orders currently available</h3>
              <p className="text-stone-500">There are currently no orders in this category.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
                    className={`p-5 rounded-2xl border text-left transition-all hover:-translate-y-1 hover:shadow-md ${
                      order.status === 'completed' ? 'bg-[#f4fbf7] border-[#d1f0df] shadow-[0_4px_20px_rgba(34,197,94,0.05)]' :
                      order.status === 'cancelled' ? 'bg-[#fef4f4] border-[#fce4e4] shadow-[0_4px_20px_rgba(239,68,68,0.05)]' :
                      'bg-white border-stone-200 shadow-sm'
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
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-[#FFF9EE] text-[#D4AF37]'
                      }`}>
                        {order.status.toUpperCase()}
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
            style={{ maxWidth: '520px', maxHeight: '92dvh', animation: 'popIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-white border-b border-stone-100 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Order Details</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-stone-500">#{selectedOrder.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-[#FFF9EE] text-[#D4AF37]'
                  }`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-6">
                <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                  <h3 className="font-bold text-stone-800">Items</h3>
                </div>
                <div className="divide-y divide-stone-100">
                  {(() => {
                    let items = [];
                    try { items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items; } catch (e) {}
                    return items.filter((i: any) => !i.isTableMarker).map((item: any, idx: number) => (
                      <div key={idx} className="p-4 flex justify-between items-center hover:bg-stone-50/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-bold text-stone-800">{item.name}</div>
                          {(item.variantName || item.isHalf || item.isButter) && (
                            <div className="text-xs text-stone-500 mt-0.5 flex gap-2">
                              {item.variantName && <span>{item.variantName}</span>}
                              {item.isHalf && <span>Half</span>}
                              {item.isButter && <span>+ Butter</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm font-bold text-stone-500">{item.quantity}x</div>
                          <div className="font-bold text-stone-900 w-16 text-right">
                            ₹{((Number(item.price) || 0) + (item.isButter ? (Number(item.butterPrice) || 0) : 0)) * item.quantity}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <div className="flex justify-between items-center mb-3 text-stone-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <span className="font-bold text-stone-800">Total</span>
                  <span className="text-2xl font-bold text-dhaba-orange">₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-stone-100 shrink-0">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => setShowReceiptPreview(true)}
                  className="w-full py-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-center text-lg shadow-sm"
                >
                  <Eye className="w-5 h-5 mr-2" /> View Bill Preview
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handlePrint} className="w-full py-4 bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-2xl hover:bg-black transition-colors flex items-center justify-center shadow-md">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={handlePrintKOT} className="w-full py-4 bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-2xl hover:bg-stone-200 transition-colors flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5" /> KOT
                  </button>
                </div>
              </div>

              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button 
                    onClick={() => { handleUpdateStatus(selectedOrder.id, 'cancelled'); }}
                    className="w-full py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center text-lg shadow-sm"
                  >
                    <XCircle className="w-5 h-5 mr-2" /> Cancel
                  </button>
                  <button 
                    onClick={() => { handleUpdateStatus(selectedOrder.id, 'completed'); }}
                    className="w-full py-4 bg-[#0f8b4d] text-white font-bold rounded-2xl hover:bg-[#0c7340] transition-colors shadow-md flex items-center justify-center text-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Complete
                  </button>
                </div>
              )}
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <button 
                  onClick={() => { if (onEditOrder) onEditOrder(selectedOrder); }}
                  className="w-full py-4 bg-[#fdf5f0] text-[#E85D04] font-bold rounded-2xl hover:bg-[#fce9dc] transition-colors flex items-center justify-center text-lg shadow-sm"
                >
                  <Edit className="w-5 h-5 mr-2" /> Edit Order
                </button>
              )}
              <div className="mt-4 flex justify-center">
                <button onClick={(e) => handleDelete(selectedOrder.id, e)} className="text-red-400 hover:text-red-600 font-medium text-sm flex items-center transition-colors">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Order Record
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
