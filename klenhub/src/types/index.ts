export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  category: string;
  subCategory: string;
  images: string[];
  description: string;
  sizes: string[];
  featured?: boolean;
  onSale?: boolean;
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