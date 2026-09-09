const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(/from-dhaba-dark\/90 via-dhaba-dark\/50 to-dhaba-dark\/95/g, 'from-[var(--color-brown)]/90 via-[var(--color-brown)]/50 to-[var(--color-brown)]/95');

code = code.replace(/from-dhaba-yellow to-dhaba-orange/g, 'from-[var(--color-gold)] to-[#E6B355]');

code = code.replace(/hover:from-dhaba-orange-light hover:to-dhaba-yellow/g, 'hover:from-[#E6B355] hover:to-[var(--color-gold)]');

code = code.replace(/hover:shadow-dhaba-orange\/40/g, 'hover:shadow-[var(--color-gold)]/40');

fs.writeFileSync('src/Storefront.tsx', code);
