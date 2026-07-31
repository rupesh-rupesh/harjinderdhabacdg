const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

const startTarget = '<div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">';
const endTarget = '{selectedOrder && (';

const startIndex = code.indexOf(startTarget);
const endIndex = code.indexOf(endTarget);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find targets");
  process.exit(1);
}

const newLayout = `
    <div className="space-y-0 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-stone-200">
        {[
          { id: 'active', label: 'Live Orders', icon: Bell },
          { id: 'completed', label: 'Completed Orders', icon: CheckCircle2 },
          { id: 'cancelled', label: 'Cancelled Orders', icon: XCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={\`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-medium transition-colors relative \${
              activeTab === tab.id ? 'text-[#E85D04]' : 'text-stone-500 hover:text-stone-800'
            }\`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E85D04]" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#fafafa]">
        {/* Header Section */}
        <div className="p-6 pb-2 flex justify-between items-end">
          <div>
            <h2 className="text-[22px] font-bold text-stone-900 mb-1 tracking-tight">
              {activeTab === 'active' ? 'Live Orders' : activeTab === 'completed' ? 'Completed Orders' : 'Cancelled Orders'}
            </h2>
            <p className="text-stone-500 text-sm">
              {activeTab === 'active' ? 'Currently active orders' : activeTab === 'completed' ? 'All successfully completed orders' : 'Cancelled orders'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 bg-white rounded-lg text-stone-700 hover:bg-stone-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Filter <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-stone-500 animate-pulse">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-24 px-6 relative overflow-hidden bg-[#fafafa] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">No {activeTab} orders found</h3>
              <p className="text-stone-500">When you receive new orders, they will appear here.</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              return (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-[14px] hover:border-[#E85D04]/30 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0 border border-green-100">
                      <ClipboardCheck className="w-[22px] h-[22px] text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[17px] text-stone-900 leading-tight mb-1">Order #{order.id}</h3>
                      <p className="text-[#888] text-[13px]">
                        {new Date(order.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                     {/* Status Badge */}
                     {activeTab === 'completed' && (
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] text-green-700 rounded-lg border border-green-200 text-sm font-semibold">
                         <CheckCircle2 className="w-4 h-4" /> Completed
                       </div>
                     )}
                     {activeTab === 'cancelled' && (
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-semibold">
                         <XCircle className="w-4 h-4" /> Cancelled
                       </div>
                     )}
                     {activeTab === 'active' && (
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
                         <Clock className="w-4 h-4" /> Live
                       </div>
                     )}
                     
                     <div className="text-[19px] font-bold text-[#E85D04] w-24 text-right">
                       ₹{Number(order.total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                     </div>

                     <button 
                       onClick={(e) => { e.stopPropagation(); handleDelete(order.id, e); }}
                       className="p-[10px] border border-stone-200 bg-[#fafafa] rounded-[10px] text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              );
            })
          )}
          
          {filteredOrders.length > 0 && (
            <div className="pt-10 pb-6 text-center relative">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-200 -z-10" />
              <div className="inline-flex flex-col items-center bg-[#fafafa] px-6">
                <div className="w-10 h-10 rounded-full bg-[#fdf5f0] text-[#E85D04] flex items-center justify-center mb-3">
                  <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </div>
                <p className="text-stone-500 text-[13px] font-medium">You've reached the end</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
      `;

const newCode = code.substring(0, startIndex) + newLayout + code.substring(endIndex);
fs.writeFileSync('src/components/ManagerOrders.tsx', newCode);
console.log("Updated ManagerOrders layout");
