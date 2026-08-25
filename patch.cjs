const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(
  'const [isLoading, setIsLoading] = useState(true);',
  'const [isLoading, setIsLoading] = useState(true);\n  const [apiError, setApiError] = useState<string | null>(null);'
);

code = code.replace(
  /safeFetch\('\/api\/storefront-data'\)\.then\(\(data\) => \{([\s\S]*?)setIsLoading\(false\);\n    \}\)\.catch\(err => \{\n      console\.error\(err\);\n      setIsLoading\(false\);\n    \}\);/,
  `safeFetch('/api/storefront-data').then((data) => {
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
    });`
);

code = code.replace(
  '<h3 className="text-xl font-bold text-[var(--color-brown)] mb-2">Our menu is being prepared</h3>',
  '<h3 className="text-xl font-bold text-[var(--color-brown)] mb-2">{apiError ? `Error: ${apiError}` : "Our menu is being prepared"}</h3>'
);

fs.writeFileSync('src/Storefront.tsx', code);
