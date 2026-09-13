import { ESCPosGenerator } from './ESCPosGenerator';
import qz from 'qz-tray';
import toast from 'react-hot-toast';

/**
 * Configure QZ Tray security ONCE at module load time.
 * Using the null/unsigned certificate approach for local/LAN deployments.
 * This MUST be called before any qz.websocket.connect() call, otherwise
 * QZ Tray shows a browser-blocking permission prompt that causes "blocked by client" errors.
 */
let qzSecurityConfigured = false;
function ensureQZSecurityConfigured() {
  if (qzSecurityConfigured) return;
  qzSecurityConfigured = true;

  // Certificate promise — returning null tells QZ Tray to use unsigned mode.
  // This eliminates the popup/block entirely for trusted local connections.
  qz.security.setCertificatePromise((_resolve: (cert: string | null) => void, reject: (err: any) => void) => {
    try {
      _resolve(null); // null = unsigned / local-trust mode
    } catch (e) {
      reject(e);
    }
  });

  // Signature promise — no signing needed when certificate is null.
  qz.security.setSignatureAlgorithm('SHA512');
  qz.security.setSignaturePromise((_toSign: string) => {
    return (_resolve: (sig: string | null) => void, _reject: (err: any) => void) => {
      _resolve(null); // null = no signature for local-trust mode
    };
  });
}

const numberToWords = (num: number) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const formatTens = (n: number) => {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ' ');
  };

  const convertGroup = (n: number) => {
    if (n < 100) return formatTens(n);
    return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? formatTens(n % 100) : '');
  };

  let str = '';
  const crore = Math.floor(num / 10000000);
  num -= crore * 10000000;
  const lakh = Math.floor(num / 100000);
  num -= lakh * 100000;
  const thousand = Math.floor(num / 1000);
  num -= thousand * 1000;
  const remainder = num;

  if (crore > 0) str += convertGroup(crore) + 'Crore ';
  if (lakh > 0) str += convertGroup(lakh) + 'Lakh ';
  if (thousand > 0) str += convertGroup(thousand) + 'Thousand ';
  if (remainder > 0) str += convertGroup(remainder);

  return str.trim();
};

export type PrinterType = 'webusb' | 'webbluetooth' | 'browser' | 'qz-tray' | 'network' | 'windows-print';

/**
 * Returns true when the effective print path is the browser's built-in
 * print dialog (window.print / react-to-print).
 * Returns false when a real thermal printer (QZ Tray, BT, USB, Network,
 * Windows-Print) is configured and ready to receive raw ESC/POS data.
 */

export interface PrinterConfig {
  type: PrinterType;
  paperSize: 58 | 80 | 'a4';
  autoCut: boolean;
  cashDrawer: boolean;
  ipAddress?: string;          // For Network/LAN printer (e.g., 192.168.1.200)
  port?: number;               // Default 9100 for RAW printing
  windowsPrinterName?: string; // For windows-print mode: exact Windows printer name
  qzPrinterName?: string;      // For QZ Tray mode: exact QZ printer name
}

class PrinterService {
  private config: PrinterConfig;
  private role: 'admin' | 'manager';

  private usbDevice: USBDevice | null = null;
  private endpointOut: number = -1;
  private btDevice: BluetoothDevice | null = null;
  private btCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  constructor(role: 'admin' | 'manager' = 'manager') {
    this.role = role;
    this.config = this.loadConfig();
    this.autoConnect();
  }

  private getStorageKey(): string {
    return `htd_${this.role}_printer_config`;
  }

  private loadConfig(): PrinterConfig {
    const defaultCfg: PrinterConfig = {
      type: 'browser',
      paperSize: 80,
      autoCut: true,
      cashDrawer: false,
      ipAddress: '192.168.1.200',
      port: 9100,
    };
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        return { ...defaultCfg, ...JSON.parse(stored) };
      }
    } catch (e) { }
    return defaultCfg;
  }

  saveConfig(config: PrinterConfig) {
    this.config = config;
    localStorage.setItem(this.getStorageKey(), JSON.stringify(config));
  }

  getConfig() {
    return this.config;
  }

  setPermissionGranted(granted: boolean) {
    localStorage.setItem('printer_permission_granted', granted ? 'true' : 'false');
  }

  isPermissionGranted() {
    return localStorage.getItem('printer_permission_granted') === 'true';
  }

  async getGrantedUSBDevices() {
    if (navigator.usb && navigator.usb.getDevices) {
      return await navigator.usb.getDevices();
    }
    return [];
  }

  /**
   * Returns the list of printers available via QZ Tray.
   */
  async getQZPrinters(): Promise<string[]> {
    try {
      ensureQZSecurityConfigured();
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect({
          retries: 5,
          delay: 1,
          host: ['localhost', '127.0.0.1'],
          usingSecure: window.location.protocol === 'https:',
        });
      }
      const list = await qz.printers.find();
      return Array.isArray(list) ? list : typeof list === 'string' ? [list] : [];
    } catch (e: any) {
      console.warn('[PrinterService] getQZPrinters failed:', e.message);
      let errorMsg = e.message || 'Failed to connect to QZ Tray';
      if (
        errorMsg.toLowerCase().includes('blocked by client') ||
        errorMsg.toLowerCase().includes('unable to connect') ||
        errorMsg.toLowerCase().includes('websocket')
      ) {
        errorMsg =
          'Could not connect to QZ Tray. Please ensure:\n' +
          '1. QZ Tray is installed and running (check your system taskbar).\n' +
          '2. When QZ Tray shows a permission prompt, click "Allow".\n' +
          '3. Disable any Adblockers or browser shields for this site.\n' +
          '4. If still failing: right-click QZ Tray in taskbar → Advanced → Site Manager → remove this site entry, then retry.';
      }
      throw new Error(errorMsg);
    }
  }

  /**
   * Returns the list of printers installed on the local Windows machine.
   * Calls GET /api/print/windows-printers (served by the local Express server).
   */
  async getWindowsPrinters(): Promise<string[]> {
    try {
      const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? ''
        : 'http://localhost:3000';

      const res = await fetch(`${baseUrl}/api/print/windows-printers`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = await res.json();
      return (json.printers as string[]) || [];
    } catch (e: any) {
      console.warn('[PrinterService] getWindowsPrinters failed:', e.message);
      return [];
    }
  }

  async autoConnect() {
    if (this.config.type === 'browser') return true;
    // Windows-print uses the server bridge — no client-side hardware handshake needed
    if (this.config.type === 'windows-print') return true;

    if (this.config.type === 'webusb') {
      try {
        const devices = await this.getGrantedUSBDevices();
        if (devices.length > 0) {
          this.usbDevice = devices[0];
          await this.usbDevice.open();
          if (this.usbDevice.configuration === null) {
            await this.usbDevice.selectConfiguration(1);
          }
          const interfaceNumber = this.usbDevice.configuration.interfaces[0].interfaceNumber;
          await this.usbDevice.claimInterface(interfaceNumber);

          const endpoints = this.usbDevice.configuration.interfaces[0].alternate.endpoints;
          const outEndpoint = endpoints.find((e: any) => e.direction === 'out');
          if (outEndpoint) {
            this.endpointOut = outEndpoint.endpointNumber;
            return true;
          }
        }
      } catch (e) {
        console.warn("Auto connect USB failed", e);
      }
    }

    if (this.config.type === 'webbluetooth') {
      try {
        if (navigator.bluetooth && (navigator.bluetooth as any).getDevices) {
          const devices = await (navigator.bluetooth as any).getDevices();
          if (devices.length > 0) {
            this.btDevice = devices[0];
            const server = await this.btDevice.gatt?.connect();
            if (server) {
              const services = await server.getPrimaryServices();
              for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const characteristic of characteristics) {
                  if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
                    this.btCharacteristic = characteristic;
                    this.setupBluetoothListeners();
                    return true;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Auto connect BT failed", e);
      }
    }
    if (this.config.type === 'qz-tray') {
      try {
        ensureQZSecurityConfigured();
        if (!qz.websocket.isActive()) {
          await qz.websocket.connect({
            retries: 5,
            delay: 1,
            host: ['localhost', '127.0.0.1'],
            usingSecure: window.location.protocol === 'https:',
          });
        }
        qz.websocket.setClosedCallbacks(() => {
          console.warn("QZ Tray Disconnected! Attempting auto-reconnect...");
          setTimeout(() => this.autoConnect(), 5000);
        });
        qz.websocket.setErrorCallbacks((err: any) => {
          console.error("QZ Tray Error:", err);
        });
        return true;
      } catch (e) {
        console.warn("Auto connect QZ Tray failed (QZ Tray may not be running)", e);
      }
    }

    return false;
  }

  private setupBluetoothListeners() {
    if (this.btDevice) {
      this.btDevice.addEventListener('gattserverdisconnected', async () => {
        console.warn("Bluetooth Printer Disconnected! Attempting auto-reconnect...");
        try {
          if (this.btDevice && this.btDevice.gatt) {
            await new Promise(r => setTimeout(r, 2000)); // wait 2s before reconnecting
            const server = await this.btDevice.gatt.connect();
            const services = await server.getPrimaryServices();
            for (const service of services) {
              const characteristics = await service.getCharacteristics();
              for (const characteristic of characteristics) {
                if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
                  this.btCharacteristic = characteristic;
                  console.log("Bluetooth Printer Reconnected Successfully!");
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.error("Auto-reconnect failed. User will need to manually connect.", e);
          this.btCharacteristic = null;
        }
      });
    }
  }

  private setupUSBListeners() {
    if (navigator.usb) {
      navigator.usb.addEventListener('disconnect', (event) => {
        if (this.usbDevice && event.device === this.usbDevice) {
          console.warn("USB Printer Disconnected!");
          this.usbDevice = null;
          this.endpointOut = -1;
        }
      });
      navigator.usb.addEventListener('connect', async (event) => {
        if (!this.usbDevice && this.config.type === 'webusb') {
          console.log("USB Device Plugged In! Attempting auto-connect...");
          this.autoConnect();
        }
      });
    }
  }

  /**
   * Returns true only when the effective output is the browser's built-in
   * print dialog. Components use this to decide between react-to-print and
   * the thermal ESC/POS path.
   */
  isBrowserPrint(): boolean {
    // printReceipt() now handles ALL cases including auto-detection.
    // Components should always call printReceipt() — never printReceiptAction() directly.
    // Only return true for A4 paper where browser dialog is intentional.
    if (this.config.paperSize === 'a4') return true;
    return false;
  }

  isConnected() {
    if (this.config.type === 'webusb') {
      return this.usbDevice && this.usbDevice.opened;
    }
    if (this.config.type === 'webbluetooth') {
      return this.btDevice && this.btDevice.gatt && this.btDevice.gatt.connected;
    }
    if (this.config.type === 'qz-tray') {
      return qz.websocket.isActive();
    }
    return true; // browser / network / windows-print are always "connected"
  }

  async connectWebUSB() {
    try {
      if (!navigator.usb) {
        throw new Error('WebUSB is not supported in this browser. Please use Chrome/Edge or select Browser Print.');
      }
      this.usbDevice = await navigator.usb.requestDevice({ filters: [] });
      this.setPermissionGranted(true);
      await this.usbDevice.open();
      if (this.usbDevice.configuration === null) {
        await this.usbDevice.selectConfiguration(1);
      }

      const interfaceNumber = this.usbDevice.configuration.interfaces[0].interfaceNumber;
      await this.usbDevice.claimInterface(interfaceNumber);

      this.setupUSBListeners();

      const endpoints = this.usbDevice.configuration.interfaces[0].alternate.endpoints;
      const outEndpoint = endpoints.find((e: any) => e.direction === 'out');
      if (outEndpoint) {
        this.endpointOut = outEndpoint.endpointNumber;
      } else {
        throw new Error('No OUT endpoint found on USB device.');
      }
      return true;
    } catch (e: any) {
      if (e && !e.message?.toLowerCase().includes('cancel')) console.warn(e.message);
      if (e.message?.includes('Access denied')) {
        throw new Error("Access Denied: Windows is blocking direct USB access. You must use a tool like Zadig to install the WinUSB driver for this printer, or switch to a different device.");
      }
      throw new Error(e.message || 'Failed to connect USB printer');
    }
  }

  async connectWebBluetooth() {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
      }
      this.btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2']
      });
      this.setPermissionGranted(true);
      const server = await this.btDevice.gatt?.connect();
      if (!server) throw new Error("Could not connect to GATT server");

      const services = await server.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const characteristic of characteristics) {
          if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
            this.btCharacteristic = characteristic;
            this.setupBluetoothListeners();
            return true;
          }
        }
      }
      throw new Error("Could not find a writable characteristic on the Bluetooth device.");
    } catch (e: any) {
      if (e && !e.message?.toLowerCase().includes('cancel')) console.warn(e.message);
      throw new Error(e.message || 'Failed to connect Bluetooth printer');
    }
  }

  async checkStatus() {
    if (this.config.type === 'browser') return 'Connected (System / Browser Default)';

    if (this.config.type === 'webusb') {
      if (this.usbDevice && this.usbDevice.opened) return 'Connected (USB)';
      return 'Offline (Click to connect USB)';
    }

    if (this.config.type === 'webbluetooth') {
      if (this.btDevice && this.btDevice.gatt && this.btDevice.gatt.connected) return 'Connected (Bluetooth)';
      return 'Offline (Click to connect Bluetooth)';
    }

    if (this.config.type === 'network') {
      return this.config.ipAddress
        ? `Configured (${this.config.ipAddress}:${this.config.port || 9100})`
        : 'IP Address Not Configured';
    }

    if (this.config.type === 'qz-tray') {
      return this.config.qzPrinterName
        ? `Connected (QZ: ${this.config.qzPrinterName})`
        : 'No QZ Printer Selected';
    }

    if (this.config.type === 'windows-print') {
      return this.config.windowsPrinterName
        ? `Connected (${this.config.windowsPrinterName})`
        : 'No Printer Selected';
    }

    return 'Status ready';
  }

  /**
   * Auto-detects an available printer via the local Windows print bridge.
   * QZ Tray is intentionally excluded — it requires explicit user setup.
   */
  private async autoDetectPrinter(): Promise<{ type: 'windows-print'; name: string } | null> {
    // ⚠️  QZ Tray is intentionally NOT auto-detected here.
    //     Connecting to QZ Tray triggers a browser-blocking "Allow" permission dialog,
    //     which is intrusive and unexpected when the user hasn't configured QZ Tray.
    //     QZ Tray must always be explicitly selected in Printer Settings.
    //
    //     Only the Windows Print Bridge is auto-detected because it is completely
    //     silent (no popup, no permission prompt).

    try {
      const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? '' : 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/print/windows-printers`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const json = await res.json();
        const list: string[] = json.printers || [];
        // Prefer well-known thermal printer names
        const thermal = list.find(n => /pos|thermal|receipt|star|epson|bixolon|citizen|xprinter/i.test(n));
        const name = thermal || list[0];
        if (name) return { type: 'windows-print', name };
      }
    } catch { /* Bridge not reachable */ }

    return null;
  }

  async printReceipt(order: any, isTest: boolean = false, isCustomerCopy: boolean = true, includeGst: boolean = true) {
    // ── Step 1: Determine effective printer type ─────────────────────────────
    // Priority:  explicit hardware type (BT/USB) > saved printer name > auto-detect > error
    // IMPORTANT: webbluetooth and webusb are NEVER auto-detected or overridden here —
    //            they have their own reconnect logic later in the BT/USB branch.
    let effectiveType = this.config.type;
    let effectiveWindowsPrinterName = this.config.windowsPrinterName;
    let effectiveQzPrinterName = this.config.qzPrinterName;

    if (effectiveType === 'browser') {
      if (this.config.qzPrinterName) {
        // User explicitly saved a QZ printer — use it (no auto-detect needed)
        effectiveType = 'qz-tray';
      } else if (this.config.windowsPrinterName) {
        // User explicitly saved a Windows printer — use it
        effectiveType = 'windows-print';
      } else if (this.config.paperSize !== 'a4') {
        // No printer saved at all → try Windows bridge silently (never QZ Tray)
        const detected = await this.autoDetectPrinter();
        if (detected) {
          effectiveType = 'windows-print';
          effectiveWindowsPrinterName = detected.name;
        } else {
          // Nothing found — show a helpful error instead of opening browser dialog
          throw new Error(
            'No printer found. Please go to Printer Settings and select your printer (QZ Tray App or Wired USB).'
          );
        }
      }
    }
    // Note: 'webbluetooth' and 'webusb' fall straight through — they are handled below.

    // ── Step 2: A4 / pure browser path ──────────────────────────────────────
    if (effectiveType === 'browser') {
      // Only reached when paperSize === 'a4' (user chose A4 browser printing)
      if (isTest) {
        this.printBrowserTest();
      } else if (!isCustomerCopy) {
        this.printBrowserKOT(order);
      } else {
        window.print();
      }
      return;
    }


    const size = typeof this.config.paperSize === 'number' ? this.config.paperSize : 80;
    const generator = new ESCPosGenerator(size);
    generator.init();

    if (this.config.cashDrawer) {
      generator.openDrawer();
    }

    if (!isTest) {
      try {
        await generator.printImage('/bill-logo.png');
      } catch (e) {
        // Fallback to text if logo is missing
      }
    }

    generator.alignCenter();
    generator.newline(1);

    // Professional Text Logo matching the requested style
    generator.size(3, 3).bold(true).textLine("HARJINDER").size(1, 1);
    generator.bold(true).textLine("T O U R I S T   D H A B A").bold(false);

    generator.newline(1);
    generator.textLine("VPO-Sahauran, Teh-Kharar,");
    generator.textLine("Distt. Mohali (Punjab) - 140103");
    generator.textLine("Phone: 90566-55093");
    generator.textLine("FSSAI: 22120036000138");

    let subTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let grandTotal = 0;
    let items: any[] = [];
    try {
      if (order && order.items) {
        let parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        if (Array.isArray(parsed)) {
          items = parsed;
        }
      }
    } catch (e) { }

    const realItems = items.filter((i: any) => !i.isTableMarker);
    subTotal = realItems.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);
    cgst = includeGst ? parseFloat((subTotal * 0.025).toFixed(2)) : 0;
    sgst = includeGst ? parseFloat((subTotal * 0.025).toFixed(2)) : 0;
    grandTotal = subTotal + cgst + sgst;

    if (includeGst) {
      generator.textLine("GSTIN: 03AAKFH5744C1Z0");
    }

    generator.printDivider();

    if (isTest) {
      generator.newline(1).bold(true).textLine("TEST PRINT SUCCESSFUL").bold(false).newline(1);
      generator.textLine(`Paper Size: ${this.config.paperSize}mm`);
      generator.textLine(`Auto Cut: ${this.config.autoCut ? 'Yes' : 'No'}`);
      generator.textLine(`Cash Drawer: ${this.config.cashDrawer ? 'Yes' : 'No'}`);
      generator.printDivider();
    } else {
      generator.alignLeft();
      if (!isCustomerCopy) {
        generator.alignCenter().bold(true).textLine("*** KITCHEN COPY ***").bold(false).alignLeft();
        generator.printBoldDivider();
      }

      if (order && order.id && order.id !== 'DRAFT') {
        generator.textLine(`Order No.: #HTD-${order.id}`);
      }
      let tNumStr = "000";
      const tableMarker = items.find((i: any) => i.isTableMarker);
      if (order?.tableNumber) {
        tNumStr = order.tableNumber.toString().padStart(3, '0');
      } else if (tableMarker) {
        tNumStr = tableMarker.name.replace('Table ', '').padStart(3, '0');
      }
      generator.textLine(`Dine In: Table No. (T${tNumStr})`);
      const d = (order && order.createdAt) ? new Date(order.createdAt) : new Date();
      generator.textLine(`Date: ${d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`);
      generator.textLine(`Time: ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
      generator.printBoldDivider();

      if (isCustomerCopy) {
        generator.print4Columns("Item Name", "Qty", "Rate", "Amount");
        generator.printBoldDivider();
      }

      realItems.forEach((item: any, index: number) => {
        let itemName = item.name || 'Unknown';
        if (item.isHalf) itemName += ' (Half)';
        if (item.isButter) itemName += ' (Butter)';
        if (item.variantName) itemName += ` (${item.variantName})`;

        if (isCustomerCopy) {
          const itemPrice = (Number(item.price) || 0);
          const itemAmount = itemPrice * (item.quantity || 1);
          generator.print4Columns(itemName, (item.quantity || 1).toString(), itemPrice.toFixed(2), itemAmount.toFixed(2));
        } else {
          generator.textLine(`${item.quantity || 1}x ${itemName}`);
        }
        // Add 1 line space after every item except the last one
        if (index < realItems.length - 1) {
          generator.newline(1);
        }
      });

      generator.printBoldDivider();

      if (isCustomerCopy) {
        const totalQty = realItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);

        generator.printLine("Total Qty :", totalQty.toString());
        generator.printLine("Sub Total:", `Rs. ${subTotal.toFixed(2)}`);

        if (includeGst) {
          generator.printLine("CGST @2.5%:", `Rs. ${cgst.toFixed(2)}`);
          generator.printLine("SGST @2.5%:", `Rs. ${sgst.toFixed(2)}`);
        }

        generator.printBoldDivider();
        generator.size(1, 2).bold(true).printLine("GRAND TOTAL:", `Rs. ${grandTotal.toFixed(2)}`).size(1, 1).bold(false);
        generator.printBoldDivider();

        // Extra line removed here as requested
        if (this.role !== 'admin') {
          generator.alignCenter().textLine("Remark:");
          generator.textLine("This bill was generated by the");
          generator.textLine("Manager.");
          generator.printBoldDivider();
        }

        generator.alignCenter();
        generator.textLine("Thank You!");
        generator.textLine("Visit Again");
        generator.textLine("We appreciate your visit.");
        generator.alignLeft();
      }
    }
    generator.newline(2);
    if (this.config.autoCut) {
      generator.cut();
    }

    const data = generator.generate();

    try {
      if (effectiveType === 'webusb') {
        if (!this.usbDevice || !this.usbDevice.opened) {
          await this.connectWebUSB();
        }
        try {
          const CHUNK_SIZE = 256;
          for (let i = 0; i < data.byteLength; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            await this.usbDevice!.transferOut(this.endpointOut, chunk);
            await new Promise(r => setTimeout(r, 20)); // Prevent buffer overflow
          }
        } catch (transferErr: any) {
          console.warn("Transfer failed, attempting to reconnect...", transferErr);
          this.usbDevice = null;
          await this.connectWebUSB();
          const CHUNK_SIZE = 256;
          for (let i = 0; i < data.byteLength; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            await this.usbDevice!.transferOut(this.endpointOut, chunk);
            await new Promise(r => setTimeout(r, 20));
          }
        }
      } else if (effectiveType === 'webbluetooth') {
        if (!this.btDevice || !this.btDevice.gatt || !this.btDevice.gatt.connected || !this.btCharacteristic) {
          let reconnected = false;
          if (this.btDevice && this.btDevice.gatt) {
            try {
              console.log("Attempting silent Bluetooth reconnect...");
              const server = await this.btDevice.gatt.connect();
              const services = await server.getPrimaryServices();
              for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const characteristic of characteristics) {
                  if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
                    this.btCharacteristic = characteristic;
                    this.setupBluetoothListeners();
                    reconnected = true;
                    console.log("Silent reconnect successful!");
                    break;
                  }
                }
                if (reconnected) break;
              }
            } catch (e) {
              console.warn("Silent reconnect failed, will prompt user...", e);
            }
          }
          if (!reconnected) {
            await this.connectWebBluetooth();
          }
        }
        try {
          // Very important for cheap POS58 thermal printers: 
          // They have tiny buffers and will silently drop packets if sent too fast/too large.
          const CHUNK_SIZE = 64;
          for (let i = 0; i < data.byteLength; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            if (this.btCharacteristic!.properties.writeWithoutResponse && typeof (this.btCharacteristic as any).writeValueWithoutResponse === 'function') {
              await (this.btCharacteristic as any).writeValueWithoutResponse(chunk);
            } else {
              await this.btCharacteristic!.writeValue(chunk);
            }
            await new Promise(r => setTimeout(r, 50));
          }
        } catch (transferErr: any) {
          console.error("Bluetooth transfer failed:", transferErr);
          throw new Error('Bluetooth print failed. Please ensure the printer is turned on and in range.');
        }
      } else if (effectiveType === 'network') {
        if (!this.config.ipAddress) {
          throw new Error('Network printer IP address is not configured. Please set the IP address in Printer Settings.');
        }
        // Send via raw fetch bridge or socket bridge
        try {
          const response = await fetch(`http://${this.config.ipAddress}:${this.config.port || 9100}/print`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: new Blob([data as any]),
          });
          if (!response.ok) throw new Error(`Network printer responded with status ${response.status}`);
        } catch (netErr: any) {
          console.warn('Direct RAW socket send failed (often blocked on HTTPS due to Mixed Content):', netErr);
          if (window.location.protocol === 'https:') {
            toast.error("Network Print is blocked on secure sites (HTTPS). Falling back to System Print...");
          }
          window.print();
        }
      } else if (effectiveType === 'windows-print') {
        if (!effectiveWindowsPrinterName) {
          throw new Error('No Windows printer selected. Please choose a printer in Printer Settings.');
        }

        // If we are on the deployed website, route to the local daemon at localhost:3000
        const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? ''
          : 'http://localhost:3000';

        // Convert Uint8Array → base64 safely (loop avoids call-stack overflow on large payloads)
        let binary = '';
        for (let i = 0; i < data.byteLength; i++) binary += String.fromCharCode(data[i]);
        const base64 = btoa(binary);
        const response = await fetch(`${baseUrl}/api/print/raw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            printerName: effectiveWindowsPrinterName,
            data: base64,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || `Windows print bridge responded with status ${response.status}`);
        }
      } else if (effectiveType === 'qz-tray') {
        if (!effectiveQzPrinterName) {
          throw new Error('No QZ Tray printer selected. Please choose a printer in Printer Settings.');
        }

        ensureQZSecurityConfigured();
        if (!qz.websocket.isActive()) {
          await qz.websocket.connect({
            retries: 5,
            delay: 1,
            host: ['localhost', '127.0.0.1'],
            usingSecure: window.location.protocol === 'https:',
          });
        }

        const qzConfig = qz.configs.create(effectiveQzPrinterName);

        let binary = '';
        for (let i = 0; i < data.byteLength; i++) binary += String.fromCharCode(data[i]);
        const base64 = btoa(binary);

        await qz.print(qzConfig, [{ type: 'raw', format: 'command', flavor: 'base64', data: base64 }]);
      } else {
        // Should never reach here — all paths are handled above.
        throw new Error('Printer not configured. Please go to Printer Settings and select your printer.');
      }
    } catch (e: any) {
      console.warn('Thermal print failed:', e?.message || e);
      let errorMsg = e?.message || 'Unknown error';
      if (
        errorMsg.toLowerCase().includes('blocked by client') ||
        (errorMsg.toLowerCase().includes('unable to connect') && this.config.type === 'qz-tray')
      ) {
        throw new Error(
          'QZ Tray connection failed. Make sure QZ Tray is running, then click "Allow" when prompted. ' +
          'If the problem persists, right-click QZ Tray in taskbar → Advanced → Site Manager → remove this site, then retry.'
        );
      }
      throw new Error(errorMsg);
    }
  }

  private printBrowserKOT(order: any) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    let items = [];
    try {
      items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (typeof items === 'string') items = JSON.parse(items);
    } catch (e) { }

    const realItems = items.filter((i: any) => !i.isTableMarker);
    const orderDate = new Date(order.createdAt || Date.now());
    const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let html = `
      <html>
      <head>
        <style>
          @media print { @page { margin: 0; } body { margin: 0; } }
          body { font-family: monospace; padding: 10px; width: 80mm; font-size: 14px; color: black; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center" style="font-weight: bold; font-size: 16px;">--- K.O.T ---</div>
        <div style="margin-top: 10px;">Order: #${(order.id || 0).toString().slice(-4)}</div>
        <div>Time: ${timeStr}</div>
        ${order.tableNumber ? `<div>Table: ${order.tableNumber}</div>` : ''}
        
        <div class="divider"></div>
        <div style="font-weight: bold;">
          <span style="display:inline-block; width: 30px;">Qty</span>
          <span>Item</span>
        </div>
        <div class="divider"></div>
    `;

    realItems.forEach((item: any) => {
      html += `
         <div style="display: flex; margin-bottom: 5px;">
           <span style="display:inline-block; width: 30px; font-weight: bold;">${item.quantity}</span>
           <span>${item.name.substring(0, 27)}</span>
         </div>
       `;
      if (item.isButter) {
        html += `<div style="margin-left: 30px; font-style: italic;">+ Extra Butter</div>`;
      }
    });

    html += `
      </body>
      </html>
    `;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }

  private printBrowserTest() {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    let html = `
      <html>
      <head>
        <style>
          @media print { @page { margin: 0; } body { margin: 0; } }
          body { font-family: monospace; padding: 10px; width: 80mm; font-size: 14px; color: black; text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h2 style="margin:0;">Harjinder Tourist Dhaba</h2>
        <p style="font-size: 12px;">VPO-Sahauran, Teh-Kharar,<br>Distt. Mohali (Punjab) - 140103<br>Phone: 90566-55093</p>
        <div class="divider"></div>
        <h3 style="margin: 10px 0;">TEST PRINT SUCCESSFUL</h3>
        <p style="font-size: 12px;">Your printer is correctly configured for Browser Print.</p>
        <div class="divider"></div>
      </body>
      </html>
    `;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}

export const adminPrinterService = new PrinterService('admin');
export const managerPrinterService = new PrinterService('manager');
// Deprecated generic export for backward compatibility during transition
export const printerService = managerPrinterService;
