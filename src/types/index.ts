export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  price: number;
  unit: string;
  category: string;
  image: string; // emoji for simplicity
  store: 'Lidl' | 'Aldi' | 'Rewe' | 'Unknown';
}

export interface CartItem extends Product {
  quantity: number;
}

export type RootStackParamList = {
  Scanner: undefined;
  Cart: undefined;
  Payment: undefined;
};