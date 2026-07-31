const fs = require('fs');
let content = fs.readFileSync('src/lib/printer/ESCPosGenerator.ts', 'utf8');

// Remove crossOrigin
content = content.replace(/img\.crossOrigin = 'Anonymous';\n/g, '');

fs.writeFileSync('src/lib/printer/ESCPosGenerator.ts', content);
console.log('patched escpos');
