const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

code = code.replace(
  "import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer } from 'lucide-react';\\nimport { ThermalReceipt } from './ThermalReceipt';",
  "import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer } from 'lucide-react';\nimport { ThermalReceipt } from './ThermalReceipt';"
);

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
