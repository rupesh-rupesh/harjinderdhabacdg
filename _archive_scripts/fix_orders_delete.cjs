const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

code = code.replace(
  `  const [selectedOrder, setSelectedOrder] = useState<any>(null);`,
  `  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);`
);

const oldHandleDelete = `  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(\`/api/admin/orders/\${id}\`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };`;

const newHandleDelete = `  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(\`/api/admin/orders/\${deleteConfirm}\`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === deleteConfirm) {
          setSelectedOrder(null);
        }
        setDeleteConfirm(null);
      }
    } catch (e) {
      console.error(e);
    }
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

const oldReturnEnd = `        </div>
      )}
    </div>
  );
}`;

const newReturnEnd = `        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Order</h3>
            <p className="text-stone-500 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(oldReturnEnd, newReturnEnd);

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
