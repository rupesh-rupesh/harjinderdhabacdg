const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

const regex = /\{\/\* Our Specials \(Responsive Grid\/Scroll\) \*\/\}.*?<\/section>/s;

const newSpecials = `{/* Our Specials (Responsive Grid/Scroll) */}
      <section id="specials" className="relative z-20 -mt-12 pt-24 pb-24 bg-[var(--color-ivory)] border-b border-stone-200/50 overflow-hidden rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center gap-4 mb-2">
               <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
               <h2 className="text-sm font-bold text-[var(--color-gold)] tracking-[0.2em] uppercase">Culinary Excellence</h2>
               <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[var(--color-brown)] drop-shadow-sm tracking-tight">Our Specials</h2>
            <p className="text-[#5A4A42] max-w-2xl text-base md:text-lg font-light leading-relaxed mt-4">
              Explore our most loved, highly recommended authentic dishes cooked with secret family recipes.
            </p>
          </div>
        </div>
        
        {/* Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto md:flex-wrap md:justify-center gap-6 lg:gap-8 pb-12 pt-4 snap-x snap-mandatory md:snap-none hide-scrollbar">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex-none w-[280px] sm:w-[320px] md:w-[340px] relative bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden flex flex-col animate-pulse">
                  <div className="h-56 bg-stone-200 w-full flex-shrink-0"></div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-6 bg-stone-200 rounded w-1/2"></div>
                      <div className="h-6 bg-stone-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-4"></div>
                    <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between">
                       <div className="h-10 bg-stone-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : specials.length > 0 ? (
              specials.map((item, idx) => {
                const locked = isItemLocked(item);
                return (
              <div key={idx} onClick={() => !locked && setSelectedItemDetail(item)} className={\`flex-none w-[280px] sm:w-[320px] md:w-[340px] group relative bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-stone-100/80 overflow-hidden snap-start transition-all duration-500 transform hover:-translate-y-2 flex flex-col cursor-pointer \${locked ? 'opacity-80 grayscale-[50%] cursor-not-allowed' : ''}\`}>
                <div className="h-56 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {item.isBestSeller && (
                      <span className="bg-[var(--color-gold)] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" /> Best Seller
                      </span>
                    )}
                    {item.isPopular && (
                      <span className="bg-[var(--color-brown)] text-[var(--color-gold)] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center border border-[var(--color-gold)]/20">
                        <TrendingUp className="w-3 h-3 mr-1" /> Popular
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center">
                        <Flame className="w-3 h-3 mr-1" /> Spicy
                      </span>
                    )}
                  </div>
                  
                  {locked && (
                     <div className="absolute inset-0 bg-[var(--color-brown)]/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl">
                          <Lock className="w-6 h-6 text-[var(--color-brown)]" />
                        </div>
                     </div>
                  )}

                  <div className="absolute top-4 right-4 z-10 group-hover:scale-110 transition-transform duration-300">
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm flex items-center justify-center cursor-help">
                      {getDietaryIcon(item.dietaryPreference)}
                      {/* Tooltip */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white text-[var(--color-brown)] p-4 rounded-xl shadow-xl text-xs opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 pointer-events-none transform origin-top-right scale-95 group-hover/tooltip:scale-100 border border-stone-100 text-left">
                         <p className="font-bold mb-1 text-sm">{item.dietaryPreference}</p>
                         <p className="text-[#5A4A42] leading-relaxed">This item is prepared according to strict {item.dietaryPreference.toLowerCase()} guidelines.</p>
                      </div>
                    </div>
                  </div>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                    <span className={\`bg-white/90 backdrop-blur-md text-[var(--color-brown)] text-xs font-bold tracking-wider px-3 py-1.5 rounded-lg shadow-sm \${locked ? 'line-through text-stone-500' : ''}\`}>
                      ₹{item.price}
                    </span>
                    {locked && (
                      <div className="bg-[var(--color-brown)] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1 border border-[var(--color-gold)]/30">
                        <Lock className="w-3 h-3" /> Locked
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow bg-white">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-serif font-bold text-xl text-[var(--color-brown)] line-clamp-1 leading-tight">{item.name}</h3>
                  </div>
                  <p className="text-[#5A4A42] text-sm mb-6 line-clamp-2 leading-relaxed font-light">{item.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-stone-100/80">
                    <button 
                      disabled={locked}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!locked) setSelectedItemDetail(item);
                      }} 
                      className={\`w-full bg-[var(--color-ivory)] hover:bg-[var(--color-brown)] border border-[var(--color-gold)]/20 hover:border-transparent text-[var(--color-brown)] hover:text-[var(--color-gold)] font-semibold py-3 rounded-xl transition-all duration-500 flex items-center justify-center group/btn shadow-sm \${locked ? 'opacity-50 cursor-not-allowed hover:bg-[var(--color-ivory)] hover:text-[var(--color-brown)] hover:border-[var(--color-gold)]/20' : ''}\`}
                    >
                      {locked ? 'Unavailable' : (
                        <>
                          View Details 
                          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-stone-200/50">
                <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[var(--color-brown)] mb-2">Our menu is being prepared</h3>
                <p className="text-[#5A4A42]">Check back soon for our delicious offerings.</p>
              </div>
            )}
          </div>
        </div>
      </section>`;

code = code.replace(regex, newSpecials);
fs.writeFileSync('src/Storefront.tsx', code);
