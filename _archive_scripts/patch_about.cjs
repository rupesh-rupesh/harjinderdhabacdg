const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

const oldAbout = /\{\/\* About Section \*\/\}.*?<Testimonials \/>/s;

const newAbout = `{/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-[var(--color-ivory)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-5/12 w-full relative">
              {/* Decorative elements behind the image */}
              <div className="absolute -left-12 -top-12 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full blur-3xl"></div>
              
              <div className="relative w-full aspect-[4/5] sm:h-[600px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[8px] border-white z-10">
                {journeyMedia.length > 0 ? (
                  journeyMedia.map((media, index) => (
                    media.type === 'video' ? (
                      <video 
                        key={media.id}
                        src={media.url || undefined} 
                        className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out \${index === currentJourneyIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}\`}
                        autoPlay muted loop playsInline
                      />
                    ) : (
                      <img 
                        key={media.id}
                        src={media.url || undefined} 
                        alt="Journey" 
                        className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out \${index === currentJourneyIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}\`}
                      />
                    )
                  ))
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop" 
                    alt="Dhaba Cooking" 
                    className="absolute inset-0 w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-1000"
                  />
                )}
              </div>

              {/* Gold "SINCE 1991" Badge */}
              <div className="absolute -bottom-10 right-4 sm:-right-10 bg-[var(--color-brown)] text-[var(--color-gold)] p-8 rounded-full shadow-2xl z-20 flex flex-col items-center justify-center w-40 h-40 border-[4px] border-[var(--color-gold)]">
                <div className="flex flex-col items-center border border-[var(--color-gold)]/30 rounded-full w-full h-full justify-center p-2">
                  <span className="text-xs uppercase tracking-widest mb-1 font-semibold">Since</span>
                  <span className="text-3xl font-serif font-bold">1991</span>
                  <div className="flex gap-1 mt-2 text-[var(--color-gold)]">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-7/12 w-full mt-16 lg:mt-0 relative z-20">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--color-gold)]">Our Journey</span>
                <div className="h-px w-16 bg-[var(--color-gold)]/40"></div>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[var(--color-brown)] mb-8 leading-[1.1] tracking-tight">{journeySettings.header}</h2>
              <div className="space-y-6">
                {journeySettings.description.split('\\n').map((paragraph, idx) => paragraph.trim() ? (
                  <p key={idx} className="text-[#5A4A42] text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ) : null)}
              </div>
              <p className="text-[var(--color-brown)] text-xl mt-8 font-medium italic">
                {journeySettings.signature}<br />
                <span className="text-[var(--color-gold)] font-bold non-italic text-sm tracking-widest uppercase mt-2 block">{journeySettings.subSignature}</span>
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row items-center gap-8 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex text-[var(--color-gold)]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-6 h-6 fill-current" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-brown)] text-lg leading-none mb-1">4.8/5 Rating</p>
                    <p className="text-sm text-[#5A4A42]">Loved by 10,000+ travelers</p>
                  </div>
                </div>
                
                <div className="hidden sm:block w-px h-12 bg-stone-200"></div>
                <div className="sm:hidden h-px w-full bg-stone-200"></div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-ivory)] flex items-center justify-center text-[var(--color-gold)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-brown)] text-lg leading-none mb-1">30+ Years</p>
                    <p className="text-sm text-[#5A4A42]">of Trust & Hospitality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />`;

code = code.replace(oldAbout, newAbout);
fs.writeFileSync('src/Storefront.tsx', code);
