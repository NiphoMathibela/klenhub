export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: Array<{ id: number; imageUrl: string; isMain: boolean }>;
  sizes: Array<{ id: number; size: string; quantity: number }>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  checkout: () => Promise<void>;
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; size: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: number; size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; size: string; quantity: number } }
  | { type: 'CLEAR_CART' };