import React, { useState, useEffect } from 'react';
import { printerService, PrinterConfig } from '../lib/printer/PrinterService';
import { Printer, Settings, Usb, Bluetooth, Globe, Monitor, TestTube, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrinterSettings() {
  const [config, setConfig] = useState<PrinterConfig>(printerService.getConfig());
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, [config.type]);

  const checkStatus = async () => {
    try {
      const s = await printerService.checkStatus();
      setStatus(s);
    } catch(e) {
      setStatus('Status unknown');
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
            <Printer className="w-6 h-6 text-stone-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Printer Settings</h2>
            <p className="text-stone-500">Configure thermal receipt printer</p>
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
              <label className="block text-sm font-bold text-stone-700 mb-2">Connection Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSave({ type: 'browser' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${config.type === 'browser' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04]' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-semibold">Browser Default</span>
                </button>
                <button 
                  onClick={async () => {
                    handleSave({ type: 'webusb' });
                    try {
                      await printerService.connectWebUSB();
                      const newStatus = await printerService.checkStatus();
                      setStatus(newStatus);
                    } catch (e: any) {
                      setError(e.message);
                    }
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${config.type === 'webusb' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04]' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Usb className="w-5 h-5" />
                  <span className="text-sm font-semibold">USB (Direct)</span>
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
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${config.type === 'webbluetooth' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04]' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Bluetooth className="w-5 h-5" />
                  <span className="text-sm font-semibold">Bluetooth</span>
                </button>
                <button 
                  onClick={() => handleSave({ type: 'qz-tray' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${config.type === 'qz-tray' ? 'bg-[#fdf5f0] border-[#E85D04] text-[#E85D04]' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-semibold">LAN / QZ Tray</span>
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                * USB requires supported browsers (Chrome, Edge). Others are experimental.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Paper Size</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={config.paperSize === 58} onChange={() => handleSave({ paperSize: 58 })} className="w-4 h-4 text-[#E85D04] focus:ring-[#E85D04]" />
                  <span className="text-stone-700 font-medium">58mm</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={config.paperSize === 80} onChange={() => handleSave({ paperSize: 80 })} className="w-4 h-4 text-[#E85D04] focus:ring-[#E85D04]" />
                  <span className="text-stone-700 font-medium">80mm</span>
                </label>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-stone-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={config.autoCut} onChange={(e) => handleSave({ autoCut: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E85D04]"></div>
                </div>
                <span className="text-stone-700 font-medium">Auto Cut Receipt</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={config.cashDrawer} onChange={(e) => handleSave({ cashDrawer: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E85D04]"></div>
                </div>
                <span className="text-stone-700 font-medium">Kick Cash Drawer</span>
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
  );
}
