const fs = require('fs');
let code = fs.readFileSync('src/components/OrderView.tsx', 'utf8');

code = code.replace(
  /updateQuantity\(item\.name, item\.isHalf \|\| false, item\.isButter \|\| false, -1\)\}/g,
  'updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1); }}'
);

code = code.replace(
  /updateQuantity\(item\.name, item\.isHalf \|\| false, item\.isButter \|\| false, 1\)\}/g,
  'updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1); }}'
);

fs.writeFileSync('src/components/OrderView.tsx', code);
console.log('Fixed OrderView syntax');
