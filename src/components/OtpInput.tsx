import React, { useRef, useEffect, ClipboardEvent, KeyboardEvent, ChangeEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isSuccess?: boolean;
}

export default function OtpInput({ value, onChange, disabled = false, isSuccess = false }: OtpInputProps) {
  const digits = 6;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const vals = value.padEnd(digits, '').split('').slice(0, digits);

  // Auto-focus first empty box when shown
  useEffect(() => {
    const firstEmpty = vals.findIndex(v => v === '' || v === ' ');
    const idx = firstEmpty === -1 ? digits - 1 : firstEmpty;
    inputRefs.current[idx]?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = vals.slice();
    next[idx] = char;
    const newVal = next.join('').replace(/ /g, '');
    onChange(newVal);
    if (char && idx < digits - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = vals.slice();
      if (next[idx]) {
        next[idx] = '';
        onChange(next.join('').replace(/ /g, ''));
      } else if (idx > 0) {
        next[idx - 1] = '';
        onChange(next.join('').replace(/ /g, ''));
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < digits - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, digits);
    if (pasted) {
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, digits - 1);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length: digits }).map((_, idx) => (
        <input
          key={idx}
          ref={el => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={vals[idx] === ' ' ? '' : (vals[idx] || '')}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          disabled={disabled}
          className={`
            w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl
            border-2 transition-all duration-200 outline-none
            bg-[#1a1008]/50 text-white placeholder-white/20
            focus:border-[#C89B3C] focus:bg-black/60 focus:ring-4 focus:ring-[#C89B3C]/20
            ${isSuccess ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)] text-green-400' : 
              vals[idx] && vals[idx] !== ' ' ? 'border-[#C89B3C]/70 bg-black/50' : 'border-[#C89B3C]/20'}
            disabled:opacity-80 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}
