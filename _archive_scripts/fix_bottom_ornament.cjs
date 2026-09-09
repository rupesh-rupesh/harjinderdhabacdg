const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const oldBottom = `<div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-px bg-[#D4AF37] opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] opacity-80"></div>
              <div className="w-16 h-px bg-[#D4AF37] opacity-50"></div>
            </div>`;

const newBottom = `<div className="flex items-center justify-center gap-2 mb-4 mt-2">
              <div className="w-16 h-[1px] bg-[#D4AF37] opacity-50"></div>
              <div className="w-2 h-2 rotate-45 bg-[#D4AF37] opacity-80"></div>
              <div className="w-16 h-[1px] bg-[#D4AF37] opacity-50"></div>
            </div>`;

code = code.replace(oldBottom, newBottom);
fs.writeFileSync('src/components/ManagerBilling.tsx', code);
