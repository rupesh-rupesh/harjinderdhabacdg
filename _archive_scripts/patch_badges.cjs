const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

const regex = /<div className="mt-12 flex flex-col sm:flex-row items-center gap-8 bg-white\/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-\[0_8px_30px_rgba\(0,0,0,0\.04\)\] max-w-2xl">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

if(regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/Storefront.tsx', code);
    console.log("Replaced badges block.");
} else {
    console.log("Could not find badges block.");
}
