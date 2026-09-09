const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');
code = code.replace("const [generateGst, setGenerateGst] = useState(false);", "const [generateGst, setGenerateGst] = useState(true);");
fs.writeFileSync('src/components/ManagerOrders.tsx', code);
