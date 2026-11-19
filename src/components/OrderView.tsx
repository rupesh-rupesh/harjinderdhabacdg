import React from 'react';
import { ArrowLeft, Menu, Search, ChevronRight, Clock, Star, Flame, Sparkles, ConciergeBell } from 'lucide-react';
import { getCategoryMeta, getDishPunjabi } from '../utils/dhabaThemeData';

interface OrderViewProps {
  isLoading?: boolean;
  menuItems: any[];
  dbCategories: any[];
  orderViewStatus: 'categories' | 'items';
  setOrderViewStatus: (status: 'categories' | 'items') => void;
  orderCategory: string;
  setOrderCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount?: number;
  setIsCartOpen?: (isOpen: boolean) => void;
  onBackToHome: () => void;
  cartItems?: any[];
  addToCart?: (item: any) => void;
  updateQuantity?: (name: string, isHalf: boolean, isButter: boolean, delta: number, variantName?: string) => void;
  setSelectedItemDetail?: (item: any) => void;
}

const DietaryBadge = ({ type }: { type?: string }) => {
  const isVeg = type?.toLowerCase() === 'veg' || type?.toLowerCase() === 'vegetarian';
  return (
    <div className={`w-4 h-4 flex shrink-0 items-center justify-center border-2 rounded-sm ${isVeg ? 'border-green-600' : 'border-red-600'} bg-white`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
    </div>
  );
};

export default function OrderView({
  isLoading,
  menuItems,
  dbCategories,
  orderViewStatus,
  setOrderViewStatus,
  orderCategory,
  setOrderCategory,
  searchQuery,
  setSearchQuery,
  onBackToHome
}: OrderViewProps) {

  const isItemLocked = (item: any) => {
    if (item.outOfStock) return true;
    if (!item.hasTiming || !item.startTime || !item.endTime) return false;
    
    const startTime = item.startTime;
    const endTime = item.endTime;
    const now = new Date();
    const currentTotal = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    
    if (startTotal <= endTotal) {
      return currentTotal < startTotal || currentTotal > endTotal;
    } else {
      return currentTotal < startTotal && currentTotal > endTotal;
    }
  };

  const getLockReason = (item: any) => {
    if (item.outOfStock) return "Out of Stock";
    return "Unavailable";
  };

  const orderMenuFiltered = menuItems.filter(item => {
    const categoryObj = dbCategories.find(c => c.name === item.category);
    if (categoryObj && categoryObj.isHidden) return false;

    const matchesCategory = orderCategory === 'All' || item.category === orderCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-50 overflow-hidden w-full">
      {/* Order Nav (Clean - No Cart button) */}
      <nav className="flex-shrink-0 bg-[#2c1e16] shadow-md h-16 px-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center flex-1">
          <button 
            onClick={() => {
              if (orderViewStatus === 'items') {
                setOrderViewStatus('categories');
              } else {
                onBackToHome();
              }
            }} 
            className="text-white hover:text-[var(--color-gold)] flex items-center font-medium transition-colors p-2 -ml-2 rounded-lg hover:bg-white/10 focus:outline-none"
            title={orderViewStatus === 'items' ? "Back to Categories" : "Back to Home"}
          >
            {orderViewStatus === 'categories' ? <Menu className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center gap-3">
          <span className="text-[var(--color-gold)] text-sm font-serif">~</span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-white text-center whitespace-nowrap">Order Menu</span>
          <span className="text-[var(--color-gold)] text-sm font-serif">~</span>
        </div>
        <div className="flex items-center flex-1 justify-end">
          <button
            onClick={onBackToHome}
            className="text-stone-300 hover:text-[var(--color-gold)] text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-700/60 hover:border-[var(--color-gold)] transition-colors"
          >
            Home
          </button>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {orderViewStatus === 'categories' ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 bg-dhaba-light" data-lenis-prevent="true">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 sm:mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C89B3C]/20 to-transparent -z-10 hidden sm:block"></div>
                <p className="text-[var(--color-gold)] font-serif font-bold text-base sm:text-lg mb-1">
                  ਸਾਡੀਆਂ ਖ਼ਾਸ ਸ਼੍ਰੇਣੀਆਂ
                </p>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#241712] inline-flex items-center gap-4 bg-dhaba-light px-6 mx-auto shadow-sm sm:shadow-none rounded-full">
                  Our Menu Categories
                </h2>
                <div className="flex items-center justify-center mt-3 gap-2">
                  <div className="w-12 h-px bg-[#C89B3C]/30"></div>
                  <div className="w-2 h-2 rounded-full bg-[#C89B3C]/50"></div>
                  <div className="w-12 h-px bg-[#C89B3C]/30"></div>
                </div>
                <p className="text-stone-500 font-light mt-3 sm:text-lg">Explore authentic Punjabi flavours and traditional dhaba recipes</p>
              </div>

              {/* Categories Grid (Matching Dhaba Special card design) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24">
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 animate-pulse h-80">
                      <div className="h-52 bg-stone-200"></div>
                      <div className="p-5 flex flex-col gap-2">
                        <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                        <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {/* All Items Category Card */}
                    <button
                      key="all-categories"
                      onClick={() => {
                        setOrderCategory('All');
                        setOrderViewStatus('items');
                      }}
                      className="w-full rounded-3xl bg-white border border-[#E5D5C0]/80 shadow-[0_8px_25px_rgba(36,23,18,0.06)] hover:shadow-[0_20px_45px_rgba(200,155,60,0.18)] hover:border-[var(--color-gold)]/60 transition-all duration-500 overflow-hidden flex flex-col group/card transform hover:-translate-y-1.5 cursor-pointer text-left"
                    >
                      <div className="h-52 relative overflow-hidden bg-gradient-to-br from-[#3c2a1e] via-[#2c1e16] to-[#1c120c] shrink-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover/card:scale-110 transition-transform duration-500">
                          <ConciergeBell className="w-8 h-8 text-[#C89B3C]" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                          <span className="bg-gradient-to-r from-[#F97316] to-[#E8690D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm text-sm">
                            🍽️
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="text-[10px] font-bold text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                            {menuItems.length} Dishes
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow bg-white">
                        <p className="text-[var(--color-gold)] font-serif font-bold text-sm tracking-wide leading-tight">
                          ਸਾਰੇ ਪਕਵਾਨ
                        </p>
                        <h3 className="font-serif font-bold text-lg text-[var(--color-brown)] group-hover/card:text-[#F97316] transition-colors leading-snug line-clamp-1 mt-0.5">
                          All Items
                        </h3>
                        <p className="text-stone-500 text-xs font-light line-clamp-1 mt-1">
                          Explore our full menu
                        </p>

                        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                          <span className="text-[11px] font-semibold text-[#C89B3C] bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-md">
                            Full Menu
                          </span>
                          <span className="w-7 h-7 rounded-full bg-stone-50 group-hover/card:bg-[#F97316] group-hover/card:text-white flex items-center justify-center transition-colors">
                            <ChevronRight className="w-4 h-4 text-stone-500 group-hover/card:text-white transition-colors" />
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* DB Categories Cards */}
                    {dbCategories.filter(category => !category.isHidden).map(category => {
                      const catMeta = getCategoryMeta(category.name);
                      const displayImage = category.image || null;
                      const categoryItems = menuItems.filter(i => i.category === category.name);
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setOrderCategory(category.name);
                            setOrderViewStatus('items');
                          }}
                          className="w-full rounded-3xl bg-white border border-[#E5D5C0]/80 shadow-[0_8px_25px_rgba(36,23,18,0.06)] hover:shadow-[0_20px_45px_rgba(200,155,60,0.18)] hover:border-[var(--color-gold)]/60 transition-all duration-500 overflow-hidden flex flex-col group/card transform hover:-translate-y-1.5 cursor-pointer text-left"
                        >
                          <div className="h-52 relative overflow-hidden bg-stone-100 shrink-0">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100/70">
                                <span className="text-5xl">{catMeta.emoji || '🍛'}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                              <span className="bg-gradient-to-r from-[#F97316] to-[#E8690D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Category
                              </span>
                            </div>

                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm text-sm flex items-center gap-1 font-medium">
                                <span>{catMeta.emoji}</span>
                              </div>
                            </div>

                            <div className="absolute bottom-3 left-3 z-10">
                              <span className="text-[10px] font-bold text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                                {categoryItems.length} Dishes
                              </span>
                            </div>
                          </div>

                          <div className="p-5 flex flex-col flex-grow bg-white">
                            <p className="text-[var(--color-gold)] font-serif font-bold text-sm tracking-wide leading-tight">
                              {catMeta.punjabi}
                            </p>
                            <h3 className="font-serif font-bold text-lg text-[var(--color-brown)] group-hover/card:text-[#F97316] transition-colors leading-snug line-clamp-1 mt-0.5">
                              {category.name}
                            </h3>
                            <p className="text-stone-500 text-xs font-light line-clamp-1 mt-1">
                              {catMeta.subtitle}
                            </p>

                            <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                              <span className="text-[11px] font-semibold text-[#C89B3C] bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-md">
                                Explore Dishes
                              </span>
                              <span className="w-7 h-7 rounded-full bg-stone-50 group-hover/card:bg-[#F97316] group-hover/card:text-white flex items-center justify-center transition-colors">
                                <ChevronRight className="w-4 h-4 text-stone-500 group-hover/card:text-white transition-colors" />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search and Filters */}
            <div className="flex-shrink-0 bg-white border-b border-stone-200 py-3 px-4 sm:px-6 shadow-sm z-30">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={`Search in ${orderCategory}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] transition-all text-sm font-medium text-stone-800 outline-none"
                  />
                  <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Dishes Grid View (Exact Dhaba Special Design, NO Add to cart, NO detail modal, NO desi ghee text) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-dhaba-light" data-lenis-prevent="true">
              <div className="max-w-7xl mx-auto pb-24">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <button
                      onClick={() => setOrderViewStatus('categories')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#e8690d] transition-colors mb-2 bg-orange-50 border border-orange-200/60 px-3 py-1.5 rounded-full"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
                    </button>
                    <p className="text-[var(--color-gold)] font-serif font-bold text-sm sm:text-base tracking-wide">
                      {getCategoryMeta(orderCategory).punjabi}
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#241712]">
                      {orderCategory}
                    </h2>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-stone-500 bg-white border border-stone-200 px-3.5 py-1.5 rounded-xl shadow-xs">
                    {orderMenuFiltered.length} dish{orderMenuFiltered.length !== 1 ? 'es' : ''} available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="rounded-3xl bg-white border border-stone-100 p-5 flex flex-col animate-pulse h-80">
                        <div className="h-52 bg-stone-200 rounded-2xl w-full mb-4"></div>
                        <div className="h-4 bg-stone-200 rounded w-1/3 mb-2"></div>
                        <div className="h-6 bg-stone-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-stone-200 rounded w-1/2 mt-auto"></div>
                      </div>
                    ))
                  ) : orderMenuFiltered.length > 0 ? (
                    orderMenuFiltered.map((item) => {
                      const locked = isItemLocked(item);
                      const punjabiName = getDishPunjabi(item.name, item.punjabi);
                      return (
                        <div
                          key={item.id}
                          className={`w-full rounded-3xl bg-white border border-[#E5D5C0]/80 shadow-[0_8px_25px_rgba(36,23,18,0.06)] hover:shadow-[0_20px_45px_rgba(200,155,60,0.18)] hover:border-[var(--color-gold)]/60 transition-all duration-500 overflow-hidden flex flex-col group/card transform hover:-translate-y-1.5 ${locked ? 'opacity-70 grayscale-[40%]' : ''}`}
                        >
                          {/* Image */}
                          <div className="h-52 relative overflow-hidden bg-stone-100 shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-amber-50/60">
                                <span className="text-4xl">🍛</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                              {item.isDhabaSpecial && (
                                <span className="bg-gradient-to-r from-[#F97316] to-[#E8690D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Dhaba SPL
                                </span>
                              )}
                              {item.isBestSeller && (
                                <span className="bg-[var(--color-gold)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-current" /> Best Seller
                                </span>
                              )}
                              {item.isSpicy && (
                                <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                                  <Flame className="w-2.5 h-2.5" /> Spicy
                                </span>
                              )}
                            </div>

                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-sm">
                                <DietaryBadge type={item.dietaryPreference || 'veg'} />
                              </div>
                            </div>

                            {/* Category Pill on Image Bottom */}
                            <div className="absolute bottom-3 left-3 z-10">
                              <span className="text-[10px] font-bold text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                                {item.category}
                              </span>
                            </div>

                            {/* Lock Overlay */}
                            {locked && (
                              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-20">
                                <span className="bg-stone-900/90 text-white text-xs font-bold px-4 py-2 rounded-xl border border-stone-700 -rotate-3">
                                  {getLockReason(item)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content (NO View Details, NO Add to Cart, NO desi ghee text) */}
                          <div className="p-5 flex flex-col flex-grow bg-white">
                            <p className="text-[var(--color-gold)] font-serif font-bold text-sm tracking-wide leading-tight">
                              {punjabiName}
                            </p>
                            <h3 className="font-serif font-bold text-lg text-[var(--color-brown)] group-hover/card:text-[#F97316] transition-colors leading-snug line-clamp-1 mt-0.5" title={item.name}>
                              {item.name}
                            </h3>

                            {/* Attributes Footer */}
                            <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                              {item.fullPortionPieces ? (
                                <span className="text-[10px] font-semibold text-[#C89B3C] bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-md">
                                  {item.fullPortionPieces} pcs
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-stone-400">
                                  Freshly Prepared
                                </span>
                              )}
                              {item.hasHalfPortion ? (
                                <span className="text-[10px] font-medium text-stone-600 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md">
                                  Half / Full Available
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md">
                                  Full Portion
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 text-stone-500">
                      <p className="text-lg">We searched every corner of our kitchen, but couldn't find that dish. 😞</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
