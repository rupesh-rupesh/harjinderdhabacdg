import { listWindowsPrinters } from './src/lib/win-print-bridge.js';
listWindowsPrinters().then(console.log).catch(console.error);
