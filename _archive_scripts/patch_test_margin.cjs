const fs = require('fs');
let code = fs.readFileSync('src/components/Testimonials.tsx', 'utf8');

code = code.replace(/className="py-24 bg-\[var\(--color-ivory\)\]"/g, 'className="pt-8 pb-24 bg-[var(--color-ivory)]"');

fs.writeFileSync('src/components/Testimonials.tsx', code);
console.log("Updated padding.");
