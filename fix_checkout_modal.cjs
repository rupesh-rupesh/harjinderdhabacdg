const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const modalButtonsOriginal = `                <div className="flex gap-3">
                  <button 
                    onClick={() => setCheckoutTable(null)}
                    className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {`;

const modalButtonsNew = `                <div className="flex gap-2 flex-wrap mb-4">
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
                    onClick={() => {`;

code = code.replace(modalButtonsOriginal, modalButtonsNew);

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
