import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product: Product) => {
    const existing = get().items.find((i) => i.id === product.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      set((state) => ({
        items: [...state.items, { ...product, quantity: 1 }],
      }));
    }
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== productId),
    }));
  },

  increaseQty: (productId: string) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId ? { ...i, quantity: i.quantity + 1 } : i
      ),
    }));
  },

  decreaseQty: (productId: string) => {
    const item = get().items.find((i) => i.id === productId);
    if (item && item.quantity <= 1) {
      get().removeItem(productId);
    } else {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      }));
    }
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));