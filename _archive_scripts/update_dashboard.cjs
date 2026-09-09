const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf-8');

if (!code.includes('editingOrder')) {
  code = code.replace("const [activeModule, setActiveModule] = useState<'billing' | 'orders' | 'stats' | 'revenue'>('billing');", 
  "const [activeModule, setActiveModule] = useState<'billing' | 'orders' | 'stats' | 'revenue'>('billing');\n  const [editingOrder, setEditingOrder] = useState<any>(null);");

  code = code.replace("<ManagerBilling />", "<ManagerBilling editingOrder={editingOrder} clearEditingOrder={() => setEditingOrder(null)} />");
  
  code = code.replace("<ManagerOrders />", "<ManagerOrders onEditOrder={(order) => { setEditingOrder(order); setActiveModule('billing'); }} />");
  
  fs.writeFileSync('src/components/ManagerDashboard.tsx', code);
}
