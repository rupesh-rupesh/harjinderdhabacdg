import Testimonials from './components/Testimonials.tsx';
import BanquetSection from './components/BanquetSection.tsx';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { DevEmptyStateText } from './components/DevEmptyStateText';
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Truck, Coffee, Utensils, Star, ArrowRight, ArrowLeft, Instagram, Facebook, Menu, X, ShoppingBag, BookOpen, ShoppingCart, Minus, Plus, Trash2, Search, Layers, Image as ImageIcon, TrendingUp, Flame, Lock, ChevronRight, ChefHat, MessageCircle, Navigation, Info, CheckCircle2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { generatePdfMenu } from './utils/generatePdfMenu';

import * as Icons from 'lucide-react';
import { NoodleBowlIcon } from './components/CustomIcons';

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

  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  return <IconComponent className={`${cleanClassName} ${colorClass}`.trim()} />;
};

const DietaryBadge = ({ type }: { type?: string }) => {
  const isVeg = type?.toLowerCase() === 'veg' || type?.toLowerCase() === 'vegetarian';
  return (
    <div className={`w-4 h-4 flex shrink-0 items-center justify-center border-2 rounded-sm ${isVeg ? 'border-green-600' : 'border-red-600'} bg-white`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
    </div>
  );
};

import CheckoutView from './components/CheckoutView';
import MenuView from './components/MenuView';
import OrderView from './components/OrderView';

type CartItem = {
  name: string;
  price: string;
  numericPrice: number;
  quantity: number;
  image: string;
  category?: string;
  isHalf?: boolean;
  isButter?: boolean;
  variantName?: string;
};

const staticJourneySettings = {
  header: 'Our Journey',
  description: 'Since 1991, Harjinder Tourist Dhaba has been serving authentic Punjabi hospitality on the Kharar–Kurali Highway.\n\nWhat started as a humble roadside dhaba with a passion for honest food has grown into a trusted stop for travelers, families, students, and food lovers. For over three decades, we\'ve remained committed to the same values—fresh ingredients, traditional recipes, generous portions, and warm hospitality.\n\nEvery meal we serve carries the rich flavors of Punjab, crafted with care and the belief that great food brings people together. Whether you\'re beginning a journey, taking a break, or returning home, Harjinder Tourist Dhaba is always ready to welcome you with a delicious meal and a smile.',
  signature: 'Harjinder Tourist Dhaba',
  subSignature: 'Serving Memories Since 1991.'
};

const staticJourneyMedia = [
  { id: 1, type: 'image', url: '/1.webp', caption: 'our journey since 1991' },
  { id: 2, type: 'image', url: '/2.webp', caption: 'our journey since 1991' },
  { id: 3, type: 'image', url: '/3.webp', caption: 'our journey since 1991' },
  { id: 4, type: 'image', url: '/4.webp', caption: 'our journey since 1991' }
];

const staticHeroMedia = [
  { id: 1, type: 'image', url: '/hero-bg.webp' },
  { id: 2, type: 'image', url: '/herobg2.webp' },
];

const BackgroundVideo = ({ src }: { src: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const isYouTube = src && (src.includes('youtube.com') || src.includes('youtu.be'));
  const isImage = src && src.trim().match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?(#.*)?$/i) != null;

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = isYouTube ? getYoutubeId(src) : null;

  useEffect(() => {
    if (isYouTube || isImage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => { });
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, isYouTube, isImage]);

  if (!src || src.trim() === '') return null;

  if (isYouTube && ytId) {
    return (
      <iframe
        className="absolute top-1/2 left-1/2 w-[150%] h-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
        title="Background Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
      ></iframe>
    );
  }

  if (isImage) {
    return (
      <img
        src={src || undefined}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 pointer-events-none"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 transition-opacity duration-1000 pointer-events-none"
      onLoadedData={(e) => {
        e.currentTarget.classList.remove('opacity-0');
        e.currentTarget.classList.add('opacity-100');
        e.currentTarget.play().catch(() => { });
      }}
    >
      <source src={src || undefined} type="video/mp4" />
    </video>
  );
};

export default function Storefront() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [features, setFeatures] = useState<any[]>([]);
  const newsTickers = [
    { text: 'SPL DAL MAKHNI' },
    { text: 'PANEER BUTTER MASALA' },
    { text: 'MALAI KOPTA' },
    { text: "DON'T WASTE FOOD" },
    { text: 'MUSHROOM' },
    { text: 'DHABA SPL GUD TEA' },
    { text: 'DHABA SPL DELUX THALI' },
    { text: 'MAKKI DI ROTI SARSON DA SAAG (Seasonal)' },
    { text: 'MILK FOR BABY -FREE' },
  ];
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [variantQuantity, setVariantQuantity] = useState<number>(1);
  useEffect(() => {
    if (selectedItemDetail) {
      if (selectedItemDetail.variants && selectedItemDetail.variants.length > 0) {
        const firstAvailable = selectedItemDetail.variants.findIndex((v: any) => !v.outOfStock);
        setSelectedVariantIdx(firstAvailable !== -1 ? firstAvailable : 0);
      } else {
        setSelectedVariantIdx(0);
      }
      setVariantQuantity(1);
    }
  }, [selectedItemDetail]);
  const [currentView, setCurrentView] = useState<'home' | 'order' | 'menu' | 'checkout'>('home');
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (currentView !== 'home') {
      setActiveSection(currentView);
    } else if (activeSection === 'menu' || activeSection === 'order' || activeSection === 'checkout') {
      setActiveSection('home');
    }
  }, [currentView]);

  useEffect(() => {
    if (selectedItemDetail || isCartOpen || currentView === 'checkout') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedItemDetail, isCartOpen, currentView]);
  const [orderViewStatus, setOrderViewStatus] = useState<'categories' | 'items'>('categories');
  const [orderCategory, setOrderCategory] = useState('All');

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [specials, setSpecials] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentJourneyIndex, setCurrentJourneyIndex] = useState(0);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllSpecials, setShowAllSpecials] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (!menuItems || menuItems.length === 0) {
      toast.error('Menu data is not loaded yet. Please try again.');
      return;
    }
    
    setIsGeneratingPdf(true);
    const loadingToast = toast.loading('Generating PDF Menu... Please wait.');
    
    try {
      await generatePdfMenu(menuItems);
      toast.success('Menu PDF downloaded successfully!', { id: loadingToast });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    const safeFetch = async (url: string, retries = 3, delay = 1000): Promise<any> => {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          if (retries > 0) {
            await new Promise(r => setTimeout(r, delay));
            return safeFetch(url, retries - 1, delay * 2);
          }
        }
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await res.json();
        }
        const text = await res.text();
        if (text.includes('Rate exceeded') && retries > 0) {
          await new Promise(r => setTimeout(r, delay));
          return safeFetch(url, retries - 1, delay * 2);
        }
        console.error('Non-JSON response from', url, ':', text);
        return { error: 'HTTP ' + res.status + ': ' + text };
      } catch (err: any) {
        if (err.message !== 'Failed to fetch') {
          console.error('Fetch error from', url, ':', err);
        }
        return { error: 'Fetch error: ' + err.message };
      }
    };

    safeFetch('/api/storefront-data').then((data) => {
      if (data && data.error) {
        setApiError(data.error);
      } else if (data && data.menuItems) {
        setMenuItems(data.menuItems || []);
        setSpecials(data.menuItems ? data.menuItems.filter((i: any) => i.isDhabaSpecial) : []);
        setDbCategories(data.categories || []);
        setFeatures(data.features || []);
      } else if (!data || data.length === 0) {
        setApiError("Received empty response from API");
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setApiError(err.message || "Failed to load data");
      setIsLoading(false);
    });

  }, []);

  useEffect(() => {
    if (staticJourneyMedia.length > 0) {
      const interval = setInterval(() => {
        setCurrentJourneyIndex(prev => (prev + 1) % staticJourneyMedia.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (staticHeroMedia.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex(prev => (prev + 1) % staticHeroMedia.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const addToCart = (item: any) => {
    toast.success(`${item.name} added to cart!`);
    setCartItems(prev => {
      const cartId = `${item.name}-${item.isHalf ? 'half' : 'full'}-${item.isButter ? 'butter' : 'nobutter'}${item.variantName ? '-' + item.variantName : ''}`;
      const existing = prev.find(i => `${i.name}-${i.isHalf ? 'half' : 'full'}-${i.isButter ? 'butter' : 'nobutter'}${i.variantName ? '-' + i.variantName : ''}` === cartId);
      if (existing) {
        return prev.map(i => `${i.name}-${i.isHalf ? 'half' : 'full'}-${i.isButter ? 'butter' : 'nobutter'}${i.variantName ? '-' + i.variantName : ''}` === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }

      let finalPrice = item.isHalf ? item.halfPrice : item.price;
      if (item.isButter && item.butterPrice) {
        finalPrice += item.butterPrice;
      }
      if (item.variantName && item.variantPrice) {
        finalPrice = item.variantPrice;
      }

      return [...prev, {
        name: item.name,
        price: `₹${finalPrice}`,
        numericPrice: finalPrice,
        quantity: 1,
        image: item.image,
        isHalf: item.isHalf,
        isButter: item.isButter,
        variantName: item.variantName
      }];
    });
  };

  const removeFromCart = (name: string, isHalf: boolean = false, isButter: boolean = false, variantName?: string) => {
    setCartItems(prev => prev.filter(i => !(`${i.name}-${i.isHalf ? 'half' : 'full'}-${i.isButter ? 'butter' : 'nobutter'}${i.variantName ? '-' + i.variantName : ''}` === `${name}-${isHalf ? 'half' : 'full'}-${isButter ? 'butter' : 'nobutter'}${variantName ? '-' + variantName : ''}`)));
  };

  const updateQuantity = (name: string, isHalf: boolean, isButter: boolean, delta: number, variantName?: string) => {
    setCartItems(prev => {
      const updated = prev.map(i => {
        if (`${i.name}-${i.isHalf ? 'half' : 'full'}-${i.isButter ? 'butter' : 'nobutter'}${i.variantName ? '-' + i.variantName : ''}` === `${name}-${isHalf ? 'half' : 'full'}-${isButter ? 'butter' : 'nobutter'}${variantName ? '-' + variantName : ''}`) {
          return { ...i, quantity: i.quantity + delta };
        }
        return i;
      });
      return updated.filter(i => i.quantity > 0);
    });
  };


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
    return `Available tomorrow at ${item.startTime || 'later'}`;
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

  const categories = ['All', ...Array.from(new Set(menuItems.filter(item => item.isPopular || item.isBestSeller).map(item => item.category)))];
  const allCategories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenu = menuItems.filter(item => {
    const isPopularOrBest = item.isPopular || item.isBestSeller;
    if (!isPopularOrBest) return false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const orderMenuFiltered = menuItems.filter(item => {
    const matchesCategory = orderCategory === 'All' || item.category === orderCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const getQuantity = (item: any) => {
    const cartItem = cartItems.find(c => c.name === item.name && (c.isHalf || false) === (item.isHalf || false) && (c.isButter || false) === (item.isButter || false));
    return cartItem ? cartItem.quantity : 0;
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.numericPrice * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-[100dvh] bg-[#fbf5eb] text-[var(--color-brown)] font-sans selection:bg-dhaba-orange selection:text-white flex flex-col ${cartCount > 0 && currentView !== 'checkout' ? 'pb-20 sm:pb-24' : ''}`}>
      <style>{`
        @keyframes progressX {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      {currentView === 'home' ? (
        <>
          {/* Navigation */}
          <nav aria-label="Main navigation" className="fixed w-full z-50 transition-all duration-500" style={{ background: 'rgba(36,23,18,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 32px rgba(0,0,0,0.25)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex justify-between items-center h-16 sm:h-18">
                {/* Left Side: Mobile Button + Brand Logo */}
                <div className="flex items-center space-x-3 flex-1">
                  {/* Mobile Menu Button */}
                  <div className="xl:hidden flex items-center">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="text-stone-300 hover:text-white focus:outline-none p-1.5 rounded-md hover:bg-stone-800 transition-colors"
                      aria-label="Toggle menu"
                    >
                      {isMobileMenuOpen ? <X className="h-6 w-6 text-[var(--color-gold)]" /> : <Menu className="h-6 w-6 text-[var(--color-gold)]" />}
                    </button>
                  </div>

                  {/* Desktop Logo — left side, xl+ only */}
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hidden xl:flex items-center gap-2 group select-none"
                  >
                    {/* Decorative khanda-inspired vertical divider */}
                    <span className="flex flex-col items-center justify-center gap-[3px] mr-1">
                      <span className="block w-[2px] h-3 bg-[var(--color-gold)] opacity-70 rounded-full"></span>
                      <span className="block w-[5px] h-[5px] rounded-full bg-[var(--color-gold)]"></span>
                      <span className="block w-[2px] h-3 bg-[var(--color-gold)] opacity-70 rounded-full"></span>
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-serif font-bold text-white text-lg tracking-wide group-hover:text-[var(--color-gold)] transition-colors duration-300">
                        <span className="text-[var(--color-gold)]">Harjinder</span> Tourist Dhaba
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-medium group-hover:text-stone-300 transition-colors duration-300">
                        Since 1991 · Kharar–Kurali Highway
                      </span>
                    </div>
                  </a>

                  {/* Logo (centered on tablet and mobile, hidden on desktop where nav menu is centered) */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex-shrink-0 flex items-center whitespace-nowrap xl:hidden">
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-white hover:text-[var(--color-gold)] transition-colors duration-300">
                      <span className="text-[var(--color-gold)]">H</span>arjinder <span className="text-stone-300 font-light hidden sm:inline text-lg md:text-2xl">Tourist Dhaba</span>
                      <span className="text-stone-300 font-light sm:hidden text-base">Dhaba</span>
                    </a>
                  </div>
                </div>


                {/* Centered Desktop Menu */}
                <div className="hidden xl:flex absolute left-1/2 transform -translate-x-1/2 space-x-2 items-center">
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('home'); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[var(--color-gold)] after:rounded-full after:transition-all after:duration-300 hover:text-[var(--color-gold)] hover:after:w-1/2 ${activeSection === 'home' ? 'text-[var(--color-gold)] after:w-1/2' : 'text-stone-300 after:w-0'}`}>Home</a>
                  <a href="#specials" onClick={(e) => { e.preventDefault(); setActiveSection('specials'); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' }); } }} className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[var(--color-gold)] after:rounded-full after:transition-all after:duration-300 hover:text-[var(--color-gold)] hover:after:w-1/2 ${activeSection === 'specials' ? 'text-[var(--color-gold)] after:w-1/2' : 'text-stone-300 after:w-0'}`}>Dhaba Specials</a>
                  <button onClick={(e) => { e.preventDefault(); setActiveSection('menu'); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[var(--color-gold)] after:rounded-full after:transition-all after:duration-300 hover:text-[var(--color-gold)] hover:after:w-1/2 ${activeSection === 'menu' ? 'text-[var(--color-gold)] after:w-1/2' : 'text-stone-300 after:w-0'}`}>Menu</button>
                  <a href="#banquet" onClick={(e) => { e.preventDefault(); setActiveSection('banquet'); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('banquet')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('banquet')?.scrollIntoView({ behavior: 'smooth' }); } }} className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[var(--color-gold)] after:rounded-full after:transition-all after:duration-300 hover:text-[var(--color-gold)] hover:after:w-1/2 ${activeSection === 'banquet' ? 'text-[var(--color-gold)] after:w-1/2' : 'text-stone-300 after:w-0'}`}>Party & Events</a>
                  <a href="#about" onClick={(e) => { e.preventDefault(); setActiveSection('about'); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); } }} className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-[var(--color-gold)] after:rounded-full after:transition-all after:duration-300 hover:text-[var(--color-gold)] hover:after:w-1/2 ${activeSection === 'about' ? 'text-[var(--color-gold)] after:w-1/2' : 'text-stone-300 after:w-0'}`}>About Us</a>
                </div>

                <div className="flex items-center justify-end flex-1 space-x-2 md:space-x-4">
                  <div className="hidden xl:block">
                    <a
                      href="https://zoma.to/r/22202855"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-dhaba-orange hover:bg-dhaba-orange-light text-white px-5 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-dhaba-orange/30 active:translate-y-0"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Online</span>
                    </a>
                  </div>

                  {/* Cart Icon */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-stone-300 hover:text-[var(--color-gold)] transition-colors duration-300 group focus:outline-none"
                    aria-label="View Cart"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transform scale-100 group-hover:scale-110 transition-transform shadow-md border border-dhaba-dark">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu was here */}
          </nav>

          {/* Mobile Menu Sidebar Drawer */}
          <div className={`fixed inset-0 z-[110] xl:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-[#16100B] shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6 pb-8 flex justify-between items-start border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-black/40 to-transparent">
                {/* Subtle gold glow */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[#b38827] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--color-gold)]/20 p-[2px]">
                    <div className="w-full h-full bg-[#16100B] rounded-[14px] flex items-center justify-center">
                      <span className="font-serif font-extrabold text-[var(--color-gold)] text-xl">H</span>
                    </div>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-xl font-black font-serif text-white tracking-widest leading-none">HARJINDER</span>
                    <span className="text-[10px] font-bold text-[var(--color-gold)] tracking-[0.25em] uppercase mt-2 opacity-90">Tourist Dhaba</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-full bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none border border-white/10 backdrop-blur-md relative z-10 active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2 relative" data-lenis-prevent="true">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 bg-[url('/pattern.png')] bg-repeat pointer-events-none"></div>

                <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setActiveSection('home'); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden z-10 ${activeSection === 'home' ? 'text-[var(--color-gold)] bg-white/10 shadow-lg border border-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  {activeSection === 'home' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[var(--color-gold)] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                  <span className={`text-lg tracking-wide transition-all duration-300 ${activeSection === 'home' ? 'pl-2 font-bold' : 'group-hover:pl-2'}`}>Home</span>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${activeSection === 'home' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </a>
                <a href="#specials" onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  setActiveSection('specials');
                  if (currentView !== 'home') {
                    e.preventDefault();
                    setCurrentView('home');
                    setTimeout(() => document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  } else {
                    document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} className={`flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden z-10 ${activeSection === 'specials' ? 'text-[var(--color-gold)] bg-white/10 shadow-lg border border-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  {activeSection === 'specials' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[var(--color-gold)] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                  <span className={`text-lg tracking-wide transition-all duration-300 ${activeSection === 'specials' ? 'pl-2 font-bold' : 'group-hover:pl-2'}`}>Dhaba Specials</span>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${activeSection === 'specials' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </a>
                <button onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setActiveSection('menu'); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full text-left flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden z-10 ${activeSection === 'menu' ? 'text-[var(--color-gold)] bg-white/10 shadow-lg border border-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  {activeSection === 'menu' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[var(--color-gold)] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                  <span className={`text-lg tracking-wide transition-all duration-300 ${activeSection === 'menu' ? 'pl-2 font-bold' : 'group-hover:pl-2'}`}>Menu</span>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${activeSection === 'menu' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </button>
                <a href="#banquet" onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  setActiveSection('banquet');
                  if (currentView !== 'home') {
                    e.preventDefault();
                    setCurrentView('home');
                    setTimeout(() => document.getElementById('banquet')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  } else {
                    document.getElementById('banquet')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} className={`flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden z-10 ${activeSection === 'banquet' ? 'text-[var(--color-gold)] bg-white/10 shadow-lg border border-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  {activeSection === 'banquet' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[var(--color-gold)] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                  <span className={`text-lg tracking-wide transition-all duration-300 ${activeSection === 'banquet' ? 'pl-2 font-bold' : 'group-hover:pl-2'}`}>Party & Events</span>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${activeSection === 'banquet' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </a>
                <a href="#about" onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  setActiveSection('about');
                  if (currentView !== 'home') {
                    e.preventDefault();
                    setCurrentView('home');
                    setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  } else {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} className={`flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden z-10 ${activeSection === 'about' ? 'text-[var(--color-gold)] bg-white/10 shadow-lg border border-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  {activeSection === 'about' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[var(--color-gold)] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                  <span className={`text-lg tracking-wide transition-all duration-300 ${activeSection === 'about' ? 'pl-2 font-bold' : 'group-hover:pl-2'}`}>About Us</span>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${activeSection === 'about' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </a>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/40 relative z-10 backdrop-blur-md">
                <a
                  href="https://zoma.to/r/22202855"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[#b38827] hover:from-[#E6B355] hover:to-[var(--color-gold)] text-white px-4 py-4 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg shadow-[var(--color-gold)]/20 active:scale-95 mb-2 border border-white/10"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" /> Order Online
                </a>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <section id="home" className="relative min-h-[100dvh] flex items-center justify-center pt-16 pb-12 overflow-hidden">
            {/* Animated Hero Background */}
            <div className="absolute inset-0 z-0 bg-stone-900">
              {staticHeroMedia.map((media, index) => (
                <img
                  key={media.id}
                  src={media.url}
                  alt="Harjinder Tourist Dhaba"
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear ${index === currentHeroIndex ? 'opacity-100 z-10 scale-110' : 'opacity-0 z-0 pointer-events-none scale-100'}`}
                />
              ))}
              
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(36,23,18,0.92) 0%, rgba(36,23,18,0.55) 45%, rgba(36,23,18,0.96) 100%)' }} />
              
              {/* Decorative grain */}
              <div className="absolute inset-0 z-10 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")', backgroundSize: '180px 180px' }} />

              {/* Pill-shaped Floating Progress Bar */}
              <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-70">
                <div className="flex items-center gap-2 px-3 py-2 bg-black/10 backdrop-blur-md rounded-full border border-white/10">
                  {staticHeroMedia.map((_, i) => {
                    const isActive = i === currentHeroIndex;
                    return (
                      <div 
                        key={i} 
                        className={`relative rounded-full transition-all duration-500 overflow-hidden ${
                          isActive ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                        }`}
                      >
                        {isActive && (
                          <div 
                            key={`active-hero-${Date.now()}`}
                            className="absolute inset-y-0 left-0 bg-[var(--color-gold)] origin-left rounded-full"
                            style={{
                              width: '100%',
                              transform: 'scaleX(0)',
                              animation: 'progressX 5s linear forwards'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative z-20 text-center px-5 sm:px-8 py-12 sm:py-16 max-w-4xl mx-auto w-full" style={{ marginTop: '5rem' }}>
              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 sm:w-12" style={{ background: 'linear-gradient(90deg, transparent, #C89B3C)' }} />
                <span className="font-semibold tracking-[0.22em] uppercase text-xs sm:text-sm" style={{ color: '#C89B3C' }}>Welcome to the Highway Legend</span>
                <div className="h-px w-8 sm:w-12" style={{ background: 'linear-gradient(90deg, #C89B3C, transparent)' }} />
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-[1.1] drop-shadow-xl">
                <span className="sr-only">Harjinder Tourist Dhaba - The Best Family Dhaba for Veg & Non-Veg Food in Kharar, Mohali</span>
                The True Taste of{' '}<br className="hidden sm:block" />
                <span style={{ background: 'linear-gradient(135deg, #C89B3C, #e8bb5c, #C89B3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Punjab</span>
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-stone-300 mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed px-2">
                Stop by for a piping hot meal, rich with desi ghee and traditional spices. Serving travelers and families with love and authenticity since 1991.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                <a
                  href="#order"
                  onClick={(e) => { e.preventDefault(); setCurrentView('order'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="btn-gold w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center group"
                >
                  Order Now
                  <ShoppingBag className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <button
                  onClick={() => { setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center group transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}
                >
                  View Menu
                  <BookOpen className="ml-2 w-5 h-5 group-hover:text-[var(--color-gold)] transition-colors duration-300" />
                </button>
              </div>
            </div>
          </section>

          {/* News Ticker */}
          {newsTickers && newsTickers.length > 0 && (
            <div className="relative z-30 bg-dhaba-orange border-y border-[rgba(255,255,255,0.1)] py-3 overflow-hidden flex items-center shadow-lg -mt-6">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-dhaba-orange to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-dhaba-orange to-transparent z-10 pointer-events-none"></div>
              <div className="flex w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-8 px-4">
                    {newsTickers.map((ticker, idx) => (
                      <React.Fragment key={`${i}-${idx}`}>
                        <span className="text-white font-medium tracking-wide flex items-center gap-2 text-sm sm:text-base">
                          <Flame className="w-4 h-4 text-yellow-300" />
                          {ticker.text}
                        </span>
                        {idx < newsTickers.length - 1 && (
                          <span className="text-white/30">•</span>
                        )}
                      </React.Fragment>
                    ))}
                    <span className="text-white/30">•</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Our Specials (Responsive Grid/Scroll) */}
          <section id="specials" className="relative z-20 -mt-12 pt-24 pb-12 bg-[var(--color-ivory)] border-b border-stone-200/50 overflow-hidden rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
              <div className={`${!showAllSpecials ? 'flex overflow-x-auto snap-x snap-mandatory pb-12' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-4'} gap-6 lg:gap-8 pt-4 w-full hide-scrollbar scroll-smooth`} data-lenis-prevent="true">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className={`${!showAllSpecials ? 'flex-none w-[280px] sm:w-[320px] md:w-[340px]' : 'w-full'} relative bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden flex flex-col animate-pulse`}>
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
                      <div key={idx} onClick={() => !locked && setSelectedItemDetail(item)} className={`${!showAllSpecials ? 'flex-none w-[280px] sm:w-[320px] md:w-[340px] snap-start' : 'w-full'} group relative bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-stone-100/80 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 flex flex-col cursor-pointer ${locked ? 'opacity-80 grayscale-[50%] cursor-not-allowed' : ''}`}>
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
                              <DietaryBadge type={item.dietaryPreference} />
                              {/* Tooltip */}
                              <div className="absolute right-0 top-full mt-2 w-64 bg-white text-[var(--color-brown)] p-4 rounded-xl shadow-xl text-xs opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 pointer-events-none transform origin-top-right scale-95 group-hover/tooltip:scale-100 border border-stone-100 text-left">
                                <p className="font-bold mb-1 text-sm">{item.dietaryPreference}</p>
                                <p className="text-[#5A4A42] leading-relaxed">This item is prepared according to strict {item.dietaryPreference.toLowerCase()} guidelines.</p>
                              </div>
                            </div>
                          </div>
                          {item.image ? (
                            <>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                              />
                              <div className="absolute bottom-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white cursor-help group/info z-30 transition-colors shadow-sm">
                                <Info className="w-4 h-4" />
                                <div className="absolute left-0 bottom-full mb-2 w-48 bg-stone-900 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 pointer-events-none border border-white/10 z-40 text-left leading-tight">
                                  Product representation only. Our freshly prepared dishes look and taste even better in person.
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 ease-in-out">
                              <DynamicIcon name={getItemFallbackIcon(item.category)} className="w-16 h-16 text-stone-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                            <span className={`bg-white/90 backdrop-blur-md text-[var(--color-brown)] text-xs font-bold tracking-wider px-3 py-1.5 rounded-lg shadow-sm ${locked ? 'line-through text-stone-500' : ''}`}>
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
                              className={`w-full bg-[var(--color-ivory)] hover:bg-[var(--color-brown)] border border-[var(--color-gold)]/20 hover:border-transparent text-[var(--color-brown)] hover:text-[var(--color-gold)] font-semibold py-3 rounded-xl transition-all duration-500 flex items-center justify-center group/btn shadow-sm ${locked ? 'opacity-50 cursor-not-allowed hover:bg-[var(--color-ivory)] hover:text-[var(--color-brown)] hover:border-[var(--color-gold)]/20' : ''}`}
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
                    <h3 className="text-xl font-bold text-[var(--color-brown)] mb-2">{apiError ? `Error: ${apiError}` : "Our menu is being prepared"}</h3>
                    <p className="text-[#5A4A42]">Check back soon for our delicious offerings.</p>
                  </div>
                )}
              </div>
              {specials.length > 0 && (
                <div className="mt-4 mb-4 flex justify-center w-full">
                  <button
                    onClick={() => setShowAllSpecials(!showAllSpecials)}
                    className="bg-transparent border border-[var(--color-gold)] text-[var(--color-brown)] hover:bg-[var(--color-gold)] hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {showAllSpecials ? 'Show Less' : 'View All Specials'}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Popular & Best Sellers */}
          <section id="menu" className="pt-16 pb-16 md:pt-20 md:pb-24 text-[var(--color-brown)] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 md:gap-0">
                <div className="max-w-2xl">
                  <span className="text-[var(--color-gold)] font-semibold tracking-[0.2em] uppercase text-sm mb-4 block drop-shadow-sm">
                    Crowd Favorites
                  </span>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--color-brown)]">Popular & Best Sellers</h2>
                  <p className="text-stone-600 text-base sm:text-lg font-medium leading-relaxed">Our most loved dishes, handpicked by our regular patrons.</p>
                </div>
              </div>

              <div className="mb-12 flex flex-col gap-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm ${selectedCategory === cat
                        ? 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 text-white border-transparent shadow-[0_10px_20px_rgba(200,155,60,0.2)] transform scale-105'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-[var(--color-brown)] hover:border-[var(--color-gold)]/50'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={selectedCategory === 'All' ? "Search menu..." : `Search in ${selectedCategory}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-stone-200 rounded-full focus:ring-2 focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)] outline-none text-[var(--color-brown)] placeholder-stone-400 transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {isLoading ? (
                  [1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="relative overflow-hidden rounded-[2rem] bg-white border border-stone-100 flex flex-col h-[420px] animate-pulse shadow-sm">
                      <div className="w-full h-56 bg-stone-200 shrink-0"></div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="h-6 bg-stone-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                        <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center">
                          <div className="h-4 bg-stone-200 rounded w-16"></div>
                          <div className="h-10 bg-stone-200 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredMenu.length > 0 ? (
                  filteredMenu.map((item, idx) => (
                    <div key={idx} onClick={() => setSelectedItemDetail(item)} className="group relative overflow-hidden rounded-[2rem] bg-white flex flex-col h-full transition-all duration-500 shadow-sm hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.12)] transform hover:-translate-y-1 cursor-pointer z-10 hover:z-20 border border-stone-100/80 hover:border-stone-200">

                      {/* Image Top */}
                      <div className="w-full h-56 relative overflow-hidden bg-stone-50 shrink-0">
                        <div className="absolute top-4 left-4 z-20 flex gap-2 group/tooltip">
                          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-sm flex items-center justify-center cursor-help border border-stone-100">
                            <DietaryBadge type={item.dietaryPreference} />
                          </div>
                        </div>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                            <ChefHat className="w-16 h-16 text-stone-200" />
                          </div>
                        )}
                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] pointer-events-none"></div>

                        {/* Tags on Image */}
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
                          {item.isBestSeller && (
                            <span className="bg-white/95 backdrop-blur-md text-[var(--color-gold)] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-[var(--color-gold)]/20 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Bestseller
                            </span>
                          )}
                          {item.spiceLevel && item.spiceLevel !== 'None' && (
                            <span className="bg-white/95 backdrop-blur-md text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-red-500/20 flex items-center gap-1">
                              🔥 Spicy
                            </span>
                          )}
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute bottom-3 right-3 z-20 transition-transform duration-500 group-hover:-translate-y-1">
                          <span className="bg-white/95 backdrop-blur-md text-[var(--color-brown)] font-black text-lg px-4 py-1.5 rounded-xl shadow-md border border-white flex items-center gap-1">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>

                      {/* Content Bottom */}
                      <div className="p-6 flex flex-col flex-grow bg-white">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="bg-stone-50 text-[var(--color-brown)] text-[10px] font-bold px-3 py-1.5 rounded-lg border border-stone-200 uppercase tracking-widest transition-colors group-hover:bg-[#fcfaf5] group-hover:border-[var(--color-gold)]/30">
                            {item.category}
                          </span>
                          {item.fullPortionPieces && (
                            <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">{item.fullPortionPieces} Pieces</span>
                          )}
                          {item.isDhabaSpecial && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                              Special
                            </span>
                          )}
                          {item.isWithoutButter && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                              No Butter
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold font-serif text-[#3a2e28] leading-tight mb-2 transition-colors line-clamp-1 group-hover:text-amber-900" title={item.name}>{item.name}</h3>
                        <p className="text-[#6b5a52] text-sm leading-relaxed mb-5 flex-grow line-clamp-2 font-light">{item.description}</p>

                        {/* Action Footer */}
                        <div className="mt-auto pt-4 border-t border-stone-100 transition-colors group-hover:border-[var(--color-gold)]/10">
                          <div className="w-full">
                            {(item.hasHalfPortion || item.hasButterOption) ? (
                              <button
                                onClick={() => setSelectedItemDetail(item)}
                                className="w-full bg-[var(--color-ivory)] hover:bg-[var(--color-brown)] border border-[var(--color-gold)]/20 hover:border-transparent text-[var(--color-brown)] hover:text-[var(--color-gold)] font-semibold py-3 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-sm group/btn"
                              >
                                <span>Add to Order</span>
                                <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            ) : (
                              getQuantity(item) === 0 ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}
                                  className="w-full bg-[var(--color-ivory)] hover:bg-[var(--color-brown)] border border-[var(--color-gold)]/20 hover:border-transparent text-[var(--color-brown)] hover:text-[var(--color-gold)] font-semibold py-3 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-sm group/btn"
                                >
                                  <span>Add to Order</span>
                                  <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              ) : (
                                <div className="flex items-center justify-between bg-dhaba-orange text-white rounded-xl overflow-hidden shadow-sm h-[48px] w-full animate-in fade-in zoom-in-75 duration-300">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1, item.variantName); }}
                                    className="h-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center flex-1"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-bold text-center text-lg flex-[2]">{getQuantity(item)}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1, item.variantName); }}
                                    className="h-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center flex-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-2 text-center py-16">
                    <p className="text-stone-400 text-lg">
                      {searchQuery || selectedCategory !== 'All'
                        ? "We searched every corner of our kitchen, but couldn't find that dish. 😞"
                        : "Menu items coming soon..."}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-12 text-center border-t border-white/10 pt-6">
                <p className="text-stone-400 text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 flex-wrap">
                  <span>Every dish takes 15-20 minutes to serve</span>
                  <span className="hidden sm:inline">|</span>
                  <span>GST Extra</span>
                  <span className="hidden sm:inline">|</span>
                  <span>Please don't waste the food</span>
                </p>
              </div>
            </div>
          </section>

          {/* Features/Amenities */}
          <section id="features" className="py-16 md:py-24 text-[var(--color-brown)] relative z-10">
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
                          <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500 shadow-sm ${hasVideo ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-[var(--color-ivory)] border border-[var(--color-gold)]/20'}`}>
                            <DynamicIcon name={feature.iconName} className={`w-10 h-10 ${hasVideo ? 'text-[var(--color-gold)]' : 'text-[var(--color-gold)]'}`} />
                          </div>
                          <h3 className={`text-2xl font-serif font-bold mb-4 ${hasVideo ? 'text-white' : 'text-[var(--color-brown)]'}`}>{feature.title}</h3>
                          <p className={`leading-relaxed ${hasVideo ? 'text-white/80' : 'text-[#5A4A42]'}`}>{feature.description}</p>
                        </div>
                      </div>
                    );
                  })
                ) : null}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-24 md:py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className="lg:w-5/12 w-full relative group perspective-1000">
                  {/* Decorative Elements */}
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-[var(--color-gold)]/10 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[var(--color-brown)]/10 rounded-full blur-3xl" />

                  {/* Glowing Animated Backdrop */}
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-[var(--color-gold)] to-[#E6B355] opacity-20 blur-[40px] group-hover:opacity-40 group-hover:blur-[50px] transition-all duration-700 mt-4"></div>

                  <div className="relative w-full aspect-[4/5] sm:h-[600px] rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-2xl group-hover:shadow-[0_20px_50px_rgba(212,175,55,0.3)] transition-all duration-700 z-10 bg-stone-900 group-hover:-translate-y-2 sm:group-hover:rotate-1">
                    {/* Inner gold border */}
                    <div className="absolute inset-3 border border-[var(--color-gold)]/50 rounded-[2rem] z-20 pointer-events-none transition-all duration-700 group-hover:scale-[0.98]" />

                    {staticJourneyMedia.length > 0 ? (
                      staticJourneyMedia.map((media, index) => (
                        media.type === 'video' ? (
                          <video
                            key={media.id}
                            src={media.url || undefined}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentJourneyIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                            autoPlay muted loop playsInline
                          />
                        ) : (
                          <img
                            key={media.id}
                            src={media.url || undefined}
                            alt={`Harjinder Tourist Dhaba — ${media.caption || 'our journey since 1991'}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear ${index === currentJourneyIndex ? 'opacity-100 z-10 scale-110' : 'opacity-0 z-0 pointer-events-none scale-100'}`}
                          />
                        )
                      ))
                    ) : (
                      <img
                        src=""
                        alt="Harjinder Tourist Dhaba"
                        className="absolute inset-0 w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-1000"
                      />
                    )}

                    {/* Overlay gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none" />

                    {/* Pill-shaped Floating Progress Bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-70">
                      <div className="flex items-center gap-2 px-3 py-2 bg-black/10 backdrop-blur-md rounded-full border border-white/10">
                        {staticJourneyMedia.map((_, i) => {
                          const isActive = i === currentJourneyIndex;
                          return (
                            <div 
                              key={i} 
                              className={`relative rounded-full transition-all duration-500 overflow-hidden ${
                                isActive ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                              }`}
                            >
                              {isActive && (
                                <div 
                                  key={`active-${Date.now()}`}
                                  className="absolute inset-y-0 left-0 bg-rose-500 origin-left rounded-full"
                                  style={{
                                    width: '100%',
                                    transform: 'scaleX(0)',
                                    animation: 'progressX 5s linear forwards'
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Gold "SINCE 1991" Badge Image */}
                  <div className="absolute -bottom-8 -right-4 sm:-right-8 z-30 w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center transform group-hover:scale-110 sm:group-hover:rotate-6 transition-all duration-700 drop-shadow-2xl">
                    <img
                      src="/since-1991.webp"
                      alt="Harjinder Tourist Dhaba — Serving Since 1991"
                      width="192"
                      height="192"
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                </div>

                <div className="lg:w-7/12 w-full mt-16 lg:mt-0 relative z-20">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-sm border border-stone-100 mb-8">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse" />
                    <span className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--color-gold)]">Our Journey</span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-[var(--color-brown)] mb-8 leading-[1.15] tracking-tight relative">
                    <span className="relative z-10">{staticJourneySettings.header}</span>
                    {/* Decorative text watermark behind */}
                    <span className="absolute -top-8 -left-8 text-7xl md:text-9xl font-serif font-black text-[var(--color-gold)]/5 select-none -z-10 whitespace-nowrap hidden sm:block pointer-events-none">1991</span>
                  </h2>

                  <div className="space-y-6 relative before:absolute before:inset-y-2 before:-left-6 before:w-1 before:bg-gradient-to-b before:from-[var(--color-gold)] before:to-transparent before:rounded-full ml-6">
                    {staticJourneySettings.description.split('\n').map((paragraph, idx) => paragraph.trim() ? (
                      <p key={idx} className={`leading-relaxed ${idx === 0 ? 'text-[var(--color-brown)] font-medium text-xl md:text-2xl' : 'text-[#5A4A42]/90 text-lg'}`}>
                        {paragraph}
                      </p>
                    ) : null)}
                  </div>

                  <div className="mt-12 flex items-center gap-5 pt-8 border-t border-stone-200/60">
                    <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[#b38827] flex items-center justify-center p-[3px] shadow-lg shadow-[var(--color-gold)]/20">
                      <div className="w-full h-full rounded-full border border-white/30 flex items-center justify-center bg-white overflow-hidden">
                        <img src="/Browser-tab.webp" alt="Harjinder Tourist Dhaba Logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[var(--color-brown)] text-2xl sm:text-3xl font-serif font-bold italic tracking-wide">
                        {staticJourneySettings.signature}
                      </p>
                      <span className="text-[var(--color-gold)] font-bold text-xs tracking-[0.2em] uppercase mt-1 block">{staticJourneySettings.subSignature}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <BanquetSection />
          <Testimonials />
          {/* Enhanced SEO Context Block */}
          <section className="relative bg-stone-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              {/* Text Content */}
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-[var(--color-gold)]/20 mb-6">
                  <Star className="w-4 h-4 text-[var(--color-gold)]" fill="currentColor" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-brown)]">Top Rated Destination</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-brown)] mb-6 leading-tight">
                  The Best Family Dhaba in <br/>
                  <span className="text-[var(--color-gold)] italic">Kharar, Mohali</span>
                </h2>
                
                <div className="space-y-6 text-stone-600 text-lg font-light leading-relaxed mb-8">
                  <p>
                    Welcome to <strong className="font-semibold text-stone-800">Harjinder Tourist Dhaba</strong>, the most loved family destination on the bustling Kharar–Kurali Highway. We are proud to serve the most authentic, affordable <strong className="font-semibold text-stone-800">veg and non-veg food</strong> in the region. 
                  </p>
                  <p>
                    We understand the importance of a clean, safe, and welcoming environment, making us the top choice for families traveling near <strong className="font-semibold text-stone-800">Mohali</strong> and Punjab.
                  </p>
                </div>

                {/* SEO Feature List */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Authentic Punjabi Cuisine", 
                    "Clean Family Environment", 
                    "Open 24 Hours, 7 Days", 
                    "Affordable Highway Dining"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-stone-700 font-medium bg-white p-3 rounded-xl shadow-sm border border-stone-100">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image & Stats Content */}
              <div className="order-1 lg:order-2 flex flex-col justify-center">
                <div className="relative pl-4 pb-4 sm:pl-8 sm:pb-8 mt-8 lg:mt-0">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 transform transition-transform duration-700 hover:-translate-y-2 hover:shadow-3xl">
                    <img 
                      src="/4.webp" 
                      alt="Harjinder Tourist Dhaba - Best Family Dhaba for Veg and Non-Veg Food" 
                      className="w-full h-full object-cover aspect-[4/3] scale-105 hover:scale-100 transition-transform duration-1000" 
                      loading="lazy" 
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent mix-blend-multiply transition-opacity duration-500 hover:opacity-80"></div>
                  </div>
                  
                  {/* Floating Glassmorphism Badge */}
                  <div className="absolute -bottom-2 left-0 sm:bottom-2 sm:-left-4 bg-white/70 backdrop-blur-xl p-4 pr-8 rounded-2xl shadow-2xl border border-white/60 flex items-center gap-4 transition-transform duration-500 hover:-translate-y-1 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-amber-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-brown)] text-lg leading-none mb-1">Always Open</h4>
                      <p className="text-sm text-stone-600 font-medium">Serving fresh food 24/7</p>
                    </div>
                  </div>
                  
                  {/* Decorative background shape */}
                  <div className="absolute top-6 right-0 bottom-12 left-12 bg-gradient-to-br from-[var(--color-gold)]/30 to-amber-600/10 rounded-[2rem] -z-10 transform translate-x-4 -translate-y-4 blur-sm transition-transform duration-700 hover:translate-x-6 hover:-translate-y-6"></div>
                </div>

                {/* Floating Stat Cards to fill space */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-8">
                  {/* Card 1: Daily Serves */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100 group-hover:bg-green-500 transition-colors duration-300">
                      <Utensils className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-2xl font-serif text-[var(--color-brown)] leading-none mb-1">5,000+</h4>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Serves Daily</p>
                    </div>
                  </div>

                  {/* Card 2: Rating */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 group-hover:bg-[var(--color-gold)] transition-colors duration-300">
                      <Star className="w-6 h-6 text-[var(--color-gold)] group-hover:text-white transition-colors duration-300" fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="font-bold text-2xl font-serif text-[var(--color-brown)] leading-none mb-1">4.1</h4>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Across Internet</p>
                    </div>
                  </div>

                  {/* Card 3: Legacy */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-500 transition-colors duration-300">
                      <Flame className="w-6 h-6 text-rose-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-2xl font-serif text-[var(--color-brown)] leading-none mb-1">33+ Years</h4>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Of Authentic Taste</p>
                    </div>
                  </div>

                  {/* Card 4: Customers */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
                      <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-2xl font-serif text-[var(--color-brown)] leading-none mb-1">1M+</h4>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Happy Customers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer & Contact */}
          <footer id="contact" className="text-stone-700 pt-24 border-t border-[var(--color-gold)]/30 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                <div className="lg:col-span-1">
                  <span className="font-serif text-2xl font-bold tracking-tight text-[var(--color-gold)] mb-6 block">
                    <span className="text-[var(--color-gold)]">H</span>arjinder <span className="text-stone-800 font-light">Dhaba</span>
                  </span>
                  <p className="mb-6 leading-relaxed">
                    The ultimate pitstop for authentic Punjabi cuisine. Serving fresh, hot, and hygienic food 24/7.
                  </p>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/share/1Jt8XKRJLV/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Facebook">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="https://www.instagram.com/harjinder_dhaba?igsh=YTV4MXFhdWszeTVq" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300" aria-label="Instagram">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="text-[var(--color-brown)] font-serif font-bold mb-8 text-2xl tracking-wide">Contact Us</h4>
                  <address>
                    <ul className="space-y-4 not-italic">
                      <li className="flex items-start">
                        <MapPin className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0 mt-0.5" />
                        <span>Kharar-Kurali-Village-Sahauran, Teh-Kharar,<br />NH-24, Opp. Indian Oil Petrol Bunk,<br />Kharar, MOHALI, Punjab 140103</span>
                      </li>
                      <li className="flex flex-col gap-2">
                        <div className="flex items-center">
                          <Phone className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0" />
                          <a href="tel:+919056655093" className="hover:text-[var(--color-gold)] transition-colors font-medium text-stone-800">
                            +91 90566 55093
                          </a>
                        </div>
                        <a
                          href="https://wa.me/919056655093?text=Hello%20Harjinder%20Dhaba%2C%20I%20have%20an%20inquiry"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-9 inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full border border-green-500/30 text-xs font-semibold transition-all w-fit"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                          Quick Chat on WhatsApp
                        </a>
                      </li>
                      <li className="flex items-center">
                        <Clock className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0" />
                        <span>Open 24 Hours, 7 Days a Week</span>
                      </li>
                    </ul>
                  </address>
                </div>

                <div>
                  <h4 className="text-[var(--color-brown)] font-serif font-bold mb-8 text-2xl tracking-wide">Quick Links</h4>
                  <ul className="space-y-3">
                    <li><a href="#about" onClick={(e) => { e.preventDefault(); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); } }} className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block">About Us</a></li>
                    <li><button onClick={() => { setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block focus:outline-none">Food Menu</button></li>
                    <li><Link to="/privacy-policy" className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block">Privacy Policy</Link></li>
                    <li>
                      <button 
                        onClick={handleDownloadPdf} 
                        disabled={isGeneratingPdf} 
                        className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-flex items-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPdf ? 'Generating...' : 'Download Menu (PDF)'}
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col h-full">
                  <h4 className="text-[var(--color-brown)] font-serif font-bold mb-8 text-2xl tracking-wide">Location Map</h4>
                  <div className="w-full flex-grow min-h-[180px] rounded-xl overflow-hidden shadow-lg relative bg-white/40 border border-[#d4af37]/20">
                    <iframe
                      src="https://maps.google.com/maps?q=30.790398619530514,76.60875603332086&t=&z=15&ie=UTF8&iwloc=&output=embed"
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Map Location"
                    ></iframe>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=30.790398619530514,76.60875603332086"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full bg-gradient-to-r from-[var(--color-gold)] to-amber-600 hover:brightness-110 text-stone-950 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>

              </div>
            </div>

            <div className="border-t border-[var(--color-gold)]/20 py-4 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
              <p className="text-stone-500 text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 flex-wrap">
                <span>Every dish takes 15-20 minutes to serve</span>
                <span className="hidden sm:inline">|</span>
                <span>GST Extra</span>
                <span className="hidden sm:inline">|</span>
                <span>Please don't waste the food</span>
              </p>
            </div>

            <div className="border-t border-[var(--color-gold)]/20 py-6 flex flex-col md:flex-row justify-between items-center text-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="mb-4 md:mb-0 text-stone-500">&copy; {new Date().getFullYear()} Harjinder Tourist Dhaba. All rights reserved.</p>
              <a href="https://rupeshkumar.online" target="_blank" rel="noopener noreferrer" className="relative flex items-center gap-2 bg-stone-100 hover:bg-stone-200 px-4 py-1.5 rounded-full border border-green-500/30 hover:border-green-400 transition-all duration-500 group overflow-hidden shadow-sm hover:shadow-md scale-90 md:scale-100 origin-right">
                <div className="absolute inset-0 bg-green-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="text-stone-500 font-mono text-[10px] group-hover:text-green-600 transition-colors z-10 flex items-center uppercase tracking-wider">
                  <span className="text-green-500 mr-1 opacity-0 w-0 group-hover:w-auto overflow-hidden group-hover:opacity-100 transition-all duration-300 font-bold">&gt;_</span>
                  Built by
                </span>
                <div className="flex items-center gap-1.5 z-10">
                  <div className="relative flex items-center justify-center shrink-0">
                    <img src="/Rup.png" alt="Rupesh" className="w-5 h-5 rounded-full object-cover object-center border border-green-500/30 group-hover:border-green-400 transition-colors relative z-10" />
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:animate-ping group-hover:opacity-20 z-0"></div>
                  </div>
                  <span className="font-bold text-stone-800 font-mono text-xs tracking-widest group-hover:text-green-700 transition-all uppercase">
                    Rupesh
                  </span>
                </div>
              </a>
            </div>
          </footer>
        </>
      ) : currentView === "menu" ? (
        <MenuView
          isLoading={isLoading}
          menuItems={menuItems}
          dbCategories={dbCategories}
          onBack={() => setCurrentView('home')}
          cartItems={cartItems}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          openCart={() => setIsCartOpen(true)}
          setSelectedItemDetail={setSelectedItemDetail}
        />
      ) : currentView === "order" ? (
        <OrderView
          isLoading={isLoading}
          menuItems={menuItems}
          dbCategories={dbCategories}
          orderViewStatus={orderViewStatus}
          setOrderViewStatus={setOrderViewStatus}
          orderCategory={orderCategory}
          setOrderCategory={setOrderCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          setIsCartOpen={setIsCartOpen}
          onBackToHome={() => setCurrentView('home')}
          cartItems={cartItems}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          setSelectedItemDetail={setSelectedItemDetail}
        />
      ) : (
        <CheckoutView
          cartItems={cartItems}
          cartTotal={cartTotal}
          onBack={() => setCurrentView('order')}
          onOrderComplete={() => {
            setCartItems([]);
            setCurrentView('home');
          }}
        />
      )}
      {/* Cart Sidebar Overlay */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[var(--color-ivory)]">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="text-[var(--color-gold)] h-6 w-6" />
              <h2 className="text-xl font-serif font-bold text-[var(--color-brown)]">Your Order</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-stone-400 hover:text-stone-600 transition-colors p-2 focus:outline-none"
              aria-label="Close cart"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" data-lenis-prevent="true">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-4">
                <ShoppingBag className="h-16 w-16 text-stone-300" />
                <p className="text-lg"><DevEmptyStateText /></p>
                <button
                  onClick={() => { setIsCartOpen(false); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white border border-stone-200 hover:border-[var(--color-gold)] text-[var(--color-gold)] font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-white border border-stone-100 rounded-[1.5rem] shadow-sm hover:border-[var(--color-gold)]/20 hover:shadow-lg transition-all duration-500 group">
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl shadow-inner bg-stone-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700">
                        <DynamicIcon name={getItemFallbackIcon(item.category)} className="w-8 h-8 text-stone-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-bold text-[var(--color-brown)] text-lg leading-tight group-hover:text-[var(--color-gold)] transition-colors">
                          {item.name}
                        </h4>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromCart(item.name, item.isHalf || false, item.isButter || false, item.variantName); }}
                          className="text-stone-400 hover:text-red-500 p-1 -mt-1 -mr-1 transition-colors focus:outline-none flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.isHalf !== undefined && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                            {item.isHalf ? 'Half' : 'Full'}
                          </span>
                        )}
                        {item.isButter !== undefined && item.isButter && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-100">
                            W/ Butter
                          </span>
                        )}
                        {item.variantName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                            {item.variantName}
                          </span>
                        )}
                        {item.isButter !== undefined && !item.isButter && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-50 text-stone-500 border border-stone-100">
                            Normal
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="font-sans font-bold text-[var(--color-gold)] text-lg">₹{item.numericPrice * item.quantity}</p>

                      <div className="flex items-center bg-stone-50 border border-stone-200/80 rounded-xl p-1 shadow-inner">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1, item.variantName); }}
                          className="text-stone-500 hover:bg-white hover:text-[var(--color-gold)] hover:shadow-sm w-7 h-7 rounded-md flex items-center justify-center transition-all focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-semibold text-sm w-8 text-center text-[var(--color-brown)]">{item.quantity}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1, item.variantName); }}
                          className="text-stone-500 hover:bg-white hover:text-[var(--color-gold)] hover:shadow-sm w-7 h-7 rounded-md flex items-center justify-center transition-all focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-[var(--color-ivory)] space-y-4">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--color-brown)]">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes & Fees</span>
                <span className="font-medium text-[var(--color-brown)]">₹{Math.round(cartTotal * 0.05)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-[var(--color-brown)] pt-2 border-t border-stone-200">
                <span>Total</span>
                <span className="text-[var(--color-gold)]">₹{cartTotal + Math.round(cartTotal * 0.05)}</span>
              </div>
              <button onClick={() => { setCurrentView("checkout"); setIsCartOpen(false); }} className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 hover:from-[#E6B355] hover:to-[var(--color-gold)] text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Item Details Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm sm:transition-opacity" data-lenis-prevent="true">
          <div className="bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 border border-stone-100">
            <button
              onClick={() => setSelectedItemDetail(null)}
              className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-[35vh] sm:h-80 relative flex-shrink-0 bg-stone-100">
              {selectedItemDetail.image ? (
                <>
                  <img
                    src={selectedItemDetail.image}
                    alt={selectedItemDetail.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white cursor-help group/info z-30 transition-colors shadow-sm">
                    <Info className="w-4 h-4" />
                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-stone-900 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 pointer-events-none border border-white/10 z-40 text-left leading-tight">
                      Image is for reference only and may not represent the actual dish.
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DynamicIcon name={getItemFallbackIcon(selectedItemDetail.category)} className="w-24 h-24 text-stone-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>

              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-md shadow-sm flex items-center justify-center cursor-help" title={selectedItemDetail.dietaryPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}>
                  <DietaryBadge type={selectedItemDetail.dietaryPreference} />
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full border border-white/30 uppercase ${selectedItemDetail.category?.toLowerCase() === 'indian cuisine' || selectedItemDetail.category?.toLowerCase().includes('indian')
                    ? 'indian-tricolour-badge font-bold'
                    : ''
                    }`}>
                    {selectedItemDetail.category}
                  </span>
                  {selectedItemDetail.spiceLevel && selectedItemDetail.spiceLevel !== 'None' && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase">
                      🌶️ {selectedItemDetail.spiceLevel}
                    </span>
                  )}
                  {selectedItemDetail.isDhabaSpecial && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400/30 uppercase tracking-wide">
                      Dhaba Special
                    </span>
                  )}
                  {selectedItemDetail.isWithoutButter && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30 uppercase tracking-wide">
                      Without Butter
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight drop-shadow-md">{selectedItemDetail.name}</h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-grow flex flex-col" data-lenis-prevent="true">
              <div className="prose prose-stone max-w-none mb-8 flex-grow">
                <p className="text-stone-500 text-base sm:text-lg leading-relaxed whitespace-pre-line font-light">
                  {selectedItemDetail.description}
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-stone-100">
                <h4 className="font-bold text-stone-400 text-xs tracking-widest uppercase text-center sm:text-left mb-1">Select Portion / Option</h4>

                {isItemLocked(selectedItemDetail) ? (
                  <div className="w-full bg-stone-100 text-stone-500 font-semibold py-4 rounded-2xl flex flex-col justify-center items-center text-sm shadow-inner cursor-not-allowed text-center">
                    <span className="text-lg">{getLockReason(selectedItemDetail)}</span>
                    <span className="font-normal text-xs mt-1">{getLockSubReason(selectedItemDetail)}</span>
                  </div>
                ) : selectedItemDetail.variants && selectedItemDetail.variants.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {selectedItemDetail.variants.map((v: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!v.outOfStock) {
                            addToCart({ ...selectedItemDetail, variantName: v.name, variantPrice: Number(v.price) });
                            setSelectedItemDetail(null);
                          }
                        }}
                        className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 border ${v.outOfStock ? 'border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed' : 'border-stone-200 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 hover:-translate-y-1 hover:shadow-md'} rounded-2xl transition-all duration-300`}
                      >
                        <span className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2 ${v.outOfStock ? 'text-stone-400' : 'text-stone-500 group-hover:text-[var(--color-gold)]'} transition-colors`}>{v.name}</span>
                        <span className={`text-xl sm:text-2xl font-bold ${v.outOfStock ? 'text-stone-400' : 'text-[var(--color-brown)]'}`}>₹{v.price}</span>
                        {v.outOfStock && <span className="absolute top-2 right-2 text-[8px] uppercase font-bold text-red-500 bg-red-100 px-1 py-0.5 rounded">Out of stock</span>}
                      </button>
                    ))}
                  </div>
                ) : selectedItemDetail.hasHalfPortion ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => { addToCart({ ...selectedItemDetail, isHalf: true }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-stone-50 border border-stone-200/80 rounded-[1.5rem] hover:bg-gradient-to-br hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:border-transparent transition-all duration-500 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 group-hover:text-orange-100 mb-1.5 transition-colors">Half</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-2xl font-bold text-[var(--color-brown)] group-hover:text-white transition-colors">₹{selectedItemDetail.halfPrice}</span>
                        {selectedItemDetail.halfPortionPieces && <span className="text-[13px] font-medium text-stone-400 group-hover:text-white/80">{selectedItemDetail.halfPortionPieces} Pieces</span>}
                      </div>
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-dhaba-orange/30 transition-all pointer-events-none"></div>
                    </button>
                    <button
                      onClick={() => { addToCart({ ...selectedItemDetail, isHalf: false }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-stone-50 border border-stone-200/80 rounded-[1.5rem] hover:bg-gradient-to-br hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:border-transparent transition-all duration-500 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 group-hover:text-orange-100 mb-1.5 transition-colors">Full</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-2xl font-bold text-[var(--color-brown)] group-hover:text-white transition-colors">₹{selectedItemDetail.price}</span>
                        {selectedItemDetail.fullPortionPieces && <span className="text-[13px] font-medium text-stone-400 group-hover:text-white/80">{selectedItemDetail.fullPortionPieces} Pieces</span>}
                      </div>
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-dhaba-orange/30 transition-all pointer-events-none"></div>
                    </button>
                  </div>
                ) : selectedItemDetail.hasButterOption ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => { addToCart({ ...selectedItemDetail, isButter: false }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-stone-50 border border-stone-200/80 rounded-[1.5rem] hover:bg-gradient-to-br hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:border-transparent transition-all duration-500 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 group-hover:text-orange-100 mb-1.5 transition-colors">Without Butter</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-2xl font-bold text-[var(--color-brown)] group-hover:text-white transition-colors">₹{selectedItemDetail.price}</span>
                        {selectedItemDetail.fullPortionPieces && <span className="text-[13px] font-medium text-stone-400 group-hover:text-white/80">{selectedItemDetail.fullPortionPieces} Pieces</span>}
                      </div>
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-dhaba-orange/30 transition-all pointer-events-none"></div>
                    </button>
                    <button
                      onClick={() => { addToCart({ ...selectedItemDetail, isButter: true }); setSelectedItemDetail(null); }}
                      className="group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-stone-50 border border-stone-200/80 rounded-[1.5rem] hover:bg-gradient-to-br hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:border-transparent transition-all duration-500 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="text-xs uppercase tracking-widest font-bold text-stone-500 group-hover:text-orange-100 mb-1.5 transition-colors">With Butter</span>
                      <span className="text-2xl font-bold text-[var(--color-brown)] group-hover:text-white transition-colors">₹{selectedItemDetail.price + selectedItemDetail.butterPrice}</span>
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-dhaba-orange/30 transition-all pointer-events-none"></div>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { addToCart({ ...selectedItemDetail, isHalf: false }); setSelectedItemDetail(null); }}
                    className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 hover:from-[#E6B355] hover:to-[var(--color-gold)] text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg group active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    <span>Add to Cart — ₹{selectedItemDetail.price}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Banner */}
      <div
        className={`fixed bottom-16 md:bottom-0 left-0 right-0 p-4 pb-4 sm:p-6 z-[90] transition-all duration-300 text-center text-[16px] ${cartCount > 0 && !isCartOpen && currentView !== 'checkout' && !selectedItemDetail
          ? 'translate-y-0 opacity-100 scale-100 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]'
          : 'translate-y-12 opacity-0 scale-95 ease-in pointer-events-none'
          }`}
      >
        <div className="max-w-3xl mx-auto flex justify-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-[340px] h-[76px] sm:h-[84px] bg-[#118a11] hover:bg-[#0e750e] text-white rounded-3xl shadow-2xl px-5 flex items-center justify-between group active:scale-[0.97] transition-transform duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 bg-dhaba-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[11px] font-bold text-white/90 tracking-wider uppercase">{cartCount} ITEM{cartCount > 1 ? 'S' : ''}</span>
                <span className="font-extrabold text-xl sm:text-2xl leading-none">₹{cartTotal}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lg sm:text-xl tracking-wide pr-1">
              View cart <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Floating Quick Chat WhatsApp Floating Button */}
      <a
        href="https://wa.me/919056655093?text=Hello%20Harjinder%20Dhaba%2C%20I%20have%20a%20question"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed left-4 z-[95] bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20 ${cartCount > 0 && !isCartOpen && currentView !== 'checkout' && !selectedItemDetail
          ? 'bottom-36 md:bottom-28'
          : 'bottom-20 md:bottom-6'
          }`}
        title="Quick Chat on WhatsApp (+91 90566 55093)"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
        <span className="hidden sm:inline font-bold text-xs tracking-wide">Quick Chat</span>
      </a>


    </div>
  );
}
