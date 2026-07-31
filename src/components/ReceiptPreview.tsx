import React from 'react';
import { ClipboardList, ShoppingBag, ShieldCheck, Lock, User, Phone, Store, Utensils } from 'lucide-react';

export const ReceiptPreview = React.forwardRef<HTMLDivElement, any>(({ cartItems, formData, orderType, finalTotal }, ref) => {
  return (
    <div 
      ref={ref} 
      className="w-[450px] bg-[#f8f5f2] relative overflow-hidden flex flex-col font-sans"
      style={{ minHeight: '800px' }}
    >
      {/* Header Section */}
      <div className="bg-[#1a0f0a] text-white pt-10 pb-20 px-8 relative z-0">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4">
            {/* Custom SVG Cloche */}
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
              <line x1="6" y1="17" x2="18" y2="17"></line>
            </svg>
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#f97316] mb-2 leading-tight">
            Harjinder<br/>Tourist Dhaba
          </h1>
          <div className="flex items-center justify-center gap-4 my-3 w-full">
            <div className="h-px bg-[#f97316]/40 flex-1"></div>
            <h2 className="text-lg font-medium text-white tracking-wide">Order Details Preview</h2>
            <div className="h-px bg-[#f97316]/40 flex-1"></div>
          </div>
          <p className="text-stone-300 text-sm">Review your order details before placing</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-5 -mt-12 relative z-10 flex flex-col gap-4 pb-10">
        {/* Order Details Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Order Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-stone-50 border-dashed">
              <div className="flex items-center gap-3 text-stone-600">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-orange-500" />
                </div>
                <span className="font-medium">Order Type</span>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                {orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-50 border-dashed">
              <div className="flex items-center gap-3 text-stone-600">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-500" />
                </div>
                <span className="font-medium">Name</span>
              </div>
              <span className="font-semibold text-stone-800">{formData.name || '-'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-50 border-dashed">
              <div className="flex items-center gap-3 text-stone-600">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-orange-500" />
                </div>
                <span className="font-medium">Phone Number</span>
              </div>
              <span className="font-semibold text-stone-800">{formData.phone || '-'}</span>
            </div>

            {orderType === 'dine-in' && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-stone-600">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <Store className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="font-medium">Table Number</span>
                </div>
                <span className="font-semibold text-stone-800">{formData.tableNumber || '-'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Ordered Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Items Ordered</h3>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">
              <div className="col-span-8">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
            </div>

            <div className="space-y-4">
              {cartItems.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 border border-stone-200">
                      <Utensils className="w-5 h-5 text-stone-400" />
                    </div>
                    <span className="font-bold text-sm text-stone-800 leading-tight">{item.name}</span>
                  </div>
                  <div className="col-span-2 text-center font-semibold text-stone-800">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-bold text-orange-600">
                    ₹{item.numericPrice * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center px-1">
            <span className="font-bold text-stone-600">Total Amount</span>
            <span className="text-2xl font-black text-stone-900">₹{finalTotal}</span>
          </div>
        </div>

        {/* Thank You Note */}
        <div className="bg-[#fff6ef] rounded-2xl p-5 border border-orange-100 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm shadow-orange-200">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="z-10">
            <p className="font-medium text-stone-800 text-sm">Thank you! We appreciate your order.</p>
            <p className="text-stone-500 text-xs mt-0.5">Enjoy your meal!</p>
          </div>
          {/* Decorative mandala element in corner */}
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#f97316" strokeWidth="2">
              <circle cx="50" cy="50" r="40" />
              <path d="M50 10 L50 90 M10 50 L90 50 M21.7 21.7 L78.3 78.3 M21.7 78.3 L78.3 21.7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-2 text-stone-400">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Secure & Safe Checkout</span>
        </div>
      </div>
    </div>
  );
});

ReceiptPreview.displayName = 'ReceiptPreview';
