const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /<tr key=\{item\.id\} className="hover:bg-stone-50 transition-colors">/g,
  '<tr key={item.id} className="hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => handleEdit(item)}>'
);

code = code.replace(
  /onClick=\{\(\) => setItemToDelete\(item\.id\)\}/g,
  'onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }}'
);

code = code.replace(
  /onClick=\{\(\) => handleEdit\(item\)\}/g,
  'onClick={(e) => { e.stopPropagation(); handleEdit(item); }}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Patched Admin row click');
