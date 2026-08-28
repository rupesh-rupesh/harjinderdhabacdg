import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-6 flex flex-col items-center text-center ${isDestructive ? 'text-red-500' : 'text-stone-800'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100 text-red-500' : 'bg-stone-100 text-stone-600'}`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-stone-800 mb-2">{title}</h3>
          <p className="text-stone-500 font-medium">{message}</p>
        </div>
        
        <div className="flex border-t border-stone-100">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 font-bold text-stone-500 hover:bg-stone-50 transition-colors"
          >
            {cancelText}
          </button>
          <div className="w-px bg-stone-100" />
          <button 
            onClick={onConfirm}
            className={`flex-1 py-4 font-black transition-colors ${
              isDestructive 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-stone-800 hover:bg-stone-50'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
