const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const oldHeader = `        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 text-center">
          <h2 className="text-3xl font-serif font-bold text-dhaba-dark mb-2">Select a Table</h2>
          <p className="text-stone-500">Choose a table to start taking an order.</p>
        </div>`;

const newHeader = `        <div className="relative bg-gradient-to-br from-[#FFFDF5] to-[#FDF8E7] p-10 rounded-3xl shadow-sm border border-[#F2E5C5] text-center overflow-hidden">
          {/* Subtle background lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0 200 Q 150 100 400 0" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <path d="M0 150 Q 200 150 400 50" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <path d="M100 200 Q 250 50 400 150" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Top Ornament */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#D4AF37]">
                <path d="M12 2L13.5 9H20.5L15 13.5L17 20.5L12 16L7 20.5L9 13.5L3.5 9H10.5L12 2Z" fill="currentColor" />
              </svg>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3B291A] mb-3 tracking-tight">Select a Table</h2>
            
            {/* Bottom line */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-px bg-[#D4AF37] opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] opacity-80"></div>
              <div className="w-16 h-px bg-[#D4AF37] opacity-50"></div>
            </div>

            <p className="text-[#5C4D40] text-lg">Choose a table to start taking an order.</p>
          </div>
        </div>`;

code = code.replace(oldHeader, newHeader);

const oldGrid = `        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
            const tableOrder = activeOrders.find(o => {
              try {
                const items = JSON.parse(o.items);
                return items.some((item: any) => item.isTableMarker && item.name === \`Table \${num}\`);
              } catch (e) { return false; }
            });
            const isActive = !!tableOrder;

            return (
              <button
                key={num}
                onClick={() => {
                  if (isActive) {
                    setCheckoutTable({ num, order: tableOrder });
                  } else {
                    setTableSelection(num);
                  }
                }}
                className={\`aspect-square \${isActive ? 'bg-green-50 border-green-500' : 'bg-white border-stone-100'} border-2 hover:border-dhaba-orange rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md group relative\`}
              >
                <div className={\`w-14 h-14 rounded-full \${isActive ? 'bg-green-100 text-green-600' : 'bg-stone-50 text-stone-400'} group-hover:bg-orange-50 flex items-center justify-center transition-colors\`}>
                  <Table className={\`w-7 h-7 \${isActive ? 'text-green-600' : 'text-stone-400'} group-hover:text-dhaba-orange\`} />
                </div>
                <span className={\`text-lg font-bold \${isActive ? 'text-green-800' : 'text-stone-700'} group-hover:text-dhaba-dark\`}>Table {num}</span>
                {isActive && (
                  <div className="text-sm font-bold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                    ₹{tableOrder.total}
                  </div>
                )}
              </button>
            );
          })}
        </div>`;

const newGrid = `        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
            const tableOrder = activeOrders.find(o => {
              try {
                const items = JSON.parse(o.items);
                return items.some((item: any) => item.isTableMarker && item.name === \`Table \${num}\`);
              } catch (e) { return false; }
            });
            const isActive = !!tableOrder;

            return (
              <button
                key={num}
                onClick={() => {
                  if (isActive) {
                    setCheckoutTable({ num, order: tableOrder });
                  } else {
                    setTableSelection(num);
                  }
                }}
                className={\`aspect-square \${isActive ? 'bg-green-50 border-green-200 ring-2 ring-green-500 shadow-[0_4px_20px_rgba(34,197,94,0.15)]' : 'bg-white border-transparent shadow-[0_4px_24px_rgba(0,0,0,0.04)]'} rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group relative border\`}
              >
                <div className={\`w-20 h-20 rounded-full \${isActive ? 'bg-green-100 shadow-inner' : 'bg-[#FFF9EE] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'} flex items-center justify-center transition-colors relative before:content-[''] before:absolute before:inset-1.5 before:rounded-full before:border-2 before:border-[#F2E5C5] before:opacity-50\`}>
                  <LayoutGrid className={\`w-8 h-8 \${isActive ? 'text-green-600' : 'text-[#B8860B]'} relative z-10\`} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={\`text-xl font-bold \${isActive ? 'text-green-800' : 'text-[#3B291A]'}\`}>Table {num}</span>
                  {isActive && (
                    <span className="text-sm font-bold text-green-700 bg-green-200/50 px-2.5 py-0.5 rounded-full ring-1 ring-green-300">
                      ₹{tableOrder.total}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>`;

code = code.replace(oldGrid, newGrid);

// Ensure LayoutGrid is imported
if (!code.includes('LayoutGrid')) {
  code = code.replace('import { Package', 'import { LayoutGrid, Package');
}

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
