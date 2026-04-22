const BARCODE_LOOKUP_KEY = process.env.EXPO_PUBLIC_BARCODE_LOOKUP_KEY ?? '';
const GO_UPC_KEY         = process.env.EXPO_PUBLIC_GO_UPC_KEY         ?? '';

export interface ApiProduct {
  barcode:      string;
  name:         string;
  brand:        string;
  description:  string;
  imageUrl:     string;
  category:     string;
  quantity:     string;   
  nutriScore:   string; 
  ingredients:  string;
  price:        number | null;   
  priceSource:  string;          
  currency:     string;
  source:       string;          
}

const fromOpenFoodFacts = async (barcode: string): Promise<Partial<ApiProduct> | null> => {
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,product_name_de,product_name_en,brands,quantity,categories_tags,image_front_url,nutriscore_grade,ingredients_text,ingredients_text_de`,
      { headers: { 'User-Agent': 'GroceryScannerApp/1.0' } }
    );
    const d = await r.json();
    if (d.status !== 1 || !d.product) return null;

    const p = d.product;
    return {
      name:        p.product_name_de || p.product_name_en || p.product_name || '',
      brand:       p.brands?.split(',')[0]?.trim() || '',
      imageUrl:    p.image_front_url || '',
      quantity:    p.quantity || '',
      category:    p.categories_tags?.[0]?.replace(/^[a-z]+:/, '') || '',
      nutriScore:  p.nutriscore_grade?.toUpperCase() || '',
      ingredients: p.ingredients_text_de || p.ingredients_text || '',
      source:      'Open Food Facts',
    };
  } catch { return null; }
};

const fromOFFPrices = async (barcode: string): Promise<{ price: number; currency: string; store: string } | null> => {
  try {
    const r = await fetch(
      `https://prices.openfoodfacts.org/api/v1/prices?product_code=${barcode}&order_by=-date&size=10`,
      { headers: { 'User-Agent': 'GroceryScannerApp/1.0' } }
    );
    const d = await r.json();
    const items: any[] = d.items ?? [];
    if (!items.length) return null;

    const pick =
      items.find(i => i.currency === 'EUR' && i.price > 0 && i.location?.country === 'DE') ||
      items.find(i => i.currency === 'EUR' && i.price > 0) ||
      items.find(i => i.price > 0);

    if (!pick) return null;
    return {
      price:    parseFloat(pick.price),
      currency: pick.currency ?? 'EUR',
      store:    pick.location?.name || pick.location?.osm_name || '',
    };
  } catch { return null; }
};

// ─── 3. UPC Item DB (free, no key needed) ────────────────────────────────────
const fromUPCItemDB = async (barcode: string): Promise<Partial<ApiProduct> | null> => {
  try {
    const r = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    const d = await r.json();
    const item = d.items?.[0];
    if (!item) return null;

    return {
      name:     item.title || '',
      brand:    item.brand || '',
      imageUrl: item.images?.[0] || '',
      category: item.category || '',
      quantity: item.size || '',
      source:   'UPC Item DB',
    };
  } catch { return null; }
};

const fromBarcodeLookup = async (barcode: string): Promise<Partial<ApiProduct> | null> => {
  if (!BARCODE_LOOKUP_KEY) return null;
  try {
    const r = await fetch(
      `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${BARCODE_LOOKUP_KEY}`
    );
    const d = await r.json();
    const item = d.products?.[0];
    if (!item) return null;

    return {
      name:        item.title || '',
      brand:       item.brand || '',
      description: item.description || '',
      imageUrl:    item.images?.[0] || '',
      category:    item.category || '',
      source:      'Barcode Lookup',
    };
  } catch { return null; }
};

const fromGoUPC = async (barcode: string): Promise<Partial<ApiProduct> | null> => {
  if (!GO_UPC_KEY) return null;
  try {
    const r = await fetch(
      `https://api.go-upc.com/product/${barcode}`,
      { headers: { Authorization: `Bearer ${GO_UPC_KEY}` } }
    );
    const d = await r.json();
    if (!d.product) return null;

    return {
      name:     d.product.name || '',
      brand:    d.product.brand || '',
      imageUrl: d.product.imageUrl || '',
      category: d.product.category?.name || '',
      source:   'Go-UPC',
    };
  } catch { return null; }
};

export const fetchProductByBarcode = async (barcode: string): Promise<ApiProduct | null> => {
  const [offData, priceData] = await Promise.all([
    fromOpenFoodFacts(barcode),
    fromOFFPrices(barcode),
  ]);

  if (offData?.name) {
    return buildProduct(barcode, offData, priceData);
  }

  const upcData = await fromUPCItemDB(barcode);
  if (upcData?.name) return buildProduct(barcode, upcData, priceData);

  const blData = await fromBarcodeLookup(barcode);
  if (blData?.name) return buildProduct(barcode, blData, priceData);

  const goData = await fromGoUPC(barcode);
  if (goData?.name) return buildProduct(barcode, goData, priceData);

  return null; 
};

const buildProduct = (
  barcode: string,
  data: Partial<ApiProduct>,
  priceData: { price: number; currency: string; store: string } | null
): ApiProduct => ({
  barcode,
  name:         data.name        ?? 'Unknown Product',
  brand:        data.brand       ?? '',
  description:  data.description ?? '',
  imageUrl:     data.imageUrl    ?? '',
  category:     data.category    ?? '',
  quantity:     data.quantity    ?? '',
  nutriScore:   data.nutriScore  ?? '',
  ingredients:  data.ingredients ?? '',
  price:        priceData?.price    ?? null,
  priceSource:  priceData?.store    ?? '',
  currency:     priceData?.currency ?? 'EUR',
  source:       data.source      ?? 'Unknown',
});