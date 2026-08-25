const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace toast.error(e.message) with a safe version
  content = content.replace(/toast\.error\(e\.message\);/g, `if (e.message && !e.message.toLowerCase().includes('cancel') && e.message !== 'Failed to fetch') { toast.error(e.message); }`);
  content = content.replace(/toast\.error\(err\.message\);/g, `if (err.message && !err.message.toLowerCase().includes('cancel') && err.message !== 'Failed to fetch') { toast.error(err.message); }`);

  if (filePath.includes('ManagerBilling.tsx')) {
    // Add connection logic before printReceipt
    const connectLogic = `        if (!printerService.isConnected()) {
          try {
             if (printerService.getConfig().type === 'webusb') {
                await printerService.connectWebUSB();
             } else if (printerService.getConfig().type === 'webbluetooth') {
                await printerService.connectWebBluetooth();
             }
          } catch (e: any) {
             if (e.message && !e.message.toLowerCase().includes('cancel') && !e.message.includes('permissions policy')) {
                 toast.error(e.message);
             } else if (e.message.includes('permissions policy')) {
                 toast.error('Bluetooth blocked by browser. Open in a new tab.');
             }
             return;
          }
        }`;
    
    content = content.replace(/if \(checkoutTable\?\.order\) \{\s*try \{/g, `if (checkoutTable?.order) {\n${connectLogic}\n        try {`);
  }

  if (filePath.includes('ManagerOrders.tsx')) {
    // Update the connect logic to handle cancel gracefully
    content = content.replace(/} catch \(err: any\) \{\s*toast\.error\("Please connect printer first\."\);\s*return;\s*\}/g, `} catch (err: any) {
           if (err.message && !err.message.toLowerCase().includes('cancel') && !err.message.includes('permissions policy')) {
             toast.error("Please connect printer first: " + err.message);
           } else if (err.message && err.message.includes('permissions policy')) {
             toast.error('Bluetooth blocked by browser. Open in a new tab.');
           }
           return;
         }`);
  }

  fs.writeFileSync(filePath, content);
}

patchFile('src/components/ManagerBilling.tsx');
patchFile('src/components/ManagerOrders.tsx');

console.log('patched');
