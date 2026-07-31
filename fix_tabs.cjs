const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

const oldTabs = `<div className="flex border-b border-stone-100/80 overflow-x-auto bg-[#FAFAFA] rounded-t-3xl">
          {['active', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={\`flex-1 py-5 px-6 text-sm font-bold capitalize whitespace-nowrap transition-all relative \${
                activeTab === tab 
                  ? 'text-[#E8751A]' 
                  : 'text-[#5C4D40] hover:text-[#3B291A] hover:bg-black/5'
              }\`}
            >
              {tab} Orders
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E8751A] shadow-[0_-2px_10px_rgba(232,117,26,0.3)]"></div>
              )}
            </button>
          ))}
        </div>`;

const newTabs = `<div className="flex border-b border-stone-100/80 overflow-x-auto bg-white rounded-t-3xl">
          {['active', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={\`flex-1 py-5 px-6 text-sm font-bold capitalize whitespace-nowrap transition-all relative \${
                activeTab === tab 
                  ? 'text-[#E8751A]' 
                  : 'text-[#5C4D40] hover:text-[#3B291A] hover:bg-stone-50'
              }\`}
            >
              {tab} Orders
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E8751A]"></div>
              )}
            </button>
          ))}
        </div>`;

code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/components/ManagerOrders.tsx', code);
