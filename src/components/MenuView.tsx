import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  ArrowLeft, Search, ShoppingCart, Minus, Plus, Flame, Star, Info, X,
  Clock, ChevronLeft, ChevronRight, Check, Sparkles, Utensils, ChevronDown
} from 'lucide-react';
import { DevEmptyStateText } from './DevEmptyStateText';
import { getCategoryMeta, getDishPunjabi } from '../utils/dhabaThemeData';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   VEG dot badge
───────────────────────────────────────────── */
const VegDot = () => (
  <div className="w-4 h-4 border-2 border-green-600 rounded-sm bg-white flex items-center justify-center flex-shrink-0" title="Pure Vegetarian">
    <div className="w-2 h-2 rounded-full bg-green-600" />
  </div>
);

/* ─────────────────────────────────────────────
   Category image with emoji fallback
───────────────────────────────────────────── */
const CategoryImage = ({ image, emoji, name, className = "" }: {
  image?: string; emoji: string; name: string; className?: string;
}) => {
  const [imgError, setImgError] = useState(false);
  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <span className="text-4xl">{emoji}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Food image card with emoji fallback
───────────────────────────────────────────── */
const FoodImage = ({ image, name, emoji }: { image?: string; name: string; emoji: string }) => {
  const [err, setErr] = useState(false);
  if (image && !err) {
    return (
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={() => setErr(true)}
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 gap-2">
      <span className="text-4xl">{emoji}</span>
      <span className="text-xs text-amber-700 font-medium font-serif text-center px-2 line-clamp-2">{name}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Gold ornament divider  ✦—————✦
───────────────────────────────────────────── */
const GoldDivider = () => (
  <div className="flex items-center gap-2 justify-center my-1">
    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#C89B3C]/40" />
    <span className="text-[#C89B3C] text-xs">✦</span>
    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-[#C89B3C]/40" />
  </div>
);

/* ─────────────────────────────────────────────
   Main MenuView component
───────────────────────────────────────────── */
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

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Popular' | 'Best Seller' | 'Specials'>('All');
  const catScrollRef = useRef<HTMLDivElement>(null);
  const itemsSectionRef = useRef<HTMLDivElement>(null);

  /* ── helpers ── */
  const isItemLocked = useCallback((item: any) => {
    if (item.outOfStock) return true;
    if (!item.hasTiming || !item.startTime || !item.endTime) return false;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = item.startTime.split(':').map(Number);
    const [eh, em] = item.endTime.split(':').map(Number);
    const s = sh * 60 + sm, e = eh * 60 + em;
    return s <= e ? cur < s || cur > e : cur < s && cur > e;
  }, []);

  const getQuantity = useCallback((item: any): number => {
    const id = `${item.name}-${item.isHalf ? 'half' : 'full'}-${item.isButter ? 'butter' : 'nobutter'}`;
    const found = cartItems.find(c => `${c.name}-${c.isHalf ? 'half' : 'full'}-${c.isButter ? 'butter' : 'nobutter'}` === id);
    return found ? found.quantity : 0;
  }, [cartItems]);

  const cartCount = useMemo(() => cartItems.reduce((a, i) => a + i.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((a, i) => a + i.numericPrice * i.quantity, 0), [cartItems]);

  /* ── visible categories from DB ── */
  const visibleCats = useMemo(() => dbCategories.filter(c => !c.isHidden), [dbCategories]);
  const visibleCatNames = useMemo(() => new Set(visibleCats.map(c => (c.name || '').trim().toLowerCase())), [visibleCats]);

  /* ── category list (All + visible DB cats) ── */
  const enrichedCats = useMemo(() => {
    const allCount = menuItems.filter(i => i.dietaryPreference !== 'non-veg' && visibleCatNames.has((i.category || '').trim().toLowerCase())).length;
    const catMeta = getCategoryMeta('All');
    const list = [{
      id: '__all__',
      name: 'All',
      image: null as string | null,
      meta: catMeta,
      count: allCount,
    }];
    for (const cat of visibleCats) {
      const count = menuItems.filter(
        i => i.dietaryPreference !== 'non-veg' &&
             (i.category || '').trim().toLowerCase() === (cat.name || '').trim().toLowerCase()
      ).length;
      list.push({
        id: cat.id,
        name: cat.name,
        image: cat.image || null,
        meta: getCategoryMeta(cat.name),
        count,
      });
    }
    return list;
  }, [visibleCats, visibleCatNames, menuItems]);

  /* ── marquee duplicated list for infinite seamless loop ── */
  const marqueeCats = useMemo(() => {
    if (enrichedCats.length === 0) return [];
    if (enrichedCats.length < 5) {
      return [...enrichedCats, ...enrichedCats, ...enrichedCats, ...enrichedCats];
    }
    return [...enrichedCats, ...enrichedCats];
  }, [enrichedCats]);

  /* ── filtered + grouped items ── */
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (item.dietaryPreference === 'non-veg') return false;

      // Strictly exclude dishes belonging to disabled categories
      const iCat = (item.category || '').trim().toLowerCase();
      if (!visibleCatNames.has(iCat)) return false;

      // Category filter — EXACT match
      if (activeCategory !== 'All') {
        const aCat = activeCategory.trim().toLowerCase();
        if (iCat !== aCat) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = (item.name || '').toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inCat  = (item.category || '').toLowerCase().includes(q);
        if (!inName && !inDesc && !inCat) return false;
      }

      // Quick filter
      if (filterType === 'Popular' && !item.isPopular) return false;
      if (filterType === 'Best Seller' && !item.isBestSeller) return false;
      if (filterType === 'Specials' && !item.isDhabaSpecial) return false;

      return true;
    });
  }, [menuItems, activeCategory, searchQuery, filterType]);

  /* ── sections for display ── */
  const sections = useMemo(() => {
    if (activeCategory !== 'All') {
      return [{ catName: activeCategory, items: filteredItems }];
    }
    if (searchQuery.trim()) {
      const names = Array.from(new Set(filteredItems.map(i => i.category || 'Other')));
      return names.map(n => ({ catName: n, items: filteredItems.filter(i => (i.category || 'Other') === n) }));
    }
    // Default: each visible DB category in order
    return visibleCats
      .map(cat => ({
        catName: cat.name,
        items: filteredItems.filter(i => (i.category || '').trim().toLowerCase() === cat.name.trim().toLowerCase()),
      }))
      .filter(s => s.items.length > 0);
  }, [activeCategory, filteredItems, searchQuery, visibleCats]);

  /* ── handlers ── */
  const selectCategory = (name: string) => {
    setActiveCategory(name);
    setSearchQuery('');
    // Scroll to items section smoothly
    setTimeout(() => {
      itemsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const scrollCats = (dir: 'l' | 'r') => {
    if (!catScrollRef.current) return;
    catScrollRef.current.scrollBy({ left: dir === 'l' ? -280 : 280, behavior: 'smooth' });
  };

  /* ── Filter chips ── */
  const filters = ['All', 'Popular', 'Best Seller', 'Specials'] as const;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#241712] font-sans selection:bg-[#F97316] selection:text-white">

      {/* ══════════ STICKY NAV ══════════ */}
      <nav className="sticky top-0 z-50 bg-[#241712]/97 backdrop-blur-md shadow-lg px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">

          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-stone-300 hover:text-[#C89B3C] text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Brand — YOUR logo + name */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <img
                src="/Browser-tab.webp"
                alt="Harjinder Tourist Dhaba"
                className="h-8 w-8 rounded-full object-cover border border-[#C89B3C]/40"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="text-center">
                <span className="font-serif font-bold text-white text-base sm:text-lg leading-none block">
                  <span className="text-[#C89B3C]">Harjinder</span> Tourist Dhaba
                </span>
                <span className="text-[10px] text-stone-400 tracking-widest">SINCE 1991 • KHARAR–KURALI HWY</span>
              </div>
            </div>
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 bg-[#C89B3C] hover:bg-[#b38827] text-[#241712] font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-[#241712] text-[#C89B3C] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ══════════ HERO BANNER ══════════ */}
      <header
        className="relative overflow-hidden py-10 sm:py-16"
        style={{
          background: 'linear-gradient(135deg, #241712 0%, #3A2418 50%, #241712 100%)',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #C89B3C 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Gold top/bottom accent lines */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Logo emblem */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-[#C89B3C]/60 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden border border-[#C89B3C]/30">
                  <img
                    src="/Browser-tab.webp"
                    alt="Harjinder Tourist Dhaba Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      (e.target as HTMLElement).parentElement!.innerHTML =
                        '<div class="w-full h-full bg-amber-100 flex items-center justify-center"><span class="text-3xl">🍽️</span></div>';
                    }}
                  />
                </div>
              </div>
              {/* Gold glow ring */}
              <div className="absolute inset-0 rounded-full border border-[#C89B3C]/20 scale-125" />
            </div>
          </div>

          <h1 className="font-serif font-extrabold text-white text-3xl sm:text-5xl tracking-tight leading-tight mb-2">
            Our Menu
          </h1>
          <p className="text-[#C89B3C] font-serif font-medium text-base sm:text-lg tracking-wide mb-1">
            ਸੁਆਦ ਜੋ ਯਾਦ ਰਹਿ ਜਾਵੇ
          </p>
          <p className="text-stone-400 text-sm">A Taste That Stays With You</p>

          <GoldDivider />

          {/* Quality badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-1.5 bg-green-900/40 text-green-300 border border-green-700/50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              100% Vegetarian
            </span>
            <span className="flex items-center gap-1.5 bg-amber-900/40 text-amber-300 border border-amber-700/50 px-3 py-1.5 rounded-full">
              🥛 Pure Desi Ghee
            </span>
            <span className="flex items-center gap-1.5 bg-rose-900/40 text-rose-300 border border-rose-700/50 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Open 24 Hours
            </span>
          </div>
        </div>
      </header>

      {/* ══════════ SEARCH & FILTER ══════════ */}
      <section className="bg-white border-b border-stone-200 px-4 py-4 sticky top-[60px] z-40 shadow-sm">
        <div className="max-w-5xl mx-auto space-y-3">

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes... ਖਾਣਾ ਲੱਭੋ"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 justify-center">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  filterType === f
                    ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#F97316]/50 hover:text-[#F97316]'
                }`}
              >
                {f === 'Specials' ? '⭐ Specials' : f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CATEGORY SHOWCASE ══════════ */}
      <section className="bg-white border-b border-stone-100 py-6 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Section heading */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] sm:text-xs text-[#F97316] font-bold tracking-widest uppercase">
                ✦ ਖਾਣ-ਪੀਣ ਦੀਆਂ ਸ਼੍ਰੇਣੀਆਂ ✦
              </p>
              <h2 className="font-serif font-bold text-[#241712] text-lg sm:text-xl mt-0.5">
                Explore by Category
              </h2>
            </div>
            <span className="text-[11px] text-stone-400 font-medium italic hidden sm:inline">
              ✦ Auto-moving · Hover to pause
            </span>
          </div>

          {/* Category cards moving line (Continuous scroll, pauses on hover) */}
          <div className="relative overflow-hidden group/marquee py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Subtle fade edges for premium look */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />

            <div className="category-marquee-track flex gap-3.5 w-max">
              {marqueeCats.map((cat, idx) => {
                const sel = activeCategory === cat.name;
                return (
                  <button
                    key={`${cat.id}-${idx}`}
                    onClick={() => selectCategory(cat.name)}
                    className={`flex-shrink-0 w-32 sm:w-40 rounded-2xl overflow-hidden border-2 transition-all duration-300 group cursor-pointer flex flex-col text-left ${
                      sel
                        ? 'border-[#F97316] shadow-lg shadow-[#F97316]/20 ring-2 ring-[#F97316]/30 -translate-y-1'
                        : 'border-stone-200/80 hover:border-[#F97316]/60 hover:shadow-md hover:-translate-y-0.5 bg-white'
                    }`}
                  >
                    {/* Image area */}
                    <div className="relative h-20 sm:h-24 w-full overflow-hidden">
                      <CategoryImage
                        image={cat.image || undefined}
                        emoji={cat.meta.emoji}
                        name={cat.name}
                        className="group-hover:scale-105 transition-transform duration-400"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Dish count */}
                      <span className="absolute bottom-1.5 left-2 text-white text-[10px] font-semibold">
                        {cat.count} dish{cat.count !== 1 ? 'es' : ''}
                      </span>

                      {/* Active checkmark */}
                      {sel && (
                        <span className="absolute top-1.5 right-1.5 bg-[#F97316] text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Text area */}
                    <div className={`p-2 flex-1 w-full ${sel ? 'bg-orange-50' : 'bg-white'}`}>
                      <p className={`font-serif font-bold text-xs truncate ${sel ? 'text-[#F97316]' : 'text-stone-800 group-hover:text-[#F97316]'} transition-colors`}>
                        {cat.name}
                      </p>
                      <p className="text-[#C89B3C] text-[10px] font-serif font-semibold truncate">
                        {cat.meta.punjabi}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick pill strip for desktop wrapping */}
          <div className="hidden sm:flex flex-wrap gap-2 mt-4 justify-center">
            {enrichedCats.map(cat => {
              const sel = activeCategory === cat.name;
              return (
                <button
                  key={`pill-${cat.id}`}
                  onClick={() => selectCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    sel
                      ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-[#F97316]/50 hover:text-[#F97316]'
                  }`}
                >
                  <span>{cat.meta.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ ACTIVE CATEGORY INDICATOR ══════════ */}
      {(activeCategory !== 'All' || searchQuery) && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-sm font-semibold text-[#F97316] flex items-center gap-2">
              {activeCategory !== 'All'
                ? <>Showing: <strong>{activeCategory}</strong> — {getCategoryMeta(activeCategory).punjabi}</>
                : <>Search results for "{searchQuery}"</>
              }
              <span className="text-stone-500 font-normal text-xs">({filteredItems.length} dishes)</span>
            </span>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); setFilterType('All'); }}
              className="text-xs text-stone-500 hover:text-[#F97316] flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* ══════════ MENU ITEMS ══════════ */}
      <main ref={itemsSectionRef} className="max-w-6xl mx-auto px-4 py-8 space-y-14">

        {isLoading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
                <div className="h-44 bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-stone-200 rounded w-2/3" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-10 bg-stone-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>

        ) : sections.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-100 shadow-sm max-w-md mx-auto px-8">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">No dishes found</h3>
            <p className="text-stone-500 text-sm mb-6"><DevEmptyStateText /></p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); setFilterType('All'); }}
              className="px-6 py-2.5 bg-[#F97316] text-white font-bold rounded-xl text-sm hover:bg-[#e8690d] transition-colors cursor-pointer"
            >
              View Full Menu
            </button>
          </div>

        ) : (
          sections.map((section) => {
            const catMeta = getCategoryMeta(section.catName);
            return (
              <div key={section.catName}>

                {/* ── Category Section Header ── */}
                <div className="mb-6 text-center">
                  <span className="inline-block text-2xl mb-1">{catMeta.emoji}</span>
                  <p className="font-serif font-bold text-[#C89B3C] text-xl sm:text-2xl leading-none">
                    {catMeta.punjabi}
                  </p>
                  <h2 className="font-serif font-extrabold text-[#241712] text-2xl sm:text-3xl mt-0.5 italic">
                    {section.catName}
                  </h2>
                  <GoldDivider />
                  <p className="text-stone-500 text-xs sm:text-sm mt-1">{catMeta.subtitle}</p>
                </div>

                {/* ── Item Cards Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {section.items.map(item => {
                    const locked = isItemLocked(item);
                    const qty = getQuantity(item);
                    const hasOpts = item.hasHalfPortion || item.hasButterOption || (item.variants && item.variants.length > 0);
                    const punjabi = getDishPunjabi(item.name, item.punjabi);

                    return (
                      <div
                        key={item.id}
                        onClick={() => !locked && setSelectedItemDetail(item)}
                        className={`bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col transition-all duration-300 group
                          ${locked ? 'opacity-70 grayscale-[30%]' : 'hover:shadow-xl hover:shadow-stone-900/10 hover:-translate-y-1 cursor-pointer'}`}
                      >
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden bg-stone-100">
                          <FoodImage image={item.image} name={item.name} emoji={catMeta.emoji} />

                          {/* Top badges */}
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <VegDot />
                          </div>

                          {item.isDhabaSpecial && (
                            <div className="absolute top-2.5 left-2.5 z-10 bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                              <Sparkles className="w-3 h-3" /> Dhaba SPL
                            </div>
                          )}
                          {!item.isDhabaSpecial && item.isBestSeller && (
                            <div className="absolute top-2.5 left-2.5 z-10 bg-[#C89B3C] text-[#241712] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-[#241712]" /> Best Seller
                            </div>
                          )}

                          {/* Info tooltip */}
                          {item.image && (
                            <div className="absolute bottom-2 left-2 z-10 group/info">
                              <div className="bg-black/50 backdrop-blur-sm p-1 rounded-full text-white border border-white/10 cursor-help">
                                <Info className="w-3 h-3" />
                              </div>
                              <div className="absolute left-0 bottom-full mb-1.5 w-40 bg-stone-900/95 text-white text-[10px] p-2 rounded-lg shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all pointer-events-none z-30 leading-relaxed border border-white/10">
                                Image is for reference only.
                              </div>
                            </div>
                          )}

                          {/* Lock overlay */}
                          {locked && (
                            <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-20">
                              <span className="bg-stone-900/90 text-white text-xs font-bold px-4 py-2 rounded-xl border border-stone-700 -rotate-3">
                                {item.outOfStock ? 'Out of Stock' : 'Unavailable'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-4 flex flex-col flex-1">
                          {/* Name + Pieces */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif font-bold text-[#241712] text-base leading-snug group-hover:text-[#F97316] transition-colors line-clamp-2">
                                {item.name}
                              </h3>
                              {punjabi && (
                                <p className="text-[#C89B3C] text-[11px] font-serif font-semibold mt-0.5">{punjabi}</p>
                              )}
                            </div>
                            {item.fullPortionPieces && (
                              <div className="text-right flex-shrink-0">
                                <span className="text-[10px] text-[#C89B3C] font-semibold bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                                  {item.fullPortionPieces} pcs
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Spice level */}
                          {item.spiceLevel && item.spiceLevel !== 'None' && item.spiceLevel !== 'mild' && (
                            <div className="flex items-center gap-1 text-[11px] text-rose-600 mb-2 bg-rose-50 px-2 py-0.5 rounded-md w-fit border border-rose-100">
                              <Flame className="w-3 h-3 fill-rose-500" />
                              <span>{item.spiceLevel}</span>
                            </div>
                          )}

                          {/* CTA */}
                          <div className="mt-auto pt-3 border-t border-stone-100">
                            {locked ? (
                              <div className="text-center text-xs text-stone-400 font-semibold py-2 bg-stone-50 rounded-xl">
                                {item.outOfStock ? 'Out of Stock' : `Available at ${item.startTime || 'later'}`}
                              </div>
                            ) : hasOpts ? (
                              <button
                                onClick={e => { e.stopPropagation(); setSelectedItemDetail(item); }}
                                className="w-full border-2 border-[#F97316] text-[#F97316] font-bold py-2.5 rounded-xl text-sm hover:bg-[#F97316] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                              >
                                <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                Options
                              </button>
                            ) : qty === 0 ? (
                              <button
                                onClick={e => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}
                                className="w-full bg-[#241712] hover:bg-[#3A2418] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                              >
                                <Plus className="w-4 h-4" /> Add to Cart
                              </button>
                            ) : (
                              <div className="flex items-center justify-between bg-[#241712] text-white rounded-xl overflow-hidden p-1 shadow-sm">
                                <button
                                  onClick={e => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1); }}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-black text-sm min-w-[2rem] text-center">{qty}</span>
                                <button
                                  onClick={e => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1); }}
                                  className="p-2 bg-[#C89B3C] text-[#241712] rounded-lg hover:bg-[#D4AF37] transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Section footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-200/60 text-xs text-stone-400">
                  <span>{section.items.length} dish{section.items.length !== 1 ? 'es' : ''}</span>
                  <span className="font-serif text-[#C89B3C]/70">✦ Harjinder Tourist Dhaba ✦</span>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ══════════ FOOTER PROMISE ══════════ */}
      <footer className="bg-[#241712] text-stone-300 mt-16 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <img
            src="/Browser-tab.webp"
            alt="Harjinder Tourist Dhaba"
            className="w-14 h-14 rounded-full mx-auto border-2 border-[#C89B3C]/40 object-cover"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <p className="font-serif font-bold text-[#C89B3C] text-lg sm:text-xl">
            ਖਾਓ ਪੀਓ ਐਸ਼ ਕਰੋ ਮਿੱਤਰੋ
          </p>
          <p className="text-stone-400 text-sm">
            Every dish takes 15–20 minutes • GST extra • Please don't waste food 🌿
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {['🥛 Own Made Desi Ghee', '💧 Filtered Water', '🌾 Fresh Chakki Atta'].map(badge => (
              <span key={badge} className="text-xs bg-[#3A2418] text-[#C89B3C] border border-[#C89B3C]/20 px-3 py-1.5 rounded-full font-medium">
                {badge}
              </span>
            ))}
          </div>
          <p className="text-stone-500 text-xs">No chemicals • No cabbage • No mill flour</p>
          <div className="pt-4 border-t border-stone-800">
            <p className="text-stone-500 text-xs">
              <span className="text-[#C89B3C] font-serif font-bold">Harjinder Tourist Dhaba</span> — Kharar–Kurali Highway, Punjab · Since 1991
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════ STICKY CART BAR ══════════ */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 pb-safe">
          <button
            onClick={openCart}
            className="max-w-lg mx-auto w-full block bg-[#F97316] hover:bg-[#e8690d] text-white font-bold py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer border border-[#C89B3C]/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-lg">
                {cartCount}
              </div>
              <div className="text-left">
                <span className="text-xs text-orange-100 block font-medium">
                  {cartCount === 1 ? '1 item' : `${cartCount} items`} selected
                </span>
                <span className="font-extrabold text-base">View Selection</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white text-[#F97316] px-3.5 py-1.5 rounded-xl font-bold text-sm">
              View Cart <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* scrollbar hide & marquee styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes categoryMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 7px)); }
        }
        .category-marquee-track {
          animation: categoryMarquee 38s linear infinite;
          will-change: transform;
        }
        .group\\/marquee:hover .category-marquee-track,
        .category-marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
