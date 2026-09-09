const fs = require('fs');
const replaceInFile = (file) => {
  let txt = fs.readFileSync(file, 'utf8');
  txt = txt.replace(/<([a-zA-Z0-9]+)([^>]*?className=["'][^"']*?overflow-y-auto[^"']*?["'])([^>]*?)>/g, (m, tag, c1, c2) => {
    if (m.includes('data-lenis-prevent')) return m;
    return `<${tag}${c1} data-lenis-prevent="true"${c2}>`;
  });
  fs.writeFileSync(file, txt);
  console.log('Fixed', file);
};
replaceInFile('src/components/ManagerBilling.tsx');
replaceInFile('src/components/ManagerOrders.tsx');
