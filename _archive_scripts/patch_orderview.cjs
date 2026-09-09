const fs = require('fs');
let code = fs.readFileSync('src/components/OrderView.tsx', 'utf8');

// The card root is a <div> with `className="flex flex-col sm:flex-row gap-4 p-4...`
// Let's find it. It's inside `{filteredItems.map(item => (` around line 240
code = code.replace(
  /<div key=\{item\.id\} className=\{\`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-stone-100 overflow-hidden group/g,
  '<div key={item.id} onClick={() => setSelectedItemDetail(item)} className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-stone-100 overflow-hidden group cursor-pointer'
);

// Prevent default on the Add button so it doesn't open the modal when clicking Add
code = code.replace(
  /onClick=\{\(\) => addToCart\(\{ \.\.\.item, isHalf: false \}\)\}/g,
  'onClick={(e) => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}'
);

code = code.replace(
  /onClick=\{\(\) => updateQuantity\(/g,
  'onClick={(e) => { e.stopPropagation(); updateQuantity('
);

// We need to stopPropagation on the entire quantity controller container just in case
code = code.replace(
  /<div className="w-full flex items-center justify-between bg-dhaba-orange text-white rounded-lg overflow-hidden shadow-md animate-pop-in">/g,
  '<div onClick={(e) => e.stopPropagation()} className="w-full flex items-center justify-between bg-dhaba-orange text-white rounded-lg overflow-hidden shadow-md animate-pop-in">'
);

fs.writeFileSync('src/components/OrderView.tsx', code);
console.log('Patched OrderView');
