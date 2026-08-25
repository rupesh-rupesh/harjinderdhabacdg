const fs = require('fs');
const path = 'src/components/AdminDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Helper to remove lines between start and end matching strings
function removeBlock(startStr, endStr) {
  const start = lines.findIndex(l => l.includes(startStr));
  if (start !== -1) {
    const end = lines.findIndex((l, i) => i > start && l.includes(endStr));
    if (end !== -1) {
      lines.splice(start, end - start + 1);
    }
  }
}

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
  // It spans 3 lines:
  // ) : activeModule === 'ticker' ? (
  //   renderTickerModule()
  // ) : activeModule === 'features' ? (
  lines.splice(renderCheckIdx, 2);
  // Actually, wait, if I remove those two lines, the next line is `) : activeModule === 'features' ? (`
  // That perfectly continues the chain! But I need to adjust it to just continue the chain.
  // Original:
  // ) : activeModule === 'ticker' ? (
  //   renderTickerModule()
  // ) : activeModule === 'features' ? (
  // Wait, if I splice 2 lines, `) : activeModule === 'features' ? (` remains. That matches the previous closing parens.
}

// 7. Remove functions (handleSaveTicker, handleToggleTicker, handleDeleteTicker, handleReorderTicker, renderTickerModule)
removeBlock('const handleSaveTicker =', '};'); // This might just remove up to the first }; Let's be careful.
// Wait, handleSaveTicker is large. Let's just find the start of handleSaveTicker and the end of renderTickerModule.
const startFn = lines.findIndex(l => l.includes("const handleSaveTicker ="));
const endFn = lines.findIndex((l, i) => i > startFn && l.includes("const renderFeaturesModule ="));
if (startFn !== -1 && endFn !== -1) {
  // We can safely remove everything from startFn to endFn - 1
  // This will remove all those ticker functions completely!
  lines.splice(startFn, endFn - startFn);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Done');
