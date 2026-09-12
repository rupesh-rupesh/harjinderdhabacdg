import { DevEmptyStateText } from './DevEmptyStateText';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, ShoppingCart, Minus, Plus, ShoppingBag, Flame, Star, Info, X, Clock, Sun, CupSoda, Soup, ConciergeBell, UtensilsCrossed, Pizza, Coffee, Utensils } from 'lucide-react';
import * as Icons from 'lucide-react';
import { NoodleBowlIcon } from './CustomIcons';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const cleanClassName = className?.replace(/text-\w+-\d+/, '') || '';
  
  if (name === "NoodleBowl") return <NoodleBowlIcon className={cleanClassName} />;
  
  let colorClass = "text-stone-300"; // default
  if (name === "Sun") colorClass = "text-yellow-500";
  if (name === "CupSoda") colorClass = "text-cyan-500";
  if (name === "Soup") colorClass = "text-orange-500";
  if (name === "ConciergeBell") colorClass = "text-stone-500";
  if (name === "UtensilsCrossed") colorClass = "text-red-500";
  if (name === "Pizza") colorClass = "text-amber-500";
  if (name === "Coffee") colorClass = "text-amber-700";
  if (name === "Utensils") colorClass = "text-stone-400";
  
  const IconComponent = (Icons as any)[name] || Icons.Utensils;
  return <IconComponent className={`${cleanClassName} ${colorClass}`.trim()} />;
};

const getItemFallbackIcon = (category: string) => {
  if (!category) return "Utensils";
  const lowerName = category.toLowerCase();
  if (lowerName.includes("breakfast")) return "Sun";
  if (lowerName.includes("indian") || lowerName.includes("tandoor") || lowerName.includes("bread") || lowerName.includes("roti") || lowerName.includes("naan")) return "NoodleBowl";
  if (lowerName.includes("beverage") || lowerName.includes("drink") || lowerName.includes("shake")) return "CupSoda";
  if (lowerName.includes("raita") || lowerName.includes("curd") || lowerName.includes("dal") || lowerName.includes("paneer") || lowerName.includes("sabzi")) return "Soup";
  if (lowerName.includes("thali")) return "ConciergeBell";
  if (lowerName.includes("chinese")) return "UtensilsCrossed";
  if (lowerName.includes("pizza")) return "Pizza";
  if (lowerName.includes("dessert") || lowerName.includes("sweet")) return "Coffee";
  if (lowerName.includes("snack") || lowerName.includes("starter") || lowerName.includes("appetizer")) return "Utensils";
  return "Utensils";
};

interface CartItem {
  name: string;
  price: string;
  numericPrice: number;
  quantity: number;
  image: string;
  isHalf?: boolean;
  isButter?: boolean;
  variantName?: string;
}

interface MenuViewProps {
  isLoading?: boolean;
  menuItems: any[];
  dbCategories: any[];
  onBack: () => void;
  cartItems: CartItem[];
  addToCart: (item: any) => void;
  updateQuantity: (name: string, isHalf: boolean, isButter: boolean, delta: number, variantName?: string) => void;
  openCart: () => void;
  setSelectedItemDetail: (item: any) => void;
}

export default function MenuView({
  isLoading,
  menuItems,
  dbCategories,
  onBack,
  cartItems,
  addToCart,
  updateQuantity,
  openCart,
  setSelectedItemDetail,
}: MenuViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('All');
  
  const rightColumnRef = useRef<HTMLDivElement>(null);

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
    return "Currently Unavailable";
  };
  
  const getLockSubReason = (item: any) => {
    if (item.outOfStock) return "Not available for order";
    return `Available at ${item.startTime || 'later'}`;
  };
  


  useEffect(() => {
    if (dbCategories.length > 0 && !activeCategory) {
      setActiveCategory('All');
    }
  }, [dbCategories, activeCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    if (rightColumnRef.current) {
      rightColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getQuantity = (item: any) => {
    const cartId = `${item.name}-${item.isHalf ? 'half' : 'full'}-${item.isButter ? 'butter' : 'nobutter'}`;
    const cartItem = cartItems.find(i => `${i.name}-${i.isHalf ? 'half' : 'full'}-${i.isButter ? 'butter' : 'nobutter'}` === cartId);
    return cartItem ? cartItem.quantity : 0;
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.numericPrice * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const filters = ['All', 'Popular', 'Best Seller', 'Specials'];

  const visibleCategories = dbCategories
    .filter(cat => !cat.isHidden)
    .map(cat => (cat.name || '').trim().toLowerCase());

  const filteredItems = menuItems.filter(item => {
    // Filter out non-veg items completely from the public menu
    if (item.dietaryPreference === 'non-veg') return false;

    const itemCat = (item.category || '').trim().toLowerCase();
    if (!visibleCategories.includes(itemCat)) return false;

    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType !== 'All') {
      if (filterType === 'Popular' && !item.isPopular) return false;
      if (filterType === 'Best Seller' && !item.isBestSeller) return false;
      if (filterType === 'Specials' && !item.isDhabaSpecial) return false;
    }
    
    if (activeCategory === 'All') return true;
    return itemCat === (activeCategory || '').trim().toLowerCase();
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-50 overflow-hidden w-full font-sans">
      {/* Header */}
      <nav className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-stone-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] h-16 px-4 sm:px-6 flex items-center justify-between z-40 relative sticky top-0">
        <div className="flex items-center flex-1">
          <button onClick={onBack} className="text-stone-500 hover:text-dhaba-orange flex items-center font-medium transition-colors focus:outline-none p-2 -ml-2 rounded-full hover:bg-orange-50 group">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" /> 
          </button>
        </div>
        <div className="flex-1 flex justify-center">
           <span className="font-serif text-xl sm:text-2xl font-extrabold text-dhaba-dark text-center whitespace-nowrap tracking-tight">Our Menu</span>
        </div>
        <div className="flex items-center flex-1 justify-end">
          <button 
           onClick={openCart}
           className="relative p-2.5 text-stone-600 hover:text-dhaba-orange transition-all duration-300 group focus:outline-none bg-stone-50 hover:bg-orange-50 rounded-full border border-stone-100 hover:border-orange-200 shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-dhaba-orange text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-bounce-short">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Search and Filters */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200/50 py-3 px-4 z-30 shadow-[0_4px_15px_-10px_rgba(0,0,0,0.03)] relative">
        <div className="relative max-w-4xl mx-auto mb-4">
          <input 
            type="text" 
            placeholder="Search for your favorite dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200/80 rounded-2xl focus:ring-4 focus:ring-dhaba-orange/10 focus:border-dhaba-orange transition-all text-sm sm:text-base font-medium text-stone-700 shadow-inner placeholder-stone-400 outline-none"
          />
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-2.5 max-w-4xl mx-auto pb-1" data-lenis-prevent="true">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border ${
                filterType === filter 
                ? 'bg-gradient-to-r from-dhaba-orange to-[#e67500] text-white border-transparent shadow-[0_4px_15px_rgba(217,119,6,0.3)] transform -translate-y-0.5' 
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm hover:shadow-md'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area (Two Columns) */}
      <div className="flex flex-1 overflow-hidden relative max-w-7xl mx-auto w-full">
        {/* Left Sidebar */}
        <div className="w-[28%] md:w-72 flex-shrink-0 bg-white border-r border-stone-100 overflow-y-auto flex flex-col hide-scrollbar shadow-[4px_0_24px_-10px_rgba(0,0,0,0.03)] z-10" data-lenis-prevent="true">
          <div className="p-3 sm:p-5 space-y-2">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`relative w-full text-left flex flex-col sm:flex-row items-center sm:items-start p-2 sm:p-3 rounded-2xl transition-all duration-300 group ${
                activeCategory === 'All' 
                ? 'bg-orange-50/80 border border-orange-100 shadow-sm' 
                : 'bg-transparent border border-transparent hover:bg-stone-50'
              }`}
            >
              {activeCategory === 'All' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-dhaba-orange rounded-r-full hidden sm:block"></div>}
              <div className={`w-12 h-12 rounded-2xl sm:mr-4 mb-2 sm:mb-0 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                 activeCategory === 'All' ? 'bg-white shadow-md text-dhaba-orange scale-105' : 'bg-stone-100 text-stone-400 group-hover:bg-white group-hover:shadow-sm'
              }`}>
                <span className="text-xs font-black uppercase tracking-widest">ALL</span>
              </div>
              <div className="flex flex-col items-center sm:items-start justify-center flex-1 min-w-0 pt-1">
                <span className={`text-xs sm:text-sm font-bold truncate w-full text-center sm:text-left ${activeCategory === 'All' ? 'text-dhaba-orange' : 'text-stone-600 group-hover:text-stone-800'}`}>All Items</span>
              </div>
            </button>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-4 opacity-70"></div>

            {dbCategories.filter(cat => !cat.isHidden).map((category) => {
              const isActive = activeCategory === category.name;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`relative w-full text-left flex flex-col sm:flex-row items-center sm:items-start p-2 sm:p-3 rounded-2xl transition-all duration-300 group overflow-hidden ${
                    isActive 
                    ? 'bg-orange-50/80 border border-orange-100 shadow-sm' 
                    : 'bg-transparent border border-transparent hover:bg-stone-50'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-dhaba-orange rounded-r-full hidden sm:block"></div>}
                  
                  {category.image ? (
                      <div className={`w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 sm:mr-4 mb-2 sm:mb-0 transition-transform duration-300 ${isActive ? 'ring-2 ring-white shadow-md scale-105' : 'ring-1 ring-stone-200/50 group-hover:ring-stone-300 group-hover:shadow-sm'}`}>
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                  ) : (
                      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 sm:mr-4 mb-2 sm:mb-0 flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-white shadow-md text-dhaba-orange scale-105' : 'bg-stone-100 text-stone-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                         <span className="text-xs font-black uppercase tracking-widest">{category.name.substring(0,2)}</span>
                      </div>
                  )}
                  <div className="flex flex-col items-center sm:items-start justify-center flex-1 min-w-0 pt-1">
                    <span className={`text-[11px] sm:text-sm font-bold line-clamp-2 w-full text-center sm:text-left leading-tight ${isActive ? 'text-dhaba-orange' : 'text-stone-600 group-hover:text-stone-800'}`}>{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div 
          ref={rightColumnRef}
          className="flex-1 overflow-y-auto bg-stone-50/80 p-3 sm:p-5 pb-36 transition-opacity duration-300"
          data-lenis-prevent="true"
        >
          {!searchQuery && filterType === 'All' && (
             <h2 className="text-3xl sm:text-4xl font-serif font-bold text-dhaba-dark mb-6 pl-2 drop-shadow-sm">{activeCategory}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] shadow-sm border border-stone-100 flex flex-col animate-pulse overflow-hidden">
                  <div className="h-48 sm:h-56 bg-stone-200"></div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-6 bg-stone-200 rounded w-1/2"></div>
                      <div className="h-6 bg-stone-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-stone-200 rounded w-full mb-2 mt-4"></div>
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-4"></div>
                    <div className="mt-auto pt-3 border-t border-stone-100">
                      <div className="h-10 bg-stone-200 rounded-2xl w-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
                <p className="text-stone-500 font-medium"><DevEmptyStateText /></p>
              </div>
            ) : filteredItems.map(item => {
              const locked = isItemLocked(item);
              const category = dbCategories.find(c => c.name === item.category);
              return (
              <div key={item.id} className={`bg-white rounded-[2rem] shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(217,119,6,0.2)] transition-all duration-500 overflow-hidden border border-stone-100/80 flex flex-col group transform hover:-translate-y-1.5 ${locked ? 'opacity-80 grayscale-[50%]' : 'cursor-pointer'}`} onClick={() => !locked && setSelectedItemDetail(item)}>
                <div className="relative h-48 sm:h-56 overflow-hidden bg-stone-50 border-b border-stone-100/50">
                  {item.image ? (
                    <>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3 bg-black/30 hover:bg-black/50 backdrop-blur-md p-1.5 rounded-full text-white cursor-help group/info z-30 transition-colors shadow-sm border border-white/20">
                        <Info className="w-4 h-4" />
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-stone-900/95 text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 pointer-events-none border border-white/10 z-40 backdrop-blur-md leading-relaxed">
                          Image is for reference only and may not represent the actual dish.
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 bg-gradient-to-br from-stone-100 to-stone-200">
                      <DynamicIcon name={getItemFallbackIcon(item.category)} className="w-20 h-20 text-stone-300/80" />
                    </div>
                  )}
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-stone-900/10 backdrop-blur-[2px]">
                      <div className="bg-stone-900/90 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl transform -rotate-6 border border-stone-700 mx-4 text-center">
                        {item.outOfStock ? 'Out of Stock' : <DevEmptyStateText />}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-30">
                    <div className="bg-white/95 backdrop-blur-md px-1.5 py-1.5 rounded-lg shadow-md flex items-center justify-center border border-stone-200/50" title="Vegetarian">
                      <div className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center rounded-sm bg-white">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      </div>
                    </div>
                  </div>
                  {item.isBestSeller && (
                     <div className="absolute top-3 left-3 bg-gradient-to-r from-dhaba-orange to-[#e67500] text-white text-[10px] font-black tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg shadow-orange-500/30 z-30 flex items-center gap-1 border border-white/20">
                       <Star className="w-3 h-3 fill-current" />
                       BEST SELLER
                     </div>
                  )}
                </div>
                
                <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white relative">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-serif font-extrabold text-stone-800 text-lg sm:text-xl leading-tight group-hover:text-dhaba-orange transition-colors">{item.name}</h3>
                    <div className="font-sans font-black text-dhaba-dark whitespace-nowrap text-xl flex flex-col items-end">
                      <div className="flex items-start">
                        <span className="text-sm mt-1 mr-0.5 opacity-60">₹</span>
                        {item.price}
                      </div>
                      {item.fullPortionPieces && <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">({item.fullPortionPieces} pcs)</div>}
                    </div>
                  </div>
                  
                  <p className="text-stone-500 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 mb-4 flex-1">{item.description}</p>
                  
                  <div className="flex items-center gap-3 text-xs font-medium text-stone-500 mb-4">
                    {item.spiceLevel && item.spiceLevel !== 'mild' && (
                       <div className="flex items-center gap-0.5 bg-red-50 px-2 py-1 rounded-md text-red-600 border border-red-100">
                         {item.spiceLevel === 'medium' && <><Flame className="w-3 h-3 fill-current" /><Flame className="w-3 h-3 fill-current" /></>}
                         {item.spiceLevel === 'spicy' && <><Flame className="w-3 h-3 fill-current" /><Flame className="w-3 h-3 fill-current" /><Flame className="w-3 h-3 fill-current" /></>}
                       </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-stone-100/80 flex items-center justify-between relative z-10">
                    {locked ? (
                      <div className="w-full bg-stone-50 text-stone-400 font-bold py-3.5 rounded-2xl flex flex-col justify-center items-center text-xs shadow-inner cursor-not-allowed border border-stone-100">
                        <span>{getLockReason(item)}</span>
                        <span className="text-[10px] font-medium opacity-80 mt-0.5">{getLockSubReason(item)}</span>
                      </div>
                    ) : (item.hasHalfPortion || item.hasButterOption || (item.variants && item.variants.length > 0)) ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedItemDetail(item); }}
                        className="w-full bg-white hover:bg-orange-50 border-2 border-dhaba-orange/20 hover:border-dhaba-orange text-dhaba-orange font-bold py-3.5 rounded-2xl transition-all duration-300 flex justify-center items-center text-sm shadow-sm active:scale-95 group/btn"
                      >
                        <span className="flex items-center gap-1.5"><Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" /> Options</span>
                      </button>
                    ) : (
                      getQuantity(item) === 0 ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}
                          className="w-full bg-dhaba-dark hover:bg-stone-800 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex justify-center items-center text-sm shadow-md hover:shadow-lg active:scale-95 group/add"
                        >
                          <span className="flex items-center gap-1.5">Add to Cart</span>
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between bg-dhaba-orange text-white rounded-2xl overflow-hidden shadow-lg shadow-dhaba-orange/30 animate-pop-in p-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1); }}
                            className="p-3 bg-black/10 hover:bg-black/20 rounded-xl transition-colors active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-black text-lg min-w-[2rem] text-center">{getQuantity(item)}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1); }}
                            className="p-3 bg-white text-dhaba-orange rounded-xl shadow-sm hover:bg-stone-50 transition-colors active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center border-t border-stone-200 pt-6">
            <p className="text-stone-500 text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 flex-wrap">
              <span>Every dish takes 15-20 minutes to serve</span>
              <span className="hidden sm:inline">|</span>
              <span>GST Extra</span>
              <span className="hidden sm:inline">|</span>
              <span>Please don't waste the food</span>
            </p>
          </div>
        </div>
      </div>
      
      
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
