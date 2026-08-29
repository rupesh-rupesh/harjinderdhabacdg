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

  const filters = ['All', 'Veg', 'Non-Veg', 'Popular', 'Best Seller', 'Specials'];

  const visibleCategories = dbCategories.filter(cat => !cat.isHidden).map(cat => cat.name);

  const filteredItems = menuItems.filter(item => {
    if (!visibleCategories.includes(item.category)) return false;

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType !== 'All') {
      if (filterType === 'Veg' && item.dietaryPreference !== 'veg') return false;
      if (filterType === 'Non-Veg' && item.dietaryPreference !== 'non-veg') return false;
      if (filterType === 'Popular' && !item.isPopular) return false;
      if (filterType === 'Best Seller' && !item.isBestSeller) return false;
      if (filterType === 'Specials' && !item.isDhabaSpecial) return false;
    }
    
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-50 overflow-hidden w-full font-sans">
      {/* Header */}
      <nav className="flex-shrink-0 bg-white border-b border-stone-200 shadow-sm h-16 px-4 flex items-center justify-between z-40 relative sticky top-0">
        <div className="flex items-center flex-1">
          <button onClick={onBack} className="text-stone-500 hover:text-dhaba-orange flex items-center font-medium transition-colors focus:outline-none p-2 -ml-2 rounded-full hover:bg-stone-100">
            <ArrowLeft className="w-6 h-6" /> 
          </button>
        </div>
        <div className="flex-1 flex justify-center">
           <span className="font-serif text-lg sm:text-xl font-bold text-dhaba-dark text-center whitespace-nowrap tracking-wide">View Menu</span>
        </div>
        <div className="flex items-center flex-1 justify-end">
          <button 
           onClick={openCart}
           className="relative p-2 text-stone-600 hover:text-dhaba-orange transition-colors duration-300 group focus:outline-none bg-stone-100 rounded-full hover:bg-orange-50"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-dhaba-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center -translate-y-1/4 translate-x-1/4 shadow-sm border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Search and Filters */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200 py-3 px-4 z-30 shadow-sm">
        <div className="relative max-w-4xl mx-auto mb-3">
          <input 
            type="text" 
            placeholder="Search dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl focus:ring-2 focus:ring-dhaba-orange/50 transition-all text-sm font-medium text-stone-700"
          />
          <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-2 max-w-4xl mx-auto pb-1" data-lenis-prevent="true">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${
                filterType === filter 
                ? 'bg-gradient-to-r from-dhaba-dark to-dhaba-coffee text-white border-transparent shadow-lg transform scale-105' 
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300 shadow-sm hover:shadow'
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
        <div className="w-[28%] md:w-64 flex-shrink-0 bg-white border-r border-stone-100 overflow-y-auto flex flex-col hide-scrollbar shadow-[2px_0_15px_-3px_rgba(0,0,0,0.02)] z-10" data-lenis-prevent="true">
          <div className="p-3 sm:p-4 space-y-2">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`relative w-full text-left flex items-center p-3 rounded-xl transition-all duration-300 group ${
                activeCategory === 'All' 
                ? 'bg-orange-50 text-dhaba-orange font-bold shadow-sm ring-1 ring-orange-100/50' 
                : 'bg-transparent text-stone-500 font-medium hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              {activeCategory === 'All' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-dhaba-orange rounded-r-full"></div>}
              <div className={`w-10 h-10 rounded-full flex-shrink-0 mr-3 flex items-center justify-center transition-colors duration-300 ${
                 activeCategory === 'All' ? 'bg-white shadow-sm' : 'bg-stone-100 group-hover:bg-white group-hover:shadow-sm'
              }`}>
                <span className={`text-[10px] uppercase tracking-wider ${activeCategory === 'All' ? 'text-dhaba-orange font-bold' : 'text-stone-400'}`}>All</span>
              </div>
              <span className="text-sm tracking-wide line-clamp-2">All Items</span>
            </button>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-4 opacity-70"></div>

            {dbCategories.filter(cat => !cat.isHidden).map((category) => {
              const isActive = activeCategory === category.name;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`relative w-full text-left flex items-center p-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-orange-50 text-dhaba-orange font-bold shadow-sm ring-1 ring-orange-100/50' 
                    : 'bg-transparent text-stone-500 font-medium hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-dhaba-orange rounded-r-full"></div>}
                  {category.image ? (
                      <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3 transition-transform duration-300 ${isActive ? 'ring-2 ring-white shadow-md transform scale-105' : 'ring-1 ring-stone-200 group-hover:ring-stone-300 group-hover:shadow-sm'}`}>
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                  ) : (
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 mr-3 flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-white shadow-sm' : 'bg-stone-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                         <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-dhaba-orange font-bold' : 'text-stone-400'}`}>C</span>
                      </div>
                  )}
                  <span className="text-sm tracking-wide line-clamp-2">{category.name}</span>
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
              <div key={item.id} className={`bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 overflow-hidden border border-stone-100 flex flex-col group transform hover:-translate-y-1 ${locked ? 'opacity-80 grayscale-[50%]' : 'cursor-pointer'}`} onClick={() => !locked && setSelectedItemDetail(item)}>
                <div className="relative h-48 sm:h-56 overflow-hidden bg-stone-100 border-b border-stone-100/50">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700">
                      <DynamicIcon name={getItemFallbackIcon(item.category)} className="w-20 h-20 text-stone-300" />
                    </div>
                  )}
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="bg-stone-900/80 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl backdrop-blur-md shadow-2xl transform -rotate-12 border border-stone-700 mx-4 text-center">
                        {item.outOfStock ? 'Out of Stock' : <DevEmptyStateText />}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {item.dietaryPreference && (
                      <div className="bg-white/90 backdrop-blur px-1.5 py-1.5 rounded shadow-sm flex items-center justify-center">
                        <div className={`w-3.5 h-3.5 border ${item.dietaryPreference === 'veg' ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded-sm bg-white`}>
                          <div className={`w-2 h-2 rounded-full ${item.dietaryPreference === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {item.isBestSeller && (
                     <div className="absolute top-3 left-3 bg-dhaba-orange text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                       BEST SELLER
                     </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-serif font-bold text-stone-800 text-lg sm:text-xl leading-tight group-hover:text-dhaba-orange transition-colors">{item.name}</h3>
                    <div className="font-sans font-bold text-dhaba-orange whitespace-nowrap text-xl flex flex-col items-end">
                              <div>₹{item.price}</div>
                              {item.fullPortionPieces && <div className="text-xs text-stone-500 font-normal">({item.fullPortionPieces} pcs)</div>}
                            </div>
                  </div>
                  
                  <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2 mb-4 mt-2 flex-1">{item.description}</p>
                  
                  <div className="flex items-center gap-3 text-xs font-medium text-stone-500 mb-4">
                    {item.spiceLevel && item.spiceLevel !== 'mild' && (
                       <div className="flex items-center text-red-500">
                         {item.spiceLevel === 'medium' && <><Flame className="w-3.5 h-3.5 fill-current" /><Flame className="w-3.5 h-3.5 fill-current" /></>}
                         {item.spiceLevel === 'spicy' && <><Flame className="w-3.5 h-3.5 fill-current" /><Flame className="w-3.5 h-3.5 fill-current" /><Flame className="w-3.5 h-3.5 fill-current" /></>}
                       </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
                    {locked ? (
                      <div className="w-full bg-stone-100 text-stone-500 font-semibold py-3 rounded-2xl flex flex-col justify-center items-center text-xs shadow-inner cursor-not-allowed">
                        <span>{getLockReason(item)}</span>
                        <span className="text-[10px] font-normal">{getLockSubReason(item)}</span>
                      </div>
                    ) : (item.hasHalfPortion || item.hasButterOption || (item.variants && item.variants.length > 0)) ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedItemDetail(item); }}
                        className="w-full bg-white hover:bg-gradient-to-r hover:from-dhaba-orange hover:to-dhaba-yellow border border-stone-200 hover:border-transparent text-dhaba-dark hover:text-white font-semibold py-3 rounded-2xl transition-all duration-300 flex justify-center items-center text-sm shadow-sm hover:shadow-lg active:scale-95"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </button>
                    ) : (
                      getQuantity(item) === 0 ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}
                          className="w-full bg-white hover:bg-gradient-to-r hover:from-dhaba-orange hover:to-dhaba-yellow border border-stone-200 hover:border-transparent text-dhaba-dark hover:text-white font-semibold py-3 rounded-2xl transition-all duration-300 flex justify-center items-center text-sm shadow-sm hover:shadow-lg active:scale-95"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between bg-dhaba-orange text-white rounded-xl overflow-hidden shadow-md shadow-dhaba-orange/20 animate-pop-in">
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1); }}
                            className="p-3 bg-black/10 hover:bg-black/20 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold min-w-[2rem] text-center">{getQuantity(item)}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1); }}
                            className="p-3 bg-black/10 hover:bg-black/20 transition-colors"
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
