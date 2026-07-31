const fs = require('fs');

let content = fs.readFileSync('src/components/DemoNoticeModal.tsx', 'utf8');

content = content.replace('bg-black/60 backdrop-blur-sm', 'bg-[#1a110d]/70 backdrop-blur-sm');
content = content.replace('<div className="absolute inset-0 bg-[#FFF0E5] rounded-full blur-xl transform scale-150"></div>', `<div className="absolute inset-0 bg-[#FFF0E5] rounded-full blur-xl transform scale-150"></div>
                  {/* Subtle dotted ring */}
                  <svg width="104" height="104" viewBox="0 0 104 104" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                    <circle cx="52" cy="52" r="50" fill="none" stroke="#E85D04" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>`);

fs.writeFileSync('src/components/DemoNoticeModal.tsx', content);
console.log('Updated DemoNoticeModal.tsx refinements');
