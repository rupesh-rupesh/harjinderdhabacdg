const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

code = code.replace(
  "const [tableSelection, setTableSelection] = useState<number | null>(null);",
  "const [tableSelection, setTableSelection] = useState<number | null>(null);\n  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);"
);

const submitOrderOriginal = `  const submitOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!tableSelection) return toast.error("No table selected");
    
    setIsSubmitting(true);
    try {
      const finalTotal = generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal;
      const res = await fetch('/api/admin/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableSelection,
          items: cart,
          total: finalTotal
        })
      });
      
      if (res.ok) {
        toast.success(\`Order placed for Table \${tableSelection}\`);
        setCart([]);
        setTableSelection(null); // Return to table selection
        fetchOrders();
      } else {
        toast.error("Failed to place order");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };`;

const submitOrderNew = `  const submitOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!tableSelection) return toast.error("No table selected");
    
    setIsSubmitting(true);
    try {
      const finalTotal = generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal;
      
      const endpoint = editingOrderId ? \`/api/admin/orders/\${editingOrderId}\` : '/api/admin/pos/orders';
      const method = editingOrderId ? 'PUT' : 'POST';
      
      const payload: any = { total: finalTotal };
      
      if (editingOrderId) {
        const posItems = [
          { name: \`Table \${tableSelection}\`, price: 0, quantity: 1, isTableMarker: true },
          ...cart
        ];
        payload.items = JSON.stringify(posItems);
      } else {
        payload.tableNumber = tableSelection;
        payload.items = cart;
      }
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(editingOrderId ? \`Order updated for Table \${tableSelection}\` : \`Order placed for Table \${tableSelection}\`);
        setCart([]);
        setEditingOrderId(null);
        setTableSelection(null);
        fetchOrders();
      } else {
        toast.error("Failed to save order");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(submitOrderOriginal, submitOrderNew);

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
