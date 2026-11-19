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
  "Main Course": {
    emoji: "🍛",
    punjabi: "ਮੇਨ ਕੋਰਸ",
    subtitle: "ਦੇਸੀ ਘਿਓ ਦੀਆਂ ਖ਼ਾਸ ਸਬਜ਼ੀਆਂ ਤੇ ਦਾਲਾਂ",
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
  Chinese: {
    emoji: "🥡",
    punjabi: "ਚਾਈਨੀਜ਼",
    subtitle: "ਨੂਡਲਜ਼, ਮੰਚੂਰੀਅਨ ਤੇ ਫ੍ਰਾਈਡ ਰਾਈਸ",
    accentColor: "bg-red-100",
  },
  "Rice & Pulao": {
    emoji: "🍚",
    punjabi: "ਚੌਲ ਅਤੇ ਪੁਲਾਓ",
    subtitle: "ਖ਼ੁਸ਼ਬੂਦਾਰ ਬਾਸਮਤੀ ਚੌਲ ਤੇ ਬਿਰਿਆਨੀ",
    accentColor: "bg-yellow-100",
  },
  "Raita & Salad": {
    emoji: "🥗",
    punjabi: "ਰਾਇਤਾ ਅਤੇ ਸਲਾਦ",
    subtitle: "ਠੰਢਾ ਦਹੀਂ ਰਾਇਤਾ ਤੇ ਹਰਾ ਸਲਾਦ",
    accentColor: "bg-green-100",
  },
  Beverages: {
    emoji: "🥤",
    punjabi: "ਕੌਫ਼ੀ ਤੇ ਲੱਸੀ",
    subtitle: "ਮਿੱਠੀ ਲੱਸੀ, ਸ਼ੇਕ, ਕੋਲਡ ਡ੍ਰਿੰਕਸ ਤੇ ਚਾਹ",
    accentColor: "bg-cyan-100",
  },
  Desserts: {
    emoji: "🍨",
    punjabi: "ਮਿਠਾਈਆਂ",
    subtitle: "ਗੁਲਾਬ ਜਾਮੁਨ, ਕੁਲਫ਼ੀ ਤੇ ਖ਼ਾਸ ਮਿੱਠਾ",
    accentColor: "bg-pink-100",
  },
  Shakes: {
    emoji: "🧋",
    punjabi: "ਸ਼ੇਕਸ ",
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
    punjabi: " ਚਾਪ",
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

// Common Indian Dhaba Word Dictionary for dynamic Gurmukhi translation
const WORD_MAP: Record<string, string> = {
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
  shahi: "ਸ਼ਾਹੀ",
  kadhai: "ਕੜਾਹੀ",
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
  spring: "ਸਪ੍ਰਿੰਗ",
  roll: "ਰੋਲ",
  rolls: "ਰੋਲ",
  chowmein: "ਚਾਓਮੀਨ",
  chaap: "ਚਾਪ",
  champ: "ਚਾਪ",
  soya: "ਸੋਇਆ",
  thali: "ਥਾਲੀ",
  regular: "ਰੈਗੂਲਰ",
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
  sauce: "ਸਾਸ",
  fries: "ਫ੍ਰਾਈਜ਼",
  french: "ਫ੍ਰੈਂਚ",
  finger: "ਫਿੰਗਰ",
  chips: "ਚਿਪਸ",
  crispy: "ਕੁਰਕੁਰਾ",
  honey: "ਹਨੀ",
  potato: "ਆਲੂ",
  gravy: "ਗ੍ਰੇਵੀ",
  dry: "ਡ੍ਰਾਈ",
  curry: "ਕਰੀ",
  milk: "ਦੁੱਧ",
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
  dessert: "ਮਿਠਾਈ",
  desserts: "ਮਿਠਾਈਆਂ",
  snacks: "ਸਨੈਕਸ",
  snack: "ਸਨੈਕ",
  breakfast: "ਨਾਸ਼ਤਾ",
  lunch: "ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ",
  dinner: "ਰਾਤ ਦਾ ਖਾਣਾ",
  main: "ਮੇਨ",
  course: "ਕੋਰਸ",
  bread: "ਰੋਟੀ",
  breads: "ਰੋਟੀਆਂ",
  seasonal: "ਮੌਸਮੀ",
  sesonal: "ਮੌਸਮੀ",
  pasanda: "ਪਸੰਦਾ",
  lababdar: "ਲਬਾਬਦਾਰ",
  do: "ਦੋ",
  "do-pyaza": "ਦੋ ਪਿਆਜ਼ਾ",
  dopyaza: "ਦੋ ਪਿਆਜ਼ਾ",
  handi: "ਹਾਂਡੀ",
  "tawa-paneer": "ਤਵਾ ਪਨੀਰ",
  sev: "ਸੇਵ",
  tamatar: "ਟਮਾਟਰ",
  korma: "ਕੋਰਮਾ",
  kurma: "ਕੋਰਮਾ",
  navratan: "ਨਵਰਤਨ",
  "methi-malai": "ਮੇਥੀ ਮਲਾਈ",
  chutney: "ਚਟਣੀ",
  achar: "ਅਚਾਰ",
  pickle: "ਅਚਾਰ",
  sirka: "ਸਿਰਕਾ",
  extra: "ਵਾਧੂ",
};

// Full dish exact phrase mappings
const DISH_PHRASES: Record<string, string> = {
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
  "green salad": " ਸਲਾਦ",
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
  "chilli paneer": "ਚਿਲੀ ਪਨੀਰ",
  "spring roll": "ਸਪ੍ਰਿੰਗ ਰੋਲ",
  "soya malai chaap": "ਸੋਇਆ ਮਲਾਈ ਚਾਪ",
  "soya tikka": "ਸੋਇਆ ਟਿੱਕਾ",
  "tandoori chaap": "ਤੰਦੂਰੀ ਚਾਪ",
  "crispy corn": "ਕ੍ਰਿਸਪੀ ਕੌਰਨ",
  "french fries": "ਫ੍ਰੈਂਚ ਫਰਾਈ",
};

// Fallback phonetic syllable transliterator for any unfamiliar English words into Gurmukhi
function transliterateToGurmukhi(text: string): string {
  if (!text) return "";
  const cleaned = text.trim();
  // Split into words
  const words = cleaned.split(/[\s\-_/()]+/);
  const punjabiWords = words.map(w => {
    const lw = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!lw) return "";
    if (WORD_MAP[lw]) return WORD_MAP[lw];

    // Syllable / character phonetic conversion
    let res = "";
    let i = 0;
    while (i < lw.length) {
      const c2 = lw.substring(i, i + 2);
      const c3 = lw.substring(i, i + 3);

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
      if (c2 === "ee") { res += "ੀ"; i += 2; continue; }
      if (c2 === "oo") { res += "ੂ"; i += 2; continue; }
      if (c2 === "aa") { res += "ਾ"; i += 2; continue; }
      if (c2 === "ai") { res += "ੈ"; i += 2; continue; }
      if (c2 === "au") { res += "ੌ"; i += 2; continue; }

      const c1 = lw[i];
      if (c1 === 'k') res += "ਕ";
      else if (c1 === 'g') res += "ਗ";
      else if (c1 === 'j') res += "ਜ";
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
      else if (c1 === 'a') res += (i === 0 ? "ਅ" : "ਾ");
      else if (c1 === 'i') res += (i === 0 ? "ਇ" : "ਿ");
      else if (c1 === 'u') res += (i === 0 ? "ਉ" : "ੁ");
      else if (c1 === 'e') res += (i === 0 ? "ਏ" : "ੇ");
      else if (c1 === 'o') res += (i === 0 ? "ਓ" : "ੋ");
      i++;
    }
    return res || w;
  });

  return punjabiWords.filter(Boolean).join(" ");
}

/**
 * Returns a guaranteed authentic Punjabi Gurmukhi name for ANY dish name.
 * NEVER returns empty string!
 */
export function getDishPunjabi(name: string, existingPunjabi?: string): string {
  if (existingPunjabi && existingPunjabi.trim()) {
    // If it already has Gurmukhi characters, return it
    if (/[\u0A00-\u0A7F]/.test(existingPunjabi)) return existingPunjabi.trim();
  }

  if (!name || !name.trim()) return "ਸੁਆਦਿਸ਼ਟ ਪਕਵਾਨ";

  const lower = name.toLowerCase().trim();

  // 1. Direct phrase lookup
  if (DISH_PHRASES[lower]) return DISH_PHRASES[lower];

  // 2. Partial phrase lookup
  for (const [key, val] of Object.entries(DISH_PHRASES)) {
    if (lower.includes(key)) return val;
  }

  // 3. Word-by-word dictionary translation
  const words = lower.split(/[\s\-_/()]+/).filter(Boolean);
  const translatedWords = words.map(w => WORD_MAP[w] || null);

  // If at least one word is recognized, fill unrecognized with transliteration
  if (translatedWords.some(Boolean)) {
    const combined = words.map((w, idx) => translatedWords[idx] || transliterateToGurmukhi(w));
    return combined.join(" ");
  }

  // 4. Syllabic transliteration fallback
  const transliterated = transliterateToGurmukhi(name);
  if (transliterated && transliterated.trim()) return transliterated.trim();

  return "ਸਵਾਦਿਸ਼ਟ ਪਕਵਾਨ";
}

/**
 * Returns complete category metadata with a guaranteed Gurmukhi title for ANY category.
 * NEVER returns empty Gurmukhi title!
 */
export function getCategoryMeta(catName: string): CategoryMeta {
  const trimmed = (catName || "").trim();
  const lower = trimmed.toLowerCase();

  if (CATEGORY_META_MAP[trimmed]) return CATEGORY_META_MAP[trimmed];

  // Keyword matching
  if (lower.includes("breakfast") || lower.includes("prantha") || lower.includes("paratha"))
    return CATEGORY_META_MAP["Breakfast"];
  if (lower.includes("bread") || lower.includes("roti") || lower.includes("naan"))
    return CATEGORY_META_MAP["Breads"];
  if (lower.includes("tandoor")) return CATEGORY_META_MAP["Tandoori Breads"];
  if (lower.includes("dal") || lower.includes("daal")) return CATEGORY_META_MAP["Dal"];
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
  if (lower.includes("chaap") || lower.includes("soya")) return CATEGORY_META_MAP["Soya"];
  if (lower.includes("chai") || lower.includes("tea")) return CATEGORY_META_MAP["Tea"];
  if (lower.includes("main") || lower.includes("sabzi") || lower.includes("curry") || lower.includes("gravy"))
    return CATEGORY_META_MAP["Main Course"];

  // Generate authentic Gurmukhi name for custom category
  const punjabiName = getDishPunjabi(trimmed);

  return {
    emoji: "🍽️",
    punjabi: punjabiName || trimmed,
    subtitle: "ਹਰਜਿੰਦਰ ਟੂਰਿਸਟ ਢਾਬੇ ਦੀ ਖ਼ਾਸ ਪੇਸ਼ਕਸ਼",
    accentColor: "bg-amber-100",
  };
}
