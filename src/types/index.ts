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
}

export interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };