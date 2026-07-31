const fs = require('fs');

// Patch Storefront.tsx (Specials)
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');
code = code.replace(
  /\{item\.isBestSeller && \([\s\S]*?\} \)\}/,
  (match) => match + `
                    {item.category && (
                      <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-stone-200/50 flex items-center">
                        {item.category}
                      </span>
                    )}`
);
fs.writeFileSync('src/Storefront.tsx', code);


// Patch MenuView.tsx
let menuCode = fs.readFileSync('src/components/MenuView.tsx', 'utf8');
menuCode = menuCode.replace(
  /\{item\.isBestSeller && \([\s\S]*?\} \)\}/,
  (match) => match + `
                    {item.category && (
                      <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-stone-200/50 flex items-center">
                        {item.category}
                      </span>
                    )}`
);
fs.writeFileSync('src/components/MenuView.tsx', menuCode);

console.log("Patched category badges");
