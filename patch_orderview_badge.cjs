const fs = require('fs');
let code = fs.readFileSync('src/components/OrderView.tsx', 'utf8');

code = code.replace(
  /\{item\.isBestSeller && \([\s\S]*?\} \)\}/,
  (match) => match + `
                    {item.category && (
                      <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-sm border border-stone-200/50 inline-block">
                        {item.category}
                      </span>
                    )}`
);
fs.writeFileSync('src/components/OrderView.tsx', code);
console.log('Patched OrderView badge');
