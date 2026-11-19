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

          {/* Balance spacer */}
          <div className="w-10 sm:w-20" />
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
                    className={`flex-shrink-0 w-36 sm:w-44 rounded-2xl overflow-hidden border-2 transition-all duration-300 group cursor-pointer flex flex-col text-left shadow-sm ${
                      sel
                        ? 'border-[var(--color-gold)] bg-amber-50/40 shadow-lg shadow-[var(--color-gold)]/20 ring-2 ring-[var(--color-gold)]/30 -translate-y-1'
                        : 'border-stone-200/90 hover:border-[var(--color-gold)]/70 hover:shadow-md hover:-translate-y-0.5 bg-white'
                    }`}
                  >
                    {/* Image area */}
                    <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-stone-100">
                      <CategoryImage
                        image={cat.image || undefined}
                        emoji={cat.meta.emoji}
                        name={cat.name}
                        className="group-hover:scale-108 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                      {/* Top emoji pill */}
                      <span className="absolute top-2 left-2 text-sm bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm">
                        {cat.meta.emoji}
                      </span>

                      {/* Dish count */}
                      <span className="absolute bottom-2 left-2 text-white/95 text-[10px] font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10">
                        {cat.count} dish{cat.count !== 1 ? 'es' : ''}
                      </span>

                      {/* Active checkmark */}
                      {sel && (
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-[var(--color-gold)] to-[#b38827] text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Text area with prominent Punjabi Gurmukhi name */}
                    <div className={`p-2.5 flex-1 w-full flex flex-col justify-center ${sel ? 'bg-amber-50/80' : 'bg-white'}`}>
                      <p className="text-[#C89B3C] text-[11px] sm:text-xs font-serif font-bold truncate tracking-wide leading-tight">
                        {cat.meta.punjabi}
                      </p>
                      <p className={`font-serif font-bold text-xs sm:text-sm truncate mt-0.5 ${sel ? 'text-[#241712]' : 'text-stone-800 group-hover:text-[#F97316]'} transition-colors`}>
                        {cat.name}
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    sel
                      ? 'bg-gradient-to-r from-[var(--color-gold)] to-[#b38827] text-white border-transparent shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-[var(--color-gold)]/60 hover:text-[var(--color-brown)]'
                  }`}
                >
                  <span>{cat.meta.emoji}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-serif ${sel ? 'text-amber-100' : 'text-[#C89B3C]'}`}>• {cat.meta.punjabi}</span>
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

                {/* ── Item Cards Grid (Exact Dhaba Special Design) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map(item => {
                    const locked = isItemLocked(item);
                    const punjabi = getDishPunjabi(item.name, item.punjabi);

                    return (
                      <div
                        key={item.id}
                        className={`w-full rounded-3xl bg-white border border-[#E5D5C0]/80 shadow-[0_8px_25px_rgba(36,23,18,0.06)] hover:shadow-[0_20px_45px_rgba(200,155,60,0.18)] hover:border-[var(--color-gold)]/60 transition-all duration-500 overflow-hidden flex flex-col group/card transform hover:-translate-y-1.5 ${locked ? 'opacity-70 grayscale-[40%]' : ''}`}
                      >
                        {/* Food Image */}
                        <div className="h-52 relative overflow-hidden bg-stone-100 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-50/60">
                              <span className="text-4xl">{catMeta.emoji || '🍛'}</span>
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
                              <VegDot />
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
                                {item.outOfStock ? 'Out of Stock' : 'Unavailable'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow bg-white">
                          <p className="text-[var(--color-gold)] font-serif font-bold text-sm tracking-wide leading-tight">
                            {punjabi}
                          </p>
                          <h3 className="font-serif font-bold text-lg text-[var(--color-brown)] group-hover/card:text-[#F97316] transition-colors leading-snug line-clamp-1 mt-0.5" title={item.name}>
                            {item.name}
                          </h3>

                          {/* Footer with pieces and portion info */}
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
