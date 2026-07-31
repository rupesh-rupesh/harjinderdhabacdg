const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

if (!code.includes("import { ThermalReceipt }")) {
  code = code.replace("import { Search, Info, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';", 
    "import { Search, Info, Plus, Minus, Trash2, CheckCircle2, Printer, FileText } from 'lucide-react';\nimport { ThermalReceipt } from './ThermalReceipt';\nimport { useRef } from 'react';");
}

if (!code.includes("const [generateGst, setGenerateGst]")) {
  code = code.replace("const [showAddItem, setShowAddItem] = useState(false);", 
    "const [showAddItem, setShowAddItem] = useState(false);\n  const [generateGst, setGenerateGst] = useState(false);\n  const [showReceiptPreview, setShowReceiptPreview] = useState(false);\n  const receiptRef = useRef<HTMLDivElement>(null);\n\n  const handlePrint = () => {\n    if (receiptRef.current) {\n      window.print();\n    }\n  };");
}

const printSection = `            <div className="p-6 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <input 
                  type="checkbox" 
                  id="gst-checkbox" 
                  checked={generateGst}
                  onChange={(e) => setGenerateGst(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-dhaba-orange focus:ring-dhaba-orange"
                />
                <label htmlFor="gst-checkbox" className="cursor-pointer select-none">Generate GST Bill</label>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setShowReceiptPreview(true)}
                  className="px-4 py-2.5 bg-white border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-100 transition-colors shadow-sm flex items-center"
                >
                  <FileText className="w-5 h-5 mr-2" /> Preview
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-dhaba-dark text-[var(--color-gold)] font-medium rounded-xl hover:bg-black transition-colors shadow-sm flex items-center"
                >
                  <Printer className="w-5 h-5 mr-2" /> Print Bill
                </button>
                
                {selectedOrder.status === 'pending' || selectedOrder.status === 'processing' ? (
                  <>
                    <button 
                      onClick={() => { handleUpdateStatus(selectedOrder.id, 'cancelled'); }}
                      className="px-4 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                    >
                      Cancel Order
                    </button>
                    <button 
                      onClick={() => { handleUpdateStatus(selectedOrder.id, 'completed'); }}
                      className="px-4 py-2.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors shadow-sm flex items-center"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Mark Complete
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { handleDelete(selectedOrder.id); }}
                    className="px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm flex items-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" /> Delete
                  </button>
                )}
              </div>
            </div>`;

code = code.replace(/<div className="p-6 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex gap-3 justify-end">[\s\S]*?<\/div>/, printSection);

if (!code.includes("showReceiptPreview &&")) {
  code = code.replace("return (", `return (
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
                <Trash2 className="w-5 h-5 hidden" />
                <span className="font-bold">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200">
               <div className="shadow-2xl">
                 <ThermalReceipt order={selectedOrder} includeGst={generateGst} managerName="Manager" />
               </div>
            </div>
            <div className="p-4 bg-white border-t flex justify-end gap-2">
               <button onClick={() => setShowReceiptPreview(false)} className="px-4 py-2 border rounded-xl hover:bg-stone-50 font-medium">Close</button>
               <button onClick={handlePrint} className="px-4 py-2 bg-dhaba-orange text-white rounded-xl hover:bg-[#e0561b] font-bold flex items-center"><Printer className="w-4 h-4 mr-2"/> Print Bill</button>
            </div>
          </div>
        </div>
      )}
`);
}

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
