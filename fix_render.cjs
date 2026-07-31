const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const tableSelectionBlock = `  if (tableSelection === null) {
    return (
    <>
      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
        <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" forwardedRef={cartReceiptRef} />
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
      )}`;

const tableSelectionNew = `  if (tableSelection === null) {
    return (
    <>`;

code = code.replace(tableSelectionBlock, tableSelectionNew);

const returnBlock = `  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -mx-4 sm:-mx-8 lg:-mx-10 lg:-mt-8 -mt-4">`;

const modalsNew = `      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
        <ThermalReceipt order={draftOrder} includeGst={generateGst} managerName="Manager" forwardedRef={cartReceiptRef} />
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
      )}`;

code = code.replace(returnBlock, returnBlock + "\n" + modalsNew);

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
