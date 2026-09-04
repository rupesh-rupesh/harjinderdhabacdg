import React from 'react';
import { Users, Leaf, Home, PartyPopper, CheckCircle2, Phone, CalendarHeart, Info, Car } from 'lucide-react';

export default function BanquetSection() {
  const handleEnquire = () => {
    window.location.href = 'tel:+919056655093';
  };

  const handleBook = () => {
    window.open('https://wa.me/919056655093?text=Hi,%20I%20would%20like%20to%20book%20the%20Banquet%20Hall.', '_blank');
  };

  return (
    <section className="relative w-full py-16 overflow-hidden bg-transparent" id="banquet">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Content Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 lg:mb-16 gap-8">
          
          <div className="lg:w-3/5 text-left">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px bg-gradient-to-r from-transparent to-[var(--color-gold)] w-12 lg:w-24"></div>
              <span className="text-[var(--color-gold)] tracking-[0.2em] uppercase text-sm lg:text-base font-medium font-serif">
                Banquet Hall &
              </span>
              <div className="h-px bg-gradient-to-l from-transparent to-[var(--color-gold)] w-12 lg:w-24 hidden md:block"></div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-bold text-[var(--color-brown)] mb-4 font-serif leading-tight">
              PARTY <br className="hidden lg:block"/>
              <span className="text-[var(--color-gold)]">BOOKINGS</span>
            </h2>
            
            <p className="text-[var(--color-gold)] text-xl lg:text-2xl mb-6 font-medium" style={{ fontFamily: 'cursive' }}>
              Celebrate. Create Memories. Cherish Together.
            </p>
            
            <p className="text-stone-600 text-base lg:text-lg max-w-2xl mb-8 leading-relaxed font-medium">
              The perfect venue for Birthday Parties, Kitty Parties, Family Functions & Small Gatherings.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="flex items-center gap-3 group hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[var(--color-gold)]/30 shadow-sm group-hover:shadow-md group-hover:border-[var(--color-gold)]/60 transition-all">
                  <Users className="w-5 h-5 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs text-stone-600 leading-tight">
                  <span className="block">Ideal for</span>
                  <strong className="text-[var(--color-brown)]">80-100 Guests</strong>
                </div>
              </div>
              <div className="flex items-center gap-3 group hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[var(--color-gold)]/30 shadow-sm group-hover:shadow-md group-hover:border-[var(--color-gold)]/60 transition-all">
                  <Leaf className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs text-stone-600 leading-tight">
                  <span className="block">Pure</span>
                  <strong className="text-[var(--color-brown)]">Vegetarian</strong>
                </div>
              </div>
              <div className="flex items-center gap-3 group hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[var(--color-gold)]/30 shadow-sm group-hover:shadow-md group-hover:border-[var(--color-gold)]/60 transition-all">
                  <Home className="w-5 h-5 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs text-stone-600 leading-tight">
                  <span className="block">Spacious</span>
                  <strong className="text-[var(--color-brown)]">Banquet Hall</strong>
                </div>
              </div>
              <div className="flex items-center gap-3 group hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[var(--color-gold)]/30 shadow-sm group-hover:shadow-md group-hover:border-[var(--color-gold)]/60 transition-all">
                  <PartyPopper className="w-5 h-5 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs text-stone-600 leading-tight">
                  <span className="block">Perfect for</span>
                  <strong className="text-[var(--color-brown)]">Private Celebrations</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-2/5 flex justify-center lg:justify-end w-full group perspective-1000 z-10">
            <div className="relative p-2.5 bg-gradient-to-br from-[#fcfaf5] to-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] group-hover:shadow-[0_20px_50px_rgba(200,155,60,0.15)] transition-all duration-700 group-hover:-translate-y-2 group-hover:rotate-2 border border-stone-100 w-full max-w-[300px]">
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-[1.5px] border-l-[1.5px] border-[var(--color-gold)]/50 rounded-tl-lg pointer-events-none transition-all duration-500 group-hover:top-3 group-hover:left-3 group-hover:border-[var(--color-gold)]"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-[var(--color-gold)]/50 rounded-tr-lg pointer-events-none transition-all duration-500 group-hover:top-3 group-hover:right-3 group-hover:border-[var(--color-gold)]"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-[var(--color-gold)]/50 rounded-bl-lg pointer-events-none transition-all duration-500 group-hover:bottom-3 group-hover:left-3 group-hover:border-[var(--color-gold)]"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-[1.5px] border-r-[1.5px] border-[var(--color-gold)]/50 rounded-br-lg pointer-events-none transition-all duration-500 group-hover:bottom-3 group-hover:right-3 group-hover:border-[var(--color-gold)]"></div>
              
              <div className="border border-[var(--color-gold)]/15 rounded-3xl p-8 text-center bg-white h-full flex flex-col justify-center relative overflow-hidden transition-colors duration-500 group-hover:border-[var(--color-gold)]/30">
                {/* Subtle background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-5">
                    <div className="bg-stone-50 p-2.5 rounded-full border border-stone-100 text-[var(--color-gold)] group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#fcfaf5] group-hover:border-[var(--color-gold)]/30">
                       <PartyPopper className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="text-[#3a2e28] tracking-[0.25em] font-black mb-4 uppercase text-[10px] opacity-80">You Are Invited</div>
                  <div className="text-[var(--color-gold)] italic text-2xl font-serif leading-tight">To Celebrate</div>
                  <div className="text-amber-900 italic text-[28px] font-serif mt-1 font-bold group-hover:scale-105 transition-transform duration-500">Your Special Day</div>
                  
                  <div className="mt-7 pt-5 border-t border-[var(--color-gold)]/10 flex flex-col items-center gap-1.5 transition-colors group-hover:border-[var(--color-gold)]/30">
                     <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">Reserve Your Date</span>
                     <span className="text-sm font-bold text-[var(--color-brown)] group-hover:text-[var(--color-gold)] transition-colors">+91 9056655093</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          {/* Gold Plan */}
          {/* Gold Plan */}
          <div className="relative rounded-3xl bg-white border border-[var(--color-gold)]/30 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(200,155,60,0.15)] hover:border-[var(--color-gold)]/60 transition-all duration-500 flex flex-col sm:flex-row h-full">
            
            {/* Corner Ribbon */}
            <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden rounded-tl-3xl z-20 pointer-events-none">
              <div className="absolute top-4 left-[-32px] w-36 bg-[#6a8751] text-white text-[10px] font-bold py-1.5 text-center -rotate-45 shadow-md uppercase tracking-wider group-hover:bg-[#5b7545] transition-colors">
                Veg Plan
              </div>
            </div>

            {/* Left Column */}
            <div className="p-8 sm:w-[45%] flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-stone-100 bg-gradient-to-br from-[#fcfaf5] to-[#f5ebd6] relative overflow-hidden rounded-t-3xl sm:rounded-tr-none sm:rounded-l-3xl">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-500"></div>
              <div className="w-12 h-12 mb-3 bg-[var(--color-gold)] rounded-full flex items-center justify-center text-white shadow-lg shadow-[var(--color-gold)]/30 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 relative z-10 mt-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z"/></svg>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#b8860b] mb-1 relative z-10">GOLD</h3>
              <h4 className="text-xl font-serif text-[var(--color-brown)] tracking-widest uppercase mb-4">Plan</h4>
              <div className="w-12 h-0.5 bg-[var(--color-gold)]/40 mb-6"></div>
              <div className="bg-white py-3 px-6 rounded-xl border border-[var(--color-gold)]/20 shadow-sm w-full">
                <span className="text-4xl font-bold text-[var(--color-brown)] font-sans tracking-tight">₹1,200</span>
                <div className="text-xs font-bold text-[#b8860b] tracking-wider mt-1 uppercase">/ Plate Only</div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="p-6 sm:p-8 sm:w-[55%] relative bg-white rounded-b-3xl sm:rounded-bl-none sm:rounded-r-3xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 bg-[#c99b3b] text-white text-xs font-bold py-1.5 px-6 rounded-b-xl shadow-md uppercase tracking-wider z-20">
                Premium Veg Menu
              </div>
              <ul className="space-y-3 mt-8 sm:mt-6">
                {[
                  "Welcome Drink",
                  "Starter (2 Items)",
                  "Main Course (4 Items)",
                  "Dal, Rice, Pulao",
                  "Assorted Breads",
                  "Raita, Salad, Papad",
                  "Dessert (2 Items)",
                  "Live Counter (1 Item)"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#b8860b] shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Diamond Plan */}
          <div className="relative rounded-3xl bg-white border border-[#2a4365]/20 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(42,67,101,0.15)] hover:border-[#2a4365]/40 transition-all duration-500 flex flex-col sm:flex-row h-full">
            
            {/* Corner Ribbon */}
            <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden rounded-tl-3xl z-20 pointer-events-none">
              <div className="absolute top-4 left-[-32px] w-36 bg-[#6a8751] text-white text-[10px] font-bold py-1.5 text-center -rotate-45 shadow-md uppercase tracking-wider group-hover:bg-[#5b7545] transition-colors">
                Veg Plan
              </div>
            </div>
            
            {/* Left Column */}
            <div className="p-8 sm:w-[45%] flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-stone-100 bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] relative overflow-hidden rounded-t-3xl sm:rounded-tr-none sm:rounded-l-3xl">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/40 transition-colors duration-500"></div>
              <div className="w-12 h-12 mb-3 bg-[#1e293b] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#1e293b]/20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 relative z-10 mt-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 9l10 13 10-13-10-7zm0 2.8l6.3 4.4L12 19.3 5.7 9.2 12 4.8z"/></svg>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#1e293b] mb-1 relative z-10">DIAMOND</h3>
              <h4 className="text-xl font-serif text-stone-500 tracking-widest uppercase mb-4">Plan</h4>
              <div className="w-12 h-0.5 bg-[#475569]/40 mb-6"></div>
              <div className="bg-white py-3 px-6 rounded-xl border border-stone-200 shadow-sm w-full">
                <span className="text-4xl font-bold text-[#1e293b] font-sans tracking-tight">₹1,400</span>
                <div className="text-xs font-bold text-[#334155] tracking-wider mt-1 uppercase">/ Plate Only</div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="p-6 sm:p-8 sm:w-[55%] relative bg-white rounded-b-3xl sm:rounded-bl-none sm:rounded-r-3xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 bg-[#1e293b] text-white text-xs font-bold py-1.5 px-6 rounded-b-xl shadow-md uppercase tracking-wider z-20">
                Premium Veg Menu
              </div>
              <ul className="space-y-2 mt-8 sm:mt-6">
                {[
                  "Welcome Drink",
                  "Starter (3 Items)",
                  "Main Course (5 Items)",
                  "Dal, Rice, Pulao",
                  "Assorted Breads",
                  "Raita, Salad, Papad",
                  "Dessert (3 Items)",
                  "Live Counter (2 Items)",
                  "Premium Presentation"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1e293b]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#1e293b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar Info */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl border border-stone-100 relative z-20">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-auto flex-grow">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-[var(--color-gold)] bg-stone-50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <div className="text-sm">
                <span className="block text-stone-500 text-xs lg:text-sm">Minimum / Ideal</span>
                <strong className="text-[var(--color-brown)]">80 Guests</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-[var(--color-gold)] bg-stone-50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <div className="text-sm">
                <span className="block text-stone-500 text-xs lg:text-sm">Capacity Approx.</span>
                <strong className="text-[var(--color-brown)]">80-100 Guests</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-[var(--color-gold)] bg-stone-50 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <div className="text-sm">
                <span className="block text-stone-500 text-xs lg:text-sm">Occasions</span>
                <strong className="text-[var(--color-brown)] text-xs">Birthdays, Kitties...</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-[var(--color-gold)] bg-stone-50 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <div className="text-sm">
                <span className="block text-stone-500 text-xs lg:text-sm">Parking</span>
                <strong className="text-[var(--color-brown)]">Ample Space</strong>
              </div>
            </div>

          </div>

          <button 
            onClick={handleEnquire}
            className="w-full lg:w-auto shrink-0 bg-[var(--color-brown)] hover:bg-stone-900 transition-all duration-300 text-white rounded-xl py-3 px-8 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 group"
          >
            <Phone className="w-5 h-5 text-[var(--color-gold)] group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
            <div className="text-left">
              <div className="font-bold tracking-wider text-sm group-hover:text-[var(--color-gold)] transition-colors">ENQUIRE NOW</div>
              <div className="text-xs text-stone-300">We'll Call You Back</div>
            </div>
          </button>
        </div>

        {/* Floating Book Button Bar */}
        <div className="mt-8 flex justify-center pb-8 relative z-20">
          <button 
            onClick={handleBook}
            className="bg-gradient-to-r from-[var(--color-gold)] to-[#E6B355] hover:brightness-110 transition-all duration-300 text-white rounded-xl py-3.5 px-10 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] border border-[var(--color-gold)]/20 w-full md:w-auto hover:-translate-y-1 hover:scale-[1.02] active:scale-95 group"
          >
            <CalendarHeart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-left">
              <div className="font-bold tracking-wide text-sm uppercase text-white">Book Your Banquet Hall</div>
              <div className="text-xs font-medium text-white/90">Reserve Your Date on WhatsApp</div>
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
