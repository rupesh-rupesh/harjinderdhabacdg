const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// Replace the drinks variants section (from 1257 to 1300 roughly)
const regex = /selectedItemDetail\.variants && selectedItemDetail\.variants\.length > 0 \? \([\s\S]*?\) \) : selectedItemDetail\.hasHalfPortion \? \(/;

const newVariantsSection = `selectedItemDetail.variants && selectedItemDetail.variants.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {selectedItemDetail.variants.map((v: any, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => { 
                          if(!v.outOfStock) { 
                            addToCart({ ...selectedItemDetail, variantName: v.name, variantPrice: Number(v.price) }); 
                            setSelectedItemDetail(null); 
                          } 
                        }}
                        className={\`group relative flex flex-col items-center justify-center p-4 sm:p-5 border \${v.outOfStock ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed' : 'border-stone-200 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 hover:-translate-y-1 hover:shadow-md'} rounded-2xl transition-all duration-300\`}
                      >
                        <span className={\`text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2 \${v.outOfStock ? 'text-stone-400' : 'text-stone-500 group-hover:text-[var(--color-gold)]'} transition-colors\`}>{v.name}</span>
                        <span className={\`text-xl sm:text-2xl font-bold \${v.outOfStock ? 'text-stone-400' : 'text-[var(--color-brown)]'}\`}>₹{v.price}</span>
                        {v.outOfStock && <span className="absolute top-2 right-2 text-[8px] uppercase font-bold text-red-500 bg-red-100 px-1 py-0.5 rounded">Out of stock</span>}
                      </button>
                    ))}
                  </div>
                ) : selectedItemDetail.hasHalfPortion ? (`

code = code.replace(regex, newVariantsSection);

fs.writeFileSync('src/Storefront.tsx', code);
console.log('Patched modal variants');
