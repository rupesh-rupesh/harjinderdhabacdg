const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

const startIndex = code.indexOf('{selectedOrder && (');
const endIndex = code.indexOf('      {deleteConfirm && (');

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find targets");
  process.exit(1);
}

const newModal = `{selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative z-10 flex flex-col max-h-[95vh]">
            <div className="p-8 pb-4 overflow-y-auto flex-1">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-[#fdf5f0] flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-[#E85D04]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Order #{selectedOrder.id}</h2>
                    <div className="flex items-center gap-6 text-stone-500 text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedOrder.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="mx-1">|</span>
                        {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    {(() => {
                       let items = [];
                       try { items = JSON.parse(selectedOrder.items); } catch(e) {}
                       const tableMarker = items.find((i: any) => i.isTableMarker);
                       return tableMarker ? (
                         <div className="px-3 py-1 bg-[#fdf5f0] text-[#E85D04] rounded-full text-sm font-semibold border border-[#fdecdb]">
                           {tableMarker.name}
                         </div>
                       ) : null;
                    })()}
                    <div className={\`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border \${
                      selectedOrder.status === 'completed' ? 'bg-[#f0fdf4] text-green-700 border-green-200' :
                      selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-[#fdf5f0] text-[#E85D04] border-[#fdecdb]'
                    }\`}>
                      <div className={\`w-2 h-2 rounded-full \${
                        selectedOrder.status === 'completed' ? 'bg-green-500' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-500' :
                        'bg-[#E85D04]'
                      }\`} />
                      <span className="capitalize">{selectedOrder.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
                    <ShoppingBag className="w-5 h-5 text-[#E85D04]" /> Order Items
                  </div>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button 
                      onClick={() => setShowAddItem(!showAddItem)}
                      className="text-[#E85D04] font-semibold hover:text-[#c44e03] transition-colors text-sm"
                    >
                      + Add Item
                    </button>
                  )}
                </div>

                {showAddItem && (
                  <div className="bg-white border border-stone-200 p-2 rounded-xl shadow-sm mb-4 max-h-48 overflow-y-auto">
                    {menuItems.map(mi => (
                      <button 
                        key={mi.id} 
                        onClick={() => handleAddNewItem(mi)}
                        className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg flex justify-between text-sm"
                      >
                        <span className="font-medium text-stone-700">{mi.name}</span>
                        <span className="text-stone-500">₹{mi.price}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedOrder.items);
                      const realItems = items.filter((item: any) => !item.isTableMarker);
                      
                      if (realItems.length === 0) return <div className="text-stone-500 py-4 text-center bg-stone-50 rounded-xl">No items in this order.</div>;
                      
                      return realItems.map((item: any, i: number) => {
                        const originalIndex = items.findIndex((orig: any) => orig === item);
                        return (
                          <div key={i} className="flex items-center justify-between p-4 border border-stone-100 rounded-2xl bg-white shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="px-3 py-1.5 bg-[#fdf5f0] text-[#E85D04] font-bold rounded-lg text-sm">
                                {item.quantity}x
                              </div>
                              <div>
                                <span className="font-bold text-stone-900">{item.name}</span>
                                {(item.variantName || item.isHalf || item.isButter) && (
                                  <div className="text-xs text-stone-500 mt-0.5">
                                    {[item.variantName, item.isHalf && 'Half', item.isButter && '+ Butter'].filter(Boolean).join(' • ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="font-bold text-stone-900 text-lg">
                                ₹{((item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity).toFixed(2)}
                              </div>
                              
                              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                                    <button onClick={() => handleUpdateItemQty(originalIndex, -1)} className="px-2.5 py-1.5 hover:bg-stone-50 text-stone-500 transition-colors"><Minus className="w-4 h-4" /></button>
                                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                                    <button onClick={() => handleUpdateItemQty(originalIndex, 1)} className="px-2.5 py-1.5 hover:bg-stone-50 text-stone-500 transition-colors"><Plus className="w-4 h-4" /></button>
                                  </div>
                                  <button 
                                    onClick={() => handleUpdateItemQty(originalIndex, -item.quantity)} 
                                    className="p-2 border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors ml-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    } catch (e) {
                      return <div>Error loading items</div>;
                    }
                  })()}
                </div>
              </div>

              {/* Summary Section */}
              <div className="mt-6 border border-stone-100 rounded-2xl p-5 bg-white shadow-sm space-y-3">
                {(() => {
                   let subTotal = 0;
                   let calculatedGst = 0;
                   try {
                     const items = JSON.parse(selectedOrder.items);
                     const realItems = items.filter((item: any) => !item.isTableMarker);
                     subTotal = realItems.reduce((acc, item) => acc + (item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity, 0);
                     if (generateGst) {
                       calculatedGst = parseFloat((subTotal * 0.05).toFixed(2));
                     }
                   } catch(e) {}
                   
                   return (
                     <>
                        <div className="flex justify-between items-center text-stone-600 font-medium">
                          <span>Sub Total</span>
                          <span className="text-stone-900">₹{subTotal.toFixed(2)}</span>
                        </div>
                        {generateGst && (
                          <div className="flex justify-between items-center text-stone-500 font-medium text-sm">
                            <span className="flex items-center gap-1">GST (5%) <ChevronDown className="w-3 h-3" /></span>
                            <span>₹{calculatedGst.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-stone-200 border-dashed my-3"></div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-900 text-lg">Grand Total</span>
                          <span className="font-bold text-[#E85D04] text-3xl tracking-tight">₹{Number(selectedOrder.total).toFixed(2)}</span>
                        </div>
                     </>
                   )
                })()}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-8 pt-4 bg-white rounded-b-3xl shrink-0">
               <div className="flex items-start gap-3 mb-6">
                 <input 
                    type="checkbox" 
                    id="gst-checkbox" 
                    checked={generateGst}
                    onChange={(e) => setGenerateGst(e.target.checked)}
                    className="w-5 h-5 rounded border-stone-300 text-[#E85D04] focus:ring-[#E85D04] mt-0.5"
                  />
                  <div>
                    <label htmlFor="gst-checkbox" className="font-bold text-stone-900 cursor-pointer block">Generate GST Bill</label>
                    <p className="text-stone-500 text-sm">CGST 2.5% + SGST 2.5% will be added</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowReceiptPreview(true)}
                    className="w-full py-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-2xl hover:bg-stone-50 transition-colors shadow-sm flex items-center justify-center text-lg"
                  >
                    <FileText className="w-5 h-5 mr-2" /> Preview
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="w-full py-4 bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-2xl hover:bg-black transition-colors shadow-sm flex items-center justify-center text-lg"
                  >
                    <Printer className="w-5 h-5 mr-2" /> Print Bill
                  </button>
                  
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <>
                      <button 
                        onClick={() => { handleUpdateStatus(selectedOrder.id, 'cancelled'); }}
                        className="w-full py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-colors shadow-sm flex items-center justify-center text-lg"
                      >
                        <XCircle className="w-5 h-5 mr-2" /> Cancel Order
                      </button>
                      <button 
                        onClick={() => { handleUpdateStatus(selectedOrder.id, 'completed'); }}
                        className="w-full py-4 bg-[#0f8b4d] text-white font-bold rounded-2xl hover:bg-[#0c7340] transition-colors shadow-sm flex items-center justify-center text-lg"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Mark Complete
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'completed' && (
                     <div className="col-span-2 text-center py-2 text-green-700 font-bold bg-green-50 rounded-xl border border-green-200">
                       Order is Completed
                     </div>
                  )}
                  {selectedOrder.status === 'cancelled' && (
                     <div className="col-span-2 text-center py-2 text-red-700 font-bold bg-red-50 rounded-xl border border-red-200">
                       Order is Cancelled
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
`;

const newCode = code.substring(0, startIndex) + newModal + "\n" + code.substring(endIndex);
fs.writeFileSync('src/components/ManagerOrders.tsx', newCode);
console.log("Updated modal UI");
