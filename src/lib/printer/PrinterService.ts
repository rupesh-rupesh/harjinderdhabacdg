import { ESCPosGenerator } from './ESCPosGenerator';

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

export type PrinterType = 'webusb' | 'webbluetooth' | 'browser' | 'qz-tray' | 'network';

export interface PrinterConfig {
  type: PrinterType;
  paperSize: 58 | 80 | 'a4';
  autoCut: boolean;
  cashDrawer: boolean;
  ipAddress?: string; // For Network/LAN printer (e.g., 192.168.1.200)
  port?: number;      // Default 9100 for RAW printing
}

class PrinterService {
  private config: PrinterConfig = {
    type: 'browser',
    paperSize: 80,
    autoCut: true,
    cashDrawer: false,
    ipAddress: '192.168.1.200',
    port: 9100,
  };
  
  private usbDevice: USBDevice | null = null;
  private endpointOut: number = 0;
  private btDevice: BluetoothDevice | null = null;
  private btCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem('printer_config');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch(e) {}
  }

  saveConfig(config: PrinterConfig) {
    this.config = config;
    localStorage.setItem('printer_config', JSON.stringify(config));
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

  async autoConnect() {
    if (this.config.type === 'browser') return true;
    
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
    return false;
  }

  isConnected() {
    if (this.config.type === 'webusb') {
       return this.usbDevice && this.usbDevice.opened;
    }
    if (this.config.type === 'webbluetooth') {
       return this.btDevice && this.btDevice.gatt && this.btDevice.gatt.connected;
    }
    return true; // Browser default is always "connected"
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
      if (e.name === 'SecurityError' || e.message.includes('permissions policy')) {
        throw new Error('USB access is blocked by browser permissions policy. Try opening the app in a new tab or use Browser Print.');
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
            return true;
          }
        }
      }
      throw new Error("Could not find a writable characteristic on the Bluetooth device.");
    } catch (e: any) {
      if (e && !e.message?.toLowerCase().includes('cancel')) console.warn(e.message);
      if (e.name === 'SecurityError' || e.message.includes('permissions policy')) {
        throw new Error('Bluetooth access is blocked by browser permissions policy. Try opening the app in a new tab or use Browser Print.');
      }
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
       return 'Configured (QZ Tray Bridge)';
    }
    
    return 'Status ready';
  }

  async printReceipt(order: any, isTest: boolean = false, isCustomerCopy: boolean = true, includeGst: boolean = true) {
    if (this.config.type === 'browser' || this.config.paperSize === 'a4') {
      window.print();
      return;
    }

    const size = typeof this.config.paperSize === 'number' ? this.config.paperSize : 80;
    const generator = new ESCPosGenerator(size);
    generator.init();
    
    if (this.config.cashDrawer) {
       generator.openDrawer();
    }

    if (!isTest) {
      await generator.printImage('/bill-logo.png');
    }

    generator.alignCenter();
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
    } catch(e) {}

    const realItems = items.filter((i: any) => !i.isTableMarker);
    subTotal = realItems.reduce((acc: number, item: any) => acc + ((Number(item.price) || 0) + (item.isButter ? Number(item.butterPrice) || 0 : 0)) * (item.quantity || 1), 0);
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
      } else {
        generator.alignCenter().bold(true).textLine("*** CUSTOMER COPY ***").bold(false).alignLeft();
      }
      generator.printDivider();
      generator.textLine(`Bill No.: #HTD-${order ? (order.id || 'DRAFT') : 'DRAFT'}`);
      const d = (order && order.createdAt) ? new Date(order.createdAt) : new Date();
      generator.textLine(`Date: ${d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`);
      generator.textLine(`Time: ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
      generator.printDivider();
      
      if (isCustomerCopy) {
         generator.print4Columns("Item Name", "Qty", "Rate", "Amount");
         generator.printDivider();
      }
      
      realItems.forEach((item: any) => {
         let itemName = item.name || 'Unknown';
         if (item.isHalf) itemName += ' (Half)';
         if (item.isButter) itemName += ' (Butter)';
         if (item.variantName) itemName += ` (${item.variantName})`;

         if (isCustomerCopy) {
            const itemPrice = (Number(item.price) || 0) + (item.isButter ? Number(item.butterPrice) || 0 : 0);
            const itemAmount = itemPrice * (item.quantity || 1);
            generator.print4Columns(itemName, (item.quantity || 1).toString(), itemPrice.toFixed(2), itemAmount.toFixed(2));
         } else {
            generator.textLine(`${item.quantity || 1}x ${itemName}`);
         }
      });
      
      generator.printDivider();
      
      if (isCustomerCopy) {
        const totalQty = realItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
        
        generator.printLine("Total Qty :", totalQty.toString());
        generator.printLine("Sub Total:", `Rs. ${subTotal.toFixed(2)}`);
        
        if (includeGst) {
            generator.printLine("CGST @2.5%:", `Rs. ${cgst.toFixed(2)}`);
            generator.printLine("SGST @2.5%:", `Rs. ${sgst.toFixed(2)}`);
        }
        
        generator.printDivider();
        generator.printLine("GRAND TOTAL:", `Rs. ${grandTotal.toFixed(2)}`);
        generator.printDivider();
        
        generator.printDivider();
        generator.alignCenter().textLine("Remark:");
        generator.textLine("This bill was generated by the");
        generator.textLine("Manager.");
        generator.printDivider();
        generator.newline(1);
        
        generator.textLine("Thank You!");
        generator.textLine("Visit Again");
        generator.textLine("We appreciate your visit.");
        generator.alignLeft();
      }
    }
    
    generator.newline(4);
    if (this.config.autoCut) {
      generator.cut();
    }

    const data = generator.generate();

    try {
      if (this.config.type === 'webusb') {
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
      } else if (this.config.type === 'webbluetooth') {
         if (!this.btDevice || !this.btDevice.gatt || !this.btDevice.gatt.connected || !this.btCharacteristic) {
            await this.connectWebBluetooth();
         }
         try {
            const CHUNK_SIZE = 64;
            for (let i = 0; i < data.byteLength; i += CHUNK_SIZE) {
               const chunk = data.slice(i, i + CHUNK_SIZE);
               await this.btCharacteristic!.writeValue(chunk);
               await new Promise(r => setTimeout(r, 20)); // Small delay for BLE printer buffer
            }
         } catch (transferErr: any) {
            console.warn("Transfer failed, attempting to reconnect...", transferErr);
            this.btDevice = null;
            await this.connectWebBluetooth();
            const CHUNK_SIZE = 64;
            for (let i = 0; i < data.byteLength; i += CHUNK_SIZE) {
               const chunk = data.slice(i, i + CHUNK_SIZE);
               await this.btCharacteristic!.writeValue(chunk);
               await new Promise(r => setTimeout(r, 20));
            }
         }
      } else if (this.config.type === 'network') {
         if (!this.config.ipAddress) {
           throw new Error('Network printer IP address is not configured. Please set the IP address in Printer Settings.');
         }
         // Send via raw fetch bridge or socket bridge
         try {
           const response = await fetch(`http://${this.config.ipAddress}:${this.config.port || 9100}/print`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/octet-stream' },
             body: data,
           });
           if (!response.ok) throw new Error(`Network printer responded with status ${response.status}`);
         } catch (netErr: any) {
           console.warn('Direct RAW socket send failed, falling back to System Print dialog...', netErr);
           window.print();
         }
      } else {
         window.print();
      }
    } catch (e: any) {
      console.warn('Direct thermal print failed, attempting System Print fallback:', e?.message || e);
      window.print();
    }
  }
}

export const printerService = new PrinterService();
