const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

// Change useState(false) to useState(true) for generateGst
code = code.replace("const [generateGst, setGenerateGst] = useState(false);", "const [generateGst, setGenerateGst] = useState(true);");

const oldSubmitOrder = `  const submitOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!tableSelection) return toast.error("No table selected");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableSelection,
          items: cart,
          total: cartTotal
        })
      });`;

const newSubmitOrder = `  const submitOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!tableSelection) return toast.error("No table selected");
    
    setIsSubmitting(true);
    try {
      const finalTotal = generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal;
      const res = await fetch('/api/admin/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableSelection,
          items: cart,
          total: finalTotal
        })
      });`;

code = code.replace(oldSubmitOrder, newSubmitOrder);

const oldCartTotals = `          <div className="p-4 bg-white border-t border-stone-200 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Taxes</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-stone-800 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="text-dhaba-orange">₹{cartTotal}</span>
              </div>
            </div>
            
            <button
              onClick={submitOrder}`;

const newCartTotals = `          <div className="p-4 bg-white border-t border-stone-200 space-y-4">
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
              onClick={submitOrder}`;

code = code.replace(oldCartTotals, newCartTotals);

if (!code.includes("showCartReceiptPreview")) {
  code = code.replace("const [showReceiptPreview, setShowReceiptPreview] = useState(false);", "const [showReceiptPreview, setShowReceiptPreview] = useState(false);\n  const [showCartReceiptPreview, setShowCartReceiptPreview] = useState(false);\n  const cartReceiptRef = useRef<HTMLDivElement>(null);\n\n  const handlePrintCart = () => {\n    if (cartReceiptRef.current) {\n      window.print();\n    }\n  };\n\n  const draftOrder = {\n    id: 'DRAFT',\n    createdAt: new Date().toISOString(),\n    items: cart,\n    total: generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal\n  };\n");
}

const checkoutReceiptBlock = `    return (
    <>
      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
        <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" forwardedRef={cartReceiptRef} />
      </div>`;
      
code = code.replace(`    return (
    <>
      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
      </div>`, checkoutReceiptBlock);

const cartPreviewModal = `
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
`;

code = code.replace(`      {showReceiptPreview && checkoutTable && (`, cartPreviewModal + `\n      {showReceiptPreview && checkoutTable && (`);


fs.writeFileSync('src/components/ManagerBilling.tsx', code);
