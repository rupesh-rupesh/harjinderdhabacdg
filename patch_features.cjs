const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

const regex = /\{\/\* Features\/Amenities \*\/\}.*?<\/section>/s;

const replacement = `{/* Features/Amenities */}
      <section id="features" className="py-24 bg-[var(--color-ivory)] text-[var(--color-brown)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
               <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
               <h2 className="text-sm font-bold text-[var(--color-gold)] tracking-[0.2em] uppercase">Amenities</h2>
               <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
            </div>
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-brown)] mb-6 tracking-tight">Why Stop Here?</h3>
            <p className="text-lg text-[#5A4A42]">Experience the finest highway hospitality tailored for your comfort.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="relative bg-white/50 backdrop-blur-md p-10 rounded-[2rem] text-center border border-stone-200/50 shadow-sm overflow-hidden animate-pulse">
                  <div className="relative z-20">
                    <div className="bg-stone-200 w-20 h-20 rounded-2xl mx-auto mb-8"></div>
                    <div className="h-6 bg-stone-200 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-stone-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ))
            ) : features.filter((f: any) => f.isActive).length > 0 ? (
              features.filter((f: any) => f.isActive).map((feature: any) => {
                const hasVideo = feature.videoUrl && typeof feature.videoUrl === 'string' && feature.videoUrl.trim() !== '';
                return (
              <div key={feature.id} className="relative bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] text-center hover:-translate-y-2 transition-all duration-500 border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[var(--color-gold)]/30 group overflow-hidden">
                {hasVideo && (
                  <>
                    <BackgroundVideo src={feature.videoUrl || undefined} />
                    <div className="absolute inset-0 bg-[var(--color-brown)]/80 z-10 pointer-events-none transition-opacity duration-500 group-hover:bg-[var(--color-brown)]/70"></div>
                  </>
                )}
                
                <div className="relative z-20">
                  <div className={\`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500 shadow-sm \${hasVideo ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-[var(--color-ivory)] border border-[var(--color-gold)]/20'}\`}>
                    <DynamicIcon name={feature.icon} className={\`w-10 h-10 \${hasVideo ? 'text-[var(--color-gold)]' : 'text-[var(--color-gold)]'}\`} />
                  </div>
                  <h3 className={\`text-2xl font-serif font-bold mb-4 \${hasVideo ? 'text-white' : 'text-[var(--color-brown)]'}\`}>{feature.title}</h3>
                  <p className={\`leading-relaxed \${hasVideo ? 'text-white/80' : 'text-[#5A4A42]'}\`}>{feature.description}</p>
                </div>
              </div>
                );
              })
            ) : null}
          </div>
        </div>
      </section>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/Storefront.tsx', code);
