import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PanLoader from './PanLoader';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { LayoutGrid, Package, Utensils, Grid, Search, Plus, Minus, Trash2, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, ArrowRight, Table, X, CreditCard, Printer, FileText, Eye, UserCircle, Lock, Unlock, Save, ChevronDown, Edit2, Wifi, WifiOff } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { adminPrinterService, managerPrinterService } from '../lib/printer/PrinterService';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import { PrinterPermissionCard } from './PrinterPermissionCard';
import { NoodleBowlIcon } from './CustomIcons';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmDialog } from './ConfirmDialog';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const cleanClassName = className?.replace(/text-\w+-\d+/, '') || '';

  if (name === "NoodleBowl") return <NoodleBowlIcon className={cleanClassName} />;

  let colorClass = "text-stone-300"; // default
  if (name === "Sun") colorClass = "text-yellow-500";
  if (name === "CupSoda") colorClass = "text-cyan-500";
  if (name === "Soup") colorClass = "text-orange-500";
  if (name === "ConciergeBell") colorClass = "text-stone-500";
  if (name === "UtensilsCrossed") colorClass = "text-red-500";
  if (name === "Pizza") colorClass = "text-amber-500";
  if (name === "Coffee") colorClass = "text-amber-700";
  if (name === "Utensils") colorClass = "text-stone-400";

  const IconComponent = (Icons as any)[name] || Icons.Utensils;
  return <IconComponent className={`${cleanClassName} ${colorClass}`.trim()} />;
};

const getItemFallbackIcon = (category: string) => {
  if (!category) return "Utensils";
  const lowerName = category.toLowerCase();
  if (lowerName.includes("breakfast")) return "Sun";
  if (lowerName.includes("indian") || lowerName.includes("tandoor") || lowerName.includes("bread") || lowerName.includes("roti") || lowerName.includes("naan")) return "NoodleBowl";
  if (lowerName.includes("beverage") || lowerName.includes("drink") || lowerName.includes("shake")) return "CupSoda";
  if (lowerName.includes("raita") || lowerName.includes("curd") || lowerName.includes("dal") || lowerName.includes("paneer") || lowerName.includes("sabzi")) return "Soup";
  if (lowerName.includes("thali")) return "ConciergeBell";
  if (lowerName.includes("chinese")) return "UtensilsCrossed";
  if (lowerName.includes("pizza")) return "Pizza";
  if (lowerName.includes("dessert") || lowerName.includes("sweet")) return "Coffee";
  if (lowerName.includes("snack") || lowerName.includes("starter") || lowerName.includes("appetizer")) return "Utensils";
  return "Utensils";
};

const TablePeopleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="5" cy="5" r="2" />
    <circle cx="19" cy="5" r="2" />
    <path d="M 5 9 V 15 H 8" />
    <path d="M 2 10 V 22" />
    <path d="M 19 9 V 15 H 16" />
    <path d="M 22 10 V 22" />
    <path d="M 8 13 L 16 13 L 17 21 Q 15.5 23 14 21 Q 12 23 10 21 Q 8.5 23 7 21 Z" />
  </svg>
)

export default function ManagerBilling({ editingOrder, clearEditingOrder, managerName = "Manager", role = 'manager' }: { editingOrder?: any, clearEditingOrder?: () => void, managerName?: string, role?: 'admin' | 'manager' }) {
  const printerService = role === 'admin' ? adminPrinterService : managerPrinterService;
  const [isLocked, setIsLocked] = useState(false);

  const toggleLock = () => {
    if (!isLocked) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
      setIsLocked(true);
      toast.success("Screen locked! Refresh and exit are prevented.");
    } else {
      setIsLocked(false);
      toast.success("Screen unlocked.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
          e.preventDefault();
          toast.error("Refresh is disabled while screen is locked.");
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLocked) {
        e.preventDefault();
        e.returnValue = 'Screen is locked. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handleFullscreenChange = () => {
      if (isLocked && !document.fullscreenElement) {
        toast.error("Screen is locked. Please unlock to exit full screen.");
        document.documentElement.requestFullscreen().catch(() => { });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isLocked]);


  const [showMobileCart, setShowMobileCart] = useState(false);
  const [tableSelection, setTableSelection] = useState<number | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [checkoutTable, setCheckoutTable] = useState<{ num: number, order: any } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);

  // Resize State
  const [cartWidth, setCartWidth] = useState(window.innerWidth > 1280 ? 420 : window.innerWidth > 1024 ? 384 : window.innerWidth > 640 ? 320 : 256);
  const [isResizingCart, setIsResizingCart] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingCart) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 800) {
        setCartWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingCart) {
        setIsResizingCart(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isResizingCart) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingCart]);
  useEffect(() => {
    if (editingOrder) {
      let tableNum = null;
      let newCart: any[] = [];
      try {
        const items = typeof editingOrder.items === 'string' ? JSON.parse(editingOrder.items) : editingOrder.items;
        const marker = items.find((i: any) => i.isTableMarker);
        if (marker) {
          const numMatch = marker.name.match(/\d+/);
          if (numMatch) tableNum = parseInt(numMatch[0]);
        }

        newCart = items.filter((i: any) => !i.isTableMarker);
      } catch (e) { }

      if (tableNum) {
        const saved = localStorage.getItem(`dhaba_draft_cart_${tableNum}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) newCart = parsed;
          } catch (e) { }
        }
        setCart(newCart);
        setTableSelection(tableNum);
        setEditingOrderId(editingOrder.id);
      }
      if (clearEditingOrder) clearEditingOrder();
    }
  }, [editingOrder]);
  const [gstTableStates, setGstTableStates] = useState<Record<string, boolean>>({});
  const currentTableId = tableSelection || checkoutTable?.num;
  const generateGst = currentTableId && gstTableStates[String(currentTableId)] !== undefined ? gstTableStates[String(currentTableId)] : true;
  const setGenerateGst = (val: boolean) => {
    if (currentTableId) {
      setGstTableStates(prev => ({ ...prev, [String(currentTableId)]: val }));
    }
  };
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [showCartReceiptPreview, setShowCartReceiptPreview] = useState(false);
  const cartReceiptRef = useRef<HTMLDivElement>(null);
  const printCartAction = useReactToPrint({ contentRef: cartReceiptRef });
  const receiptRef = useRef<HTMLDivElement>(null);
  const printReceiptAction = useReactToPrint({ contentRef: receiptRef });
  const cartEndRef = useRef<HTMLDivElement>(null);
  const [showGstDetails, setShowGstDetails] = useState(false);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);

  useEffect(() => {
    if (selectedItemDetail || isCustomItemModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedItemDetail, isCustomItemModalOpen]);
  const [editingCustomItem, setEditingCustomItem] = useState<{ cartItemId: string, name: string, price: number } | null>(null);

  useEffect(() => {
    if (cart.length > 0) {
      cartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cart]);

  useEffect(() => {
    if (tableSelection !== null && !isSubmitting) {
      if (cart.length > 0) {
        localStorage.setItem(`dhaba_draft_cart_${tableSelection}`, JSON.stringify(cart));
      } else {
        localStorage.removeItem(`dhaba_draft_cart_${tableSelection}`);
      }
    }
  }, [cart, tableSelection, isSubmitting]);

  const handlePrintCart = async () => {
    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
    const draftOrder = {
      id: editingOrderId || 'DRAFT',
      tableNumber: tableSelection,
      items: JSON.stringify(cart),
      createdAt: new Date().toISOString()
    };
    if (printerService.isBrowserPrint()) {
      // Pure browser path — no thermal printer configured at all
      if (cartReceiptRef.current) printCartAction();
      return;
    }
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
        } else if (e.message && e.message.includes('permissions policy')) {
          toast.error('Bluetooth blocked by browser. Open in a new tab.');
        }
        return;
      }
    }
    try {
      await printerService.printReceipt(draftOrder, false, true, generateGst);
      toast.success("Receipt sent to printer");
    } catch (e: any) {
      if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
    }
  };

  const handlePrint = async () => {
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
  };

  const handlePrintKOT = async () => {
    let orderToPrint = null;
    if (checkoutTable?.order) {
      orderToPrint = checkoutTable.order;
    } else if (cart.length > 0) {
      orderToPrint = {
        id: editingOrderId || 'DRAFT',
        tableNumber: tableSelection,
        items: JSON.stringify(cart),
        createdAt: new Date().toISOString()
      };
    }

    if (orderToPrint) {
      if (!printerService.isConnected()) {
        try {
          if (printerService.getConfig().type === 'webusb') {
            await printerService.connectWebUSB();
          } else if (printerService.getConfig().type === 'webbluetooth') {
            await printerService.connectWebBluetooth();
          }
        } catch (e: any) {
          if (window.self !== window.top && (e.name === 'SecurityError' || e.message?.includes('permissions policy'))) {
            toast.error((t) => (
              <div className="flex flex-col gap-2">
                <span>Hardware access is blocked in this preview window.</span>
                <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-black text-white text-xs text-center rounded hover:bg-gray-800" onClick={() => toast.dismiss(t.id)}>Open in New Tab</a>
              </div>
            ), { duration: 10000 });
          } else if (e.message && !e.message.toLowerCase().includes('cancel')) {
            toast.error(e.message);
          }
          return;
        }
      }
      try {
        await printerService.printReceipt(orderToPrint, false, false, generateGst);
        toast.success("KOT sent to printer");
      } catch (e: any) {
        if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }
      }
    } else {
      toast.error("Nothing to print!");
    }
  };


  const { data: serverOrders = [], refetch: fetchOrders } = useQuery({
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

  const activeOrders = serverOrders.filter((o: any) => o.status === 'pending' || o.status === 'processing');


  const { data: posData, isLoading: posLoading, refetch: refetchPosData } = useQuery({
    queryKey: ['pos_data'],
    queryFn: async () => {
      const res = await fetch('/api/pos-data');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) return await res.json();
      }
      return { categories: [], menuItems: [] };
    },
    staleTime: 60000,
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (posData) {
      let fetchedCategories = posData.categories ? [...posData.categories] : [];

      // Reorder categories: move Tandoori and Biryani/Rice after Thali
      const thaliIdx = fetchedCategories.findIndex((c: any) => c.name.toLowerCase() === 'thali');
      if (thaliIdx !== -1) {
        const tandoori = fetchedCategories.find((c: any) => c.name.toLowerCase() === 'tandoori');
        const biryani = fetchedCategories.find((c: any) => c.name.toLowerCase().includes('biryani'));
        
        fetchedCategories = fetchedCategories.filter((c: any) => 
          c.name.toLowerCase() !== 'tandoori' && 
          !c.name.toLowerCase().includes('biryani')
        );
        
        const newThaliIdx = fetchedCategories.findIndex((c: any) => c.name.toLowerCase() === 'thali');
        const toInsert = [tandoori, biryani].filter(Boolean);
        fetchedCategories.splice(newThaliIdx + 1, 0, ...toInsert);
      }

      setCategories(fetchedCategories);
      setMenuItems(posData.menuItems || []);
      if (fetchedCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(fetchedCategories[0].name);
      }
      setLoading(false);
    }
  }, [posData]);

  const addToCartWithOptions = (item: any, options: { isHalf?: boolean, isButter?: boolean, variantName?: string, price: number }) => {
    const cartItemId = `${item.id}-${options.isHalf ? 'half' : 'full'}-${options.isButter ? 'butter' : 'nobutter'}-${options.variantName || 'none'}`;

    // Calculate new quantity for the toast
    const existingItem = cart.find(i => i.cartItemId === cartItemId);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: existing.quantity + 1 } : i);
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
        butterPrice: item.butterPrice || 0,
        isCustom: item.isCustom || false
      }];
    });
    toast.success(`Added ${item.name} x${newQuantity}`, { id: cartItemId });
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



  const submitOrder = async (shouldPrint: boolean = true) => {
    if (cart.length === 0) return toast.error("The cart is currently empty. Please add items before proceeding.");
    if (!tableSelection) return toast.error("Please select a table to proceed");

    setIsSubmitting(true);
    try {
      const finalTotal = generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal;

      const posItems = [
        { name: `Table ${tableSelection}`, price: 0, quantity: 1, isTableMarker: true },
        ...cart
      ];

      let success = false;
      let orderId = editingOrderId;
      let newOrderObj: any = null;

      try {
        if (editingOrderId) {
          const payload = { total: finalTotal, items: JSON.stringify(posItems) };
          const res = await fetch(`/api/admin/orders/${editingOrderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to update order");
          success = true;
          toast.success(`Order updated for Table ${tableSelection}`);
        } else {
          const payload = {
            tableNumber: tableSelection,
            items: cart, // Items without table marker for server route
            total: finalTotal
          };
          const res = await fetch('/api/admin/pos/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to create order");
          newOrderObj = await res.json();
          orderId = newOrderObj.id;
          success = true;
          toast.success(`Order placed for Table ${tableSelection}`);
        }
      } catch (networkErr: any) {
        toast.error("Network issue. Saving bill locally (Pending Sync).");
        success = true;
        const payload = editingOrderId
          ? { id: editingOrderId, action: 'PUT', payload: { total: finalTotal, items: JSON.stringify(posItems) } }
          : { id: 'local-' + Date.now(), action: 'POST', payload: { tableNumber: tableSelection, items: cart, total: finalTotal } };

        const pending = JSON.parse(localStorage.getItem('dhaba_pending_orders') || '[]');
        pending.push(payload);
        localStorage.setItem('dhaba_pending_orders', JSON.stringify(pending));

        if (!editingOrderId) {
          newOrderObj = { id: payload.id, tableNumber: tableSelection, items: JSON.stringify(posItems), total: finalTotal, createdAt: new Date().toISOString() };
          orderId = newOrderObj.id;
        }
      }

      if (success) {
        if (shouldPrint) {
          try {
            const printOrder = newOrderObj
              ? { ...newOrderObj, tableNumber: tableSelection, items: JSON.stringify(posItems) }
              : { id: orderId, items: JSON.stringify(posItems), tableNumber: tableSelection, createdAt: new Date().toISOString() };

          if (printerService.isBrowserPrint()) {
            // Pure browser path — no thermal printer configured
            draftOrder.id = String(printOrder.id);
            if (cartReceiptRef.current) printCartAction();
          } else {
            if (!printerService.isConnected()) {
              if (printerService.getConfig().type === 'webusb') await printerService.connectWebUSB();
              else if (printerService.getConfig().type === 'webbluetooth') await printerService.connectWebBluetooth();
            }
            await printerService.printReceipt(printOrder, false, true, generateGst);
          }
          } catch (printErr: any) {
            toast.error(printErr.message || "Failed to print bill");
          }
        }

        localStorage.removeItem(`dhaba_draft_cart_${tableSelection}`);
        setCart([]);
        if (editingOrderId) { setEditingOrderId(null); clearEditingOrder?.(); }
        setTableSelection(null);
        fetchOrders();
      }
    } catch (e: any) {
      toast.error(e.message || "A connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Global search: If there is a search query, ignore the category filter
      if (searchQuery.trim() !== '') {
        return matchesSearch;
      }

      const matchesCat = selectedCategory ? item.category === selectedCategory : true;
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  if (tableSelection === null) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-12" data-lenis-prevent="true">
        <div className="hidden print:block">
          <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName={managerName} forwardedRef={receiptRef} />
          <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName={managerName} forwardedRef={cartReceiptRef} />
        </div>

        {confirmDialog && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

        <div className="max-w-7xl mx-auto mt-2 mb-6">
          <PrinterPermissionCard role="manager" onConnect={() => { }} />
        </div>

        {showCartReceiptPreview && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setShowCartReceiptPreview(false)} />
            <div className="bg-stone-200 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 bg-white border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Bill Preview (Draft)</h3>
                <button type="button" onClick={() => setShowCartReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <span className="font-bold">&times;</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200" data-lenis-prevent="true">
                <div className="shadow-2xl">
                  <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName={managerName} />
                </div>
              </div>
              <div className="p-4 bg-white border-t flex flex-col gap-2">
                <button type="button" onClick={() => setShowCartReceiptPreview(false)} className="w-full py-3 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
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

        {showReceiptPreview && checkoutTable && (
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
                  <ThermalReceipt order={checkoutTable.order} includeGst={generateGst} managerName={managerName} />
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

        {checkoutTable && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 flex flex-col border border-stone-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-br from-[#2b1f15] to-[#1a120b] p-6 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#e8ba7d]/20 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-dhaba-orange/20 to-transparent rounded-full blur-2xl pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center text-[#e8ba7d] border border-white/10 shadow-xl">
                        <Table className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#e8ba7d] font-bold mb-1 opacity-80">Active Session</div>
                        <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-serif drop-shadow-md">
                          Table {checkoutTable.num}
                        </h3>
                      </div>
                    </div>
                    <div className="text-sm text-stone-300 font-medium mt-5 flex items-center gap-2.5 bg-white/5 w-fit px-3.5 py-1.5 rounded-full border border-white/10 shadow-inner backdrop-blur-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                      </span>
                      <span className="font-mono tracking-wider">Order #{checkoutTable.order.id}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setCheckoutTable(null)} className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 rounded-full transition-all duration-300 text-stone-300 backdrop-blur-md border border-white/10 group shadow-lg">
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gradient-to-br from-[#FFFDF5] to-[#FDF8E7] p-6 rounded-2xl text-center mb-6 border border-[#F2E5C5] shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 text-[#D4AF37] opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <CreditCard className="w-32 h-32" />
                  </div>
                  <div className="text-xs text-[#5C4D40] font-bold uppercase tracking-[0.2em] mb-1">Total Amount Due</div>
                  <div className="text-5xl font-black text-[#3B291A] tracking-tighter">₹{checkoutTable.order.total}</div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button"
                      onClick={() => setShowReceiptPreview(true)}
                      className="py-3 px-2 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-colors flex flex-col items-center justify-center shadow-sm gap-1.5"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="text-xs uppercase tracking-wider">Preview Bill</span>
                    </button>
                    <button type="button"
                      onClick={handlePrint}
                      className="py-3 px-2 bg-gradient-to-br from-dhaba-dark to-black text-[var(--color-gold)] border border-black font-bold rounded-xl hover:brightness-110 transition-all flex flex-col items-center justify-center shadow-md gap-1.5"
                    >
                      <Printer className="w-5 h-5" />
                      <span className="text-xs uppercase tracking-wider">Print Bill</span>
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <button type="button"
                      onClick={() => {
                        if (checkoutTable) {
                          let newCart: any[] = [];
                          try {
                            const items = typeof checkoutTable.order.items === 'string' ? JSON.parse(checkoutTable.order.items) : checkoutTable.order.items;
                            newCart = items.filter((i: any) => !i.isTableMarker);
                          } catch (e) { }

                          const saved = localStorage.getItem(`dhaba_draft_cart_${checkoutTable.num}`);
                          if (saved) {
                            try {
                              const parsed = JSON.parse(saved);
                              if (parsed && parsed.length > 0) newCart = parsed;
                            } catch (e) { }
                          }

                          setCart(newCart);
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
                    <button type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Cancel Order',
                          message: 'Are you sure you want to cancel this order?',
                          onConfirm: async () => {
                            try {
                              const res = await fetch(`/api/admin/orders/${checkoutTable.order.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'cancelled' })
                              });
                              if (!res.ok) throw new Error("Failed to cancel order");

                              fetchOrders();
                              setTableSelection(checkoutTable.num);
                              setCheckoutTable(null);
                              setGenerateGst(true);
                              toast.success(`Order for Table ${checkoutTable.num} cancelled.`);
                            } catch (e: any) {
                              toast.error(e.message || "Failed to cancel order");
                            }
                          }
                        });
                      }}
                      className="flex-1 py-3 px-4 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Cancel Order
                    </button>
                    <button type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Mark as Paid',
                          message: 'Are you sure you want to mark this bill as paid?',
                          onConfirm: async () => {
                            try {
                              const res = await fetch(`/api/admin/orders/${checkoutTable.order.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'completed' })
                              });
                              if (!res.ok) throw new Error("Failed to mark as paid");

                              fetchOrders();
                              setTableSelection(checkoutTable.num);
                              setCheckoutTable(null);
                              setGenerateGst(true);
                              toast.success(`Bill for Table ${checkoutTable.num} marked as paid.`);
                            } catch (e: any) {
                              toast.error(e.message || "Failed to mark order as paid");
                            }
                          }
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
        <div className="relative bg-gradient-to-br from-[#FFFDF5] to-[#FDF8E7] p-6 sm:p-8 rounded-3xl shadow-sm border border-[#F2E5C5] overflow-hidden mb-8 flex flex-col xl:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
          {/* Subtle background lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" fill="none">
            <path d="M-100 350C150 150 300 250 500 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.4" />
            <path d="M-50 400C200 200 350 300 550 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2" />
            <path d="M200 400C450 150 600 250 900 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M300 450C550 200 700 300 1000 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2" />
          </svg>

          <div className="relative z-10 flex flex-col items-center xl:items-start text-center xl:text-left">
            {/* Top Ornament */}
            <div className="flex items-center justify-center xl:justify-start gap-1.5 mb-2 text-[#D4AF37]">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37] xl:hidden"></div>
              <svg width="24" height="12" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C16 6.5 10 12 0 12C10 12 16 16 16 16C16 16 22 12 32 12C22 12 16 6.5 16 0Z" fill="currentColor" />
                <path d="M16 3C16 7 13 10 7 10C13 10 16 13 16 13C16 13 19 10 25 10C19 10 16 7 16 3Z" fill="currentColor" opacity="0.6" />
              </svg>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37] xl:hidden"></div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3B291A] mb-2 tracking-tight">Select a Table</h2>
            <p className="text-[#5C4D40] text-sm sm:text-lg">Choose a table to start taking an order.</p>
          </div>

          <div className="relative z-10 flex flex-wrap justify-center gap-2 sm:gap-3 bg-white/40 p-2 sm:p-3 rounded-2xl backdrop-blur-sm border border-[#E3C77D]/20 shadow-inner">
            <button type="button"
              onClick={() => {
                setSearchQuery('');
                const loadingToast = toast.loading("Refreshing & Fetching data...");
                Promise.all([
                  fetchOrders(),
                  refetchPosData()
                ]).then(() => {
                  toast.dismiss(loadingToast);
                  toast.success("Page refreshed and data updated!");
                });
              }}
              title="Refresh Orders"
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-stone-50 border border-[#E3C77D]/40 rounded-xl shadow-sm text-[#5C4D40] transition-all flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
            >
              <Icons.RefreshCw className="w-4 h-4" />
              <span className="hidden sm:block">Refresh</span>
            </button>

            <button type="button"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => { });
                } else {
                  document.exitFullscreen().catch(() => { });
                }
              }}
              title="Toggle Fullscreen"
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-stone-50 border border-[#E3C77D]/40 rounded-xl shadow-sm text-[#5C4D40] transition-all flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
            >
              <Icons.Maximize className="w-4 h-4" />
              <span className="hidden sm:block">Fullscreen</span>
            </button>
            <button type="button"
              onClick={toggleLock}
              title={isLocked ? "Unlock Screen" : "Lock Screen"}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm border ${isLocked
                  ? 'bg-dhaba-orange/10 hover:bg-dhaba-orange/20 border-dhaba-orange text-dhaba-orange'
                  : 'bg-white hover:bg-stone-50 border-[#E3C77D]/40 text-[#5C4D40]'
                }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span className="hidden sm:block">{isLocked ? 'Locked' : 'Lock'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
            const tableOrder = activeOrders.find(o => {
              try {
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                return items.some((item: any) => item.isTableMarker && item.name === `Table ${num}`);
              } catch (e) { return false; }
            });
            const isActive = !!tableOrder;

            return (
              <button type="button"
                key={num}
                onClick={() => {
                  if (isActive) {
                    setCheckoutTable({ num, order: tableOrder });
                  } else {
                    const saved = localStorage.getItem(`dhaba_draft_cart_${num}`);
                    if (saved) {
                      try {
                        const parsed = JSON.parse(saved);
                        if (parsed && parsed.length > 0) {
                          setCart(parsed);
                        } else {
                          setCart([]);
                        }
                      } catch (e) { setCart([]); }
                    } else {
                      setCart([]);
                    }
                    setTableSelection(num);
                  }
                }}
                className={`aspect-[4/3] rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group relative border overflow-hidden ${isActive
                  ? 'bg-green-100 shadow-md hover:shadow-lg hover:-translate-y-1 animate-rgb-glow'
                  : 'bg-white/80 backdrop-blur-md border-stone-200 shadow-sm hover:shadow-xl hover:border-dhaba-orange/50 hover:bg-white hover:-translate-y-1'
                  }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                  ? 'bg-green-200 shadow-inner'
                  : 'bg-stone-50 group-hover:bg-dhaba-orange/10 group-hover:scale-110'
                  }`}>
                  <TablePeopleIcon className={`w-8 h-8 ${isActive ? 'text-green-700' : 'text-stone-400 group-hover:text-dhaba-orange'
                    }`} />
                </div>
                <div className="flex flex-col items-center gap-0.5 relative z-10">
                  <span className={`text-lg font-black tracking-tight ${isActive ? 'text-green-950' : 'text-stone-700'
                    }`}>Table {num}</span>
                  {isActive && (
                    <span className="text-sm sm:text-base font-black text-white bg-green-500 px-3 py-0.5 rounded-full shadow-md mt-1 border border-green-400">
                      ₹{tableOrder.total}
                    </span>
                  )}
                </div>

                {isActive && (
                  <button type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Clear Bill',
                        message: `Are you sure you want to clear the bill for Table ${num}?`,
                        onConfirm: async () => {
                          try {
                            const res = await fetch(`/api/admin/orders/${tableOrder.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'cancelled' })
                            });
                            if (!res.ok) throw new Error("Failed to clear bill");

                            fetchOrders();
                            toast.success(`Bill for Table ${num} cleared.`);
                          } catch (e: any) {
                            toast.error(e.message || "Failed to clear bill");
                          }
                        }
                      });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-100/90 hover:bg-red-500 text-red-600 hover:text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm z-20 backdrop-blur-sm"
                    title="Clear Bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return <PanLoader text="Loading POS system..." />;
  }

  return (
    <div className="flex" style={{ height: 'calc(100dvh - 56px)', margin: '0', padding: '0' }}>
      <div className="hidden print:block">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName={managerName} forwardedRef={receiptRef} />
        <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName={managerName} forwardedRef={cartReceiptRef} />
      </div>

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <PrinterPermissionCard role="manager" onConnect={() => { }} />

        {showCartReceiptPreview && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setShowCartReceiptPreview(false)} />
            <div className="bg-stone-200 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 bg-white border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Bill Preview (Draft)</h3>
                <button type="button" onClick={() => setShowCartReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <span className="font-bold">&times;</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200" data-lenis-prevent="true">
                <div className="shadow-2xl">
                  <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName={managerName} />
                </div>
              </div>
              <div className="p-4 bg-white border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowCartReceiptPreview(false)} className="px-4 py-2 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
                <button type="button" onClick={handlePrintCart} className="px-4 py-2 bg-dhaba-orange text-white rounded-xl hover:bg-[#e0561b] font-bold flex items-center"><Printer className="w-4 h-4 mr-2" /> Print</button>
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
                <button type="button" onClick={() => setShowReceiptPreview(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <span className="font-bold">&times;</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200" data-lenis-prevent="true">
                <div className="shadow-2xl">
                  <ThermalReceipt order={checkoutTable.order} includeGst={generateGst} managerName={managerName} />
                </div>
              </div>
              <div className="p-4 bg-white border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowReceiptPreview(false)} className="px-4 py-2 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
                <button type="button" onClick={handlePrint} className="px-4 py-2 bg-dhaba-orange text-white rounded-xl hover:bg-[#e0561b] font-bold flex items-center"><Printer className="w-4 h-4 mr-2" /> Print</button>
              </div>
            </div>
          </div>
        )}
        {selectedItemDetail && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedItemDetail(null)} data-lenis-prevent="true">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="relative h-48 sm:h-56 bg-stone-100">
                <button type="button" onClick={() => setSelectedItemDetail(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors z-10 shadow-sm"><X className="w-5 h-5" /></button>
                {selectedItemDetail.image ? (
                  <img src={selectedItemDetail.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Utensils className="w-12 h-12 text-stone-300" /></div>
                )}
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto flex-1" data-lenis-prevent="true">
                <h3 className="text-2xl font-serif font-bold text-dhaba-dark mb-2">{selectedItemDetail.name}</h3>
                <p className="text-stone-500 text-sm mb-6">{selectedItemDetail.description}</p>

                <div className="space-y-3">
                  {selectedItemDetail.variants && selectedItemDetail.variants.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {selectedItemDetail.variants.map((v: any, i: number) => (
                        <button type="button"
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
                      <button type="button"
                        onClick={() => { addToCartWithOptions(selectedItemDetail, { isHalf: true, price: selectedItemDetail.halfPrice }); setSelectedItemDetail(null); }}
                        className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                      >
                        <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">Half</span>
                        <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.halfPrice}</span>
                      </button>
                      <button type="button"
                        onClick={() => { addToCartWithOptions(selectedItemDetail, { isHalf: false, price: selectedItemDetail.price }); setSelectedItemDetail(null); }}
                        className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                      >
                        <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">Full</span>
                        <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.price}</span>
                      </button>
                    </div>
                  ) : selectedItemDetail.hasButterOption ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button type="button"
                        onClick={() => { addToCartWithOptions(selectedItemDetail, { isButter: false, price: selectedItemDetail.price }); setSelectedItemDetail(null); }}
                        className="group relative flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-dhaba-orange hover:shadow-md transition-all"
                      >
                        <span className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-1">Normal</span>
                        <span className="text-xl font-bold text-dhaba-dark">₹{selectedItemDetail.price}</span>
                      </button>
                      <button type="button"
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

        {(isCustomItemModalOpen || editingCustomItem) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => { setIsCustomItemModalOpen(false); setEditingCustomItem(null); }} />
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="font-black text-xl text-stone-800">{editingCustomItem ? 'Edit Custom Item' : 'Add Custom Item'}</h3>
                <button type="button" onClick={() => { setIsCustomItemModalOpen(false); setEditingCustomItem(null); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const name = (e.target as any).itemName.value;
                const price = parseFloat((e.target as any).itemPrice.value);
                if (name && price >= 0) {
                  if (editingCustomItem) {
                    setCart(prev => prev.map(i => i.cartItemId === editingCustomItem.cartItemId ? { ...i, name, price } : i));
                  } else {
                    const customItem = {
                      id: 'custom-' + Date.now(),
                      name,
                      price,
                      isCustom: true
                    };
                    addToCartWithOptions(customItem, { price });
                  }
                  setIsCustomItemModalOpen(false);
                  setEditingCustomItem(null);
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Item Name</label>
                  <input required name="itemName" defaultValue={editingCustomItem?.name || ''} type="text" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none font-medium text-stone-800" placeholder="e.g. Extra Chutney" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Amount (₹)</label>
                  <input required name="itemPrice" defaultValue={editingCustomItem?.price || ''} type="number" min="0" step="1" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none font-medium text-stone-800" placeholder="0" />
                </div>
                <button type="submit" className="w-full py-4 bg-stone-900 hover:bg-black text-white font-black rounded-xl transition-all shadow-md hover:shadow-lg mt-2">
                  {editingCustomItem ? 'Save Changes' : 'Add to Cart'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* POS Header — responsive layout ensuring icons are always visible */}
        <div className="bg-white border-b border-stone-200 px-2 sm:px-5 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-3 shrink-0 relative w-full overflow-hidden">
          {/* Left: back + table name */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button type="button"
              onClick={() => setTableSelection(null)}
              className="p-1.5 sm:p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Table className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dhaba-orange" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm sm:text-xl font-bold text-dhaba-dark leading-none truncate max-w-[70px] sm:max-w-[200px]">Table {tableSelection}</h2>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[9px] sm:text-[10px] text-green-600 font-bold uppercase tracking-wider hidden sm:inline">Active Table</span>
                  <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider sm:hidden">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search (Flexible width) */}
          <div className="flex-1 flex justify-center min-w-[32px] max-w-md px-1 sm:px-4">
            <style dangerouslySetInnerHTML={{
              __html: `
            @keyframes border-dance {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .rgb-border-wrapper {
              background: linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ff0000);
              background-size: 300% 300%;
              animation: border-dance 4s linear infinite;
              padding: 1px;
              border-radius: 0.75rem;
            }
          `}} />
            <div className="relative w-full rgb-border-wrapper">
              <div className="relative bg-stone-50 rounded-[11px] h-full flex items-center min-w-[30px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 sm:pl-9 pr-1 sm:pr-4 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-transparent outline-none rounded-[11px] placeholder-stone-400 focus:w-full transition-all duration-300 truncate"
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">

            <button type="button"
              onClick={() => {
                refetchPosData();
                fetchOrders();
                toast.success("Menu & Orders Refreshed");
              }}
              title="Refresh Data"
              className={`p-1.5 sm:p-2 text-stone-400 hover:text-dhaba-orange hover:bg-orange-50 rounded-xl transition-colors ${posLoading ? 'animate-spin text-dhaba-orange' : ''}`}
            >
              <Icons.RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button type="button"
              onClick={() => {
                if (cart.length > 0) {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Clear Bill',
                    message: editingOrderId ? 'Are you sure you want to clear this bill? This will cancel the active order for this table.' : 'Are you sure you want to clear the entire bill?',
                    onConfirm: async () => {
                      if (editingOrderId) {
                        try {
                          const res = await fetch(`/api/admin/orders/${editingOrderId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'cancelled' })
                          });
                          if (!res.ok) throw new Error("Failed to clear bill");

                          fetchOrders();
                          setCart([]);
                          setEditingOrderId(null);
                          setTableSelection(null);
                          localStorage.removeItem(`dhaba_draft_cart_${tableSelection}`);
                          toast.success(`Bill cleared and order cancelled.`);
                        } catch (e: any) {
                          toast.error(e.message || "Failed to clear bill");
                        }
                      } else {
                        setCart([]);
                        if (tableSelection) {
                          localStorage.removeItem(`dhaba_draft_cart_${tableSelection}`);
                        }
                        setTableSelection(null);
                        toast.success(`Bill cleared.`);
                      }
                    }
                  });
                }
              }}
              disabled={cart.length === 0}
              title="Clear Bill"
              className="p-1.5 sm:p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button type="button"
              onClick={() => {
                if (isLocked) {
                  toast.error("Please unlock the screen first.");
                  return;
                }
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => { });
                } else {
                  document.exitFullscreen().catch(() => { });
                }
              }}
              title="Toggle Fullscreen"
              className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <Icons.Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button type="button"
              onClick={() => setShowMobileCart(true)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors sm:hidden relative"
            >
              <Icons.ChevronLeft className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-dhaba-orange rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>

        {/* POS Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Column: Categories — floating pills look */}
          <div className="w-24 sm:w-48 bg-stone-50 border-r border-stone-200 overflow-y-auto shrink-0 flex flex-col p-2 sm:p-4 gap-2" data-lenis-prevent="true">
            {categories.map(cat => (
              <button type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-2 sm:p-3 text-left transition-all flex flex-col items-center sm:flex-row sm:items-center gap-2 rounded-2xl ${selectedCategory === cat.name
                  ? 'bg-white shadow-sm border border-stone-200 ring-1 ring-dhaba-orange/20'
                  : 'border border-transparent text-stone-500 hover:bg-stone-200/50 hover:border-stone-200'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all ${selectedCategory === cat.name ? 'bg-dhaba-orange/10' : 'bg-stone-100'}`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className={`w-5 h-5 ${selectedCategory === cat.name ? 'text-dhaba-orange' : 'text-stone-400'}`} />
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider text-center sm:text-left mt-1 sm:mt-0 ${selectedCategory === cat.name ? 'text-dhaba-orange' : 'text-stone-600'}`}>{cat.name}</span>
              </button>
            ))}
            <button type="button"
              onClick={() => setIsCustomItemModalOpen(true)}
              className="p-2 sm:p-3 text-left transition-all flex flex-col items-center sm:flex-row sm:items-center gap-2 rounded-2xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-100 hover:border-dhaba-orange hover:text-dhaba-orange group mt-2"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all bg-stone-100 group-hover:bg-dhaba-orange/10">
                <Plus className="w-5 h-5 text-stone-400 group-hover:text-dhaba-orange" />
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-center sm:text-left mt-1 sm:mt-0 text-stone-600 group-hover:text-dhaba-orange">Custom Item</span>
            </button>
          </div>

          {/* Middle Column: Items — no separate mobile search since search is in header */}
          <div className="flex-1 bg-[#f8f9fa] overflow-y-auto p-4 sm:p-6" data-lenis-prevent="true">
            <div
              className="grid gap-4 sm:gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(max(140px, calc((100% - 48px) / 3)), 1fr))' }}
            >
              {filteredItems.map(item => (
                <button type="button"
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white border border-stone-100 rounded-3xl overflow-hidden hover:border-dhaba-orange/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col group h-full shadow-sm"
                >
                  <div className="w-full h-28 sm:h-32 bg-stone-50 relative overflow-hidden p-2">
                    <div className="w-full h-full rounded-2xl overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100 group-hover:bg-stone-200 transition-colors duration-500">
                          <DynamicIcon name={getItemFallbackIcon(item.category)} className="w-10 h-10 text-stone-300 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                    </div>
                    {item.dietaryPreference === 'veg' ? (
                      <div className="absolute top-4 right-4 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center border border-green-200 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center border border-red-200 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="text-sm sm:text-base font-black text-stone-800 leading-tight group-hover:text-dhaba-orange transition-colors">{item.name}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-stone-900 font-black text-lg">₹{item.price}</span>
                      <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center group-hover:bg-dhaba-orange group-hover:text-white transition-all duration-300 group-hover:rotate-90 shadow-sm">
                        <Plus className="w-4 h-4" />
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

            {/* Floating Cart Button for Mobile */}
            {cart.length > 0 && !showMobileCart && (
              <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-4">
                <button type="button"
                  onClick={() => setShowMobileCart(true)}
                  className="w-full bg-dhaba-orange text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>View Cart</span>
                    <Icons.ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Right Column: Current Bill */}
      <div
        className={`bg-white border-l border-stone-100 flex flex-col shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-50 fixed sm:relative top-0 bottom-0 right-0 h-full transition-transform duration-300 ease-in-out ${showMobileCart ? 'translate-x-0 w-full' : 'translate-x-full sm:translate-x-0 sm:w-auto'}`}
        style={window.innerWidth < 640 ? {} : { width: `${cartWidth}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 hover:bg-dhaba-orange/10 cursor-col-resize z-50 flex items-center justify-center transition-colors -translate-x-1.5 group/resizer"
          onMouseDown={() => setIsResizingCart(true)}
        >
          <div className={`w-1 h-12 rounded-full transition-colors ${isResizingCart ? 'bg-dhaba-orange' : 'bg-stone-300 group-hover/resizer:bg-dhaba-orange/50'}`} />
        </div>

        <div className="px-4 py-3 border-b border-stone-100 bg-white shadow-sm relative z-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowMobileCart(false)} className="p-1.5 -ml-2 mr-1 sm:hidden hover:bg-stone-100 rounded-lg text-stone-500">
               <Icons.ChevronRight className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-dhaba-orange/10 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-dhaba-orange" />
              </div>
              Current Bill
            </h3>
          </div>
          <div className="flex items-center gap-2 pr-1">
            <button type="button" onClick={toggleLock} title={isLocked ? "Unlock Screen" : "Lock Screen"} className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${isLocked ? 'text-dhaba-orange bg-dhaba-orange/10' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}>
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
            <button type="button" onClick={() => setShowCartReceiptPreview(true)} disabled={cart.length === 0} title="Preview Bill" className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50">
              <Eye className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => submitOrder(false)} disabled={cart.length === 0 || isSubmitting} title="Save Bill" className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50">
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa] relative z-10" data-lenis-prevent="true">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-stone-400">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="bg-white p-3.5 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-2 relative group hover:shadow-md hover:border-stone-200 transition-all">
                <div className="flex justify-between items-start gap-2 pr-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-stone-800 leading-tight pr-6">{item.name}</span>
                    {(item.variantName || item.isHalf || item.isButter) && (
                      <div className="flex gap-1.5 mt-1">
                        {item.variantName && <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{item.variantName}</span>}
                        {item.isHalf && <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Half</span>}
                        {item.isButter && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">+Butter</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-base font-black text-stone-900 shrink-0">₹{Number(item.price) * (Number(item.quantity) || 1)}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-stone-100">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center">
                    ₹{item.price} EA
                  </span>
                  <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-1 border border-stone-100 shadow-inner">
                    <button type="button"
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-stone-600 hover:text-stone-900 hover:shadow shadow-sm flex items-center justify-center transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCart(prev => prev.map(i => i.cartItemId === item.cartItemId ? { ...i, quantity: isNaN(val) ? 1 : Math.max(1, val) } : i));
                      }}
                      className="w-8 text-sm font-black text-center text-stone-700 bg-transparent outline-none appearance-none"
                      min="1"
                    />
                    <button type="button"
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-7 h-7 rounded-lg bg-white text-stone-600 hover:text-stone-900 hover:shadow shadow-sm flex items-center justify-center transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <button type="button"
                    onClick={() => updateQuantity(item.cartItemId, -item.quantity)}
                    className="w-7 h-7 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {item.isCustom && (
                    <button type="button"
                      onClick={() => setEditingCustomItem(item)}
                      className="w-7 h-7 bg-stone-100 text-stone-600 rounded-lg hover:bg-dhaba-orange hover:text-white flex items-center justify-center shadow-sm"
                      title="Edit Custom Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={cartEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-stone-100 relative z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center gap-2 text-sm font-black text-stone-600 justify-center mb-1">
            <label className="flex items-center gap-3 cursor-pointer select-none bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors w-full justify-center">
              <input
                type="checkbox"
                checked={generateGst}
                onChange={(e) => setGenerateGst(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-dhaba-orange focus:ring-dhaba-orange"
              />
              <span className="uppercase tracking-widest text-xs">Generate GST Bill</span>
            </label>
          </div>

          <div
            className="bg-stone-900 rounded-xl p-3 text-white shadow-lg relative mt-2 cursor-pointer transition-all hover:bg-stone-800"
            onClick={() => setShowGstDetails(!showGstDetails)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-dhaba-orange/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="space-y-1 relative z-10 pointer-events-none">
              <div className="flex justify-between text-sm font-medium text-stone-400">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {generateGst && showGstDetails && (
                <>
                  <div className="flex justify-between text-xs font-medium text-stone-500">
                    <span>CGST (2.5%)</span>
                    <span>₹{(cartTotal * 0.025).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-stone-500">
                    <span>SGST (2.5%)</span>
                    <span>₹{(cartTotal * 0.025).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-stone-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-stone-300 uppercase tracking-widest">Total</span>
                  {generateGst && (
                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${showGstDetails ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <span className="text-2xl font-black text-dhaba-orange drop-shadow-sm">₹{generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-3">
            {editingOrderId ? (
              <>
                <div className="flex gap-2">
                  <button type="button" onClick={() => submitOrder(true)} disabled={cart.length === 0 || isSubmitting} className="flex-1 py-2.5 px-2 bg-gradient-to-r from-dhaba-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black rounded-lg shadow flex items-center justify-center gap-1.5 text-sm">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer className="w-4 h-4" />} <span className="hidden sm:inline">Update & Print</span><span className="sm:hidden">Print</span>
                  </button>
                  <button type="button" onClick={() => submitOrder(false)} disabled={cart.length === 0 || isSubmitting} className="flex-1 py-2.5 px-2 bg-stone-800 hover:bg-black disabled:opacity-50 text-white font-black rounded-lg shadow flex items-center justify-center gap-1.5 text-sm">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} <span className="hidden sm:inline">Update Only</span><span className="sm:hidden">Save</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { clearEditingOrder(); setCart([]); setTableSelection(null); }} className="flex-1 py-2 px-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 text-sm">
                    <X className="w-4 h-4" /> Cancel Edit
                  </button>
                  <button type="button" onClick={handlePrintKOT} disabled={cart.length === 0} className="flex-1 py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 text-sm">
                    <FileText className="w-4 h-4" /> KOT
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button type="button" onClick={() => submitOrder(true)} disabled={cart.length === 0 || isSubmitting} className="flex-1 py-2.5 px-2 bg-gradient-to-r from-dhaba-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black rounded-lg shadow flex items-center justify-center gap-1.5 text-sm">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer className="w-4 h-4" />} <span className="hidden sm:inline">Save & Print</span><span className="sm:hidden">Print</span>
                  </button>
                  <button type="button" onClick={handlePrintCart} disabled={cart.length === 0 || isSubmitting} className="flex-1 py-2.5 px-2 bg-stone-800 hover:bg-black disabled:opacity-50 text-white font-black rounded-lg shadow flex items-center justify-center gap-1.5 text-sm">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer className="w-4 h-4" />} <span className="hidden sm:inline">Print Bill</span><span className="sm:hidden">Print</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setCart([])} disabled={cart.length === 0} className="flex-1 py-2 px-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 text-sm">
                    <Trash2 className="w-4 h-4" /> Clear Cart
                  </button>
                  <button type="button" onClick={handlePrintKOT} disabled={cart.length === 0} className="flex-1 py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 text-sm">
                    <FileText className="w-4 h-4" /> Print KOT
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
