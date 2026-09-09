const fs = require('fs');
const path = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove activeModule 'ticker' option
content = content.replace(/ \| 'ticker'/g, '');

// 2. Remove states
content = content.replace(/  const \[newsTickers, setNewsTickers\] = useState<any\[\]>\(\[\]\);\r?\n/g, '');
content = content.replace(/  const \[isTickerFormOpen, setIsTickerFormOpen\] = useState\(false\);\r?\n/g, '');
content = content.replace(/  const \[tickerForm, setTickerForm\] = useState\(\{.*?\}\);\r?\n/g, '');

// 3. Remove fetch assignment
content = content.replace(/        if \(data\.newsTickers\) setNewsTickers\(data\.newsTickers\);\r?\n/g, '');

// 4. Remove sidebar label
content = content.replace(/    ticker: 'News Ticker',\r?\n/g, '');

// 5. Remove sidebar nav item
content = content.replace(/            \{ key: 'ticker',    label: 'News Ticker',       icon: <MessageCircle className="w-5 h-5" \/> \},\r?\n/g, '');

// 6. Remove render logic
content = content.replace(/        \) : activeModule === 'ticker' \? \(\r?\n          renderTickerModule\(\)\r?\n/g, '        ');

// 7. Remove the functions block (from handleSaveTicker to end of renderTickerModule)
// We will match from `const handleSaveTicker =` to the start of `const renderFeaturesModule =` or whatever is after.
// Actually, using a regex with .*? across lines can be tricky. Let's just find the indices.

const startRegex = /  const handleSaveTicker = /;
const endRegex = /  const renderTickerModule = \(\) => \((.|\n|\r)*?    <\/div>\r?\n  \);\r?\n/m;

const matchSaveTicker = content.match(startRegex);
const matchToggleTicker = content.match(/  const handleToggleTicker = /);
const matchDeleteTicker = content.match(/  const handleDeleteTicker = /);
const matchReorderTicker = content.match(/  const handleReorderTicker = /);

// To safely remove functions, we can just replace each one.
function removeFunction(regexStart, name) {
  // Finds the function and removes it up to the next `const ` or the end
  const start = content.indexOf(name);
  if (start !== -1) {
    const end = content.indexOf('  const ', start + 10);
    if (end !== -1) {
      content = content.substring(0, start) + content.substring(end);
    }
  }
}

removeFunction(/const handleSaveTicker/, '  const handleSaveTicker =');
removeFunction(/const handleToggleTicker/, '  const handleToggleTicker =');
removeFunction(/const handleDeleteTicker/, '  const handleDeleteTicker =');
removeFunction(/const handleReorderTicker/, '  const handleReorderTicker =');
removeFunction(/const renderTickerModule/, '  const renderTickerModule =');

fs.writeFileSync(path, content);
console.log('Successfully updated AdminDashboard.tsx');
