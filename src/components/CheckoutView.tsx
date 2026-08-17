import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CreditCard, Banknote, MapPin, Phone, User, ShoppingBag, Clock, CheckCircle2, ChevronRight, Store, Info, ArrowRight, ClipboardList, Wallet, Receipt, Lock, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import domToImage from 'dom-to-image';
import jsPDF from 'jspdf';
import { ReceiptPreview } from './ReceiptPreview';

export default function CheckoutView({
  cartItems,
  cartTotal,
  onBack,
  onOrderComplete
}: {
  cartItems: any[];
  cartTotal: number;
  onBack: () => void;
  onOrderComplete: () => void;
}) {
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>('counter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tableNumber: '',
  });
  const [formErrors, setFormErrors] = useState<{name?: string, phone?: string, tableNumber?: string}>({});
  const [showTakeawayModal, setShowTakeawayModal] = useState(false);
  const [showDineInModal, setShowDineInModal] = useState(false);
  const [feelingSad, setFeelingSad] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const element = receiptRef.current;
    
    try {
      const toastId = toast.loading('Generating PDF...');
      
      const dataUrl = await domToImage.toPng(element, {
        bgcolor: '#f8f5f2',
        quality: 1,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save('order-preview.pdf');
      
      toast.success('Downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('We were unable to download the order preview. Please try again.');
    }
  };

  useEffect(() => {
    if (orderType === 'takeaway') {
      setPaymentMethod('online');
    }
  }, [orderType]);


  const taxAmount = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + taxAmount;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: {name?: string, phone?: string, tableNumber?: string} = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    const cleanPhone = formData.phone.replace(/[- ]/g, '').replace(/^\+?91/, '');
    if (!cleanPhone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (orderType === 'dine-in') {
      if (!formData.tableNumber.trim()) {
        errors.tableNumber = "Table number is required";
      } else if (!/^\d{1,3}$/.test(formData.tableNumber.trim())) {
        errors.tableNumber = "Please enter a valid table number (1-999)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    
    if (orderType === 'dine-in') {
      setShowDineInModal(true);
      return;
    }

    setIsProcessing(true);

    
    // Simulate API call for placing order / payment
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        onOrderComplete();
      }, 3000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-[100dvh] bg-stone-50 overflow-hidden w-full items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-dhaba-dark mb-4">Order Confirmed!</h2>
          <p className="text-stone-600 mb-8">
            {orderType === 'dine-in' 
              ? "Your food is being prepared and will be brought to your table shortly."
              : "Your takeaway order is confirmed and will be ready for pickup in 20 minutes."}
          </p>
          <div className="bg-stone-50 rounded-xl p-4 mb-8 text-left border border-stone-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-500">Order ID</span>
              <span className="font-bold text-dhaba-dark">#HTD-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Amount</span>
              <span className="font-bold text-dhaba-orange">₹{finalTotal}</span>
            </div>
          </div>
          <p className="text-sm text-stone-400">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-50 overflow-hidden w-full">
      {/* Header */}
      <nav className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-stone-200/50 shadow-sm h-16 px-4 flex items-center justify-between z-40 relative sticky top-0">
        <div className="flex items-center flex-1">
          <button onClick={onBack} className="text-stone-500 hover:text-dhaba-orange flex items-center font-medium transition-colors">
            <ArrowLeft className="w-6 h-6 mr-1" /> <span className="hidden sm:inline">Back to Cart</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="font-serif text-lg sm:text-xl font-bold text-dhaba-dark text-center whitespace-nowrap">Checkout</span>
        </div>
        <div className="flex-1"></div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-8">
          
          {/* Left Column: Forms & Options */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            
            {/* Order Type Selection */}
            <div className="bg-white rounded-[24px] shadow-sm border border-stone-100 p-5 sm:p-6">
              <div className="flex items-start mb-6">
                <div className="w-10 h-10 rounded-full border border-dhaba-orange/30 flex items-center justify-center mr-3 shrink-0">
                  <ClipboardList className="w-5 h-5 text-dhaba-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-dhaba-dark">Order Type</h3>
                  <p className="text-sm text-stone-500 mt-0.5">How would you like your order?</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative cursor-pointer border-2 rounded-[20px] p-5 sm:p-6 flex flex-col items-center justify-center transition-all ${orderType === 'dine-in' ? 'border-dhaba-orange bg-orange-50/50' : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'}`}>
                  <input type="radio" name="orderType" value="dine-in" checked={orderType === 'dine-in'} onChange={() => setOrderType('dine-in')} className="sr-only" />
                  <div className={`w-14 h-14 rounded-full mb-3 flex items-center justify-center ${orderType === 'dine-in' ? 'bg-orange-100' : 'bg-white shadow-sm'}`}>
                    <Store className={`w-7 h-7 ${orderType === 'dine-in' ? 'text-dhaba-orange' : 'text-stone-400'}`} />
                  </div>
                  <span className={`font-bold text-lg mb-1 ${orderType === 'dine-in' ? 'text-stone-900' : 'text-stone-700'}`}>Dine-in</span>
                  <span className="text-xs text-stone-500 text-center">Enjoy your meal at our restaurant</span>
                  {orderType === 'dine-in' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-dhaba-orange rounded-full flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </label>
                <label className={`relative cursor-pointer border-2 rounded-[20px] p-5 sm:p-6 flex flex-col items-center justify-center transition-all ${orderType === 'takeaway' ? 'border-dhaba-orange bg-orange-50/50' : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'}`}>
                  <input type="radio" name="orderType" value="takeaway" checked={orderType === 'takeaway'} onChange={() => setShowTakeawayModal(true)} className="sr-only" />
                  <div className={`w-14 h-14 rounded-full mb-3 flex items-center justify-center ${orderType === 'takeaway' ? 'bg-orange-100' : 'bg-white shadow-sm'}`}>
                    <ShoppingBag className={`w-7 h-7 ${orderType === 'takeaway' ? 'text-dhaba-orange' : 'text-stone-400'}`} />
                  </div>
                  <span className={`font-bold text-lg mb-1 ${orderType === 'takeaway' ? 'text-stone-900' : 'text-stone-700'}`}>Takeaway</span>
                  <span className="text-xs text-stone-500 text-center">Pick up your order</span>
                  {orderType === 'takeaway' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-dhaba-orange rounded-full flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Details Form */}
            <div className="bg-white rounded-[24px] shadow-sm border border-stone-100 p-5 sm:p-6">
              <div className="flex items-start mb-6">
                <div className="w-10 h-10 rounded-full border border-dhaba-orange/30 flex items-center justify-center mr-3 shrink-0">
                  <User className="w-5 h-5 text-dhaba-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-dhaba-dark">Your Details</h3>
                  <p className="text-sm text-stone-500 mt-0.5">Please provide your details</p>
                </div>
              </div>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-dhaba-orange/70" />
                    </div>
                    <input required type="text" value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); if (formErrors.name) setFormErrors({...formErrors, name: undefined}); }} className={`w-full bg-white border ${formErrors.name ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-stone-200 focus:ring-dhaba-orange/50 focus:border-dhaba-orange'} rounded-[16px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 transition-colors text-stone-800 placeholder:text-stone-400`} placeholder="Enter your name" />
                  </div>
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-dhaba-orange/70" />
                    </div>
                    <input required type="tel" value={formData.phone} onChange={(e) => { setFormData({...formData, phone: e.target.value}); if (formErrors.phone) setFormErrors({...formErrors, phone: undefined}); }} className={`w-full bg-white border ${formErrors.phone ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-stone-200 focus:ring-dhaba-orange/50 focus:border-dhaba-orange'} rounded-[16px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 transition-colors text-stone-800 placeholder:text-stone-400`} placeholder="Enter your phone number" />
                  </div>
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                {orderType === 'dine-in' && (
                  <div>
                    <label className="block text-sm font-bold text-stone-800 mb-1.5">Table Number <span className="text-stone-500 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Store className="h-5 w-5 text-dhaba-orange/70" />
                      </div>
                      <input required type="text" value={formData.tableNumber} onChange={(e) => { setFormData({...formData, tableNumber: e.target.value}); if (formErrors.tableNumber) setFormErrors({...formErrors, tableNumber: undefined}); }} className={`w-full bg-white border ${formErrors.tableNumber ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-stone-200 focus:ring-dhaba-orange/50 focus:border-dhaba-orange'} rounded-[16px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 transition-colors text-stone-800 placeholder:text-stone-400`} placeholder="e.g. 12" />
                    </div>
                    {formErrors.tableNumber && <p className="text-red-500 text-xs mt-1">{formErrors.tableNumber}</p>}
                  </div>
                )}
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-[24px] shadow-sm border border-stone-100 p-5 sm:p-6">
              <div className="flex items-start mb-6">
                <div className="w-10 h-10 rounded-full border border-dhaba-orange/30 flex items-center justify-center mr-3 shrink-0">
                  <Wallet className="w-5 h-5 text-dhaba-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-dhaba-dark">Payment Method</h3>
                  <p className="text-sm text-stone-500 mt-0.5">Choose a payment option</p>
                </div>
              </div>
              <div className="space-y-3">
                {orderType === 'dine-in' && (
                  <label className={`cursor-pointer border-2 rounded-[16px] p-4 flex items-center transition-all ${paymentMethod === 'counter' ? 'border-dhaba-orange bg-orange-50/50' : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'}`}>
                    <input type="radio" name="paymentMethod" value="counter" checked={paymentMethod === 'counter'} onChange={() => setPaymentMethod('counter')} className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-colors ${paymentMethod === 'counter' ? 'bg-orange-100/50' : 'bg-white shadow-sm border border-stone-100'}`}>
                      <Banknote className={`w-6 h-6 ${paymentMethod === 'counter' ? 'text-dhaba-orange' : 'text-stone-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-base ${paymentMethod === 'counter' ? 'text-stone-900' : 'text-stone-700'}`}>Pay at Counter</h4>
                      <p className="text-xs sm:text-sm text-stone-500">Pay via cash or card after your meal</p>
                    </div>
                    <div className="ml-3 shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'counter' ? 'border-dhaba-orange' : 'border-stone-300'}`}>
                        {paymentMethod === 'counter' && <div className="w-3 h-3 rounded-full bg-dhaba-orange" />}
                      </div>
                    </div>
                  </label>
                )}
                
                <label className="cursor-not-allowed opacity-60 border-2 rounded-[16px] p-4 flex items-center transition-all border-stone-100 bg-stone-50/50">
                  <input type="radio" name="paymentMethod" value="online" disabled className="sr-only" />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 bg-white shadow-sm border border-stone-100">
                    <CreditCard className="w-6 h-6 text-stone-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-stone-700">Pay Online</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">Unavailable</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-500">UPI, Credit/Debit Cards, Net Banking</p>
                  </div>
                  <div className="ml-3 shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-stone-200">
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-[24px] shadow-sm border border-stone-100 p-5 sm:p-6 sticky top-6">
              <div className="flex items-start mb-6 border-b border-stone-100 pb-4">
                <div className="w-10 h-10 rounded-full border border-dhaba-orange/30 flex items-center justify-center mr-3 shrink-0">
                  <Receipt className="w-5 h-5 text-dhaba-orange" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-dhaba-dark">Order Summary</h3>
                    <p className="text-sm text-stone-500 mt-0.5">View your items and total</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </div>
              </div>
              
              <div className="max-h-[30vh] overflow-y-auto pr-2 mb-4 space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-stone-800 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-stone-500 text-xs">Qty: {item.quantity}</p>
                      <p className="font-bold text-dhaba-dark text-sm mt-1">₹{item.numericPrice * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-stone-100 pt-4 mb-4">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-dhaba-dark">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Taxes (5%)</span>
                  <span className="font-medium text-dhaba-dark">₹{taxAmount}</span>
                </div>
                {orderType === 'takeaway' && (
                  <div className="flex justify-between text-stone-600">
                    <span>Packing Charges</span>
                    <span className="font-medium text-dhaba-dark">₹20</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold text-dhaba-dark pt-3 border-t border-stone-100">
                  <span>Total</span>
                  <span className="text-dhaba-orange">₹{finalTotal + (orderType === 'takeaway' ? 20 : 0)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-dhaba-orange hover:bg-dhaba-orange-light text-white py-4 px-6 rounded-[16px] font-bold text-lg flex items-center justify-between transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 group"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center w-full">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <div className="flex items-center">
                      <ShieldCheck className="w-5 h-5 text-white/90 mr-2" />
                    </div>
                    <span className="flex-1 text-center pr-2">Place Order</span>
                    <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 text-stone-500 text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure & Safe Checkout</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showTakeawayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-[28rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Illustration */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center relative">
                {/* Decorative sparkles */}
                <svg className="absolute top-4 left-2 w-6 h-6 text-orange-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                <svg className="absolute bottom-6 right-2 w-4 h-4 text-orange-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                {/* Barricade SVG */}
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Stand legs */}
                  <path d="M25 80L35 40" stroke="#444" strokeWidth="6" strokeLinecap="round" />
                  <path d="M75 80L65 40" stroke="#444" strokeWidth="6" strokeLinecap="round" />
                  {/* Bottom bar striped */}
                  <g>
                    <rect x="20" y="65" width="60" height="12" rx="2" fill="#FFA07A" />
                    <path d="M25 65L35 77 M40 65L50 77 M55 65L65 77 M70 65L78 75" stroke="#FF7F50" strokeWidth="6" strokeLinecap="square"/>
                  </g>
                  {/* Main box */}
                  <rect x="25" y="30" width="50" height="35" rx="4" fill="#FF7F50" />
                  {/* Handles */}
                  <path d="M35 30V22 M65 30V22" stroke="#FF7F50" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="35" cy="22" r="2" fill="#FF7F50" />
                  <circle cx="65" cy="22" r="2" fill="#FF7F50" />
                  {/* Red minus circle */}
                  <circle cx="50" cy="47.5" r="12" fill="#FF4500" />
                  <rect x="44" y="45.5" width="12" height="4" rx="1" fill="white" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-stone-900 mb-3 text-center tracking-tight">Feature Unavailable</h3>
            
            {/* Divider */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px bg-orange-300 w-12"></div>
              <div className="w-2 h-2 rounded-full bg-dhaba-orange"></div>
              <div className="h-px bg-orange-300 w-12"></div>
            </div>

            <p className="text-stone-600 mb-6 text-center leading-relaxed">
              Takeaway features are not implemented yet.<br/>
              Developer didn't get enough payment for<br/>this implementation.
            </p>
            
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-dhaba-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-5 h-5 text-dhaba-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 mb-1">Why is this feature unavailable?</h4>
                <p className="text-sm text-stone-600">This feature requires additional development and resources.</p>
              </div>
            </div>

            <label className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 cursor-pointer mb-8 hover:bg-stone-50 transition-colors">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-md border-2 border-stone-300 text-dhaba-orange focus:ring-dhaba-orange focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-dhaba-orange checked:border-dhaba-orange"
                  checked={feelingSad}
                  onChange={(e) => setFeelingSad(e.target.checked)}
                />
                {feelingSad && (
                  <CheckCircle2 className="w-4 h-4 text-white absolute left-1 top-1 pointer-events-none" />
                )}
              </div>
              <span className="font-medium text-stone-700 text-[1.05rem]">Felling Sad for Developer <span className="text-xl">🥺</span></span>
            </label>
            
            <button
              onClick={() => {
                setShowTakeawayModal(false);
                setFeelingSad(false);
              }}
              disabled={!feelingSad}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                feelingSad 
                  ? 'bg-dhaba-orange hover:bg-dhaba-orange-light text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {showDineInModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-[28rem] shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 pb-4 bg-white">
              <h3 className="text-2xl font-extrabold text-stone-900 mb-4 text-center tracking-tight">Your Selection</h3>
              
              <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4 max-h-[40vh]">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 text-sm">{item.name}</h4>
                        <p className="text-stone-500 text-xs font-medium">₹{item.numericPrice} x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="font-bold text-dhaba-dark">
                      ₹{item.numericPrice * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-2 text-sm text-stone-700">
                <p className="mb-3 leading-relaxed">
                  <span className="font-bold text-dhaba-orange">Note:</span> online ordering not implantted yet just call the waiter and ask him to bring your order RIGHT NOWW...
                </p>
                <p className="font-black text-dhaba-dark uppercase leading-relaxed text-[11px] sm:text-xs">
                  IF YOU WANT YOUR ORDER DELIVER TO YOU BY DEVELOPER THEN SHOUT <a href="https://rupeshkumar.online" target="_blank" rel="noopener noreferrer" className="text-dhaba-orange underline decoration-dhaba-orange/50 underline-offset-2 hover:decoration-dhaba-orange transition-colors">Sing A Song For Us</a>
                </p>
              </div>
            </div>
            
            <div className="p-8 pt-4 flex flex-col gap-3 bg-white">
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-dhaba-orange hover:bg-dhaba-orange-light text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/20 focus:outline-none flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> Download Preview
              </button>
              <button
                onClick={() => setShowDineInModal(false)}
                className="w-full py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-lg transition-all shadow-lg focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt Preview for PDF Generation */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
        <ReceiptPreview 
          ref={receiptRef}
          cartItems={cartItems}
          formData={formData}
          orderType={orderType}
          finalTotal={finalTotal}
        />
      </div>
    </div>
  );
}
