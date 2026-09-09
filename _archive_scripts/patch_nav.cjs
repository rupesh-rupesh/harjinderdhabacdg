const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(/text-dhaba-dark/g, 'text-[var(--color-brown)]');
code = code.replace(/text-dhaba-orange/g, 'text-[var(--color-gold)]');

fs.writeFileSync('src/Storefront.tsx', code);
