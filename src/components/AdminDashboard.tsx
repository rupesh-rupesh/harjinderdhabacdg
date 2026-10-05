import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { Menu, Plus, Activity, Trash2, Edit, Save, X, Image as ImageIcon, Layers, Search, MoreVertical, ArrowLeft, ChevronRight, Video, LayoutDashboard, Star, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, ShieldCheck, Zap, Wifi, Snowflake, MapPin, Coffee, Utensils, ChefHat, Fuel, TreePine, BatteryCharging, Clock, Car, Users, Leaf, Droplets, Package, ShoppingCart, Lock, KeyRound, Shield, MessageCircle, Upload, FileText, Printer, Eye, EyeOff } from 'lucide-react';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

import StaffLoginModal from './StaffLoginModal';
import { ConfirmModal } from './ConfirmModal';
import { DevEmptyStateText } from './DevEmptyStateText';
import { TimePicker } from './TimePicker';

const AdminReviews = lazy(() => import('./AdminReviews'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const ManagerStats = lazy(() => import('./ManagerStats'));
const ManagerOrders = lazy(() => import('./ManagerOrders'));
const ManagerBilling = lazy(() => import('./ManagerBilling'));
const AdminManagers = lazy(() => import('./AdminManagers'));
const PrinterSettings = lazy(() => import('./PrinterSettings'));
const ManagerDailyRevenue = lazy(() => import('./ManagerDailyRevenue'));

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  return <IconComponent className={className} />;
};

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body);
};

const getSuggestedIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('24/7') || t.includes('time') || t.includes('hour') || t.includes('open')) return 'Clock';
  if (t.includes('park') || t.includes('car') || t.includes('truck')) return 'Car';
  if (t.includes('family') || t.includes('kid') || t.includes('child')) return 'Users';
  if (t.includes('veg') || t.includes('leaf') || t.includes('pure')) return 'Leaf';
  if (t.includes('hygien') || t.includes('clean') || t.includes('safe') || t.includes('security') || t.includes('cctv')) return 'ShieldCheck';
  if (t.includes('fast') || t.includes('quick')) return 'Zap';
  if (t.includes('wifi') || t.includes('internet')) return 'Wifi';
  if (t.includes('washroom') || t.includes('toilet') || t.includes('restroom') || t.includes('water')) return 'Droplets';
  if (t.includes('ac') || t.includes('cool') || t.includes('air')) return 'Snowflake';
  if (t.includes('map') || t.includes('location') || t.includes('highway')) return 'MapPin';
  if (t.includes('tea') || t.includes('coffee') || t.includes('snack') || t.includes('beverage')) return 'Coffee';
  if (t.includes('punjabi') || t.includes('food') || t.includes('dish') || t.includes('meal')) return 'Utensils';
  if (t.includes('fresh') || t.includes('chef')) return 'ChefHat';
  if (t.includes('petrol') || t.includes('fuel') || t.includes('gas')) return 'Fuel';
  if (t.includes('garden') || t.includes('tree') || t.includes('outdoor')) return 'TreePine';
  if (t.includes('charge') || t.includes('battery') || t.includes('ev')) return 'BatteryCharging';
  return 'Sparkles';
};

const SPICE_LEVELS = ['None', 'Mild', 'Medium', 'Spicy', 'Extra Spicy'];

export default function AdminDashboard() {
  const mainWebsiteUrl = `${window.location.protocol}//${window.location.host.replace(/^(admin|manager)\./, '')}`;
  const [session, setSession] = useState<{ name: string; email: string; role: string; sessionToken: string } | null>(() => {
    try {
      const stored = localStorage.getItem('staff_session');
      if (!stored) return null;
      
      let lastActive = localStorage.getItem('staff_last_active');
      if (!lastActive) {
        lastActive = Date.now().toString();
        localStorage.setItem('staff_last_active', lastActive);
      }
      
      if (Date.now() - Number(lastActive) > 12 * 60 * 60 * 1000) {
        localStorage.removeItem('staff_session');
        localStorage.removeItem('staff_last_active');
        return null;
      }
      
      const s = JSON.parse(stored);
      if (s.role === 'admin') return s;
      return null;
    } catch {
      return null;
    }
  });
  const authenticated = !!session;
  const queryClient = useQueryClient();
  const { data: adminData, isLoading: loading, refetch: refetchData } = useQuery({
    queryKey: ['admin_data'],
    queryFn: async () => {
      const res = await fetch('/api/admin-data');
      if (!res.ok) throw new Error('Failed to fetch admin data');
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) return await res.json();
      return {};
    },
    enabled: authenticated,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });

  const items = adminData?.menuItems || [];
  const categories = adminData?.categories || [];
  const features = adminData?.features || [];
  const deletedData = adminData?.deletedData || {categories: [], menuItems: []};

  const fetchData = (a?: any, b?: any) => refetchData();

  const [activeModule, setActiveModule] = useState<'menu' | 'features' | 'recover' | 'analytics' | 'reviews' | 'managers' | 'stats' | 'orders' | 'billing' | 'printer' | 'revenue'>('billing');
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}});

  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [featureForm, setFeatureForm] = useState({ id: null as number|null, title: '', description: '', videoUrl: '', iconName: 'Sparkles', isActive: true });

  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', startTime: '', endTime: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_open');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_open', String(isSidebarOpen));
  }, [isSidebarOpen]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [isDropdownOpenFor, setIsDropdownOpenFor] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', fullPortionPieces: '', hasHalfPortion: false, halfPrice: '', halfPortionPieces: '', hasButterOption: false, butterPrice: '', image: '', category: '', dietaryPreference: 'veg', spiceLevel: 'None', isPopular: false, isBestSeller: false, isDhabaSpecial: false, outOfStock: false, hasTiming: false, startTime: '', endTime: '', variants: [] as {name: string, price: string, outOfStock?: boolean}[]
  });

  const handleLock = () => {
    localStorage.removeItem('staff_session');
    localStorage.removeItem('staff_last_active');
    setSession(null);
    toast.success('Admin Dashboard locked');
  };

  useEffect(() => {
    if (!authenticated) return;
    let lastUpdate = 0;
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) {
        localStorage.setItem('staff_last_active', now.toString());
        lastUpdate = now;
      }
    };
    updateActivity();
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
    const handleClickOutside = () => setIsDropdownOpenFor(null);
    document.addEventListener('click', handleClickOutside);
  
    return () => document.removeEventListener('click', handleClickOutside);
  }, [authenticated]);

  if (!authenticated) {
    return (
      <StaffLoginModal
        role="admin"
        onSuccess={(info) => {
          localStorage.setItem('staff_session', JSON.stringify(info));
          localStorage.setItem('staff_last_active', Date.now().toString());
          setSession(info);
        }}
      />
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const url = editingItemId ? `/api/menu-items/${editingItemId}` : '/api/menu-items';
      const method = editingItemId ? 'PUT' : 'POST';
      
      const submitData = { ...formData };
      if (submitData.variants && submitData.variants.length > 0) {
        submitData.price = submitData.variants[0].price;
        submitData.hasHalfPortion = false;
        submitData.halfPrice = '';
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        toast.success(editingItemId ? 'Menu item updated successfully!' : 'Menu item added successfully!');
        setIsFormOpen(false);
        setEditingItemId(null);
        resetForm();
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error('Failed to save item: ' + (errData.error || res.statusText || 'Unknown error'));
      }
    } catch (error: any) {
      console.error("Failed to save item:", error);
      toast.error('Failed to save item: ' + (error.message || 'Network error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name || '', description: item.description || '', price: item.price ? item.price.toString() : '', fullPortionPieces: item.fullPortionPieces ? item.fullPortionPieces.toString() : '', hasHalfPortion: item.hasHalfPortion || false, halfPrice: item.halfPrice ? item.halfPrice.toString() : '', halfPortionPieces: item.halfPortionPieces ? item.halfPortionPieces.toString() : '', hasButterOption: item.hasButterOption || false, butterPrice: item.butterPrice ? item.butterPrice.toString() : '', image: item.image || '', category: item.category || '', dietaryPreference: item.dietaryPreference || 'veg', spiceLevel: item.spiceLevel || 'None', isPopular: item.isPopular || false, isBestSeller: item.isBestSeller || false, isDhabaSpecial: item.isDhabaSpecial || false, outOfStock: item.outOfStock || false, hasTiming: item.hasTiming || false, startTime: item.startTime || '', endTime: item.endTime || '', variants: item.variants || []
    });
    setEditingItemId(item.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Item deleted successfully!');
        setItemToDelete(null);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error('Failed to delete item: ' + (errData.error || res.statusText || 'Unknown error'));
      }
    } catch (error: any) {
      console.error("Failed to delete item:", error);
      toast.error('Failed to delete item: ' + (error.message || 'Network error'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', fullPortionPieces: '', hasHalfPortion: false, halfPrice: '', halfPortionPieces: '', hasButterOption: false, butterPrice: '', image: '',
      category: categories.length > 0 ? categories[0].name : '',
      dietaryPreference: 'veg', spiceLevel: 'None',
      isPopular: false, isBestSeller: false, isDhabaSpecial: false, outOfStock: false, hasTiming: false, startTime: '', endTime: '', variants: []
    });
    setEditingItemId(null);
  };

  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    if (isSavingCategory) return;
    setIsSavingCategory(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        toast.success(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
        setCategoryForm({ name: '', image: '', startTime: '', endTime: '' });
        setEditingCategory(null);
        setIsCategoryModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error('Failed to save category: ' + (errData.error || res.statusText || 'Unknown error'));
      }
    } catch (error: any) {
      console.error("Failed to save category:", error);
      toast.error('Failed to save category: ' + (error.message || 'Network error'));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, image: cat.image || '', startTime: cat.startTime || '', endTime: cat.endTime || '' });
    setIsCategoryModalOpen(true);
  };

  const handleConfirmDeleteCategory = (cat: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"? This will also delete all items inside this category.`,
      onConfirm: () => handleDeleteCategory(cat.id)
    });
  };

  const handleToggleCategoryVisibility = async (cat: any) => {
    // Optimistically update the UI so it doesn't flicker
    queryClient.setQueryData(['admin_data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        categories: (old.categories || []).map((c: any) => c.id === cat.id ? { ...c, isHidden: !c.isHidden } : c)
      };
    });
    try {
      const res = await fetch(`/api/categories/${cat.id}/toggle-visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !cat.isHidden })
      });
      if (res.ok) {
        toast.success(`Category ${!cat.isHidden ? 'hidden' : 'visible'}`);
        // Fetch data quietly in background
        fetchData();
      } else {
        // Revert on error
        queryClient.setQueryData(['admin_data'], (old: any) => {
          if (!old) return old;
          return { ...old, categories: (old.categories || []).map((c: any) => c.id === cat.id ? { ...c, isHidden: cat.isHidden } : c) };
        });
        toast.error(`Server error: Please restart your terminal/dev server.`);
      }
    } catch (e) {
      // Revert on error
      queryClient.setQueryData(['admin_data'], (old: any) => {
        if (!old) return old;
        return { ...old, categories: (old.categories || []).map((c: any) => c.id === cat.id ? { ...c, isHidden: cat.isHidden } : c) };
      });
      toast.error('Failed to toggle visibility');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted!');
        setCategoryToDelete(null);
        if (activeCategoryName === categoryToDelete?.name) {
          setActiveCategoryName(null);
        }
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error('Failed to delete category: ' + (errData.error || res.statusText || 'Unknown error'));
      }
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      toast.error('Failed to delete category: ' + (error.message || 'Network error'));
    }
  };

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const matchesCategory = item.category === activeCategoryName;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategoryName, searchQuery]);

  const renderCategoryCards = () => {
    const filteredCategories = categories.filter(cat => {
      const matchCat = (cat.name || '').toLowerCase().includes(categorySearchQuery.toLowerCase());
      const matchItems = items.some(item => 
        item.category === cat.name && 
        ((item.name || '').toLowerCase().includes(categorySearchQuery.toLowerCase()) || 
         (item.description || '').toLowerCase().includes(categorySearchQuery.toLowerCase()))
      );
      return matchCat || matchItems;
    });

    const matchingItems = categorySearchQuery ? items.filter(item => 
      (item.name || '').toLowerCase().includes(categorySearchQuery.toLowerCase()) || 
      (item.description || '').toLowerCase().includes(categorySearchQuery.toLowerCase())
    ) : [];

    return (
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search categories and items..."
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange outline-none shadow-sm transition-all text-sm font-medium"
          />
        </div>

        {filteredCategories.length === 0 && matchingItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-stone-100">
            <h3 className="text-lg font-bold text-stone-800 mb-1"><DevEmptyStateText /></h3>
            <p className="text-stone-500">Try a different search query.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.length > 0 && (
              <div>
                {categorySearchQuery && <h3 className="text-xl font-bold text-stone-800 mb-4">Categories</h3>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map(cat => {
                    const itemCount = items.filter(i => i.category === cat.name).length;
              
                    return (
                      <div 
                        key={cat.id}
                        onClick={() => { setActiveCategoryName(cat.name); setSearchQuery(''); }}
                        className="bg-white rounded-[1.25rem] shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 border border-stone-100 overflow-hidden cursor-pointer group flex flex-col h-full transform hover:-translate-y-1"
                      >
                        <div className="aspect-[4/3] w-full relative overflow-hidden bg-stone-100 flex-shrink-0 border-b border-stone-100">
                          {cat.image ? (
                            <img src={cat.image || undefined} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 group-hover:scale-105 transition-transform duration-500">
                              <Layers className="w-12 h-12" />
                            </div>
                          )}
                          
                          <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-2 relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleCategoryVisibility(cat); }}
                                title={cat.isHidden ? "Show Category" : "Hide Category"}
                                className={`bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm hover:bg-white transition-colors border border-stone-200/50 ${cat.isHidden ? 'text-stone-400 hover:text-stone-600' : 'text-green-600 hover:text-green-700'}`}
                              >
                                {cat.isHidden ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={() => setIsDropdownOpenFor(isDropdownOpenFor === cat.id ? null : cat.id)}
                                className="bg-white/90 backdrop-blur text-stone-700 p-2 rounded-lg shadow-sm hover:bg-white hover:text-dhaba-orange transition-colors border border-stone-200/50"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {isDropdownOpenFor === cat.id && (
                                <div className="absolute right-0 top-20 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setIsDropdownOpenFor(null); handleEditCategory(cat); }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 flex items-center text-stone-700 font-medium transition-colors"
                                  >
                                    <Edit className="w-4 h-4 mr-3 text-stone-400" /> Edit Category
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setIsDropdownOpenFor(null); handleConfirmDeleteCategory(cat); }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 flex items-center text-red-600 font-medium transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3" /> Delete Category
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-5 py-4 flex-1 flex items-center justify-between bg-white">
                          <h3 className="text-xl font-bold font-serif text-stone-800 group-hover:text-dhaba-orange transition-colors">
                            {cat.name} <span className="font-sans font-medium text-stone-500 text-lg ml-1">({itemCount})</span>
                          </h3>
                          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-dhaba-orange transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {matchingItems.length > 0 && categorySearchQuery && (
              <div>
                <h3 className="text-xl font-bold text-stone-800 mb-4">Matching Items</h3>
                <div className="bg-white rounded-[1.25rem] shadow-sm border border-stone-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-stone-600 text-sm border-b border-stone-200">
                          <th className="px-6 py-4 font-medium">Item</th>
                          <th className="px-6 py-4 font-medium">Category</th>
                          <th className="px-6 py-4 font-medium">Price</th>
                          <th className="px-6 py-4 font-medium">Badges</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {matchingItems.map(item => (
                          <tr key={item.id} className="hover:bg-stone-50 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <img src={item.image || undefined} alt={item.name} className="w-12 h-12 rounded-lg object-cover mr-4 border border-stone-200" />
                                <div>
                                  <div className="font-bold text-stone-800 flex items-center gap-2 text-base">
                                    {item.name}
                                    <span className={`w-2 h-2 rounded-full ${item.dietaryPreference === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} title={item.dietaryPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                                  </div>
                                  <div className="text-sm text-stone-500 max-w-[240px] truncate" title={item.description}>{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-stone-800">
                                {item.category}
                            </td>
                            <td className="px-6 py-4 font-medium text-stone-800">
                              <div>Full: ₹{item.price}{item.fullPortionPieces ? ` (${item.fullPortionPieces} pcs)` : ''}</div>
                              {item.hasHalfPortion && <div className="text-stone-500 text-sm">Half: ₹{item.halfPrice}{item.halfPortionPieces ? ` (${item.halfPortionPieces} pcs)` : ''}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {item.isBestSeller && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    Best Seller
                                  </span>
                                )}
                                {item.isPopular && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-dhaba-orange/10 text-dhaba-orange border border-dhaba-orange/20">
                                    Popular
                                  </span>
                                )}
                                {item.outOfStock && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                    Out of Stock
                                  </span>
                                )}
                                {item.spiceLevel !== 'None' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                    {item.spiceLevel}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="text-stone-400 hover:text-dhaba-orange transition-colors mr-3" title="Edit">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }} className="text-stone-400 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  const renderItemsTable = () => {
    if (filteredItems.length === 0) {
    
  return (
        <div className="p-16 text-center flex flex-col items-center">
          <ImageIcon className="w-16 h-16 text-stone-200 mb-4" />
          <h3 className="text-lg font-bold text-stone-800 mb-2"><DevEmptyStateText /></h3>
          <p className="text-stone-500 mb-6">
            {searchQuery ? "There are no items matching the provided search criteria." : `Start building the "${activeCategoryName}" category by adding your first dish.`}
          </p>
          <button 
            onClick={() => { resetForm(); setFormData(prev => ({ ...prev, category: activeCategoryName || '' })); setIsFormOpen(true); }}
            className="bg-dhaba-orange text-white px-6 py-2 rounded-lg font-medium flex items-center shadow-md hover:bg-dhaba-orange-light transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Item
          </button>
        </div>
      );
    }
    
  
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-dhaba-orange/30 transition-all cursor-pointer flex flex-col group overflow-hidden"
          >
            <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                </div>
              )}
              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                {item.isBestSeller && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 shadow-sm">
                    Best Seller
                  </span>
                )}
                {item.isPopular && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-dhaba-orange text-white shadow-sm">
                    Popular
                  </span>
                )}
                {item.spiceLevel !== 'None' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white shadow-sm flex items-center gap-1">
                    🌶️ {item.spiceLevel}
                  </span>
                )}
              </div>
              {/* Dietary Indicator */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                <span className={`block w-3 h-3 rounded-full ${item.dietaryPreference === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} title={item.dietaryPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}></span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-lg text-stone-800 leading-tight">{item.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1.5 text-stone-400 hover:text-dhaba-orange hover:bg-orange-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
              
              <div className="flex items-end justify-between mt-auto pt-4 border-t border-stone-100">
                <div className="space-y-1">
                  <div className="font-bold text-dhaba-dark text-lg">
                    ₹{item.price} <span className="text-xs text-stone-400 font-normal">{item.fullPortionPieces ? `(${item.fullPortionPieces} pcs)` : ''}</span>
                  </div>
                  {item.hasHalfPortion && (
                    <div className="text-sm font-medium text-stone-500">
                      Half: ₹{item.halfPrice} <span className="text-xs text-stone-400 font-normal">{item.halfPortionPieces ? `(${item.halfPortionPieces} pcs)` : ''}</span>
                    </div>
                  )}
                </div>
                {item.outOfStock && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold uppercase rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, moduleType: 'features' | 'menu' | 'category' = 'features') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `uploads/${uniqueSuffix}.${ext}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      if (moduleType === 'features') {
        setFeatureForm(prev => ({ ...prev, [fieldName]: url }));
      } else if (moduleType === 'menu') {
        setFormData(prev => ({ ...prev, [fieldName]: url }));
      } else if (moduleType === 'category') {
        setCategoryForm(prev => ({ ...prev, [fieldName]: url }));
      }
    } catch (err: any) {
      console.error("Upload failed", err);
      toast.error('Upload failed: ' + err.message);
    }
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = featureForm.id ? 'PUT' : 'POST';
    const url = featureForm.id ? `/api/features/${featureForm.id}` : '/api/features';
    
    // Auto-suggest icon if empty and it's new
    let finalIcon = featureForm.iconName;
    if (!featureForm.id && (!finalIcon || finalIcon === 'Sparkles')) {
      finalIcon = getSuggestedIcon(featureForm.title);
    }
    
    const body = {
      ...featureForm,
      iconName: finalIcon,
      displayOrder: featureForm.id ? features.find(f => f.id === featureForm.id)?.displayOrder : features.length
    };
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success(featureForm.id ? 'Feature updated!' : 'Feature added!');
        setIsFeatureFormOpen(false);
        setFeatureForm({ id: null, title: '', description: '', videoUrl: '', iconName: 'Sparkles', isActive: true });
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error('Failed to save feature: ' + (errData.error || res.statusText || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save feature: ' + (err.message || 'Network error'));
    }
  };

  const handleToggleFeature = async (feature: any) => {
    try {
      await fetch(`/api/features/${feature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feature, isActive: !feature.isActive })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeature = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Feature",
      message: "Are you sure you want to delete this feature?",
      onConfirm: async () => {
        try {
          await fetch(`/api/features/${id}`, { method: 'DELETE' });
          fetchData();
        } catch (err) {
          console.error(err);
        }
      }
    });
    return;
    try {
      await fetch(`/api/features/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderFeature = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;
    
    const newFeatures = [...features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap displayOrder
    const tempOrder = newFeatures[index].displayOrder;
    newFeatures[index].displayOrder = newFeatures[targetIndex].displayOrder;
    newFeatures[targetIndex].displayOrder = tempOrder;
    
    // Swap in array for immediate UI update
    const temp = newFeatures[index];
    newFeatures[index] = newFeatures[targetIndex];
    newFeatures[targetIndex] = temp;
    
    queryClient.setQueryData(['admin_data'], (old: any) => {
      if (!old) return old;
      return { ...old, features: newFeatures };
    });
    
    // Save to backend
    try {
      await Promise.all([
        fetch(`/api/features/${newFeatures[index].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFeatures[index])
        }),
        fetch(`/api/features/${newFeatures[targetIndex].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFeatures[targetIndex])
        })
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const renderFeaturesModule = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div>
          <h2 className="text-2xl font-serif font-bold text-dhaba-dark">Why Stop Here?</h2>
          <p className="text-stone-500">Manage the features and amenities shown on the homepage.</p>
        </div>
        <button 
          onClick={() => {
            setFeatureForm({ id: null, title: '', description: '', videoUrl: '', iconName: 'Sparkles', isActive: true });
            setIsFeatureFormOpen(true);
          }}
          className="bg-dhaba-orange hover:bg-dhaba-orange/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center shadow-sm hover:shadow active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Feature
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-100 shadow-sm"></div>
          ))}
        </div>
      ) : features.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <Star className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-800 mb-2"><DevEmptyStateText /></h3>
          <p className="text-stone-500 mb-6">Add amenities or special highlights to display on the storefront.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div key={feature.id} className={`bg-white rounded-2xl border ${feature.isActive ? 'border-stone-200' : 'border-stone-200 opacity-60'} overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group`}>
            <div className="aspect-video bg-stone-100 relative border-b border-stone-100 overflow-hidden flex-shrink-0">
              {feature.videoUrl ? (
                (() => {
                  const isYouTube = feature.videoUrl.includes('youtube.com') || feature.videoUrl.includes('youtu.be');
                  const isImage = feature.videoUrl.trim().match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?(#.*)?$/i) != null;
                  if (isYouTube) {
                    const match = feature.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
                    const ytId = (match && match[2].length === 11) ? match[2] : null;
                    return ytId ? <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="YouTube Preview" /> : <div className="w-full h-full bg-stone-200"></div>;
                  }
                  if (isImage) {
                    return <img src={feature.videoUrl || undefined} className="w-full h-full object-cover" alt="Feature" />;
                  }
                  return <video src={feature.videoUrl || undefined} autoPlay muted loop playsInline className="w-full h-full object-cover" />;
                })()
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                  <Video className="w-10 h-10 opacity-50" />
                  <span className="text-sm font-medium">No background video</span>
                </div>
              )}
              {!feature.isActive && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="bg-white/90 text-stone-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">Disabled</span>
                </div>
              )}
              
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm z-20">
                <DynamicIcon name={feature.iconName} className="w-5 h-5 text-dhaba-orange" />
              </div>
              
              <div className="absolute top-3 right-3 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleReorderFeature(idx, 'up')}
                  disabled={idx === 0}
                  className="bg-white/90 backdrop-blur p-1.5 rounded-md hover:bg-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ArrowUp className="w-4 h-4 text-stone-600" />
                </button>
                <button 
                  onClick={() => handleReorderFeature(idx, 'down')}
                  disabled={idx === features.length - 1}
                  className="bg-white/90 backdrop-blur p-1.5 rounded-md hover:bg-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ArrowDown className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-stone-800 font-serif">{feature.title}</h3>
                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-md font-mono">{feature.iconName}</span>
              </div>
              <p className="text-sm text-stone-500 mb-6 flex-1 line-clamp-3">{feature.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
                <button 
                  onClick={() => handleToggleFeature(feature)}
                  className={`flex items-center text-sm font-medium transition-colors ${feature.isActive ? 'text-green-600 hover:text-green-700' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  {feature.isActive ? <ToggleRight className="w-5 h-5 mr-1.5" /> : <ToggleLeft className="w-5 h-5 mr-1.5" />}
                  {feature.isActive ? 'Active' : 'Hidden'}
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setFeatureForm(feature); setIsFeatureFormOpen(true); }}
                    className="p-2 text-stone-400 hover:text-dhaba-orange hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteFeature(feature.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      
      {isFeatureFormOpen && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-2xl font-bold font-serif text-stone-800">{featureForm.id ? 'Edit Feature' : 'Add New Feature'}</h2>
              <button onClick={() => setIsFeatureFormOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors p-2 hover:bg-stone-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveFeature} className="p-6 overflow-y-auto" data-lenis-prevent="true">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={featureForm.title || ''} onChange={e => setFeatureForm({...featureForm, title: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange/20 focus:border-dhaba-orange outline-none transition-all" placeholder="e.g., Open 24/7" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea required value={featureForm.description || ''} onChange={e => setFeatureForm({...featureForm, description: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange/20 focus:border-dhaba-orange outline-none transition-all h-24 resize-none" placeholder="Brief description of this amenity..." />
                </div>
                
                                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Background Media (Video/Photo)</label>
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Video className="h-4 w-4 text-stone-400" />
                      </div>
                      <input type="text" value={featureForm.videoUrl || ''} onChange={e => setFeatureForm({...featureForm, videoUrl: e.target.value})} className="w-full pl-10 p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange/20 focus:border-dhaba-orange outline-none transition-all" placeholder="Enter URL or upload a file below" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-500">Or upload:</span>
                      <input 
                        type="file" 
                        accept="video/*,image/*" 
                        onChange={(e) => handleFileUpload(e, 'videoUrl', 'features')} 
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-dhaba-orange/10 file:text-dhaba-orange hover:file:bg-dhaba-orange/20 cursor-pointer" 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 mt-2 flex items-center"><Star className="w-3 h-3 mr-1" /> Use direct MP4 links, YouTube URLs, or upload a local file.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Custom Icon Name</label>
                  <div className="flex gap-3">
                    <input type="text" value={featureForm.iconName || ''} onChange={e => setFeatureForm({...featureForm, iconName: e.target.value})} className="flex-1 p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-dhaba-orange/20 focus:border-dhaba-orange outline-none transition-all" placeholder="e.g., Clock, Car, Coffee" />
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200 text-stone-500">
                      <DynamicIcon name={featureForm.iconName || getSuggestedIcon(featureForm.title)} className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">Leave as "Sparkles" or empty to auto-detect based on title. Uses Lucide Icons.</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFeatureFormOpen(false)} className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-dhaba-dark hover:bg-stone-800 text-white rounded-xl font-medium transition-colors flex items-center">
                  <Save className="w-4 h-4 mr-2" /> Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );



  const handleRecoverCategory = async (id: number) => {
    try {
      await fetch(`/api/categories/${id}/recover`, { method: 'POST' });
      fetchData();
    } catch (e) {}
  };
  const handleRecoverItem = async (id: number) => {
    try {
      await fetch(`/api/menu-items/${id}/recover`, { method: 'POST' });
      fetchData();
    } catch (e) {}
  };

  const handlePermanentDeleteCategory = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Category",
      message: "Are you sure you want to permanently delete this category? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await fetch(`/api/categories/${id}/permanent`, { method: 'DELETE' });
          fetchData();
        } catch (e) {}
      }
    });
  };

  const handlePermanentDeleteItem = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Item",
      message: "Are you sure you want to permanently delete this item? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await fetch(`/api/menu-items/${id}/permanent`, { method: 'DELETE' });
          fetchData();
        } catch (e) {}
      }
    });
  };

  const renderRecoverModule = () => (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-800">Recycle Bin</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
          <h3 className="text-lg font-bold mb-4 text-stone-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-stone-400" /> Categories
          </h3>
          {deletedData.categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-400 font-medium">No deleted categories</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedData.categories.map(cat => (
                <div key={cat.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
                  <span className="font-bold text-stone-700">{cat.name}</span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleRecoverCategory(cat.id)} className="flex-1 sm:flex-none text-xs bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 font-bold transition-all hover:-translate-y-0.5 shadow-sm">Recover</button>
                    <button onClick={() => handlePermanentDeleteCategory(cat.id)} className="flex-1 sm:flex-none text-xs bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 font-bold transition-all hover:-translate-y-0.5 border border-red-100">Permanent Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items Section */}
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
          <h3 className="text-lg font-bold mb-4 text-stone-800 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-stone-400" /> Menu Items
          </h3>
          {deletedData.menuItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-400 font-medium">No deleted items</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedData.menuItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
                  <div>
                    <span className="font-bold text-stone-700 block">{item.name}</span>
                    <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleRecoverItem(item.id)} className="flex-1 sm:flex-none text-xs bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 font-bold transition-all hover:-translate-y-0.5 shadow-sm">Recover</button>
                    <button onClick={() => handlePermanentDeleteItem(item.id)} className="flex-1 sm:flex-none text-xs bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 font-bold transition-all hover:-translate-y-0.5 border border-red-100">Permanent Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MODULE_LABELS: Record<string, string> = {
    menu: 'Menu Content', features: 'Why Stop Here?',
    analytics: 'Analytics', reviews: 'Reviews', passwords: 'Password Security', printer: 'Printer Settings',
    managers: 'Managers', stats: 'Revenue Stats', orders: 'Orders Control',
    billing: 'Make Bills', recover: 'Recycle Bin',
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--color-dashboard-bg,#f7f4f0)', fontFamily: 'var(--font-sans)' }}>

      {/* Sidebar Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
          className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-all duration-300 ease-in-out lg:relative lg:z-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}
          style={{ background: 'linear-gradient(180deg,#1a1008 0%,#241712 65%,#1a1008 100%)' }}
        >
        {/* Sidebar Header & Profile */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(200,155,60,0.12)' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89B3C] to-amber-600 flex items-center justify-center text-[#1a1008] font-bold text-lg shadow-[0_0_15px_rgba(200,155,60,0.4)]">
              {session?.name ? session.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">{session?.name?.toUpperCase() || 'SUPERADMIN'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89B3C]" />
                <p className="text-[#C89B3C] text-xs font-medium uppercase tracking-wider">{session?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors" title="Close Sidebar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" data-lenis-prevent="true">
          {([
            { key: 'menu',      label: 'Menu Content',      icon: <LayoutDashboard className="w-5 h-5" /> },
            { key: 'features',  label: 'Why Stop Here?',    icon: <Star className="w-5 h-5" /> },
            // { key: 'analytics', label: 'Analytics',         icon: <Activity className="w-5 h-5" /> },
            { key: 'reviews',   label: 'Reviews',           icon: <Star className="w-5 h-5" /> },
            { key: 'printer', label: 'Printer Settings', icon: <Printer className="w-5 h-5" /> },
            { key: 'managers',  label: 'Manage Staff',      icon: <Users className="w-5 h-5" /> },
            { key: 'stats',     label: 'Revenue Stats',     icon: <Activity className="w-5 h-5" /> },
            { key: 'revenue',   label: 'Daily Revenue',     icon: <Clock className="w-5 h-5" /> },
            { key: 'orders',    label: 'Orders Control',    icon: <Package className="w-5 h-5" /> },
            { key: 'billing',   label: 'Make Bills',        icon: <ShoppingCart className="w-5 h-5" /> },
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { 
                setActiveModule(key as any); 
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`dash-sidebar-item${activeModule === key ? ' active' : ''}`}
            >
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
          <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => { 
                setActiveModule('recover'); 
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`dash-sidebar-item${activeModule === 'recover' ? ' active' : ''}`}
            >
              <span className="icon"><Trash2 className="w-5 h-5" /></span>
              Recycle Bin
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-6 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
          <button onClick={handleLock} className="dash-sidebar-item w-full" style={{ color: '#ef4444' }}>
            <span className="icon"><Lock className="w-5 h-5" style={{ color: '#ef4444' }} /></span>
            Lock Dashboard
          </button>
          <a href={mainWebsiteUrl} className="dash-sidebar-item">
            <span className="icon"><ArrowLeft className="w-5 h-5" /></span>
            Back to Website
          </a>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Floating Main Menu Toggle Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl bg-dhaba-dark text-white hover:bg-stone-800 transition-all active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        {/* Scrollable Content */}
        <div 
          data-lenis-prevent="true"
          className={`flex-1 ${activeModule === 'billing' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 lg:p-8 pb-8'}`}
        >
        <div className={`${activeModule === 'billing' ? 'h-full' : 'max-w-6xl mx-auto w-full'}`}>

        
        <Suspense fallback={<div className="flex h-64 items-center justify-center text-stone-500 animate-pulse">Loading module...</div>}>
        {activeModule === 'printer' ? (
          <PrinterSettings role="admin" />
        ) : activeModule === 'managers' ? (
          <AdminManagers />
        ) : activeModule === 'stats' ? (
          <ManagerStats role="admin" />
        ) : activeModule === 'revenue' ? (
          <ManagerDailyRevenue />
        ) : activeModule === 'orders' ? (
          <ManagerOrders managerName="Admin" role="admin" />
        ) : activeModule === 'billing' ? (
          <ManagerBilling managerName="Admin" role="admin" />
        ) : activeModule === 'reviews' ? (
          <AdminReviews />
        ) : activeModule === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeModule === 'menu' ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            {!activeCategoryName ? (
              <>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-dhaba-dark tracking-tight">Menu Categories</h1>
                <p className="text-stone-500 mt-1">Manage your dhaba's categories and their dishes</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-dhaba-dark tracking-tight">{activeCategoryName}</h1>
                <p className="text-stone-500 mt-1">Manage menu items in this category</p>
              </>
            )}
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <a href={mainWebsiteUrl} className="px-4 py-2 text-stone-600 hover:text-dhaba-orange font-medium bg-white border border-stone-200 rounded-lg shadow-sm transition-colors text-sm sm:text-base">
              View Website
            </a>
            {!activeCategoryName ? (
              <button 
                onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', image: '', startTime: '', endTime: '' }); setIsCategoryModalOpen(true); }}
                className="bg-dhaba-dark hover:bg-stone-800 text-white px-5 py-2 rounded-lg font-medium flex items-center transition-colors shadow-md text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </button>
            ) : (
              <button 
                onClick={() => { resetForm(); setFormData(prev => ({ ...prev, category: activeCategoryName || '' })); setIsFormOpen(true); }}
                className="bg-dhaba-orange hover:bg-dhaba-orange-light text-white px-5 py-2 rounded-lg font-medium flex items-center transition-colors shadow-md text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Menu Item
              </button>
            )}
          </div>
        </div>

        {!activeCategoryName ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-60 animate-pulse border border-stone-100"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
              <Layers className="w-16 h-16 text-stone-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-800 mb-2"><DevEmptyStateText /></h3>
              <p className="text-stone-500">Create your first category to start building the menu.</p>
            </div>
          ) : (
            renderCategoryCards()
          )
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button 
                onClick={() => { setActiveCategoryName(null); setSearchQuery(''); }}
                className="text-stone-600 hover:text-dhaba-orange flex items-center font-medium transition-colors bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
              </button>
              
              <div className="relative w-full sm:w-80">
                <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={`Search in ${activeCategoryName}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none bg-white transition-shadow"
                />
              </div>
            </div>
            
            {renderItemsTable()}
          </div>
        )}

      {isCategoryModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl font-bold font-serif text-dhaba-dark">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-700">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name || ''}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Starters"
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none bg-white transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-700">Image URL (Optional)</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={categoryForm.image || ''}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Enter URL or upload an image"
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none bg-white transition-shadow"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-500">Or upload:</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', 'category')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-dhaba-orange/10 file:text-dhaba-orange hover:file:bg-dhaba-orange/20 cursor-pointer" />
                    </div>
                  </div>
                </div>
                
                {categoryForm.name.toLowerCase() === 'breakfast' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-stone-700">Start Time</label>
                      <TimePicker
                        value={categoryForm.startTime || ''}
                        onChange={(val) => setCategoryForm(prev => ({ ...prev, startTime: val }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-stone-700">End Time</label>
                      <TimePicker
                        value={categoryForm.endTime || ''}
                        onChange={(val) => setCategoryForm(prev => ({ ...prev, endTime: val }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-end mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsCategoryModalOpen(false)} 
                  className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingCategory}
                  className="px-5 py-2.5 bg-dhaba-dark text-white rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingCategory ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> Saving...</>
                  ) : (
                    editingCategory ? 'Save Changes' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {categoryToDelete !== null && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-dhaba-dark mb-2">Delete Category?</h3>
            <p className="text-stone-500 mb-4">Are you sure you want to delete <span className="font-bold text-stone-700">"{categoryToDelete.name}"</span>?</p>
            
            {categoryToDelete.itemCount > 0 && (
              <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl mb-6 border border-red-100 text-left">
                <p className="font-bold mb-1">Warning: {categoryToDelete.itemCount} items inside!</p>
                <p>Deleting this category might leave items uncategorized. Proceed with caution.</p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteCategory(categoryToDelete.id)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {itemToDelete !== null && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-dhaba-dark mb-2">Delete Menu Item?</h3>
            <p className="text-stone-500 mb-6">Are you sure you want to delete this menu item? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(itemToDelete)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {isFormOpen && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" data-lenis-prevent="true">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-stone-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold font-serif text-dhaba-dark">{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-700">Name</label>
                    <input required name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow" placeholder="e.g. Butter Chicken" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-700">Category</label>
                    <select required name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none bg-white">
                      <option value="" disabled>Select category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                    <label className="block text-sm font-medium text-stone-700">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow h-20 resize-none" placeholder="Short description of the item..."></textarea>
                </div>
              </div>

              <div className="space-y-4">
                
                {true && (
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end border-b border-stone-100 pb-2">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Quantities & Rates (Optional)</h3>
                    <button type="button" onClick={() => setFormData(prev => ({...prev, variants: [...(prev.variants || []), {name: '', price: '', outOfStock: false}]}))} className="text-xs font-bold text-dhaba-orange hover:text-dhaba-orange-light flex items-center bg-dhaba-orange/10 px-2 py-1 rounded">
                      <Plus className="w-3 h-3 mr-1" /> Add Option
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(formData.variants || []).map((variant, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs font-medium text-stone-500 mb-1">Quantity / Name</label>
                          <input required type="text" value={variant.name} onChange={e => {
                            const newVariants = [...(formData.variants || [])];
                            newVariants[idx].name = e.target.value;
                            setFormData(prev => ({...prev, variants: newVariants}));
                          }} placeholder="e.g. 200ml" className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none" />
                        </div>
                        <div className="flex-1 min-w-[100px] relative">
                          <label className="block text-xs font-medium text-stone-500 mb-1">Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-medium">₹</span>
                            <input required type="number" value={variant.price} onChange={e => {
                              const newVariants = [...(formData.variants || [])];
                              newVariants[idx].price = e.target.value;
                              setFormData(prev => ({...prev, variants: newVariants}));
                            }} placeholder="Price" className="w-full pl-8 pr-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange outline-none" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 bg-white px-2 py-2 rounded-lg border border-stone-200 self-end mb-[2px]">
                          <input type="checkbox" checked={variant.outOfStock || false} onChange={e => {
                            const newVariants = [...(formData.variants || [])];
                            newVariants[idx].outOfStock = e.target.checked;
                            setFormData(prev => ({...prev, variants: newVariants}));
                          }} className="w-4 h-4 text-red-500 rounded border-stone-300 focus:ring-red-500" />
                          <span className="text-xs font-medium text-stone-600">Out of Stock</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 self-end mb-[2px]">
                          <div className="flex gap-1">
                            <button type="button" onClick={() => {
                              if (idx > 0) {
                                const newVariants = [...(formData.variants || [])];
                                [newVariants[idx - 1], newVariants[idx]] = [newVariants[idx], newVariants[idx - 1]];
                                setFormData(prev => ({...prev, variants: newVariants}));
                              }
                            }} className={`p-1 rounded transition-colors ${idx === 0 ? 'text-stone-200 cursor-not-allowed' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200'}`} disabled={idx === 0}>
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => {
                              const newVariants = [...(formData.variants || [])];
                              if (idx < newVariants.length - 1) {
                                [newVariants[idx + 1], newVariants[idx]] = [newVariants[idx], newVariants[idx + 1]];
                                setFormData(prev => ({...prev, variants: newVariants}));
                              }
                            }} className={`p-1 rounded transition-colors ${idx === (formData.variants || []).length - 1 ? 'text-stone-200 cursor-not-allowed' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200'}`} disabled={idx === (formData.variants || []).length - 1}>
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          <button type="button" onClick={() => {
                            const newVariants = (formData.variants || []).filter((_, i) => i !== idx);
                            setFormData(prev => ({...prev, variants: newVariants}));
                          }} className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors w-full flex justify-center">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!formData.variants || formData.variants.length === 0) && (
                      <p className="text-sm text-stone-500 italic">No variants added. Base price below will be used.</p>
                    )}
                  </div>
                </div>
              )}
              {true && (
                <>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="space-y-2 flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-stone-700">Full Price (₹)</label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-medium">₹</span>
                        <input required={!(formData.variants && formData.variants.length > 0)} type="number" name="price" value={formData.price || ''} onChange={handleChange} disabled={formData.variants && formData.variants.length > 0} className="w-full pl-8 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow disabled:bg-stone-100 disabled:text-stone-400" placeholder={formData.variants && formData.variants.length > 0 ? "Variants applied" : "e.g. 350"} />
                      </div>
                    </div>
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-stone-700">Pieces</label>
                      <input type="number" name="fullPortionPieces" value={formData.fullPortionPieces || ''} onChange={handleChange} disabled={formData.variants && formData.variants.length > 0} className="w-full mt-2 px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow disabled:bg-stone-100 disabled:text-stone-400" placeholder="Optional" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-stone-700">Half Price (₹)</label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm text-stone-600 bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm hover:bg-stone-50">
                        <input type="checkbox" name="hasHalfPortion" checked={formData.hasHalfPortion} onChange={handleChange} disabled={formData.variants && formData.variants.length > 0} className="w-4 h-4 text-dhaba-orange rounded border-stone-300 focus:ring-dhaba-orange disabled:opacity-50" />
                        <span className="font-medium">Enable</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-medium">₹</span>
                        <input 
                          type="number" 
                          name="halfPrice" 
                          value={formData.halfPrice || ''} 
                          onChange={handleChange} 
                          disabled={!formData.hasHalfPortion}
                          required={formData.hasHalfPortion}
                          className="w-full pl-8 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-100" 
                          placeholder={formData.hasHalfPortion ? "e.g. 180" : "N/A"} 
                        />
                      </div>
                      <div className="w-1/3">
                        <input type="number" name="halfPortionPieces" value={formData.halfPortionPieces || ''} onChange={handleChange} disabled={!formData.hasHalfPortion} className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-100" placeholder="Pieces" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-stone-700">Butter Variant</label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm text-stone-600 bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm hover:bg-stone-50">
                        <input type="checkbox" name="hasButterOption" checked={formData.hasButterOption} onChange={handleChange} className="w-4 h-4 text-dhaba-orange rounded border-stone-300 focus:ring-dhaba-orange" />
                        <span className="font-medium">Enable "With Butter"</span>
                      </label>
                    </div>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-medium">₹</span>
                      <input 
                        type="number" 
                        name="butterPrice" 
                        value={formData.butterPrice || ''} 
                        onChange={handleChange} 
                        disabled={!formData.hasButterOption}
                        required={formData.hasButterOption}
                        className="w-full pl-8 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-100 bg-white" 
                        placeholder={formData.hasButterOption ? "Extra charge e.g. 30" : "N/A"} 
                      />
                    </div>
                  </div>
                </div>
                </>
              )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-700">Dietary Preference</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="dietaryPreference" value="veg" checked={formData.dietaryPreference === 'veg'} onChange={handleChange} className="w-4 h-4 text-green-600 focus:ring-green-600" />
                        <span className="text-sm font-medium text-stone-700">Veg</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="dietaryPreference" value="non-veg" checked={formData.dietaryPreference === 'non-veg'} onChange={handleChange} className="w-4 h-4 text-red-600 focus:ring-red-600" />
                        <span className="text-sm font-medium text-stone-700">Non-Veg</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-700">Spice Level</label>
                    <select name="spiceLevel" value={formData.spiceLevel} onChange={handleChange} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none bg-white">
                      {['None', 'Mild', 'Medium', 'Spicy', 'Extra Spicy'].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700">Image URL <span className="text-stone-400 font-normal">(Optional)</span></label>
                    <div className="flex flex-col gap-2">
                      <input name="image" value={formData.image || ''} onChange={handleChange} className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-dhaba-orange focus:border-dhaba-orange outline-none transition-shadow" placeholder="Enter image URL or upload a file below" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-500">Or upload:</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', 'menu')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-dhaba-orange/10 file:text-dhaba-orange hover:file:bg-dhaba-orange/20 cursor-pointer" />
                      </div>
                      {formData.image && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">Badges & Availability</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                    <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} className="w-5 h-5 text-dhaba-orange rounded border-stone-300 focus:ring-dhaba-orange" />
                    <span className="text-sm font-medium text-stone-700">Popular</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                    <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="w-5 h-5 text-yellow-500 rounded border-stone-300 focus:ring-yellow-500" />
                    <span className="text-sm font-medium text-stone-700">Best Seller</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                    <input type="checkbox" name="isDhabaSpecial" checked={formData.isDhabaSpecial} onChange={handleChange} className="w-5 h-5 text-red-500 rounded border-stone-300 focus:ring-red-500" />
                    <span className="text-sm font-medium text-stone-700">Special</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                    <input type="checkbox" name="outOfStock" checked={formData.outOfStock} onChange={handleChange} className="w-5 h-5 text-red-500 rounded border-red-300 focus:ring-red-500" />
                    <span className="text-sm font-medium text-stone-700">Out of Stock</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Time Restriction</h3>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-stone-600 bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm hover:bg-stone-50">
                    <input type="checkbox" name="hasTiming" checked={formData.hasTiming} onChange={handleChange} className="w-4 h-4 text-dhaba-orange rounded border-stone-300 focus:ring-dhaba-orange" />
                    <span className="font-medium">Enable Timing</span>
                  </label>
                </div>
                {formData.hasTiming && (
                  <div className="grid grid-cols-2 gap-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-stone-700">Start Time</label>
                      <TimePicker
                        required={formData.hasTiming}
                        value={formData.startTime || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, startTime: val }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-stone-700">End Time</label>
                      <TimePicker
                        required={formData.hasTiming}
                        value={formData.endTime || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, endTime: val }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-stone-100 mt-8 flex justify-end gap-3 z-10">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-dhaba-dark text-white rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center shadow-md disabled:opacity-60 disabled:cursor-not-allowed gap-2">
                  {isSaving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" />{editingItemId ? 'Save Changes' : 'Add Item'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
      
          
          </>
        ) : activeModule === 'features' ? (
          renderFeaturesModule()
        ) : activeModule === 'recover' ? (
          renderRecoverModule()
        ) : null}
        </Suspense>
        </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
