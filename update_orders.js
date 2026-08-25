const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

code = code.replace(
  `import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X } from 'lucide-react';`,
  `import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus } from 'lucide-react';`
);

code = code.replace(
  `  const [selectedOrder, setSelectedOrder] = useState<any>(null);`,
  `  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);`
);

code = code.replace(
  `  useEffect(() => {
    fetchOrders();`,
  `  useEffect(() => {
    fetchOrders();
    fetch('/api/storefront-data').then(res => res.json()).then(data => {
      if (data.menuItems) setMenuItems(data.menuItems);
    }).catch(console.error);`
);

const handleUpdateItemStr = `
  const handleUpdateItemQty = async (index: number, change: number) => {
    if (!selectedOrder) return;
    try {
      const items = JSON.parse(selectedOrder.items);
      items[index].quantity += change;
      if (items[index].quantity <= 0) {
        items.splice(index, 1);
      }
      
      const newTotal = items.reduce((acc: number, item: any) => acc + (item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity, 0);
      
      const newOrder = { ...selectedOrder, items: JSON.stringify(items), total: newTotal };
      setSelectedOrder(newOrder);
      
      await fetch(\`/api/admin/orders/\${selectedOrder.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder.items, total: newTotal })
      });
      fetchOrders();
    } catch(e) {}
  };

  const handleAddNewItem = async (menuItem: any) => {
    if (!selectedOrder) return;
    try {
      const items = JSON.parse(selectedOrder.items);
      const existingIdx = items.findIndex((i: any) => i.id === menuItem.id && !i.variantName && !i.isHalf && !i.isButter);
      if (existingIdx >= 0) {
        items[existingIdx].quantity += 1;
      } else {
        items.push({
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        });
      }
      
      const newTotal = items.reduce((acc: number, item: any) => acc + (item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity, 0);
      const newOrder = { ...selectedOrder, items: JSON.stringify(items), total: newTotal };
      setSelectedOrder(newOrder);
      
      await fetch(\`/api/admin/orders/\${selectedOrder.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder.items, total: newTotal })
      });
      fetchOrders();
      setShowAddItem(false);
    } catch(e) {}
  };
`;

code = code.replace(
  `  const handleDelete = async (id: number, e?: React.MouseEvent) => {`,
  handleUpdateItemStr + `\n  const handleDelete = async (id: number, e?: React.MouseEvent) => {`
);

const itemsBlockOld = `{(() => {
                    try {
                      return JSON.parse(selectedOrder.items).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex-1">
                            <span className="font-bold mr-2 text-stone-800">{item.quantity}x</span>
                            <span className="text-stone-600">{item.name}</span>
                            {(item.variantName || item.isHalf || item.isButter) && (
                              <div className="text-xs text-stone-400 mt-0.5 ml-6">
                                {[item.variantName, item.isHalf && 'Half Portion', item.isButter && 'Extra Butter'].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </div>
                          <div className="font-medium text-stone-800">
                            ₹{(item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity}
                          </div>
                        </div>
                      ));
                    } catch (e) {
                      return <div>Error loading items</div>;
                    }
                  })()}`;

const itemsBlockNew = `{(() => {
                    try {
                      const items = JSON.parse(selectedOrder.items);
                      if (items.length === 0) return <div className="text-stone-500 py-2">No items in this order.</div>;
                      return items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm group">
                          <div className="flex-1">
                            <span className="font-bold mr-2 text-stone-800">{item.quantity}x</span>
                            <span className="text-stone-600">{item.name}</span>
                            {(item.variantName || item.isHalf || item.isButter) && (
                              <div className="text-xs text-stone-400 mt-0.5 ml-6">
                                {[item.variantName, item.isHalf && 'Half Portion', item.isButter && 'Extra Butter'].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="font-medium text-stone-800 w-16 text-right">
                              ₹{(item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity}
                            </div>
                            {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleUpdateItemQty(i, -1)} className="p-1 hover:bg-stone-200 rounded-full text-stone-500"><Minus className="w-4 h-4" /></button>
                                <button onClick={() => handleUpdateItemQty(i, 1)} className="p-1 hover:bg-stone-200 rounded-full text-stone-500"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => handleUpdateItemQty(i, -item.quantity)} className="p-1 hover:bg-red-100 text-red-500 rounded-full ml-1"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    } catch (e) {
                      return <div>Error loading items</div>;
                    }
                  })()}`;

code = code.replace(itemsBlockOld, itemsBlockNew);

const addBtnBlock = `              <div className="space-y-4">
                <div className="text-sm text-stone-500 font-medium">Order Items</div>`;

const addBtnNewBlock = `              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-stone-500 font-medium">Order Items</div>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button 
                      onClick={() => setShowAddItem(!showAddItem)}
                      className="text-xs font-medium text-dhaba-orange hover:bg-orange-50 px-2 py-1 rounded transition-colors flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Item
                    </button>
                  )}
                </div>
                
                {showAddItem && (
                  <div className="bg-white border border-stone-200 p-2 rounded-xl shadow-sm mb-4 max-h-48 overflow-y-auto">
                    {menuItems.map(mi => (
                      <button 
                        key={mi.id} 
                        onClick={() => handleAddNewItem(mi)}
                        className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg flex justify-between text-sm"
                      >
                        <span className="font-medium text-stone-700">{mi.name}</span>
                        <span className="text-stone-500">₹{mi.price}</span>
                      </button>
                    ))}
                  </div>
                )}`;

code = code.replace(addBtnBlock, addBtnNewBlock);

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
