const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

// Add imports
code = code.replace(/import { MapPin, Phone, Clock, Truck, Coffee, Utensils, Star, ArrowRight, ArrowLeft, Instagram, Facebook, Menu, X, ShoppingBag, BookOpen, ShoppingCart, Minus, Plus, Trash2, Search, Layers, Image as ImageIcon } from 'lucide-react';/,
"import { MapPin, Phone, Clock, Truck, Coffee, Utensils, Star, ArrowRight, ArrowLeft, Instagram, Facebook, Menu, X, ShoppingBag, BookOpen, ShoppingCart, Minus, Plus, Trash2, Search, Layers, Image as ImageIcon, TrendingUp, Flame, Lock, ChevronRight, ChefHat } from 'lucide-react';");

// Replace getDietaryIcon
code = code.replace(/\{getDietaryIcon\(item\.dietaryPreference\)\}/g, "<div className={`w-3 h-3 rounded-full ${item.dietaryPreference === 'Vegetarian' ? 'bg-green-500' : 'bg-red-500'}`}></div>");

fs.writeFileSync('src/Storefront.tsx', code);
