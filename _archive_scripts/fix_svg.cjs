const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const oldSVG = `<svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0 200 Q 150 100 400 0" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <path d="M0 150 Q 200 150 400 50" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <path d="M100 200 Q 250 50 400 150" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
          </svg>`;

const newSVG = `<svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" fill="none">
            <path d="M-100 350C150 150 300 250 500 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.4"/>
            <path d="M-50 400C200 200 350 300 550 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2"/>
            <path d="M200 400C450 150 600 250 900 -50" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.3"/>
            <path d="M300 450C550 200 700 300 1000 0" stroke="#E3C77D" strokeWidth="1" strokeOpacity="0.2"/>
          </svg>`;

code = code.replace(oldSVG, newSVG);
fs.writeFileSync('src/components/ManagerBilling.tsx', code);
