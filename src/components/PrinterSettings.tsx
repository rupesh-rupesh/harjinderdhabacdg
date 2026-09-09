import React, { useState, useEffect } from 'react';
import { adminPrinterService, managerPrinterService, PrinterConfig } from '../lib/printer/PrinterService';
import { Printer, Settings, Bluetooth, Monitor, TestTube, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import WindowsPrinterModal from './WindowsPrinterModal';
import QZPrinterModal from './QZPrinterModal';

export default function PrinterSettings({ role = 'manager' }: { role?: 'admin' | 'manager' }) {
  const printerService = role === 'admin' ? adminPrinterService : managerPrinterService;
  const [config, setConfig] = useState<PrinterConfig>(printerService.getConfig());
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [windowsPrinters, setWindowsPrinters] = useState<string[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [showQZModal, setShowQZModal] = useState(false);

  useEffect(() => {
    // Auto-migrate legacy webusb config → windows-print (no Zadig required)
    if (config.type === 'webusb') {
      const migrated = { ...config, type: 'windows-print' as const };
      setConfig(migrated);
      printerService.saveConfig(migrated);
    }
    
    // Initial check
    checkStatus();

    // Live polling for hardware connection status
    const interval = setInterval(() => {
      checkStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [config.type]);

  const checkStatus = async () => {
    try {
      const s = await printerService.checkStatus();
      setStatus(s);
    } catch(e: any) {
      if (e.message?.includes('Access denied')) {
        setError("Access Denied: Windows is blocking direct USB access. You must use a tool like Zadig to install the WinUSB driver for this printer, or switch to a different device.");
      } else {
        setStatus('Status unknown');
      }
    }
  };

  const handleSave = (newConfig: Partial<PrinterConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    printerService.saveConfig(updated);
    setSuccess('Settings saved successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleTestPrint = async () => {
    setError(null);
    setSuccess(null);
    try {
      await printerService.printReceipt(null, true);
      setSuccess('Test print sent successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
            <Printer className="w-6 h-6 text-stone-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">{role === 'admin' ? 'Admin Printer' : 'Printer Settings'}</h2>
            <p className="text-stone-500">Configure thermal receipt printer for {role === 'admin' ? 'Admin' : 'Manager'} Dashboard</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Connection Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setShowWindowsModal(true)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${config.type === 'windows-print' || config.type === 'webusb' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04] font-bold' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Printer className="w-6 h-6" />
                  <span className="text-sm text-center">Wired USB</span>
                </button>

                <button 
                  onClick={async () => {
                    handleSave({ type: 'webbluetooth' });
                    try {
                      await printerService.connectWebBluetooth();
                      const newStatus = await printerService.checkStatus();
                      setStatus(newStatus);
                    } catch (e: any) {
                      setError(e.message);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${config.type === 'webbluetooth' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04] font-bold' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Bluetooth className="w-6 h-6" />
                  <span className="text-sm text-center">Bluetooth</span>
                </button>

                <button 
                  onClick={() => setShowQZModal(true)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${config.type === 'qz-tray' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04] font-bold' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-sm text-center">QZ Tray App</span>
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Clicking either option will open a secure browser prompt allowing you to connect directly to your printer.
              </p>
            </div>


            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Paper & Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={config.paperSize === 58} onChange={() => handleSave({ paperSize: 58 })} className="w-4 h-4 text-[#E85D04] focus:ring-[#E85D04]" />
                  <span className="text-stone-700 font-medium text-sm">58mm Thermal (2")</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={config.paperSize === 80} onChange={() => handleSave({ paperSize: 80 })} className="w-4 h-4 text-[#E85D04] focus:ring-[#E85D04]" />
                  <span className="text-stone-700 font-medium text-sm">80mm Thermal (3")</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={config.paperSize === 'a4'} onChange={() => handleSave({ paperSize: 'a4' })} className="w-4 h-4 text-[#E85D04] focus:ring-[#E85D04]" />
                  <span className="text-stone-700 font-medium text-sm">A4 Standard Page</span>
                </label>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-stone-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={config.autoCut} onChange={(e) => handleSave({ autoCut: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E85D04]"></div>
                </div>
                <span className="text-stone-700 font-medium text-sm">Auto Cut Receipt (Thermal)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={config.cashDrawer} onChange={(e) => handleSave({ cashDrawer: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E85D04]"></div>
                </div>
                <span className="text-stone-700 font-medium text-sm">Kick Cash Drawer</span>
              </label>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-stone-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-stone-500" /> Connection Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-stone-600 text-sm font-medium">Status</span>
                  <span className={`text-sm font-bold ${status.includes('Connected') ? 'text-green-600' : 'text-stone-500'}`}>{status}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-stone-600 text-sm font-medium">Selected Mode</span>
                  <span className="text-sm font-bold text-stone-900 uppercase">{config.type}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleTestPrint}
              className="w-full mt-6 py-3 bg-[#E85D04] text-white font-bold rounded-xl hover:bg-[#c44e03] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <TestTube className="w-5 h-5" /> Print Test Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
    <WindowsPrinterModal 
      isOpen={showWindowsModal} 
      onClose={() => setShowWindowsModal(false)}
      role={role}
      onConnect={() => {
        setConfig(printerService.getConfig());
        checkStatus();
      }}
    />
    <QZPrinterModal
      isOpen={showQZModal}
      onClose={() => setShowQZModal(false)}
      role={role}
      onConnect={() => {
        setConfig(printerService.getConfig());
        checkStatus();
      }}
    />
    </>
  );
}
