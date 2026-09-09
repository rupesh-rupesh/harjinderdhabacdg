const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// Backgrounds
code = code.replace(/bg-dhaba-light/g, 'bg-[var(--color-ivory)]');
code = code.replace(/bg-dhaba-dark/g, 'bg-[var(--color-brown)]');
// text colors
code = code.replace(/text-dhaba-dark/g, 'text-[var(--color-brown)]');
code = code.replace(/text-dhaba-orange/g, 'text-[var(--color-gold)]');
code = code.replace(/text-dhaba-yellow/g, 'text-[var(--color-gold)]');

// borders
code = code.replace(/border-dhaba-orange/g, 'border-[var(--color-gold)]');
code = code.replace(/border-dhaba-yellow/g, 'border-[var(--color-gold)]');

// buttons / gradients
code = code.replace(/from-dhaba-orange to-dhaba-yellow/g, 'from-[var(--color-gold)] to-[var(--color-gold)]/80');

fs.writeFileSync('src/Storefront.tsx', code);
