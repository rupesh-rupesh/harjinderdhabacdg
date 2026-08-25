const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

const startIndex = code.indexOf('{selectedOrder && (');
const endIndex = code.indexOf('      {deleteConfirm && (');

const newModal = `{selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="bg-[#fafafa] rounded-3xl shadow-2xl w-full max-w-xl relative z-10 flex flex-col max-h-[95vh]">
            <div className="p-8 pb-4 overflow-y-auto flex-1">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-8 relative">
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-full bg-[#fdf5f0] flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7 text-[#E85D04]" />
                  </div>
                  <div>
                    <h2 className="text-[26px] font-bold text-stone-900 mb-2 leading-none mt-1 tracking-tight">Order #{selectedOrder.id}</h2>
                    {(() => {
                       let items = [];
                       try { items = JSON.parse(selectedOrder.items); } catch(e) {}
                       const tableMarker = items.find((i: any) => i.isTableMarker);
                       return tableMarker ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fdf5f0] text-[#E85D04] rounded-full text-[13px] font-semibold border border-[#fdecdb] mb-4">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
                           {tableMarker.name}
                         </div>
                       ) : <div className="mb-4"></div>;
                    })()}
                    <div className="flex items-center gap-4 text-stone-500 text-[14px] font-medium">
                      <div className="flex items-center gap-1.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {new Date(selectedOrder.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="w-[1px] h-3 bg-stone-300"></div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 absolute top-0 right-0">
                  <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="absolute top-12 right-0">
                  <div className={\`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[15px] font-semibold border \${
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

              {/* Order Items Section */}
              <div className="mt-8 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
                    <ShoppingBag className="w-5 h-5 text-[#E85D04]" /> Order Items
                  </div>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button 
                      onClick={() => setShowAddItem(!showAddItem)}
                      className="text-[#E85D04] font-bold hover:text-[#c44e03] transition-colors text-sm flex items-center"
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

                <div className="bg-white border border-stone-100 rounded-[20px] shadow-sm p-2">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedOrder.items);
                      
                      if (items.length === 0) return <div className="text-stone-500 py-4 text-center">No items in this order.</div>;
                      
                      return items.map((item: any, i: number) => {
                        const originalIndex = items.findIndex((orig: any) => orig === item);
                        if (item.isTableMarker) {
                           return (
                             <div key={i} className="mb-2 mt-1 px-3">
                               <div className="inline-flex px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold border border-stone-200">
                                 {item.name}
                               </div>
                             </div>
                           );
                        }
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#fdf5f0] text-[#E85D04] font-bold rounded-xl flex items-center justify-center text-[15px]">
                                {item.quantity}x
                              </div>
                              <div>
                                <span className="font-bold text-stone-900 text-[17px]">{item.name}</span>
                                {(item.variantName || item.isHalf || item.isButter) && (
                                  <div className="text-[13px] text-stone-500 mt-0.5">
                                    {[item.variantName, item.isHalf && 'Half', item.isButter && '+ Butter'].filter(Boolean).join(' • ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="font-bold text-stone-900 text-lg w-20 text-right">
                                ₹{((item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity).toFixed(2)}
                              </div>
                              
                              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                                    <button onClick={() => handleUpdateItemQty(originalIndex, -1)} className="px-3 py-2 hover:bg-stone-50 text-stone-500 transition-colors"><Minus className="w-4 h-4" /></button>
                                    <span className="w-6 text-center font-bold text-[15px]">{item.quantity}</span>
                                    <button onClick={() => handleUpdateItemQty(originalIndex, 1)} className="px-3 py-2 hover:bg-stone-50 text-stone-500 transition-colors"><Plus className="w-4 h-4" /></button>
                                  </div>
                                  <button 
                                    onClick={() => handleUpdateItemQty(originalIndex, -item.quantity)} 
                                    className="p-2 border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
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
              <div className="border border-stone-100 rounded-[20px] p-6 bg-white shadow-sm space-y-4">
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
                        <div className="flex justify-between items-center text-stone-800 text-[15px]">
                          <span>Sub Total</span>
                          <span className="font-bold text-[17px]">₹{subTotal.toFixed(2)}</span>
                        </div>
                        {generateGst && (
                          <div className="flex justify-between items-center text-stone-500 text-[15px]">
                            <span className="flex items-center gap-1">GST (5%) <ChevronDown className="w-4 h-4" /></span>
                            <span className="font-medium text-stone-700">₹{calculatedGst.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-stone-200 border-dashed my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-900 text-xl">Grand Total</span>
                          <span className="font-bold text-[#E85D04] text-[32px] tracking-tight">₹{Number(selectedOrder.total).toFixed(2)}</span>
                        </div>
                     </>
                   )
                })()}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-8 pt-6 pb-8 bg-[#fafafa] rounded-b-3xl shrink-0">
               <div className="flex items-start gap-3 mb-6">
                 <input 
                    type="checkbox" 
                    id="gst-checkbox" 
                    checked={generateGst}
                    onChange={(e) => setGenerateGst(e.target.checked)}
                    className="w-[22px] h-[22px] rounded border-stone-300 text-[#E85D04] focus:ring-[#E85D04] mt-0.5 accent-[#E85D04]"
                  />
                  <div>
                    <label htmlFor="gst-checkbox" className="font-bold text-stone-900 text-[15px] cursor-pointer block leading-none mb-1">Generate GST Bill</label>
                    <p className="text-stone-500 text-[13px]">CGST 2.5% + SGST 2.5% will be added</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowReceiptPreview(true)}
                    className="w-full py-[18px] bg-white border border-stone-200 text-stone-800 font-bold rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-center text-lg"
                  >
                    <Eye className="w-6 h-6 mr-2" /> Preview
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="w-full py-[18px] bg-[#2b1f15] text-[#e8ba7d] font-bold rounded-2xl hover:bg-black transition-colors flex items-center justify-center text-lg shadow-md"
                  >
                    <Printer className="w-6 h-6 mr-2" /> Print Bill
                  </button>
                  
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <>
                      <button 
                        onClick={() => { handleUpdateStatus(selectedOrder.id, 'cancelled'); }}
                        className="w-full py-[18px] bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center text-lg"
                      >
                        <XCircle className="w-6 h-6 mr-2" /> Cancel Order
                      </button>
                      <button 
                        onClick={() => { handleUpdateStatus(selectedOrder.id, 'completed'); }}
                        className="w-full py-[18px] bg-[#0f8b4d] text-white font-bold rounded-2xl hover:bg-[#0c7340] transition-colors shadow-md flex items-center justify-center text-lg"
                      >
                        <CheckCircle2 className="w-6 h-6 mr-2" /> Mark Complete
                      </button>
                      <button 
                        onClick={() => { if (onEditOrder) onEditOrder(selectedOrder); }}
                        className="col-span-2 w-full py-4 bg-[#fdf5f0] text-[#E85D04] font-bold rounded-2xl hover:bg-[#fce9dc] transition-colors flex items-center justify-center text-lg"
                      >
                        <Edit className="w-5 h-5 mr-2" /> Edit Order
                      </button>
                    </>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
`;

code = code.substring(0, startIndex) + newModal + "\n" + code.substring(endIndex);
fs.writeFileSync('src/components/ManagerOrders.tsx', code);
