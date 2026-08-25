const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerStats.tsx', 'utf-8');

const oldHeader = `<div className="relative z-10 flex flex-col items-start justify-center">
          <h2 className="text-4xl font-serif font-bold text-[#3B291A] mb-2 tracking-tight">Manager Stats</h2>
          <p className="text-[#5C4D40] text-lg mb-6">Overview of POS and order metrics.</p>

          <div className="flex items-center gap-2">
            <div className="w-16 h-[1px] bg-[#D4AF37] opacity-50"></div>
            <div className="w-2 h-2 rotate-45 bg-[#D4AF37] opacity-80"></div>
            <div className="w-16 h-[1px] bg-[#D4AF37] opacity-50"></div>
          </div>
        </div>`;

const newHeader = `<div className="relative z-10">
          <div className="flex flex-col items-start justify-center text-left mb-8">
            <h2 className="text-4xl font-serif font-bold text-[#3B291A] mb-2 tracking-tight">Manager Stats</h2>
            <p className="text-[#5C4D40] text-lg">Overview of POS and order metrics.</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-24 h-[1px] bg-[#D4AF37] opacity-50"></div>
            <div className="w-2 h-2 rotate-45 bg-[#D4AF37] opacity-80"></div>
            <div className="w-24 h-[1px] bg-[#D4AF37] opacity-50"></div>
          </div>
        </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/ManagerStats.tsx', code);
