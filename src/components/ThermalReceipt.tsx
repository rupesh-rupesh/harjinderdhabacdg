import React from 'react';
import { Utensils } from 'lucide-react';

// Helper to convert number to words (for Indian Rupees)
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
  // Handle Crores, Lakhs, Thousands
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

interface ThermalReceiptProps {
  order: any;
  includeGst: boolean;
  managerName?: string;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ order, includeGst, managerName, forwardedRef }) => {
  if (!order) return null;

  let items = [];
  try {
    items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  } catch (e) {
    items = [];
  }

  // Filter out table markers if any
  const billItems = items.filter((i: any) => !i.isTableMarker);

  const subTotal = billItems.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * item.quantity, 0);

  const cgst = includeGst ? parseFloat((subTotal * 0.025).toFixed(2)) : 0;
  const sgst = includeGst ? parseFloat((subTotal * 0.025).toFixed(2)) : 0;
  const grandTotal = subTotal + cgst + sgst;
  const totalQty = billItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const orderDate = new Date(order.createdAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div ref={forwardedRef} className="thermal-receipt-container font-mono text-black bg-white p-4 max-w-[350px] mx-auto text-[13px] leading-tight">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .thermal-receipt-container, .thermal-receipt-container * {
            visibility: visible;
          }
          .thermal-receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 2mm !important;
            margin: 0 !important;
          }
        }
        .thermal-receipt-container {
          color: #000;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .thick-divider {
          border-top: 2px dashed #000;
          margin: 6px 0;
        }
      `}} />

      {/* Header */}
      <div className="text-center mb-2 flex flex-col items-center">
        <img src="/bill-logo.png" alt="Logo" className="w-[300px] h-auto object-contain -mt-4 -mb-10 grayscale filter contrast-125 relative z-0" />
        <p className="mb-0 z-10 relative">VPO-Sahauran, Teh-Kharar,</p>
        <p className="mb-0">Distt. Mohali (Punjab) - 140103</p>
        <p className="mb-0">Phone: 90566-55093</p>
        <p className="mb-0">FSSAI: 22120036000138</p>
        {includeGst && <p className="mb-0 font-bold mt-1">GSTIN: 03AAKFH5744C1Z0</p>}
      </div>

      <div className="divider"></div>

      {/* Bill Info */}
      <div className="flex justify-between mb-1">
        <div>
          <div>Date: {formatDate(orderDate)}</div>
          <div>Time: {formatTime(orderDate)}</div>
        </div>
        <div className="text-right">
          {order.id && order.id !== 'DRAFT' && <div>Bill No.: #HTD-{order.id}</div>}
          {managerName && <div>Mgr: {managerName}</div>}
        </div>
      </div>

      <div className="thick-divider"></div>

      {/* Item Table Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 font-bold mb-1">
        <div>Item Name</div>
        <div className="text-right w-8">Qty</div>
        <div className="text-right w-12">Rate</div>
        <div className="text-right w-16">Amount</div>
      </div>

      <div className="divider"></div>

      {/* Item Table Body */}
      <div className="mb-2">
        {billItems.map((item: any, i: number) => {
          const itemPrice = (Number(item.price) || 0);
          const itemAmount = itemPrice * item.quantity;
          let itemName = item.name;
          if (item.isHalf) itemName += ' (Half)';
          if (item.isButter) itemName += ' (Butter)';
          if (item.variantName) itemName += ` (${item.variantName})`;

          return (
            <React.Fragment key={i}>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 mb-1">
                <div className="break-words max-w-full pr-1">{itemName}</div>
                <div className="text-right w-8">{item.quantity}</div>
                <div className="text-right w-12">{itemPrice.toFixed(2)}</div>
                <div className="text-right w-16">{itemAmount.toFixed(2)}</div>
              </div>
              <div className="border-t border-dashed border-gray-300 my-3 last:hidden"></div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="thick-divider"></div>

      {/* Totals */}
      <div className="font-bold mb-2">Total Qty : {totalQty}</div>

      <div className="space-y-1 mb-2">
        <div className="flex justify-between">
          <span>Sub Total</span>
          <span>Rs. {subTotal.toFixed(2)}</span>
        </div>
        {includeGst && (
          <>
            <div className="flex justify-between">
              <span>CGST @2.5%</span>
              <span>Rs. {cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST @2.5%</span>
              <span>Rs. {sgst.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div className="border-t-[2px] border-black my-1"></div>

      <div className="flex justify-between font-black text-xl mb-2 py-1 uppercase">
        <span>Grand Total</span>
        <span>Rs. {grandTotal.toFixed(2)}</span>
      </div>

      {/* Remark Box */}
      {managerName?.trim().toLowerCase() !== 'admin' && (
        <div className="border border-black p-2 text-center mb-4">
          Remark: <br />This bill was generated by the {managerName || 'Manager'}.
        </div>
      )}

      {/* Footer */}
      <div className="text-center">
        <div className="font-bold">Thank You!</div>
        <div>Visit Again</div>
        <div className="text-xs mt-1">We appreciate your visit.</div>
      </div>

      <div className="h-4"></div> {/* Bottom padding for cutter */}
    </div>
  );
};
