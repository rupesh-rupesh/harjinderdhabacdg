const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

if (!code.includes("import { ThermalReceipt }")) {
  code = code.replace("import { LayoutGrid, Package, Utensils, Grid, Search, Plus, Minus, Trash2, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, ArrowRight, Table, X, CreditCard } from 'lucide-react';", 
    "import { LayoutGrid, Package, Utensils, Grid, Search, Plus, Minus, Trash2, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, ArrowRight, Table, X, CreditCard, Printer, FileText } from 'lucide-react';\nimport { ThermalReceipt } from './ThermalReceipt';\nimport { useRef } from 'react';");
}

if (!code.includes("const [generateGst, setGenerateGst]")) {
  code = code.replace("const [activeOrders, setActiveOrders] = useState<any[]>([]);", 
    "const [activeOrders, setActiveOrders] = useState<any[]>([]);\n  const [generateGst, setGenerateGst] = useState(false);\n  const [showReceiptPreview, setShowReceiptPreview] = useState(false);\n  const receiptRef = useRef<HTMLDivElement>(null);\n\n  const handlePrint = () => {\n    if (receiptRef.current) {\n      window.print();\n    }\n  };");
}

const printSection = `                <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-6 justify-center">
                  <input 
                    type="checkbox" 
                    id="gst-checkbox" 
                    checked={generateGst}
                    onChange={(e) => setGenerateGst(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-dhaba-orange focus:ring-dhaba-orange"
                  />
                  <label htmlFor="gst-checkbox" className="cursor-pointer select-none">Generate GST Bill</label>
                </div>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  <button 
                    onClick={() => setShowReceiptPreview(true)}
                    className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText className="w-5 h-5" /> Preview
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex-1 py-3 px-4 bg-dhaba-dark text-[var(--color-gold)] font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Printer className="w-5 h-5" /> Print Bill
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCheckoutTable(null)}
                    className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors"`;

code = code.replace(/<div className="flex gap-3">\s*<button\s*onClick=\{\(\) => setCheckoutTable\(null\)\}\s*className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors"/, printSection);


if (!code.includes("showReceiptPreview &&")) {
  code = code.replace("return (", `return (
    <>
      <div className="hidden">
        <ThermalReceipt order={checkoutTable?.order} includeGst={generateGst} managerName="Manager" forwardedRef={receiptRef} />
      </div>
      
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
`);
}

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
