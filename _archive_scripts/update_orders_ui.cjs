const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerOrders.tsx', 'utf-8');

code = code.replace(
  `import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer, Bell, ClipboardCheck, Filter, ChevronDown, ShoppingBag } from 'lucide-react';`,
  `import { Package, Clock, CheckCircle2, XCircle, Search, Trash2, Edit, FileText, X, Plus, Minus, Printer, Bell, ClipboardCheck, Filter, ChevronDown, ShoppingBag, Eye } from 'lucide-react';`
);
code = code.replace(
  `<FileText className="w-5 h-5 mr-2" /> Preview`,
  `<Eye className="w-5 h-5 mr-2" /> Preview`
);

fs.writeFileSync('src/components/ManagerOrders.tsx', code);
