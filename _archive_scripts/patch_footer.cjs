const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(/hover:from-dhaba-orange hover:to-dhaba-yellow/g, 'hover:from-[var(--color-gold)] hover:to-[#E6B355]');

fs.writeFileSync('src/Storefront.tsx', code);
