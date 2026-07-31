import Testimonials from './components/Testimonials.tsx';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { DevEmptyStateText } from './components/DevEmptyStateText';
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Truck, Coffee, Utensils, Star, ArrowRight, ArrowLeft, Instagram, Facebook, Menu, X, ShoppingBag, BookOpen, ShoppingCart, Minus, Plus, Trash2, Search, Layers, Image as ImageIcon, TrendingUp, Flame, Lock, ChevronRight, ChefHat, MessageCircle, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import * as Icons from 'lucide-react';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  return <IconComponent className={className} />;
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
  isHalf?: boolean;
  isButter?: boolean;
  variantName?: string;
};




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
          videoRef.current?.play().catch(() => {});
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
        e.currentTarget.play().catch(() => {});
      }}
    >
      <source src={src || undefined} type="video/mp4" />
    </video>
  );
};

export default function Storefront() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [features, setFeatures] = useState<any[]>([]);
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
  const [orderViewStatus, setOrderViewStatus] = useState<'categories' | 'items'>('categories');
  const [orderCategory, setOrderCategory] = useState('All');
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [specials, setSpecials] = useState<any[]>([]);
  const [journeyMedia, setJourneyMedia] = useState<any[]>([]);
  const [journeySettings, setJourneySettings] = useState({ header: 'Our Journey', description: 'Since 1991, Harjinder Tourist Dhaba has been serving authentic Punjabi hospitality on the Kharar–Kurali Highway.\n\nWhat started as a humble roadside dhaba with a passion for honest food has grown into a trusted stop for travelers, families, students, and food lovers. For over three decades, we\'ve remained committed to the same values—fresh ingredients, traditional recipes, generous portions, and warm hospitality.\n\nEvery meal we serve carries the rich flavors of Punjab, crafted with care and the belief that great food brings people together. Whether you\'re beginning a journey, taking a break, or returning home, Harjinder Tourist Dhaba is always ready to welcome you with a delicious meal and a smile.', signature: 'Harjinder Tourist Dhaba', subSignature: 'Serving Memories Since 1991.' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentJourneyIndex, setCurrentJourneyIndex] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllSpecials, setShowAllSpecials] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

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
        if (data.journeySettings) setJourneySettings(data.journeySettings);
      } else if (!data || data.length === 0) {
        setApiError("Received empty response from API");
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setApiError(err.message || "Failed to load data");
      setIsLoading(false);
    });

    safeFetch('/api/journey-media').then((data) => {
      setJourneyMedia(data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (journeyMedia.length > 0) {
      const interval = setInterval(() => {
        setCurrentJourneyIndex(prev => (prev + 1) % journeyMedia.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [journeyMedia]);

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
    
    let hasTiming = item.hasTiming;
    let startTime = item.startTime;
    let endTime = item.endTime;
    
    if (!hasTiming) {
      const category = dbCategories.find(c => c.name === item.category);
      if (category && category.startTime && category.endTime) {
        hasTiming = true;
        startTime = category.startTime;
        endTime = category.endTime;
      }
    }

    if (!hasTiming || !startTime || !endTime) return false;
    
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
    let startTime = item.startTime;
    if (!item.hasTiming) {
      const category = dbCategories.find(c => c.name === item.category);
      if (category) startTime = category.startTime;
    }
    return `Available tomorrow at ${startTime || 'later'}`;
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
    <div className={`min-h-[100dvh] bg-[var(--color-ivory)] text-[var(--color-brown)] font-sans selection:bg-dhaba-orange selection:text-white flex flex-col ${cartCount > 0 && currentView !== 'checkout' ? 'pb-20 sm:pb-24' : ''}`}>
      {currentView === 'home' ? (
      <>
      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-500" style={{ background: 'rgba(36,23,18,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 32px rgba(0,0,0,0.25)' }}>
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
              
              {/* Logo (centered on tablet and mobile, hidden on desktop where nav menu is centered) */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex-shrink-0 flex items-center whitespace-nowrap xl:hidden">
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-white hover:text-[var(--color-gold)] transition-colors duration-300">
                  <span className="text-[var(--color-gold)]">H</span>arjinder <span className="text-stone-300 font-light hidden sm:inline text-lg md:text-2xl">Tourist Dhaba</span>
                  <span className="text-stone-300 font-light sm:hidden text-base">Dhaba</span>
                </a>
              </div>
            </div>
            
            {/* Centered Desktop Menu */}
            <div className="hidden xl:flex absolute left-1/2 transform -translate-x-1/2 space-x-1 items-center">
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-stone-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm tracking-wide whitespace-nowrap">Home</a>
              <button onClick={(e) => { e.preventDefault(); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-stone-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm tracking-wide whitespace-nowrap">Menu</button>
              <a href="#about" onClick={(e) => { e.preventDefault(); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); } }} className="text-stone-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm tracking-wide whitespace-nowrap">About Us</a>
              <a href="#specials" onClick={(e) => { e.preventDefault(); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' }); } }} className="text-stone-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm tracking-wide whitespace-nowrap">Dhaba Specials</a>
            </div>
            
            <div className="flex items-center justify-end flex-1 space-x-2 md:space-x-4">
              <div className="hidden xl:block">
                <a 
                  href="http://zoma.to/r/22202855" 
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
        <div className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-gradient-to-b from-dhaba-dark to-black shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 flex justify-between items-center border-b border-white/10 mt-2">
            <span className="text-2xl font-bold font-serif text-[var(--color-gold)] tracking-widest drop-shadow-sm">Harjinder Dhaba</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/5 text-stone-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center px-5 py-4 text-stone-300 hover:text-white hover:bg-white/10 rounded-2xl font-medium transition-all duration-300 group">
              <span className="w-2 h-2 rounded-full bg-dhaba-orange mr-4 opacity-0 group-hover:opacity-100 transition-opacity"></span> Home
            </a>
            <button onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left flex items-center px-5 py-4 text-stone-300 hover:text-white hover:bg-white/10 rounded-2xl font-medium transition-all duration-300 group">
              <span className="w-2 h-2 rounded-full bg-dhaba-orange mr-4 opacity-0 group-hover:opacity-100 transition-opacity"></span> Menu
            </button>
            <a href="#about" onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }
            }} className="flex items-center px-5 py-4 text-stone-300 hover:text-white hover:bg-white/10 rounded-2xl font-medium transition-all duration-300 group">
              <span className="w-2 h-2 rounded-full bg-dhaba-orange mr-4 opacity-0 group-hover:opacity-100 transition-opacity"></span> About Us
            </a>
            <a href="#specials" onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }
            }} className="flex items-center px-5 py-4 text-stone-300 hover:text-white hover:bg-white/10 rounded-2xl font-medium transition-all duration-300 group">
              <span className="w-2 h-2 rounded-full bg-dhaba-orange mr-4 opacity-0 group-hover:opacity-100 transition-opacity"></span> Dhaba Specials
            </a>
          </div>

          <div className="p-6 border-t border-white/10 bg-black/20">
             <a 
                href="http://zoma.to/r/22202855"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 hover:from-[#E6B355] hover:to-[var(--color-gold)] text-white px-4 py-4 rounded-2xl font-semibold flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 mb-3"
              >
                <ShoppingBag className="w-5 h-5 mr-2" /> Order Online
              </a>
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-transparent text-stone-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-300"
              >
                Admin Login
              </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-16 pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/hero-bg.jpg'), url('/hero-bg.png'), url('https://images.unsplash.com/photo-1517244683847-7456b63c5969?q=80&w=2070&auto=format&fit=crop')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(36,23,18,0.92) 0%, rgba(36,23,18,0.55) 45%, rgba(36,23,18,0.96) 100%)' }} />
          {/* Decorative grain */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")', backgroundSize: '180px 180px' }} />
        </div>
        
        <div className="relative z-10 text-center px-5 sm:px-8 py-12 sm:py-16 max-w-4xl mx-auto w-full" style={{ marginTop: '5rem' }}>
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 sm:w-12" style={{ background: 'linear-gradient(90deg, transparent, #C89B3C)' }} />
            <span className="font-semibold tracking-[0.22em] uppercase text-xs sm:text-sm" style={{ color: '#C89B3C' }}>Welcome to the Highway Legend</span>
            <div className="h-px w-8 sm:w-12" style={{ background: 'linear-gradient(90deg, #C89B3C, transparent)' }} />
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-[1.1] drop-shadow-xl">
            The True Taste of{' '}<br className="hidden sm:block" />
            <span style={{ background: 'linear-gradient(135deg, #C89B3C, #e8bb5c, #C89B3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Punjab</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-stone-300 mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed px-2">
            Stop by for a piping hot meal, rich with desi ghee and traditional spices. Serving travelers with love and authenticity since 1995.
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

      {/* Our Specials (Responsive Grid/Scroll) */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className={`${!showAllSpecials ? 'flex overflow-x-auto snap-x snap-mandatory pb-12' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-4'} gap-6 lg:gap-8 pt-4 w-full hide-scrollbar scroll-smooth`}>
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
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
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
      <section id="menu" className="py-32 bg-[var(--color-brown)] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 md:gap-0">
            <div className="max-w-2xl">
              <span className="text-[var(--color-gold)] font-semibold tracking-[0.2em] uppercase text-sm mb-4 block drop-shadow-md">
                Crowd Favorites
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 drop-shadow-xl">Popular & Best Sellers</h2>
              <p className="text-stone-300 text-base sm:text-lg font-light leading-relaxed">Our most loved dishes, handpicked by our regular patrons.</p>
            </div>
          </div>

          <div className="mb-12 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm ${
                    selectedCategory === cat 
                      ? 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 text-white border-transparent shadow-lg transform scale-105' 
                      : 'bg-white/5 text-stone-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 backdrop-blur-md'
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
                className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-full focus:ring-2 focus:ring-dhaba-orange focus:border-[var(--color-gold)] outline-none text-white placeholder-stone-400 transition-all text-sm backdrop-blur-md shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="relative overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row h-64 animate-pulse">
                  <div className="sm:w-2/5 h-48 sm:h-full bg-stone-700"></div>
                  <div className="sm:w-3/5 p-6 md:p-8 flex flex-col justify-between relative bg-stone-800">
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-4">
                        <div className="h-6 bg-stone-600 rounded w-1/2"></div>
                        <div className="h-6 bg-stone-600 rounded w-1/4"></div>
                      </div>
                      <div className="h-4 bg-stone-600 rounded w-full mb-2"></div>
                      <div className="h-4 bg-stone-600 rounded w-3/4"></div>
                    </div>
                    <div className="mt-auto pt-5 border-t border-stone-700/50 flex justify-end">
                       <div className="h-10 bg-stone-600 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredMenu.length > 0 ? (
              filteredMenu.map((item, idx) => (
              <div key={idx} onClick={() => setSelectedItemDetail(item)} className="group relative overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row h-full transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl backdrop-blur-sm transform hover:-translate-y-1 cursor-pointer">
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-20 flex gap-2 group/tooltip">
                    <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded shadow-sm flex items-center justify-center cursor-help">
                      <DietaryBadge type={item.dietaryPreference} />
                    </div>
                    {item.dietaryPreference === 'veg' && (
                      <div className="absolute left-0 top-full mt-2 w-64 bg-stone-900 text-stone-200 p-4 rounded-xl shadow-2xl text-xs opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 pointer-events-none transform origin-top-left scale-95 group-hover/tooltip:scale-100 border border-stone-700 text-left">
                        <div className="font-bold text-green-500 mb-1.5 text-sm border-b border-stone-700 pb-1.5">Fresh • Wholesome • Delicious</div>
                        <p className="text-stone-300 mt-1.5 leading-relaxed">Enjoy a wide selection of vegetarian delicacies made with fresh farm vegetables, premium dairy, and aromatic Indian spices. Perfect for every vegetarian food lover.</p>
                      </div>
                    )}
                  </div>
                  <img 
                    src={item.image || undefined} 
                    alt={item.name} 
                    onClick={() => setSelectedItemDetail(item)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-stone-800/80 sm:to-stone-800"></div>
                  
                  <div className="absolute bottom-4 left-4 sm:hidden">
                    <span className="bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs font-medium px-2.5 py-1 rounded-md border border-stone-700">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="sm:w-3/5 p-6 md:p-8 flex flex-col justify-between relative z-10 bg-gradient-to-t from-stone-800 via-stone-800 to-transparent sm:bg-none">
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <div>
                        <div className="hidden sm:inline-block mb-2">
                          <span className="bg-stone-700/50 text-stone-300 text-xs font-medium px-2.5 py-1 rounded-md border border-stone-600/50">
                            {item.category}
                          </span>
                        </div>
                        <h3 onClick={() => setSelectedItemDetail(item)} className="text-2xl font-bold font-serif text-white leading-tight group-hover:text-[var(--color-gold)] transition-colors cursor-pointer">{item.name}</h3>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="font-sans font-bold text-[var(--color-gold)] whitespace-nowrap text-2xl">₹{item.price}</span>
                        {item.fullPortionPieces && <span className="text-stone-400 font-medium text-[13px] mt-0.5">{item.fullPortionPieces} Pieces</span>}
                      </div>
                    </div>
                    <p onClick={() => setSelectedItemDetail(item)} className="text-stone-400 mb-6 text-sm leading-relaxed cursor-pointer">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-stone-700/50">
                    <div className="flex items-center gap-2">
                      {item.spiceLevel && item.spiceLevel !== 'None' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20">
                          🔥 {item.spiceLevel}
                        </span>
                      )}
                      {item.isBestSeller && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md border border-yellow-400/20 flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-current" /> Bestseller
                        </span>
                      )}
                      {item.isDhabaSpecial && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                          Dhaba Special
                        </span>
                      )}
                      {item.isWithoutButter && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">
                          Without Butter
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 w-full justify-end">
                      {(item.hasHalfPortion || item.hasButterOption) ? (
                        <button 
                          onClick={() => setSelectedItemDetail(item)}
                          className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 hover:from-[#E6B355] hover:to-[var(--color-gold)] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95 h-[48px]"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      ) : (
                        getQuantity(item) === 0 ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); addToCart({ ...item, isHalf: false }); }}
                            className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/80 hover:from-[#E6B355] hover:to-[var(--color-gold)] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95 h-[48px]"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-dhaba-orange text-white rounded-xl overflow-hidden shadow-lg h-[48px] animate-in fade-in zoom-in-75 duration-300">
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, -1, item.variantName); }}
                              className="px-4 h-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold min-w-[2.5rem] text-center text-lg">{getQuantity(item)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1, item.variantName); }}
                              className="px-4 h-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center"
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
        </div>
      </section>

      {/* Features/Amenities */}
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
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentJourneyIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                        autoPlay muted loop playsInline
                      />
                    ) : (
                      <img 
                        key={media.id}
                        src={media.url || undefined} 
                        alt="Journey" 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentJourneyIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
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

              {/* Gold "SINCE 1991" Badge Image */}
              <div className="absolute -bottom-10 right-4 sm:-right-10 z-20 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                <img 
                  src="/since-1991.png" 
                  alt="Since 1991" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            <div className="lg:w-7/12 w-full mt-16 lg:mt-0 relative z-20">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--color-gold)]">Our Journey</span>
                <div className="h-px w-16 bg-[var(--color-gold)]/40"></div>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[var(--color-brown)] mb-8 leading-[1.1] tracking-tight">{journeySettings.header}</h2>
              <div className="space-y-6">
                {journeySettings.description.split('\n').map((paragraph, idx) => paragraph.trim() ? (
                  <p key={idx} className="text-[#5A4A42] text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ) : null)}
              </div>
              <p className="text-[var(--color-brown)] text-xl mt-8 font-medium italic">
                {journeySettings.signature}<br />
                <span className="text-[var(--color-gold)] font-bold non-italic text-sm tracking-widest uppercase mt-2 block">{journeySettings.subSignature}</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
      {/* Footer & Contact */}
      <footer id="contact" className="bg-[var(--color-brown)] text-stone-400 pt-24 border-t-4 border-[var(--color-gold)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            <div className="lg:col-span-1">
              <span className="font-serif text-2xl font-bold tracking-tight text-[var(--color-gold)] mb-6 block">
                <span className="text-[var(--color-gold)]">H</span>arjinder <span className="text-white font-light">Dhaba</span>
              </span>
              <p className="mb-6 leading-relaxed">
                The ultimate pitstop for authentic Punjabi cuisine. Serving fresh, hot, and hygienic food 24/7.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/share/1Jt8XKRJLV/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/harjinder_dhaba?igsh=YTV4MXFhdWszeTVq" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[var(--color-gold)] hover:to-[#E6B355] hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-serif font-bold mb-8 text-2xl tracking-wide">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0 mt-0.5" />
                  <span>QJR5+4FQ, Kharar-kurali-Village-sahauran,<br/>teh-kharar, NH 24, opp. Indian Oil Petrol Bunk,<br/>MOHALI, Punjab 140103</span>
                </li>
                <li className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0" />
                    <a href="tel:+919056655093" className="hover:text-[var(--color-gold)] transition-colors font-medium text-white">
                      +91 90566 55093
                    </a>
                  </div>
                  <a 
                    href="https://wa.me/919056655093?text=Hello%20Harjinder%20Dhaba%2C%20I%20have%20an%20inquiry" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-9 inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full border border-green-500/30 text-xs font-semibold transition-all w-fit"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    Quick Chat on WhatsApp
                  </a>
                </li>
                <li className="flex items-center">
                  <Clock className="w-6 h-6 text-[var(--color-gold)] mr-3 flex-shrink-0" />
                  <span>Open 24 Hours, 7 Days a Week</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-serif font-bold mb-8 text-2xl tracking-wide">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); if (currentView !== 'home') { setCurrentView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); } }} className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block">About Us</a></li>
                <li><button onClick={() => { setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block focus:outline-none">Food Menu</button></li>
                <li><Link to="/admin" className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block">Admin Dashboard</Link></li>
                <li><Link to="/manager" className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block">Manager Dashboard</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[var(--color-gold)] transition-colors hover:pl-2 duration-300 inline-block">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="flex flex-col h-full">
              <h4 className="text-white font-serif font-bold mb-8 text-2xl tracking-wide">Location Map</h4>
              <div className="w-full flex-grow min-h-[180px] rounded-xl overflow-hidden border border-white/10 shadow-lg relative bg-white/5 backdrop-blur-sm">
                <iframe 
                  src="https://maps.google.com/maps?q=Harjinder+Tourist+Dhaba,+Kharar,+Punjab&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                  className="absolute inset-0 w-full h-full" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map Location"
                ></iframe>
              </div>
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=Harjinder+Tourist+Dhaba,+Kharar,+Punjab" 
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
        
        <div className="border-t border-stone-800 py-6 flex flex-col md:flex-row justify-between items-center text-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-4 md:mb-0 text-stone-400">&copy; {new Date().getFullYear()} Harjinder Tourist Dhaba. All rights reserved.</p>
          <a href="https://rupeshworld.vercel.app" target="_blank" rel="noopener noreferrer" className="relative flex items-center gap-2 bg-black/50 hover:bg-black/80 px-4 py-1.5 rounded-full border border-green-500/30 hover:border-green-400 transition-all duration-500 group overflow-hidden shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-90 md:scale-100 origin-right">
            <div className="absolute inset-0 bg-green-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            <span className="text-stone-400 font-mono text-[10px] group-hover:text-green-400 transition-colors z-10 flex items-center uppercase tracking-wider">
              <span className="text-green-500 mr-1 opacity-0 w-0 group-hover:w-auto overflow-hidden group-hover:opacity-100 transition-all duration-300 font-bold">&gt;_</span>
              Built by
            </span>
            <div className="flex items-center gap-1.5 z-10">
              <div className="relative flex items-center justify-center shrink-0">
                <img src="/Rup.png" alt="Rupesh" className="w-5 h-5 rounded-full object-cover object-center border border-green-500/30 group-hover:border-green-400 transition-colors relative z-10" />
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:animate-ping group-hover:opacity-20 z-0"></div>
              </div>
              <span className="font-bold text-white font-mono text-xs tracking-widest group-hover:text-green-300 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all uppercase">
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
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
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
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl shadow-inner">
                    <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
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
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-semibold text-sm w-8 text-center text-[var(--color-brown)]">{item.quantity}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, item.isHalf || false, item.isButter || false, 1, item.variantName); }}
                          className="text-stone-500 hover:bg-white hover:text-[var(--color-gold)] hover:shadow-sm w-7 h-7 rounded-md flex items-center justify-center transition-all focus:outline-none"
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
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm sm:transition-opacity">
          <div className="bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 border border-stone-100">
            <button 
              onClick={() => setSelectedItemDetail(null)}
              className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-[35vh] sm:h-80 relative flex-shrink-0">
              <img 
                src={selectedItemDetail.image || undefined} 
                alt={selectedItemDetail.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
              
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-md shadow-sm flex items-center justify-center cursor-help" title={selectedItemDetail.dietaryPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}>
                  <DietaryBadge type={selectedItemDetail.dietaryPreference} />
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full border border-white/30 uppercase ${
                    selectedItemDetail.category?.toLowerCase() === 'indian cuisine' || selectedItemDetail.category?.toLowerCase().includes('indian') 
                      ? 'indian-tricolour-badge font-bold' 
                      : ''
                  }`}>
                    {selectedItemDetail.category}
                  </span>
                  {selectedItemDetail.spiceLevel && selectedItemDetail.spiceLevel !== 'None' && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase">
                      🔥 {selectedItemDetail.spiceLevel}
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
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-grow flex flex-col">
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
                          if(!v.outOfStock) { 
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
        className={`fixed bottom-0 left-0 right-0 p-4 pb-6 sm:p-6 z-[90] transition-all duration-300 text-center text-[16px] ${
          cartCount > 0 && !isCartOpen && currentView !== 'checkout' && !selectedItemDetail
            ? 'translate-y-0 opacity-100 scale-100 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]' 
            : 'translate-y-12 opacity-0 scale-95 ease-in pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto flex justify-center">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-[336px] h-[92px] bg-[#118a11] text-white rounded-3xl shadow-xl px-5 flex items-center justify-between group active:scale-[0.98] transition-transform duration-200 text-right"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-sm font-bold text-white/90 tracking-wider uppercase mb-0.5">{cartCount} ITEM{cartCount > 1 ? 'S' : ''}</span>
                <span className="font-extrabold text-2xl sm:text-3xl leading-none">₹{cartTotal}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-xl sm:text-2xl tracking-wide pr-2">
              View cart <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Floating Quick Chat WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919056655093?text=Hello%20Harjinder%20Dhaba%2C%20I%20have%20a%20question" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`fixed left-4 z-[95] bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20 ${
          cartCount > 0 && !isCartOpen && currentView !== 'checkout' && !selectedItemDetail 
            ? 'bottom-28' 
            : 'bottom-6'
        }`}
        title="Quick Chat on WhatsApp (+91 90566 55093)"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        <span className="hidden sm:inline font-bold text-xs tracking-wide">Quick Chat</span>
      </a>
    </div>
  );
}
