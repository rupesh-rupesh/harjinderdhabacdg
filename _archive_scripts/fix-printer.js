const fs = require('fs');
let code = fs.readFileSync('src/lib/printer/PrinterService.ts', 'utf8');

code = code.replace(
  /let items = \[\];\s*try \{ items = typeof order\.items === 'string' \? JSON\.parse\(order\.items\) : order\.items; \} catch\(e\) \{\}/,
  `let items = [];
      try {
        let parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) items = parsed;
      } catch(e) {
        console.error("Failed to parse order items", e);
      }`
);

fs.writeFileSync('src/lib/printer/PrinterService.ts', code);
