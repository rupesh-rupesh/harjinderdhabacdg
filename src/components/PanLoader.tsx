import React from 'react';

export default function PanLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full gap-6 text-stone-500 w-full min-h-[50vh]">
      <img
        src="/frying-pan.gif"
        alt="Loading..."
        className="w-24 h-24 object-contain"
      />
      <div className="font-bold uppercase tracking-widest text-sm animate-pulse text-[#3B291A]">
        {text}
      </div>
    </div>
  );
}
