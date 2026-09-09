const fs = require('fs');
const path = 'src/components/AdminDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. Remove states
lines = lines.filter(l => !l.includes("const [newsTickers, setNewsTickers]"));
lines = lines.filter(l => !l.includes("const [isTickerFormOpen, setIsTickerFormOpen]"));
lines = lines.filter(l => !l.includes("const [tickerForm, setTickerForm]"));

// 2. Remove module type
const typeLineIdx = lines.findIndex(l => l.includes("const [activeModule, setActiveModule]"));
if (typeLineIdx !== -1) {
  lines[typeLineIdx] = lines[typeLineIdx].replace(" | 'ticker'", "");
}

// 3. Remove fetch assignment
lines = lines.filter(l => !l.includes("if (data.newsTickers) setNewsTickers(data.newsTickers)"));

// 4. Remove sidebar label
lines = lines.filter(l => !l.includes("ticker: 'News Ticker',"));

// 5. Remove sidebar nav item
lines = lines.filter(l => !l.includes("{ key: 'ticker',    label: 'News Ticker',"));

// 6. Remove render logic in main component
const renderCheckIdx = lines.findIndex(l => l.includes(") : activeModule === 'ticker' ? ("));
if (renderCheckIdx !== -1) {
  lines.splice(renderCheckIdx, 2);
}

// 7. Remove functions (handleSaveTicker to end of renderTickerModule)
const startFn = lines.findIndex(l => l.includes("const handleSaveTicker ="));
const endFn = lines.findIndex((l, i) => i > startFn && l.includes("const renderFeaturesModule ="));
if (startFn !== -1 && endFn !== -1) {
  lines.splice(startFn, endFn - startFn);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Done');
