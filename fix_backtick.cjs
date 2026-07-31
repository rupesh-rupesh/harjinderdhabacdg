const fs = require('fs');
let code = fs.readFileSync('src/components/ThermalReceipt.tsx', 'utf-8');
code = code.replace("itemName += \\` (\\${item.variantName})\\`;", "itemName += ` (${item.variantName})`;");
fs.writeFileSync('src/components/ThermalReceipt.tsx', code);
