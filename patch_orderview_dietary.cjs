const fs = require('fs');
let code = fs.readFileSync('src/components/OrderView.tsx', 'utf8');

code = code.replace(
  /item\.dietaryPreference === 'veg'/g,
  "(item.dietaryPreference?.toLowerCase() === 'veg' || item.dietaryPreference?.toLowerCase() === 'vegetarian')"
);

fs.writeFileSync('src/components/OrderView.tsx', code);
console.log('Patched OrderView dietary');
