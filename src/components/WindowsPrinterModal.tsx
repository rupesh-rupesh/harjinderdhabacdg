import React, { useState, useEffect } from 'react';
import { adminPrinterService, managerPrinterService } from '../lib/printer/PrinterService';
import { Printer, X, Loader2, Usb } from 'lucide-react';
import toast from 'react-hot-toast';

interface WindowsPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'admin' | 'manager';
  onConnect?: () => void;
}

export default function WindowsPrinterModal({ isOpen, onClose, role = 'manager', onConnect }: WindowsPrinterModalProps) {
  const printerService = role === 'admin' ? adminPrinterService : managerPrinterService;
  const [printers, setPrinters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPrinters();
    }
  }, [isOpen]);

  const fetchPrinters = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await printerService.getWindowsPrinters();
      setPrinters(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch printers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (printerName: string) => {
    // Save to windows-print
    const config = printerService.getConfig();
    printerService.saveConfig({
      ...config,
      type: 'windows-print',
      windowsPrinterName: printerName
    });
    toast.success(`Connected to ${printerName}`);
    if (onConnect) onConnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dhaba-orange/10 rounded-full flex items-center justify-center">
              <Usb className="w-5 h-5 text-dhaba-orange" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg leading-tight">Select USB Printer</h3>
              <p className="text-xs text-stone-500">Windows Native Driver</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-white" data-lenis-prevent="true">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-dhaba-orange" />
              <p className="text-sm font-medium">Scanning for printers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button onClick={fetchPrinters} className="mt-4 text-sm text-stone-600 hover:text-stone-900 underline">
                Try again
              </button>
            </div>
          ) : printers.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-900 font-bold mb-1">No printers found</p>
              <p className="text-stone-500 text-sm max-w-[250px] mx-auto">Make sure a printer is installed in Windows and the local dev server is running.</p>
              <button onClick={fetchPrinters} className="mt-4 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 text-sm font-medium transition-colors">
                Refresh List
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-bold text-stone-700 mb-4 px-1">Available Devices</p>
              {printers.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSelect(p)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 hover:border-dhaba-orange hover:bg-orange-50 hover:shadow-sm transition-all flex items-center gap-3 group"
                >
                  <Printer className="w-5 h-5 text-stone-400 group-hover:text-dhaba-orange" />
                  <span className="font-medium text-stone-700 group-hover:text-stone-900">{p}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
