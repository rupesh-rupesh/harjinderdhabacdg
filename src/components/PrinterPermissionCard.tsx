import React, { useEffect, useState } from 'react';
import { printerService } from '../lib/printer/PrinterService';
import { Printer, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export function PrinterPermissionCard({ onConnect }: { onConnect: () => void }) {
  const [status, setStatus] = useState<'checking' | 'permission_required' | 'disconnected' | 'connected'>('checking');
  
  const checkPrinter = async () => {
    if (printerService.getConfig().type === 'browser') {
      setStatus('connected'); // Browser print is always "connected"
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
      if (e.message && !e.message.toLowerCase().includes('cancel') && !e.message.includes('permissions policy')) {
        toast.error(`An error occurred: ${e.message}`);
      } else if (e.message.includes('permissions policy')) {
        toast.error('Access blocked by browser. Try opening in a new tab.');
      }
    }
  };

  if (status === 'checking' || status === 'connected') {
    return null;
  }

  if (status === 'permission_required') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-100">
          <AlertCircle className="w-6 h-6 text-dhaba-orange" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-900">Printer Permission Required</h3>
          <p className="text-stone-600 text-sm mt-1">
            Printing requires Bluetooth or USB access. Grant permission once to enable thermal bill printing.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={() => setStatus('connected')} // dismiss without connecting
            className="flex-1 sm:flex-none px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 font-bold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGrantPermission}
            className="flex-1 sm:flex-none px-4 py-2 bg-dhaba-orange text-white rounded-lg hover:bg-dhaba-orange-light font-bold transition-colors shadow-sm whitespace-nowrap"
          >
            Grant Permission
          </button>
        </div>
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-red-100">
          <Printer className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-900">Printer Disconnected</h3>
          <p className="text-stone-600 text-sm mt-1">
            Reconnect your Bluetooth or USB thermal printer to continue printing bills.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={() => { setStatus('checking'); checkPrinter(); }}
            className="flex-1 sm:flex-none px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 font-bold transition-colors"
          >
            Retry
          </button>
          <button 
            onClick={handleGrantPermission}
            className="flex-1 sm:flex-none px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-black font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Connect Printer
          </button>
        </div>
      </div>
    );
  }

  return null;
}
