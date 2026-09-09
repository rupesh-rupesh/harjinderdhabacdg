const fs = require('fs');

let content = fs.readFileSync('src/lib/printer/PrinterService.ts', 'utf8');

// Replace console.error(e) inside connectWebUSB and connectWebBluetooth
content = content.replace(/console\.error\(e\);/g, `if (e && !e.message?.toLowerCase().includes('cancel')) console.warn(e.message);`);

// Replace console.error('Print Error:', e);
content = content.replace(/console\.error\('Print Error:', e\);/g, `if (e && !e.message?.toLowerCase().includes('cancel') && !e.message?.includes('permissions policy')) console.warn('Print Error:', e.message);`);

fs.writeFileSync('src/lib/printer/PrinterService.ts', content);

let escposContent = fs.readFileSync('src/lib/printer/ESCPosGenerator.ts', 'utf8');
escposContent = escposContent.replace(/console\.error\("Failed to print image", e\);/g, `console.warn("Failed to print image: " + e.message);`);
fs.writeFileSync('src/lib/printer/ESCPosGenerator.ts', escposContent);

console.log('patched printer service errors');
