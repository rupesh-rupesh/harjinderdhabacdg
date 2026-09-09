const fs = require('fs');
let code = fs.readFileSync('src/components/ThermalReceipt.tsx', 'utf-8');

const originalHeader = `      {/* Header */}
      <div className="text-center mb-2">
        <div className="flex justify-center mb-1">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-[22px] uppercase mb-1 leading-[1.1] tracking-tight">HARJINDER TOURIST DHABA</h2>`;

const newHeader = `      {/* Header */}
      <div className="text-center mb-2 flex flex-col items-center">
        <img src="/bill-logo.png" alt="Logo" className="w-24 h-24 object-contain mb-1 grayscale filter contrast-125" />
        <h2 className="font-bold text-[22px] uppercase mb-1 leading-[1.1] tracking-tight mt-1">HARJINDER TOURIST DHABA</h2>`;

code = code.replace(originalHeader, newHeader);
fs.writeFileSync('src/components/ThermalReceipt.tsx', code);
