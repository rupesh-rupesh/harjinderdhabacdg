import React from 'react';
import { ArrowLeft, Menu, Search, ShoppingCart, Minus, Plus, ChevronRight, Clock, Star, Sun, Coffee, CupSoda, Pizza, ConciergeBell, Utensils, UtensilsCrossed, Flame, Soup, Droplets, Leaf, Info } from 'lucide-react';
import { NoodleBowlIcon } from './CustomIcons';

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
  cartCount: number;
  setIsCartOpen: (isOpen: boolean) => void;
  onBackToHome: () => void;
  cartItems: any[];
  addToCart: (item: any) => void;
  updateQuantity: (name: string, isHalf: boolean, isButter: boolean, delta: number, variantName?: string) => void;
  setSelectedItemDetail: (item: any) => void;
}

const getCategoryMetadata = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("breakfast")) return { icon: Sun, color: "text-yellow-500", subtitle: "Start your day right" };
  if (lowerName.includes("indian")) return { icon: NoodleBowlIcon, color: "", subtitle: "Authentic Indian flavors" };
  if (lowerName.includes("beverage") || lowerName.includes("drink")) return { icon: CupSoda, color: "text-cyan-500", subtitle: "Refreshing drinks" };
  if (lowerName.includes("raita") || lowerName.includes("curd")) return { icon: Soup, color: "text-orange-500", subtitle: "Cool & healthy" };
  if (lowerName.includes("thali")) return { icon: ConciergeBell, color: "text-stone-500", subtitle: "Complete satisfying meals" };
  if (lowerName.includes("chinese")) return { icon: UtensilsCrossed, color: "text-red-500", subtitle: "Indo-Chinese delights" };
  if (lowerName.includes("pizza")) return { icon: Pizza, color: "text-amber-500", subtitle: "Cheesy & delicious" };
  if (lowerName.includes("tandoor") || lowerName.includes("bread") || lowerName.includes("roti") || lowerName.includes("naan")) return { icon: NoodleBowlIcon, color: "", subtitle: "Fresh from the clay oven" };
  if (lowerName.includes("dal") || lowerName.includes("paneer") || lowerName.includes("sabzi")) return { icon: Soup, color: "text-orange-500", subtitle: "Rich & flavorful dishes" };
  if (lowerName.includes("snack") || lowerName.includes("starter") || lowerName.includes("appetizer")) return { icon: Utensils, color: "text-stone-400", subtitle: "Perfect light bites" };
  if (lowerName.includes("dessert") || lowerName.includes("sweet")) return { icon: Coffee, color: "text-amber-700", subtitle: "Sweet endings" };
  return { icon: Utensils, color: "text-stone-300", subtitle: "Explore our delicious offerings" };
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
  cartCount,
  setIsCartOpen,
  onBackToHome,
  cartItems,
  addToCart,
  updateQuantity,
  setSelectedItemDetail
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
  
  const getLockSubReason = (item: any) => {
    if (item.outOfStock) return "Not orderable";
    return `Tomorrow ${item.startTime || '5 AM'}`;
  };
  

  const orderMenuFiltered = menuItems.filter(item => {
    const categoryObj = dbCategories.find(c => c.name === item.category);
    if (categoryObj && categoryObj.isHidden) return false;

    const matchesCategory = orderCategory === 'All' || item.category === orderCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getQuantity = (item: any) => {
    const cartId = `${item.name}-${item.isHalf ? 'half' : 'full'}-${item.isButter ? 'butter' : 'nobutter'}`;
    const cartItem = cartItems.find(i => `${i.name}-${i.isHalf ? 'half' : 'full'}-${i.isButter ? 'butter' : 'nobutter'}` === cartId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-50 overflow-hidden w-full">
      {/* Order Nav */}
      <nav className="flex-shrink-0 bg-[#2c1e16] shadow-md h-16 px-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center flex-1">
          <button onClick={() => {
            if (orderViewStatus === 'items') {
              setOrderViewStatus('categories');
            } else {
              onBackToHome();
            }
          }} className="text-white hover:text-dhaba-yellow flex items-center font-medium transition-colors p-2 -ml-2 rounded-lg hover:bg-white/10 focus:outline-none">
            {orderViewStatus === 'categories' ? <Menu className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center gap-3">
          <span className="text-dhaba-yellow text-sm font-serif">~</span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-white text-center whitespace-nowrap">Order Menu</span>
          <span className="text-dhaba-yellow text-sm font-serif">~</span>
        </div>
        <div className="flex items-center flex-1 justify-end">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:text-dhaba-yellow transition-colors duration-300 group focus:outline-none rounded-lg hover:bg-white/10"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-dhaba-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center -translate-y-1/4 translate-x-1/4 shadow-sm border border-transparent">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {orderViewStatus === 'categories' ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 bg-dhaba-light" data-lenis-prevent="true">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 sm:mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-dhaba-orange/20 to-transparent -z-10 hidden sm:block"></div>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-dhaba-dark inline-flex items-center gap-4 bg-dhaba-light px-6 mx-auto shadow-sm sm:shadow-none rounded-full">
                  Our Menu Categories
                </h2>
                <div className="flex items-center justify-center mt-3 gap-2">
                  <div className="w-12 h-px bg-dhaba-orange/30"></div>
                  <div className="w-2 h-2 rounded-full bg-dhaba-orange/50"></div>
                  <div className="w-12 h-px bg-dhaba-orange/30"></div>
                </div>
                <p className="text-stone-500 font-light mt-3 sm:text-lg">Explore our delicious food and beverages</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 pb-24">
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 animate-pulse h-64 sm:h-80">
                    </div>
                  ))
                ) : (
                  <>
                <button
                  key="all-categories"
                  onClick={() => {
                    setOrderCategory('All');
                    setOrderViewStatus('items');
                  }}
                  className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-500 group text-center transform hover:-translate-y-2 h-56 sm:h-72 flex flex-col items-center justify-center relative border border-transparent bg-gradient-to-br from-[#3c2a1e] to-[#251810]"
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                  
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-dhaba-orange/30 flex items-center justify-center mb-4 sm:mb-6 z-10 relative">
                     <ConciergeBell className="w-7 h-7 sm:w-10 sm:h-10 text-dhaba-orange drop-shadow-sm" />
                  </div>
                  
                  <div className="z-10 px-4">
                    <h3 className="font-serif font-bold text-white text-xl sm:text-2xl mb-1 sm:mb-2 group-hover:text-dhaba-orange transition-colors">All Items</h3>
                    <p className="text-stone-300 text-xs sm:text-sm font-light">Explore everything</p>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-800 group-hover:text-dhaba-orange transition-colors z-10">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </button>
                {dbCategories.filter(category => !category.isHidden).map(category => {
                  const meta = getCategoryMetadata(category.name);
                  const Icon = meta.icon;
                  return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setOrderCategory(category.name);
                      setOrderViewStatus('items');
                    }}
                    className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-500 border border-stone-100 group text-left transform hover:-translate-y-2 h-56 sm:h-72 flex flex-col relative"
                  >
                    <div className="h-3/5 w-full overflow-hidden relative bg-stone-100">
                      {category.image ? (
                         <img src={category.image} alt={category.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                         <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                           <span className="text-stone-400 text-xs">No Image</span>
                         </div>
                      )}
                    </div>
                    
                    <div className="h-2/5 p-4 sm:p-5 flex flex-col justify-end relative bg-white">
                      <div className="absolute -top-7 sm:-top-9 left-4 sm:left-5 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-50 border border-dhaba-orange flex items-center justify-center">
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-dhaba-orange" />
                         </div>
                      </div>
                      
                      <div className="mt-auto pr-8">
                        <h3 className="font-serif font-bold text-stone-800 text-lg sm:text-xl group-hover:text-dhaba-orange transition-colors line-clamp-1">{category.name}</h3>
                        <p className="text-stone-500 text-[10px] sm:text-xs font-light mt-0.5 line-clamp-1">{meta.subtitle}</p>
                      </div>
                      
                      <div className="absolute bottom-4 sm:bottom-5 right-4 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-dhaba-orange group-hover:border-dhaba-orange transition-colors">
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </button>
                )})}
                </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
             {/* Search and Filters for items */}
             <div className="flex-shrink-0 bg-white border-b border-stone-200 py-3 px-4 sm:px-6 shadow-sm z-30">
               <div className="max-w-3xl mx-auto">
                 <div className="relative">
                   <input 
                     type="text" 
                     placeholder={`Search in ${orderCategory}...`}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-6 py-3.5 bg-white border border-stone-200/50 shadow-inner rounded-2xl focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange transition-all text-sm font-medium text-stone-800 outline-none"
                   />
                   <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                 </div>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-dhaba-light" data-lenis-prevent="true">
               <div className="max-w-3xl mx-auto pb-24">
                 <h2 className="text-3xl sm:text-4xl font-serif font-bold text-dhaba-dark mb-8 drop-shadow-sm">{orderCategory}</h2>
                 
                 <div className="flex flex-col gap-4">
                   {isLoading ? (
                     [...Array(5)].map((_, i) => (
                       <div key={i} className="bg-white rounded-[2rem] shadow-sm border border-stone-100 flex p-4 sm:p-5 gap-4 sm:gap-6 animate-pulse">
                         <div className="w-28 h-28 sm:w-40 sm:h-40 flex-shrink-0 rounded-2xl bg-stone-200"></div>
                         <div className="flex flex-col flex-1 justify-between py-1">
                           <div>
                             <div className="flex justify-between items-start mb-2 gap-2">
                               <div className="h-6 bg-stone-200 rounded w-1/2"></div>
                               <div className="h-6 bg-stone-200 rounded w-1/4"></div>
                             </div>
                             <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                             <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                           </div>
                           <div className="flex items-center justify-between mt-auto">
                             <div className="h-10 bg-stone-200 rounded-xl w-32"></div>
                           </div>
                         </div>
                       </div>
                     ))
                   ) : orderMenuFiltered.length > 0 ? (
                     orderMenuFiltered.map((item) => {
                       const locked = isItemLocked(item);
                       const category = dbCategories.find(c => c.name === item.category);
                       return (
                       <div key={item.id} className={`bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 overflow-hidden border border-stone-100 flex p-4 sm:p-5 gap-4 sm:gap-6 group transform hover:-translate-y-1 ${locked ? 'opacity-80 grayscale-[50%]' : ''}`}>
                         <div className="w-28 h-28 sm:w-40 sm:h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-stone-100 relative">
                           {item.image ? (
                             <>
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                               <div className="absolute bottom-2 left-2 bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white cursor-help group/info z-30 transition-colors shadow-sm">
                                 <Info className="w-3.5 h-3.5" />
                                 <div className="absolute left-0 bottom-full mb-2 w-48 bg-stone-900 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 pointer-events-none border border-white/10 z-40 text-left leading-tight">
                                   Image is for reference only and may not represent the actual dish.
                                 </div>
                               </div>
                             </>
                           ) : (
                             <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700">
                                {(() => {
                                  const meta = getCategoryMetadata(item.category || '');
                                  const CategoryIcon = meta.icon;
                                  return <CategoryIcon className={`w-12 h-12 ${meta.color}`} />;
                                })()}
                             </div>
                           )}
                           {item.dietaryPreference && (
                             <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-1 py-1 rounded shadow-sm flex items-center justify-center">
                               <div className={`w-3 h-3 border ${(item.dietaryPreference?.toLowerCase() === 'veg' || item.dietaryPreference?.toLowerCase() === 'vegetarian') ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded-sm bg-white`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${(item.dietaryPreference?.toLowerCase() === 'veg' || item.dietaryPreference?.toLowerCase() === 'vegetarian') ? 'bg-green-600' : 'bg-red-600'}`}></div>
                               </div>
                             </div>
                           )}
                         </div>
                         
                         <div className="flex flex-col flex-1 justify-between py-1">
                           <div>
                             <div className="flex justify-between items-start mb-1 gap-2">
                               <h3 className="font-serif font-bold text-stone-800 text-lg sm:text-xl leading-tight group-hover:text-dhaba-orange transition-colors">{item.name}</h3>
                               <div className="font-sans font-bold text-dhaba-orange whitespace-nowrap text-xl flex flex-col items-end">
                              <div>₹{item.price}</div>
                              {item.fullPortionPieces && <div className="text-[13px] text-stone-400 font-medium mt-0.5">{item.fullPortionPieces} Pieces</div>}
                            </div>
                             </div>
                             <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2 mb-3 mt-1">{item.description}</p>
                           </div>
                           
                           <div className="flex items-center justify-between mt-auto">
                             <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                               {item.rating && (
                                 <div className="flex items-center text-dhaba-orange">
                                   <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                   {item.rating}
                                 </div>
                               )}
                             </div>
                             
                             <div className="w-24 sm:w-28">
                               {locked ? (
                                 <div className="w-full bg-stone-100 text-stone-500 font-semibold py-2 rounded-xl flex flex-col justify-center items-center text-[10px] shadow-inner cursor-not-allowed text-center leading-tight">
                                   <span>{getLockReason(item)}</span>
                                   <span className="font-normal scale-90">{getLockSubReason(item)}</span>
                                 </div>
                               ) : (item.hasHalfPortion || item.hasButterOption || (item.variants && item.variants.length > 0)) ? (
                                 <button 
                                   onClick={() => setSelectedItemDetail(item)}
                                   className="w-full bg-white hover:bg-gradient-to-r hover:from-dhaba-orange hover:to-dhaba-yellow border border-stone-200 hover:border-transparent text-dhaba-dark hover:text-white font-semibold py-2.5 rounded-xl transition-all duration-300 flex justify-center items-center text-sm shadow-sm hover:shadow-md active:scale-95"
                                 >
                                   <Plus className="w-4 h-4 mr-1" /> Add
                                 </button>
                               ) : (
                                 getQuantity(item) === 0 ? (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}
                                     className="w-full bg-white hover:bg-gradient-to-r hover:from-dhaba-orange hover:to-dhaba-yellow border border-stone-200 hover:border-transparent text-dhaba-dark hover:text-white font-semibold py-2.5 rounded-xl transition-all duration-300 flex justify-center items-center text-sm shadow-sm hover:shadow-md active:scale-95"
                                   >
                                     <Plus className="w-4 h-4 mr-1" /> Add
                                   </button>
                                 ) : (
                                   <div onClick={(e) => e.stopPropagation()} className="w-full flex items-center justify-between bg-dhaba-orange text-white rounded-lg overflow-hidden shadow-md animate-pop-in">
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1); }}
                                       className="p-2 bg-black/10 hover:bg-black/20 transition-colors flex-1 flex justify-center"
                                     >
                                       <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                     </button>
                                     <span className="font-bold min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm">{getQuantity(item)}</span>
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1); }}
                                       className="p-2 bg-black/10 hover:bg-black/20 transition-colors flex-1 flex justify-center"
                                     >
                                       <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                     </button>
                                   </div>
                                 )
                               )}
                             </div>
                           </div>
                         </div>
                       </div>
                     );})
                   ) : (
                     <div className="w-full text-center py-12 text-stone-500">
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
