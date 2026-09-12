import React, { useState, useEffect } from 'react';
import { adminPrinterService, managerPrinterService } from '../lib/printer/PrinterService';
import { Printer, X, Loader2, Link } from 'lucide-react';
import toast from 'react-hot-toast';

interface QZPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'admin' | 'manager';
  onConnect?: () => void;
}

export default function QZPrinterModal({ isOpen, onClose, role = 'manager', onConnect }: QZPrinterModalProps) {
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
      const list = await printerService.getQZPrinters();
      setPrinters(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch QZ Tray printers. Is QZ Tray running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (printerName: string) => {
    // Save to qz-tray
    const config = printerService.getConfig();
    printerService.saveConfig({
      ...config,
      type: 'qz-tray',
      qzPrinterName: printerName
    });
    toast.success(`Connected to QZ Printer: ${printerName}`);
    if (onConnect) onConnect();
    onClose();
  };

  if (!isOpen) return null;

  // Parse numbered steps from error message (lines starting with digits like "1. ...")
  const renderError = (msg: string) => {
    const lines = msg.split('\n').filter(Boolean);
    const intro = lines[0];
    const steps = lines.slice(1).filter(l => /^\d+\./.test(l));
    const hasSteps = steps.length > 0;
    return (
      <div className="text-center py-6 px-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6" />
        </div>
        <p className="text-red-600 font-semibold text-sm mb-3">{intro}</p>
        {hasSteps && (
          <ol className="text-left text-sm text-stone-700 space-y-2 bg-stone-50 rounded-xl p-4 mb-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-[#E85D04] text-white rounded-full text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{step.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>
        )}
        {!hasSteps && (
          <p className="text-stone-500 text-xs mb-4">{msg}</p>
        )}
        <a
          href="https://qz.io/download"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-[#E85D04] hover:underline mb-3"
        >
          Don't have QZ Tray? Download it here →
        </a>
        <button
          onClick={fetchPrinters}
          className="px-5 py-2 bg-[#E85D04] text-white rounded-xl text-sm font-semibold hover:bg-[#c94e03] transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E85D04]/10 rounded-full flex items-center justify-center">
              <Link className="w-5 h-5 text-[#E85D04]" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg leading-tight">Select QZ Tray Printer</h3>
              <p className="text-xs text-stone-500">Local Websocket Bridge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-white" data-lenis-prevent="true">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#E85D04]" />
              <p className="text-sm font-medium">Connecting to QZ Tray...</p>
              <p className="text-xs text-stone-400 text-center max-w-[220px]">
                If a QZ Tray permission prompt appears, click <strong>"Allow"</strong>.
              </p>
            </div>
          ) : error ? (
            renderError(error)
          ) : printers.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-900 font-bold mb-1">No printers found</p>
              <p className="text-stone-500 text-sm max-w-[250px] mx-auto">Make sure QZ Tray application is running on your machine.</p>
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
                  className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 hover:border-[#E85D04] hover:bg-orange-50 hover:shadow-sm transition-all flex items-center gap-3 group"
                >
                  <Printer className="w-5 h-5 text-stone-400 group-hover:text-[#E85D04]" />
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
