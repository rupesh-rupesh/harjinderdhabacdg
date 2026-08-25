const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// First, let's insert the DietaryBadge component right after DynamicIcon
const dietaryBadgeCode = `
const DietaryBadge = ({ type }: { type?: string }) => {
  const isVeg = type?.toLowerCase() === 'veg' || type?.toLowerCase() === 'vegetarian';
  return (
    <div className={\`w-4 h-4 flex shrink-0 items-center justify-center border-2 rounded-sm \${isVeg ? 'border-green-600' : 'border-red-600'} bg-white\`}>
      <div className={\`w-2 h-2 rounded-full \${isVeg ? 'bg-green-600' : 'bg-red-600'}\`}></div>
    </div>
  );
};
`;

code = code.replace(/const DynamicIcon =.*?};\n/s, match => match + dietaryBadgeCode);

// Replace the inline ones
code = code.replace(/<div className=\{\`w-3 h-3 rounded-full \$\{item\.dietaryPreference === 'Vegetarian' \? 'bg-green-500' : 'bg-red-500'\}\`\}><\/div>/g, '<DietaryBadge type={item.dietaryPreference} />');
code = code.replace(/<span className=\{\`w-3\.5 h-3\.5 rounded-full border-2 \$\{selectedItemDetail\.dietaryPreference === 'veg' \? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'\}\`\}><\/span>/g, '<DietaryBadge type={selectedItemDetail.dietaryPreference} />');
code = code.replace(/<span className=\{\`w-3 h-3 rounded-full border-2 \$\{item\.dietaryPreference === 'veg' \? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'\}\`\}><\/span>/g, '<DietaryBadge type={item.dietaryPreference} />');

fs.writeFileSync('src/Storefront.tsx', code);
console.log('Patched dietary badges');
