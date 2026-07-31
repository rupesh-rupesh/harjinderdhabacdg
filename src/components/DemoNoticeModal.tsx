import React, { useState, useEffect } from 'react';
import { User, Heart, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DemoNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsFetched, setSettingsFetched] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/settings')
      .then(res => {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) return res.json();
        return {};
      })
      .then((data: any) => {
        if (data && data.demoNoticeEnabled !== false) {
          setIsOpen(true);
        }
        setSettingsFetched(true);
      })
      .catch(err => {
        if (err.message !== 'Failed to fetch') console.error(err);
        setIsOpen(true);
        setSettingsFetched(true);
      });
  }, []);

  if (!settingsFetched) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1a110d]/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-[520px] bg-[#FEFBF6] rounded-[2rem] shadow-2xl overflow-hidden border border-[#FCE3D1]/50"
          >
            {/* Subtle corner patterns simulating the mandala effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#FFF0E5] rounded-full blur-3xl opacity-50"></div>
              <div className="absolute top-1/2 -right-32 w-64 h-64 bg-[#FFF0E5] rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="relative p-8 sm:p-10 text-center">
              
              {/* Top Shield Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FFF0E5] rounded-full blur-xl transform scale-150"></div>
                  {/* Subtle dotted ring */}
                  <svg width="104" height="104" viewBox="0 0 104 104" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                    <circle cx="52" cy="52" r="50" fill="none" stroke="#E85D04" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                  <div className="w-[72px] h-[72px] bg-[#FEFBF6] rounded-full flex items-center justify-center border border-[#FCE3D1] relative z-10 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M11 10h2M11 15h2M12 10v5"/>
                      <circle cx="12" cy="7" r="1.5" fill="#E85D04" stroke="none" />
                    </svg>
                  </div>
                  {/* Decorative vines left and right of shield */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-16 opacity-40">
                    <svg width="40" height="16" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 6C24 6 20 1 16 1C12 1 8 6 0 6C8 6 12 11 16 11C20 11 24 6 32 6Z" stroke="#E85D04" strokeWidth="1" fill="none"/>
                      <circle cx="24" cy="4" r="1" fill="#E85D04"/>
                      <circle cx="8" cy="8" r="1" fill="#E85D04"/>
                    </svg>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-16 opacity-40">
                    <svg width="40" height="16" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 6C8 6 12 1 16 1C20 1 24 6 32 6C24 6 20 11 16 11C12 11 8 6 0 6Z" stroke="#E85D04" strokeWidth="1" fill="none"/>
                      <circle cx="8" cy="4" r="1" fill="#E85D04"/>
                      <circle cx="24" cy="8" r="1" fill="#E85D04"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 -ml-2">
                  <path d="M4 18h16" />
                  <path d="M5 18c0-4 3.5-7 7-7s7 3 7 7" />
                  <path d="M12 11V9" />
                  <circle cx="12" cy="8" r="1" />
                  <path d="M9 5c-.5-1 1-1.5.5-2.5" />
                  <path d="M12 4c-.5-1 1-1.5.5-2.5" />
                  <path d="M15 5c-.5-1 1-1.5.5-2.5" />
                  <path d="M3 10v2c0 1 .5 1.5 1 1.5s1-.5 1-1.5v-2" />
                  <path d="M4 13.5V16" />
                  <path d="M2 10v2" />
                  <path d="M6 10v2" />
                </svg>
                <h2 className="text-[28px] sm:text-[32px] font-bold text-stone-900 font-serif leading-tight">
                  Demo Website <span className="text-[#E85D04]">Notice</span>
                </h2>
              </div>

              {/* Divider Under Title */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px bg-stone-200 w-12"></div>
                <div className="w-[5px] h-[5px] rounded-full border border-[#E85D04] bg-white"></div>
                <div className="h-px bg-stone-200 w-12"></div>
              </div>

              {/* Welcome text */}
              <p className="text-[#3a3532] leading-[1.6] mb-8 text-[15px] max-w-sm mx-auto">
                Welcome! This website is a demonstration version created to showcase the design, features, and functionality of <span className="text-[#E85D04] font-bold">Harjinder Tourist Dhaba</span>'s digital experience.
              </p>

              {/* Notice Cards */}
              <div className="space-y-3 mb-8 text-left">
                <div className="bg-[#FFF8F3] border border-[#FCE3D1] rounded-2xl p-4 sm:p-5 flex gap-4 items-start shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="w-[34px] h-[34px] rounded-full border-2 border-[#E85D04]/60 text-[#E85D04] flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    <span className="font-bold font-serif text-[18px] leading-none">!</span>
                  </div>
                  <p className="text-[#3a3532] text-[14px] leading-[1.6]">
                    Some features may be incomplete, use sample data, or be unavailable in this demo. Orders, payments, and reservations made here are not processed.
                  </p>
                </div>
                <div className="bg-[#FFF8F3] border border-[#FCE3D1] rounded-2xl p-4 sm:p-5 flex gap-4 items-start shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="w-[34px] h-[34px] rounded-full border-2 border-[#E85D04]/60 text-[#E85D04] flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    <Heart className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <p className="text-[#3a3532] text-[14px] leading-[1.6]">
                    We appreciate your feedback and look forward to bringing the full experience to you soon.
                  </p>
                </div>
              </div>

              {/* Name Input */}
              <div className="text-left mb-6">
                <label htmlFor="visitorName" className="block text-[15px] font-bold text-stone-900 mb-2.5 tracking-tight">
                  Please enter your name to continue
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-[#E85D04] ml-1" strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    id="visitorName"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#FCE3D1] focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04] bg-[#FFF8F3] text-stone-800 placeholder-stone-400 transition-colors shadow-inner"
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-3.5 mb-8 text-left">
                <button
                  type="button"
                  onClick={() => setIsChecked(!isChecked)}
                  className={`w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                    isChecked ? 'bg-[#E85D04] border-[#E85D04]' : 'bg-white border border-stone-300'
                  }`}
                >
                  {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3.5} />}
                </button>
                <p className="text-[14px] text-[#3a3532] leading-snug cursor-pointer pt-0.5" onClick={() => setIsChecked(!isChecked)}>
                  By clicking <span className="font-bold text-[#E85D04]">“Continue”</span>, you agree that this website belongs to us and not to you.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mb-8 opacity-80">
                <div className="h-[1px] bg-stone-300 w-10"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#E85D04]/60"></div>
                <span className="text-[11px] font-bold tracking-[0.25em] text-stone-600 uppercase">
                  Harjinder Tourist Dhaba
                </span>
                <div className="w-[3px] h-[3px] rounded-full bg-[#E85D04]/60"></div>
                <div className="h-[1px] bg-stone-300 w-10"></div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setIsOpen(false)}
                disabled={!visitorName.trim() || !isChecked}
                className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#e75300] to-[#f4701e]"></div>
                {/* Subtle mandala overlay inside button */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z\' fill=\'%23ffffff\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px', backgroundRepeat: 'space' }}></div>
                
                <div className="relative py-4 px-6 flex items-center justify-center gap-3">
                  <span className="text-white font-semibold text-[17px] tracking-wide">Continue</span>
                  <ArrowRight className="w-[22px] h-[22px] text-white group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </div>
              </button>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
