const fs = require('fs');
let content = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf8');

// Replace connection catch blocks in ManagerOrders.tsx
const catchRegex = /\} catch \(err: any\) \{\s*toast\.error\("Please connect printer first\."\);\s*return;[^\n]*\n\s*\}/g;
const newCatch = `} catch (err: any) {
           if (err.message && !err.message.toLowerCase().includes('cancel') && !err.message.includes('permissions policy')) {
             toast.error("Please connect printer first: " + err.message);
           } else if (err.message && err.message.includes('permissions policy')) {
             toast.error('Bluetooth blocked by browser. Open in a new tab.');
           }
           return;
         }`;

content = content.replace(catchRegex, newCatch);

fs.writeFileSync('src/components/ManagerOrders.tsx', content);
console.log('ManagerOrders patched');
