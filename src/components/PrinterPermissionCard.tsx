import React, { useEffect, useState } from 'react';
import { adminPrinterService, managerPrinterService } from '../lib/printer/PrinterService';
import { Printer, AlertCircle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function PrinterPermissionCard({ role = 'manager', onConnect }: { role?: 'admin' | 'manager', onConnect?: () => void }) {
  const printerService = role === 'admin' ? adminPrinterService : managerPrinterService;
  const [status, setStatus] = useState<'checking' | 'permission_required' | 'disconnected' | 'connected'>('checking');
  
  const checkPrinter = async () => {
    const type = printerService.getConfig().type;
    // These modes use server-side or OS bridges — no hardware permission needed
    if (type !== 'webusb' && type !== 'webbluetooth') {
      setStatus('connected');
      return;
    }
    
    const hasPerm = printerService.isPermissionGranted();
    
    if (!hasPerm) {
      setStatus('permission_required');
      return;
    }
    
    // If permission is granted, try to auto-connect silently
    if (printerService.isConnected()) {
      setStatus('connected');
      return;
    }
    
    const autoConnected = await printerService.autoConnect();
    if (autoConnected) {
      setStatus('connected');
    } else {
      setStatus('disconnected');
    }
  };

  useEffect(() => {
    checkPrinter();
  }, []);

  const handleGrantPermission = async () => {
    try {
      if (printerService.getConfig().type === 'webusb') {
        await printerService.connectWebUSB();
      } else if (printerService.getConfig().type === 'webbluetooth') {
        await printerService.connectWebBluetooth();
      }
      
      if (printerService.isConnected()) {
        setStatus('connected');
        onConnect();
        toast.success("Printer connected successfully!");
      }
    } catch (e: any) {
      if (window.self !== window.top && (e.name === 'SecurityError' || e.message?.includes('permissions policy'))) {
        toast.error((t) => (
          <div className="flex flex-col gap-2">
            <span>Hardware access is blocked in this preview window.</span>
            <a 
              href={window.location.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-black text-white text-xs text-center rounded hover:bg-gray-800 font-medium"
              onClick={() => toast.dismiss(t.id)}
            >
              Open App in New Tab to Connect
            </a>
          </div>
        ), { duration: 10000 });
      } else if (e.message && !e.message.toLowerCase().includes('cancel')) {
        toast.error(`Error: ${e.message}`);
      }
    }
  };

  if (status === 'checking' || status === 'connected') {
    return null;
  }

  if (status === 'permission_required') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 sm:pr-14 mb-6 flex flex-col sm:flex-row items-center gap-4 relative">
        <button 
          onClick={() => setStatus('connected')} 
          className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-orange-400 hover:text-orange-700 hidden sm:flex items-center justify-center rounded-full hover:bg-orange-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-100">
          <AlertCircle className="w-6 h-6 text-dhaba-orange" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-stone-900">Printer Permission Required</h3>
          <p className="text-stone-600 text-sm mt-1">
            Printing requires Bluetooth or USB access. Grant permission once to enable thermal bill printing.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={() => setStatus('connected')} // dismiss without connecting
            className="flex-1 sm:hidden px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 font-bold transition-colors"
          >
            Later
          </button>
          <button 
            onClick={handleGrantPermission}
            className="flex-1 sm:flex-none px-4 py-2 bg-dhaba-orange text-white rounded-lg hover:bg-dhaba-orange-light font-bold transition-colors shadow-sm whitespace-nowrap"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 sm:pr-14 mb-6 flex flex-col sm:flex-row items-center gap-4 relative">
        <button 
          onClick={() => setStatus('connected')} 
          className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-red-400 hover:text-red-700 hidden sm:flex items-center justify-center rounded-full hover:bg-red-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-red-100">
          <Printer className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-stone-900">Printer Disconnected</h3>
          <p className="text-stone-600 text-sm mt-1">
            Reconnect your Bluetooth or USB thermal printer to continue printing bills.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={() => setStatus('connected')}
            className="flex-1 sm:hidden px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 font-bold transition-colors"
          >
            Later
          </button>
          <button 
            onClick={handleGrantPermission}
            className="flex-1 sm:flex-none px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-black font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Connect
          </button>
        </div>
      </div>
    );
  }

  return null;
}
