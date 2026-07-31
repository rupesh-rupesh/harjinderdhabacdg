const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

code = code.replace(
  "export default function ManagerBilling() {",
  "export default function ManagerBilling({ editingOrder, clearEditingOrder }: { editingOrder?: any, clearEditingOrder?: () => void }) {"
);

const useEffectEditing = `  useEffect(() => {
    if (editingOrder) {
      let tableNum = null;
      try {
        const items = typeof editingOrder.items === 'string' ? JSON.parse(editingOrder.items) : editingOrder.items;
        const marker = items.find((i: any) => i.isTableMarker);
        if (marker) {
           const numMatch = marker.name.match(/\\d+/);
           if (numMatch) tableNum = parseInt(numMatch[0]);
        }
        
        setCart(items.filter((i: any) => !i.isTableMarker));
      } catch (e) {}

      if (tableNum) {
        setTableSelection(tableNum);
        setEditingOrderId(editingOrder.id);
      }
      if (clearEditingOrder) clearEditingOrder();
    }
  }, [editingOrder]);`;

code = code.replace(
  "  const [activeOrders, setActiveOrders] = useState<any[]>([]);",
  "  const [activeOrders, setActiveOrders] = useState<any[]>([]);\n" + useEffectEditing
);

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
