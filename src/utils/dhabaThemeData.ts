// Harjinder Tourist Dhaba — Theme Data & Category Metadata
// Uses only YOUR OWN brand colors (gold #C89B3C, brown #2E1E14, orange #F97316)
// No external images; relies on category images set by the admin, or tasteful emoji fallbacks.

export interface CategoryMeta {
  emoji: string;
  punjabi: string;
  subtitle: string;
  accentColor: string; // tailwind bg class for the icon circle
}

const CATEGORY_META_MAP: Record<string, CategoryMeta> = {
  All: {
    emoji: "🍽️",
    punjabi: "ਸਾਰੇ ਪਕਵਾਨ",
    subtitle: "Browse our complete authentic menu",
    accentColor: "bg-amber-100",
  },
  Breakfast: {
    emoji: "🥞",
    punjabi: "ਨਾਸ਼ਤਾ",
    subtitle: "Fresh hot parathas, butter & chai",
    accentColor: "bg-yellow-100",
  },
  "Punjabi Special": {
    emoji: "🫓",
    punjabi: "ਪੰਜਾਬੀ ਸਪੈਸ਼ਲ",
    subtitle: "Traditional royal Punjabi recipes",
    accentColor: "bg-orange-100",
  },
  "Main Course": {
    emoji: "🍛",
    punjabi: "ਮੇਨ ਕੋਰਸ",
    subtitle: "Rich gravies & slow-cooked curries",
    accentColor: "bg-orange-100",
  },
  Dal: {
    emoji: "🍲",
    punjabi: "ਦਾਲਾਂ",
    subtitle: "Smoky dal makhani & tadka dal",
    accentColor: "bg-amber-100",
  },
  Paneer: {
    emoji: "🧀",
    punjabi: "ਪਨੀਰ ਸਪੈਸ਼ਲ",
    subtitle: "Fresh cottage cheese delicacies",
    accentColor: "bg-yellow-100",
  },
  Breads: {
    emoji: "🫓",
    punjabi: "ਰੋਟੀਆਂ",
    subtitle: "Clay-oven tandoori rotis & naan",
    accentColor: "bg-amber-100",
  },
  "Tandoori Breads": {
    emoji: "🔥",
    punjabi: "ਤੰਦੂਰੀ ਰੋਟੀਆਂ",
    subtitle: "Piping hot from the earthen tandoor",
    accentColor: "bg-red-100",
  },
  Snacks: {
    emoji: "🍢",
    punjabi: "ਸਨੈਕਸ",
    subtitle: "Smoky tikkas & crispy starters",
    accentColor: "bg-rose-100",
  },
  "Indian Snacks": {
    emoji: "🥟",
    punjabi: "ਦੇਸੀ ਸਨੈਕਸ",
    subtitle: "Pakoras, cutlets & crunchy bites",
    accentColor: "bg-amber-100",
  },
  Chinese: {
    emoji: "🥡",
    punjabi: "ਚਾਈਨੀਜ਼",
    subtitle: "Indo-Chinese noodles & manchurian",
    accentColor: "bg-red-100",
  },
  "Rice & Pulao": {
    emoji: "🍚",
    punjabi: "ਚੌਲ",
    subtitle: "Fragrant basmati rice & biryani",
    accentColor: "bg-yellow-100",
  },
  "Raita & Salad": {
    emoji: "🥗",
    punjabi: "ਰਾਇਤਾ",
    subtitle: "Chilled curd raita & fresh salad",
    accentColor: "bg-green-100",
  },
  Beverages: {
    emoji: "🥤",
    punjabi: "ਡ੍ਰਿੰਕਸ",
    subtitle: "Sweet lassi, drinks & fresh juice",
    accentColor: "bg-cyan-100",
  },
  Desserts: {
    emoji: "🍨",
    punjabi: "ਮਿਠਾਈ",
    subtitle: "Kulfi, gulab jamun & sweet treats",
    accentColor: "bg-pink-100",
  },
  Shakes: {
    emoji: "🧋",
    punjabi: "ਸ਼ੇਕ",
    subtitle: "Thick ice cream shakes & cold coffee",
    accentColor: "bg-purple-100",
  },
  Thali: {
    emoji: "🍱",
    punjabi: "ਢਾਬਾ ਥਾਲੀ",
    subtitle: "Complete royal feast with ghee",
    accentColor: "bg-amber-100",
  },
  Pizza: {
    emoji: "🍕",
    punjabi: "ਪੀਜ਼ਾ",
    subtitle: "Freshly baked cheesy pizzas",
    accentColor: "bg-red-100",
  },
  Burger: {
    emoji: "🍔",
    punjabi: "ਬਰਗਰ",
    subtitle: "Loaded vegetable & paneer burgers",
    accentColor: "bg-orange-100",
  },
  Sandwich: {
    emoji: "🥪",
    punjabi: "ਸੈਂਡਵਿਚ",
    subtitle: "Toasted jumbo club sandwiches",
    accentColor: "bg-lime-100",
  },
  Soup: {
    emoji: "🍲",
    punjabi: "ਸੂਪ",
    subtitle: "Hot tomato & vegetable soups",
    accentColor: "bg-orange-100",
  },
  Sides: {
    emoji: "🧆",
    punjabi: "ਸਾਈਡਸ",
    subtitle: "Crispy sweet corn & quick bites",
    accentColor: "bg-yellow-100",
  },
  "Virsa Spl.": {
    emoji: "⭐",
    punjabi: "ਸਪੈਸ਼ਲ",
    subtitle: "Chef's signature special dishes",
    accentColor: "bg-amber-100",
  },
  "Dhaba Special": {
    emoji: "⭐",
    punjabi: "ਢਾਬਾ ਸਪੈਸ਼ਲ",
    subtitle: "Signature dishes prepared with love",
    accentColor: "bg-amber-100",
  },
  Pasta: {
    emoji: "🍝",
    punjabi: "ਪਾਸਤਾ",
    subtitle: "Italian pasta with Indian twist",
    accentColor: "bg-orange-100",
  },
  Cake: {
    emoji: "🎂",
    punjabi: "ਕੇਕ",
    subtitle: "Fresh baked celebration cakes",
    accentColor: "bg-pink-100",
  },
  Seasonal: {
    emoji: "🌿",
    punjabi: "ਮੌਸਮੀ",
    subtitle: "Makki di roti & sarson da saag",
    accentColor: "bg-green-100",
  },
};

export function getCategoryMeta(catName: string): CategoryMeta {
  const trimmed = (catName || "").trim();
  const lower = trimmed.toLowerCase();

  if (CATEGORY_META_MAP[trimmed]) return CATEGORY_META_MAP[trimmed];

  // Keyword fallback
  if (lower.includes("breakfast") || lower.includes("prantha") || lower.includes("paratha"))
    return CATEGORY_META_MAP["Breakfast"];
  if (lower.includes("bread") || lower.includes("roti") || lower.includes("naan"))
    return CATEGORY_META_MAP["Breads"];
  if (lower.includes("tandoor")) return CATEGORY_META_MAP["Tandoori Breads"];
  if (lower.includes("dal")) return CATEGORY_META_MAP["Dal"];
  if (lower.includes("paneer") || lower.includes("cheese")) return CATEGORY_META_MAP["Paneer"];
  if (lower.includes("chinese") || lower.includes("noodle") || lower.includes("manchurian"))
    return CATEGORY_META_MAP["Chinese"];
  if (lower.includes("snack") || lower.includes("tikka") || lower.includes("kebab"))
    return CATEGORY_META_MAP["Snacks"];
  if (lower.includes("starter") || lower.includes("pakora") || lower.includes("cutlet"))
    return CATEGORY_META_MAP["Indian Snacks"];
  if (lower.includes("rice") || lower.includes("biryani") || lower.includes("pulao"))
    return CATEGORY_META_MAP["Rice & Pulao"];
  if (lower.includes("raita") || lower.includes("salad") || lower.includes("curd"))
    return CATEGORY_META_MAP["Raita & Salad"];
  if (lower.includes("drink") || lower.includes("beverage") || lower.includes("lassi") || lower.includes("juice"))
    return CATEGORY_META_MAP["Beverages"];
  if (lower.includes("shake") || lower.includes("coffee")) return CATEGORY_META_MAP["Shakes"];
  if (lower.includes("dessert") || lower.includes("sweet") || lower.includes("kulfi") || lower.includes("jamun"))
    return CATEGORY_META_MAP["Desserts"];
  if (lower.includes("thali")) return CATEGORY_META_MAP["Thali"];
  if (lower.includes("pizza")) return CATEGORY_META_MAP["Pizza"];
  if (lower.includes("burger")) return CATEGORY_META_MAP["Burger"];
  if (lower.includes("sandwich")) return CATEGORY_META_MAP["Sandwich"];
  if (lower.includes("soup")) return CATEGORY_META_MAP["Soup"];
  if (lower.includes("side")) return CATEGORY_META_MAP["Sides"];
  if (lower.includes("special") || lower.includes("spl")) return CATEGORY_META_MAP["Dhaba Special"];
  if (lower.includes("pasta")) return CATEGORY_META_MAP["Pasta"];
  if (lower.includes("cake")) return CATEGORY_META_MAP["Cake"];
  if (lower.includes("seasonal")) return CATEGORY_META_MAP["Seasonal"];
  if (lower.includes("main") || lower.includes("sabzi") || lower.includes("curry") || lower.includes("gravy"))
    return CATEGORY_META_MAP["Main Course"];

  return {
    emoji: "🍽️",
    punjabi: trimmed,
    subtitle: "Authentic Punjabi dhaba specialty",
    accentColor: "bg-amber-100",
  };
}

// Gurmukhi subtitle lookup for common dish names
const DISH_PUNJABI: Record<string, string> = {
  "dal makhani": "ਦਾਲ ਮੱਖਣੀ",
  "dal tadka": "ਦਾਲ ਤੜਕਾ",
  "dal fry": "ਦਾਲ ਫ੍ਰਾਈ",
  "yellow dal": "ਪੀਲੀ ਦਾਲ",
  "chana masala": "ਛੋਲੇ ਮਸਾਲਾ",
  "shahi paneer": "ਸ਼ਾਹੀ ਪਨੀਰ",
  "kadhai paneer": "ਕੜਾਹੀ ਪਨੀਰ",
  "paneer butter masala": "ਪਨੀਰ ਬਟਰ ਮਸਾਲਾ",
  "paneer bhurji": "ਪਨੀਰ ਭੁਰਜੀ",
  "paneer tikka": "ਪਨੀਰ ਟਿੱਕਾ",
  "malai kofta": "ਮਲਾਈ ਕੋਫ਼ਤਾ",
  "mix veg": "ਮਿਕਸ ਸਬਜ਼ੀ",
  "palak paneer": "ਪਾਲਕ ਪਨੀਰ",
  "mutter paneer": "ਮਟਰ ਪਨੀਰ",
  "rajmah": "ਰਾਜਮਾਂਹ",
  "kadhi pakora": "ਕੜ੍ਹੀ ਪਕੌੜਾ",
  "jeera aloo": "ਜੀਰਾ ਆਲੂ",
  "tandoori roti": "ਤੰਦੂਰੀ ਰੋਟੀ",
  "butter naan": "ਬਟਰ ਨਾਨ",
  "garlic naan": "ਗਾਰਲਿਕ ਨਾਨ",
  "plain naan": "ਸਾਦਾ ਨਾਨ",
  "cheese naan": "ਚੀਜ਼ ਨਾਨ",
  "missi roti": "ਮਿੱਸੀ ਰੋਟੀ",
  "lachha parantha": "ਲੱਛਾ ਪਰਾਂਠਾ",
  "aloo paratha": "ਆਲੂ ਪਰਾਂਠਾ",
  "mix paratha": "ਮਿਕਸ ਪਰਾਂਠਾ",
  "gobhi paratha": "ਗੋਭੀ ਪਰਾਂਠਾ",
  "plain rice": "ਸਾਦੇ ਚੌਲ",
  "jeera rice": "ਜੀਰਾ ਚੌਲ",
  "veg biryani": "ਵੈਜ ਬਿਰਿਆਨੀ",
  "veg pulao": "ਵੈਜ ਪੁਲਾਓ",
  "boondi raita": "ਬੂੰਦੀ ਰਾਇਤਾ",
  "sweet lassi": "ਮਿੱਠੀ ਲੱਸੀ",
  "salted lassi": "ਨਮਕੀਨ ਲੱਸੀ",
  "gulab jamun": "ਗੁਲਾਬ ਜਾਮੁਨ",
  "kulfi": "ਕੁਲਫ਼ੀ",
  "makki di roti": "ਮੱਕੀ ਦੀ ਰੋਟੀ",
  "sarson da saag": "ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ",
  "cold coffee": "ਕੋਲਡ ਕੌਫ਼ੀ",
  "veg manchurian": "ਵੈਜ ਮੰਚੂਰੀਅਨ",
  "hakka noodles": "ਹੱਕਾ ਨੂਡਲਜ਼",
  "chilli paneer": "ਚਿਲੀ ਪਨੀਰ",
};

export function getDishPunjabi(name: string, existingPunjabi?: string): string {
  if (existingPunjabi && existingPunjabi.trim()) return existingPunjabi;
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(DISH_PUNJABI)) {
    if (lower.includes(key)) return val;
  }
  return "";
}
