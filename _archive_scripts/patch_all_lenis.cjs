const fs = require('fs');
const path = require('path');
const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) scanDir(fp);
    else if (fp.endsWith('.tsx')) {
      let txt = fs.readFileSync(fp, 'utf8');
      let changed = false;
      txt = txt.replace(/<([a-zA-Z0-9]+)([^>]*?className=["'][^"']*?overflow-y-auto[^"']*?["'])([^>]*?)>/g, (m, tag, c1, c2) => {
        if (m.includes('data-lenis-prevent')) return m;
        changed = true;
        return `<${tag}${c1} data-lenis-prevent="true"${c2}>`;
      });
      if (changed) {
        fs.writeFileSync(fp, txt);
        console.log('Fixed', fp);
      }
    }
  });
};
scanDir('src');
