const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

// 1. Remove Add Item button
const addItemRegex = /\{\(selectedOrder\.status === 'pending' \|\| selectedOrder\.status === 'processing'\) && \([\s\S]*?\+ Add Item[\s\S]*?<\/button>\s*\)\}/;
code = code.replace(addItemRegex, '');

// 2. Remove showAddItem list
const showAddItemRegex = /\{showAddItem && \([\s\S]*?handleAddNewItem[\s\S]*?<\/div>\s*\)\}/;
code = code.replace(showAddItemRegex, '');

// 3. Remove plus minus trash block
const quantityRegex = /\{\(selectedOrder\.status === 'pending' \|\| selectedOrder\.status === 'processing'\) && \([\s\S]*?<Minus className="w-4 h-4" \/>[\s\S]*?<Trash2 className="w-5 h-5" \/>[\s\S]*?<\/button>\s*<\/div>\s*\)\}/;
code = code.replace(quantityRegex, '');

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
