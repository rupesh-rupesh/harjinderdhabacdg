// Harjinder Tourist Dhaba — Theme Data & Category Metadata
// Uses only YOUR OWN brand colors (gold #C89B3C, brown #241712, orange #F97316)
// Guarantees authentic Punjabi Gurmukhi text for EVERY dish and EVERY category.

export interface CategoryMeta {
  emoji: string;
  punjabi: string;
  subtitle: string;
  accentColor: string;
}

export const CATEGORY_META_MAP: Record<string, CategoryMeta> = {
  All: {
    emoji: "🍽️",
    punjabi: "ਸਾਰੇ ਪਕਵਾਨ",
    subtitle: "ਸਾਡੇ ਸਾਰੇ ਤਾਜ਼ਾ ਅਤੇ ਸਵਾਦਿਸ਼ਟ ਪਕਵਾਨ",
    accentColor: "bg-amber-100",
  },
  Breakfast: {
    emoji: "🥞",
    punjabi: "ਨਾਸ਼ਤਾ",
    subtitle: "ਤਾਜ਼ੇ ਗਰਮ ਪਰਾਂਠੇ, ਮੱਖਣ ਅਤੇ ਦੇਸੀ ਚਾਹ",
    accentColor: "bg-yellow-100",
  },
  "Punjabi Special": {
    emoji: "🫓",
    punjabi: "ਪੰਜਾਬੀ ਸਪੈਸ਼ਲ",
    subtitle: "ਪਰੰਪਰਾਗਤ ਸ਼ਾਹੀ ਪੰਜਾਬੀ ਸਵਾਦ",
    accentColor: "bg-orange-100",
  },
  "Indian Cuisine": {
    emoji: "🍛",
    punjabi: "ਇੰਡੀਅਨ ਕੁਜ਼ੀਨ",
    subtitle: "ਦੇਸੀ ਘਿਓ ਦੀਆਂ ਸਬਜ਼ੀਆਂ, ਦਾਲਾਂ ਤੇ ਪਨੀਰ",
    accentColor: "bg-orange-100",
  },
  "Main Course": {
    emoji: "🍛",
    punjabi: "ਮੇਨ ਕੋਰਸ",
    subtitle: "ਤਾਜ਼ੀਆਂ ਸਬਜ਼ੀਆਂ, ਸ਼ਾਹੀ ਪਨੀਰ ਤੇ ਦਾਲਾਂ",
    accentColor: "bg-orange-100",
  },
  Dal: {
    emoji: "🍲",
    punjabi: "ਦਾਲਾਂ",
    subtitle: "ਸਪੈਸ਼ਲ ਦਾਲ ਮੱਖਣੀ ਤੇ ਦੇਸੀ ਤੜਕਾ ਦਾਲ",
    accentColor: "bg-amber-100",
  },
  Paneer: {
    emoji: "🧀",
    punjabi: "ਪਨੀਰ ਸਪੈਸ਼ਲ",
    subtitle: "ਤਾਜ਼ੇ ਪਨੀਰ ਦੇ ਸ਼ਾਹੀ ਪਕਵਾਨ",
    accentColor: "bg-yellow-100",
  },
  Breads: {
    emoji: "🫓",
    punjabi: "ਰੋਟੀਆਂ ਤੇ ਨਾਨ",
    subtitle: "ਤੰਦੂਰੀ ਰੋਟੀਆਂ, ਨਾਨ ਤੇ ਪਰਾਂਠੇ",
    accentColor: "bg-amber-100",
  },
  "Tandoori Breads": {
    emoji: "🔥",
    punjabi: "ਤੰਦੂਰੀ ਰੋਟੀਆਂ",
    subtitle: "ਮਿੱਟੀ ਦੇ ਤੰਦੂਰ 'ਚੋਂ ਗਰਮਾ-ਗਰਮ",
    accentColor: "bg-red-100",
  },
  Snacks: {
    emoji: "🍢",
    punjabi: "ਸਨੈਕਸ",
    subtitle: "ਤੰਦੂਰੀ ਟਿੱਕਾ ਤੇ ਕੁਰਕੁਰੇ ਸਟਾਰਟਰ",
    accentColor: "bg-rose-100",
  },
  "Indian Snacks": {
    emoji: "🥟",
    punjabi: "ਦੇਸੀ ਸਨੈਕਸ",
    subtitle: "ਪਕੌੜੇ, ਕਟਲੈਟ ਤੇ ਗਰਮ ਚਾਟ",
    accentColor: "bg-amber-100",
  },
  Noodles: {
    emoji: "🍜",
    punjabi: "ਨੂਡਲਜ਼",
    subtitle: "ਵੈਜ, ਹੱਕਾ ਤੇ ਚਿਲੀ ਗਾਰਲਿਕ ਨੂਡਲਜ਼",
    accentColor: "bg-amber-100",
  },
  Chinese: {
    emoji: "🥡",
    punjabi: "ਚਾਈਨੀਜ਼",
    subtitle: "ਮੰਚੂਰੀਅਨ, ਸਪ੍ਰਿੰਗ ਰੋਲ ਤੇ ਫ੍ਰਾਈਡ ਰਾਈਸ",
    accentColor: "bg-red-100",
  },
  Momos: {
    emoji: "🥟",
    punjabi: "ਮੋਮੋਸ",
    subtitle: "ਗਰਮਾ-ਗਰਮ ਸਟੀਮ ਤੇ ਫ੍ਰਾਈਡ ਮੋਮੋਸ",
    accentColor: "bg-amber-100",
  },
  "Rice & Pulao": {
    emoji: "🍚",
    punjabi: "ਚੌਲ ਅਤੇ ਪੁਲਾਓ",
    subtitle: "ਖ਼ੁਸ਼ਬੂਦਾਰ ਬਾਸਮਤੀ ਚੌਲ ਤੇ ਬਿਰਿਆਨੀ",
    accentColor: "bg-yellow-100",
  },
  "Raita/Curd": {
    emoji: "🥣",
    punjabi: "ਰਾਇਤਾ ਅਤੇ ਦਹੀਂ",
    subtitle: "ਠੰਢਾ ਦਹੀਂ ਤੇ ਤਾਜ਼ਾ ਰਾਇਤਾ",
    accentColor: "bg-green-100",
  },
  "Raita & Salad": {
    emoji: "🥣",
    punjabi: "ਰਾਇਤਾ ਅਤੇ ਦਹੀਂ",
    subtitle: "ਠੰਢਾ ਦਹੀਂ ਤੇ ਤਾਜ਼ਾ ਰਾਇਤਾ",
    accentColor: "bg-green-100",
  },
  Raita: {
    emoji: "🥣",
    punjabi: "ਰਾਇਤਾ ਅਤੇ ਦਹੀਂ",
    subtitle: "ਠੰਢਾ ਦਹੀਂ ਤੇ ਤਾਜ਼ਾ ਰਾਇਤਾ",
    accentColor: "bg-green-100",
  },
  Salad: {
    emoji: "🥗",
    punjabi: "ਸਲਾਦ",
    subtitle: "ਤਾਜ਼ਾ ਹਰਾ ਤੇ ਪਿਆਜ਼ ਸਲਾਦ",
    accentColor: "bg-green-100",
  },
  Salads: {
    emoji: "🥗",
    punjabi: "ਸਲਾਦ",
    subtitle: "ਤਾਜ਼ਾ ਹਰਾ ਤੇ ਪਿਆਜ਼ ਸਲਾਦ",
    accentColor: "bg-green-100",
  },
  Beverages: {
    emoji: "🥤",
    punjabi: "ਕੌਫ਼ੀ ਤੇ ਲੱਸੀ",
    subtitle: "ਮਿੱਠੀ ਲੱਸੀ, ਸ਼ੇਕ, ਕੋਲਡ ਡ੍ਰਿੰਕਸ ਤੇ ਚਾਹ",
    accentColor: "bg-cyan-100",
  },
  Mocktails: {
    emoji: "🍹",
    punjabi: "ਮੌਕਟੇਲਜ਼",
    subtitle: "ਠੰਢੇ ਨਿੰਬੂ ਪਾਣੀ ਤੇ ਤਾਜ਼ਗੀ ਭਰੇ ਮੋਜੀਟੋ",
    accentColor: "bg-teal-100",
  },
  Deserts: {
    emoji: "🍨",
    punjabi: "ਡੈਜ਼ਰਟਸ",
    subtitle: "ਗਰਮ ਗੁਲਾਬ ਜਾਮੁਨ ਤੇ ਦੇਸੀ ਮਿਠਾਈਆਂ",
    accentColor: "bg-pink-100",
  },
  Desserts: {
    emoji: "🍨",
    punjabi: "ਡੈਜ਼ਰਟਸ",
    subtitle: "ਗਰਮ ਗੁਲਾਬ ਜਾਮੁਨ ਤੇ ਦੇਸੀ ਮਿਠਾਈਆਂ",
    accentColor: "bg-pink-100",
  },
  Shakes: {
    emoji: "🧋",
    punjabi: "ਸ਼ੇਕਸ",
    subtitle: "ਠੰਢੇ ਆਈਸਕ੍ਰੀਮ ਸ਼ੇਕ ਤੇ ਕੋਲਡ ਕੌਫ਼ੀ",
    accentColor: "bg-purple-100",
  },
  Thali: {
    emoji: "🍱",
    punjabi: "ਢਾਬਾ ਥਾਲੀ",
    subtitle: "ਦੇਸੀ ਘਿਓ ਵਾਲੀ ਪੂਰੀ ਸ਼ਾਹੀ ਥਾਲੀ",
    accentColor: "bg-amber-100",
  },
  Pizza: {
    emoji: "🍕",
    punjabi: "ਪੀਜ਼ਾ",
    subtitle: "ਤਾਜ਼ਾ ਬੇਕ ਕੀਤਾ ਚੀਜ਼ ਪੀਜ਼ਾ",
    accentColor: "bg-red-100",
  },
  Burger: {
    emoji: "🍔",
    punjabi: "ਬਰਗਰ",
    subtitle: "ਕ੍ਰਿਸਪੀ ਵੈਜ ਤੇ ਪਨੀਰ ਬਰਗਰ",
    accentColor: "bg-orange-100",
  },
  Sandwich: {
    emoji: "🥪",
    punjabi: "ਸੈਂਡਵਿਚ",
    subtitle: "ਗ੍ਰਿਲਡ ਤੇ ਕਲੱਬ ਸੈਂਡਵਿਚ",
    accentColor: "bg-lime-100",
  },
  Soup: {
    emoji: "🍲",
    punjabi: "ਸੂਪ",
    subtitle: "ਗਰਮ ਟਮਾਟਰ ਤੇ ਵੈਜੀਟੇਬਲ ਸੂਪ",
    accentColor: "bg-orange-100",
  },
  Sides: {
    emoji: "🧆",
    punjabi: "ਸਾਈਡਸ",
    subtitle: "ਕੁਰਕੁਰੇ ਪਾਪੜ ਤੇ ਕੌਰਨ",
    accentColor: "bg-yellow-100",
  },
  "Dhaba Special": {
    emoji: "⭐",
    punjabi: "ਢਾਬਾ ਸਪੈਸ਼ਲ",
    subtitle: "ਹਰਜਿੰਦਰ ਢਾਬੇ ਦੇ ਮਸ਼ਹੂਰ ਪਕਵਾਨ",
    accentColor: "bg-amber-100",
  },
  Pasta: {
    emoji: "🍝",
    punjabi: "ਪਾਸਤਾ",
    subtitle: "ਦੇਸੀ ਸਵਾਦ ਵਾਲਾ ਵੈਜ ਪਾਸਤਾ",
    accentColor: "bg-orange-100",
  },
  Cake: {
    emoji: "🎂",
    punjabi: "ਕੇਕ ਤੇ ਪੇਸਟਰੀ",
    subtitle: "ਤਾਜ਼ੇ ਬੇਕ ਕੀਤੇ ਕੇਕ",
    accentColor: "bg-pink-100",
  },
  Seasonal: {
    emoji: "🌿",
    punjabi: "ਮੌਸਮੀ ਖ਼ੁਰਾਕ",
    subtitle: "ਮੱਕੀ ਦੀ ਰੋਟੀ ਤੇ ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ",
    accentColor: "bg-green-100",
  },
  Tandoori: {
    emoji: "🔥",
    punjabi: "ਤੰਦੂਰੀ",
    subtitle: "ਤੰਦੂਰੀ ਸਨੈਕਸ ਤੇ ਰੋਟੀਆਂ",
    accentColor: "bg-red-100",
  },
  Soya: {
    emoji: "🍢",
    punjabi: "ਸੋਇਆ ਚਾਪ",
    subtitle: "ਮਲਾਈ ਚਾਪ ਤੇ ਤੰਦੂਰੀ ਚਾਪ",
    accentColor: "bg-orange-100",
  },
  Tea: {
    emoji: "☕",
    punjabi: "ਦੇਸੀ ਚਾਹ",
    subtitle: "ਗੁੜ ਵਾਲੀ ਚਾਹ ਤੇ ਮਸਾਲਾ ਚਾਹ",
    accentColor: "bg-amber-100",
  },
};

// Clean and normalize strings for matching
function normalizeKey(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/[()[\]{}_/\\.,\-+*&^%$#@!~`'":;?<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Exact Static Gurmukhi Overrides for Dishes (Highest Priority)
// ─────────────────────────────────────────────────────────────────────────────
export const STATIC_DISH_PUNJABI: Record<string, string> = {
  // Part 2: Broken & Misspelled Dish Names
  "tandoori aloo piyaj paratha": "ਤੰਦੂਰੀ ਆਲੂ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori aloo pyaj paratha": "ਤੰਦੂਰੀ ਆਲੂ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori aloo pyaz paratha": "ਤੰਦੂਰੀ ਆਲੂ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori aloo piyaj parantha": "ਤੰਦੂਰੀ ਆਲੂ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori piyaj paratha": "ਤੰਦੂਰੀ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori pyaj paratha": "ਤੰਦੂਰੀ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori pyaz paratha": "ਤੰਦੂਰੀ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tandoori piyaj parantha": "ਤੰਦੂਰੀ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tawa piyaj paratha": "ਤਵਾ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tawa pyaj paratha": "ਤਵਾ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tawa pyaz paratha ": "ਤਵਾ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "tawa piyaj parantha": "ਤਵਾ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "chole bhature": "ਛੋਲੇ ਭਟੂਰੇ",
  "chhole bhature": "ਛੋਲੇ ਭਟੂਰੇ",
  "chana bhatura": "ਛੋਲੇ ਭਟੂਰੇ",
  "chana bhature": "ਛੋਲੇ ਭਟੂਰੇ",
  "dhaba special kadahi panner": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕੜਾਹੀ ਪਨੀਰ",
  "dhaba special kadahi paneer": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕੜਾਹੀ ਪਨੀਰ",
  "dhaba spl kadahi panner": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕੜਾਹੀ ਪਨੀਰ",
  "dhaba spl kadahi paneer": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕੜਾਹੀ ਪਨੀਰ",
  "dhaba special kadhai paneer": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕੜਾਹੀ ਪਨੀਰ",
  "sev bhaji": "ਸੇਵ ਭਾਜੀ",
  "shev bhaji": "ਸੇਵ ਭਾਜੀ",
  "sahi paneer": "ਸ਼ਾਹੀ ਪਨੀਰ",
  "shahi paneer": "ਸ਼ਾਹੀ ਪਨੀਰ",
  "kadahi mushroom": "ਕੜਾਹੀ ਮਸ਼ਰੂਮ",
  "kadhai mushroom": "ਕੜਾਹੀ ਮਸ਼ਰੂਮ",
  "karahi mushroom": "ਕੜਾਹੀ ਮਸ਼ਰੂਮ",
  "mushroom do pyaza": "ਮਸ਼ਰੂਮ ਦੋ ਪਿਆਜ਼ਾ",
  "mushroom do pyaj": "ਮਸ਼ਰੂਮ ਦੋ ਪਿਆਜ਼ਾ",
  "mushroom dopyaza": "ਮਸ਼ਰੂਮ ਦੋ ਪਿਆਜ਼ਾ",
  "chilly paneer": "ਚਿਲੀ ਪਨੀਰ",
  "chilli paneer": "ਚਿਲੀ ਪਨੀਰ",
  "chili paneer": "ਚਿਲੀ ਪਨੀਰ",
  "chilly paneer dry": "ਚਿਲੀ ਪਨੀਰ",
  "chilly paneer gravy": "ਚਿਲੀ ਪਨੀਰ",
  "chilli paneer dry": "ਚਿਲੀ ਪਨੀਰ",
  "chilli paneer gravy": "ਚਿਲੀ ਪਨੀਰ",
  "dal maharani": "ਦਾਲ ਮਹਾਰਾਣੀ",
  "daal maharani": "ਦਾਲ ਮਹਾਰਾਣੀ",
  "channa masala mix w b": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "channa masala mix wb": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "chana masala mix w b": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "chana masala mix wb": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "chana masala mix": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "channa masala mix": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "black chana fry": "ਬਲੈਕ ਛੋਲੇ ਫ੍ਰਾਈ",
  "kala chana fry": "ਬਲੈਕ ਛੋਲੇ ਫ੍ਰਾਈ" ,
  "espresso coffee": "ਐਸਪ੍ਰੈਸੋ ਕੌਫ਼ੀ",
  "white sugar tea": "ਵਾਈਟ ਸ਼ੂਗਰ ਚਾਹ",
  "white sugar chai": "ਵਾਈਟ ਸ਼ੂਗਰ ਚਾਹ",
  "black tea": "ਬਲੈਕ ਚਾਹ",
  "black chai": "ਬਲੈਕ ਚਾਹ",
  "milk glass": "ਦੁੱਧ ਗਲਾਸ",
  "glass milk": "ਦੁੱਧ ਗਲਾਸ",
  "gud khulad tea": "ਗੁੜ ਕੁੱਲ੍ਹੜ ਚਾਹ",
  "gud kulhad tea": "ਗੁੜ ਕੁੱਲ੍ਹੜ ਚਾਹ",
  "gur khulad tea": "ਗੁੜ ਕੁੱਲ੍ਹੜ ਚਾਹ",
  "gur kulhad tea": "ਗੁੜ ਕੁੱਲ੍ਹੜ ਚਾਹ",
  "pineapple raita": "ਪਾਈਨਐਪਲ ਰਾਇਤਾ",
  "simple thali": "ਸਿੰਪਲ ਥਾਲੀ",
  "honey chilli cauliflower": "ਹਨੀ ਚਿਲੀ ਕੌਲੀਫਲਾਵਰ",
  "honey chilly cauliflower": "ਹਨੀ ਚਿਲੀ ਕੌਲੀਫਲਾਵਰ",
  "honey chilli gobi": "ਹਨੀ ਚਿਲੀ ਕੌਲੀਫਲਾਵਰ",
  "chilly paneer pizza": "ਚਿਲੀ ਪਨੀਰ ਪੀਜ਼ਾ",
  "chilli paneer pizza": "ਚਿਲੀ ਪਨੀਰ ਪੀਜ਼ਾ",
  "chocolate shake": "ਚਾਕਲੇਟ ਸ਼ੇਕ",
  "oreo shake": "ਓਰੀਓ ਸ਼ੇਕ",
  "strawberry shake": "ਸਟ੍ਰਾਬੇਰੀ ਸ਼ੇਕ",
  "black current shake": "ਬਲੈਕ ਕਰੰਟ ਸ਼ੇਕ",
  "blackcurrant shake": "ਬਲੈਕ ਕਰੰਟ ਸ਼ੇਕ",
  "butter scotch shake": "ਬਟਰਸਕੌਚ ਸ਼ੇਕ",
  "butterscotch shake": "ਬਟਰਸਕੌਚ ਸ਼ੇਕ",
  "banana shake": "ਬਨਾਨਾ ਸ਼ੇਕ",
  "singapori noodles": "ਸਿੰਗਾਪੁਰੀ ਨੂਡਲਜ਼",
  "singapore noodles": "ਸਿੰਗਾਪੁਰੀ ਨੂਡਲਜ਼",
  "chilly garlic noodles": "ਚਿਲੀ ਗਾਰਲਿਕ ਨੂਡਲਜ਼",
  "chilli garlic noodles": "ਚਿਲੀ ਗਾਰਲਿਕ ਨੂਡਲਜ਼",
  "aloo tikki burger": "ਆਲੂ ਟਿੱਕੀ ਬਰਗਰ" ,
  "alu tikki burger": "ਆਲੂ ਟਿੱਕੀ ਬਰਗਰ",
  "amritsari kulcha": "ਅੰਮ੍ਰਿਤਸਰੀ ਕੁਲਚਾ",
  "white souce pasta": "ਵਾਈਟ ਸੌਸ ਪਾਸਤਾ",
  "white sauce pasta": "ਵਾਈਟ ਸੌਸ ਪਾਸਤਾ",
  "red souce pasta": "ਰੈੱਡ ਸੌਸ ਪਾਸਤਾ",
  "red sauce pasta": "ਰੈੱਡ ਸੌਸ ਪਾਸਤਾ",
  "mix souce pasta": "ਮਿਕਸ ਸੌਸ ਪਾਸਤਾ",
  "mix sauce pasta": "ਮਿਕਸ ਸੌਸ ਪਾਸਤਾ",
  "aachari chaap": "ਅਚਾਰੀ ਚਾਪ",
  "achari chaap": "ਅਚਾਰੀ ਚਾਪ",
  "aachari champ": "ਅਚਾਰੀ ਚਾਪ",
  "achari champ": "ਅਚਾਰੀ ਚਾਪ",
  "peri peri chaap": "ਪੈਰੀ ਪੈਰੀ ਚਾਪ",
  "peri peri champ": "ਪੈਰੀ ਪੈਰੀ ਚਾਪ",
  "chilly chaap": "ਚਿਲੀ ਚਾਪ",
  "chilli chaap": "ਚਿਲੀ ਚਾਪ",
  "chilly champ": "ਚਿਲੀ ਚਾਪ",
  "chilli champ": "ਚਿਲੀ ਚਾਪ",
  "manchow soup": "ਮਨਚਾਓ ਸੂਪ",
  "watermelon mojito": "ਵਾਟਰਮੈਲਨ ਮੋਜੀਟੋ",
  "mint mojito": "ਮਿੰਟ ਮੋਜੀਟੋ",
  "plain maggie": "ਸਾਦਾ ਮੈਗੀ",
  "plain maggi": "ਸਾਦਾ ਮੈਗੀ",
  "veg maggie": "ਵੈਜ ਮੈਗੀ",
  "veg maggi": "ਵੈਜ ਮੈਗੀ",
  "peanuts masala": "ਪੀਨਟ ਮਸਾਲਾ",
  "peanut masala": "ਪੀਨਟ ਮਸਾਲਾ",
  "veggie nuggets": "ਵੈਜੀ ਨਗੇਟਸ",
  "veg nuggets": "ਵੈਜੀ ਨਗੇਟਸ",
  "veggie smiles": "ਵੈਜੀ ਸਮਾਈਲਜ਼",
  "veg smiles": "ਵੈਜੀ ਸਮਾਈਲਜ਼",

  // Part 3: Duplicate & Incomplete Dishes
  "tandoori mix paratha": "ਤੰਦੂਰੀ ਮਿਕਸ ਪਰਾਂਠਾ",
  "tandoori mix parantha": "ਤੰਦੂਰੀ ਮਿਕਸ ਪਰਾਂਠਾ",
  "tawa mix paratha": "ਤਵਾ ਮਿਕਸ ਪਰਾਂਠਾ",
  "tawa mix parantha": "ਤਵਾ ਮਿਕਸ ਪਰਾਂਠਾ",
  "tandoori paneer paratha": "ਤੰਦੂਰੀ ਪਨੀਰ ਪਰਾਂਠਾ",
  "tandoori paneer parantha": "ਤੰਦੂਰੀ ਪਨੀਰ ਪਰਾਂਠਾ",
  "tawa paneer paratha": "ਤਵਾ ਪਨੀਰ ਪਰਾਂਠਾ",
  "tawa paneer parantha": "ਤਵਾ ਪਨੀਰ ਪਰਾਂਠਾ",
  "dhaba special dal makhani": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਦਾਲ ਮੱਖਣੀ",
  "dhaba spl dal makhani": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਦਾਲ ਮੱਖਣੀ",
  "dhaba special dal makhni": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਦਾਲ ਮੱਖਣੀ",
  "dhaba special paneer bhurji": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਪਨੀਰ ਭੁਰਜੀ",
  "dhaba spl paneer bhurji": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਪਨੀਰ ਭੁਰਜੀ",
  "rajmah masala": "ਰਾਜਮਾਂਹ ਮਸਾਲਾ",
  "rajma masala": "ਰਾਜਮਾਂਹ ਮਸਾਲਾ",
  "yellow dal handi": "ਪੀਲੀ ਦਾਲ ਹਾਂਡੀ",
  "black dal tadka": "ਕਾਲੀ ਦਾਲ ਤੜਕਾ",
  "black chana masala": "ਕਾਲੇ ਛੋਲੇ ਮਸਾਲਾ",
  "kala chana masala": "ਕਾਲੇ ਛੋਲੇ ਮਸਾਲਾ",
  "mix veg raita": "ਮਿਕਸ ਵੈਜ ਰਾਇਤਾ",
  "cheese naan with gravy": "ਚੀਜ਼ ਨਾਨ ਵਿਥ ਗ੍ਰੇਵੀ",
  "cheese naan gravy": "ਚੀਜ਼ ਨਾਨ ਵਿਥ ਗ੍ਰੇਵੀ",
  "veg biryani with raita": "ਵੈਜ ਬਿਰਿਆਨੀ ਵਿਥ ਰਾਇਤਾ",
  "veg biryani raita": "ਵੈਜ ਬਿਰਿਆਨੀ ਵਿਥ ਰਾਇਤਾ",
  "rajma rice": "ਰਾਜਮਾਂਹ ਚੌਲ",
  "rajmah rice": "ਰਾਜਮਾਂਹ ਚੌਲ",
  "green salad": "ਹਰਾ ਸਲਾਦ",
  "hot gulab jamun": "ਗਰਮ ਗੁਲਾਬ ਜਾਮੁਨ",
};

// ─────────────────────────────────────────────────────────────────────────────
// Broken Gurmukhi / Matra Replacements (Overrides corrupt existing strings)
// ─────────────────────────────────────────────────────────────────────────────
export const BROKEN_GURMUKHI_REPLACEMENTS: Record<string, string> = {
  // Categories
  "ਇਨਡਿਾਨ ੁਿਸਿਨੇ": "ਇੰਡੀਅਨ ਕੁਜ਼ੀਨ",
  "ਮੋਕਟੈਲਸ": "ਮੌਕਟੇਲਜ਼",
  "ਡੇਸੇਰਟਸ": "ਡੈਜ਼ਰਟਸ",
  "ਰਾਇਤਾ ਅਤੇ ਸਲਾਦ": "ਰਾਇਤਾ ਅਤੇ ਦਹੀਂ",

  // Broken / Misspelled dishes
  "ਤੰਦੂਰੀ ਆਲੂ ਪਿਯਾਜ ਪਰਾਂਠਾ": "ਤੰਦੂਰੀ ਆਲੂ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "ਤੰਦੂਰੀ ਪਿਯਾਜ ਪਰਾਂਠਾ": "ਤੰਦੂਰੀ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "ਤਵਾ ਪਿਯਾਜ ਪਰਾਂਠਾ": "ਤਵਾ ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "ਛੋਲੇ ਭਾਟੁਰੇ": "ਛੋਲੇ ਭਟੂਰੇ",
  "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕਾਡਾਹਿ ਪਾਨਨੇਰ": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਕੜਾਹੀ ਪਨੀਰ",
  "ਸੇਵ ਭਾਜਿ": "ਸੇਵ ਭਾਜੀ",
  "ਸਾਹਿ ਪਨੀਰ": "ਸ਼ਾਹੀ ਪਨੀਰ",
  "ਕਾਡਾਹਿ ਮਸ਼ਰੂਮ": "ਕੜਾਹੀ ਮਸ਼ਰੂਮ",
  "ਮਸ਼ਰੂਮ ਦੋ ਪਯਾਾ": "ਮਸ਼ਰੂਮ ਦੋ ਪਿਆਜ਼ਾ",
  "ਚਿਲਲਯ ਪਨੀਰ": "ਚਿਲੀ ਪਨੀਰ",
  "ਦਾਲ ਮਾਹਾਰਾਨਿ": "ਦਾਲ ਮਹਾਰਾਣੀ",
  "ਚਾਨਨਾ ਮਸਾਲਾ ਮਿਕਸ ਵ ਬ": "ਚਨਾ ਮਸਾਲਾ ਮਿਕਸ",
  "ਬਲਾਕ ਛੋਲੇ ਫ੍ਰਾਈ": "ਬਲੈਕ ਛੋਲੇ ਫ੍ਰਾਈ",
  "ਏਸਪਰੇਸਸੋ ਕੌਫ਼ੀ": "ਐਸਪ੍ਰੈਸੋ ਕੌਫ਼ੀ",
  "ਵਾਈਟ ਸੁਗਾਰ ਚਾਹ": "ਵਾਈਟ ਸ਼ੂਗਰ ਚਾਹ",
  "ਬਲਾਕ ਚਾਹ": "ਬਲੈਕ ਚਾਹ",
  "ਦੁੱਧ ਗਲਾਸਸ": "ਦੁੱਧ ਗਲਾਸ",
  "ਗੁੜ ਖੁਲਾਡ ਚਾਹ": "ਗੁੜ ਕੁੱਲ੍ਹੜ ਚਾਹ",
  "ਪਿਨੇਾਪਪਲੇ ਰਾਇਤਾ": "ਪਾਈਨਐਪਲ ਰਾਇਤਾ",
  "ਸਿਮਪਲੇ ਥਾਲੀ": "ਸਿੰਪਲ ਥਾਲੀ",
  "ਹਨੀ ਚਿਲੀ ੌਲਿਫਲੋਵੇਰ": "ਹਨੀ ਚਿਲੀ ਕੌਲੀਫਲਾਵਰ",
  "ਚਿਲਲਯ ਪਨੀਰ ਪੀਜ਼ਾ": "ਚਿਲੀ ਪਨੀਰ ਪੀਜ਼ਾ",
  "ਚੋੋਲਾਟੇ ਸ਼ੇਕ": "ਚਾਕਲੇਟ ਸ਼ੇਕ",
  "ਓਰੇੋ ਸ਼ੇਕ": "ਓਰੀਓ ਸ਼ੇਕ",
  "ਸਟਰਾਵਬੇਰਰਯ ਸ਼ੇਕ": "ਸਟ੍ਰਾਬੇਰੀ ਸ਼ੇਕ",
  "ਬਲਾਕ ੁਰਰੇਨਟ ਸ਼ੇਕ": "ਬਲੈਕ ਕਰੰਟ ਸ਼ੇਕ",
  "ਬਟਰ ਸੋਟਚ ਸ਼ੇਕ": "ਬਟਰਸਕੌਚ ਸ਼ੇਕ",
  "ਬਾਨਾਨਾ ਸ਼ੇਕ": "ਬਨਾਨਾ ਸ਼ੇਕ",
  "ਸਿਨਗਾਪੋਰਿ ਨੂਡਲਜ਼": "ਸਿੰਗਾਪੁਰੀ ਨੂਡਲਜ਼",
  "ਚਿਲਲਯ ਗਾਰਲਿਕ ਨੂਡਲਜ਼": "ਚਿਲੀ ਗਾਰਲਿਕ ਨੂਡਲਜ਼",
  "ਆਲੂ ਟਿਕਕਿ ਬਰਗਰ": "ਆਲੂ ਟਿੱਕੀ ਬਰਗਰ",
  "ਅਮਰਿਟਸਾਰਿ ਕੁਲਚਾ": "ਅੰਮ੍ਰਿਤਸਰੀ ਕੁਲਚਾ",
  "ਵਾਈਟ ਸੋੁੇ ਪਾਸਤਾ": "ਵਾਈਟ ਸੌਸ ਪਾਸਤਾ",
  "ਰੈੱਡ ਸੋੁੇ ਪਾਸਤਾ": "ਰੈੱਡ ਸੌਸ ਪਾਸਤਾ",
  "ਮਿਕਸ ਸੋੁੇ ਪਾਸਤਾ": "ਮਿਕਸ ਸੌਸ ਪਾਸਤਾ",
  "ਾਚਾਰਿ ਚਾਪ": "ਅਚਾਰੀ ਚਾਪ",
  "ਪੇਰਿ ਪੇਰਿ ਚਾਪ": "ਪੈਰੀ ਪੈਰੀ ਚਾਪ",
  "ਚਿਲਲਯ ਚਾਪ": "ਚਿਲੀ ਚਾਪ",
  "ਮਾਨਚੋਵ ਸੂਪ": "ਮਨਚਾਓ ਸੂਪ",
  "ਵਾਟੇਰਮੇਲੋਨ ਮੋਜਿਟੋ": "ਵਾਟਰਮੈਲਨ ਮੋਜੀਟੋ",
  "ਮਿਨਟ ਮੋਜਿਟੋ": "ਮਿੰਟ ਮੋਜੀਟੋ",
  "ਸਾਦਾ ਮਾਗਗਿੇ": "ਸਾਦਾ ਮੈਗੀ",
  "ਵੈਜ ਮਾਗਗਿੇ": "ਵੈਜ ਮੈਗੀ",
  "ਪੇਾਨੁਟਸ ਮਸਾਲਾ": "ਪੀਨਟ ਮਸਾਲਾ",
  "ਵੇਗਗਿੇ ਨੁਗਗੇਟਸ": "ਵੈਜੀ ਨਗੇਟਸ",
  "ਵੇਗਗਿੇ ਸਮਿਲੇਸ": "ਵੈਜੀ ਸਮਾਈਲਜ਼",
};

// Common Indian Dhaba Word Dictionary for dynamic Gurmukhi translation
export const WORD_MAP: Record<string, string> = {
  spl: "ਸਪੈਸ਼ਲ",
  special: "ਸਪੈਸ਼ਲ",
  delux: "ਡੀਲਕਸ",
  deluxe: "ਡੀਲਕਸ",
  super: "ਸੁਪਰ",
  royal: "ਸ਼ਾਹੀ",
  dal: "ਦਾਲ",
  daal: "ਦਾਲ",
  makhani: "ਮੱਖਣੀ",
  makhni: "ਮੱਖਣੀ",
  tadka: "ਤੜਕਾ",
  fry: "ਫ੍ਰਾਈ",
  fried: "ਫ੍ਰਾਈਡ",
  yellow: "ਪੀਲੀ",
  chana: "ਛੋਲੇ",
  chhole: "ਛੋਲੇ",
  chole: "ਛੋਲੇ",
  rajma: "ਰਾਜਮਾਂਹ",
  rajmah: "ਰਾਜਮਾਂਹ",
  kadhi: "ਕੜ੍ਹੀ",
  pakora: "ਪਕੌੜਾ",
  pakoda: "ਪਕੌੜਾ",
  pakore: "ਪਕੌੜੇ",
  paneer: "ਪਨੀਰ",
  panner: "ਪਨੀਰ",
  shahi: "ਸ਼ਾਹੀ",
  sahi: "ਸ਼ਾਹੀ",
  kadhai: "ਕੜਾਹੀ",
  kadahi: "ਕੜਾਹੀ",
  karahi: "ਕੜਾਹੀ",
  butter: "ਬਟਰ",
  masala: "ਮਸਾਲਾ",
  bhurji: "ਭੁਰਜੀ",
  tikka: "ਟਿੱਕਾ",
  malai: "ਮਲਾਈ",
  kofta: "ਕੋਫ਼ਤਾ",
  kopta: "ਕੋਫ਼ਤਾ",
  mix: "ਮਿਕਸ",
  veg: "ਵੈਜ",
  veggie: "ਵੈਜੀ",
  vegetable: "ਸਬਜ਼ੀ",
  palak: "ਪਾਲਕ",
  mutter: "ਮਟਰ",
  matar: "ਮਟਰ",
  mushroom: "ਮਸ਼ਰੂਮ",
  kaju: "ਕਾਜੂ",
  dum: "ਦਮ",
  aloo: "ਆਲੂ",
  alu: "ਆਲੂ",
  gobhi: "ਗੋਭੀ",
  gobi: "ਗੋਭੀ",
  pyaz: "ਪਿਆਜ਼",
  pyaaz: "ਪਿਆਜ਼",
  pyaj: "ਪਿਆਜ਼",
  piyaj: "ਪਿਆਜ਼",
  pyaza: "ਪਿਆਜ਼ਾ",
  onion: "ਪਿਆਜ਼",
  methi: "ਮੇਥੀ",
  corn: "ਕੌਰਨ",
  baingan: "ਬੈਂਗਣ",
  bharta: "ਭੜਥਾ",
  bhindi: "ਭਿੰਡੀ",
  sarson: "ਸਰ੍ਹੋਂ",
  saag: "ਸਾਗ",
  makki: "ਮੱਕੀ",
  roti: "ਰੋਟੀ",
  rotis: "ਰੋਟੀਆਂ",
  tandoori: "ਤੰਦੂਰੀ",
  tawa: "ਤਵਾ",
  naan: "ਨਾਨ",
  garlic: "ਗਾਰਲਿਕ",
  cheese: "ਚੀਜ਼",
  plain: "ਸਾਦਾ",
  missi: "ਮਿੱਸੀ",
  lachha: "ਲੱਛਾ",
  laccha: "ਲੱਛਾ",
  paratha: "ਪਰਾਂਠਾ",
  parantha: "ਪਰਾਂਠਾ",
  prantha: "ਪਰਾਂਠਾ",
  kulcha: "ਕੁਲਚਾ",
  bhatura: "ਭਟੂਰਾ",
  bhature: "ਭਟੂਰੇ",
  poori: "ਪੂਰੀ",
  puri: "ਪੂਰੀ",
  roomali: "ਰੁਮਾਲੀ",
  rumali: "ਰੁਮਾਲੀ",
  rice: "ਚੌਲ",
  jeera: "ਜੀਰਾ",
  biryani: "ਬਿਰਿਆਨੀ",
  pulao: "ਪੁਲਾਓ",
  raita: "ਰਾਇਤਾ",
  boondi: "ਬੂੰਦੀ",
  curd: "ਦਹੀਂ",
  dahi: "ਦਹੀਂ",
  salad: "ਸਲਾਦ",
  green: "ਹਰਾ",
  kachumber: "ਕਚੂੰਬਰ",
  papad: "ਪਾਪੜ",
  roasted: "ਭੁੰਨਿਆ",
  lassi: "ਲੱਸੀ",
  sweet: "ਮਿੱਠੀ",
  salted: "ਨਮਕੀਨ",
  namkeen: "ਨਮਕੀਨ",
  mango: "ਅੰਬ",
  tea: "ਚਾਹ",
  chai: "ਚਾਹ",
  gud: "ਗੁੜ",
  gur: "ਗੁੜ",
  khulad: "ਕੁੱਲ੍ਹੜ",
  kulhad: "ਕੁੱਲ੍ਹੜ",
  coffee: "ਕੌਫ਼ੀ",
  cold: "ਕੋਲਡ",
  hot: "ਗਰਮ",
  shake: "ਸ਼ੇਕ",
  shakes: "ਸ਼ੇਕ",
  kulfi: "ਕੁਲਫ਼ੀ",
  gulab: "ਗੁਲਾਬ",
  jamun: "ਜਾਮੁਨ",
  rasgulla: "ਰਸਗੁੱਲਾ",
  rabdi: "ਰਬੜੀ",
  kheer: "ਖੀਰ",
  halwa: "ਹਲਵਾ",
  gajar: "ਗਾਜਰ",
  ice: "ਆਈਸ",
  cream: "ਕਰੀਮ",
  icecream: "ਆਈਸਕ੍ਰੀਮ",
  manchurian: "ਮੰਚੂਰੀਅਨ",
  noodle: "ਨੂਡਲਜ਼",
  noodles: "ਨੂਡਲਜ਼",
  hakka: "ਹੱਕਾ",
  chilli: "ਚਿਲੀ",
  chili: "ਚਿਲੀ",
  chilly: "ਚਿਲੀ",
  spring: "ਸਪ੍ਰਿੰਗ",
  roll: "ਰੋਲ",
  rolls: "ਰੋਲ",
  chowmein: "ਚਾਓਮੀਨ",
  chaap: "ਚਾਪ",
  champ: "ਚਾਪ",
  soya: "ਸੋਇਆ",
  thali: "ਥਾਲੀ",
  regular: "ਰੈਗੂਲਰ",
  simple: "ਸਿੰਪਲ",
  harjinder: "ਹਰਜਿੰਦਰ",
  tourist: "ਟੂਰਿਸਟ",
  dhaba: "ਢਾਬਾ",
  soup: "ਸੂਪ",
  tomato: "ਟਮਾਟਰ",
  burger: "ਬਰਗਰ",
  pizza: "ਪੀਜ਼ਾ",
  sandwich: "ਸੈਂਡਵਿਚ",
  grilled: "ਗ੍ਰਿਲਡ",
  toast: "ਟੋਸਟ",
  pasta: "ਪਾਸਤਾ",
  red: "ਰੈੱਡ",
  white: "ਵਾਈਟ",
  sauce: "ਸੌਸ",
  souce: "ਸੌਸ",
  fries: "ਫ੍ਰਾਈਜ਼",
  french: "ਫ੍ਰੈਂਚ",
  finger: "ਫਿੰਗਰ",
  chips: "ਚਿਪਸ",
  crispy: "ਕੁਰਕੁਰਾ",
  honey: "ਹਨੀ",
  potato: "ਆਲੂ",
  cauliflower: "ਕੌਲੀਫਲਾਵਰ",
  gravy: "ਗ੍ਰੇਵੀ",
  dry: "ਡ੍ਰਾਈ",
  curry: "ਕਰੀ",
  milk: "ਦੁੱਧ",
  glass: "ਗਲਾਸ",
  baby: "ਬੇਬੀ",
  water: "ਪਾਣੀ",
  mineral: "ਮਿਨਰਲ",
  soda: "ਸੋਡਾ",
  lime: "ਨਿੰਬੂ",
  lemon: "ਨਿੰਬੂ",
  drink: "ਡ੍ਰਿੰਕ",
  drinks: "ਡ੍ਰਿੰਕਸ",
  beverage: "ਪੀਣ ਵਾਲੇ",
  beverages: "ਪੀਣ ਵਾਲੇ",
  mocktail: "ਮੌਕਟੇਲ",
  mocktails: "ਮੌਕਟੇਲਜ਼",
  mojito: "ਮੋਜੀਟੋ",
  mint: "ਮਿੰਟ",
  watermelon: "ਵਾਟਰਮੈਲਨ",
  dessert: "ਡੈਜ਼ਰਟ",
  desserts: "ਡੈਜ਼ਰਟਸ",
  desert: "ਡੈਜ਼ਰਟ",
  deserts: "ਡੈਜ਼ਰਟਸ",
  snacks: "ਸਨੈਕਸ",
  snack: "ਸਨੈਕ",
  breakfast: "ਨਾਸ਼ਤਾ",
  lunch: "ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ",
  dinner: "ਰਾਤ ਦਾ ਖਾਣਾ",
  main: "ਮੇਨ",
  course: "ਕੋਰਸ",
  cuisine: "ਕੁਜ਼ੀਨ",
  indian: "ਇੰਡੀਅਨ",
  chinese: "ਚਾਈਨੀਜ਼",
  momo: "ਮੋਮੋਸ",
  momos: "ਮੋਮੋਸ",
  bread: "ਰੋਟੀ",
  breads: "ਰੋਟੀਆਂ",
  seasonal: "ਮੌਸਮੀ",
  sesonal: "ਮੌਸਮੀ",
  pasanda: "ਪਸੰਦਾ",
  lababdar: "ਲਬਾਬਦਾਰ",
  do: "ਦੋ",
  handi: "ਹਾਂਡੀ",
  sev: "ਸੇਵ",
  bhaji: "ਭਾਜੀ",
  tamatar: "ਟਮਾਟਰ",
  korma: "ਕੋਰਮਾ",
  kurma: "ਕੋਰਮਾ",
  navratan: "ਨਵਰਤਨ",
  chutney: "ਚਟਣੀ",
  achar: "ਅਚਾਰ",
  achari: "ਅਚਾਰੀ",
  aachari: "ਅਚਾਰੀ",
  pickle: "ਅਚਾਰ",
  sirka: "ਸਿਰਕਾ",
  extra: "ਵਾਧੂ",
  maharani: "ਮਹਾਰਾਣੀ",
  espresso: "ਐਸਪ੍ਰੈਸੋ",
  sugar: "ਸ਼ੂਗਰ",
  black: "ਬਲੈਕ",
  kala: "ਕਾਲੇ",
  pineapple: "ਪਾਈਨਐਪਲ",
  chocolate: "ਚਾਕਲੇਟ",
  oreo: "ਓਰੀਓ",
  strawberry: "ਸਟ੍ਰਾਬੇਰੀ",
  current: "ਕਰੰਟ",
  scotch: "ਸਕੌਚ",
  banana: "ਬਨਾਨਾ",
  singapori: "ਸਿੰਗਾਪੁਰੀ",
  amritsari: "ਅੰਮ੍ਰਿਤਸਰੀ",
  peri: "ਪੈਰੀ",
  manchow: "ਮਨਚਾਓ",
  maggie: "ਮੈਗੀ",
  maggi: "ਮੈਗੀ",
  peanut: "ਪੀਨਟ",
  peanuts: "ਪੀਨਟ",
  nugget: "ਨਗੇਟ",
  nuggets: "ਨਗੇਟਸ",
  smile: "ਸਮਾਈਲ",
  smiles: "ਸਮਾਈਲਜ਼",
  with: "ਵਿਥ",
};

// Full dish exact phrase mappings
export const DISH_PHRASES: Record<string, string> = {
  // Static Dish Overrides
  ...STATIC_DISH_PUNJABI,

  // Additional Common Dishes
  "spl dal makhni": "ਸਪੈਸ਼ਲ ਦਾਲ ਮੱਖਣੀ",
  "spl dal makhani": "ਸਪੈਸ਼ਲ ਦਾਲ ਮੱਖਣੀ",
  "dal makhani": "ਦਾਲ ਮੱਖਣੀ",
  "dal makhni": "ਦਾਲ ਮੱਖਣੀ",
  "dal tadka": "ਦਾਲ ਤੜਕਾ",
  "dal fry": "ਦਾਲ ਫ੍ਰਾਈ",
  "yellow dal": "ਪੀਲੀ ਦਾਲ",
  "yellow dal tadka": "ਪੀਲੀ ਦਾਲ ਤੜਕਾ",
  "chana masala": "ਛੋਲੇ ਮਸਾਲਾ",
  "shahi paneer": "ਸ਼ਾਹੀ ਪਨੀਰ",
  "kadhai paneer": "ਕੜਾਹੀ ਪਨੀਰ",
  "paneer butter masala": "ਪਨੀਰ ਬਟਰ ਮਸਾਲਾ",
  "paneer bhurji": "ਪਨੀਰ ਭੁਰਜੀ",
  "paneer tikka": "ਪਨੀਰ ਟਿੱਕਾ",
  "paneer do pyaza": "ਪਨੀਰ ਦੋ ਪਿਆਜ਼ਾ",
  "paneer lababdar": "ਪਨੀਰ ਲਬਾਬਦਾਰ",
  "paneer pasanda": "ਪਨੀਰ ਪਸੰਦਾ",
  "handi paneer": "ਹਾਂਡੀ ਪਨੀਰ",
  "malai kofta": "ਮਲਾਈ ਕੋਫ਼ਤਾ",
  "malai kopta": "ਮਲਾਈ ਕੋਫ਼ਤਾ",
  "mix veg": "ਮਿਕਸ ਸਬਜ਼ੀ",
  "palak paneer": "ਪਾਲਕ ਪਨੀਰ",
  "mutter paneer": "ਮਟਰ ਪਨੀਰ",
  "matar paneer": "ਮਟਰ ਪਨੀਰ",
  "mushroom masala": "ਮਸ਼ਰੂਮ ਮਸਾਲਾ",
  "mutter mushroom": "ਮਟਰ ਮਸ਼ਰੂਮ",
  "kaju curry": "ਕਾਜੂ ਕਰੀ",
  "rajmah": "ਰਾਜਮਾਂਹ",
  "rajma": "ਰਾਜਮਾਂਹ",
  "kadhi pakora": "ਕੜ੍ਹੀ ਪਕੌੜਾ",
  "jeera aloo": "ਜੀਰਾ ਆਲੂ",
  "dum aloo": "ਦਮ ਆਲੂ",
  "aloo gobhi": "ਆਲੂ ਗੋਭੀ",
  "baingan bharta": "ਬੈਂਗਣ ਦਾ ਭੜਥਾ",
  "bhindi masala": "ਭਿੰਡੀ ਮਸਾਲਾ",
  "tandoori roti": "ਤੰਦੂਰੀ ਰੋਟੀ",
  "butter roti": "ਬਟਰ ਰੋਟੀ",
  "plain roti": "ਸਾਦੀ ਰੋਟੀ",
  "butter naan": "ਬਟਰ ਨਾਨ",
  "garlic naan": "ਗਾਰਲਿਕ ਨਾਨ",
  "plain naan": "ਸਾਦਾ ਨਾਨ",
  "cheese naan": "ਚੀਜ਼ ਨਾਨ",
  "missi roti": "ਮਿੱਸੀ ਰੋਟੀ",
  "lachha parantha": "ਲੱਛਾ ਪਰਾਂਠਾ",
  "laccha paratha": "ਲੱਛਾ ਪਰਾਂਠਾ",
  "aloo paratha": "ਆਲੂ ਪਰਾਂਠਾ",
  "mix paratha": "ਮਿਕਸ ਪਰਾਂਠਾ",
  "gobhi paratha": "ਗੋਭੀ ਪਰਾਂਠਾ",
  "paneer paratha": "ਪਨੀਰ ਪਰਾਂਠਾ",
  "pyaz paratha": "ਪਿਆਜ਼ ਪਰਾਂਠਾ",
  "makki di roti": "ਮੱਕੀ ਦੀ ਰੋਟੀ",
  "sarson da saag": "ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ",
  "makki di roti sarson da saag": "ਮੱਕੀ ਦੀ ਰੋਟੀ ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ",
  "plain rice": "ਸਾਦੇ ਚੌਲ",
  "jeera rice": "ਜੀਰਾ ਚੌਲ",
  "veg biryani": "ਵੈਜ ਬਿਰਿਆਨੀ",
  "veg pulao": "ਵੈਜ ਪੁਲਾਓ",
  "matar pulao": "ਮਟਰ ਪੁਲਾਓ",
  "boondi raita": "ਬੂੰਦੀ ਰਾਇਤਾ",
  "mix raita": "ਮਿਕਸ ਰਾਇਤਾ",
  "sweet lassi": "ਮਿੱਠੀ ਲੱਸੀ",
  "salted lassi": "ਨਮਕੀਨ ਲੱਸੀ",
  "dhaba spl gud tea": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਗੁੜ ਦੀ ਚਾਹ",
  "dhaba spl delux thali": "ਢਾਬਾ ਸਪੈਸ਼ਲ ਡੀਲਕਸ ਥਾਲੀ",
  "delux thali": "ਡੀਲਕਸ ਥਾਲੀ",
  "special thali": "ਸਪੈਸ਼ਲ ਥਾਲੀ",
  "milk for baby -free": "ਬੇਬੀ ਲਈ ਦੁੱਧ (ਮੁਫ਼ਤ)",
  "milk for baby": "ਬੇਬੀ ਲਈ ਦੁੱਧ",
  "don't waste food": "ਅੰਨ ਨਾ ਵਿਅਰਥ ਗਵਾਓ",
  "gulab jamun": "ਗੁਲਾਬ ਜਾਮੁਨ",
  "kulfi": "ਕੁਲਫ਼ੀ",
  "cold coffee": "ਕੋਲਡ ਕੌਫ਼ੀ",
  "hot coffee": "ਗਰਮ ਕੌਫ਼ੀ",
  "veg manchurian": "ਵੈਜ ਮੰਚੂਰੀਅਨ",
  "hakka noodles": "ਹੱਕਾ ਨੂਡਲਜ਼",
  "spring roll": "ਸਪ੍ਰਿੰਗ ਰੋਲ",
  "soya malai chaap": "ਸੋਇਆ ਮਲਾਈ ਚਾਪ",
  "soya tikka": "ਸੋਇਆ ਟਿੱਕਾ",
  "tandoori chaap": "ਤੰਦੂਰੀ ਚਾਪ",
  "crispy corn": "ਕ੍ਰਿਸਪੀ ਕੌਰਨ",
  "french fries": "ਫ੍ਰੈਂਚ ਫਰਾਈ",
};

// ─────────────────────────────────────────────────────────────────────────────
// Robust Phonetic Transliteration & Gurmukhi Cleaner
// ─────────────────────────────────────────────────────────────────────────────
export function cleanBrokenGurmukhi(text: string): string {
  if (!text) return "";

  // Replace orphaned leading dependent matras with proper independent vowels
  let s = text
    .replace(/(^|\s)\u0A3E/g, '$1ਆ') // ਾ -> ਆ
    .replace(/(^|\s)\u0A3F/g, '$1ਇ') // ਿ -> ਇ
    .replace(/(^|\s)\u0A40/g, '$1ਈ') // ੀ -> ਈ
    .replace(/(^|\s)\u0A41/g, '$1ਉ') // ੁ -> ਉ
    .replace(/(^|\s)\u0A42/g, '$1ਊ') // ੂ -> ਊ
    .replace(/(^|\s)\u0A47/g, '$1ਏ') // ੇ -> ਏ
    .replace(/(^|\s)\u0A48/g, '$1ਐ') // ੈ -> ਐ
    .replace(/(^|\s)\u0A4B/g, '$1ਓ') // ੋ -> ਓ
    .replace(/(^|\s)\u0A4C/g, '$1ਔ') // ੌ -> ਔ
    .replace(/(^|\s)[\u0A4D\u0A70\u0A71]/g, '$1'); // floating virama/tippi/addak at word boundary

  // Replace double vowel matras (e.g., ੋੁ -> ੌ or keep single)
  s = s.replace(/ੋੁੇ/g, 'ੌਸ').replace(/ੋੁ/g, 'ੌ');
  // General consecutive dependent vowel signs: keep only first
  s = s.replace(/([\u0A3E-\u0A4C])[\u0A3E-\u0A4C]+/g, '$1');

  return s.trim();
}

export function transliterateToGurmukhi(text: string): string {
  if (!text) return "";
  const cleaned = text.trim();
  const words = cleaned.split(/[\s\-_/()]+/);
  
  const punjabiWords = words.map(w => {
    const lw = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!lw) return "";
    if (WORD_MAP[lw]) return WORD_MAP[lw];

    let res = "";
    let i = 0;
    while (i < lw.length) {
      const c3 = lw.substring(i, i + 3);
      const c2 = lw.substring(i, i + 2);

      if (c3 === "sch" || c3 === "shh") { res += "ਸ਼"; i += 3; continue; }
      if (c2 === "kh") { res += "ਖ"; i += 2; continue; }
      if (c2 === "gh") { res += "ਘ"; i += 2; continue; }
      if (c2 === "ch") { res += "ਚ"; i += 2; continue; }
      if (c2 === "jh") { res += "ਝ"; i += 2; continue; }
      if (c2 === "th") { res += "ਥ"; i += 2; continue; }
      if (c2 === "dh") { res += "ਧ"; i += 2; continue; }
      if (c2 === "ph") { res += "ਫ"; i += 2; continue; }
      if (c2 === "bh") { res += "ਭ"; i += 2; continue; }
      if (c2 === "sh") { res += "ਸ਼"; i += 2; continue; }
      if (c2 === "ee") { res += (i === 0 ? "ਈ" : "ੀ"); i += 2; continue; }
      if (c2 === "oo") { res += (i === 0 ? "ਊ" : "ੂ"); i += 2; continue; }
      if (c2 === "aa") { res += (i === 0 ? "ਆ" : "ਾ"); i += 2; continue; }
      if (c2 === "ai") { res += (i === 0 ? "ਐ" : "ੈ"); i += 2; continue; }
      if (c2 === "au") { res += (i === 0 ? "ਔ" : "ੌ"); i += 2; continue; }

      const c1 = lw[i];
      if (c1 === 'k' || c1 === 'c' || c1 === 'q') res += "ਕ";
      else if (c1 === 'g') res += "ਗ";
      else if (c1 === 'j') res += "ਜ";
      else if (c1 === 'z') res += "ਜ਼";
      else if (c1 === 't') res += "ਟ";
      else if (c1 === 'd') res += "ਡ";
      else if (c1 === 'n') res += "ਨ";
      else if (c1 === 'p') res += "ਪ";
      else if (c1 === 'f') res += "ਫ";
      else if (c1 === 'b') res += "ਬ";
      else if (c1 === 'm') res += "ਮ";
      else if (c1 === 'y') res += "ਯ";
      else if (c1 === 'r') res += "ਰ";
      else if (c1 === 'l') res += "ਲ";
      else if (c1 === 'v' || c1 === 'w') res += "ਵ";
      else if (c1 === 's') res += "ਸ";
      else if (c1 === 'h') res += "ਹ";
      else if (c1 === 'x') res += "ਕਸ";
      else if (c1 === 'a') res += (i === 0 ? "ਅ" : "ਾ");
      else if (c1 === 'i') res += (i === 0 ? "ਇ" : "ਿ");
      else if (c1 === 'u') res += (i === 0 ? "ਉ" : "ੁ");
      else if (c1 === 'e') res += (i === 0 ? "ਏ" : "ੇ");
      else if (c1 === 'o') res += (i === 0 ? "ਓ" : "ੋ");
      i++;
    }
    return res || w;
  });

  const out = punjabiWords.filter(Boolean).join(" ");
  return cleanBrokenGurmukhi(out);
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns a guaranteed authentic Punjabi Gurmukhi name for ANY dish name
// ─────────────────────────────────────────────────────────────────────────────
export function getDishPunjabi(name: string, existingPunjabi?: string): string {
  const rawName = (name || "").trim();
  const normKey = normalizeKey(rawName);

  // 1. Highest Priority: Static dish overrides (by exact full name or normalized name)
  if (STATIC_DISH_PUNJABI[normKey]) {
    return STATIC_DISH_PUNJABI[normKey];
  }
  const lowerRaw = rawName.toLowerCase();
  if (STATIC_DISH_PUNJABI[lowerRaw]) {
    return STATIC_DISH_PUNJABI[lowerRaw];
  }

  // 2. Check if existingPunjabi has a known broken/misspelled Gurmukhi string to override
  if (existingPunjabi && existingPunjabi.trim()) {
    const trimmedExisting = existingPunjabi.trim();
    if (BROKEN_GURMUKHI_REPLACEMENTS[trimmedExisting]) {
      return BROKEN_GURMUKHI_REPLACEMENTS[trimmedExisting];
    }
    // If it's valid Gurmukhi and has no broken matras, return it
    if (/[\u0A00-\u0A7F]/.test(trimmedExisting)) {
      const cleaned = cleanBrokenGurmukhi(trimmedExisting);
      if (cleaned) return cleaned;
    }
  }

  if (!rawName) return "ਸੁਆਦਿਸ਼ਟ ਪਕਵਾਨ";

  // 3. Exact phrase lookup in DISH_PHRASES (Longest keys first to prevent partial truncation)
  const sortedPhrases = Object.entries(DISH_PHRASES).sort((a, b) => b[0].length - a[0].length);
  for (const [key, val] of sortedPhrases) {
    if (normKey === key || lowerRaw === key) return val;
  }
  for (const [key, val] of sortedPhrases) {
    if (normKey.includes(key) || lowerRaw.includes(key)) return val;
  }

  // 4. Word-by-word dictionary translation
  const words = normKey.split(' ').filter(Boolean);
  const translatedWords = words.map(w => WORD_MAP[w] || null);

  if (translatedWords.some(Boolean)) {
    const combined = words.map((w, idx) => translatedWords[idx] || transliterateToGurmukhi(w));
    return cleanBrokenGurmukhi(combined.join(" "));
  }

  // 5. Fallback transliteration
  const transliterated = transliterateToGurmukhi(rawName);
  return cleanBrokenGurmukhi(transliterated) || "ਸੁਆਦਿਸ਼ਟ ਪਕਵਾਨ";
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns complete category metadata with guaranteed Gurmukhi title and subtitle
// ─────────────────────────────────────────────────────────────────────────────
export function getCategoryMeta(catName: string): CategoryMeta {
  const trimmed = (catName || "").trim();
  const lower = trimmed.toLowerCase();
  const norm = normalizeKey(trimmed);

  // 1. Direct match in CATEGORY_META_MAP (case-insensitive)
  for (const [key, val] of Object.entries(CATEGORY_META_MAP)) {
    if (key.toLowerCase() === lower || normalizeKey(key) === norm) {
      return val;
    }
  }

  // 2. Specific matching rules in priority order
  if (lower.includes("indian cuisine") || lower === "indian") {
    return CATEGORY_META_MAP["Indian Cuisine"];
  }
  if (lower === "salad" || lower === "salads") {
    return CATEGORY_META_MAP["Salad"];
  }
  if (lower.includes("raita") || lower.includes("curd")) {
    return CATEGORY_META_MAP["Raita/Curd"];
  }
  if (lower.includes("noodle")) {
    return CATEGORY_META_MAP["Noodles"];
  }
  if (lower.includes("momo")) {
    return CATEGORY_META_MAP["Momos"];
  }
  if (lower.includes("mocktail")) {
    return CATEGORY_META_MAP["Mocktails"];
  }
  if (lower.includes("desert") || lower.includes("dessert")) {
    return CATEGORY_META_MAP["Deserts"];
  }
  if (lower.includes("chinese") || lower.includes("manchurian")) {
    return CATEGORY_META_MAP["Chinese"];
  }
  if (lower.includes("salad")) {
    return CATEGORY_META_MAP["Salad"];
  }
  if (lower.includes("breakfast") || lower.includes("prantha") || lower.includes("paratha")) {
    return CATEGORY_META_MAP["Breakfast"];
  }
  if (lower.includes("bread") || lower.includes("roti") || lower.includes("naan")) {
    return CATEGORY_META_MAP["Breads"];
  }
  if (lower.includes("tandoor")) {
    return CATEGORY_META_MAP["Tandoori Breads"];
  }
  if (lower.includes("dal") || lower.includes("daal")) {
    return CATEGORY_META_MAP["Dal"];
  }
  if (lower.includes("paneer") || lower.includes("cheese")) {
    return CATEGORY_META_MAP["Paneer"];
  }
  if (lower.includes("snack") || lower.includes("tikka") || lower.includes("kebab")) {
    return CATEGORY_META_MAP["Snacks"];
  }
  if (lower.includes("starter") || lower.includes("pakora") || lower.includes("cutlet")) {
    return CATEGORY_META_MAP["Indian Snacks"];
  }
  if (lower.includes("rice") || lower.includes("biryani") || lower.includes("pulao")) {
    return CATEGORY_META_MAP["Rice & Pulao"];
  }
  if (lower.includes("drink") || lower.includes("beverage") || lower.includes("lassi") || lower.includes("juice")) {
    return CATEGORY_META_MAP["Beverages"];
  }
  if (lower.includes("shake") || lower.includes("coffee")) {
    return CATEGORY_META_MAP["Shakes"];
  }
  if (lower.includes("thali")) {
    return CATEGORY_META_MAP["Thali"];
  }
  if (lower.includes("pizza")) {
    return CATEGORY_META_MAP["Pizza"];
  }
  if (lower.includes("burger")) {
    return CATEGORY_META_MAP["Burger"];
  }
  if (lower.includes("sandwich")) {
    return CATEGORY_META_MAP["Sandwich"];
  }
  if (lower.includes("soup")) {
    return CATEGORY_META_MAP["Soup"];
  }
  if (lower.includes("side")) {
    return CATEGORY_META_MAP["Sides"];
  }
  if (lower.includes("special") || lower.includes("spl")) {
    return CATEGORY_META_MAP["Dhaba Special"];
  }
  if (lower.includes("pasta")) {
    return CATEGORY_META_MAP["Pasta"];
  }
  if (lower.includes("cake")) {
    return CATEGORY_META_MAP["Cake"];
  }
  if (lower.includes("seasonal")) {
    return CATEGORY_META_MAP["Seasonal"];
  }
  if (lower.includes("chaap") || lower.includes("soya")) {
    return CATEGORY_META_MAP["Soya"];
  }
  if (lower.includes("chai") || lower.includes("tea")) {
    return CATEGORY_META_MAP["Tea"];
  }
  if (lower.includes("main") || lower.includes("sabzi") || lower.includes("curry") || lower.includes("gravy")) {
    return CATEGORY_META_MAP["Main Course"];
  }

  // Generate authentic Gurmukhi name for custom category
  const punjabiName = getDishPunjabi(trimmed);

  return {
    emoji: "🍽️",
    punjabi: punjabiName || trimmed,
    subtitle: "ਹਰਜਿੰਦਰ ਟੂਰਿਸਟ ਢਾਬੇ ਦੀ ਖ਼ਾਸ ਪੇਸ਼ਕਸ਼",
    accentColor: "bg-amber-100",
  };
}
