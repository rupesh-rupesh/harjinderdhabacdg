const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const oldTopOrnament = `<div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#D4AF37]">
                <path d="M12 2L13.5 9H20.5L15 13.5L17 20.5L12 16L7 20.5L9 13.5L3.5 9H10.5L12 2Z" fill="currentColor" />
              </svg>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
            </div>`;

const newTopOrnament = `<div className="flex items-center justify-center gap-1.5 mb-4 text-[#D4AF37]">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
              <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C16 6.5 10 12 0 12C10 12 16 16 16 16C16 16 22 12 32 12C22 12 16 6.5 16 0Z" fill="currentColor" />
                <path d="M16 3C16 7 13 10 7 10C13 10 16 13 16 13C16 13 19 10 25 10C19 10 16 7 16 3Z" fill="currentColor" opacity="0.6"/>
              </svg>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
            </div>`;

code = code.replace(oldTopOrnament, newTopOrnament);
fs.writeFileSync('src/components/ManagerBilling.tsx', code);
