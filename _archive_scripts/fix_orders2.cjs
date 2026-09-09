const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

const oldListBlock = `{parsedItems.map((item: any, i: number) => (
                              <li key={i} className="flex justify-between text-sm text-stone-700">
                                <span>{item.quantity}x {item.name} {item.variantName ? \`(\${item.variantName})\` : ''} {item.isHalf ? '(Half)' : ''} {item.isButter ? '+ Butter' : ''}</span>
                                <span className="font-medium">₹{(item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity}</span>
                              </li>
                            ))}`;

const newListBlock = `{parsedItems.map((item: any, i: number) => {
                              if (item.isTableMarker) {
                                return (
                                  <li key={i} className="flex justify-between text-sm font-bold text-stone-800 pb-1 border-b border-stone-100 mb-1">
                                    <span>{item.name}</span>
                                  </li>
                                );
                              }
                              return (
                                <li key={i} className="flex justify-between text-sm text-stone-700">
                                  <span>{item.quantity}x {item.name} {item.variantName ? \`(\${item.variantName})\` : ''} {item.isHalf ? '(Half)' : ''} {item.isButter ? '+ Butter' : ''}</span>
                                  <span className="font-medium">₹{(item.price + (item.isButter ? item.butterPrice || 0 : 0)) * item.quantity}</span>
                                </li>
                              );
                            })}`;

code = code.replace(oldListBlock, newListBlock);
fs.writeFileSync('src/components/ManagerOrders.tsx', code);
