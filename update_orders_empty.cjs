const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

const oldEmptyState = `          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-800 mb-1"><DevEmptyStateText /></h3>
              <p className="text-stone-500">No {activeTab} orders found.</p>
            </div>
          ) : (`;

const newEmptyState = `          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-24 px-6 relative overflow-hidden bg-white flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-8">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FFFDF5] to-[#FDF8E7] shadow-[inset_0_2px_10px_rgba(212,175,55,0.05),0_8px_30px_rgba(212,175,55,0.1)] border border-[#F2E5C5]/50 flex items-center justify-center mx-auto relative z-10">
                  <Package className="w-12 h-12 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                
                {/* Sparkles */}
                <div className="absolute top-0 -right-2 w-3.5 h-3.5 text-[#D4AF37] opacity-60">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z"/></svg>
                </div>
                <div className="absolute -top-1 left-2 w-2 h-2 text-[#D4AF37] opacity-40">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z"/></svg>
                </div>
                <div className="absolute bottom-4 -left-3 w-2 h-2 text-[#D4AF37] opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z"/></svg>
                </div>
                <div className="absolute top-1/2 -right-5 w-1.5 h-1.5 text-[#D4AF37] opacity-40">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z"/></svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[#3B291A] mb-3 max-w-md mx-auto leading-tight">
                <DevEmptyStateText />
              </h3>
              <p className="text-[#5C4D40] text-base mb-10">No {activeTab} orders found.</p>
              
              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37]">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/50"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37] opacity-80"></div>
                <div className="w-2.5 h-2.5 rotate-45 bg-transparent border border-[#D4AF37] opacity-80"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37] opacity-80"></div>
                <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/50"></div>
              </div>
            </div>
          ) : (`;

code = code.replace(oldEmptyState, newEmptyState);
fs.writeFileSync('src/components/ManagerOrders.tsx', code);
