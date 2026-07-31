import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Package, Utensils, Grid, Search, Plus, Minus, Trash2, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, ArrowRight, Table, X, CreditCard, Printer, FileText , Eye } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { printerService } from '../lib/printer/PrinterService';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { PrinterPermissionCard } from './PrinterPermissionCard';

export default function ManagerBilling({ editingOrder, clearEditingOrder }: { editingOrder?: any, clearEditingOrder?: () => void }) {
  const [tableSelection, setTableSelection] = useState<number | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [checkoutTable, setCheckoutTable] = useState<{ num: number, order: any } | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  useEffect(() => {
    if (editingOrder) {
      let tableNum = null;
      try {
        const items = typeof editingOrder.items === 'string' ? JSON.parse(editingOrder.items) : editingOrder.items;
        const marker = items.find((i: any) => i.isTableMarker);
        if (marker) {
           const numMatch = marker.name.match(/\d+/);
           if (numMatch) tableNum = parseInt(numMatch[0]);
        }
        
        setCart(items.filter((i: any) => !i.isTableMarker));
      } catch (e) {}

      if (tableNum) {
        setTableSelection(tableNum);
        setEditingOrderId(editingOrder.id);
      }
      if (clearEditingOrder) clearEditingOrder();
    }
  }, [editingOrder]);
  const [generateGst, setGenerateGst] = useState(true);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [showCartReceiptPreview, setShowCartReceiptPreview] = useState(false);
  const cartReceiptRef = useRef<HTMLDivElement>(null);

  const handlePrintCart = () => {
    if (cartReceiptRef.current) {
      window.print();
    }
  };

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (printerService.getConfig().type === 'browser') {
      if (receiptRef.current) {
        window.print();
      }
    } else {
      if (checkoutTable?.order) {
        if (!printerService.isConnected()) {
          try {
             if (printerService.getConfig().type === 'webusb') {
                await printerService.connectWebUSB();
             } else if (printerService.getConfig().type === 'webbluetooth') {
                await printerService.connectWebBluetooth();
             }
          } catch (e: any) {
             if (e.message && !e.message.toLowerCase().includes('cancel') && !e.message.includes('permissions policy')) {
                 toast.error(e.message);
             } else if (e.message.includes('permissions policy')) {
                 toast.error('Bluetooth blocked by browser. Open in a new tab.');
             }
             return;
          }
        }
        try {
          await printerService.printReceipt(checkoutTable.order, false, true, generateGst);
          toast.success("Receipt sent to printer");
        } catch (e: any) {
          if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
        }
      }
    }
  };

  const handlePrintKOT = async () => {
    if (printerService.getConfig().type === 'browser') {
      toast.error("A direct USB printer connection is required to print a kitchen copy.");
    } else {
      if (checkoutTable?.order) {
        if (!printerService.isConnected()) {
          try {
             if (printerService.getConfig().type === 'webusb') {
                await printerService.connectWebUSB();
             } else if (printerService.getConfig().type === 'webbluetooth') {
                await printerService.connectWebBluetooth();
             }
          } catch (e: any) {
             if (e.message && !e.message.toLowerCase().includes('cancel') && !e.message.includes('permissions policy')) {
                 toast.error(e.message);
             } else if (e.message.includes('permissions policy')) {
                 toast.error('Bluetooth blocked by browser. Open in a new tab.');
             }
             return;
          }
        }
        try {
          await printerService.printReceipt(checkoutTable.order, false, false, generateGst);
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
          setActiveOrders(data.filter((o: any) => o.status === 'pending' || o.status === 'processing'));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pos-data');
        if (res.ok) {
          const ct = res.headers.get('content-type');
          if (ct && ct.includes('application/json')) {
            const data = await res.json();
            setCategories(data.categories || []);
            setMenuItems(data.menuItems || []);
            if (data.categories && data.categories.length > 0) {
              setSelectedCategory(data.categories[0].name);
            }
          }
        }
      } catch (e: any) {
        if (e.message !== 'Failed to fetch') {
          console.error("Failed to load POS data", e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCartWithOptions = (item: any, options: { isHalf?: boolean, isButter?: boolean, variantName?: string, price: number }) => {
    const cartItemId = `${item.id}-${options.isHalf ? 'half' : 'full'}-${options.isButter ? 'butter' : 'nobutter'}-${options.variantName || 'none'}`;
    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        cartItemId,
        id: item.id, 
        name: item.name, 
        price: options.price, 
        quantity: 1,
        isHalf: options.isHalf || false,
        isButter: options.isButter || false,
        variantName: options.variantName,
        butterPrice: item.butterPrice || 0
      }];
    });
    toast.success(`Added ${item.name}`);
  };

  const addToCart = (item: any) => {
    if (item.hasHalfPortion || item.hasButterOption || (item.variants && item.variants.length > 0)) {
      setSelectedItemDetail(item);
    } else {
      addToCartWithOptions(item, { price: item.price });
    }
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.cartItemId === cartItemId) {
          const newQ = i.quantity + delta;
          return { ...i, quantity: Math.max(0, newQ) };
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  }, [cart]);

  const draftOrder = {
    id: 'DRAFT',
    createdAt: new Date().toISOString(),
    items: cart,
    total: generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal
  };



  const submitOrder = async () => {
    if (cart.length === 0) return toast.error("The cart is currently empty. Please add items before proceeding.");
    if (!tableSelection) return toast.error("Please select a table to proceed");
    
    setIsSubmitting(true);
    try {
      const finalTotal = generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal;
      
      const endpoint = editingOrderId ? `/api/admin/orders/${editingOrderId}` : '/api/admin/pos/orders';
      const method = editingOrderId ? 'PUT' : 'POST';
      
      const payload: any = { total: finalTotal };
      
      if (editingOrderId) {
        const posItems = [
          { name: `Table ${tableSelection}`, price: 0, quantity: 1, isTableMarker: true },
          ...cart
        ];
        payload.items = JSON.stringify(posItems);
      } else {
        payload.tableNumber = tableSelection;
        payload.items = cart;
      }
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      
      if (res.ok) {
        try {
          if (printerService.getConfig().type !== 'browser') {
            await printerService.printReceipt(draftOrder, false, true, generateGst);
          } else {
            if (cartReceiptRef.current) {
              window.print();
            }
          }
        } catch (printErr: any) {
          toast.error(printErr.message || "Failed to print bill");
        }
        
        toast.success(editingOrderId ? `Order updated for Table ${tableSelection}` : `Order placed for Table ${tableSelection}`);
        setCart([]);
        setEditingOrderId(null);
        setTableSelection(null);
        fetchOrders();
      }
 else {
        toast.error("We were unable to save the order. Please try again.");
      }
    } catch (e) {
      toast.error("A connection error occurred. Please verify your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCat = selectedCategory ? item.category === selectedCategory : true;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  if (tableSelection === null) {
    return (
    <>
      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
        <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" forwardedRef={cartReceiptRef} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <PrinterPermissionCard onConnect={() => {}} />
      </div>

      {showCartReceiptPreview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setShowCartReceiptPreview(false)} />
          <div className="bg-stone-200 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Bill Preview (Draft)</h3>
              <button onClick={() => setShowCartReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <span className="font-bold">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200">
               <div className="shadow-2xl">
                 <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" />
               </div>
            </div>
            <div className="p-4 bg-white border-t flex flex-col gap-2">
               <button onClick={() => setShowCartReceiptPreview(false)} className="w-full py-3 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
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

      {showReceiptPreview && checkoutTable && (
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
                 <ThermalReceipt order={checkoutTable.order} includeGst={generateGst} managerName="Manager" />
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

      {checkoutTable && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col">
            <div className="p-6 border-b border-stone-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">
                    Table {checkoutTable.num} Checkout
                  </h3>
                  <div className="text-sm text-stone-500 font-medium mt-1">Order #{checkoutTable.order.id}</div>
                </div>
                <button onClick={() => setCheckoutTable(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl text-center mb-6 border border-stone-100">
                <div className="text-sm text-stone-500 font-bold uppercase tracking-wider">Total Amount</div>
                <div className="text-4xl font-bold text-dhaba-dark mt-1">₹{checkoutTable.order.total}</div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowReceiptPreview(true)}
                  className="w-full py-3 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center shadow-sm"
                >
                  <Eye className="w-5 h-5 mr-2" /> View Bill Preview
                </button>
                <div className="flex gap-2 flex-wrap mb-4">
                  <button 
                    onClick={() => {
                      if (checkoutTable) {
                        try {
                          const items = typeof checkoutTable.order.items === 'string' ? JSON.parse(checkoutTable.order.items) : checkoutTable.order.items;
                          setCart(items.filter((i: any) => !i.isTableMarker));
                        } catch (e) {}
                        setTableSelection(checkoutTable.num);
                        setEditingOrderId(checkoutTable.order.id);
                        setCheckoutTable(null);
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Grid className="w-5 h-5" /> Edit Order
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCheckoutTable(null)}
                    className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      fetch(`/api/admin/orders/${checkoutTable.order.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'completed' })
                      }).then(() => {
                        fetchOrders();
                        setTableSelection(checkoutTable.num);
                        setCheckoutTable(null);
                        toast.success(`Bill for Table ${checkoutTable.num} marked as paid.`);
                      });
                    }}
                    className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        <div className="bg-gradient-to-br from-[#FFFDF5] to-[#FDF8E7] p-8 sm:p-10 rounded-3xl shadow-sm border border-[#F2E5C5] text-center overflow-hidden mb-6">
          {/* Subtle background lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" fill="none">
            <path d="M-100 350C150 150 300 250 500 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.4"/>
            <path d="M-50 400C200 200 350 300 550 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2"/>
            <path d="M200 400C450 150 600 250 900 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.3"/>
            <path d="M300 450C550 200 700 300 1000 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2"/>
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Top Ornament */}
            <div className="flex items-center justify-center gap-1.5 mb-4 text-[#D4AF37]">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
              <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C16 6.5 10 12 0 12C10 12 16 16 16 16C16 16 22 12 32 12C22 12 16 6.5 16 0Z" fill="currentColor" />
                <path d="M16 3C16 7 13 10 7 10C13 10 16 13 16 13C16 13 19 10 25 10C19 10 16 7 16 3Z" fill="currentColor" opacity="0.6"/>
              </svg>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3B291A] mb-3 tracking-tight">Select a Table</h2>
            
            {/* Bottom line */}
            <div className="flex items-center justify-center gap-2 mb-4 mt-2">
              <div className="w-16 h-[1px] bg-[#D4AF37] opacity-50"></div>
              <div className="w-2 h-2 rotate-45 bg-[#D4AF37] opacity-80"></div>
              <div className="w-16 h-[1px] bg-[#D4AF37] opacity-50"></div>
            </div>

            <p className="text-[#5C4D40] text-lg">Choose a table to start taking an order.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
            const tableOrder = activeOrders.find(o => {
              try {
                const items = JSON.parse(o.items);
                return items.some((item: any) => item.isTableMarker && item.name === `Table ${num}`);
              } catch (e) { return false; }
            });
            const isActive = !!tableOrder;

            return (
              <button
                key={num}
                onClick={() => {
                  if (isActive) {
                    setCheckoutTable({ num, order: tableOrder });
                  } else {
                    setTableSelection(num);
                  }
                }}
                className={`aspect-square ${isActive ? 'bg-green-50 border-green-200 ring-2 ring-green-500 shadow-[0_4px_20px_rgba(34,197,94,0.15)]' : 'bg-white border-transparent shadow-[0_4px_24px_rgba(0,0,0,0.04)]'} rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group relative border`}
              >
                <div className={`w-20 h-20 rounded-full ${isActive ? 'bg-green-100 shadow-inner' : 'bg-[#FFF9EE] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'} flex items-center justify-center transition-colors relative before:content-[''] before:absolute before:inset-1.5 before:rounded-full before:border-2 before:border-[#F2E5C5] before:opacity-50`}>
                  <LayoutGrid className={`w-8 h-8 ${isActive ? 'text-green-600' : 'text-[#B8860B]'} relative z-10`} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xl font-bold ${isActive ? 'text-green-800' : 'text-[#3B291A]'}`}>Table {num}</span>
                  {isActive && (
                    <span className="text-sm font-bold text-green-700 bg-green-200/50 px-2.5 py-0.5 rounded-full ring-1 ring-green-300">
                      ₹{tableOrder.total}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  if (loading) {
    return <div className="p-12 text-center text-stone-500 animate-pulse">Loading POS system...</div>;
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 64px)', margin: '-1rem -1rem 0', padding: '0' }}>
      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
        <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" forwardedRef={cartReceiptRef} />
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
        <PrinterPermissionCard onConnect={() => {}} />
      </div>

      {showCartReceiptPreview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setShowCartReceiptPreview(false)} />
          <div className="bg-stone-200 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Bill Preview (Draft)</h3>
              <button onClick={() => setShowCartReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <span className="font-bold">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200">
               <div className="shadow-2xl">
                 <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" />
               </div>
            </div>
            <div className="p-4 bg-white border-t flex justify-end gap-2">
               <button onClick={() => setShowCartReceiptPreview(false)} className="px-4 py-2 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
               <button onClick={handlePrintCart} className="px-4 py-2 bg-dhaba-orange text-white rounded-xl hover:bg-[#e0561b] font-bold flex items-center"><Printer className="w-4 h-4 mr-2"/> Print</button>
            </div>
          </div>
        </div>
      )}

      {showReceiptPreview && checkoutTable && (
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
                 <ThermalReceipt order={checkoutTable.order} includeGst={generateGst} managerName="Manager" />
               </div>
            </div>
            <div className="p-4 bg-white border-t flex justify-end gap-2">
               <button onClick={() => setShowReceiptPreview(false)} className="px-4 py-2 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
               <button onClick={handlePrint} className="px-4 py-2 bg-dhaba-orange text-white rounded-xl hover:bg-[#e0561b] font-bold flex items-center"><Printer className="w-4 h-4 mr-2"/> Print</button>
            </div>
          </div>
        </div>
      )}
      {selectedItemDetail && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedItemDetail(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 sm:h-56 bg-stone-100">
               <button onClick={() => setSelectedItemDetail(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors z-10 shadow-sm"><X className="w-5 h-5" /></button>
               {selectedItemDetail.image ? (
                 <img src={selectedItemDetail.image} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center"><Utensils className="w-12 h-12 text-stone-300" /></div>
               )}
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-serif font-bold text-dhaba-dark mb-2">{selectedItemDetail.name}</h3>
              <p className="text-stone-500 text-sm mb-6">{selectedItemDetail.description}</p>
              
              <div className="space-y-3">
                {selectedItemDetail.variants && selectedItemDetail.variants.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {selectedItemDetail.variants.map((v: any, i: number) => (
                      <button 
                        key={i}
                        onClick={() => {
                           addToCartWithOptions(selectedItemDetail, { price: v.price, variantName: v.name });
                           setSelectedItemDetail(null);
                        }}
                        className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                      >
                        <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">{v.name}</span>
                        <span className="text-xl font-bold text-dhaba-dark">₹{v.price}</span>
                      </button>
                    ))}
                  </div>
                ) : selectedItemDetail.hasHalfPortion ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button 
                      onClick={() => { addToCartWithOptions(selectedItemDetail, { isHalf: true, price: selectedItemDetail.halfPrice }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">Half</span>
                      <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.halfPrice}</span>
                    </button>
                    <button 
                      onClick={() => { addToCartWithOptions(selectedItemDetail, { isHalf: false, price: selectedItemDetail.price }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">Full</span>
                      <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.price}</span>
                    </button>
                  </div>
                ) : selectedItemDetail.hasButterOption ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button 
                      onClick={() => { addToCartWithOptions(selectedItemDetail, { isButter: false, price: selectedItemDetail.price }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">Normal</span>
                      <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.price}</span>
                    </button>
                    <button 
                      onClick={() => { addToCartWithOptions(selectedItemDetail, { isButter: true, price: selectedItemDetail.price + (selectedItemDetail.butterPrice || 0) }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">With Butter</span>
                      <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.price + (selectedItemDetail.butterPrice || 0)}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* POS Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTableSelection(null)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Table className="w-5 h-5 text-dhaba-orange" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dhaba-dark leading-none">Table {tableSelection}</h2>
              <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Active Order</span>
            </div>
          </div>
        </div>
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none bg-stone-50 transition-shadow"
          />
        </div>
      </div>

      {/* POS Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Categories */}
        <div className="w-24 sm:w-48 bg-stone-50 border-r border-stone-200 overflow-y-auto shrink-0 flex flex-col">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-4 text-left border-l-4 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 ${
                selectedCategory === cat.name 
                  ? 'border-dhaba-orange bg-white shadow-sm' 
                  : 'border-transparent text-stone-500 hover:bg-stone-100'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Utensils className="w-5 h-5 text-stone-400" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-center sm:text-left mt-1 sm:mt-0">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Middle Column: Items */}
        <div className="flex-1 bg-white overflow-y-auto p-4 sm:p-6">
          {/* Mobile Search */}
          <div className="relative w-full mb-6 sm:hidden">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none bg-stone-50"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-dhaba-orange hover:shadow-md transition-all text-left flex flex-col group h-full"
              >
                <div className="w-full h-24 sm:h-32 bg-stone-100 relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-8 h-8 text-stone-300" /></div>
                  )}
                  {item.dietaryPreference === 'veg' ? (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded flex items-center justify-center border border-stone-200 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded flex items-center justify-center border border-stone-200 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug">{item.name}</h3>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-dhaba-orange font-bold text-sm sm:text-base">₹{item.price}</span>
                    <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center group-hover:bg-dhaba-orange group-hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-500">
                <Utensils className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                <p>No items are currently available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart */}
        <div className="w-72 lg:w-80 bg-stone-50 border-l border-stone-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-200 bg-white">
            <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-dhaba-orange" />
              Current Bill
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-3">
                <ShoppingBag className="w-12 h-12 opacity-50" />
                <p className="text-sm font-medium">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex flex-col gap-2 relative group">
                  <div className="flex justify-between items-start gap-2 pr-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-stone-800 leading-tight">{item.name}</span>
                      {(item.variantName || item.isHalf || item.isButter) && (
                        <span className="text-[10px] text-stone-500 font-medium mt-0.5 uppercase tracking-wider">
                          {item.variantName ? item.variantName : ''}
                          {item.isHalf ? ' (Half)' : ''}
                          {item.isButter ? ' (+Butter)' : ''}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-dhaba-orange shrink-0">₹{Number(item.price) * item.quantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-stone-500">₹{item.price} each</span>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1 border border-stone-100">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 rounded bg-white text-stone-500 hover:text-stone-800 shadow-sm flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 rounded bg-white text-stone-500 hover:text-stone-800 shadow-sm flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => updateQuantity(item.cartItemId, -item.quantity)}
                    className="absolute top-2 right-2 w-6 h-6 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-white border-t border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700 justify-center">
              <input 
                type="checkbox" 
                id="cart-gst-checkbox" 
                checked={generateGst}
                onChange={(e) => setGenerateGst(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-dhaba-orange focus:ring-dhaba-orange"
              />
              <label htmlFor="cart-gst-checkbox" className="cursor-pointer select-none">Generate GST Bill</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setShowCartReceiptPreview(true)}
                disabled={cart.length === 0}
                className="flex-1 py-2 px-3 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <FileText className="w-4 h-4" /> Preview
              </button>
              <button 
                onClick={handlePrintCart}
                disabled={cart.length === 0}
                className="flex-1 py-2 px-3 bg-dhaba-dark text-[var(--color-gold)] font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {generateGst && (
                <>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>CGST @2.5%</span>
                    <span>₹{(cartTotal * 0.025).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>SGST @2.5%</span>
                    <span>₹{(cartTotal * 0.025).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold text-stone-800 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="text-dhaba-orange">₹{generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal}</span>
              </div>
            </div>
            
            <button
              onClick={submitOrder}
              disabled={cart.length === 0 || isSubmitting}
              className="w-full py-3.5 bg-dhaba-orange hover:bg-[#e0561b] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Print Bill
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
