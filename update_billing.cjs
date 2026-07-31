const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

code = code.replace(
  `  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);`,
  `  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);`
);

const fetchOrdersCode = `
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setActiveOrders(data.filter((o: any) => o.status === 'pending' || o.status === 'processing'));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);
`;

code = code.replace(
  `  useEffect(() => {
    const fetchData = async () => {`,
  fetchOrdersCode + `\n  useEffect(() => {
    const fetchData = async () => {`
);

const tableGridOld = `        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setTableSelection(num)}
              className="aspect-square bg-white border-2 border-stone-100 hover:border-dhaba-orange rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md group"
            >
              <div className="w-16 h-16 rounded-full bg-stone-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                <Table className="w-8 h-8 text-stone-400 group-hover:text-dhaba-orange" />
              </div>
              <span className="text-lg font-bold text-stone-700 group-hover:text-dhaba-dark">Table {num}</span>
            </button>
          ))}
        </div>`;

const tableGridNew = `        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
            const tableOrder = activeOrders.find(o => {
              try {
                const items = JSON.parse(o.items);
                return items.some((item: any) => item.isTableMarker && item.name === \`Table \${num}\`);
              } catch (e) { return false; }
            });
            const isActive = !!tableOrder;

            return (
              <button
                key={num}
                onClick={() => {
                  if (isActive) {
                    if (window.confirm(\`Table \${num} has an active bill of ₹\${tableOrder.total}. Mark it as paid to start a new order?\`)) {
                      fetch(\`/api/admin/orders/\${tableOrder.id}\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'completed' })
                      }).then(() => {
                        fetchOrders();
                        setTableSelection(num);
                      });
                    }
                  } else {
                    setTableSelection(num);
                  }
                }}
                className={\`aspect-square \${isActive ? 'bg-green-50 border-green-500' : 'bg-white border-stone-100'} border-2 hover:border-dhaba-orange rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md group relative\`}
              >
                <div className={\`w-14 h-14 rounded-full \${isActive ? 'bg-green-100 text-green-600' : 'bg-stone-50 text-stone-400'} group-hover:bg-orange-50 flex items-center justify-center transition-colors\`}>
                  <Table className={\`w-7 h-7 \${isActive ? 'text-green-600' : 'text-stone-400'} group-hover:text-dhaba-orange\`} />
                </div>
                <span className={\`text-lg font-bold \${isActive ? 'text-green-800' : 'text-stone-700'} group-hover:text-dhaba-dark\`}>Table {num}</span>
                {isActive && (
                  <div className="text-sm font-bold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                    ₹{tableOrder.total}
                  </div>
                )}
              </button>
            );
          })}
        </div>`;

code = code.replace(tableGridOld, tableGridNew);

fs.writeFileSync('src/components/ManagerBilling.tsx', code);
