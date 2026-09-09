const fs = require('fs');
let code = fs.readFileSync('src/components/ThermalReceipt.tsx', 'utf-8');

if (!code.includes("import { Utensils }")) {
  code = code.replace("import React from 'react';", "import React from 'react';\nimport { Utensils } from 'lucide-react';");
}

const headerContent = `<div className="text-center mb-2">
        <div className="flex justify-center mb-1">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-[22px] uppercase mb-1 leading-[1.1] tracking-tight">HARJINDER TOURIST DHABA</h2>`;

code = code.replace(`<div className="text-center mb-2">
        <h2 className="font-bold text-xl uppercase mb-1 leading-none">HARJINDER TOURIST DHABA</h2>`, headerContent);

// Also make grand total larger text
code = code.replace(`className="flex justify-between font-bold text-lg mb-2"`, `className="flex justify-between font-bold text-xl mb-2"`);

fs.writeFileSync('src/components/ThermalReceipt.tsx', code);
