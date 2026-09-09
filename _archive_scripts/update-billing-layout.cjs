const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ManagerBilling.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Wrap left area
content = content.replace(
  /<div className="flex flex-col" style={{ height: 'calc\(100dvh - 56px\)', margin: '0', padding: '0' }}>\s*<div className="hidden print:block">/,
  `<div className="flex" style={{ height: 'calc(100dvh - 56px)', margin: '0', padding: '0' }}>\n      <div className="hidden print:block">`
);

content = content.replace(
  /<\/div>\s*<div className="px-4 sm:px-6 lg:px-8 pt-4">/,
  `</div>\n\n      <div className="flex-1 flex flex-col overflow-hidden">\n      <div className="px-4 sm:px-6 lg:px-8 pt-4">`
);

// 2. Center search bar in POS Header
content = content.replace(
  /<div className="bg-white border-b border-stone-200 px-3 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0">/,
  `<div className="bg-white border-b border-stone-200 px-3 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0 relative">`
);

content = content.replace(
  /\{?\/\*\s*Left: back \+ table name\s*\*\/\s*\}?\s*<div className="flex items-center gap-2 shrink-0">/,
  `{/* Left: back + table name */}\n        <div className="flex items-center gap-2 shrink-0 w-1/3">`
);

content = content.replace(
  /\{?\/\*\s*Center: Search — wider and responsive\s*\*\/\s*\}?\s*<div className="hidden sm:block flex-1 max-w-md lg:max-w-lg xl:max-w-2xl relative mx-4">/,
  `{/* Center: Search */}\n        <div className="hidden sm:flex justify-center flex-1 w-1/3">\n          <div className="relative w-full max-w-md">`
);

content = content.replace(
  /<input([^>]+value={searchQuery}[^>]+transition-shadow[^>]+)\/>\s*<\/div>\s*\{?\/\*\s*Right: Mobile search\s*\*\/\s*\}?\s*<div className="flex items-center shrink-0 sm:hidden">\s*<div className="relative w-40 sm:w-48 mr-1">/s,
  `<input$1/>\n          </div>\n        </div>\n\n        {/* Right: Mobile search */}\n        <div className="flex items-center justify-end shrink-0 sm:w-1/3">\n          <div className="relative w-40 sm:w-48 mr-1 sm:hidden">`
);

// 3. Close left area before Current Bill
content = content.replace(
  /\{?\/\*\s*Right Column: Current Bill\s*\*\/\s*\}?\s*<div\s+className="bg-white border-l border-stone-100 flex flex-col shrink-0 shadow/s,
  `</div>\n      </div>\n\n        {/* Right Column: Current Bill */}\n        <div\n          className="bg-white border-l border-stone-100 flex flex-col shrink-0 shadow`
);

// 4. Decrease Current Bill Height
content = content.replace(
  /<div className="p-5 bg-white border-t border-stone-100 relative z-20 shadow-\[0_-4px_24px_rgba\(0,0,0,0\.02\)\] space-y-4">/g,
  `<div className="p-3 bg-white border-t border-stone-100 relative z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] space-y-2">`
);

content = content.replace(
  /<div className="flex items-center gap-2 text-sm font-black text-stone-600 justify-center mb-2">/g,
  `<div className="flex items-center gap-2 text-sm font-black text-stone-600 justify-center mb-1">`
);

content = content.replace(
  /px-4 py-2 rounded-xl border border-stone-200/g,
  `px-3 py-1.5 rounded-lg border border-stone-200`
);

content = content.replace(
  /bg-stone-900 rounded-2xl p-4 text-white shadow-lg relative mt-4/g,
  `bg-stone-900 rounded-xl p-3 text-white shadow-lg relative mt-2`
);

content = content.replace(
  /<div className="space-y-2 relative z-10 pointer-events-none">/g,
  `<div className="space-y-1 relative z-10 pointer-events-none">`
);

content = content.replace(
  /pt-3 mt-1 border-t border-stone-700\/50/g,
  `pt-2 mt-1 border-t border-stone-700/50`
);

content = content.replace(
  /text-3xl font-black text-dhaba-orange/g,
  `text-2xl font-black text-dhaba-orange`
);

content = content.replace(
  /className="flex-\[7\] py-4 bg-gradient-to-r from-dhaba-orange to-amber-500[^"]+rounded-xl[^"]+text-lg transform hover:-translate-y-0\.5"/g,
  `className="flex-[7] py-2.5 bg-gradient-to-r from-dhaba-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-black rounded-lg transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 text-base transform hover:-translate-y-0.5"`
);

content = content.replace(
  /className="flex-\[3\] py-4 bg-stone-100[^"]+rounded-xl[^"]+text-lg transform hover:-translate-y-0\.5 disabled:opacity-50 disabled:cursor-not-allowed"/g,
  `className="flex-[3] py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-black rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-base transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ManagerBilling.tsx');
