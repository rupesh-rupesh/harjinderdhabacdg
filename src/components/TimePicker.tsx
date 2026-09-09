import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const generateTimeSlots = () => {
  const slots = [];
  // Add empty slots for padding at top and bottom if needed for snapping (optional)
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hourStr = h.toString().padStart(2, '0');
      const minStr = m.toString().padStart(2, '0');
      
      const isPM = h >= 12;
      let displayHour = h % 12;
      if (displayHour === 0) displayHour = 12;
      const ampm = isPM ? 'PM' : 'AM';
      
      slots.push({
        value: `${hourStr}:${minStr}`, // "13:30"
        displayStr: `${displayHour}:${minStr}`, // "1:30"
        ampm: ampm
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format the display value for the input box
  const getDisplayValue = () => {
    if (!value) return '';
    const slot = TIME_SLOTS.find(s => s.value === value);
    if (slot) return `${slot.displayStr} ${slot.ampm}`;
    return value;
  };

  // Scroll to selected item when opened
  useEffect(() => {
    if (isOpen && scrollRef.current && value) {
      const index = TIME_SLOTS.findIndex(s => s.value === value);
      if (index !== -1) {
        // Each item is 48px high (h-12). Top padding is 96px.
        // Item center = 96 + index*48 + 24. Container half height = 120.
        // scrollTop = Item center - 120 = (96 + index*48 + 24) - 120 = index * 48.
        const scrollTop = index * 48; 
        scrollRef.current.scrollTop = scrollTop;
      }
    }
  }, [isOpen, value]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"
      >
        <Clock className="h-4 w-4 text-stone-400" />
      </div>
      <input 
        type="text" 
        readOnly
        required={required}
        value={getDisplayValue()}
        onClick={() => setIsOpen(!isOpen)}
        placeholder="Select time"
        className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#e27d60] focus:border-[#e27d60] outline-none transition-shadow text-stone-700 font-medium shadow-sm hover:border-stone-300 cursor-pointer"
      />

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 w-48 bg-white border border-stone-100 rounded-3xl shadow-xl overflow-hidden left-0 py-4 transform origin-bottom animate-in fade-in zoom-in-95 duration-200">
          <div 
            ref={scrollRef}
            className="max-h-[240px] overflow-y-auto hide-scrollbar snap-y snap-mandatory relative px-2" data-lenis-prevent="true"
          >
            {/* Top padding to allow first item to be centered */}
            <div className="h-[96px] shrink-0" />
            
            {TIME_SLOTS.map((slot, index) => {
              const isSelected = value === slot.value;
              return (
                <div 
                  key={slot.value}
                  onClick={() => {
                    onChange(slot.value);
                    setIsOpen(false);
                  }}
                  className={`h-12 flex items-center justify-center cursor-pointer snap-center transition-all duration-300 rounded-2xl mx-2 ${
                    isSelected 
                      ? 'bg-[#e27d60] text-white scale-110 shadow-md font-bold' 
                      : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium scale-95 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl tracking-tight">{slot.displayStr}</span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'opacity-90' : 'opacity-0'}`}>
                      {slot.ampm}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Bottom padding to allow last item to be centered */}
            <div className="h-[96px] shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};
