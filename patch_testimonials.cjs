const fs = require('fs');
let code = fs.readFileSync('src/components/Testimonials.tsx', 'utf8');

const sectionStart = /<section className="py-24 bg-white" id="testimonials">/g;
code = code.replace(sectionStart, '<section className="py-24 bg-[var(--color-ivory)]" id="testimonials">');

const headerRegex = /<div className="text-center max-w-2xl mx-auto mb-16">[\s\S]*?<div className="hidden sm:block w-px h-16 bg-stone-200"><\/div>\s*<button/m;

const newHeader = `<div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
             <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
             <h2 className="text-sm font-bold text-[var(--color-gold)] tracking-[0.2em] uppercase">Reviews</h2>
             <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
          </div>
          <h3 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-brown)] mb-6 tracking-tight">Voices of Our Guests</h3>
          <p className="text-lg text-[#5A4A42]">Real stories from real people who love our food and hospitality.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="flex items-center gap-6 bg-[var(--color-brown)] text-white px-8 py-5 rounded-[1.5rem] shadow-xl shadow-stone-900/10">
            <div className="text-5xl md:text-6xl font-bold tracking-tighter">{avgRating}</div>
            <div className="w-px h-16 bg-white/20"></div>
            <div className="flex flex-col items-start">
              <div className="flex text-[var(--color-gold)] mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={\`w-5 h-5 md:w-6 md:h-6 \${i < Math.round(Number(avgRating)) ? 'fill-current' : 'text-white/20'}\`} />
                ))}
              </div>
              <span className="text-sm font-medium text-white/80">Based on {reviews.length} authentic reviews</span>
            </div>
          </div>
          
          <button`;

code = code.replace(headerRegex, newHeader);

// Fix button styling
code = code.replace(
  `className="w-full sm:w-auto px-8 py-4 bg-dhaba-dark text-white rounded-full hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 font-medium flex items-center justify-center gap-2 group hover:-translate-y-0.5"`,
  `className="w-full sm:w-auto px-8 py-[1.4rem] bg-transparent text-[var(--color-brown)] border border-[var(--color-brown)]/20 rounded-[1.5rem] hover:bg-[var(--color-brown)]/5 transition-all font-medium flex items-center justify-center gap-3 group hover:-translate-y-0.5"`
);

// ReviewCard
const oldCardRegex = /<div className="bg-stone-50 rounded-3xl p-8 transition-all hover:bg-stone-100\/80 flex-none w-\[85vw\] sm:w-\[420px\] snap-center flex flex-col h-full min-h-\[340px\] relative group border border-transparent hover:border-stone-200">[\s\S]*?<div className="absolute top-8 right-8 text-stone-200 group-hover:text-amber-100 transition-colors pointer-events-none">/m;

const newCard = `<div className="bg-white rounded-[2rem] p-8 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-none w-[85vw] sm:w-[420px] snap-center flex flex-col h-full min-h-[340px] relative group border border-stone-100/80">
      
      <div className="absolute top-8 right-8 text-[var(--color-gold)]/20 group-hover:text-[var(--color-gold)]/30 transition-colors pointer-events-none">`;

code = code.replace(oldCardRegex, newCard);

const avatarRegex = /<div className="w-14 h-14 bg-white text-stone-800 rounded-full flex items-center justify-center font-bold text-xl shadow-sm shrink-0 border border-stone-100">/m;
code = code.replace(avatarRegex, `<div className="w-14 h-14 bg-[var(--color-gold)]/10 text-[var(--color-brown)] rounded-full flex items-center justify-center font-bold text-xl shrink-0 border border-[var(--color-gold)]/20">`);

code = code.replace(/text-stone-900/g, 'text-[var(--color-brown)]');
code = code.replace(/text-amber-500/g, 'text-[var(--color-gold)]');

fs.writeFileSync('src/components/Testimonials.tsx', code);
