const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

code = code.replace("export default function ManagerOrders() {", 
"export default function ManagerOrders({ onEditOrder }: { onEditOrder?: (order: any) => void }) {");

code = code.replace("onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}",
"onClick={(e) => { e.stopPropagation(); if (onEditOrder) onEditOrder(order); else setSelectedOrder(order); }}");

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
