const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace('--color-dhaba-yellow: #D4AF37;', '--color-dhaba-yellow: #D4AF37;\n  --color-ivory: #FFFDF8;\n  --color-gold: #C89B3C;\n  --color-brown: #2E1E14;');
fs.writeFileSync('src/index.css', css);
